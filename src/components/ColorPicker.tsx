import { PALETTE } from '../constants';

type Props = {
  current: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ current, onChange }: Props) {
  return (
    <div className="color-picker">
      <span className="color-picker__label">색</span>
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          className={`color-dot ${c === current ? 'color-dot--active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={`색상 ${c}`}
          aria-pressed={c === current}
        />
      ))}
    </div>
  );
}
