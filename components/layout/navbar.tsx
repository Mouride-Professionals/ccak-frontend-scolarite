"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import NotificationPopup from "@/components/notifications/NotificationPopup";
import { useAcademicYears } from "@/hooks/use-academic-years";
import { useSelectedYear } from "@/hooks/use-selected-year";
import type { AcademicYear } from "@/types/academic-year";

interface NavbarProps {
  title: string;
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

function YearOption({
  year,
  isSelected,
  isCurrent,
  onSelect,
}: {
  year: AcademicYear;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 ${
        isSelected ? "bg-zinc-50 font-medium" : ""
      }`}
    >
      {isCurrent ? (
        <span className="h-2 w-2 rounded-full bg-green-500" />
      ) : (
        <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )}
      <span className={isCurrent ? "text-[#00365F]" : "text-zinc-600"}>{year.name}</span>
      {isSelected && (
        <svg className="ml-auto h-3.5 w-3.5 text-[#00365F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar({ title, onMenuToggle, isSidebarOpen }: NavbarProps) {
  const { data: session } = useSession();
  const { selectedYear, isReadOnly, setSelectedYear, currentYearId } = useSelectedYear();
  const { data: yearsResponse } = useAcademicYears({ limit: 50 });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const yearMenuRef = useRef<HTMLDivElement>(null);

  const allYears = yearsResponse?.data ?? [];
  const currentYears = allYears.filter((y) => y.id === currentYearId);
  const archivedYears = allYears
    .filter((y) => y.id !== currentYearId)
    .sort((a, b) => {
      const dateA = a.start_date ?? a.name;
      const dateB = b.start_date ?? b.name;
      return dateB.localeCompare(dateA);
    });

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (yearMenuRef.current && !yearMenuRef.current.contains(event.target as Node)) {
        setShowYearMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = session?.user?.name || "Utilisateur";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore storage errors
      }
      // Get Keycloak configuration from environment
      const keycloakBaseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL;
      const keycloakRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;

      // Build Keycloak logout URL if idToken is available
      if (keycloakBaseUrl && keycloakRealm && session?.idToken) {
        const redirectUri = `${window.location.origin}/login`;
        const keycloakLogoutUrl = `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout?id_token_hint=${session.idToken}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;

        // Sign out from NextAuth first
        await signOut({ redirect: false });

        // Then redirect to Keycloak logout
        window.location.href = keycloakLogoutUrl;
      } else {
        // Fallback to simple NextAuth logout
        await signOut({ callbackUrl: "/login" });
      }
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-zinc-200 bg-white md:left-[230px]">
      <div className="flex h-full items-center justify-between px-4 md:px-8">
        {/* Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={isSidebarOpen ?? false}
            onClick={onMenuToggle}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-[#00365F] shadow-sm transition hover:bg-zinc-50 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-[#00365F] md:text-2xl">{title}</h1>
        </div>

        {/* Year Switcher */}
        {selectedYear && (
          <div className="relative hidden sm:block" ref={yearMenuRef}>
            <button
              type="button"
              onClick={() => setShowYearMenu((v) => !v)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                isReadOnly
                  ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
              }`}
            >
              {isReadOnly ? (
                <svg className="h-3.5 w-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <span className="h-2 w-2 rounded-full bg-green-500" />
              )}
              <span className={`font-medium ${isReadOnly ? "text-amber-700" : "text-[#00365F]"}`}>
                {selectedYear.name}
              </span>
              <svg className={`h-3.5 w-3.5 ${isReadOnly ? "text-amber-500" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showYearMenu && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg">
                {currentYears.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Année en cours
                    </div>
                    {currentYears.map((year) => (
                      <YearOption
                        key={year.id}
                        year={year}
                        isSelected={selectedYear.id === year.id}
                        isCurrent
                        onSelect={() => { setSelectedYear(year); setShowYearMenu(false); }}
                      />
                    ))}
                  </>
                )}
                {archivedYears.length > 0 && (
                  <>
                    <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 ${currentYears.length > 0 ? "border-t border-zinc-100" : ""}`}>
                      Années archivées
                    </div>
                    {archivedYears.map((year) => (
                      <YearOption
                        key={year.id}
                        year={year}
                        isSelected={selectedYear.id === year.id}
                        isCurrent={false}
                        onSelect={() => { setSelectedYear(year); setShowYearMenu(false); }}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Info & Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Popup */}
          <NotificationPopup />

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-50"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-[#00365F]">{userName}</p>
                <p className="text-xs text-zinc-500">{userEmail}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00365F] text-sm font-semibold text-white sm:h-10 sm:w-10">
                {userInitials}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg">
                <div className="border-b border-zinc-200 px-4 py-3">
                  <p className="text-sm font-medium text-zinc-900">{userName}</p>
                  <p className="text-xs text-zinc-500">{userEmail}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowLogoutDialog(true);
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Confirmation de déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </nav>
  );
}
