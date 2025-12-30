"use client";

import Sidebar from "./sidebar";
import Navbar from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#DAE4EB]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-[230px]">
        {/* Navbar */}
        <Navbar title={title} />

        {/* Page Content */}
        <main className="mt-16 p-8">{children}</main>
      </div>
    </div>
  );
}
