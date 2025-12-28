"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  isOpen,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/30",
      border: "border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      text: "text-green-800 dark:text-green-200",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      text: "text-red-800 dark:text-red-200",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: "text-amber-600 dark:text-amber-400",
      text: "text-amber-800 dark:text-amber-200",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-800 dark:text-blue-200",
    },
  };

  const style = styles[type];

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center px-4 py-6 sm:items-start sm:justify-end sm:p-6">
      <div
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        } ${style.bg} ${style.border}`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {type === "success" && (
                <svg
                  className={`h-6 w-6 ${style.icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {type === "error" && (
                <svg
                  className={`h-6 w-6 ${style.icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {type === "warning" && (
                <svg
                  className={`h-6 w-6 ${style.icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {type === "info" && (
                <svg
                  className={`h-6 w-6 ${style.icon}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${style.text}`}>{message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className={`inline-flex rounded-md hover:opacity-75 focus:outline-none ${style.icon}`}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
