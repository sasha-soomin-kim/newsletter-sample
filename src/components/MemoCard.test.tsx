import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoCard } from './MemoCard';
import type { Memo } from '../types';

const memo: Memo = {
  id: 'm1',
  title: '제목',
  body: '**bold** body',
  color: '#D8DEEC',
  column: 'remember',
  pinned: false,
  createdAt: 1,
  updatedAt: 1,
};

describe('MemoCard', () => {
  it('제목과 마크다운 본문을 렌더링한다', () => {
    render(<MemoCard memo={memo} onOpen={() => {}} onTogglePin={() => {}} />);
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
  });

  it('메모 색상을 배경으로 적용한다', () => {
    const { container } = render(
      <MemoCard memo={memo} onOpen={() => {}} onTogglePin={() => {}} />
    );
    const card = container.querySelector('.memo-card') as HTMLElement;
    expect(card.style.background).toBe('rgb(216, 222, 236)');
  });

  it('카드 클릭 시 onOpen을 호출한다', async () => {
    const onOpen = vi.fn();
    render(<MemoCard memo={memo} onOpen={onOpen} onTogglePin={() => {}} />);
    await userEvent.click(screen.getByText('제목'));
    expect(onOpen).toHaveBeenCalledWith('m1');
  });

  it('핀 버튼 클릭 시 onTogglePin만 호출되고 onOpen은 호출되지 않는다', async () => {
    const onOpen = vi.fn();
    const onTogglePin = vi.fn();
    render(<MemoCard memo={{ ...memo, pinned: true }} onOpen={onOpen} onTogglePin={onTogglePin} />);
    await userEvent.click(screen.getByLabelText('핀 고정 해제'));
    expect(onTogglePin).toHaveBeenCalledWith('m1');
    expect(onOpen).not.toHaveBeenCalled();
  });
});
