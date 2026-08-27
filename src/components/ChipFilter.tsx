interface Props<T extends string> {
  label: string;
  options: readonly T[];
  selected: Set<T>;
  onToggle: (value: T) => void;
  onClear: () => void;
}

export function ChipFilter<T extends string>({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: Props<T>) {
  return (
    <div className="filter-group">
      <span className="filter-group-label">{label}</span>
      <div className="chip-row">
        <button
          type="button"
          className={selected.size === 0 ? "chip chip-active" : "chip"}
          onClick={onClear}
        >
          All
        </button>
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={selected.has(option) ? "chip chip-active" : "chip"}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
