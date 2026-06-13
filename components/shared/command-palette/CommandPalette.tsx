"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { useGlobalSearch } from "@/hooks/use-global-search";
import type { SearchResultItem, SearchResultType } from "@/types/search";
import SearchSkeleton from "./SearchSkeleton";
import SearchResultGroup from "./SearchResultGroup";

const TYPE_ORDER: SearchResultType[] = [
  "student",
  "faculty_member",
  "course",
  "course_unit",
  "academic_program",
  "department",
  "faculty",
  "exam_session",
];

function groupResults(results: SearchResultItem[]): [SearchResultType, SearchResultItem[]][] {
  const map = new Map<SearchResultType, SearchResultItem[]>();
  for (const item of results) {
    const group = map.get(item.type) ?? [];
    group.push(item);
    map.set(item.type, group);
  }
  return TYPE_ORDER.filter((t) => map.has(t)).map((t) => [t, map.get(t)!]);
}

export default function CommandPalette() {
  const router = useRouter();
  const { isOpen, open, close } = useCommandPaletteStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isFetching, isReady } = useGlobalSearch(query);

  const allResults = data?.results ?? [];
  const groups = groupResults(allResults);

  // Flat ordered list of all result ids for keyboard navigation
  const flatIds = allResults.map((r) => r.id);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveId(null);
      // Focus input after animation frame so dialog is mounted
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Reset active id when results change
  useEffect(() => {
    setActiveId(null);
  }, [data]);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      router.push(item.url_hint);
      close();
    },
    [router, close]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatIds.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveId((prev) => {
        const idx = prev ? flatIds.indexOf(prev) : -1;
        return flatIds[Math.min(idx + 1, flatIds.length - 1)];
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveId((prev) => {
        const idx = prev ? flatIds.indexOf(prev) : flatIds.length;
        return flatIds[Math.max(idx - 1, 0)];
      });
    } else if (e.key === "Enter" && activeId) {
      e.preventDefault();
      const item = allResults.find((r) => r.id === activeId);
      if (item) handleSelect(item);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(v) => !v && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={handleKeyDown}
          className="fixed left-1/2 top-[10vh] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border border-zinc-200 bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Title className="sr-only">Recherche globale</DialogPrimitive.Title>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un étudiant, cours, programme..."
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 hover:bg-zinc-300 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Results area */}
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto py-2">
            {!isReady && (
              <p className="px-4 py-6 text-center text-sm text-zinc-400">
                Saisissez au moins 2 caractères...
              </p>
            )}

            {isReady && isFetching && allResults.length === 0 && <SearchSkeleton />}

            {isReady && !isFetching && data && data.total === 0 && (
              <p className="px-4 py-6 text-center text-sm text-zinc-400">
                Aucun résultat pour{" "}
                <span className="font-medium text-zinc-700">&ldquo;{data.query}&rdquo;</span>
              </p>
            )}

            {groups.length > 0 && (
              <div className="space-y-2">
                {groups.map(([type, items]) => (
                  <SearchResultGroup
                    key={type}
                    type={type}
                    items={items}
                    activeId={activeId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-zinc-100 px-4 py-2 text-xs text-zinc-400">
            <span>
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 font-mono text-zinc-500">
                ↑↓
              </kbd>{" "}
              naviguer
            </span>
            <span>
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 font-mono text-zinc-500">
                ↵
              </kbd>{" "}
              sélectionner
            </span>
            <span>
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 font-mono text-zinc-500">
                Esc
              </kbd>{" "}
              fermer
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
