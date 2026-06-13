import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HierarchyBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function HierarchyBreadcrumb({ items }: HierarchyBreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <svg
                className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {isLast ? (
              <span className="font-medium text-zinc-900">{item.label}</span>
            ) : (
              <Link
                href={item.href ?? "#"}
                className="text-zinc-500 transition-colors hover:text-[#00365F]"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
