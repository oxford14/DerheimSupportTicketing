"use client";

import Link from "next/link";
import { updateTicketAssign, updateTicketStatus, updateTicketPriority } from "@/lib/actions/admin";
import type { Priority, Status } from "@/lib/actions/tickets";
import { getStatusChipColor } from "@/lib/priority-status-styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

type User = { id: string; full_name: string | null; email: string };
type Ticket = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  source?: string;
  created_at: string;
  created_by: string;
  assigned_to: string | null;
  creator?: { full_name: string | null; email: string } | null;
  assignee?: { full_name: string | null; email: string } | null;
};

type TicketsTableProps = {
  tickets: Ticket[];
  agents: User[];
};

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TicketsTable({ tickets, agents }: TicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No tickets match the filters.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Created by</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Assigned to</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.map((t) => (
            <TableRow key={t.id} hover>
              <TableCell>
                <Link
                  href={`/admin/tickets/${t.id}`}
                  style={{ color: "inherit", fontWeight: 500, textDecoration: "none" }}
                >
                  <Typography variant="body2" component="span" sx={{ "&:hover": { textDecoration: "underline" } }}>
                    {t.title}
                  </Typography>
                </Link>
                {t.description && (
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200, display: "block", mt: 0.25 }}>
                    {t.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <form
                  data-ticket-priority={t.id}
                  action={async (fd) => {
                    const priority = fd.get("priority") as Priority;
                    await updateTicketPriority(t.id, priority);
                  }}
                  style={{ display: "inline" }}
                >
                  <FormControl size="small" variant="outlined" sx={{ minWidth: 100 }}>
                    <Select
                      name="priority"
                      defaultValue={t.priority}
                      onChange={() => (document.querySelector(`form[data-ticket-priority="${t.id}"]`) as HTMLFormElement)?.requestSubmit()}
                      size="small"
                      sx={{ fontSize: "0.75rem", height: 28 }}
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </form>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={STATUS_OPTIONS.find((o) => o.value === t.status)?.label ?? t.status}
                    size="small"
                    color={getStatusChipColor(t.status)}
                    sx={{ fontWeight: 500 }}
                  />
                  <form
                    data-ticket-status={t.id}
                    action={async (fd) => {
                      const status = fd.get("status") as Status;
                      await updateTicketStatus(t.id, status);
                    }}
                    style={{ display: "inline" }}
                  >
                    <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                      <Select
                        name="status"
                        defaultValue={t.status}
                        onChange={() => (document.querySelector(`form[data-ticket-status="${t.id}"]`) as HTMLFormElement)?.requestSubmit()}
                        size="small"
                        sx={{ fontSize: "0.75rem", height: 28 }}
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
              </TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                {(t.source || "portal").replaceAll("_", " ")}
              </TableCell>
              <TableCell>{t.creator?.email ?? t.created_by}</TableCell>
              <TableCell>
                <form
                  data-ticket-assign={t.id}
                  action={async (fd) => {
                    const v = fd.get("assigned_to");
                    await updateTicketAssign(t.id, v === "" ? null : (v as string));
                  }}
                  style={{ display: "inline" }}
                >
                  <FormControl size="small" variant="outlined" sx={{ minWidth: 140 }}>
                    <Select
                      name="assigned_to"
                      defaultValue={t.assigned_to ?? ""}
                      onChange={() => (document.querySelector(`form[data-ticket-assign="${t.id}"]`) as HTMLFormElement)?.requestSubmit()}
                      size="small"
                    >
                      <MenuItem value="">Unassigned</MenuItem>
                      {agents.map((a) => (
                        <MenuItem key={a.id} value={a.id}>
                          {a.full_name || a.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </form>
              </TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                {new Date(t.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
