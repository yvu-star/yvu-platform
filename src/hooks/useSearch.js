import { useState, useMemo, useRef } from 'react';

export function useSearch(data, { searchFields = [], filters = {} }) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  // Callers pass inline array literals like searchFields: ['name', 'email']
  // which are new references every render — that busts useMemo every time
  // even when data and query haven't changed. Reading via ref fixes this.
  const fieldsRef = useRef(searchFields);
  fieldsRef.current = searchFields;

  const results = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(row =>
        fieldsRef.current.some(field => {
          const val = row[field];
          return val && String(val).toLowerCase().includes(q);
        })
      );
    }

    Object.entries(activeFilters).forEach(([key, val]) => {
      if (!val || val === 'all') return;
      filtered = filtered.filter(row => {
        if (key === 'is_read') return String(row.is_read) === val;
        return row[key] === val;
      });
    });

    return filtered;
  }, [data, query, activeFilters]); // searchFields removed — read via ref above

  function setFilter(key, val) {
    setActiveFilters(prev => ({ ...prev, [key]: val }));
  }

  function reset() {
    setQuery('');
    setActiveFilters({});
  }

  return { query, setQuery, activeFilters, setFilter, reset, results };
}