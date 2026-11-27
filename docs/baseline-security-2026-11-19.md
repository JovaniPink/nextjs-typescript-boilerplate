# Baseline security patch - November 19, 2026

Baseline 1.1.2 admits Next.js and `eslint-config-next` 16.4.6 in every profile. React,
TypeScript, ESLint, runtime and deployment contracts are unchanged from 1.1.1.

## What consumers pinned to 1.1.1 will see

Push and pull request checks continue to use the consumer's pinned 1.1.1 verifier. Once
this change merges, `baseline/v1/latest.json` on `main` advertises 1.1.2. The next
scheduled check reads that file and fails with `baseline-currency` because the
consumer's manifest still declares 1.1.1.

To adopt 1.1.2, update the baseline action pin to
`4defc1dbe949e6c3032c0160684340586b12cc36`, set `baselineVersion` to `1.1.2` in
`.github/nextjs-baseline.json`, and update `next` and `eslint-config-next` to `16.4.6`
in the applicable package manifests and lockfiles.

## Why

On November 19 `npm audit` reported seven moderate Next.js advisories against 16.4.3.
Each one's affected range ends at 16.4.4:

- [GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h)
- [GHSA-vc7v-qv4w-wrv8](https://github.com/advisories/GHSA-vc7v-qv4w-wrv8)
- [GHSA-7qx7-33qx-rqx2](https://github.com/advisories/GHSA-7qx7-33qx-rqx2)
- [GHSA-f3mh-rxg3-f5g2](https://github.com/advisories/GHSA-f3mh-rxg3-f5g2)
- [GHSA-pc58-hwjq-p385](https://github.com/advisories/GHSA-pc58-hwjq-p385)
- [GHSA-rhh4-g77r-r9qj](https://github.com/advisories/GHSA-rhh4-g77r-r9qj)
- [GHSA-vvgp-ww4w-46vf](https://github.com/advisories/GHSA-vvgp-ww4w-46vf)

16.4.6 (published November 9) is the newest 16.4 patch. With these advisories open,
`next build` in a consumer stops with a security error, so consumers pinned to 1.1.1
cannot build. A static export does not reach every advisory path, but the build stop
applies regardless.

## Change

The spec, `latest.json`, the starter's own manifest, test fixtures and the starter's
`next` and `eslint-config-next` pins move together. The lockfile change is limited to
the Next.js package family, all from the npm registry.

## Local verification

- `corepack npm run test-all` passes on Node 24.19.0 and 22.22.2, including 28 baseline
  tests and five application tests.
- `corepack npm install-scripts ls` reports no unreviewed install scripts.
- The production audit reports zero vulnerabilities. The full high-severity gate passes,
  and its remaining moderate findings do not include Next.js.

These are dated observations, not a zero-advisory claim. This change does not tag or
release a package or migrate other consumers.
