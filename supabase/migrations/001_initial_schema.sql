-- Derheim Support Ticketing: full schema (no Supabase Auth; custom users table)
-- Run this entire file once in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

-- =============================================================================
-- USERS (admin-created only; no signup)
-- =============================================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text,
  role text not null check (role in ('employee', 'agent', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- TICKETS
-- =============================================================================
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
  created_by uuid not null references public.users(id) on delete restrict,
  assigned_to uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tickets_created_by on public.tickets(created_by);
create index if not exists idx_tickets_assigned_to on public.tickets(assigned_to);
create index if not exists idx_tickets_status on public.tickets(status);
create index if not exists idx_tickets_priority on public.tickets(priority);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists tickets_updated_at on public.tickets;
create trigger tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();
