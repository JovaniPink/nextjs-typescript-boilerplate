# Application architecture

Use this guide when the starter becomes a product. It keeps framework code, domain
logic, effects, and evidence separate enough to test and change independently.

## Default boundaries

App Router server components are the default. Add a client boundary only when a subtree
needs browser state, an event handler, a browser API, or a client-only library.

```text
src/
  app/                    Routing, layouts, metadata, and transport adapters
  components/             Reusable presentation and small interaction boundaries
  features/<feature>/     Domain UI, workflow, contracts, and focused tests
  lib/                    Cross-feature utilities and external-service adapters
test/
  api/                    Route and transport contracts
  app/                    Page composition and behavior
  components/             User-visible interaction contracts
```

Keep route files thin. A route should translate framework input into a typed domain
call, then translate the result into a response. Domain rules should not depend on
`Request`, `Response`, page metadata, or JSX.

## Put state where its authority lives

| State kind                         | Preferred owner                                   |
| ---------------------------------- | ------------------------------------------------- |
| Shareable navigation and filtering | URL                                               |
| Ephemeral visual state             | Local React state                                 |
| Multi-step client workflow         | Reducer or XState machine                         |
| Remote resource cache              | A data-fetching cache chosen by the product       |
| Durable business record            | Server-side persistence                           |
| Authentication and authorization   | Server-side identity and policy                   |
| Analytics consent                  | Explicit consent contract plus controlled storage |

A client machine may describe what the interface is doing. It cannot authorize a write,
enforce a quota, settle a transaction, or prove that a server operation completed.

## Contracts at every boundary

Use runtime validation where untrusted data enters the application:

- form submissions;
- route parameters and query strings;
- cookies and browser storage;
- environment variables;
- webhook or third-party responses;
- persisted records read from an older schema version.

Infer TypeScript types from the runtime schema when practical. Avoid a handwritten type
and a separate validator that can drift. Treat validation success as proof of shape
only; it does not establish authorization, provenance, freshness, or permission to use
the data.

## Effects and adapters

Wrap each external effect behind a narrow interface owned by the feature. Pass the
interface into workflow code so tests can supply deterministic implementations.

```ts
interface ProfileRepository {
  save(input: ValidatedProfile): Promise<SavedProfile>;
}
```

Keep retries, timeouts, idempotency keys, and error mapping near the adapter. Keep
product decisions—such as whether a timeout is safe to retry—in the workflow contract.
Do not expose raw provider errors directly to users or logs.

## Data and evidence

Distinguish these data classes in names and schemas:

- observed facts and their source time;
- user-entered claims;
- derived calculations and their input version;
- model-generated output and its model/configuration version;
- operator decisions and their actor/time;
- cached projections that can be rebuilt.

Store provenance when a result needs to be reproduced or audited. Technical access to a
data source is not evidence of licensing or redistribution permission. Record the
applicable terms before building an import or public export path.

## Errors are part of the contract

Use a small typed error taxonomy at feature boundaries. A form submission, for example,
may need to distinguish validation, authentication, conflict, rate-limit, server,
network, and ambiguous-timeout outcomes. Map internal errors to safe user language and
structured logs.

Never place secrets, complete third-party payloads, private URLs, or personal form
values in logs. Prefer stable error codes, request correlation identifiers, and redacted
metadata.

## Testing strategy

Test at the narrowest layer that proves the behavior:

1. schema tests for accepted and rejected inputs;
2. pure domain tests for calculations and invariants;
3. machine or reducer tests for allowed transitions;
4. component tests for labels, focus, status, and user interactions;
5. route tests for status, headers, and safe response bodies;
6. browser tests only for integration risks the smaller tests cannot prove.

Prefer semantic assertions over snapshots. Freeze time, random values, and external
services in tests. A fixture should be synthetic, minimal, and licensed for the
repository.

## Dependency and platform decisions

Add a dependency only when its contract is clearer or safer than a local implementation.
For a major library, state:

- the problem it owns;
- the alternative that was rejected;
- the server/client and bundle boundary;
- the maintenance and security posture;
- the exit or migration path.

Hosting, authentication, databases, analytics, background jobs, and state libraries
remain product decisions. Document them in that product instead of silently turning the
shared starter into a platform-specific template.
