-- Set bcryptjs-compatible password hash for initial admin (password: ChangeMeInProduction!)
-- Run in Supabase SQL Editor. Then run: npx tsx scripts/update-password.ts with ADMIN_EMAIL and ADMIN_PASSWORD.

update public.users
set password_hash = '$2a$10$8lVeRy2Q8JBmpCaDAICz0eH4bo7Q1p.TWInm5FZXYWw1ge7JveiAG',
    updated_at = now()
where email = 'admin@example.com';
