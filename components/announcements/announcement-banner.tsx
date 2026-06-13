"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementsApi } from "@/lib/api/announcements";
import { sanitizeHtml } from "@/lib/sanitize";

const STORAGE_KEY = "dismissed-announcements";

export default function AnnouncementBanner() {
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return [];
    }
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const { data } = useQuery({
    queryKey: ["announcements", "banner"],
    queryFn: () =>
      announcementsApi.getAnnouncements({
        page: 1,
        per_page: 10,
        is_draft: false,
        priority: "critical",
      }),
    staleTime: 50_000,
    refetchInterval: 60_000,
  });

  const activeAnnouncements = useMemo(
    () => (data?.data ?? []).filter((announcement) => !dismissedIds.includes(announcement.id)),
    [data?.data, dismissedIds]
  );

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [activeAnnouncements.length]);

  const normalizedIndex =
    activeAnnouncements.length > 0 ? activeIndex % activeAnnouncements.length : 0;
  const current = activeAnnouncements[normalizedIndex];
  if (!current) return null;

  const dismissAnnouncement = async (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try {
      await announcementsApi.dismissAnnouncement(id);
    } catch {
      // local dismiss fallback is enough for UX continuity
    }
  };

  return (
    <div className="mb-4 rounded-lg border-l-4 border-[#E11D48] bg-[#FEF2F2] px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#E11D48]">Annonce</p>
          <h3 className="mt-1 text-sm font-semibold text-[#083B66]">{current.title}</h3>
          <div
            className="mt-1 text-sm text-zinc-700"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.content) }}
          />
          {activeAnnouncements.length > 1 && (
            <p className="mt-2 text-xs text-zinc-500">
              {normalizedIndex + 1}/{activeAnnouncements.length}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => dismissAnnouncement(current.id)}
          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white hover:text-zinc-700"
        >
          <span className="sr-only">Ignorer</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
