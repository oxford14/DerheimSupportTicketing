"use client";

import type { NotificationItem } from "@/app/components/notification-bell";
import { NotificationBell } from "@/app/components/notification-bell";
import { UserProfileMenu } from "@/app/components/user-profile-menu";
import { useSidebar } from "@/app/components/sidebar-context";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

export function AdminHeader({
  userEmail,
  userName,
  profileHref = "/admin/profile",
  notificationCount,
  notificationItems = [],
}: {
  userEmail: string;
  userName?: string;
  profileHref?: string;
  notificationCount?: number;
  notificationItems?: NotificationItem[];
}) {
  const { toggle } = useSidebar();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 3 } }}>
        <IconButton edge="start" onClick={toggle} aria-label="Toggle sidebar" color="inherit" size="medium">
          <MenuIcon />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <NotificationBell
            items={notificationItems}
            viewAllHref="/admin/tickets"
            count={notificationCount}
            emptyMessage="No open tickets"
            itemLabel="Open ticket"
          />
          <UserProfileMenu userEmail={userEmail} userName={userName} profileHref={profileHref} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
