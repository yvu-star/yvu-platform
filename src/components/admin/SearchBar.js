'use client';

export default function SearchBar({
  query,
  onSearch,
  filters = [],
  activeFilters = {},
  onFilter,
  onReset,
  placeholder = 'Search…',
  resultCount,
  totalCount,
}) {
  const hasActive = query.trim() || Object.values(activeFilters).some(v => v && v !== 'all');

  return (
    <div className="search-bar-wrap">
      <div className="search-bar-row">
        {/* Search input */}
        <div className="search-input-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={query}
            onChange={e => onSearch(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => onSearch('')} title="Clear search">
              ×
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        {filters.map(f => (
          <select
            key={f.key}
            className="search-filter-select"
            value={activeFilters[f.key] || 'all'}
            onChange={e => onFilter(f.key, e.target.value)}
          >
            <option value="all">{f.label}</option>
            {f.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}

        {/* Reset button — only shown when something is active */}
        {hasActive && (
          <button className="search-reset-btn" onClick={onReset}>
            Reset
          </button>
        )}
      </div>

      {/* Result count */}
      {hasActive && (
        <div className="search-result-count">
          Showing {resultCount} of {totalCount} records
        </div>
      )}
    </div>
  );
}