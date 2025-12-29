interface Props {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: Props) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
