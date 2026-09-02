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
- ESLint 10 flat config and Prettier 3
- Jest 30, Testing Library, semantic component tests, and a route-handler contract test
- One complete `test-all` quality gate for local work and CI
- GitHub Actions on Node 22 and Node 24
- Node 22 type definitions so the oldest supported runtime remains the compile-time API
  ceiling
- Husky and lint-staged for fast, scoped local feedback
- Production and full dependency audit commands
- Integrity-pinned npm 12 with fail-closed dependency install scripts
- Renovate with grouped non-major updates, explicit approval for majors, and role-aware
  TypeScript update lanes
- Version-matched Next.js documentation guidance for coding agents
- A deterministic favicon, browser/device icon family, and web manifest baseline

## Requirements

- Node.js `^22.22.2 || ^24.15.0`
- [Corepack](https://github.com/nodejs/corepack#readme), bundled with both supported
  Node LTS lines

The repository includes an `.nvmrc` for the oldest supported runtime. CI validates both
Node 22 and Node 24. `package.json` pins npm 12.0.2 with an integrity digest and uses
npm's
[`devEngines`](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/#devengines)
contract to reject unsupported Node versions. A package-manager mismatch warns during
bootstrap because some managed build hosts must use their bundled npm once to install
the pinned release. Every repository command and CI job still uses Corepack, and the
toolchain contract verifies the exact installed npm release before validation.

npm 12 blocks unreviewed dependency install scripts. This starter explicitly denies the
two optional native scripts in the current graph because the complete type, test, and
production-build gates pass without them. `.npmrc` turns any newly introduced,
unreviewed install script into a clean-install failure.

CI explicitly disables `actions/setup-node`'s automatic package-manager cache. That
cache queries the runner's bundled npm before Corepack selects the declared npm 12
release. The workflow instead treats the integrity pin, exact toolchain check, and clean
install from the committed lockfile as the reproducibility boundary. Managed hosts that
select npm through an environment setting must select `12.0.2`; the warning exists only
to let the host complete that one-time package-manager bootstrap.

The TypeScript environment intentionally uses the latest Node 22 type definitions. That
keeps code from compiling against a Node 24-only API while the starter still claims Node
22 support. Renovate disables `@types/node` major updates so automation cannot move the
compile-time API ceiling ahead of the oldest supported runtime.

### TypeScript compatibility boundary

The two TypeScript packages have different jobs. `@typescript/native` provides the
TypeScript 7 native CLI used by the primary type check. The unaliased `typescript`
package stays on TypeScript 6 because Next.js and TypeScript-aware tooling still consume
its JavaScript API. Renovate matches those dependency names separately so an automated
major update cannot collapse the two roles. `corepack npm run toolchain:check` verifies
the installed compiler majors, commands, and automation policy together.

### ESLint compatibility boundary

ESLint 10 runs through ESLint's official compatibility utility while the plugins bundled
by `eslint-config-next` still use rule APIs removed in ESLint 10 and declare peer
support only through ESLint 9. The compatibility wrapper preserves the complete React,
hooks, import, accessibility, Next.js, and TypeScript rule configuration; it is not a
suppression and does not rewrite peer metadata. Clean installs will continue to report
the upstream peer-range mismatch until those packages publish native ESLint 10 support.
Track removal of this transition layer in
[issue #211](https://github.com/JovaniPink/nextjs-typescript-boilerplate/issues/211).

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

### Product identity contract

Replace the starter `N/` mark with a reviewed, product-specific mark before launch while
preserving the route contract: `/favicon.ico`, `/icon0` (48x48 PNG), `/icon1` (192x192
PNG), `/apple-icon` (180x180 PNG), and `/manifest.webmanifest`. Keep the icon bytes
deterministic and independent of live application data. Public marketing properties
should also provide branded 1200x630 Open Graph imagery and large-card Twitter metadata.
After changing the reviewed SVG and matching generator geometry, regenerate the
committed starter fallback with `corepack npm run generate:favicon`; the canonical gate
fails if its bytes drift from the generator.

## Application patterns

The [application pattern guide](docs/README.md) distills reusable conventions for
application architecture, forms, XState workflows, coding agents, and safe public
publication. These are opt-in product patterns, not dependencies installed by the
starter.

## Canonical commands

| Command                               | Purpose                                                  |
| ------------------------------------- | -------------------------------------------------------- |
| `corepack npm run dev`                | Start the local development server                       |
| `corepack npm run build`              | Create the production build                              |
| `corepack npm start`                  | Serve the production build                               |
| `corepack npm run lint`               | Run ESLint                                               |
| `corepack npm run format:check`       | Verify formatting without changing files                 |
| `corepack npm run starter:check`      | Verify install and generated-route contracts             |
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
docs/                  Optional application patterns and publication guidance
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

For a multi-stage production image, build the application with development dependencies
available, then install or copy only the runtime graph into the final stage. Running
`corepack npm ci --omit=dev` still executes npm lifecycle hooks; this starter's prepare
contract deliberately skips Husky in that path instead of requiring a development-only
binary. `starter:check` also prevents `.next/types` and `.next/dev/types` from being
silently excluded after `next typegen`, so invalid App Router signatures remain part of
both TypeScript gates.

## License

[MIT](LICENSE.md)
