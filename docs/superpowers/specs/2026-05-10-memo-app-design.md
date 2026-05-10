# Memo App Design

## Purpose

A personal, single-user, browser-only memo board. Memos live in three columns reflecting how the user wants to retain them. Each memo is a uniformly-sized square card with a pastel background. The app runs entirely in one browser, persists to LocalStorage, and has no backend or login.

## Goals

- Capture and revisit notes quickly with minimal UI friction.
- Sort notes by retention intent (always reference / remember / disposable) via drag-and-drop.
- Maintain visual cohesion: square cards, soft pastels, generous whitespace.
- Support markdown so notes can carry light structure.

## Non-Goals

- Multi-user, sync across devices, or sharing.
- Search (deferred — `⌘K` mockup is not in scope for v1).
- Mobile-optimized layout (desktop-first; basic responsive viewport handling only).
- Rich-text WYSIWYG; markdown source-edit only.
- Tags/folders beyond the three columns.

## Tech Stack

- **React 18 + TypeScript + Vite** — SPA, no SSR.
- **`@dnd-kit/core` + `@dnd-kit/sortable`** — drag-and-drop between and within columns.
- **`react-markdown` + `remark-gfm`** — markdown rendering in card preview and modal view.
- **LocalStorage** — single key `memo-app:state` holds the entire serialized state.
- **No state management library** — `useReducer` + Context is sufficient at this scale.
- **Pretendard Variable** as primary, **SF Pro Display** as fallback, then `system-ui`.

## Data Model

```ts
type ColumnId = 'reference' | 'remember' | 'disposable';

type Memo = {
  id: string;                // crypto.randomUUID()
  title: string;             // single line
  body: string;              // markdown source
  color: string;             // hex from PALETTE
  column: ColumnId;
  pinned: boolean;
  order: number;             // float; gaps allow O(1) reorder
  createdAt: number;         // epoch ms
  updatedAt: number;         // epoch ms
};

type AppState = {
  memos: Record<string, Memo>;
  columnOrder: Record<ColumnId, string[]>; // memo ids in display order
  version: 1;                              // schema version for future migration
};
```

**Order semantics within a column**: pinned memos sort first (by `order` desc among pinned), then unpinned (by `order` desc). `order` is a fractional index assigned at insert/move time so a single field reorders are constant-time.

## Color Palette

Ten pastel colors, all from the "Cool Modern" tone:

| Name        | Hex      |
|-------------|----------|
| Dusty Blue  | `#D8DEEC` |
| Lavender    | `#E0D6E8` |
| Sage        | `#D5E0D8` |
| Blush       | `#ECDCDC` |
| Sky         | `#D8E4EC` |
| Mauve       | `#E5D8DC` |
| Mint        | `#DCE6DC` |
| Sand        | `#E8E2D6` |
| Powder Pink | `#EAD8DC` |
| Cloud       | `#DDDFE2` |

A new memo gets a random color from the palette. Color is editable in the modal.

## Layout

- **Page**: background `#F4F4F6`, padding `112px 192px`, font Pretendard Variable + SF Pro Display.
- **Header**: brand `Memo` (24px, weight 700, letter-spacing -0.02em) + small note count subtitle on left. Right side reserved (empty in v1; ⌘K placeholder removed).
- **Board**: 3-column CSS grid, `gap: 32px`. Columns are `항상 참고해`, `기억해`, `날려도 좋아` (no emojis). Each header has a small `+` add button on the right.
- **Cards**: `aspect-ratio: 1/1`, `border-radius: 14px`, `padding: 16px`, soft shadow `0 2px 8px rgba(40,40,80,0.04)`. Title 13px / weight 600. Body 12px, opacity 0.72, clamped to 5 lines with ellipsis.
- **New memo (inline)**: solid dim `#EAEAEC` background, no dashed border, same shape as a card. Title and body fields render with placeholder text styled at lower opacity.

## Components

```
App
├── Board
│   └── Column (×3)
│       ├── ColumnHeader (title + "+" button)
│       └── MemoCard (×N)  ← rendered via dnd-kit Sortable
├── NewMemoCard (inline editor; one column at a time)
├── MemoModal (portal)
│   ├── ViewMode (markdown render + actions)
│   └── EditMode (title input + body textarea + actions)
└── StorageProvider (load/persist state, debounced write)
```

