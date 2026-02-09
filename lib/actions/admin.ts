"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseServer } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { sendTicketAssigned } from "@/lib/email";
import type { Priority, Status } from "./tickets";
import type { TicketReply } from "./tickets";

const DEFAULT_PAGE_SIZE = 10;

export type AdminTicketRow = {
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

export async function getAllTickets(filters?: {
  status?: string;
  priority?: string;
  date?: string; // YYYY-MM-DD, single day
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  page?: number;
  pageSize?: number;
}): Promise<AdminTicketRow[] | { tickets: AdminTicketRow[]; totalCount: number }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return [];

  const supabase = getSupabaseServer();
  const select =
    "id, title, description, priority, status, source, created_at, created_by, assigned_to, creator:created_by(full_name, email), assignee:assigned_to(full_name, email)";
  const usePagination = filters?.page != null && filters.page >= 1;
  const pageSize = usePagination ? (filters?.pageSize ?? DEFAULT_PAGE_SIZE) : 0;
  const from = usePagination ? (filters.page! - 1) * pageSize : 0;
  const to = usePagination ? from + pageSize - 1 : undefined;

  let q = supabase
    .from("tickets")
    .select(select, usePagination ? { count: "exact" } : undefined)
    .order("created_at", { ascending: false });

  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.priority) q = q.eq("priority", filters.priority);
  if (filters?.dateFrom) {
    q = q.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters?.dateTo) {
    q = q.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }
  if (filters?.date && !filters?.dateFrom && !filters?.dateTo) {
    const start = `${filters.date}T00:00:00.000Z`;
    const end = new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19) + ".000Z";
    q = q.gte("created_at", start).lt("created_at", end);
  }
  if (usePagination && to !== undefined) q = q.range(from, to);

  const { data, count } = await q;
  const rows = (data ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    source?: string;
    created_at: string;
    created_by: string;
    assigned_to: string | null;
    creator?: { full_name: string | null; email: string } | Array<{ full_name: string | null; email: string }>;
    assignee?: { full_name: string | null; email: string } | Array<{ full_name: string | null; email: string }>;
  }>;
  const tickets = rows.map((row) => ({
    ...row,
    creator: Array.isArray(row.creator) ? row.creator[0] ?? null : row.creator ?? null,
    assignee: Array.isArray(row.assignee) ? row.assignee[0] ?? null : row.assignee ?? null,
  }));
  if (usePagination) {
    return { tickets, totalCount: count ?? 0 };
  }
  return tickets;
}

/** Tickets assigned to the current user (agent/admin). Same filters as getAllTickets. */
export async function getTicketsAssignedToMe(filters?: {
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return [];

  const supabase = getSupabaseServer();
  let q = supabase
    .from("tickets")
    .select(
      "id, title, description, priority, status, source, created_at, created_by, assigned_to, creator:created_by(full_name, email), assignee:assigned_to(full_name, email)"
    )
    .eq("assigned_to", session.user.id)
    .order("created_at", { ascending: false });

  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.priority) q = q.eq("priority", filters.priority);
  if (filters?.dateFrom) {
    q = q.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
  }
  if (filters?.dateTo) {
    q = q.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
  }

  const { data } = await q;
  const rows = (data ?? []) as Array<{
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    source?: string;
    created_at: string;
    created_by: string;
    assigned_to: string | null;
    creator?: { full_name: string | null; email: string } | Array<{ full_name: string | null; email: string }>;
    assignee?: { full_name: string | null; email: string } | Array<{ full_name: string | null; email: string }>;
  }>;
  return rows.map((row) => ({
    ...row,
    creator: Array.isArray(row.creator) ? row.creator[0] ?? null : row.creator ?? null,
    assignee: Array.isArray(row.assignee) ? row.assignee[0] ?? null : row.assignee ?? null,
  }));
}

export async function getTicketStats(dateFrom?: string, dateTo?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return null;

  const supabase = getSupabaseServer();
  let q = supabase.from("tickets").select("id, status, priority");
  if (dateFrom) {
    q = q.gte("created_at", `${dateFrom}T00:00:00.000Z`);
  }
  if (dateTo) {
    q = q.lte("created_at", `${dateTo}T23:59:59.999Z`);
  }
  const { data: tickets } = await q;

  const list = tickets ?? [];
  const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
  list.forEach((t: { status: string; priority: string }) => {
    if (t.status in byStatus) byStatus[t.status as keyof typeof byStatus]++;
    if (t.priority in byPriority) byPriority[t.priority as keyof typeof byPriority]++;
  });

  return {
    total: list.length,
    byStatus,
    byPriority,
  };
}

