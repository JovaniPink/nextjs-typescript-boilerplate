# Next.js fleet baseline v1

This directory is the versioned, dependency-free governance contract for Measured
Studios Next.js repositories. It verifies repository declarations and files without
installing dependencies, executing caller scripts, importing caller modules, or
following paths outside the checkout.

## Trust boundary

- `check.mjs` treats the caller manifest, package files, configs, and workflow YAML as
  inert data.
- Repository-relative paths are bounded; absolute paths, traversal, shell fragments,
  duplicates, oversized documents, and out-of-root symlinks fail closed.
- Pull-request and push checks execute a full-SHA-pinned copy of this action.
- Scheduled checks may fetch only `latest.json` over HTTPS. The response is bounded to 4
  KiB, parsed as strict JSON, never executed, and fails closed on network or schema
  errors.
- The checker is additive. Product-specific gates can be stronger and are not removed or
  executed by this action.

Install-script decisions are checked against every dependency marked `hasInstallScript`
in the lockfile, including nested and platform-specific optional packages. Name-only
decisions and exact-version decisions are supported; an unrelated entry does not cover a
dependency. See the
[npm install-script contract](https://docs.npmjs.com/cli/v12/commands/npm-install-scripts/).

CI coverage is checked within actual pull-request and push jobs: Node setup, the
complete gate, install-script review, and both audits must belong to jobs covering Node
22 and 24. The dependency-free reader supports literal versions, static matrix axes, and
include-only matrices. Conditional gates, tolerated failures, aliases, dynamic matrices,
mixed include expansion, and exclusions do not establish coverage. This checks
declarations; successful execution still requires hosted check evidence.

## Profiles

- `stock-static`: App Router applications with `output: "export"` and a static-artifact
  verifier.
- `stock-server`: App Router applications retaining a production Next.js server build.
- `monorepo-hybrid`: repositories with one or more isolated Next.js workspace roots plus
  other runtimes or services.
- `vinext`: the supported Vite/Vinext/Nitro compatibility boundary with
  packaged-artifact tests.

The hybrid profile preserves ESLint 9.39.5 while its workspace compatibility gate
requires that line; it still requires the stock Next.js, React, and dual-TypeScript
versions. This is a profile constraint, not an exception that callers can silently
remove.

A hybrid repository may keep its JavaScript package boundary at the one declared Next.js
application root when the repository root belongs to another runtime. In that case the
app package and lockfile are the Node control surface, while CI is still read from the
repository root. App Router pages may live below route groups; the root layout must
remain at the App Router boundary.

When the repository has a root Node package, every declared app must match its workspace
patterns and must not match an exclusion. Merely placing an app under the repository
root does not make it a workspace.

Framework, TypeScript, and ESLint findings use separate rule identifiers so a temporary
ESLint compatibility exception cannot suppress drift in Next.js, React, or either
TypeScript compiler.

## Caller manifest

Store `.github/nextjs-baseline.json` in the caller. The schema is
`manifest.schema.json`. Exceptions are temporary, rule-specific, issue-backed, and
dated. Unknown, duplicate, expired, unsafe, or unused exceptions fail.

## Local verification

```bash
node baseline/v1/check.mjs \
  --repository-root . \
  --manifest .github/nextjs-baseline.json
node --test baseline/v1/test/check.test.mjs
```

The caller workflow must check out with `persist-credentials: false`, use
`contents: read`, and pin `JovaniPink/nextjs-typescript-boilerplate/baseline/v1` to a
full commit SHA. Only scheduled runs set `check-latest: true`.

Weekly schedules are deterministically staggered from the repository name: interpret the
first three bytes of its SHA-256 digest as unsigned integers, then use byte one modulo
60 for the minute, byte two modulo 24 for the UTC hour, and byte three modulo 7 for the
weekday.