Each component has a single responsibility. `Board` owns layout and DnD context. `Column` is purely presentational — it renders its memo list. `MemoCard` knows nothing of columns; it receives data + handlers. `MemoModal` is portaled to `body` and styled independently.

## Interactions

### Create a memo
1. Click `+` on a column header → an inline `NewMemoCard` appears at the top of that column.
2. Title field auto-focuses. Tab moves to body.
3. **Save**: blur outside the card, or press `⌘+Enter`. Empty title and body → discarded.
4. New memo is assigned a random color from `PALETTE` and inserted at the top of its column (above unpinned, below pinned).
5. Only one inline editor exists at a time. Clicking `+` on a different column commits the existing draft (if non-empty) before opening the new one.

### Open / view a memo
- Click any card → `MemoModal` opens in **view mode**.
- View mode renders body as markdown via `react-markdown`.
- Footer shows `YYYY.MM.DD · <column label>` on the left and `[삭제]` `[편집]` chips on the right.
- Modal background is the memo's current color (so the modal feels like an enlarged card).

### Edit a memo
- Click `편집` chip → modal switches to **edit mode** (same modal, no new dialog).
- Title rendered as a single-line `input`, body as a `textarea` with monospace font (markdown source view).
- Footer: `[취소]` `[저장]`. No autosave; explicit save required.
- `취소` reverts; `저장` writes to state and returns to view mode.

### Change color
- A row of 10 small color dots appears above the modal footer in both view and edit modes.
- The current color is indicated by a dark ring on the active dot.
- Clicking a dot commits the color change immediately and updates the modal background. Color is metadata and is not gated by `취소`/`저장` in edit mode — only title/body changes are.

### Pin a memo
- A small circular pin button appears at the bottom-right of each card on hover.
- Click toggles `pinned`. Pinned cards stay visible (button always shown) with a dark filled style; unpinned hides the button on mouse-out.
- Pinned memos float above unpinned within the same column. Order between pinned items is preserved.

### Drag and drop
- `@dnd-kit` `SortableContext` per column with a single cross-column `DndContext`.
- Dragging a card shows a translucent ghost that follows the cursor; the placeholder shows the predicted drop position.
- Drop into another column updates `column` and `order`; drop within the same column reorders.
- Pinned memos retain pinned status when dragged. Render order applies `pinned` first, then `order`, so a pinned card dropped below an unpinned card snaps back above it. This is an accepted v1 wrinkle.

### Delete a memo
- `[삭제]` chip in modal. No confirmation in v1 (it's local-only and lossy by design — the "날려도 좋아" column is the safety net).
- Removes from `memos` and the appropriate `columnOrder` list.

### Truncation and overflow
- Card body uses `-webkit-line-clamp: 5` with `text-overflow: ellipsis`. Title doesn't wrap (single line).
- The card preview shows the markdown source as plain text — formatting characters intact, no rendering. Markdown is rendered only in the modal view mode. This keeps cards visually quiet at small size.

## State Persistence

- Single `useEffect` watches the reducer state and debounces writes (250ms) to `localStorage['memo-app:state']`.
- On load, `StorageProvider` reads, validates `version === 1`, and seeds the reducer. Invalid or missing → empty initial state.
- All mutations go through reducer actions (`CREATE_MEMO`, `UPDATE_MEMO`, `MOVE_MEMO`, `TOGGLE_PIN`, `DELETE_MEMO`, `CHANGE_COLOR`).

## Edge Cases

- **Empty column**: render the column header and an invisible drop target large enough to accept a card.
- **No memos at all**: render board normally with three empty columns. No empty-state copy in v1.
- **Long titles**: clamped to a single line with ellipsis in card; full title shows in modal.
- **No body**: card shows only the title; modal renders empty body area.
- **Storage quota**: LocalStorage limit (~5MB) is plenty for plain-text memos. No quota handling in v1.

## Testing

- **Unit**: reducer action tests covering each action (move within column, move across columns, pin reorder, color change, delete).
- **Component**: render `MemoCard`, `Column`, `MemoModal` with sample state; assert visual states (pinned, hover, dim new card).
- **Integration**: full flow tests via React Testing Library — create → edit → drag to different column → pin → reload (verify LocalStorage persistence).
- **No e2e in v1** — Playwright/Cypress can be added later if scope grows.

## Out of Scope (Possible Follow-ups)

- Search (`⌘K`)
- Tags
- Export/import (JSON)
- Sync across devices
- Mobile layout
- Undo/redo
- Custom palette / dark mode
