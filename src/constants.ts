import type { ColumnId } from './types';

export const PALETTE = [
  '#D8DEEC', // Dusty Blue
  '#E0D6E8', // Lavender
  '#D5E0D8', // Sage
  '#ECDCDC', // Blush
  '#D8E4EC', // Sky
  '#E5D8DC', // Mauve
  '#DCE6DC', // Mint
  '#E8E2D6', // Sand
  '#EAD8DC', // Powder Pink
  '#DDDFE2', // Cloud
] as const;

export const COLUMN_IDS: ColumnId[] = ['reference', 'remember', 'disposable'];

export const COLUMN_LABELS: Record<ColumnId, string> = {
  reference: '항상 참고해',
  remember: '기억해',
  disposable: '날려도 좋아',
};

export const DEFAULT_NEW_COLUMN: ColumnId = 'remember';

export const LOCAL_STORAGE_KEY = 'memo-app:state';

export const STATE_VERSION = 1 as const;

export function randomColor(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}
