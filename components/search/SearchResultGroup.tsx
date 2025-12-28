import { SearchResultItem } from './SearchResultItem';
import { SearchResult } from '@/lib/hooks/useGlobalSearch';

interface SearchResultGroupProps {
  title: string;
  results: SearchResult[];
  onResultClick: (url: string) => void;
}

export function SearchResultGroup({ 
  title, 
  results, 
  onResultClick 
}: SearchResultGroupProps) {
  return (
    <div className="border-b last:border-b-0">
      <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
        {title} ({results.length})
      </div>
      <div>
        {results.map((result) => (
          <SearchResultItem
            key={result.id}
            result={result}
            onClick={() => onResultClick(result.url)}
          />
        ))}
      </div>
    </div>
  );
}