# Next.js TypeScript Boilerplate

A production-minded starting point for small and medium Next.js applications. It
captures the shared baseline used across Jovani Pink's maintained Next.js projects
without pulling in product-specific choices such as authentication, a database, or a
deployment provider.

## What is included

- Next.js 16 App Router and React 19
- Strict TypeScript with a TypeScript 7 native CLI check and a TypeScript 6
  compatibility check
- Tailwind CSS 4 with CSS-first theme tokens
- ESLint 9 flat config and Prettier 3
- Jest 30, Testing Library, semantic component tests, and a route-handler contract test
- One complete `test-all` quality gate for local work and CI
- GitHub Actions on Node 22 and Node 24
- Husky and lint-staged for fast, scoped local feedback
- Production and full dependency audit commands
- Renovate with grouped non-major updates and explicit approval for majors
- Version-matched Next.js documentation guidance for coding agents

## Requirements

- Node.js `>=22.15.0`
- npm

The repository includes an `.nvmrc` for the oldest supported runtime. CI validates both
Node 22 and Node 24.

## Start here

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The health contract is available at
[http://localhost:3000/api/health](http://localhost:3000/api/health).

For a new product, replace the package metadata, page content, and site metadata first.
Keep the quality gate intact while adding only the domain dependencies the product
actually needs.

## Canonical commands

| Command                      | Purpose                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `npm run dev`                | Start the local development server                       |
| `npm run build`              | Create the production build                              |
| `npm start`                  | Serve the production build                               |
| `npm run lint`               | Run ESLint                                               |
| `npm run format:check`       | Verify formatting without changing files                 |
| `npm run toolchain:check`    | Verify the dual TypeScript compiler contract             |
| `npm run typecheck`          | Generate route types and check with TypeScript 7         |
| `npm run typecheck:compat`   | Generate route types and check with TypeScript 6         |
| `npm test`                   | Run the Jest suite                                       |
| `npm run test:ci`            | Run deterministic tests with coverage                    |
| `npm run test-all`           | Run formatting, lint, types, tests, and production build |
| `npm run audit:production`   | Audit runtime dependencies at high severity              |
| `npm run audit:dependencies` | Audit the complete dependency graph at high severity     |

## Project shape

```text
src/
  app/                 App Router layouts, pages, styles, and route handlers
  components/          Reusable UI with explicit client boundaries
test/
  api/                 Route-handler contracts
  app/                 Page-level behavior
  components/          Focused interaction tests
scripts/               Repository and toolchain checks
```

The starter uses a Node.js server deployment by default so every Next.js feature remains
available. Add a provider adapter, static export, database, authentication, analytics,
or state management only when the product requirements justify it.

## Quality contract

Before opening a pull request, run:

```bash
npm run test-all
npm run audit:production
npm run audit:dependencies
```

CI uses the lockfile via `npm ci` and executes the same repository gate. Major
dependency updates remain approval-gated because framework, compiler, and lint majors
need compatibility review rather than automatic merging.

## License

[MIT](LICENSE.md)
