import { useMemo, useState } from 'react';
import { COLUMN_IDS, randomColor } from '../constants';
import type { ColumnId, Memo } from '../types';
import { useAppState } from '../state/useAppState';
import { Column } from './Column';
import { MemoModal } from './MemoModal';

export function Board() {
  const { state, dispatch } = useAppState();
  const [draftingIn, setDraftingIn] = useState<ColumnId | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const memosByColumn = useMemo(() => {
    const out: Record<ColumnId, Memo[]> = { reference: [], remember: [], disposable: [] };
    for (const colId of COLUMN_IDS) {
      out[colId] = state.columnOrder[colId]
        .map((id) => state.memos[id])
        .filter((m): m is Memo => Boolean(m));
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

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <span className="page__brand">Memo</span>
          <span className="page__brand-sub">{Object.keys(state.memos).length} notes</span>
        </div>
      </header>
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
