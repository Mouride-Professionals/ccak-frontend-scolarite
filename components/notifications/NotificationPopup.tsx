"use client";

import React, { useEffect, useRef, useState } from "react";
import NotificationList from "./NotificationList";

const NotificationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupId = "notification-popup";

  // Pour le test : true affiche le point rouge, false le cache.
  const hasNewNotifications = true;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={popupId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-[#00365F] transition-colors hover:bg-zinc-100"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {hasNewNotifications && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer les notifications"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          />
          <div
            id={popupId}
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:p-0"
          >
            <NotificationList className="max-h-[70vh] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl sm:max-h-[28rem] sm:w-80 sm:rounded-lg" />
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPopup;
