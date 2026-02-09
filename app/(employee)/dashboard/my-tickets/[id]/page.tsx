import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "@/app/components/Link";
import { RecordTicketView } from "@/app/components/record-ticket-view";
import { AttachmentThumbnails } from "@/app/components/attachment-thumbnails";
import { getMyTicket, getTicketReplies } from "@/lib/actions/tickets";
import { getAttachmentsForTicket } from "@/lib/actions/attachments";
import { PRIORITY_LABEL, STATUS_LABEL, getPriorityChipColor, getStatusChipColor } from "@/lib/priority-status-styles";
import { TicketReplyForm } from "./ticket-reply-form";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import MuiLink from "@mui/material/Link";

export default async function MyTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const [ticket, replies, attachments] = await Promise.all([
    getMyTicket(id),
    getTicketReplies(id),
    getAttachmentsForTicket(id, { includeInternalNotes: false }),
  ]);
  if (!ticket) notFound();

  const ticketAttachments = attachments.filter(
    (a) => !a.reply_id && !a.internal_note_id
  );
  const attachmentsByReply = new Map<string, typeof attachments>();
  for (const a of attachments) {
    if (a.reply_id) {
      if (!attachmentsByReply.has(a.reply_id))
        attachmentsByReply.set(a.reply_id, []);
      attachmentsByReply.get(a.reply_id)!.push(a);
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      <RecordTicketView ticketId={id} />
      <MuiLink component={Link} href="/dashboard/my-tickets" variant="body2" color="text.secondary" sx={{ "&:hover": { color: "text.primary" } }}>
        ← Back to My Tickets
      </MuiLink>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {ticket.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          Created {new Date(ticket.created_at).toLocaleString()}
          {ticket.updated_at !== ticket.created_at &&
            ` · Updated ${new Date(ticket.updated_at).toLocaleString()}`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
          <Chip label={PRIORITY_LABEL[ticket.priority] ?? ticket.priority} size="small" color={getPriorityChipColor(ticket.priority)} sx={{ fontWeight: 500 }} />
          <Chip label={STATUS_LABEL[ticket.status] ?? ticket.status} size="small" color={getStatusChipColor(ticket.status)} sx={{ fontWeight: 500 }} />
        </Box>
        {ticket.description ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>Description</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
              {ticket.description}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mt: 2 }}>
            No description provided.
          </Typography>
        )}
        {ticketAttachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Attachments</Typography>
            <AttachmentThumbnails attachments={ticketAttachments} thumbnailSize="lg" />
          </Box>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Conversation</Typography>
        {replies.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No replies yet. Add one below.</Typography>
        ) : (
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            {replies.map((reply) => {
              const replyAttachments = attachmentsByReply.get(reply.id) ?? [];
              return (
                <Box
                  component="li"
                  key={reply.id}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{reply.body}</Typography>
                  {replyAttachments.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <AttachmentThumbnails attachments={replyAttachments} thumbnailSize="md" borderClass="border-neutral-200 dark:border-neutral-700" />
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {reply.author?.full_name || reply.author?.email || "Support"} · {new Date(reply.created_at).toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1.5 }}>Add a reply</Typography>
        <TicketReplyForm ticketId={id} />
      </Paper>
    </Box>
  );
}
