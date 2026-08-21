# Coding agents

Coding agents are most reliable when the repository gives them current commands,
explicit boundaries, and evidence requirements. The goal of an agent guide is not to
restate a style guide; it is to prevent plausible but unsafe work.

## Instruction scope

Place `AGENTS.md` at the repository root for repository-wide rules. Add a nested guide
only when a subtree has materially different commands or invariants. The nearest
applicable guide should be more specific without contradicting higher-level safety
rules.

A short compatibility file may point another agent to the canonical guide:

```md
@AGENTS.md
```

Avoid maintaining two copies of the same instructions. They will drift.

## What an effective guide contains

### Purpose and status

State what the product is, which part of the system this repository owns, and what does
not exist yet. This keeps a documented proposal, fixture-backed prototype, and
production service from being described as the same thing.

### Prerequisites and canonical commands

Name the supported runtime, package manager, lockfile command, development command, and
one complete validation gate. Agents should not invent a package manager or bypass the
committed dependency graph with an ad hoc tool invocation.

### Architecture and invariants

Document rules that a reasonable refactor could accidentally violate:

- server/client component boundaries;
- authoritative data owner;
- state and persistence policy;
- route, naming, and module conventions;
- source provenance or licensing constraints;
- provider and deployment boundaries;
- security and privacy controls;
- behavior that requires an ADR or owner decision.

Explain why high-risk invariants exist. A rule with a failure mode is easier to preserve
than a bare prohibition.

### Command and authority policy

Separate ordinary implementation commands from actions that need explicit authorization:

- dependency installation that changes the lockfile;
- destructive Git operations;
- force pushes or history rewriting;
- database migrations or destructive data commands;
- infrastructure applies;
- secret or identity changes;
- production deployment;
- external messages, issue changes, or merges.

Passing tests does not authorize any of these actions.

## Version-matched framework guidance

Framework behavior changes faster than model training data. When installed packages
include local documentation, tell agents to read the version-matched material before
changing framework APIs. For this repository, the generated Next.js block in `AGENTS.md`
points to documentation bundled in `node_modules/next/dist/docs/`.

Do not casually delete framework-generated instruction blocks. Verify whether the
development server will recreate them and keep the working tree dirty.

## Safe operating sequence

An agent working in a repository should:

1. read every applicable instruction file;
2. inspect Git status, branch, remotes, and existing changes;
3. locate the current implementation and tests before proposing a replacement;
4. read version-matched framework or library documentation;
5. state assumptions and keep the change within the requested authority;
6. preserve unrelated user changes;
7. implement the smallest coherent change;
8. run focused checks, then the canonical repository gate;
9. inspect the final diff for scope, generated files, secrets, and sensitive data;
10. report exact commit, check, PR, merge, deployment, and verification states
    separately.

When publishing, stage explicit paths in a mixed worktree. Default to a draft pull
request unless the owner asks for ready-for-review status. Never merge or deploy merely
because publication was requested.

## Public-repository safety

Agent instructions themselves are public content in a public repository. Do not include:

- credentials, token formats copied from real output, or authentication material;
- employee, customer, or user identities and contact information;
- private repository, host, bucket, project, account, or environment identifiers;
- real incident payloads, logs, request URLs, or screenshots;
- local absolute paths containing a username;
- proprietary architecture or vendor terms not cleared for publication.

Use roles, synthetic examples, `example.invalid` URLs, and generic identifiers. Link to
[Publication safety](publication-safety.md) for the complete review.

## A minimal template

```md
# Repository operating guide

## Purpose

Describe the repository's responsibility and current status.

## Prerequisites

- Supported runtime
- Canonical package manager
- Lockfile install command

## Canonical commands

| Command | Purpose |
| ------- | ------- |
| ...     | ...     |

## Working rules

- State architecture, data, privacy, and provider invariants.
- Name choices that require a product decision or ADR.

## Quality gate

- List the complete commands required before review.

## Command policy

- Name destructive, release, infrastructure, and external actions that need approval.
```

Keep the guide concise enough to be read on every task. Put detailed architecture in
`docs/` and link it rather than turning the operating guide into a product encyclopedia.

## Review agent-authored work

Review the artifact, not the agent's confidence. Check:

- whether the diff matches the request and excludes unrelated files;
- whether claims cite the exact commit and executed checks;
- whether tests cover failure and permission boundaries;
- whether a new dependency or platform choice was justified;
- whether sensitive data appears in code, prose, fixtures, screenshots, history, or PR
  text;
- whether the PR incorrectly implies merge, deployment, or live verification;
- whether rollback is possible and stated for higher-risk changes.

An agent can produce evidence. Ownership and release authority remain human decisions
unless an explicit workflow delegates them.
