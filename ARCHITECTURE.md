# Architecture Guide

This file is the shared architecture and style guide for this repository. Both Codex and Claude should treat it as the source of truth for project structure, layering, and consistency rules.

## Current Structure

The project is already beyond the default Next.js scaffold. The current top-level structure is healthy and should be preserved:

- `app/`: App Router entrypoints, route groups, layouts, loading/error states, and API route handlers.
- `components/`: UI primitives plus feature-level presentation and interaction components.
- `lib/auth/`: Firebase auth runtime and session utilities.
- `lib/domain/`: Domain models, Zod schemas, enums, and pure calculations.
- `lib/server/`: Prisma access, authenticated reads, mutation services, and server-only helpers.
- `prisma/`: Schema, migrations, and seed data.
- `tests/`: Unit, component, and end-to-end tests.
- `public/`: Static assets.

Route grouping is already sensible:

- `app/(auth)`: public auth entrypoints.
- `app/(marketing)`: public marketing and learning content.
- `app/(workspace)`: authenticated product surface.
- `app/api/`: thin HTTP handlers over the server layer.

## Structure Evaluation

Overall assessment: the repo has a strong base. The architecture already shows the right instincts:

- Route groups separate public and authenticated surfaces cleanly.
- `lib/domain` and `lib/server` create a useful boundary between pure business logic and persistence/auth concerns.
- API routes are thin and mostly follow `auth -> validate -> service -> response`.
- Components are grouped by feature, with `components/ui` reserved for reusable primitives.
- Prisma is isolated to the server layer instead of leaking through the UI.

The main risk is not bad structure. The main risk is drift:

- `AGENTS.md` was written for a much smaller scaffold and is now outdated.
- Some logic for shaping holdings and exposure exists in more than one place; repeated mapping logic should be extracted instead of copied further.
- `lib/server/trade-service.ts` is doing a lot. Future trade mutations should prefer helper extraction or service splitting rather than continuing to grow one file indefinitely.

## Architecture Rules

### 1. Keep `app/` thin

Files in `app/` are entrypoints, not the business layer.

- Pages and layouts should fetch data, enforce navigation flow, and compose components.
- Route handlers should authenticate, parse input, call a server function, and format the response.
- Do not put Prisma queries, mutation workflows, or calculation-heavy logic directly in pages or route handlers.

### 2. Keep `lib/domain/` pure

`lib/domain/` is the shared business-language layer.

- Allowed: types, enums, schemas, DTOs, derivations, calculations, formatting rules that are domain-specific.
- Not allowed: Prisma access, `next/*` imports, cookies, headers, redirects, or browser APIs.
- Functions here should be deterministic and easy to test.

If logic can be expressed as a pure function, it belongs here before it belongs in `lib/server/`.

### 3. Keep `lib/server/` as the only persistence boundary

`lib/server/` owns database access, authenticated reads, and mutation orchestration.

- Prisma access should live here, not in `app/` or `components/`.
- Server functions may import from `lib/domain/`, `lib/auth/`, and `lib/utils`.
- Server modules must not import from `components/` or `app/`.
- Mark server-only modules with `import "server-only";` when appropriate.

Preferred split inside `lib/server/`:

- `db.ts`: Prisma client setup.
- `queries.ts`: read models and page/query assembly.
- `*-service.ts`: write workflows and transaction orchestration.
- focused helper files: extracted mutation/query helpers when a service gets too large.

### 4. Keep `components/` focused on rendering and interaction

Component boundaries should follow responsibility, not convenience.

- `components/ui/`: reusable low-level primitives.
- `components/<feature>/`: feature-specific components for dashboard, holdings, trades, auth, resources, layout, and forms.
- Client components may manage UI state and form state, but should not own persistence rules.
- Complex business decisions should be passed in as props or delegated to domain/server helpers.

If a component is only used by one route and is tightly coupled to that route, colocating it under that route segment is acceptable. If it is shared across screens or has product meaning, keep it under `components/`.

### 5. Validate all external input at the edge

Anything coming from the browser, URL params, or external APIs should be parsed before it touches the core workflow.

