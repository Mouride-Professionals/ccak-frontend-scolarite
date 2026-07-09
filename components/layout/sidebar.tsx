"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function getRealmRoles(accessToken: string | undefined): string[] {
  if (!accessToken) return [];
  try {
    const [, payload] = accessToken.split(".");
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(padded)) as { realm_access?: { roles?: string[] } };
    return decoded?.realm_access?.roles ?? [];
  } catch {
    return [];
  }
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  requiresAdmin?: boolean;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: "personnes",
    label: "Personnes",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    children: [
      {
        id: "students",
        label: "Étudiants",
        href: "/students",
        icon: null as any,
      },
      {
        id: "faculty-members",
        label: "Enseignants",
        href: "/faculty-members",
        icon: null as any,
      },
      {
        id: "enrollments",
        label: "Inscriptions",
        href: "/enrollments",
        icon: null as any,
      },
      {
        id: "course-enrollment-matrix",
        label: "Inscriptions aux cours",
        href: "/course-enrollments/matrix",
        icon: null as any,
      },
      {
        id: "teaching-assignments",
        label: "Charges d'enseignement",
        href: "/teaching-assignments",
        icon: null as any,
      },
    ],
  },
  {
    id: "evaluation",
    label: "Évaluation",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    children: [
      {
        id: "assessments",
        label: "Contrôles continus",
        href: "/assessments",
        icon: null as any,
      },
      {
        id: "assessments-student",
        label: "CC par étudiant",
        href: "/assessments/student",
        icon: null as any,
      },
      {
        id: "exams",
        label: "Sessions d'examen",
        href: "/exams",
        icon: null as any,
      },
      {
        id: "exam-grades",
        label: "Fiches de notes",
        href: "/exam-grades",
        icon: null as any,
      },
      {
        id: "evaluations",
        label: "Évaluations",
        href: "/evaluations",
        icon: null as any,
      },
      {
        id: "evaluations-student",
        label: "Vue étudiants",
        href: "/evaluations/student",
        icon: null as any,
      },
      {
        id: "grades",
        label: "Notes",
        href: "/grades",
        icon: null as any,
      },
      {
        id: "deliberations",
        label: "Délibérations",
        href: "/deliberations",
        icon: null as any,
      },
    ],
  },
  {
    id: "emplois-du-temps",
    label: "Emplois du temps",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    children: [
      {
        id: "calendar-home",
        label: "Vue d'ensemble",
        href: "/calendar",
        icon: null as any,
      },
      {
        id: "calendar-student",
        label: "EDT étudiant",
        href: "/calendar/student",
        icon: null as any,
      },
      {
        id: "calendar-faculty",
        label: "EDT enseignant",
        href: "/calendar/faculty",
        icon: null as any,
      },
      {
        id: "calendar-program",
        label: "EDT programme",
        href: "/calendar/program",
        icon: null as any,
      },
      {
        id: "planning-cours",
        label: "Planning Cours",
        href: "/planning-cours",
        icon: null as any,
      },
      {
        id: "calendar-schedules",
        label: "Création EDT",
        href: "/calendar/schedules",
        icon: null as any,
      },
    ],
  },
  {
    id: "assiduite",
    label: "Assiduité",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    children: [
      {
        id: "course-logs",
        label: "Cahier de textes",
        href: "/course-logs",
        icon: null as any,
      },
      {
        id: "attendance-mark",
        label: "Feuilles de présence",
        href: "/attendance/mark",
        icon: null as any,
      },
      {
        id: "attendance-student",
        label: "Présences étudiant",
        href: "/attendance/student",
        icon: null as any,
      },
      {
        id: "attendance-course",
        label: "Rapport cours",
        href: "/attendance/course",
        icon: null as any,
      },
      {
        id: "attendance-dispensations",
        label: "Dispenses",
        href: "/attendance/dispensations",
        icon: null as any,
      },
    ],
  },
  {
    id: "documents",
    label: "Documents officiels",
    href: "/documents",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    id: "communication",
    label: "Communication",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    children: [
      {
        id: "notifications-admin",
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: null as any,
      },
      {
        id: "announcements-admin",
        label: "Annonces",
        href: "/dashboard/announcements",
        icon: null as any,
      },
      {
        id: "templates",
        label: "Modèles de messages",
        href: "/dashboard/templates",
        icon: null as any,
      },
    ],
  },
  {
    id: "parametrage",
    label: "Paramétrage",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    children: [
      {
        id: "faculties",
        label: "Établissements",
        href: "/faculties",
        icon: null as any,
      },
      {
        id: "departments",
        label: "Départements",
        href: "/departments",
        icon: null as any,
      },
      {
        id: "programmes",
        label: "Programmes",
        href: "/programmes",
        icon: null as any,
      },
      {
        id: "maquette",
        label: "Maquette pédagogique",
        href: "/maquette",
        icon: null as any,
      },
      {
        id: "course-units",
        label: "Unités d'Enseignement",
        href: "/course-units",
        icon: null as any,
      },
      {
        id: "courses",
        label: "ECUE",
        href: "/courses",
        icon: null as any,
      },
      {
        id: "academic-years",
        label: "Années académiques",
        href: "/academic-years",
        icon: null as any,
      },
      {
        id: "calendar-setup",
        label: "Paramètres EDT",
        href: "/calendar/setup",
        icon: null as any,
      },
      {
        id: "calendar-holidays",
        label: "Jours fériés",
        href: "/calendar/holidays",
        icon: null as any,
      },
      {
        id: "calendar-rooms",
        label: "Salles",
        href: "/calendar/rooms",
        icon: null as any,
      },
      {
        id: "calendar-availability",
        label: "Disponibilités",
        href: "/calendar/availability",
        icon: null as any,
      },
    ],
  },
  {
    id: "sync",
    label: "Synchronisation",
    href: "/sync",
    requiresAdmin: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { data: session } = useSession();
  const isAdmin = getRealmRoles(session?.accessToken).includes("ADMIN");

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? [] : [itemId]));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => isActive(child.href))
    );
    if (activeParent) {
      setExpandedItems([activeParent.id]);
    }
  }, [pathname]);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-[230px] bg-white shadow-sm transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center px-4 pt-2">
          <img src="/logo.svg" alt="CCAK" className="h-20 w-20 md:h-28 md:w-28" />
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems
              .filter((item) => !item.requiresAdmin || isAdmin)
              .map((item) => (
                <li key={item.id}>
                  {item.children ? (
                    // Parent with children
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          expandedItems.includes(item.id) ||
                          item.children.some((child) => isActive(child.href))
                            ? "bg-[#00365F]/10 text-[#00365F]"
                            : "text-[#00365F]/70 hover:bg-[#00365F]/5 hover:text-[#00365F]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            expandedItems.includes(item.id) ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {expandedItems.includes(item.id) && (
                        <ul className="ml-8 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.href || "#"}
                                onClick={onClose}
                                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                                  isActive(child.href)
                                    ? "font-medium text-[#008D36]"
                                    : "text-[#00365F]/70 hover:text-[#00365F]"
                                }`}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Simple link
                    <Link
                      href={item.href || "#"}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-[#00365F]/10 text-[#00365F]"
                          : "text-[#00365F]/70 hover:bg-[#00365F]/5 hover:text-[#00365F]"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
