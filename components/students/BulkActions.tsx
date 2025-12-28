'use client';

import { Button } from '@/components/ui/button';
import { Mail, FileText, Trash2, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onClear: () => void;
}

export function BulkActions({ selectedCount, onClear }: BulkActionsProps) {
  const handleSendEmail = () => {
    console.log('Envoyer email à', selectedCount, 'étudiants');
  };

  const handleGenerateDocuments = () => {
    console.log('Générer documents pour', selectedCount, 'étudiants');
  };

  const handleDelete = () => {
    if (confirm(`Supprimer ${selectedCount} étudiant(s) ?`)) {
      console.log('Supprimer', selectedCount, 'étudiants');
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <span className="font-medium text-blue-900">
          {selectedCount} étudiant{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
        <Button
          onClick={onClear}
          variant="ghost"
          size="sm"
          className="text-blue-700 hover:text-blue-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSendEmail} size="sm" variant="outline">
          <Mail className="h-4 w-4 mr-1" />
          Envoyer email
        </Button>

        <Button onClick={handleGenerateDocuments} size="sm" variant="outline">
          <FileText className="h-4 w-4 mr-1" />
          Documents
        </Button>

        <Button 
          onClick={handleDelete} 
          size="sm" 
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>
    </div>
  );
}