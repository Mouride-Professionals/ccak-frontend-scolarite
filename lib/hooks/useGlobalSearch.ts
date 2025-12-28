import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface SearchResult {
  id: string;
  type: 'student' | 'teacher' | 'course' | 'document';
  title: string;
  subtitle?: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface GroupedResults {
  students: SearchResult[];
  teachers: SearchResult[];
  courses: SearchResult[];
  documents: SearchResult[];
}

export function useGlobalSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['global-search', query],
    queryFn: async () => {
      const response = await api.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
      
      // Grouper les résultats par type
      const grouped: GroupedResults = {
        students: [],
        teachers: [],
        courses: [],
        documents: [],
      };

      response.forEach((result) => {
        if (result.type === 'student') grouped.students.push(result);
        else if (result.type === 'teacher') grouped.teachers.push(result);
        else if (result.type === 'course') grouped.courses.push(result);
        else if (result.type === 'document') grouped.documents.push(result);
      });

      return grouped;
    },
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });
}