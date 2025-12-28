import Card from '@/components/ui/Card';

const statusStyles = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
} as const;

type Activity = {
  name: string;
  avatar: string;
  action: string;
  course: string;
  date: string;
  status: string;
  color: keyof typeof statusStyles;
};

const activities: Activity[] = [
  {
    name: 'Sokhna Anta',
    avatar: '🧑🏽‍🎓',
    action: 'Inscription',
    course: 'Mathématiques L3',
    date: 'Il y a 2h',
    status: 'Validé',
    color: 'green',
  },
  {
    name: 'Serigne Cheikh',
    avatar: '👨🏽‍🎓',
    action: 'Note ajoutée',
    course: 'Physique M1',
    date: 'Il y a 4h',
    status: 'Traité',
    color: 'blue',
  },
  {
    name: 'Modou GUEYE',
    avatar: '👤',
    action: 'Demande changement',
    course: 'Informatique L2',
    date: 'Il y a 6h',
    status: 'En attente',
    color: 'yellow',
  },
];

export default function RecentActivitiesTable() {
  return (
    <Card title="Activités Récentes">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 border-t">
            <th className="py-2 text-left">Étudiant</th>
            <th className="text-left">Action</th>
            <th className="text-left">Cours</th>
            <th className="text-left">Date</th>
            <th className="text-left">Statut</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((a, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-3 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full">
                  {a.avatar}
                </span>
                <span className="font-medium">{a.name}</span>
              </td>
              <td className="text-slate-600">{a.action}</td>
              <td className="text-slate-600">{a.course}</td>
              <td className="text-slate-500">{a.date}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${ statusStyles[a.color]}`}
                >
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
