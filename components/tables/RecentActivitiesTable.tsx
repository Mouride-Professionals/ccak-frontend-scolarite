import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "../ui/card";
import type { DashboardRecentActivity } from "@/types/dashboard";

const statusStyles = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray: "bg-zinc-100 text-zinc-800",
} as const;

interface RecentActivitiesTableProps {
  activities?: DashboardRecentActivity[];
  isLoading?: boolean;
}

const statusToColor = (status: string): keyof typeof statusStyles => {
  const normalized = status.toUpperCase();
  if (normalized === "VALIDATED") return "green";
  if (normalized === "PROCESSED") return "blue";
  if (normalized === "PENDING") return "yellow";
  return "gray";
};

const statusToLabel = (status: string) => {
  const normalized = status.toUpperCase();
  if (normalized === "VALIDATED") return "Validé";
  if (normalized === "PROCESSED") return "Traité";
  if (normalized === "PENDING") return "En attente";
  return status;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const formatRelative = (value: string) =>
  formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: fr,
  });

export default function RecentActivitiesTable({
  activities = [],
  isLoading = false,
}: RecentActivitiesTableProps) {
  return (
    <Card title="Activités Récentes">
      {isLoading ? (
        <div className="py-8 text-center text-sm text-zinc-500">Chargement des activités...</div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center text-sm text-zinc-500">Aucune activité récente.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t text-zinc-700">
              <th className="py-2 text-left">Étudiant</th>
              <th className="text-left">Action</th>
              <th className="text-left">Cours</th>
              <th className="text-left">Date</th>
              <th className="text-left">Statut</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((a) => {
              const color = statusToColor(a.status);
              return (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-3 flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                      {getInitials(a.name)}
                    </span>
                    <span className="font-medium text-zinc-900">{a.name}</span>
                  </td>
                  <td className="text-zinc-700">{a.action}</td>
                  <td className="text-zinc-700">{a.context}</td>
                  <td className="text-zinc-600">{formatRelative(a.occurred_at)}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[color]}`}
                    >
                      {statusToLabel(a.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
