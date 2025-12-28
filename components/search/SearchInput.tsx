'use client';

import { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchInput({ onSearch, isOpen, onOpenChange }: SearchInputProps) {
  const [query, setQuery] = useState('');

  // Gérer Ctrl+K pour ouvrir la recherche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
      
      // ESC pour fermer
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  // Déclencher la recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        onSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onOpenChange(true)}
          placeholder="Rechercher... (Ctrl+K)"
          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 border rounded">
          <Command className="h-3 w-3 inline" /> K
        </kbd>
      </div>
    </div>
  );
}