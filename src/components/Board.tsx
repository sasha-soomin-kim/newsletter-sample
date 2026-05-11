import { useMemo, useState } from 'react';
import { COLUMN_IDS, randomColor } from '../constants';
import type { ColumnId, Memo } from '../types';
import { useAppState } from '../state/useAppState';
import { Column } from './Column';
import { MemoModal } from './MemoModal';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

export function Board() {
  const { state, dispatch } = useAppState();
  const [draftingIn, setDraftingIn] = useState<ColumnId | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const memosByColumn = useMemo(() => {
    const out: Record<ColumnId, Memo[]> = { reference: [], remember: [], disposable: [] };
    for (const colId of COLUMN_IDS) {
      const inOrder = state.columnOrder[colId]
        .map((id) => state.memos[id])
        .filter((m): m is Memo => Boolean(m));
      // 핀 우선 정렬 (배열 순서 유지)
      const pinned = inOrder.filter((m) => m.pinned);
      const rest = inOrder.filter((m) => !m.pinned);
      out[colId] = [...pinned, ...rest];
    }
    return out;
  }, [state]);

  const handleAdd = (col: ColumnId) => setDraftingIn(col);

  const handleCommitDraft = (col: ColumnId, data: { title: string; body: string }) => {
    if (data.title.trim() === '' && data.body.trim() === '') {
      setDraftingIn(null);
      return;
    }
    const now = Date.now();
    const memo: Memo = {
      id: crypto.randomUUID(),
      title: data.title || ' ',
      body: data.body,
      color: randomColor(),
      column: col,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'CREATE_MEMO', memo });
    setDraftingIn(null);
  };

  const openMemo = openId ? state.memos[openId] : null;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const memo = state.memos[activeId];
    if (!memo) return;

    const overId = String(over.id);
    let toColumn: ColumnId;
    let toIndex: number;

    if (overId.startsWith('col:')) {
      toColumn = overId.slice(4) as ColumnId;
      toIndex = state.columnOrder[toColumn].length;
    } else {
      const overMemo = state.memos[overId];
      if (!overMemo) return;
      toColumn = overMemo.column;
      const orderInTarget = state.columnOrder[toColumn].filter((id) => id !== activeId);
      toIndex = orderInTarget.indexOf(overId);
      if (toIndex === -1) toIndex = orderInTarget.length;
    }

    if (memo.column === toColumn) {
      const currentIndex = state.columnOrder[toColumn].indexOf(activeId);
      if (currentIndex === toIndex) return;
    }
    dispatch({ type: 'MOVE_MEMO', id: activeId, toColumn, toIndex });
  };

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <span className="page__brand">Memo</span>
          <span className="page__brand-sub">{Object.keys(state.memos).length} notes</span>
        </div>
      </header>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="board">
          {COLUMN_IDS.map((colId) => (
            <Column
              key={colId}
              columnId={colId}
              memos={memosByColumn[colId]}
              drafting={draftingIn === colId}
              onAdd={() => handleAdd(colId)}
              onCommitDraft={(data) => handleCommitDraft(colId, data)}
              onCancelDraft={() => setDraftingIn(null)}
              onOpenMemo={setOpenId}
              onTogglePin={(id) => dispatch({ type: 'TOGGLE_PIN', id })}
            />
          ))}
        </div>
      </DndContext>
      {openMemo && (
        <MemoModal
          memo={openMemo}
          onClose={() => setOpenId(null)}
          onUpdate={(id, patch) => dispatch({ type: 'UPDATE_MEMO', id, patch })}
          onChangeColor={(id, color) => dispatch({ type: 'CHANGE_COLOR', id, color })}
          onDelete={(id) => {
            dispatch({ type: 'DELETE_MEMO', id });
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
