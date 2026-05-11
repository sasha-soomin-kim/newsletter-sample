type Props = {
  pinned: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export function PinButton({ pinned, onClick }: Props) {
  return (
    <button
      className={`pin-btn ${pinned ? 'pin-btn--pinned' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={pinned ? '핀 고정 해제' : '핀 고정'}
      title={pinned ? '핀 고정됨' : '핀 고정'}
    >
      <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden>
        <path d="M9 1.5a.5.5 0 0 1 .5.5v3.293l2.354 2.353a.5.5 0 0 1 .146.354V9.5a.5.5 0 0 1-.5.5H8.5v4l-.5 1-.5-1v-4H4.5a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .146-.354L6.5 5.293V2a.5.5 0 0 1 .5-.5h2z"/>
      </svg>
    </button>
  );
}
