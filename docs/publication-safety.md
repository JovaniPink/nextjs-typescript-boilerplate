# Publication safety

Use this checklist before moving material from a private workspace into a public
repository. The safe unit is the complete publication surface: committed files, Git
history, pull-request title and body, comments, screenshots, generated artifacts, test
fixtures, and linked resources.

## Classify before copying

| Class                         | Examples                                                         | Public action                                     |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Public and attributable       | Published standards, original generic examples, approved links   | Cite or rewrite within license terms              |
| Internal but sanitizable      | Reusable architecture pattern, generic workflow lesson           | Rewrite without identifiers or operational detail |
| Secret or authentication data | Tokens, private keys, cookies, credentials, signed URLs          | Never copy; revoke if exposed                     |
| Personal or customer data     | Names, emails, addresses, record IDs, submitted form content     | Never copy without explicit lawful approval       |
| Restricted operational data   | Private hosts, cloud IDs, logs, incidents, private repo names    | Keep private; describe only the generic rule      |
| Licensed third-party data     | Provider payloads, purchased datasets, non-redistributable media | Publish only with redistribution rights           |

When classification is uncertain, withhold the material. Technical access, an accessible
URL, or a working API key does not grant publication or redistribution rights.

## Never publish real secrets

This includes:

- access tokens, API keys, private keys, certificates, recovery codes, and passwords;
- session cookies, authorization headers, signed URLs, and webhook secrets;
- unredacted environment files or command output from authentication tools;
- database connection strings and embedded credentials;
- secrets hidden in screenshots, source maps, archives, notebooks, or generated reports.

Place server secrets in the chosen platform's secret store. Commit an `.env.example`
containing names and safe placeholders only. Remember that variables exposed to browser
bundles are public.

If a secret reaches Git—even briefly—assume history retains it. Stop publication, rotate
or revoke the credential, remove it from the proposed history with an approved process,
and verify the remote state before continuing.

## Rewrite patterns, do not redact documents in place

Redaction is easy to miss in metadata, comments, adjacent rows, or screenshots. Create a
new public artifact that carries only the reusable lesson.

| Private detail             | Public replacement                         |
| -------------------------- | ------------------------------------------ |
| Person or customer name    | Role such as `reviewer` or `account owner` |
| Real email                 | `person@example.com`                       |
| Private URL or host        | `https://service.example.invalid`          |
| Cloud project or bucket ID | `example-project` or `example-bucket`      |
| Real record or incident ID | `record_123` or a narrative without an ID  |
| Exact customer payload     | Minimal synthetic fixture                  |
| Internal repository name   | `the application repository`               |
| Production topology        | The generic responsibility boundary        |

Do not use reversible masking, stable hashes of personal identifiers, or realistic
samples derived from production. Synthetic data should be invented, minimal, and clearly
non-production.

## Preserve useful provenance safely

Public documentation can say that a pattern was distilled from maintained applications
without naming private repositories or exposing their internals. Describe:

- the problem class;
- the generic constraint;
- the architecture or workflow pattern;
- the failure mode it prevents;
- the tests that can prove the public contract.

Do not describe private incident chronology, real users, exact traffic, infrastructure
inventory, vendor negotiations, or security posture to make the pattern sound more
credible.

## Review the staged artifact

Start from a clean branch. Stage only intended paths, then inspect exactly what would be
published:

```bash
git status --short
git diff --cached --stat
git diff --cached
git diff --cached --check
```

Search the staged files for common credential shapes and private-context markers.
Automated scans are a backstop, not proof that prose and screenshots are safe.

```bash
rg -n --hidden \
  -g '!node_modules/**' \
  -g '!.git/**' \
  '(BEGIN (RSA|EC|OPENSSH) PRIVATE KEY|Authorization:|Bearer [A-Za-z0-9._-]+|gh[pousr]_[A-Za-z0-9._-]{20,}|github_pat_[A-Za-z0-9_]{20,})'

rg -n \
  '(/Users/[^/]+|@[A-Za-z0-9.-]+\.(com|net|org)|https?://[^ )]+)' \
  docs/
```

Every match needs human classification. Expected synthetic examples and approved public
links can remain; a scan with zero matches can still miss a secret. The GitHub token
alternatives cover classic personal, OAuth, GitHub App user, GitHub App installation,
refresh, and fine-grained personal access token prefixes documented by GitHub. Keep
provider-native secret scanning enabled because local pattern matching is deliberately
defensive rather than an exhaustive credential detector.

Also inspect:

- image pixels, EXIF data, filenames, and browser chrome;
- notebook outputs and cell history;
- archives and PDFs, including hidden text layers;
- source maps and generated static files;
- test snapshots and fixtures;
- commit messages, branch names, PR descriptions, and comments;
- deleted lines in the diff and earlier commits being pushed.

## Make claims at the right layer

A public document or passing check does not prove that a control is deployed or
effective. In the PR, state:

- exact scope and explicit non-scope;
- source and licensing assumptions;
- validation performed on the exact commit;
- known limits and unverified behavior;
- migration, deployment, and rollback boundaries;
- remaining review required before merge.

Do not publish internal URLs or sensitive evidence to substantiate the claim. Keep
protected evidence in its authorized system and publish only a safe summary.

## Final checklist

- [ ] Every source is public, original, licensed, or rewritten as a generic pattern.
- [ ] No credential, personal data, private identifier, or restricted payload is
      present.
- [ ] Examples are synthetic and use reserved example domains.
- [ ] Screenshots and generated artifacts were inspected, not assumed safe.
- [ ] The staged diff and all commits being pushed were reviewed.
- [ ] Secret scanning ran, and every match was classified.
- [ ] Links resolve only to intentionally public resources.
- [ ] PR prose contains the same protections as the committed files.
- [ ] Review, merge, deployment, and live verification claims remain distinct.
- [ ] A second reviewer is requested when the source material was sensitive or
      ambiguous.
