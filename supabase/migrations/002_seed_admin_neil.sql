-- Add admin user: nf@masnd.com / Neil Fuerzas / Password: hackmenot
-- Run once in Supabase SQL Editor after 001_initial_schema.sql

create extension if not exists pgcrypto;

insert into public.users (email, password_hash, full_name, role)
values (
  'nf@masnd.com',
  crypt('hackmenot', gen_salt('bf')),
  'Neil Fuerzas',
  'admin'
)
on conflict (email) do update set
  password_hash = excluded.password_hash,
  full_name = excluded.full_name,
  role = excluded.role,
  updated_at = now();
