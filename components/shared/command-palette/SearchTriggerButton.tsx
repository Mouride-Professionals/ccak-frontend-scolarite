"use client";

import { Search } from "lucide-react";
import { useCommandPaletteStore } from "@/stores/command-palette-store";

export default function SearchTriggerButton() {
  const open = useCommandPaletteStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-100"
    >
      <Search className="h-3.5 w-3.5" />
      <span>Rechercher...</span>
      <kbd className="ml-1 rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-medium text-zinc-500">
        ⌘K
      </kbd>
    </button>
  );
}
