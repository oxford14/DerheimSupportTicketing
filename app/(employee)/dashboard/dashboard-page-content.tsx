"use client";

import { TicketListWithModal } from "./ticket-list-with-modal";
import { DashboardDateFilter } from "./dashboard-date-filter";
import { Suspense } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export type TicketRow = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  created_at: string;
};

type DashboardPageContentProps = {
  tickets: TicketRow[];
  ticketIdsWithReplies: string[];
  counts: { open: number; closed: number };
  dateFrom?: string;
  dateTo?: string;
};

export function DashboardPageContent({
  tickets,
  ticketIdsWithReplies,
  counts,
  dateFrom,
  dateTo,
}: DashboardPageContentProps) {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: { sm: "space-between" }, gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            View your tickets and their statuses.
          </Typography>
        </Box>
        <Suspense fallback={<Box sx={{ height: 40 }} />}>
          <DashboardDateFilter dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Open tickets
          </Typography>
          <Typography variant="h4" fontWeight={600} mt={0.5}>
            {counts.open}
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Closed tickets
          </Typography>
          <Typography variant="h4" fontWeight={600} mt={0.5}>
            {counts.closed}
          </Typography>
        </Paper>
      </Box>

      <section id="notifications">
        <TicketListWithModal tickets={tickets} ticketIdsWithReplies={ticketIdsWithReplies} />
      </section>
    </Box>
  );
}
