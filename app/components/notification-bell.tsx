"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import NotificationsIcon from "@mui/icons-material/Notifications";

export type NotificationItem = { id: string; title: string; href: string };

export function NotificationBell({
  items = [],
  viewAllHref,
  count,
  emptyMessage = "No notifications",
  itemLabel = "View ticket",
  "aria-label": ariaLabel = "Notifications",
}: {
  items?: NotificationItem[];
  viewAllHref?: string;
  count?: number;
  emptyMessage?: string;
  itemLabel?: string;
  "aria-label"?: string;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={count != null && count > 0 ? `${ariaLabel} (${count} unread)` : ariaLabel}
        color="inherit"
        size="medium"
      >
        <Badge badgeContent={count ?? 0} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 280, maxWidth: 360, maxHeight: 400 } } }}
      >
        <Typography variant="subtitle2" fontWeight={600} sx={{ px: 2, py: 1.5 }}>
          Notifications
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3, textAlign: "center" }}>
            {emptyMessage}
          </Typography>
        ) : (
          items.map((item) => (
            <MenuItem
              key={item.id}
              component={Link}
              href={item.href}
              onClick={handleClose}
              sx={{ flexDirection: "column", alignItems: "flex-start", py: 1.5 }}
            >
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{ fontWeight: 500, sx: { lineClamp: 2 } }}
                secondary={itemLabel}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </MenuItem>
          ))
        )}
        {viewAllHref && items.length > 0 && (
          <MenuItem component={Link} href={viewAllHref} onClick={handleClose} sx={{ justifyContent: "center", borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="primary" fontWeight={500}>
              View all
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
