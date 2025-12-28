import { Course, CreateCourseInput, UpdateCourseInput, CourseFilters, CoursesResponse } from '@/types/course';

const mockCourses: Course[] = [
  {
    id: '1',
    course_unit_id: '1',
    code: 'CS101',
    name: 'Introduction à la Programmation',
    description: 'Cours fondamental couvrant les bases de la programmation',
    credits: 3,
    hours_lecture: 24,
    hours_td: 12,
    hours_tp: 12,
    coefficient: 1.5,
    prerequisites: [],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    course_unit_id: '1',
    code: 'CS102',
    name: 'Structures de Données',
    description: 'Apprentissage des structures de données essentielles',
    credits: 4,
    hours_lecture: 30,
    hours_td: 15,
    hours_tp: 15,
    coefficient: 2,
    prerequisites: ['CS101'],
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    course_unit_id: '2',
    code: 'MATH201',
    name: 'Algèbre Linéaire',
    description: 'Mathématiques avancées pour l\'informatique',
    credits: 3,
    hours_lecture: 28,
    hours_td: 14,
    hours_tp: 0,
    coefficient: 1.5,
    prerequisites: [],
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

export const getCourses = async (filters?: CourseFilters): Promise<CoursesResponse> => {
  // Always use mock data for now
  let filteredCourses = [...mockCourses];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filteredCourses = filteredCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(search) ||
        course.code.toLowerCase().includes(search) ||
        course.description?.toLowerCase().includes(search)
    );
  }

  if (filters?.course_unit_id) {
    filteredCourses = filteredCourses.filter(
      (course) => course.course_unit_id === filters.course_unit_id
    );
  }

  if (filters?.is_active !== undefined) {
    filteredCourses = filteredCourses.filter(
      (course) => course.is_active === filters.is_active
    );
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const total = filteredCourses.length;
  const total_pages = Math.ceil(total / limit);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  return {
    data: paginatedCourses,
    page,
    limit,
    total,
    total_pages,
  };
};

export const getCourse = async (id: string): Promise<Course | null> => {
  // Always use mock data for now
  return mockCourses.find((course) => course.id === id) || null;
};

export const createCourse = async (data: CreateCourseInput): Promise<Course> => {
  // Always use mock data for now
  const newCourse: Course = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    hours_lecture: data.hours_lecture || 0,
    hours_td: data.hours_td || 0,
    hours_tp: data.hours_tp || 0,
    coefficient: data.coefficient || 1,
    is_active: data.is_active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockCourses.push(newCourse);
  return newCourse;
};

export const updateCourse = async (data: UpdateCourseInput): Promise<Course> => {
  // Always use mock data for now
  const index = mockCourses.findIndex((course) => course.id === data.id);
  if (index === -1) {
    throw new Error('Course not found');
  }

  const updatedCourse: Course = {
    ...mockCourses[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  mockCourses[index] = updatedCourse;
  return updatedCourse;
};

export const deleteCourse = async (id: string): Promise<void> => {
  // Always use mock data for now
  const index = mockCourses.findIndex((course) => course.id === id);
  if (index === -1) {
    throw new Error('Course not found');
  }

  mockCourses.splice(index, 1);
};
