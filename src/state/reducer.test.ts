import { describe, it, expect } from 'vitest';
import { appReducer, initialState } from './reducer';
import type { AppState, Memo } from '../types';

function makeMemo(overrides: Partial<Memo> = {}): Memo {
  return {
    id: 'm1',
    title: 'Title',
    body: 'Body',
    color: '#D8DEEC',
    column: 'remember',
    pinned: false,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function stateWith(memos: Memo[]): AppState {
  const memosMap: Record<string, Memo> = {};
  const columnOrder = { reference: [] as string[], remember: [] as string[], disposable: [] as string[] };
  for (const m of memos) {
    memosMap[m.id] = m;
    columnOrder[m.column].push(m.id);
  }
  return { memos: memosMap, columnOrder, version: 1 };
}

describe('appReducer', () => {
  it('빈 열을 가진 초기 상태를 반환한다', () => {
    expect(initialState).toEqual({
      memos: {},
      columnOrder: { reference: [], remember: [], disposable: [] },
      version: 1,
    });
  });

  it('CREATE_MEMO는 해당 열의 맨 위에 삽입한다', () => {
    const existing = makeMemo({ id: 'a', column: 'remember' });
    const next = appReducer(stateWith([existing]), {
      type: 'CREATE_MEMO',
      memo: makeMemo({ id: 'b', column: 'remember' }),
    });
    expect(next.columnOrder.remember).toEqual(['b', 'a']);
    expect(next.memos.b.id).toBe('b');
  });

  it('UPDATE_MEMO는 title/body를 패치하고 updatedAt을 갱신한다', () => {
    const existing = makeMemo({ id: 'a', title: 'Old', body: 'Old', updatedAt: 1 });
    const next = appReducer(stateWith([existing]), {
      type: 'UPDATE_MEMO',
      id: 'a',
      patch: { title: 'New', body: 'New body' },
    });
    expect(next.memos.a.title).toBe('New');
    expect(next.memos.a.body).toBe('New body');
    expect(next.memos.a.updatedAt).toBeGreaterThan(1);
  });

  it('CHANGE_COLOR는 색상을 변경한다', () => {
    const existing = makeMemo({ id: 'a', color: '#D8DEEC' });
    const next = appReducer(stateWith([existing]), {
      type: 'CHANGE_COLOR',
      id: 'a',
      color: '#E0D6E8',
    });
    expect(next.memos.a.color).toBe('#E0D6E8');
  });

  it('TOGGLE_PIN은 pinned 플래그를 토글한다', () => {
    const existing = makeMemo({ id: 'a', pinned: false });
    const after1 = appReducer(stateWith([existing]), { type: 'TOGGLE_PIN', id: 'a' });
    expect(after1.memos.a.pinned).toBe(true);
    const after2 = appReducer(after1, { type: 'TOGGLE_PIN', id: 'a' });
    expect(after2.memos.a.pinned).toBe(false);
  });

  it('DELETE_MEMO는 memos와 columnOrder에서 제거한다', () => {
    const a = makeMemo({ id: 'a', column: 'remember' });
    const b = makeMemo({ id: 'b', column: 'remember' });
    const next = appReducer(stateWith([a, b]), { type: 'DELETE_MEMO', id: 'a' });
    expect(next.memos.a).toBeUndefined();
    expect(next.columnOrder.remember).toEqual(['b']);
  });

  it('MOVE_MEMO는 같은 열 내에서 순서를 바꾼다', () => {
    const a = makeMemo({ id: 'a', column: 'remember' });
    const b = makeMemo({ id: 'b', column: 'remember' });
    const c = makeMemo({ id: 'c', column: 'remember' });
    const next = appReducer(stateWith([a, b, c]), {
      type: 'MOVE_MEMO',
      id: 'a',
      toColumn: 'remember',
      toIndex: 2,
    });
    expect(next.columnOrder.remember).toEqual(['b', 'c', 'a']);
  });

  it('MOVE_MEMO는 다른 열로 이동시키며 column과 순서를 갱신한다', () => {
    const a = makeMemo({ id: 'a', column: 'remember' });
    const b = makeMemo({ id: 'b', column: 'disposable' });
    const next = appReducer(stateWith([a, b]), {
      type: 'MOVE_MEMO',
      id: 'a',
      toColumn: 'disposable',
      toIndex: 0,
    });
    expect(next.memos.a.column).toBe('disposable');
    expect(next.columnOrder.remember).toEqual([]);
    expect(next.columnOrder.disposable).toEqual(['a', 'b']);
  });

  it('HYDRATE는 전체 상태를 교체한다', () => {
    const replacement = stateWith([makeMemo({ id: 'x' })]);
    const next = appReducer(initialState, { type: 'HYDRATE', state: replacement });
    expect(next).toEqual(replacement);
  });

  it('UPDATE_MEMO에 알 수 없는 id를 주면 같은 state 참조를 반환한다', () => {
    const s = stateWith([makeMemo({ id: 'a' })]);
    const next = appReducer(s, { type: 'UPDATE_MEMO', id: 'ghost', patch: { title: 'x' } });
    expect(next).toBe(s); // identity, not just equality
  });

  it('MOVE_MEMO에 알 수 없는 id를 주면 같은 state 참조를 반환한다', () => {
    const s = stateWith([makeMemo({ id: 'a' })]);
    const next = appReducer(s, { type: 'MOVE_MEMO', id: 'ghost', toColumn: 'remember', toIndex: 0 });
    expect(next).toBe(s);
  });

  it('MOVE_MEMO는 범위를 벗어난 toIndex를 끝으로 클램프한다', () => {
    const a = makeMemo({ id: 'a', column: 'remember' });
    const b = makeMemo({ id: 'b', column: 'remember' });
    const next = appReducer(stateWith([a, b]), {
      type: 'MOVE_MEMO',
      id: 'a',
      toColumn: 'remember',
      toIndex: 999,
    });
    expect(next.columnOrder.remember).toEqual(['b', 'a']);
  });
});
