"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [priorityValue, setPriorityValue] = useState<Priority>(priority as Priority);
  const [statusValue, setStatusValue] = useState<Status>(status as Status);
  const [saving, setSaving] = useState<"priority" | "status" | null>(null);

  const handlePriorityChange = async (newPriority: Priority) => {
    setPriorityValue(newPriority);
    setSaving("priority");
    const result = await updateTicketPriority(ticketId, newPriority);
    setSaving(null);
    if (result?.error) setPriorityValue(priority as Priority);
    else router.refresh();
  };

  const handleStatusChange = async (newStatus: Status) => {
    setStatusValue(newStatus);
    setSaving("status");
    const result = await updateTicketStatus(ticketId, newStatus);
    setSaving(null);
    if (result?.error) setStatusValue(status as Status);
    else router.refresh();
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
      <Box>
        <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary", display: "block", mb: 0.5 }}>
          Priority
        </Box>
        <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
          <Select<Priority>
            value={priorityValue}
            onChange={(e) => handlePriorityChange(e.target.value as Priority)}
            size="small"
            disabled={saving === "priority"}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box>
        <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary", display: "block", mb: 0.5 }}>
          Status
        </Box>
        <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
          <Select<Status>
            value={statusValue}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            size="small"
            disabled={saving === "status"}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
