"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFacultyMembersList } from "@/hooks/use-faculty-members-management";
import type { FacultyMember } from "@/types/academic";

interface FacultySearchProps {
  value?: string;
  onSelect: (faculty: FacultyMember) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  minQueryLength?: number;
}

export default function FacultySearch({
  value = "",
  onSelect,
  onClear,
  placeholder = "Rechercher un enseignant...",
  disabled = false,
  minQueryLength = 2,
}: FacultySearchProps) {
  const [query, setQuery] = useState(value);
  const [debouncedQuery, setDebouncedQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const { data, isLoading } = useFacultyMembersList(
    {
      page: 1,
      limit: 10,
      search: debouncedQuery || undefined,
    },
    { enabled: debouncedQuery.length >= minQueryLength && !disabled }
  );

  const { data: fallbackData, isLoading: isLoadingFallback } = useFacultyMembersList(
    {
      page: 1,
      limit: 100,
    },
    { enabled: debouncedQuery.length >= minQueryLength && !disabled }
  );

  const results = useMemo(() => {
    const primaryResults = data?.data ?? [];
    if (primaryResults.length > 0) {
      return primaryResults;
    }

    const term = debouncedQuery.trim().toLowerCase();
    if (!term) return [];

    return (fallbackData?.data ?? []).filter((member) => {
      const haystack = [
        member.full_name,
        member.staff_number,
        member.department?.name,
        member.department?.code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [data?.data, fallbackData?.data, debouncedQuery]);

  const handleSelect = (faculty: FacultyMember) => {
    setQuery(faculty.full_name);
    setIsOpen(false);
    onSelect(faculty);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            setIsOpen(true);
            setActiveIndex(0);
            if (value && nextValue !== value) {
              onClear?.();
            } else if (!nextValue.trim()) {
              onClear?.();
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-[#008D36] focus:outline-none focus:ring-1 focus:ring-[#008D36] disabled:cursor-not-allowed disabled:bg-zinc-100"
        />
      </div>

      {isOpen && debouncedQuery.length >= minQueryLength && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-200 bg-white shadow-lg">
          {isLoading || isLoadingFallback ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Recherche...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Aucun résultat</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-2">
              {results.map((faculty, index) => (
                <li key={faculty.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(faculty)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                      index === activeIndex
                        ? "bg-[#00365F]/10 text-[#00365F]"
                        : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="font-medium">{faculty.full_name}</span>
                    <span className="text-xs text-zinc-500">
                      {faculty.staff_number || "—"} · {faculty.department?.name || "—"} ·{" "}
                      {faculty.department?.code || "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
