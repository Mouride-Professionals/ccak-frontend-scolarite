"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import AnnouncementBanner from "@/components/announcements/announcement-banner";
import { useIsReadOnly } from "@/hooks/use-selected-year";
import { useSelectedYearStore } from "@/stores/selected-year-store";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isReadOnly = useIsReadOnly();
  const selectedYear = useSelectedYearStore((s) => s.selectedYear);

  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#DAE4EB]">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={handleCloseSidebar}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Content */}
      <div className="md:ml-[230px]">
        {/* Navbar */}
        <Navbar title={title} onMenuToggle={handleToggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Read-only banner */}
        {isReadOnly && selectedYear && (
          <div className="fixed left-0 right-0 top-16 z-20 flex items-center gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 md:left-[230px]">
            <svg
              className="h-4 w-4 shrink-0 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>
              Vous consultez l&apos;année <strong>{selectedYear.name}</strong> (archivée) —{" "}
              <span className="font-medium">Mode lecture seule.</span> Les exports restent
              disponibles.
            </span>
          </div>
        )}

        {/* Page Content */}
        <main className={`p-4 md:p-8 ${isReadOnly ? "mt-24" : "mt-16"}`}>
          <AnnouncementBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
