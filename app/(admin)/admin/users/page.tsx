import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllUsers } from "@/lib/actions/admin";
import { UsersTable } from "./users-table";
import { CreateUserForm } from "./create-user-form";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "admin";

  const users = await getAllUsers();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Users
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage employee and agent accounts
        </Typography>
      </Box>

      {isAdmin && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={1} sx={{ display: "block", mb: 2 }}>
            Add user
          </Typography>
          <CreateUserForm />
        </Paper>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={1}>
            All users
          </Typography>
        </Box>
        <UsersTable users={users} isAdmin={isAdmin} currentUserId={session?.user?.id ?? null} />
      </Paper>
    </Box>
  );
}
