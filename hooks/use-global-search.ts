"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import * as searchApi from "@/lib/api/search";

export function useGlobalSearch(rawQuery: string) {
  const [debouncedQuery] = useDebounce(rawQuery.trim(), 300);
  const query = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => searchApi.globalSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 0,
    gcTime: 60_000,
    placeholderData: (prev) => prev,
  });
  return { ...query, debouncedQuery, isReady: debouncedQuery.length >= 2 };
}
