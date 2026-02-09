# Derheim Inc. Internal Support Ticketing

Internal support ticketing MVP: employees submit tickets with priority; admins/agents assign and manage them. Supabase (data only), NextAuth (Credentials), Resend-ready.

**If GitGuardian or another scanner reported a secret leak:** Any previously committed credentials (e.g. admin email/password) have been removed from this repo and replaced with placeholders. If your real credentials were ever pushed, rotate them immediately: change the admin password via your database or `npx tsx scripts/update-password.ts`, and update any other exposed secrets.

## Setup

1. Copy `.env.local.example` to `.env.local` and set Supabase URL, service role key, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
2. In Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql`.
3. Run migrations 002 and 003 in Supabase SQL Editor, then set your admin password: `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`, then `npx tsx scripts/update-password.ts`. Or seed a new admin with `npm run seed` (set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`; defaults are placeholders).
4. Run `npm run dev`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new). **For login to work in production**, set these environment variables in your Vercel project (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | **Your live app URL**, e.g. `https://your-app.vercel.app` (must match the deployed URL) |
| `NEXTAUTH_SECRET` | A random secret (e.g. `openssl rand -base64 32`) — required in production |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |

If `NEXTAUTH_URL` is wrong or `NEXTAUTH_SECRET` is missing, sign-in will work on localhost but fail on the live site. After changing env vars, redeploy the app.
