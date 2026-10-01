# Knowledge contract and presentation primitives

Use this pattern when a product needs to connect sources, analysis, model output,
forecasts, observed outcomes, evaluations, corrections, or retrospectives. It is
optional. A simple marketing page or transactional application should not adopt it
merely for portfolio consistency.

## Authority boundary

The vendored file at `public/contracts/knowledge-object.v1.schema.json` is a public-safe
structural snapshot of `knowledge-contract.v1`. Its SHA-256 manifest binds this
repository to the reviewed bytes. The schema validates shape and controlled vocabulary.
It does not prove that a source is authoritative, licensed, current, or suitable for a
model.

Run the fail-closed check with:

```bash
corepack npm run knowledge:check
```

To adopt a reviewed replacement from an explicitly selected artifact directory:

```bash
corepack npm run knowledge:sync -- --source /path/to/reviewed/artifacts
corepack npm run knowledge:check
```

The sync command accepts a directory containing the schema and its matching manifest. It
verifies the source digest before writing and verifies the destination again afterward.
The repository does not contain a private workspace path or fetch a mutable remote
branch.

## Typed adapter

`src/features/knowledge/contract.ts` exports the stable TypeScript union and runtime
parsing helpers. Parse untrusted JSON at its entry boundary:

```ts
import { parseKnowledgeObject } from "@/features/knowledge";

const knowledgeObject = parseKnowledgeObject(untrustedJson);
```

Validation establishes the contract shape only. Products still need local checks for
source authorization, relationship availability, publication approval, forecast cutoff
custody, and private-data exclusion.

## Metadata utilities

`buildKnowledgeMetadata` returns canonical and Open Graph fields suitable for a Next.js
metadata object. `buildKnowledgeJsonLd` returns a Schema.org projection with an explicit
knowledge-object kind. Both require an HTTPS canonical URL and avoid network access.

Properties should choose the most accurate Schema.org type for their domain when the
generic mapping is not sufficient. Do not label model output as an observed fact or use
metadata to imply endorsement.

## Presentation primitives

`src/features/knowledge/presentation.tsx` provides server-rendered, themeable semantic
components for:

- evidence status;
- source lists and retrieval dates;
- limitations;
- related resources;
- model-run summaries;
- forecasts and evidence cutoffs;
- correction history; and
- retrospective findings and remaining unknowns.

The components add semantic HTML and stable class names, not a visual identity. Each
product owns its theme, headings, editorial language, and disclosure requirements. They
do not use client state, cookies, browser storage, analytics, or external requests.

## Evidence lifecycle

The shared lifecycle is:

`curated source -> dated source snapshot -> question -> analysis or model run -> claim, scenario, or forecast -> observed outcome -> evaluation -> retrospective -> public finding`

Keep every transition explicit. A catalog listing is not permission or model-fitness
evidence. A forecast is immutable after its declared cutoff. A correction creates a
linked replacement. A public finding must retain exact sources, dates, methods,
limitations, and the boundary between observed facts, derived metrics, model output, and
human interpretation.
