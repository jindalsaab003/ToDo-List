const filters = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export default function TodoFilters({ currentFilter, onFilterChange }) {
  return (
    <div className="filters" aria-label="Filter tasks">
      {filters.map((filter) => (
        <button
          className={currentFilter === filter.value ? "active" : ""}
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          type="button"
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
