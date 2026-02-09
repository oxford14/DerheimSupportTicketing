import Link from "next/link";
import { PRIORITY_LABEL, STATUS_LABEL, getPriorityBadgeClass, getStatusBadgeClass } from "@/lib/priority-status-styles";

type Ticket = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  created_at: string;
};

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <p className="text-sm text-neutral-500">No tickets yet. Create one above.</p>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-medium mb-2">Your tickets</h2>
      <ul className="space-y-2">
        {tickets.map((t) => (
          <li key={t.id}>
            <Link
              href={`/dashboard/my-tickets/${t.id}`}
              className="block rounded border border-neutral-200 dark:border-neutral-700 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium text-sm">{t.title}</span>
                <span className="text-xs text-neutral-500">
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${getPriorityBadgeClass(t.priority)}`}>
                  {PRIORITY_LABEL[t.priority] ?? t.priority}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusBadgeClass(t.status)}`}>
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
              {t.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                  {t.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
