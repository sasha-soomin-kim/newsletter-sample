import type { ColumnId, Memo } from '../types';
import { COLUMN_LABELS } from '../constants';
import { ColumnHeader } from './ColumnHeader';
import { NewMemoCard } from './NewMemoCard';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MemoCard } from './MemoCard';

type Props = {
  columnId: ColumnId;
  memos: Memo[]; // 이미 정렬됨: 핀 우선
  drafting: boolean;
  onAdd: () => void;
  onCommitDraft: (data: { title: string; body: string }) => void;
  onCancelDraft: () => void;
  onOpenMemo: (id: string) => void;
  onTogglePin: (id: string) => void;
};

function SortableMemoCard({
  memo,
  onOpen,
  onTogglePin,
}: {
  memo: Memo;
  onOpen: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: memo.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <MemoCard
      ref={setNodeRef}
      memo={memo}
      onOpen={onOpen}
      onTogglePin={onTogglePin}
      dragHandleProps={{ ...attributes, ...listeners }}
      dragStyle={style}
      isDragging={isDragging}
    />
  );
}

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
  const ids = memos.map((m) => m.id);
  const { setNodeRef } = useDroppable({ id: `col:${columnId}`, data: { columnId } });

  return (
    <div className="column" data-column={columnId}>
      <ColumnHeader title={COLUMN_LABELS[columnId]} onAdd={onAdd} />
      <div className="column__list" ref={setNodeRef}>
        {drafting && <NewMemoCard onCommit={onCommitDraft} onCancel={onCancelDraft} />}
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {memos.map((memo) => (
            <SortableMemoCard key={memo.id} memo={memo} onOpen={onOpenMemo} onTogglePin={onTogglePin} />
          ))}
        </SortableContext>
        {!drafting && memos.length === 0 && (
          <button
            type="button"
            className="column__empty"
            onClick={onAdd}
          >
            ＋ 버튼을 눌러서 추가하세요
          </button>
        )}
      </div>
    </div>
  );
}
