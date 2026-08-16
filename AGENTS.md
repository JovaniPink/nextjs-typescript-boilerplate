<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ
from your training data. Read the relevant guide in `node_modules/next/dist/docs/`
(resolved from this file's directory; in monorepos the `next` package may not be visible
from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at
`node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff
only re-creates the uncommitted change; committing it with your work keeps the tree
clean.

<!-- END:nextjs-agent-rules -->

# Repository operating guide

## Purpose

This repository is the shared baseline for new Next.js projects. Keep it small,
provider-neutral, and production-minded. Product-specific dependencies belong in the
products that need them, not in the starter.

## Prerequisites

- Node.js `>=22.15.0`
- npm
- Install from the lockfile with `npm ci`

## Canonical commands

| Command                    | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `npm run dev`              | Start the local Next.js server                |
| `npm run build`            | Create the production build                   |
| `npm run lint`             | Run ESLint                                    |
| `npm run format:check`     | Verify Prettier formatting                    |
| `npm run toolchain:check`  | Validate the dual-compiler contract           |
| `npm run typecheck`        | Check with the TypeScript 7 native CLI        |
| `npm run typecheck:compat` | Check with the TypeScript 6 compatibility API |
| `npm test`                 | Run Jest                                      |
| `npm run test-all`         | Run the complete repository gate              |

## Working rules

- Use App Router under `src/app` and keep server components as the default.
- Add `"use client"` only at explicit interactive boundaries.
- Keep TypeScript strict and use the `@/*` import alias for application code.
- Use Tailwind CSS v4 and semantic theme tokens from `src/app/globals.css`.
- Prefer accessible semantic queries in tests; do not add snapshots for ordinary UI.
- Do not add authentication, persistence, analytics, state management, or provider
  configuration without a concrete product requirement.
- Keep dependencies pinned in `package.json` and update `package-lock.json` with npm.

## Quality gate

Before finishing a code change, run:

- `npm run test-all`
- `npm run audit:production`
- `npm run audit:dependencies`

CI must continue to validate Node 22 and Node 24 from the committed lockfile.
