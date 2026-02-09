import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAllTickets, getAgents } from "@/lib/actions/admin";
import { Pagination } from "@/app/components/pagination";
import { TicketsFilters } from "./tickets-filters";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

const TicketsTable = dynamic(() => import("./tickets-table").then((m) => ({ default: m.TicketsTable })), {
  ssr: true,
  loading: () => <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />,
});

const PAGE_SIZE = 10;

type SearchParams = { status?: string; priority?: string; from?: string; to?: string; range?: string; page?: string };

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const hasDateParams = params.from && params.to;
  const hasRangeAll = params.range === "all";
  if (!hasDateParams && !hasRangeAll) {
    const today = todayYYYYMMDD();
    const q = new URLSearchParams({ from: today, to: today });
    if (params.status) q.set("status", params.status);
    if (params.priority) q.set("priority", params.priority);
    redirect(`/admin/tickets?${q.toString()}`);
  }

  const dateFrom = hasRangeAll ? undefined : params.from;
  const dateTo = hasRangeAll ? undefined : params.to;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [ticketsResult, agents] = await Promise.all([
    getAllTickets({
      status: params.status,
      priority: params.priority,
      dateFrom,
      dateTo,
      page,
      pageSize: PAGE_SIZE,
    }),
    getAgents(),
  ]);

  const tickets = Array.isArray(ticketsResult) ? ticketsResult : ticketsResult.tickets;
  const totalCount = Array.isArray(ticketsResult) ? tickets.length : ticketsResult.totalCount;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Tickets
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Manage and assign support tickets
        </Typography>
      </Box>
      <Suspense fallback={<Box sx={{ height: 40 }} />}>
        <TicketsFilters
          currentStatus={params.status}
          currentPriority={params.priority}
          dateFrom={dateFrom}
          dateTo={dateTo}
          rangeAll={hasRangeAll}
        />
      </Suspense>
      <TicketsTable tickets={tickets} agents={agents} />
      <Suspense fallback={null}>
        <Pagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          pageParam="page"
        />
      </Suspense>
    </Box>
  );
}
