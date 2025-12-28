'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchInput } from './SearchInput';
import { SearchDropdown } from './SearchDropdown';
import { useGlobalSearch } from '@/lib/hooks/useGlobalSearch';

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { data: results, isLoading } = useGlobalSearch(query, isOpen);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const handleResultClick = useCallback((url: string) => {
    router.push(url);
    setIsOpen(false);
    setQuery('');
  }, [router]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setQuery('');
    }
  }, []);

  return (
    <div className="relative">
      <SearchInput
        onSearch={handleSearch}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
      />
      <SearchDropdown
        results={results}
        isLoading={isLoading}
        isOpen={isOpen && query.length > 0}
        onResultClick={handleResultClick}
      />
    </div>
  );
}