import type { Action, AppState, ColumnId } from '../types';

export const initialState: AppState = {
  memos: {},
  columnOrder: { reference: [], remember: [], disposable: [] },
  version: 1,
};

function removeFromAllColumns(
  columnOrder: AppState['columnOrder'],
  id: string
): AppState['columnOrder'] {
  const next: AppState['columnOrder'] = {
    reference: columnOrder.reference.filter((x) => x !== id),
    remember: columnOrder.remember.filter((x) => x !== id),
    disposable: columnOrder.disposable.filter((x) => x !== id),
  };
  return next;
}

function insertAt(arr: string[], id: string, index: number): string[] {
  const clamped = Math.max(0, Math.min(index, arr.length));
  return [...arr.slice(0, clamped), id, ...arr.slice(clamped)];
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_MEMO': {
      const memo = action.memo;
      return {
        ...state,
        memos: { ...state.memos, [memo.id]: memo },
        columnOrder: {
          ...state.columnOrder,
          [memo.column]: [memo.id, ...state.columnOrder[memo.column]],
        },
      };
    }
    case 'UPDATE_MEMO': {
      const existing = state.memos[action.id];
      if (!existing) return state;
      const updated = { ...existing, ...action.patch, updatedAt: Date.now() };
      return { ...state, memos: { ...state.memos, [action.id]: updated } };
    }
    case 'CHANGE_COLOR': {
      const existing = state.memos[action.id];
      if (!existing) return state;
      return {
        ...state,
        memos: {
          ...state.memos,
          [action.id]: { ...existing, color: action.color, updatedAt: Date.now() },
        },
      };
    }
    case 'TOGGLE_PIN': {
      const existing = state.memos[action.id];
      if (!existing) return state;
      return {
        ...state,
        memos: {
          ...state.memos,
          [action.id]: { ...existing, pinned: !existing.pinned, updatedAt: Date.now() },
        },
      };
    }
    case 'DELETE_MEMO': {
      if (!state.memos[action.id]) return state;
      const { [action.id]: _, ...rest } = state.memos;
      return { ...state, memos: rest, columnOrder: removeFromAllColumns(state.columnOrder, action.id) };
    }
    case 'MOVE_MEMO': {
      const memo = state.memos[action.id];
      if (!memo) return state;
      const cleanedOrder = removeFromAllColumns(state.columnOrder, action.id);
      const targetCol: ColumnId = action.toColumn;
      const newOrder = insertAt(cleanedOrder[targetCol], action.id, action.toIndex);
      return {
        ...state,
        memos: { ...state.memos, [action.id]: { ...memo, column: targetCol, updatedAt: Date.now() } },
        columnOrder: { ...cleanedOrder, [targetCol]: newOrder },
      };
    }
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}
