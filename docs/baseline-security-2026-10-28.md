# Baseline security reconciliation - October 28, 2026

The unmerged baseline 1.1.1 proposal now admits Next.js/config 16.4.3 and ESLint 9.39.5
together. All profiles retain their runtime, React, TypeScript and deployment
boundaries. No existing consumer changes until it adopts an immutable reviewed pin.

The former Next.js 16.3.8 proposal falls in the affected range of
[GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr). The official
advisory and current Next.js upgrade guide were inspected October 28. The advisory
identifies 16.4.1 as patched; this proposal retains the pilots' 16.4.3. Static export
does not prove every advisory path is reachable, but vulnerable build/development
dependencies still require review.

ESLint 9.39.5 matches the official config plugins' declared peers. It is deprecated;
peer compatibility is not a claim of maintained support. Keep the full rule set and
compat wrapper. Do not use force, legacy-peer-deps, exceptions, or relaxed checks.

Regression fixtures first exercised this pair against the old contract and failed. The
contract and starter move together; the exception regression still rejects framework
drift independently of an ESLint exception. Verify installation, peer integrity, both
Node lanes, baseline tests, complete gates, and both audits.

This change does not tag or release a package or migrate other consumers. Reverting it
restores vulnerable framework versions and is not a qualified recovery path; prefer a
reviewed fix-forward. Hosted billing failures remain separate blockers.

Local verification: the complete gate passes on Node 24.19.0 and 22.22.2, including 28
baseline tests and five application tests. Clean installation, npm ls --all,
install-script review, and both audit gates pass. Production audit reports zero
vulnerabilities. The full audit retains five low-severity Jest/deepmerge paths; its
suggested fix is an incompatible Jest downgrade, which was not applied. This is not a
zero-advisory claim. All registry receipts are dated observations.
