import type { ColumnId, Memo } from '../types';
import { COLUMN_LABELS } from '../constants';
import { ColumnHeader } from './ColumnHeader';
import { MemoCard } from './MemoCard';
import { NewMemoCard } from './NewMemoCard';

type Props = {
  columnId: ColumnId;
  memos: Memo[];
  drafting: boolean;
  onAdd: () => void;
  onCommitDraft: (data: { title: string; body: string }) => void;
  onCancelDraft: () => void;
  onOpenMemo: (id: string) => void;
  onTogglePin: (id: string) => void;
};

export function Column({
  columnId,
  memos,
  drafting,
  onAdd,
  onCommitDraft,
  onCancelDraft,
  onOpenMemo,
  onTogglePin,
}: Props) {
  // 정렬: 핀 우선 (배열 순서 유지) → 일반 (배열 순서 유지)
  const pinned = memos.filter((m) => m.pinned);
  const rest = memos.filter((m) => !m.pinned);
  const sorted = [...pinned, ...rest];

  return (
    <div className="column" data-column={columnId}>
      <ColumnHeader title={COLUMN_LABELS[columnId]} onAdd={onAdd} />
      <div className="column__list">
        {drafting && (
          <NewMemoCard onCommit={onCommitDraft} onCancel={onCancelDraft} />
        )}
        {sorted.map((memo) => (
          <MemoCard key={memo.id} memo={memo} onOpen={onOpenMemo} onTogglePin={onTogglePin} />
        ))}
      </div>
    </div>
  );
}
