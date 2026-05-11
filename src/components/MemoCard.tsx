import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import type { Memo } from '../types';
import { MarkdownView } from './MarkdownView';
import { PinButton } from './PinButton';

type Props = {
  memo: Memo;
  onOpen: (id: string) => void;
  onTogglePin: (id: string) => void;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
  dragStyle?: CSSProperties;
  isDragging?: boolean;
};

export const MemoCard = forwardRef<HTMLDivElement, Props>(function MemoCard(
  { memo, onOpen, onTogglePin, dragHandleProps, dragStyle, isDragging },
  ref
) {
  return (
    <div
      ref={ref}
      className={`memo-card ${isDragging ? 'memo-card--dragging' : ''}`}
      style={{ background: memo.color, ...dragStyle }}
      onClick={() => onOpen(memo.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(memo.id);
        }
      }}
      {...dragHandleProps}
    >
      <div className="memo-card__title">{memo.title}</div>
      <div className="memo-card__body">
        <MarkdownView source={memo.body} variant="card" />
        <div className="memo-card__fade" style={{ background: `linear-gradient(to bottom, transparent, ${memo.color})` }} />
      </div>
      <PinButton pinned={memo.pinned} onClick={() => onTogglePin(memo.id)} />
    </div>
  );
});
