---
disable-model-invocation: true
name: starter-nextjs-feature-delivery
description: Deliver an explicitly requested Next.js App Router feature within approved routes and files using installed-version documentation. Use for bounded implementation and repository gates; do not trigger for read-only audits or adding infrastructure without a product requirement.
license: MIT
metadata:
  author: "Measured Studios"
  version: "0.18.0"
  plugin: "measured-nextjs-workflows"
  invocation: "explicit"
  provenance: "original"
  risk_class: "bounded-execution"
---

# Next.js Feature Delivery

Read [version-matched delivery](references/delivery.md) only when its checks apply to the task. Project-local copies include a project contract; compare it with current repository settings before relying on it.

## Workflow

1. Establish the user-visible behavior, route boundary, accepted inputs, evidence requirements, repository instructions, and existing edits.
2. Resolve the installed Next.js package and its bundled documentation from the project directory. Preserve managed AGENTS documentation routing, supported Node lanes, lockfile, and compiler contracts.
3. Derive a deduplicated path allowlist from task authority and current changes. Preserve unrelated edits; exclude generated routes/build output/vendor directories. Return Not Needed for empty authorized scope.
4. Implement the smallest slice with server components by default and explicit interactive client boundaries. Reuse existing product capabilities; do not scaffold auth, persistence, analytics, or providers absent a concrete requirement.
5. Test observable behavior, accessibility, error/empty states, and server/client data flow. Run existing type, lint, test, build, and dependency gates, then inspect the final allowlisted diff.

## Boundaries

Do not run broad mutating formatters, framework upgrades, codemods, deployments, package installation, or provider mutations as an incidental step. Unsupported APIs require a compatibility decision.

## Evidence and output

Report the authorized scope, applicable settings, observed evidence, result, missing evidence, and next bounded check. Use Not Needed when no applicable authorized work exists and Blocked when a required precondition is missing. Do not substitute required headings for semantic compliance or invent executed checks.

## Project contract

Read [the project contract](references/project-contract.md) before applying this workflow. Recheck repository settings; report stale contracts as Blocked. User instructions and repository authority remain controlling. For Codex explicit execution, check codex --version: any version other than 0.154.0 blocks execution pending a fresh discovery qualification. Never move explicit workflows into shared discovery as a fallback.
