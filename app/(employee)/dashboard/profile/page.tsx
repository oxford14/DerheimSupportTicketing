import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default async function DashboardProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as { name?: string };
  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Profile
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Name
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {user.name ?? "—"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Email
        </Typography>
        <Typography variant="body1">{session.user.email}</Typography>
      </Paper>
    </Box>
  );
}
