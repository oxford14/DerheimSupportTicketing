"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { sendTicketCreated } from "@/lib/email";
import { uploadTicketAttachment } from "@/lib/storage";

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export async function createTicket(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  const title = formData.get("title") as string | null;
  const description = (formData.get("description") as string) || null;
  const priority = formData.get("priority") as string | null;

  if (!title?.trim()) return { error: "Title is required" };
  if (!priority || !PRIORITIES.includes(priority as Priority))
    return { error: "Invalid priority" };

  const supabase = getSupabaseServer();
  const { data: inserted, error } = await supabase
    .from("tickets")
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority as Priority,
      status: "open",
      created_by: session.user.id,
    })
    .select("id, title")
    .single();

  if (error) return { error: error.message };

  const files = formData.getAll("attachments") as File[];
  for (const file of files) {
    if (file && file.size > 0 && file.name) {
      const result = await uploadTicketAttachment(
        inserted.id,
        file,
        session.user.id
      );
      if ("error" in result) return { error: result.error };
    }
  }

  const email = (session.user as { email?: string }).email;
  if (inserted && email)
    await sendTicketCreated(email, { id: inserted.id, title: inserted.title });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/my-tickets");
  return { success: true };
}

export async function getMyTicket(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("tickets")
    .select("id, title, description, priority, status, created_at, updated_at")
    .eq("id", id)
    .eq("created_by", session.user.id)
    .single();

  return data;
}

const DEFAULT_PAGE_SIZE = 10;

export type MyTicketRow = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  created_at: string;
};

export async function getMyTickets(
  dateFrom?: string,
  dateTo?: string,
  options?: { page?: number; pageSize?: number }
): Promise<MyTicketRow[] | { tickets: MyTicketRow[]; totalCount: number }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const supabase = getSupabaseServer();
  const usePagination = options?.page != null && options.page >= 1;
  const pageSize = usePagination ? (options?.pageSize ?? DEFAULT_PAGE_SIZE) : 0;
  const from = usePagination ? (options!.page! - 1) * pageSize : 0;
  const to = usePagination ? from + pageSize - 1 : undefined;

  let query = supabase
    .from("tickets")
    .select("id, title, description, priority, status, created_at", usePagination ? { count: "exact" } : undefined)
    .eq("created_by", session.user.id);

  if (dateFrom) {
    const fromDate = `${dateFrom}T00:00:00.000Z`;
    query = query.gte("created_at", fromDate);
  }
  if (dateTo) {
    const toDate = `${dateTo}T23:59:59.999Z`;
    query = query.lte("created_at", toDate);
  }

  query = query.order("created_at", { ascending: false });
  if (usePagination && to !== undefined) query = query.range(from, to);

  const { data, count } = await query;
  const tickets = (data ?? []) as MyTicketRow[];
  if (usePagination) {
    return { tickets, totalCount: count ?? 0 };
  }
  return tickets;
}

/** Returns open and closed ticket counts for the current user (with same date filter as getMyTickets). */
export async function getTicketCounts(dateFrom?: string, dateTo?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { open: 0, closed: 0 };

  const supabase = getSupabaseServer();
  let query = supabase
    .from("tickets")
    .select("status")
    .eq("created_by", session.user.id);

  if (dateFrom) {
    const from = `${dateFrom}T00:00:00.000Z`;
    query = query.gte("created_at", from);
  }
  if (dateTo) {
    const to = `${dateTo}T23:59:59.999Z`;
    query = query.lte("created_at", to);
  }

  const { data } = await query;
  const rows = data ?? [];
  const open = rows.filter((r) => r.status === "open" || r.status === "in_progress").length;
  const closed = rows.filter((r) => r.status === "resolved" || r.status === "closed").length;
  return { open, closed };
}

/** Returns ticket IDs (owned by current user) that have at least one reply from support (not self) and are unread. */
export async function getTicketIdsWithReplies(): Promise<string[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const supabase = getSupabaseServer();
  const { data: userTickets } = await supabase
    .from("tickets")
    .select("id")
    .eq("created_by", session.user.id);
  const ticketIds = (userTickets ?? []).map((t) => t.id);
  if (ticketIds.length === 0) return [];

  const { data: replies } = await supabase
    .from("ticket_replies")
    .select("ticket_id, created_at, author_id")
    .in("ticket_id", ticketIds);

  if (!replies?.length) return [];

  // Only count replies from support (someone other than the ticket owner)
  const fromSupport = replies.filter((r) => r.author_id !== session.user.id);
  if (fromSupport.length === 0) return [];

  const latestReplyByTicket = new Map<string, string>();
  for (const r of fromSupport) {
    const existing = latestReplyByTicket.get(r.ticket_id);
    if (!existing || r.created_at > existing) {
      latestReplyByTicket.set(r.ticket_id, r.created_at);
    }
  }

  const { data: views } = await supabase
    .from("user_ticket_views")
    .select("ticket_id, last_viewed_at")
    .eq("user_id", session.user.id)
    .in("ticket_id", [...latestReplyByTicket.keys()]);

  const viewByTicket = new Map((views ?? []).map((v) => [v.ticket_id, v.last_viewed_at]));

  const unread: string[] = [];
  for (const [tid, latestReplyAt] of latestReplyByTicket) {
    const lastViewed = viewByTicket.get(tid);
    if (!lastViewed || lastViewed < latestReplyAt) unread.push(tid);
  }
  return unread;
}

