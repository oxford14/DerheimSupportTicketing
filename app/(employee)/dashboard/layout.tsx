import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTicketIdsWithReplies, getNotificationTicketsForEmployee } from "@/lib/actions/tickets";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { name?: string } | undefined;
  const [ticketIdsWithReplies, notificationTickets] = await Promise.all([
    getTicketIdsWithReplies(),
    getNotificationTicketsForEmployee(),
  ]);
  const notificationCount = ticketIdsWithReplies.length;
  const notificationItems = notificationTickets.map((t) => ({
    id: t.id,
    title: t.title,
    href: `/dashboard/my-tickets/${t.id}`,
  }));

  return (
    <DashboardShell
      userEmail={session?.user?.email ?? ""}
      userName={user?.name}
      notificationCount={notificationCount}
      notificationItems={notificationItems}
    >
      {children}
    </DashboardShell>
  );
}
