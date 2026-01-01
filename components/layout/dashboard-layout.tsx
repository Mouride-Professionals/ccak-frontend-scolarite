"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        {/* Page Content */}
        <main className="mt-16 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
