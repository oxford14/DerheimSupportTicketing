import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyTickets, getTicketCounts, getTicketIdsWithReplies } from "@/lib/actions/tickets";
import { DashboardPageContent } from "./dashboard-page-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const dateFrom = typeof params.from === "string" ? params.from : undefined;
  const dateTo = typeof params.to === "string" ? params.to : undefined;

  const [ticketsResult, counts, ticketIdsWithReplies] = await Promise.all([
    getMyTickets(dateFrom, dateTo),
    getTicketCounts(dateFrom, dateTo),
    getTicketIdsWithReplies(),
  ]);

  const tickets = Array.isArray(ticketsResult) ? ticketsResult : ticketsResult.tickets;

  return (
    <DashboardPageContent
      tickets={tickets}
      ticketIdsWithReplies={ticketIdsWithReplies}
      counts={counts}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}
