type Props = {
  title: string;
  onAdd: () => void;
};

export function ColumnHeader({ title, onAdd }: Props) {
  return (
    <div className="column-header">
      <span className="column-header__title">{title}</span>
      <button className="column-header__add" onClick={onAdd} aria-label={`${title}에 메모 추가`}>＋</button>
    </div>
  );
}
