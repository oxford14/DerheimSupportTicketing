"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase";
import { getAttachmentUrl } from "@/lib/storage";

export type TicketAttachment = {
  id: string;
  ticket_id: string;
  reply_id: string | null;
  internal_note_id: string | null;
  file_path: string;
  file_name: string;
  content_type: string | null;
  signed_url: string | null;
};

/** Fetch all attachments for a ticket with signed URLs. Employee sees ticket + reply attachments only. Admin can include internal note attachments. */
export async function getAttachmentsForTicket(
  ticketId: string,
  options?: { includeInternalNotes?: boolean }
): Promise<TicketAttachment[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const supabase = getSupabaseServer();

  const user = session.user as { role?: string };
  const isStaff = user.role === "agent" || user.role === "admin";

  let query = supabase
    .from("ticket_attachments")
    .select("id, ticket_id, reply_id, internal_note_id, file_path, file_name, content_type")
    .eq("ticket_id", ticketId);

  if (!options?.includeInternalNotes || !isStaff) {
    query = query.is("internal_note_id", null);
  }

  const { data: rows } = await query;
  if (!rows?.length) return [];

  const result: TicketAttachment[] = [];
  for (const row of rows) {
    const signed_url = await getAttachmentUrl(row.file_path);
    result.push({ ...row, signed_url });
  }
  return result;
}
