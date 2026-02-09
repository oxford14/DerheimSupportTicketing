"use client";

import { EmployeeSidebar } from "./employee-sidebar";
import { EmployeeHeader } from "./employee-header";
import { RealtimeNotificationSync } from "@/app/components/realtime-notification-sync";
import { SidebarProvider } from "@/app/components/sidebar-context";
import { SidebarMainArea } from "@/app/components/sidebar-main-area";
import Box from "@mui/material/Box";

export type NotificationItem = { id: string; title: string; href: string };

type DashboardShellProps = {
  userEmail: string;
  userName?: string | null;
  notificationCount: number;
  notificationItems: NotificationItem[];
  children: React.ReactNode;
};

export function DashboardShell({
  userEmail,
  userName,
  notificationCount,
  notificationItems,
  children,
}: DashboardShellProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <RealtimeNotificationSync />
      <SidebarProvider>
        <EmployeeSidebar />
        <SidebarMainArea>
          <EmployeeHeader
            userEmail={userEmail}
            userName={userName ?? undefined}
            profileHref="/dashboard/profile"
            notificationCount={notificationCount}
            notificationItems={notificationItems}
          />
          <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
            {children}
          </Box>
        </SidebarMainArea>
      </SidebarProvider>
    </Box>
  );
}
