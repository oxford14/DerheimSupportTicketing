-- Track when a user last viewed a ticket (for notification "read" state)
create table if not exists public.user_ticket_views (
  user_id uuid not null references public.users(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  last_viewed_at timestamptz not null default now(),
  primary key (user_id, ticket_id)
);

create index if not exists idx_user_ticket_views_user_id on public.user_ticket_views(user_id);
create index if not exists idx_user_ticket_views_ticket_id on public.user_ticket_views(ticket_id);
