-- Ticket attachments: photos attached to tickets, replies, or internal notes
-- Files are stored in Supabase Storage bucket "ticket-attachments"

create table if not exists public.ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  reply_id uuid references public.ticket_replies(id) on delete cascade,
  internal_note_id uuid references public.ticket_internal_notes(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  content_type text,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_attachments_ticket_id on public.ticket_attachments(ticket_id);
create index if not exists idx_ticket_attachments_reply_id on public.ticket_attachments(reply_id) where reply_id is not null;
create index if not exists idx_ticket_attachments_internal_note_id on public.ticket_attachments(internal_note_id) where internal_note_id is not null;

comment on table public.ticket_attachments is 'Photo attachments for tickets (initial), replies, and internal notes. Files stored in Supabase Storage bucket ticket-attachments.';
