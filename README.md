# TradeTracker

TradeTracker is a production-minded options trading journal built with Next.js App Router, Prisma, PostgreSQL, Firebase Authentication, and a typed server-side domain layer. It is designed for retail traders who need a durable record of wheel trades, standalone options, stock holdings, assignments, rolls, and final exits.

## Stack

- Next.js 16 + TypeScript + App Router
- PostgreSQL + Prisma
- Firebase Auth with Google sign-in
- Tailwind CSS + shadcn-style UI primitives
- React Hook Form + Zod
- TanStack Table + Recharts
- Vitest + Testing Library + Playwright

## Getting Started

1. Copy `.env.example` to `.env.local`.
2. Fill in the PostgreSQL and Firebase credentials.
3. Install dependencies with `pnpm install`.
4. Generate the Prisma client with `pnpm prisma:generate`.
5. Create the database schema with `pnpm prisma:migrate`.
6. Seed demo data with `pnpm prisma:seed`.
7. Start the app with `pnpm dev`.

## Environment Variables

- `DATABASE_URL` / `DIRECT_URL`: PostgreSQL connection strings for Prisma.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: Firebase Admin credentials used to verify ID tokens and mint session cookies.
- `NEXT_PUBLIC_FIREBASE_*`: Firebase client configuration used on the sign-in page.
- `SESSION_COOKIE_NAME`, `SESSION_COOKIE_EXPIRES_DAYS`: HTTP-only session settings.
- `NEXT_PUBLIC_APP_URL`: Canonical app URL for local or deployed environments.
- `TWELVE_DATA_API_KEY`: Server-side API key used to fetch current stock prices for open holdings.

## App Structure

- `app/`: App Router pages, protected workspace routes, and route handlers.
- `components/`: UI primitives, charts, tables, auth flows, and trade forms.
- `lib/auth/`: Firebase client/admin setup and session utilities.
- `lib/domain/`: Validation schemas, shared models, and trade calculations.
- `lib/server/`: Prisma access, authenticated queries, and append-only trade services.
- `prisma/`: Schema and demo seed data.
- `tests/`: Unit, component, and end-to-end coverage.

## Product Notes

- Every lifecycle update is written as a `TradeEvent`; trades and holdings keep only denormalized summaries.
- Assignment creates stock lots with adjusted basis rather than rewriting prior events.
- All data access is scoped to the authenticated Firebase user on the server.

## Verification

- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e`

## Deployment Notes

- Set `NEXT_PUBLIC_APP_URL` to your production hostname, for example `https://www.optiontradetracker.com`.
- Attach `www.optiontradetracker.com` to the Vercel project that deploys this repo.
- Point the apex domain at Vercel and let the app redirect `optiontradetracker.com` to `www.optiontradetracker.com`.
