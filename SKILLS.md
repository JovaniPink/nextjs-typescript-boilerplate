# Project workflow routing

This guide is a repository navigation document, not an executable skill entrypoint or an
automatic loader. Read [AGENTS.md](AGENTS.md) first.

## Availability and routing

This integration branch contains 3 project-prefixed workflows selected by
[the manifest](docs/skills/project.json). Pending PR content is not proof that a default
branch or global client has these workflows. Use the guide and entrypoints present in
your current checkout.

| Task                                                  | Workflow                                                                                                               | Invocation          | Required proof                                                                    |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------- |
| Deliver an authorized Next.js vertical slice          | [starter-nextjs-feature-delivery](.codex/skills/starter-nextjs-feature-delivery/SKILL.md)                              | Explicit only       | Project contract and owning gates; report observations separately from hypotheses |
| Review existing cache/auth/server-mutation boundaries | [starter-nextjs-cache-auth-boundary-review](.agents/skills/starter-nextjs-cache-auth-boundary-review/SKILL.md)         | Read-only discovery | Project contract and owning gates; report observations separately from hypotheses |
| Diagnose measured rendering or request costs          | [starter-react-rendering-performance-diagnosis](.agents/skills/starter-react-rendering-performance-diagnosis/SKILL.md) | Read-only discovery | Project contract and owning gates; report observations separately from hypotheses |

All workflows use [the project contract](docs/skills/contract.md). Read-only shared
discovery lives in `.agents/skills`; explicit Codex workflows live in `.codex/skills`
with implicit invocation disabled. Claude copies live in `.claude/skills` with native
explicit controls where applicable. Explicit execution workflows are excluded from
shared discovery. Codex 0.154.0 discovery was observed; invocation enforcement and
behavioral benefit remain separately unqualified. Do not infer compatibility for another
client/version.

## Execution boundaries

Derive a deduplicated path allowlist from the authorized task and current repository
state; preserve existing edits and stop if the allowlist is empty. Never run
unrestricted mutating formatters. Skill selection grants no extra authority for
dependencies, API upgrades, persistence migrations, signing, live data, publication or
deployment.

Read the installed Next.js version documentation through AGENTS.md before code changes.
Preserve Next 16.3.6/React 19.3, Node 22/24, both TypeScript gates and install-script
policy. Do not add auth, persistence or caching just to exercise a workflow.

## Verification and maintenance

Use the canonical commands in [AGENTS.md](AGENTS.md),
[project projection checks](docs/skills/README.md) and
[semantic cases](docs/skills/cases.json). Local tests, exact-head hosted checks, source
merge, device/provider acceptance and deployed/live behavior are separate evidence. A
green older head cannot qualify a changed composition.

The manifest pins Measured source `70182b250beb70bfb210e658387416b891918df1`. Canonical
instructions belong to Measured; project contracts/cases belong here. Generated
entrypoints and receipts must not be edited by hand. Review a source/contract/client
change, regenerate only when needed, and run exact-byte checks before claiming validity.
This guide does not change the pin or certify pending qualification cases.
