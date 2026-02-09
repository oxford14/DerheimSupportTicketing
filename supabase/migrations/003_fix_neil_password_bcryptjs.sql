-- Fix password for nf@masnd.com so login works (bcryptjs-compatible hash for "hackmenot")
-- Run in Supabase SQL Editor. No API key needed.

update public.users
set password_hash = '$2a$10$M6bd8z9VyGiTh4NzTQEAQeZ2KDN8K54ArjqIvg7uC9ZwRaE7Qh2fG',
    updated_at = now()
where email = 'nf@masnd.com';
