import type { ReactNode } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  itemLabel?: string;
  className?: string;
  rightSlot?: ReactNode;
}

const defaultOptions = [10, 15, 20, 30, 50];

export default function Pagination({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = defaultOptions,
  itemLabel = "éléments",
  className = "",
  rightSlot,
}: PaginationProps) {
  const safePage = Math.max(1, page || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);
  const start = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
  const end = totalItems === 0 ? 0 : Math.min(safePage * perPage, totalItems);

  const options = perPageOptions.includes(perPage)
    ? perPageOptions
    : [...perPageOptions, perPage].sort((a, b) => a - b);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > safeTotalPages || nextPage === safePage) return;
    onPageChange(nextPage);
  };

  return (
    <div
      className={`mt-6 flex flex-col gap-3 border-t border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
        <span>
          Affichage de {start} à {end} sur {totalItems} {itemLabel}
        </span>
        {onPerPageChange && (
          <label className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Par page</span>
            <select
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36]"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        <button
          type="button"
          onClick={() => handlePageChange(1)}
          disabled={safePage <= 1}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Premier
        </button>
        <button
          type="button"
          onClick={() => handlePageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Précédent
        </button>
        <span className="rounded-lg bg-[#008D36] px-4 py-2 text-sm font-semibold text-white shadow-sm">
          {safePage}
        </span>
        <button
          type="button"
          onClick={() => handlePageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
        </button>
        <button
          type="button"
          onClick={() => handlePageChange(safeTotalPages)}
          disabled={safePage >= safeTotalPages}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-[#00365F] transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Dernier
        </button>
        {rightSlot}
      </div>
    </div>
  );
}
