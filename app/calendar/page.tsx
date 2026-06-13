"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/protected-route";
import DashboardLayout from "@/components/layout/dashboard-layout";

const links = [
  {
    title: "Configuration du calendrier",
    description: "Définir les jours ouvrés, créneaux et périodes.",
    href: "/calendar/setup",
  },
  {
    title: "Jours fériés",
    description: "Ajouter et gérer les jours fériés et exceptions.",
    href: "/calendar/holidays",
  },
  {
    title: "Salles",
    description: "Gérer les salles et équipements.",
    href: "/calendar/rooms",
  },
  {
    title: "Création d’emplois du temps",
    description: "Planifier les séances et gérer les conflits.",
    href: "/calendar/schedules",
  },
  {
    title: "Emploi du temps étudiant",
    description: "Consulter l’emploi du temps par étudiant.",
    href: "/calendar/student",
  },
  {
    title: "Emploi du temps enseignant",
    description: "Consulter l’emploi du temps par enseignant.",
    href: "/calendar/faculty",
  },
  {
    title: "Emploi du temps programme",
    description: "Consulter l’emploi du temps par programme.",
    href: "/calendar/program",
  },
  {
    title: "Disponibilités",
    description: "Vérifier les disponibilités avant planification.",
    href: "/calendar/availability",
  },
];

export default function CalendarHomePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="Calendrier académique">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-[#00365F]">{link.title}</h2>
              <p className="mt-2 text-sm text-zinc-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
