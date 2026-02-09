import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewTicketForm } from "../new-ticket-form";
import Link from "@/app/components/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";

export default async function NewTicketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          New Ticket
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Submit a new support ticket. We&apos;ll get back to you as soon as possible.
        </Typography>
      </Box>

      <NewTicketForm />

      <Typography variant="body2" color="text.secondary">
        <MuiLink component={Link} href="/dashboard/my-tickets" underline="hover">
          View your tickets
        </MuiLink>
      </Typography>
    </Box>
  );
}
