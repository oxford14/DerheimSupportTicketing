"use client";

import Box from "@mui/material/Box";
import { useSidebar } from "./sidebar-context";

export function SidebarMainArea({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { collapsed } = useSidebar();
  return (
    <Box
      className={className}
      sx={{
        pl: { xs: 0, md: collapsed ? 8 : 32 },
        transition: "padding-left 0.2s ease-out",
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
}
