import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

type UserRow = {
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

export function UsersTable({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
        No users yet.
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: "action.hover" }}>
          <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
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
            <TableCell color="text.secondary">{new Date(u.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
