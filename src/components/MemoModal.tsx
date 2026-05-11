import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Memo } from '../types';
import { COLUMN_LABELS } from '../constants';
import { MarkdownView } from './MarkdownView';
import { ColorPicker } from './ColorPicker';

type Props = {
  memo: Memo;
  onClose: () => void;
  onUpdate: (id: string, patch: { title: string; body: string }) => void;
  onChangeColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export function MemoModal({ memo, onClose, onUpdate, onChangeColor, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(memo.title);
  const [draftBody, setDraftBody] = useState(memo.body);

  // ESC로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const startEdit = () => {
    setDraftTitle(memo.title);
    setDraftBody(memo.body);
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => {
    onUpdate(memo.id, { title: draftTitle, body: draftBody });
    setEditing(false);
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ background: memo.color }} onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="닫기">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 2 L12 12 M12 2 L2 12" />
          </svg>
        </button>

        {editing ? (
          <>
            <input
              className="modal__title-input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              autoFocus
            />
            <textarea
              className="modal__body-input"
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
            />
          </>
        ) : (
          <>
            <h1 className="modal__title">{memo.title}</h1>
            <div className="modal__body">
              <MarkdownView source={memo.body} variant="modal" />
            </div>
          </>
        )}

        <ColorPicker current={memo.color} onChange={(c) => onChangeColor(memo.id, c)} />

        <div className="modal__foot">
          <span className="modal__meta">
            {editing ? '편집 중' : `${formatDate(memo.updatedAt)} · ${COLUMN_LABELS[memo.column]}`}
          </span>
          <div className="modal__actions">
            {editing ? (
              <>
                <button className="chip" onClick={cancelEdit}>취소</button>
                <button className="chip chip--primary" onClick={saveEdit}>저장</button>
              </>
            ) : (
              <>
                <button className="chip" onClick={() => onDelete(memo.id)}>삭제</button>
                <button className="chip chip--primary" onClick={startEdit}>편집</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
