import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewAdminTicketForm } from "../new-ticket-form";
import Link from "@/app/components/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";

export default async function AdminNewTicketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") redirect("/dashboard");

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          New Ticket
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Create a support ticket and set how the request was received.
        </Typography>
      </Box>

      <NewAdminTicketForm />

      <Typography variant="body2" color="text.secondary">
        <MuiLink component={Link} href="/admin/tickets" underline="hover">
          View all tickets
        </MuiLink>
      </Typography>
    </Box>
  );
}

