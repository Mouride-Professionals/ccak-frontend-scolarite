"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as studentsApi from "@/lib/api/students";
import type { Student } from "@/types/student";

interface StudentSearchProps {
  value?: string;
  onSelect: (student: Student) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  minQueryLength?: number;
}

export default function StudentSearch({
  value = "",
  onSelect,
  onClear,
  placeholder = "Rechercher un étudiant...",
  disabled = false,
  minQueryLength = 2,
}: StudentSearchProps) {
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
    setDebouncedQuery(value.trim());
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

  const { data, isLoading } = useQuery({
    queryKey: ["students", "search", debouncedQuery],
    queryFn: () =>
      studentsApi.getStudents({
        page: 1,
        limit: 10,
        search: debouncedQuery || undefined,
      }),
    enabled: !disabled && debouncedQuery.length >= minQueryLength,
    staleTime: 30_000,
  });

  const results = data?.data ?? [];
  const canShowResults = !disabled && isOpen && debouncedQuery.length >= minQueryLength;

  const handleSelect = (student: Student) => {
    setQuery(`${student.full_name} · ${student.student_number}`);
    setIsOpen(false);
    onSelect(student);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!canShowResults || results.length === 0) return;

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
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
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

      {canShowResults && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-zinc-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Recherche...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-500">Aucun résultat</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-2">
              {results.map((student, index) => (
                <li key={student.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(student)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                      index === activeIndex
                        ? "bg-[#00365F]/10 text-[#00365F]"
                        : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="font-medium">{student.full_name}</span>
                    <span className="text-xs text-zinc-500">{student.student_number}</span>
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
