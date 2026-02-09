import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "@/app/components/Link";
import { RecordTicketView } from "@/app/components/record-ticket-view";
import { AttachmentThumbnails } from "@/app/components/attachment-thumbnails";
import { getTicketById, getTicketRepliesForAdmin, getTicketInternalNotes } from "@/lib/actions/admin";
import { getAttachmentsForTicket } from "@/lib/actions/attachments";
import { TicketMetaEdits } from "./ticket-meta-edits";
import { TicketReplyForm } from "@/app/(employee)/dashboard/my-tickets/[id]/ticket-reply-form";
import { InternalNoteForm } from "./internal-note-form";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") redirect("/dashboard");

  const { id } = await params;
  const [ticket, replies, internalNotes, attachments] = await Promise.all([
    getTicketById(id),
    getTicketRepliesForAdmin(id),
    getTicketInternalNotes(id),
    getAttachmentsForTicket(id, { includeInternalNotes: true }),
  ]);
  if (!ticket) notFound();

  const ticketAttachments = attachments.filter(
    (a) => !a.reply_id && !a.internal_note_id
  );
  const attachmentsByReply = new Map<string, typeof attachments>();
  const attachmentsByNote = new Map<string, typeof attachments>();
  for (const a of attachments) {
    if (a.reply_id) {
      if (!attachmentsByReply.has(a.reply_id))
        attachmentsByReply.set(a.reply_id, []);
      attachmentsByReply.get(a.reply_id)!.push(a);
    }
    if (a.internal_note_id) {
      if (!attachmentsByNote.has(a.internal_note_id))
        attachmentsByNote.set(a.internal_note_id, []);
      attachmentsByNote.get(a.internal_note_id)!.push(a);
    }
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      <RecordTicketView ticketId={id} />
      <MuiLink component={Link} href="/admin/tickets" variant="body2" color="text.secondary" sx={{ "&:hover": { color: "text.primary" } }}>
        ← Back to Tickets
      </MuiLink>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" }, gap: 3, alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {ticket.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Created {new Date(ticket.created_at).toLocaleString()}
              {ticket.updated_at !== ticket.created_at &&
                ` · Updated ${new Date(ticket.updated_at).toLocaleString()}`}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mt: 1.5 }}>
              <TicketMetaEdits ticketId={id} priority={ticket.priority} status={ticket.status} />
              {ticket.creator && (
                <Typography variant="caption" color="text.secondary">
                  Created by {ticket.creator.full_name || ticket.creator.email}
                </Typography>
              )}
              {ticket.assignee && (
                <Typography variant="caption" color="text.secondary">
                  Assigned to {ticket.assignee.full_name || ticket.assignee.email}
                </Typography>
              )}
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
                      sx={{ p: 2, borderRadius: 1, border: 1, borderColor: "divider", bgcolor: "action.hover" }}
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

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            borderColor: "warning.main",
            bgcolor: "warning.light",
            position: { lg: "sticky" },
            top: { lg: 24 },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            🔒 Internal conversation
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            Team only. Use for follow-ups, status, and coordination.
          </Typography>
          {internalNotes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No internal notes yet.</Typography>
          ) : (
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 1.5, mt: 2, maxHeight: 280, overflow: "auto" }}>
              {internalNotes.map((note) => {
                const noteAttachments = attachmentsByNote.get(note.id) ?? [];
                return (
                  <Box
                    component="li"
                    key={note.id}
                    sx={{ p: 1.5, borderRadius: 1, border: 1, borderColor: "warning.dark", bgcolor: "background.paper" }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{note.body}</Typography>
                    {noteAttachments.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <AttachmentThumbnails attachments={noteAttachments} thumbnailSize="sm" borderClass="border-amber-200 dark:border-amber-800" />
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      {note.author?.full_name || note.author?.email || "Team"} · {new Date(note.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
          <Typography variant="body2" fontWeight={500} sx={{ mt: 2, mb: 1 }}>Add internal note</Typography>
          <InternalNoteForm ticketId={id} />
        </Paper>
      </Box>
    </Box>
  );
}
