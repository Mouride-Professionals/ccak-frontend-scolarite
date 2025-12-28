'use client';

import { SearchResultGroup } from './SearchResultGroup';
import { GroupedResults } from '@/lib/hooks/useGlobalSearch';
import { Loader2 } from 'lucide-react';

interface SearchDropdownProps {
  results: GroupedResults | undefined;
  isLoading: boolean;
  isOpen: boolean;
  onResultClick: (url: string) => void;
}

export function SearchDropdown({ 
  results, 
  isLoading, 
  isOpen,
  onResultClick 
}: SearchDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Recherche en cours...</span>
        </div>
      )}

      {!isLoading && results && (
        <>
          {results.students.length > 0 && (
            <SearchResultGroup
              title="Étudiants"
              results={results.students}
              onResultClick={onResultClick}
            />
          )}
          
          {results.teachers.length > 0 && (
            <SearchResultGroup
              title="Enseignants"
              results={results.teachers}
              onResultClick={onResultClick}
            />
          )}
          
          {results.courses.length > 0 && (
            <SearchResultGroup
              title="Cours"
              results={results.courses}
              onResultClick={onResultClick}
            />
          )}
          
          {results.documents.length > 0 && (
            <SearchResultGroup
              title="Documents"
              results={results.documents}
              onResultClick={onResultClick}
            />
          )}

          {/* Aucun résultat */}
          {Object.values(results).every(arr => arr.length === 0) && (
            <div className="p-4 text-center text-gray-500">
              Aucun résultat trouvé
            </div>
          )}
        </>
      )}
    </div>
  );
}