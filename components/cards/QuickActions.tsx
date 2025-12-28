import { UserPlus, FileText, BarChart3, Calendar, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';

const actions = [
  {
    label: 'Inscrire un Étudiant',
    icon: UserPlus,
  },
  {
    label: 'Créer une Maquette',
    icon: FileText,
  },
  {
    label: 'Parcours UE',
    icon: BarChart3,
  },
  {
    label: 'Examen & Planning',
    icon: Calendar,
  },
];

export default function QuickActions() {
  return (
    <Card title="Actions rapides">
      <div className="flex flex-col gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;

          return (
            <button
              key={i}
              className="
                w-full
                flex items-center justify-between
                px-4 py-3
                rounded-lg
                border border-slate-200
                hover:bg-slate-50
                transition
              "
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 flex items-center justify-center rounded-md bg-slate-100">
                  <Icon size={18} className="text-slate-600" />
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {action.label}
                </span>
              </div>

              <ChevronRight size={18} className="text-slate-400" />
            </button>
          );
        })}
      </div>
    </Card>
  );
}
