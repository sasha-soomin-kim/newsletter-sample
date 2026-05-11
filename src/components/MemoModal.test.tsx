import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoModal } from './MemoModal';
import type { Memo } from '../types';

const memo: Memo = {
  id: 'm1',
  title: 'Hello',
  body: '**body**',
  color: '#D8DEEC',
  column: 'remember',
  pinned: false,
  createdAt: new Date('2026-05-10').getTime(),
  updatedAt: new Date('2026-05-10').getTime(),
};

describe('MemoModal — 보기 모드', () => {
  it('제목, 마크다운 본문, 푸터 메타, chip을 렌더링한다', () => {
    render(
      <MemoModal
        memo={memo}
        onClose={() => {}}
        onUpdate={() => {}}
        onChangeColor={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByText('2026.05.10 · 기억해')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '편집' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('닫기(X) 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    render(
      <MemoModal
        memo={memo}
        onClose={onClose}
        onUpdate={() => {}}
        onChangeColor={() => {}}
        onDelete={() => {}}
      />
    );
    await userEvent.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalled();
  });

  it('삭제 클릭 시 onDelete를 호출한다', async () => {
    const onDelete = vi.fn();
    render(
      <MemoModal
        memo={memo}
        onClose={() => {}}
        onUpdate={() => {}}
        onChangeColor={() => {}}
        onDelete={onDelete}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledWith('m1');
  });

  it('보기 모드에서 색 점 클릭 시 onChangeColor를 즉시 호출한다', async () => {
    const onChangeColor = vi.fn();
    render(
      <MemoModal
        memo={memo}
        onClose={() => {}}
        onUpdate={() => {}}
        onChangeColor={onChangeColor}
        onDelete={() => {}}
      />
    );
    await userEvent.click(screen.getByLabelText('색상 #E0D6E8'));
    expect(onChangeColor).toHaveBeenCalledWith('m1', '#E0D6E8');
  });
});

describe('MemoModal — 편집 모드', () => {
  it('편집 클릭 시 편집 모드로 전환된다', async () => {
    render(
      <MemoModal
        memo={memo}
        onClose={() => {}}
        onUpdate={() => {}}
        onChangeColor={() => {}}
        onDelete={() => {}}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '편집' }));
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('취소 시 onUpdate가 호출되지 않고 변경이 되돌려진다', async () => {
    const onUpdate = vi.fn();
    render(
      <MemoModal
        memo={memo}
        onClose={() => {}}
        onUpdate={onUpdate}
        onChangeColor={() => {}}
        onDelete={() => {}}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '편집' }));
    const titleInput = screen.getByDisplayValue('Hello');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Changed');
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onUpdate).not.toHaveBeenCalled();
    // 보기 모드로 복귀 — 원래 제목이 보임
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('저장 시 onUpdate가 호출된다', async () => {
    const onUpdate = vi.fn();
    render(
      <MemoModal
        memo={memo}
        onClose={() => {}}
        onUpdate={onUpdate}
        onChangeColor={() => {}}
        onDelete={() => {}}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '편집' }));
    const titleInput = screen.getByDisplayValue('Hello');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Changed');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(onUpdate).toHaveBeenCalledWith('m1', { title: 'Changed', body: '**body**' });
  });
});
