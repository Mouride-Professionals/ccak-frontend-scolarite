"use client";

import { useQuery } from "@tanstack/react-query";
import * as degreeCyclesApi from "@/lib/api/degree-cycles";

export const degreeCycleKeys = {
  all: ["degree-cycles"] as const,
  list: () => [...degreeCycleKeys.all, "list"] as const,
};

export function useDegreeCycles() {
  return useQuery({
    queryKey: degreeCycleKeys.list(),
    queryFn: degreeCyclesApi.getDegreeCycles,
    staleTime: 5 * 60 * 1000,
  });
}
