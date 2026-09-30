# Owned project workflow skills

This project selects 3 original workflows from Measured Skills at the full commit in
`project.json`. [Contract](contract.md) and [cases](cases.json) are project-owned.
Generated client copies are self-contained and carry the `starter-` prefix.

Read-only discovery lives in `.agents/skills`; explicit-only Codex workflows live in
`.codex/skills`; Claude copies live in `.claude/skills`. Explicit-only workflows are
physically excluded from Antigravity's shared discovery. Codex 0.154.0 discovery was
observed; actual automatic invocation enforcement and semantic behavior remain
unqualified. Upgrades require a fresh compatibility probe.

Use a reviewed source checkout at exactly the manifest pin:

```sh
python3 /path/to/measured-skills/scripts/project_skills.py --source-root /path/to/measured-skills --project-root . --check
```

Omit `--check` to regenerate after reviewing source/contract changes. Do not edit
generated files. Advance pins explicitly after reviewing upstream owned-source changes
or revocations. Source checkout is our own repository; no third-party skill package is
downloaded or installed.

The generated receipt records source, contract, manifest and file hashes. CI compares
exact bytes without rewriting. Project cases require independent review; no paid model
run, behavioral benefit, physical-device or live-data acceptance is claimed.
