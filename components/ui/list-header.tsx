import type { ReactNode } from "react";

interface ListHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onToggleFilters?: () => void;
  filtersCount?: number;
  isFiltersOpen?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
  variant?: "green" | "blue";
}

const defaultActionIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export default function ListHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onToggleFilters,
  filtersCount = 0,
  isFiltersOpen = false,
  actionLabel,
  onAction,
  actionIcon = defaultActionIcon,
  rightSlot,
  className = "",
  variant = "green",
}: ListHeaderProps) {
  const showFilters = Boolean(onToggleFilters);
  const showAction = Boolean(onAction && actionLabel);
  const focusClasses =
    variant === "blue"
      ? "focus:border-[#00365F] focus:ring-[#00365F]"
      : "focus:border-[#008D36] focus:ring-[#008D36]";
  const filterActiveClasses =
    variant === "blue"
      ? "border-[#00365F] bg-[#00365F]/10 text-[#00365F]"
      : "border-[#008D36] bg-[#008D36]/10 text-[#008D36]";
  const badgeClasses = variant === "blue" ? "bg-[#00365F]" : "bg-[#008D36]";
  const actionClasses =
    variant === "blue"
      ? "bg-[#00365F] hover:bg-[#00365F]/90"
      : "bg-[#008D36] hover:bg-[#007A2E]";

  return (
    <div
      className={`mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${className}`}
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full min-w-0 sm:flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={`block w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-1 ${focusClasses}`}
          />
        </div>
        {showFilters && (
          <button
            type="button"
            onClick={onToggleFilters}
            className={`flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors sm:w-auto ${
              isFiltersOpen ? filterActiveClasses : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filtres
            {filtersCount > 0 && (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold text-white ${badgeClasses}`}
              >
                {filtersCount}
              </span>
            )}
          </button>
        )}
      </div>
      {rightSlot ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:justify-end lg:w-auto">
          {rightSlot}
        </div>
      ) : showAction ? (
        <button
          type="button"
          onClick={onAction}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors sm:w-auto ${actionClasses}`}
        >
          {actionIcon}
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
