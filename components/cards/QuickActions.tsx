import Card from "@/components/ui/card";
import Link from "next/link";
import { BarChart3, Calendar, ChevronRight, FileText, UserPlus } from "lucide-react";

const actions = [
  {
    label: "Inscrire un Étudiant",
    icon: UserPlus,
    href: "/enrollments/new",
  },
  {
    label: "Créer une Maquette",
    icon: FileText,
    href: "/programmes/new",
  },
  {
    label: "Parcours UE",
    icon: BarChart3,
    href: "/course-units",
  },
  {
    label: "Examen & Planning",
    icon: Calendar,
    href: "/calendar/schedules",
  },
];

export default function QuickActions() {
  return (
    <Card title="Actions rapides">
      <div className="flex flex-col gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;

          return (
            <Link
              key={i}
              href={action.href}
              className="
                w-full
                flex items-center justify-between
                px-4 py-3
                rounded-lg
                border border-zinc-200
                hover:bg-zinc-50
                transition
              "
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 flex items-center justify-center rounded-md bg-zinc-100">
                  <Icon size={18} className="text-zinc-700" />
                </span>
                <span className="text-sm font-medium text-zinc-800">{action.label}</span>
              </div>

              <ChevronRight size={18} className="text-zinc-500" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
