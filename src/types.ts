export type ColumnId = 'reference' | 'remember' | 'disposable';

export type Memo = {
  id: string;
  title: string;
  body: string;
  color: string;
  column: ColumnId;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type AppState = {
  memos: Record<string, Memo>;
  columnOrder: Record<ColumnId, string[]>;
  version: 1;
};

export type Action =
  | { type: 'CREATE_MEMO'; memo: Memo }
  | { type: 'UPDATE_MEMO'; id: string; patch: Partial<Pick<Memo, 'title' | 'body'>> }
  | { type: 'CHANGE_COLOR'; id: string; color: string }
  | { type: 'TOGGLE_PIN'; id: string }
  | { type: 'DELETE_MEMO'; id: string }
  | { type: 'MOVE_MEMO'; id: string; toColumn: ColumnId; toIndex: number }
  | { type: 'HYDRATE'; state: AppState };
