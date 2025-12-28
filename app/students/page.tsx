'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { useState, useEffect } from 'react';

// Mock data for demonstration
const mockStudents = [
  { id: '1', name: 'Jean Dupont', level: 'L3', department: 'Informatique', enrollmentDate: '2022-09-15', active: true },
  { id: '2', name: 'Marie Martin', level: 'M1', department: 'Mathématiques', active: true },
  { id: '3', name: 'Pierre Durand', level: 'L2', department: 'Physique', active: false },
];

const levels = [
  { value: 'L1', label: 'Licence 1' },
  { value: 'L2', label: 'Licence 2' },
  { value: 'L3', label: 'Licence 3' },
  { value: 'M1', label: 'Master 1' },
  { value: 'M2', label: 'Master 2' },
];

const departments = [
  { value: 'info', label: 'Informatique' },
  { value: 'math', label: 'Mathématiques' },
  { value: 'physics', label: 'Physique' },
];

export default function StudentsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(mockStudents);
  const [filters, setFilters] = useState({
    level: '',
    department: '',
    active: false,
  });

  // Recherche et filtrage dynamique
  useEffect(() => {
    let results = [...mockStudents];

    // Appliquer la recherche
    if (searchQuery) {
      results = results.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Appliquer les filtres
    if (filters.level) {
      results = results.filter(student => student.level === filters.level);
    }

    if (filters.department) {
      const deptLabel = departments.find(d => d.value === filters.department)?.label;
      if (deptLabel) {
        results = results.filter(student => student.department === deptLabel);
      }
    }

    if (filters.active) {
      results = results.filter(student => student.active === true);
    }

    setFilteredStudents(results);
  }, [searchQuery, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      level: '',
      department: '',
      active: false,
    });
  };

  const activeFilterCount = [
    filters.level,
    filters.department,
    filters.active,
  ].filter(Boolean).length;

  return (
    <DashboardLayout title='Étudiants'>
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00365F]">Liste des Étudiants</h1>
          <p className="mt-2 text-sm text-zinc-600">Gérez les étudiants et leurs informations</p>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un étudiant..."
                className="block w-80 rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showFilters
                  ? "border-[#008D36] bg-[#008D36]/10 text-[#008D36]"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtres
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#008D36] text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <button
            className="flex items-center gap-2 rounded-lg bg-[#008D36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007A2E]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvel Étudiant
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00365F]">Filtres avancés</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-zinc-500 hover:text-[#008D36] transition-colors"
              >
                Réinitialiser tout
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Level Filter */}
              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Niveau
                </label>
                <select
                  id="level"
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les niveaux</option>
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  Département
                </label>
                <select
                  id="department"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
                >
                  <option value="">Tous les départements</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filter */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Statut
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.active}
                    onChange={(e) => handleFilterChange('active', e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-[#008D36] focus:ring-[#008D36]"
                  />
                  <span className="text-sm text-zinc-700">Actifs uniquement</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#00365F] uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#00365F] uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#00365F] uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#00365F] uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#00365F] uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#00365F] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {student.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {student.enrollmentDate || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {student.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-[#008D36] hover:text-[#007A2E] mr-4">
                        Modifier
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <svg className="h-12 w-12 mb-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm font-medium">Aucun étudiant trouvé</p>
                      <p className="text-xs mt-1">Essayez de modifier vos critères de recherche</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4 rounded-lg">
          <p className="text-sm text-zinc-500">
            Affichage de {filteredStudents.length} sur {mockStudents.length} étudiants
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>
            <button className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white shadow-sm">
              1
            </button>
            <button
              disabled
              className="rounded-lg border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}