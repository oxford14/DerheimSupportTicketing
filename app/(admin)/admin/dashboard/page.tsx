import Link from "@/app/components/Link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getTicketStats, getAllTickets } from "@/lib/actions/admin";
import { PRIORITY_LABEL, STATUS_LABEL, getPriorityChipColor, getStatusChipColor } from "@/lib/priority-status-styles";
import { AdminDashboardDateFilter } from "./admin-dashboard-date-filter";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";

function todayYYYYMMDD() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; range?: string }>;
}) {
  const params = await searchParams;

  const hasDateParams = params.from && params.to;
  const hasRangeAll = params.range === "all";
  if (!hasDateParams && !hasRangeAll) {
    redirect(`/admin/dashboard?from=${todayYYYYMMDD()}&to=${todayYYYYMMDD()}`);
  }

  const dateFrom = hasRangeAll ? undefined : params.from;
  const dateTo = hasRangeAll ? undefined : params.to;

  const [stats, recentTicketsResult] = await Promise.all([
    getTicketStats(dateFrom, dateTo),
    getAllTickets(dateFrom || dateTo ? { dateFrom, dateTo } : undefined),
  ]);

  const recentTickets = Array.isArray(recentTicketsResult) ? recentTicketsResult : recentTicketsResult?.tickets ?? [];
  const recent = recentTickets.slice(0, 8);

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">You don&apos;t have access to the dashboard.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: { sm: "space-between" }, gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Overview of support tickets
          </Typography>
        </Box>
        <Suspense fallback={<Box sx={{ height: 40 }} />}>
          <AdminDashboardDateFilter dateFrom={dateFrom} dateTo={dateTo} rangeAll={hasRangeAll} />
        </Suspense>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }, gap: 2 }}>
        <StatCard label="Total tickets" value={stats.total} href="/admin/tickets" />
        <StatCard label="Open" value={stats.byStatus.open} href="/admin/tickets?status=open" accent="open" />
        <StatCard label="In progress" value={stats.byStatus.in_progress} href="/admin/tickets?status=in_progress" accent="progress" />
        <StatCard label="Resolved" value={stats.byStatus.resolved} href="/admin/tickets?status=resolved" accent="resolved" />
        <StatCard label="Urgent" value={stats.byPriority.urgent} href="/admin/tickets?priority=urgent" accent="urgent" />
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={1} sx={{ display: "block", mb: 2 }}>
          By priority
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
          <PriorityBar label="Low" count={stats.byPriority.low} total={stats.total} />
          <PriorityBar label="Medium" count={stats.byPriority.medium} total={stats.total} />
          <PriorityBar label="High" count={stats.byPriority.high} total={stats.total} />
          <PriorityBar label="Urgent" count={stats.byPriority.urgent} total={stats.total} accent />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={1}>
            Recent tickets
          </Typography>
          <MuiLink component={Link} href="/admin/tickets" underline="hover" variant="body2" fontWeight={500}>
            View all
          </MuiLink>
        </Box>
        {recent.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
            No tickets yet.
          </Typography>
        ) : (
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
            {recent.map((t: { id: string; title: string; status: string; priority: string; created_at: string }) => (
              <Box component="li" key={t.id}>
                <MuiLink
                  component={Link}
                  href="/admin/tickets"
                  underline="none"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {t.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                    <Chip label={PRIORITY_LABEL[t.priority] ?? t.priority} size="small" color={getPriorityChipColor(t.priority)} sx={{ fontWeight: 500 }} />
                    <Chip label={STATUS_LABEL[t.status] ?? t.status} size="small" color={getStatusChipColor(t.status)} sx={{ fontWeight: 500 }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(t.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </MuiLink>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: "open" | "progress" | "resolved" | "urgent";
}) {
  const borderColor = accent === "open" ? "warning.main" : accent === "progress" ? "info.main" : accent === "resolved" ? "success.main" : accent === "urgent" ? "error.main" : "divider";
  return (
    <MuiLink component={Link} href={href} underline="none" color="inherit">
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: accent ? 4 : 1,
          borderLeftColor: borderColor,
          "&:hover": { boxShadow: 2 },
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} mt={0.5}>
          {value}
        </Typography>
      </Paper>
    </MuiLink>
  );
}

function PriorityBar({
  label,
  count,
  total,
  accent,
}: {
  label: string;
  count: number;
  total: number;
  accent?: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2" color={accent ? "error.main" : "text.secondary"} fontWeight={accent ? 600 : 400}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {count}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={accent ? "error" : "inherit"}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: "action.hover",
          "& .MuiLinearProgress-bar": { borderRadius: 1 },
        }}
      />
    </Box>
  );
}
