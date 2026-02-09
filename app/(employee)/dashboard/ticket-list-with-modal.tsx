"use client";

import { useState } from "react";
import { PRIORITY_LABEL, STATUS_LABEL, getPriorityChipColor, getStatusChipColor } from "@/lib/priority-status-styles";
import { TicketDetailModal } from "./ticket-detail-modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

type Ticket = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  created_at: string;
};

const OPEN_STATUSES = ["open", "in_progress"];

export function TicketListWithModal({
  tickets,
  ticketIdsWithReplies = [],
}: {
  tickets: Ticket[];
  ticketIdsWithReplies?: string[];
}) {
  const [modalTicketId, setModalTicketId] = useState<string | null>(null);
  const hasRepliesSet = new Set(ticketIdsWithReplies);

  if (tickets.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No tickets yet. Create one above.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={500} sx={{ mb: 1.5 }}>
        Your tickets
      </Typography>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1.5 }}>
        {tickets.map((t) => {
          const isOpen = OPEN_STATUSES.includes(t.status);
          const hasNewResponse = isOpen && hasRepliesSet.has(t.id);
          return (
            <Box component="li" key={t.id}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setModalTicketId(t.id)}
                sx={{
                  justifyContent: "flex-start",
                  alignItems: "stretch",
                  textAlign: "left",
                  textTransform: "none",
                  py: 2,
                  px: 2.5,
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:hover": { borderColor: "primary.main", bgcolor: "action.hover", boxShadow: 1 },
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                        {t.title}
                      </Typography>
                      {hasNewResponse && (
                        <Chip label="Reply" size="small" color="info" sx={{ flexShrink: 0, fontWeight: 500 }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip label={PRIORITY_LABEL[t.priority] ?? t.priority} size="small" color={getPriorityChipColor(t.priority)} sx={{ fontWeight: 500 }} />
                    <Chip label={STATUS_LABEL[t.status] ?? t.status} size="small" color={getStatusChipColor(t.status)} sx={{ fontWeight: 500 }} />
                  </Box>
                  {t.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ lineClamp: 2 }}>
                      {t.description}
                    </Typography>
                  )}
                </Box>
              </Button>
            </Box>
          );
        })}
      </Box>
      <TicketDetailModal ticketId={modalTicketId} onClose={() => setModalTicketId(null)} />
    </Box>
  );
}
