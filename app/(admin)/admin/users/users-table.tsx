"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/actions/admin";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { EditUserDialog } from "./edit-user-dialog";

export type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

const ROLE_LABEL: Record<string, string> = {
  employee: "Employee",
  agent: "Agent",
  admin: "Admin",
};

const roleColor: Record<string, "default" | "primary" | "secondary"> = {
  admin: "secondary",
  agent: "primary",
  employee: "default",
};

type UsersTableProps = {
  users: UserRow[];
  isAdmin: boolean;
  currentUserId: string | null;
};

export function UsersTable({ users, isAdmin, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleDelete(user: UserRow) {
    if (!isAdmin) return;
    if (user.id === currentUserId) return;
    const ok = window.confirm(
      `Delete user "${user.email}"? This cannot be undone. Users who created tickets cannot be deleted.`
    );
    if (!ok) return;
    setDeletingId(user.id);
    const result = await deleteUser(user.id);
    setDeletingId(null);
    if (result.error) {
      alert(result.error);
      return;
    }
    refresh();
  }

  if (users.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
        No users yet.
      </Typography>
    );
  }

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
            {isAdmin && (
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{u.email}</TableCell>
              <TableCell color="text.secondary">{u.full_name ?? "—"}</TableCell>
              <TableCell>
                <Chip
                  label={ROLE_LABEL[u.role] ?? u.role}
                  size="small"
                  color={roleColor[u.role] ?? "default"}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </TableCell>
              <TableCell color="text.secondary">
                {new Date(u.created_at).toLocaleDateString()}
              </TableCell>
              {isAdmin && (
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      aria-label="Edit user"
                      onClick={() => setEditUser(u)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Delete user"
                      onClick={() => handleDelete(u)}
                      disabled={u.id === currentUserId || deletingId === u.id}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editUser && (
        <EditUserDialog
          user={editUser}
          open={true}
          onClose={() => setEditUser(null)}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
