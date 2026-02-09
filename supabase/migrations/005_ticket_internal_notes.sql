-- Internal notes: team-only conversation per ticket (not visible to customer)
create table if not exists public.ticket_internal_notes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ticket_internal_notes_ticket_id on public.ticket_internal_notes(ticket_id);
create index if not exists idx_ticket_internal_notes_created_at on public.ticket_internal_notes(ticket_id, created_at);
