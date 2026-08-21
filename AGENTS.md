<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ
from your training data. Read the relevant guide in `node_modules/next/dist/docs/`
(resolved from this file's directory; in monorepos the `next` package may not be visible
from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`. Verify at
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

- Node.js `^22.22.2 || ^24.15.0`
- Corepack using the integrity-pinned npm release in `package.json`
- Install from the lockfile with `corepack npm ci`
- Treat any unreviewed dependency install script as a failed supply-chain gate

## Canonical commands

| Command                             | Purpose                                       |
| ----------------------------------- | --------------------------------------------- |
| `corepack npm run dev`              | Start the local Next.js server                |
| `corepack npm run build`            | Create the production build                   |
| `corepack npm run lint`             | Run ESLint                                    |
| `corepack npm run format:check`     | Verify Prettier formatting                    |
| `corepack npm run starter:check`    | Validate install and route-type contracts     |
| `corepack npm run toolchain:check`  | Validate the dual-compiler contract           |
| `corepack npm run typecheck`        | Check with the TypeScript 7 native CLI        |
| `corepack npm run typecheck:compat` | Check with the TypeScript 6 compatibility API |
| `corepack npm test`                 | Run Jest                                      |
| `corepack npm run test-all`         | Run the complete repository gate              |

## Working rules

- Use App Router under `src/app` and keep server components as the default.
- Add `"use client"` only at explicit interactive boundaries.
- Keep TypeScript strict and use the `@/*` import alias for application code.
- Keep `@types/node` on the latest Node 22 line while Node 22 is the oldest supported
  runtime; do not type against APIs unavailable at the lower bound.
- Use Tailwind CSS v4 and semantic theme tokens from `src/app/globals.css`.
- Prefer accessible semantic queries in tests; do not add snapshots for ordinary UI.
- Do not add authentication, persistence, analytics, state management, or provider
  configuration without a concrete product requirement.
- Keep dependencies pinned in `package.json` and update `package-lock.json` with the
  declared Corepack npm release.
- Review and explicitly allow or deny every new dependency install script; never use the
  global allow-all escape hatch.
- Keep Git hooks offline-safe: invoke installed binaries directly and run npm scripts
  through Corepack so hooks cannot fall back to a global client or registry download.
- Keep setup-node package-manager caching disabled while strict npm `devEngines` is in
  force; setup-node queries the runner's bundled npm before Corepack selects npm 12.
- Follow [`docs/coding-agents.md`](docs/coding-agents.md) when extending agent
  instructions and [`docs/publication-safety.md`](docs/publication-safety.md) before
  deriving a public artifact from another workspace or non-public source.

## Quality gate

Before finishing a code change, run:

- `corepack npm install-scripts ls`
- `corepack npm run test-all`
- `corepack npm run audit:production`
- `corepack npm run audit:dependencies`

CI must continue to validate Node 22 and Node 24 from the committed lockfile.
