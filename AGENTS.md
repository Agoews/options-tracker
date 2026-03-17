# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Next.js 16 App Router project. Keep route files under `app/`, with `app/layout.tsx` for shared layout, `app/page.tsx` for the home route, and `app/globals.css` for global Tailwind v4 styles. Place static assets in `public/` and reference them by root-relative paths such as `/next.svg`.

There is no `src/` directory yet. If the app grows, keep new route segments, colocated components, and route-specific utilities close to the route that owns them.

## Build, Test, and Development Commands
Prefer `pnpm` because the repository includes `pnpm-lock.yaml`.

- `pnpm dev`: starts the local development server on `http://localhost:3000`.
- `pnpm build`: creates the production build.
- `pnpm start`: serves the production build locally.
- `pnpm lint`: runs ESLint with the Next.js core-web-vitals and TypeScript rules.

## Coding Style & Naming Conventions
Use TypeScript, functional React components, and the existing App Router patterns. Follow the current style: double quotes, semicolons, and 2-space indentation in JSX/TSX blocks as formatted by the existing files. Name route files with Next.js conventions (`page.tsx`, `layout.tsx`) and use PascalCase for extracted component files such as `PositionTable.tsx`.

Keep styling in Tailwind utility classes or `app/globals.css` when a shared global token is required.

## Testing Guidelines
There is no test framework configured yet. For any non-trivial feature, add tests in the same change set and document the command used to run them. Until a framework is introduced, use `pnpm lint` and `pnpm build` as the minimum verification steps before opening a pull request.

If tests are added later, prefer naming patterns like `*.test.ts` or `*.test.tsx` and keep them close to the code they verify.

## Commit & Pull Request Guidelines
The current history starts with a simple seed commit (`Initial commit from Create Next App`). Continue with short, imperative commit messages such as `Add position summary card` or `Wire up portfolio form`.

Pull requests should include a brief summary, testing notes, and screenshots for visible UI changes. Link the relevant issue when one exists, and keep PRs scoped to a single change so review stays straightforward.
