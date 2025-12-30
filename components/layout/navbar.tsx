"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import NotificationList from "@/components/notifications/NotificationList";

import ConfirmDialog from "@/components/ui/confirm-dialog";

// 👇 1. On importe ton composant ici
import NotificationPopup from "@/components/notifications/NotificationPopup";

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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
    <nav className="fixed left-[230px] right-0 top-0 z-30 h-16 border-b border-zinc-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#00365F]">{title}</h1>

        {/* User Info & Notifications */}
        <div className="flex items-center gap-4">
          {/* Notification Popup */}
          <NotificationPopup />

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 rounded-lg transition-colors hover:bg-zinc-50 px-2 py-1"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-[#00365F]">{userName}</p>
                <p className="text-xs text-zinc-500">{userEmail}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00365F] text-sm font-semibold text-white">
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
