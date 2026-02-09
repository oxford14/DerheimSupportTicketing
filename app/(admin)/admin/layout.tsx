import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotificationTicketsForAdmin } from "@/lib/actions/admin";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { RealtimeNotificationSync } from "@/app/components/realtime-notification-sync";
import { SidebarProvider } from "@/app/components/sidebar-context";
import { SidebarMainArea } from "@/app/components/sidebar-main-area";
import Box from "@mui/material/Box";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const notificationTickets = await getNotificationTicketsForAdmin();
  const notificationCount = notificationTickets.length;
  const notificationItems = notificationTickets.map((t) => ({
    id: t.id,
    title: t.title,
    href: `/admin/tickets/${t.id}`,
  }));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <RealtimeNotificationSync />
      <SidebarProvider>
        <AdminSidebar />
        <SidebarMainArea>
          <AdminHeader
            userEmail={session?.user?.email ?? ""}
            userName={(session?.user as { name?: string })?.name ?? undefined}
            profileHref="/admin/profile"
            notificationCount={notificationCount}
            notificationItems={notificationItems}
          />
          <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
        </SidebarMainArea>
      </SidebarProvider>
    </Box>
  );
}
