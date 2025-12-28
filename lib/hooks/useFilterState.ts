import { useState, useEffect } from 'react';
import { FilterValue } from '@/types/filters';

export function useFilterState(persistKey?: string, initialFilters: FilterValue = {}) {
  const [filters, setFilters] = useState<FilterValue>(() => {
    if (persistKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`filters_${persistKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialFilters;
  });

  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      localStorage.setItem(`filters_${persistKey}`, JSON.stringify(filters));
    }
  }, [filters, persistKey]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    if (persistKey && typeof window !== 'undefined') {
      localStorage.removeItem(`filters_${persistKey}`);
    }
  };

  return { filters, updateFilter, clearFilters, setFilters };
}