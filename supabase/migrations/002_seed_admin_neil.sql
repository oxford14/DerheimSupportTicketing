-- Add initial admin user (placeholder). Change password via: npx tsx scripts/update-password.ts
-- Run once in Supabase SQL Editor after 001_initial_schema.sql

create extension if not exists pgcrypto;

insert into public.users (email, password_hash, full_name, role)
values (
  'admin@example.com',
  crypt('ChangeMeInProduction!', gen_salt('bf')),
  'Admin',
  'admin'
)
on conflict (email) do update set
  password_hash = excluded.password_hash,
  full_name = excluded.full_name,
  role = excluded.role,
  updated_at = now();
