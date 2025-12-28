import { SearchResult } from '@/lib/hooks/useGlobalSearch';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  FileText 
} from 'lucide-react';

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
}

const iconMap = {
  student: User,
  teacher: GraduationCap,
  course: BookOpen,
  document: FileText,
};

export function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const Icon = iconMap[result.type];

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors"
    >
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {result.title}
        </div>
        {result.subtitle && (
          <div className="text-sm text-gray-500 truncate">
            {result.subtitle}
          </div>
        )}
      </div>
    </button>
  );
}