"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/app/components/sidebar-context";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";

const drawerWidth = 256;
const drawerWidthCollapsed = 64;

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/admin/tickets", label: "Tickets", icon: <ConfirmationNumberIcon /> },
  { href: "/admin/my-tickets", label: "My Tickets", icon: <PersonIcon /> },
  { href: "/admin/users", label: "Users", icon: <GroupIcon /> },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed } = useSidebar();

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          height: 56,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          px: collapsed ? 0 : 2,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        {collapsed ? (
          <Typography fontWeight={700} variant="body1" title="Derheim Support">
            DS
          </Typography>
        ) : (
          <Typography fontWeight={700} variant="body1" noWrap>
            Derheim Support
          </Typography>
        )}
      </Box>
      <List sx={{ flex: 1, py: 1, px: 1 }}>
        {!collapsed && (
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ px: 1.5, py: 0.5, display: "block" }}>
            Admin
          </Typography>
        )}
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={closeMobile}
                selected={active}
                sx={{
                  borderRadius: 1,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 0 : 1.5,
                  py: 1.25,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": { color: "inherit" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 40, color: active ? "inherit" : "action.active" }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ borderTop: 1, borderColor: "divider", p: 1.5, textAlign: collapsed ? "center" : "left" }}>
        {collapsed ? (
          <Typography variant="caption" color="text.secondary" title="Admin panel">
            AP
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary" noWrap title="Admin panel">
            Admin panel
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: 0,
            left: 0,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: collapsed ? drawerWidthCollapsed : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? drawerWidthCollapsed : drawerWidth,
            boxSizing: "border-box",
            top: 0,
            left: 0,
            transition: "width 0.2s ease-out",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
