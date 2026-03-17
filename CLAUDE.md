# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev               # Start development server
pnpm build             # Production build
pnpm lint              # Run ESLint
pnpm test              # Run Vitest unit tests
pnpm test:watch        # Vitest in watch mode
pnpm test:e2e          # Run Playwright E2E tests

pnpm prisma:generate   # Regenerate Prisma client after schema changes
pnpm prisma:migrate    # Run database migrations
pnpm prisma:seed       # Seed demo data
```

## Architecture Overview

**TradeTracker** is an options trading journal built with Next.js 16 App Router, PostgreSQL/Prisma, and Firebase Auth.

### Auth Flow

Firebase handles identity; the server mints an HTTP-only session cookie. On the client, `firebase-client.ts` signs in with Google and passes the ID token to `POST /api/auth/session`, which uses Firebase Admin (`firebase-admin.ts`) to verify it and set the cookie. Every protected server action calls `requireAppUser()` (`lib/server/auth-user.ts`), which reads the cookie, verifies claims, upserts the user to the DB, and redirects to `/sign-in` or `/onboarding` if needed.

### Data Model

The core pattern is **immutable event sourcing**: every state change (open, roll, assignment, close) appends a `TradeEvent`. The `Trade` row holds denormalized summaries recomputed via `refreshTradeSummary()` after each mutation.

Key relationships:
- `Trade` → many `TradeEvent` records
- `TradeEvent` (ASSIGNMENT) → `Assignment` → `HoldingLot`
- `TradeEvent` (ROLL) → `Roll` linking two events (original + new)
- `HoldingLot` tracks share count and adjusted cost basis

Assignments automatically reduce cost basis: `strike - premium_per_share`.

### Layer Separation

| Layer | Path | Responsibility |
|---|---|---|
| Domain types | `lib/domain/types.ts` | TypeScript types and DTOs |
| Zod schemas | `lib/domain/schemas.ts` | Input validation |
| Calculations | `lib/domain/calculations.ts` | Pure functions: P&L, status inference, dashboard aggregation |
| DB queries | `lib/server/queries.ts` | Read-side: dashboard snapshot, trade detail |
| Mutations | `lib/server/trade-service.ts` | Write-side: Prisma transactions for trade/event/holding/assignment creation |
| API routes | `app/api/` | Thin handlers: validate → call service → return response |
| Pages | `app/(workspace)/` | Server components that fetch data and pass to client components |

### Route Groups

- `(auth)` — `/sign-in`
- `(marketing)` — `/resources` (public)
- `(workspace)` — all protected routes; layout calls `requireAppUser()` to guard access

### Key Calculations (`lib/domain/calculations.ts`)

- `inferStatus()` — derives OPEN/PARTIAL/ASSIGNED/CLOSED from contract/share counts
- `buildDashboardSnapshot()` — aggregates premium collected, realized P&L, unrealized P&L, cost basis at risk
- `calculateStrategyBreakdown()` / `calculatePerformancePoints()` — data for Recharts

### Environment

Requires `.env.local` from `.env.example`. Key vars:
- `DATABASE_URL` / `DIRECT_URL` — PostgreSQL (Prisma needs direct URL for migrations)
- `FIREBASE_*` — Firebase Admin SDK credentials (server-only)
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client SDK (browser)
- `SESSION_COOKIE_NAME` / `SESSION_COOKIE_EXPIRES_DAYS`
