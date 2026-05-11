import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { LOCAL_STORAGE_KEY } from '../constants';

describe('메모 앱 — 전체 흐름', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('메모를 작성, 편집, 영속화한다', async () => {
    const { unmount } = render(<App />);

    // "기억해" 열의 "+" 클릭
    await userEvent.click(screen.getByRole('button', { name: '기억해에 메모 추가' }));

    // 인라인 에디터에 제목/본문 입력
    const titleInput = screen.getByPlaceholderText('제목');
    await userEvent.type(titleInput, '새 메모');
    const bodyInput = screen.getByPlaceholderText('내용을 입력…');
    await userEvent.type(bodyInput, '본문 텍스트');

    // 외부 클릭(페이지 헤더)으로 커밋
    await userEvent.click(screen.getByText('Memo'));

    // 카드 생성 확인
    expect(screen.getByText('새 메모')).toBeInTheDocument();

    // 모달 열기
    await userEvent.click(screen.getByText('새 메모'));
    expect(screen.getByRole('button', { name: '편집' })).toBeInTheDocument();

    // 제목 편집
    await userEvent.click(screen.getByRole('button', { name: '편집' }));
    const editTitle = screen.getByDisplayValue('새 메모');
    await userEvent.clear(editTitle);
    await userEvent.type(editTitle, '수정된 메모');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    // 보기 모드에서 갱신된 제목 확인 (모달 헤딩)
    expect(screen.getByRole('heading', { name: '수정된 메모' })).toBeInTheDocument();

    // 모달 닫기
    await userEvent.click(screen.getByLabelText('닫기'));

    // 디바운스 저장(250ms) 대기
    await new Promise((r) => setTimeout(r, 350));
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    expect(stored).toContain('수정된 메모');

    unmount();

    // 새로고침 시뮬레이션 — localStorage에서 하이드레이트
    render(<App />);
    expect(screen.getByText('수정된 메모')).toBeInTheDocument();
  });
});