/** Returns tickets for admin notification: open unviewed + tickets where employee replied since admin last viewed. */
export async function getNotificationTicketsForAdmin(): Promise<{ id: string; title: string }[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return [];

  const supabase = getSupabaseServer();

  // 1) Open/in-progress tickets the admin hasn't viewed
  const { data: openTickets } = await supabase
    .from("tickets")
    .select("id, title")
    .in("status", ["open", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(20);

  const ticketList = (openTickets ?? []) as { id: string; title: string }[];
  if (ticketList.length === 0) {
    // Still check for employee-reply notifications
  }

  const { data: views } = await supabase
    .from("user_ticket_views")
    .select("ticket_id, last_viewed_at")
    .eq("user_id", session.user.id);

  const viewByTicket = new Map((views ?? []).map((v) => [v.ticket_id, v.last_viewed_at]));

  const openUnviewed = ticketList.filter((t) => !viewByTicket.has(t.id));

  // 2) Tickets where the employee (ticket owner) replied after admin's last view
  const { data: allTickets } = await supabase
    .from("tickets")
    .select("id, title, created_by");
  const ticketsWithOwner = (allTickets ?? []) as { id: string; title: string; created_by: string }[];

  const { data: replies } = await supabase
    .from("ticket_replies")
    .select("ticket_id, created_at, author_id")
    .in("ticket_id", ticketsWithOwner.map((t) => t.id));

  const ownerByTicket = new Map(ticketsWithOwner.map((t) => [t.id, t.created_by]));
  const titleByTicket = new Map(ticketsWithOwner.map((t) => [t.id, t.title]));

  const employeeReplies = (replies ?? []).filter(
    (r) => ownerByTicket.get(r.ticket_id) === r.author_id
  );
  const latestEmployeeReplyByTicket = new Map<string, string>();
  for (const r of employeeReplies) {
    const existing = latestEmployeeReplyByTicket.get(r.ticket_id);
    if (!existing || r.created_at > existing) {
      latestEmployeeReplyByTicket.set(r.ticket_id, r.created_at);
    }
  }

  const hasNewEmployeeReply: { id: string; title: string }[] = [];
  for (const [tid, latestReplyAt] of latestEmployeeReplyByTicket) {
    const lastViewed = viewByTicket.get(tid);
    if (!lastViewed || lastViewed < latestReplyAt) {
      const title = titleByTicket.get(tid);
      if (title) hasNewEmployeeReply.push({ id: tid, title });
    }
  }

  const seen = new Set<string>();
  const combined: { id: string; title: string }[] = [];
  for (const t of [...openUnviewed, ...hasNewEmployeeReply]) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    combined.push(t);
  }
  return combined.slice(0, 8);
}

export async function getAgents() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return [];

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("role", ["agent", "admin"])
    .order("full_name");
  return data ?? [];
}