/** Returns unread tickets with replies from support (id, title) for notification dropdown. */
export async function getNotificationTicketsForEmployee(): Promise<{ id: string; title: string }[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const supabase = getSupabaseServer();
  const { data: userTickets } = await supabase
    .from("tickets")
    .select("id, title")
    .eq("created_by", session.user.id);
  const ticketIds = new Set((userTickets ?? []).map((t) => t.id));
  if (ticketIds.size === 0) return [];

  const { data: replies } = await supabase
    .from("ticket_replies")
    .select("ticket_id, created_at, author_id")
    .in("ticket_id", [...ticketIds]);

  if (!replies?.length) return [];

  // Only count replies from support (someone other than the ticket owner)
  const fromSupport = replies.filter((r) => r.author_id !== session.user.id);
  if (fromSupport.length === 0) return [];

  const latestReplyByTicket = new Map<string, string>();
  for (const r of fromSupport) {
    const existing = latestReplyByTicket.get(r.ticket_id);
    if (!existing || r.created_at > existing) {
      latestReplyByTicket.set(r.ticket_id, r.created_at);
    }
  }

  const { data: views } = await supabase
    .from("user_ticket_views")
    .select("ticket_id, last_viewed_at")
    .eq("user_id", session.user.id)
    .in("ticket_id", [...latestReplyByTicket.keys()]);

  const viewByTicket = new Map((views ?? []).map((v) => [v.ticket_id, v.last_viewed_at]));

  const unreadIds: string[] = [];
  for (const [tid, latestReplyAt] of latestReplyByTicket) {
    const lastViewed = viewByTicket.get(tid);
    if (!lastViewed || lastViewed < latestReplyAt) unreadIds.push(tid);
  }

  const byId = new Map((userTickets ?? []).map((t) => [t.id, t]));
  return unreadIds
    .map((id) => byId.get(id))
    .filter((t): t is { id: string; title: string } => !!t)
    .slice(0, 8);
}

export type TicketReply = {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: { full_name: string | null; email: string } | null;
};

/** Returns all replies for a ticket the current user owns (for thread view). */
export async function getTicketReplies(ticketId: string): Promise<TicketReply[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const supabase = getSupabaseServer();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("created_by", session.user.id)
    .single();
  if (!ticket) return [];

  const { data: replies } = await supabase
    .from("ticket_replies")
    .select("id, ticket_id, author_id, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (!replies?.length) return [];
  const authorIds = [...new Set(replies.map((r) => r.author_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", authorIds);
  const userMap = new Map((users ?? []).map((u) => [u.id, { full_name: u.full_name, email: u.email }]));
  return replies.map((r) => ({
    ...r,
    author: userMap.get(r.author_id) ?? null,
  })) as TicketReply[];
}

/** Returns the most recent reply for a ticket the current user owns (for modal). */
export async function getLatestTicketReply(ticketId: string): Promise<TicketReply | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const supabase = getSupabaseServer();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("created_by", session.user.id)
    .single();
  if (!ticket) return null;

  const { data } = await supabase
    .from("ticket_replies")
    .select("id, ticket_id, author_id, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const { data: author } = await supabase
    .from("users")
    .select("full_name, email")
    .eq("id", data.author_id)
    .single();
  return { ...data, author: author ?? null } as TicketReply;
}

/** Add a reply to a ticket. Allowed for ticket owner (employee) or agent/admin. */
export async function addTicketReply(
  ticketId: string,
  body: string,
  formData?: FormData
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (!body?.trim()) return { error: "Reply cannot be empty" };

  const supabase = getSupabaseServer();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, created_by")
    .eq("id", ticketId)
    .single();
  if (!ticket) return { error: "Ticket not found" };

  const user = session.user as { role?: string };
  const isOwner = ticket.created_by === session.user.id;
  const isStaff = user.role === "agent" || user.role === "admin";
  if (!isOwner && !isStaff) return { error: "You cannot reply to this ticket" };

  const { data: reply, error } = await supabase
    .from("ticket_replies")
    .insert({
      ticket_id: ticketId,
      author_id: session.user.id,
      body: body.trim(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const files = formData?.getAll("attachments") as File[] | undefined;
  if (files?.length && reply?.id) {
    const { uploadTicketAttachment } = await import("@/lib/storage");
    for (const file of files) {
      if (file && file.size > 0 && file.name) {
        const result = await uploadTicketAttachment(ticketId, file, session.user.id, {
          replyId: reply.id,
        });
        if ("error" in result) return { error: result.error };
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/my-tickets");
  revalidatePath(`/dashboard/my-tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}

/** Record that the current user viewed a ticket. Used to mark notifications as read. */
export async function recordTicketView(ticketId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  const supabase = getSupabaseServer();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, created_by")
    .eq("id", ticketId)
    .single();
  if (!ticket) return;

  const user = session.user as { role?: string };
  const isOwner = ticket.created_by === session.user.id;
  const isStaff = user.role === "agent" || user.role === "admin";
  if (!isOwner && !isStaff) return;

  await supabase
    .from("user_ticket_views")
    .upsert(
      { user_id: session.user.id, ticket_id: ticketId, last_viewed_at: new Date().toISOString() },
      { onConflict: "user_id,ticket_id" }
    );

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
}
