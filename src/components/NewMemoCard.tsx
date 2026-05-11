import { useEffect, useRef, useState } from 'react';

type Props = {
  onCommit: (data: { title: string; body: string }) => void;
  onCancel: () => void;
};

export function NewMemoCard({ onCommit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // 외부 클릭 시 커밋. 둘 다 비어 있으면 취소
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (title.trim() === '' && body.trim() === '') {
          onCancel();
        } else {
          onCommit({ title: title.trim(), body });
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [title, body, onCommit, onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (title.trim() === '' && body.trim() === '') onCancel();
      else onCommit({ title: title.trim(), body });
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="memo-card memo-card--new" ref={containerRef} onKeyDown={handleKeyDown}>
      <input
        ref={titleRef}
        className="memo-card__new-title"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="memo-card__new-body"
        placeholder="내용을 입력…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
    </div>
  );
}
