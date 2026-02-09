"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getMyTicket, getLatestTicketReply, recordTicketView, type TicketReply } from "@/lib/actions/tickets";
import { PRIORITY_LABEL, STATUS_LABEL, getPriorityChipColor, getStatusChipColor } from "@/lib/priority-status-styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";

type TicketDetailModalProps = {
  ticketId: string | null;
  onClose: () => void;
};

type TicketData = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export function TicketDetailModal({ ticketId, onClose }: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [latestReply, setLatestReply] = useState<TicketReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      setLatestReply(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getMyTicket(ticketId), getLatestTicketReply(ticketId)])
      .then(([ticketData, reply]) => {
        if (!cancelled) {
          setTicket(ticketData ?? null);
          setError(ticketData ? null : "Ticket not found");
          setLatestReply(reply ?? null);
          if (ticketData) void recordTicketView(ticketId);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load ticket");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [ticketId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  if (!ticketId) return null;

  return (
    <Dialog
      open={Boolean(ticketId)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, pr: 6 }}>
        <Typography id="ticket-modal-title" variant="h6" component="span">
          {ticket && !error ? ticket.title : loading ? "Loading…" : "Ticket"}
        </Typography>
        <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && !error && ticket && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Created {new Date(ticket.created_at).toLocaleString()}
              {ticket.updated_at !== ticket.created_at && (
                <> · Updated {new Date(ticket.updated_at).toLocaleString()}</>
              )}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>Priority</Typography>
                <Chip label={PRIORITY_LABEL[ticket.priority] ?? ticket.priority} size="small" color={getPriorityChipColor(ticket.priority)} sx={{ fontWeight: 500 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>Status</Typography>
                <Chip label={STATUS_LABEL[ticket.status] ?? ticket.status} size="small" color={getStatusChipColor(ticket.status)} sx={{ fontWeight: 500 }} />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>Description</Typography>
              {ticket.description ? (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{ticket.description}</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">No description provided.</Typography>
              )}
            </Box>

            {latestReply && (
              <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1, border: 1, borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>Latest response</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{latestReply.body}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  {latestReply.author?.full_name || latestReply.author?.email || "Support"} · {new Date(latestReply.created_at).toLocaleString()}
                </Typography>
              </Box>
            )}

            <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Link
                href={`/dashboard/my-tickets/${ticket.id}`}
                style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--mui-palette-primary-main)" }}
              >
                View full page →
              </Link>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
