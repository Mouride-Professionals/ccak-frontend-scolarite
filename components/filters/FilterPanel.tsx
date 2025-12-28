'use client';

import { useState } from 'react';
import { FilterPanelProps } from '@/types/filters';
import { useFilterState } from '@/lib/hooks/useFilterState';
import { FilterField } from './FilterField';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FilterPanel({
  fields,
  onApply,
  onClear,
  defaultOpen = false,
  persistKey,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { filters, updateFilter, clearFilters } = useFilterState(persistKey);

  const handleApply = () => {
    onApply(filters);
  };

  const handleClear = () => {
    clearFilters();
    onClear();
  };

  const activeFiltersCount = Object.values(filters).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object' && v !== null) return Object.values(v).some(val => val);
    return v !== null && v !== undefined && v !== '';
  }).length;

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="border-t p-4">
          {/* Filter Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {fields.map((field) => (
              <FilterField
                key={field.id}
                field={field}
                value={filters[field.id]}
                onChange={(value) => updateFilter(field.id, value)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
            <Button onClick={handleApply} className="flex-1 sm:flex-none">
              Appliquer les filtres
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
            {activeFiltersCount > 0 && (
              <span className="text-sm text-gray-600 ml-auto">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

