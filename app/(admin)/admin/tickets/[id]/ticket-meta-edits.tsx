"use client";

import { updateTicketPriority, updateTicketStatus } from "@/lib/actions/admin";
import type { Priority, Status } from "@/lib/actions/tickets";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

type TicketMetaEditsProps = {
  ticketId: string;
  priority: string;
  status: string;
};

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export function TicketMetaEdits({ ticketId, priority, status }: TicketMetaEditsProps) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
      <Box>
        <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary", display: "block", mb: 0.5 }}>
          Priority
        </Box>
        <form
          data-ticket-priority={ticketId}
          action={async (fd) => {
            const p = fd.get("priority") as Priority;
            await updateTicketPriority(ticketId, p);
          }}
          style={{ display: "inline-block" }}
        >
          <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <Select
              name="priority"
              defaultValue={priority}
              onChange={() =>
                (document.querySelector(`form[data-ticket-priority="${ticketId}"]`) as HTMLFormElement)?.requestSubmit()
              }
              size="small"
            >
              {PRIORITY_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </Box>
      <Box>
        <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary", display: "block", mb: 0.5 }}>
          Status
        </Box>
        <form
          data-ticket-status={ticketId}
          action={async (fd) => {
            const s = fd.get("status") as Status;
            await updateTicketStatus(ticketId, s);
          }}
          style={{ display: "inline-block" }}
        >
          <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <Select
              name="status"
              defaultValue={status}
              onChange={() =>
                (document.querySelector(`form[data-ticket-status="${ticketId}"]`) as HTMLFormElement)?.requestSubmit()
              }
              size="small"
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </Box>
    </Box>
  );
}
