import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { FilterValue } from '@/types/filters';

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  department: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  enrollmentDate: string;
  gpa: number;
  hasScholarship: boolean;
}

export function useStudentSearch(filters: FilterValue) {
  return useQuery({
    queryKey: ['students-search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });

      const response = await api.get<{ students: Student[]; total: number }>(
        `/students/search?${params.toString()}`
      );
      
      return response;
    },
    enabled: Object.keys(filters).length > 0,
  });
}