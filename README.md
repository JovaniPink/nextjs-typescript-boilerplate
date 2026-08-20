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
- Node 22 type definitions so the oldest supported runtime remains the compile-time API
  ceiling
- Husky and lint-staged for fast, scoped local feedback
- Production and full dependency audit commands
- Integrity-pinned npm 12 with fail-closed dependency install scripts
- Renovate with grouped non-major updates and explicit approval for majors
- Version-matched Next.js documentation guidance for coding agents

## Requirements

- Node.js `^22.22.2 || ^24.15.0`
- [Corepack](https://github.com/nodejs/corepack#readme), bundled with both supported
  Node LTS lines

The repository includes an `.nvmrc` for the oldest supported runtime. CI validates both
Node 22 and Node 24. `package.json` pins npm 12.0.2 with an integrity digest and uses
npm's
[`devEngines`](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/#devengines)
contract to reject unsupported Node or npm versions before install, CI, and run
commands.

npm 12 blocks unreviewed dependency install scripts. This starter explicitly denies the
two optional native scripts in the current graph because the complete type, test, and
production-build gates pass without them. `.npmrc` turns any newly introduced,
unreviewed install script into a clean-install failure.

The TypeScript environment intentionally uses the latest Node 22 type definitions. That
keeps code from compiling against a Node 24-only API while the starter still claims Node
22 support.

Git hooks follow the same contract: pre-commit runs the already-installed `lint-staged`
binary without a registry fallback, and pre-push runs the generated-route type gate
through the declared npm release.

## Start here

```bash
corepack npm ci
corepack npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The health contract is available at
[http://localhost:3000/api/health](http://localhost:3000/api/health).

For a new product, replace the package metadata, page content, and site metadata first.
Keep the quality gate intact while adding only the domain dependencies the product
actually needs.

## Canonical commands

| Command                               | Purpose                                                  |
| ------------------------------------- | -------------------------------------------------------- |
| `corepack npm run dev`                | Start the local development server                       |
| `corepack npm run build`              | Create the production build                              |
| `corepack npm start`                  | Serve the production build                               |
| `corepack npm run lint`               | Run ESLint                                               |
| `corepack npm run format:check`       | Verify formatting without changing files                 |
| `corepack npm run toolchain:check`    | Verify the dual TypeScript compiler contract             |
| `corepack npm run typecheck`          | Generate route types and check with TypeScript 7         |
| `corepack npm run typecheck:compat`   | Generate route types and check with TypeScript 6         |
| `corepack npm test`                   | Run the Jest suite                                       |
| `corepack npm run test:ci`            | Run deterministic tests with coverage                    |
| `corepack npm run test-all`           | Run formatting, lint, types, tests, and production build |
| `corepack npm run audit:production`   | Audit runtime dependencies at high severity              |
| `corepack npm run audit:dependencies` | Audit the complete dependency graph at high severity     |

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
corepack npm ci
corepack npm install-scripts ls
corepack npm run test-all
corepack npm run audit:production
corepack npm run audit:dependencies
```

CI uses the lockfile through the integrity-pinned npm release and executes the same
repository gate. The install-script inventory must have no unreviewed entries. Major
dependency updates remain approval-gated because framework, compiler, and lint majors
need compatibility review rather than automatic merging.

## License

[MIT](LICENSE.md)
