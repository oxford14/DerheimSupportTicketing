"use client";

import { useEffect } from "react";
import { recordTicketView } from "@/lib/actions/tickets";

/** Records that the user viewed this ticket (marks notification as read). Runs on mount. */
export function RecordTicketView({ ticketId }: { ticketId: string }) {
  useEffect(() => {
    void recordTicketView(ticketId);
  }, [ticketId]);
  return null;
}
