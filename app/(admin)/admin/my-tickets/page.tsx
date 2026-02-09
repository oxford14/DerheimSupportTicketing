import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getTicketsAssignedToMe, getAgents } from "@/lib/actions/admin";
import { TicketsFilters } from "../tickets/tickets-filters";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

const TicketsTable = dynamic(() => import("../tickets/tickets-table").then((m) => ({ default: m.TicketsTable })), {
  ssr: true,
  loading: () => <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />,
});

type SearchParams = { status?: string; priority?: string; from?: string; to?: string; range?: string };

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminMyTicketsPage({
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
    redirect(`/admin/my-tickets?${q.toString()}`);
  }

  const dateFrom = hasRangeAll ? undefined : params.from;
  const dateTo = hasRangeAll ? undefined : params.to;

  const [tickets, agents] = await Promise.all([
    getTicketsAssignedToMe({
      status: params.status,
      priority: params.priority,
      dateFrom,
      dateTo,
    }),
    getAgents(),
  ]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          My Tickets
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Tickets assigned to you
        </Typography>
      </Box>
      <Suspense fallback={<Box sx={{ height: 40 }} />}>
        <TicketsFilters
          basePath="/admin/my-tickets"
          currentStatus={params.status}
          currentPriority={params.priority}
          dateFrom={dateFrom}
          dateTo={dateTo}
          rangeAll={hasRangeAll}
        />
      </Suspense>
      <TicketsTable tickets={tickets} agents={agents} />
    </Box>
  );
}
