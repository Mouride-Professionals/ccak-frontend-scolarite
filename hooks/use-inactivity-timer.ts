"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type InactivityConfig = {
  timeoutMs: number;
  warningMs: number;
  onTimeout: () => void;
};

const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export function useInactivityTimer({ timeoutMs, warningMs, onTimeout }: InactivityConfig) {
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const warningRef = useRef<number | null>(null);

  const resetTimers = useCallback(() => {
    if (warningRef.current) window.clearTimeout(warningRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setShowWarning(false);

    warningRef.current = window.setTimeout(() => {
      setShowWarning(true);
    }, warningMs);

    timeoutRef.current = window.setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  }, [warningMs, timeoutMs, onTimeout]);

  useEffect(() => {
    const handleActivity = () => resetTimers();
    activityEvents.forEach((event) => window.addEventListener(event, handleActivity));
    return () => {
      if (warningRef.current) window.clearTimeout(warningRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [resetTimers]);

  return { showWarning, resetTimers };
}
