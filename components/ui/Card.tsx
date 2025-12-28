interface CardProps {
  title: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export default function Card({ title, children, rightSlot }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">
          {title}
        </h3>
        {rightSlot && rightSlot}
      </div>
      {children}
    </div>
  );
}
