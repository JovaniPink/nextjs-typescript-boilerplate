---
name: starter-react-rendering-performance-diagnosis
description: Diagnose React rendering or request-waterfall costs using an observed interaction, profiler evidence, and actual server/client boundaries. Read-only; do not trigger for speculative blanket memoization, styling, or unmeasured speed claims.
license: MIT
metadata:
  author: "Measured Studios"
  version: "0.18.0"
  plugin: "measured-nextjs-workflows"
  invocation: "implicit"
  provenance: "original"
  risk_class: "read-only"
---

# React Rendering Performance Diagnosis

Read [measured rendering diagnosis](references/measurement.md) only when its checks apply to the task. Project-local copies include a project contract; compare it with current repository settings before relying on it.

## Workflow

1. Name the slow interaction, data scale, runtime/build mode, device/browser, and available traces. Separate observed cost from a suspected cause.
2. Trace request scheduling, server/client serialization, component state ownership, expensive derivation, effects, identity, and render frequency. Read only the reference matching the suspected cost.
3. Use existing profiler or benchmark evidence. If measurements are unavailable, propose a bounded reproducible measurement and label the diagnosis provisional.
4. Propose the smallest change supported by the cost model. Check whether an effect is unnecessary, whether requests can overlap safely, and whether stable identity/state placement avoids repeated work.
5. Return evidence, competing hypotheses, proposed intervention, and a matched before/after protocol. Do not modify files; return Not Needed when no relevant rendering or waterfall question exists.

## Boundaries

Do not add memoization everywhere, alter cache/auth semantics, install profiling packages, or claim improvement from code inspection alone. Account for development instrumentation when interpreting timing.

## Evidence and output

Report the authorized scope, applicable settings, observed evidence, result, missing evidence, and next bounded check. Use Not Needed when no applicable authorized work exists and Blocked when a required precondition is missing. Do not substitute required headings for semantic compliance or invent executed checks.

## Project contract

Read [the project contract](references/project-contract.md) before applying this workflow. Recheck repository settings; report stale contracts as Blocked. User instructions and repository authority remain controlling. For Codex explicit execution, check codex --version: any version other than 0.154.0 blocks execution pending a fresh discovery qualification. Never move explicit workflows into shared discovery as a fallback.
