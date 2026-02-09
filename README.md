# Derheim Inc. Internal Support Ticketing

Internal support ticketing MVP: employees submit tickets with priority; admins/agents assign and manage them. Supabase (data only), NextAuth (Credentials), Resend-ready.

## Setup

1. Copy `.env.local.example` to `.env.local` and set Supabase URL, service role key, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
2. In Supabase SQL Editor, run `supabase/migrations/001_initial_schema.sql`.
3. Seed the first admin user: `npm run seed`. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` (default: admin@derheim.local / Admin123!).
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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
