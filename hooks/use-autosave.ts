"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 3000,
  enabled = true,
}: UseAutosaveOptions<T>) {
  const initialRender = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debouncedSave = useDebouncedCallback(async () => {
    if (!enabled) return;

    setIsSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, delay);

  useEffect(() => {
    if (!enabled) return;
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    debouncedSave();
  }, [data, enabled, debouncedSave]);

  const triggerSave = async () => {
    await debouncedSave.flush();
  };

  return {
    isSaving,
    lastSaved,
    triggerSave,
  };
}
