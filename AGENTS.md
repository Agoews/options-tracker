# Repository Guidelines

## First Read

For any non-trivial change, read `ARCHITECTURE.md` first. It is the shared source of truth for project structure, layering, style, and consistency rules for both Codex and Claude.

## Project Structure

This is a Next.js 16 App Router application with stable top-level layers:

- `app/`: pages, layouts, route groups, and API handlers
- `components/`: UI primitives and feature components
- `lib/auth/`: auth and runtime session utilities
- `lib/domain/`: schemas, models, and pure business logic
- `lib/server/`: Prisma-backed queries and mutation services
- `prisma/`: schema, migrations, and seeds
- `tests/`: unit, component, and e2e coverage

Do not treat this repo like a minimal scaffold anymore. Preserve these layers and extend them intentionally.

## Build, Test, and Development Commands

Prefer `pnpm` because the repository includes `pnpm-lock.yaml`.

- `pnpm dev`: starts the local development server
- `pnpm build`: creates the production build
- `pnpm start`: serves the production build locally
- `pnpm lint`: runs ESLint
- `pnpm test`: runs Vitest
- `pnpm test:e2e`: runs Playwright tests

## Coding Style

- Use TypeScript and functional React components.
- Follow the existing code style: double quotes, semicolons, and concise component bodies.
- Keep route handlers thin and business logic out of `app/`.
- Keep pure calculations and schemas in `lib/domain/`.
- Keep Prisma access and mutation orchestration in `lib/server/`.

## Verification

- Docs-only changes: run `pnpm lint`
- Non-trivial product changes: run `pnpm lint`, `pnpm test`, and `pnpm build`

## Pull Requests

Use short, imperative commit messages. Keep pull requests scoped, include testing notes, and add screenshots for visible UI changes.
