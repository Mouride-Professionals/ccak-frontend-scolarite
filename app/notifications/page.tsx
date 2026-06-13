"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import NotificationListInfinite from "@/components/notifications/notification-list-infinite";
import NotificationDetailModal from "@/components/notifications/notification-detail-modal";
import type { Notification } from "@/lib/api/notifications";

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  return (
    <DashboardLayout title="Notifications">
      <div className="mx-auto max-w-5xl">
        <NotificationListInfinite
          unreadOnly={false}
          onSelectNotification={(notification) => setSelectedNotification(notification)}
        />
      </div>

      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
      />
    </DashboardLayout>
  );
}
