import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "@/app/components/Link";
import { getMyTickets } from "@/lib/actions/tickets";
import { Pagination } from "@/app/components/pagination";
import { TicketListWithModal } from "../ticket-list-with-modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

const PAGE_SIZE = 10;

export default async function MyTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const result = await getMyTickets(undefined, undefined, { page, pageSize: PAGE_SIZE });
  const tickets = Array.isArray(result) ? result : result.tickets;
  const totalCount = Array.isArray(result) ? result.length : result.totalCount;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: { sm: "space-between" }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            My Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            View and manage your submitted support tickets.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/dashboard/new-ticket"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ flexShrink: 0 }}
        >
          New ticket
        </Button>
      </Box>

      <TicketListWithModal tickets={tickets} />
      <Pagination
        currentPage={page}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        pageParam="page"
      />
    </Box>
  );
}
