# Next.js starter workflow contract

Recheck `AGENTS.md`, `package.json`, the lockfile and resolved `next/dist/docs` before
relying on this contract. Preserve Next 16.3.6, React 19.3.0, Tailwind 4, the
integrity-pinned Corepack npm 12.0.2 and both supported Node 22/24 lanes. Preserve
TypeScript 7 native and TypeScript 6 compatibility checks. Keep the managed Next.js
documentation block intact.

Server components remain default under `src/app`; client boundaries serve explicit
interaction. The starter currently has no product authentication, persistence,
analytics, state provider or cache configuration requirement. Cache/auth review returns
Not Needed where those boundaries are absent. Never add them just to exercise a
workflow. Use synthetic public inputs; no product/private account facts in this shared
template.

Derive each task's file allowlist within the named route/components/tests. Exclude
`.next`, generated types, dependencies, lockfiles/toolchain and deployment configuration
unless the task specifically authorizes them. Performance improvement requires matched
observed measurements; code inspection supports hypotheses only.

Run `corepack npm install-scripts ls`, `corepack npm run test-all`,
`corepack npm run audit:production` and `corepack npm run audit:dependencies`. CI
continues both Node lanes from the committed lockfile. Retain semantic accessibility
queries and both compiler gates; report real browser journey and measured performance
evidence independently of build/tests.