- Use Zod schemas in `lib/domain/schemas.ts` or split schema files by feature when that file becomes too large.
- API routes should parse request payloads immediately.
- Domain and server functions should prefer typed input objects, not raw request bodies.

### 6. Prefer shared read models over repeated shape-building

If multiple pages or services need the same derived structure:

- extract a shared mapper or selector,
- keep it close to the layer that owns the data,
- and avoid copy-pasting row-building logic across query and mutation code.

This is the main consistency improvement the repo needs next.

### 7. Default to server components

In the App Router:

- use server components by default,
- add `"use client";` only for interactivity, browser APIs, or client-side state that is genuinely needed,
- keep data fetching on the server unless there is a strong UX reason not to.

### 8. Separate mutation workflows from calculations

A good rule:

- calculations, derivations, summaries, and status inference belong in `lib/domain/`,
- transaction sequencing, DB writes, and authorization checks belong in `lib/server/`.

Do not bury business rules inside route handlers or React components.

### 9. Keep tests aligned to the layer

- Pure domain logic: unit tests in `tests/unit/`.
- UI behavior: component tests in `tests/components/`.
- Product flows: Playwright tests in `tests/e2e/`.

When new business rules are added, prefer testing the pure function or server helper first, then add UI coverage only where the user interaction is meaningful.

## Import Direction

Use these dependency directions as guardrails:

- `app` -> may import from `components`, `lib/domain`, `lib/server`, `lib/auth`, `lib/utils`
- `components` -> may import from `components/ui`, `lib/domain`, `lib/client`, `lib/utils`
- `lib/server` -> may import from `lib/domain`, `lib/auth`, `lib/utils`, Prisma
- `lib/domain` -> may import from `lib/utils` only when the dependency remains framework-free
- `lib/auth` -> may import from `lib/server` only if the dependency is auth-specific and server-safe; avoid broad coupling

Forbidden directions:

- `lib/domain` importing `next/*`, Prisma client instances, or UI code
- `lib/server` importing from `app/` or `components/`
- client components importing server-only modules

## Placement Rules

When adding code, use this decision guide:

- New page, layout, loading, error, route group, or route handler: `app/`
- Reusable visual primitive: `components/ui/`
- Product-specific UI for trades, holdings, dashboard, auth, resources, layout, or forms: `components/<feature>/`
- Pure calculation, schema, enum, DTO, or business mapper: `lib/domain/`
- Database read/query or mutation workflow: `lib/server/`
- Auth/session/runtime setup: `lib/auth/`
- Database schema or seed changes: `prisma/`
- Tests: `tests/`

## Style Rules

- Use TypeScript everywhere.
- Follow the existing code style: double quotes, semicolons, and concise functional components.
- Prefer explicit names over short generic ones.
- Keep files cohesive. If a file starts handling multiple responsibilities, split it.
- Avoid introducing a generic `helpers.ts` or `utils.ts` inside feature folders unless the helpers are truly local and cohesive.
- Prefer domain language in names: `trade-service`, `portfolio-capacity`, `holding-row`, `lifecycle-action`.
- Keep DTOs and schema names aligned so request and service contracts are obvious.

## Guidance For Future Growth

These are the next structural moves to make when the codebase grows further:

1. Split large domain or service files by capability, not by arbitrary size.
2. Extract duplicated trade/holding row mappers into shared selectors or read-model builders.
3. Consider feature-local subfolders under `lib/server/` if trades and holdings continue to expand.
4. Keep marketing content isolated from workspace logic.
5. Update this file whenever a new top-level layer or architectural pattern is introduced.

## Instructions For Codex And Claude

Before making non-trivial changes:

1. Read this file and preserve its boundaries.
2. Do not move logic across layers without a concrete reason.
3. If you add a new pattern, document it here in the same change.
4. If a change increases duplication, stop and extract the shared logic instead.
5. Run the appropriate verification commands for the layer you changed.

Minimum verification for meaningful changes:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

For docs-only changes, `pnpm lint` is sufficient unless the change also affects code samples or commands.