export async function updateTicketAssign(id: string, assignedTo: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return { error: "Forbidden" };

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("tickets")
    .update({ assigned_to: assignedTo || null })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/tickets/${id}`);
  if (assignedTo) {
    const { data: ticket } = await supabase
      .from("tickets")
      .select("id, title")
      .eq("id", id)
      .single();
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", assignedTo)
      .single();
    if (ticket && user?.email)
      await sendTicketAssigned(user.email, { id: ticket.id, title: ticket.title });
  }
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/my-tickets");
  return { success: true };
}

export async function getAllUsers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return [];

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return { error: "Only admins can create users" };

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const userRole = (formData.get("role") as string)?.trim() || "employee";

  if (!email) return { error: "Email is required" };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters" };
  const allowedRoles = ["employee", "agent", "admin"];
  if (!allowedRoles.includes(userRole)) return { error: "Invalid role" };

  const bcrypt = await import("bcryptjs");
  const password_hash = await bcrypt.hash(password, 10);

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("users").insert({
    email,
    password_hash,
    full_name,
    role: userRole,
  });

  if (error) {
    if (error.code === "23505") return { error: "A user with this email already exists" };
    return { error: error.message };
  }
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return { error: "Only admins can update users" };

  const email = (formData.get("email") as string | null)?.trim() || "";
  const full_name = ((formData.get("full_name") as string | null)?.trim() || "") || null;
  const userRole = ((formData.get("role") as string | null)?.trim() || "") || "";
  const password = (formData.get("password") as string | null) || "";

  if (!userId) return { error: "User id is required" };
  if (!email) return { error: "Email is required" };
  const allowedRoles = ["employee", "agent", "admin"];
  if (!allowedRoles.includes(userRole)) return { error: "Invalid role" };
  if (password && password.length < 6) return { error: "Password must be at least 6 characters" };

  const updates: {
    email: string;
    full_name: string | null;
    role: string;
    password_hash?: string;
  } = { email, full_name, role: userRole };

  if (password) {
    const bcrypt = await import("bcryptjs");
    updates.password_hash = await bcrypt.hash(password, 10);
  }

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("users").update(updates).eq("id", userId);

  if (error) {
    if (error.code === "23505") return { error: "A user with this email already exists" };
    return { error: error.message };
  }
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return { error: "Only admins can delete users" };
  if (!userId) return { error: "User id is required" };
  if (session.user.id === userId) return { error: "You cannot delete your own account" };

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateTicketStatus(id: string, status: Status) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return { error: "Forbidden" };

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/my-tickets");
  revalidatePath(`/admin/tickets/${id}`);
  return { success: true };
}

export async function updateTicketPriority(id: string, priority: Priority) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return { error: "Forbidden" };

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("tickets")
    .update({ priority })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/my-tickets");
  revalidatePath(`/admin/tickets/${id}`);
  return { success: true };
}

/** Get a single ticket by id. Allowed for agent/admin only. */
export async function getTicketById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return null;

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("tickets")
    .select(
      "id, title, description, priority, status, source, created_at, updated_at, created_by, assigned_to, creator:created_by(full_name, email), assignee:assigned_to(full_name, email)"
    )
    .eq("id", id)
    .single();

  if (!data) return null;
  const row = data as {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    source?: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    assigned_to: string | null;
    creator?: { full_name: string | null; email: string } | Array<{ full_name: string | null; email: string }>;
    assignee?: { full_name: string | null; email: string } | Array<{ full_name: string | null; email: string }>;
  };
  return {
    ...row,
    creator: Array.isArray(row.creator) ? row.creator[0] ?? null : row.creator ?? null,
    assignee: Array.isArray(row.assignee) ? row.assignee[0] ?? null : row.assignee ?? null,
  };
}

/** Get all replies for a ticket. Allowed for agent/admin only. */
export async function getTicketRepliesForAdmin(ticketId: string): Promise<TicketReply[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return [];

  const supabase = getSupabaseServer();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
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

export type TicketInternalNote = {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: { full_name: string | null; email: string } | null;
};

/** Get internal notes for a ticket. Agent/admin only. */
export async function getTicketInternalNotes(ticketId: string): Promise<TicketInternalNote[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return [];

  const supabase = getSupabaseServer();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .single();
  if (!ticket) return [];

  const { data: notes } = await supabase
    .from("ticket_internal_notes")
    .select("id, ticket_id, author_id, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (!notes?.length) return [];
  const authorIds = [...new Set(notes.map((n) => n.author_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", authorIds);
  const userMap = new Map((users ?? []).map((u) => [u.id, { full_name: u.full_name, email: u.email }]));
  return notes.map((n) => ({
    ...n,
    author: userMap.get(n.author_id) ?? null,
  })) as TicketInternalNote[];
}

/** Add an internal note to a ticket. Agent/admin only. */
export async function addTicketInternalNote(
  ticketId: string,
  body: string,
  formData?: FormData
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  const role = (session.user as { role?: string }).role;
  if (role !== "agent" && role !== "admin") return { error: "Forbidden" };
  if (!body?.trim()) return { error: "Note cannot be empty" };

  const supabase = getSupabaseServer();
  const { data: ticket } = await supabase
    .from("tickets")
    .select("id")
    .eq("id", ticketId)
    .single();
  if (!ticket) return { error: "Ticket not found" };

  const { data: note, error } = await supabase
    .from("ticket_internal_notes")
    .insert({
      ticket_id: ticketId,
      author_id: session.user.id,
      body: body.trim(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const files = formData?.getAll("attachments") as File[] | undefined;
  if (files?.length && note?.id) {
    const { uploadTicketAttachment } = await import("@/lib/storage");
    for (const file of files) {
      if (file && file.size > 0 && file.name) {
        const result = await uploadTicketAttachment(
          ticketId,
          file,
          session.user.id,
          { internalNoteId: note.id }
        );
        if ("error" in result) return { error: result.error };
      }
    }
  }

  revalidatePath("/admin/tickets");
  revalidatePath("/admin/my-tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: true };
}
