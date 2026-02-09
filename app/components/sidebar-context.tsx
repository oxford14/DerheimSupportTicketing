"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

type SidebarContextValue = {
  /** On mobile: sidebar overlay open */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** On tablet/desktop: sidebar collapsed to icons only */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Toggle mobile overlay on small screens, toggle collapsed on desktop */
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"), { noSsr: true });

  const toggle = useCallback(() => {
    if (isDesktop) {
      setCollapsed((c) => !c);
    } else {
      setMobileOpen((o) => !o);
    }
  }, [isDesktop]);

  const value: SidebarContextValue = {
    mobileOpen,
    setMobileOpen,
    collapsed,
    setCollapsed,
    toggle,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
