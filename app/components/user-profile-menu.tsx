"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

export function UserProfileMenu({
  userName,
  userEmail,
  profileHref = "/profile",
}: {
  userName?: string | null;
  userEmail: string;
  profileHref?: string;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const initial = userName
    ? userName.trim().slice(0, 1).toUpperCase()
    : userEmail.trim().slice(0, 1).toUpperCase();

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
        aria-label="User menu"
        color="inherit"
        size="small"
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.875rem" }}>
          {initial}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", pb: 1.5, mb: 1 }}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {userName ?? userEmail}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap title={userEmail} display="block">
            {userEmail}
          </Typography>
        </Box>
        <MenuItem component={Link} href={profileHref} onClick={handleClose}>
          <ListItemText primary="View Profile" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            signOut({ callbackUrl: "/login" });
          }}
        >
          <ListItemText primary="Sign out" />
        </MenuItem>
      </Menu>
    </>
  );
}
