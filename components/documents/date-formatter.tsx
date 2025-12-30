"use client";

import { useState, useEffect } from "react";

interface DateFormatterProps {
  date: string | Date;
  format?: "short" | "long" | "datetime";
  className?: string;
}

export default function DateFormatter({
  date,
  format = "short",
  className = "",
}: DateFormatterProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // Format date only on client side to avoid hydration mismatch
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      setFormattedDate("-");
      return;
    }

    let formatted: string;

    switch (format) {
      case "datetime":
        formatted = dateObj.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        break;
      case "long":
        formatted = dateObj.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        break;
      case "short":
      default:
        formatted = dateObj.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        break;
    }

    setFormattedDate(formatted);
  }, [date, format]);

  return <span className={className}>{formattedDate}</span>;
}
