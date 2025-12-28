'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, Share2 } from 'lucide-react';
import { Student } from '@/lib/hooks/useStudentSearch';
import { FilterValue } from '@/types/filters';

interface SearchActionsProps {
  filters: FilterValue;
  results: Student[];
}

export function SearchActions({ filters, results }: SearchActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveSearch = async () => {
    setIsSaving(true);
    try {
      const name = prompt('Nom de la recherche sauvegardée:');
      if (!name) return;

      // Sauvegarder dans localStorage ou via API
      const savedSearches = JSON.parse(
        localStorage.getItem('saved_searches') || '[]'
      );
      
      savedSearches.push({
        id: Date.now().toString(),
        name,
        filters,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
      alert('Recherche sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Export CSV
      const csv = [
        ['N° Étudiant', 'Nom', 'Prénom', 'Email', 'Niveau', 'Département', 'Statut', 'Moyenne'],
        ...results.map(s => [
          s.studentId,
          s.lastName,
          s.firstName,
          s.email,
          s.level,
          s.department,
          s.status,
          s.gpa.toString(),
        ]),
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etudiants_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSaveSearch}
        variant="outline"
        size="sm"
        disabled={isSaving || Object.keys(filters).length === 0}
      >
        <Save className="h-4 w-4 mr-1" />
        Sauvegarder
      </Button>

      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        disabled={isExporting || results.length === 0}
      >
        <Download className="h-4 w-4 mr-1" />
        Exporter ({results.length})
      </Button>

      <Button variant="outline" size="sm">
        <Share2 className="h-4 w-4 mr-1" />
        Partager
      </Button>
    </div>
  );
}