# Forms

Forms combine user input, validation, network uncertainty, accessibility, privacy, and a
durable server-side decision. Treat the complete submission lifecycle as a contract
rather than a single `onSubmit` callback.

## Choose the smallest form architecture

Start with a native form and a server handler. Add client tooling only for a
demonstrated need.

| Need                                                  | Appropriate starting point                  |
| ----------------------------------------------------- | ------------------------------------------- |
| A few fields and a simple server response             | Native form plus server validation          |
| Rich field errors or conditional client fields        | React Hook Form plus a runtime schema       |
| Meaningful async states, retry rules, or cancellation | Form library plus an explicit state machine |
| Multi-record or privileged business operation         | Server-owned workflow; client observes it   |

React Hook Form, Zod, and XState are optional product dependencies. Do not add them to
the boilerplate until a product needs their contracts.

## One schema, two trust boundaries

Define the accepted shape once and infer input/output types from it.

```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(20).max(4_000),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type Contact = z.output<typeof contactSchema>;
```

Client validation improves feedback. The receiving server must parse the submission
again and must independently enforce authentication, authorization, rate limits,
uniqueness, and business rules. Never accept a client-parsed value as trusted.

Keep honeypots and other anti-automation fields in the schema so they cannot bypass the
same contract. For high-risk forms, use layered abuse controls and do not treat a hidden
field as a security boundary.

## Model submission as a lifecycle

The minimum useful lifecycle is:

```text
idle -> submitting -> success
                   -> failure -> submitting
```

While `submitting`:

- reject or ignore duplicate submissions;
- disable the submit control without disabling the entire form unnecessarily;
- connect request cancellation to component or actor lifecycle;
- preserve the values needed for a safe retry;
- avoid navigation that falsely suggests completion.

Use typed failures instead of one generic error:

| Failure            | What the interface should communicate                        |
| ------------------ | ------------------------------------------------------------ |
| Validation         | Which field needs correction                                 |
| Authentication     | The user must establish or refresh identity                  |
| Conflict           | The record changed; refresh or reconcile                     |
| Rate limit         | Wait before another attempt                                  |
| Network            | The request did not receive a response                       |
| Server             | The service rejected or failed the request                   |
| Timeout or unknown | The request may have completed; do not promise retry is safe |

An elapsed client timeout does not prove the server received nothing. For non-idempotent
writes, use an idempotency key or a server-visible status lookup before offering an
automatic retry.

## Separate the form from the effect

The component should collect valid values and send a typed event or call a narrow
service. The adapter should encode the provider request, apply a timeout, map errors,
and redact logs.

```ts
interface SubmissionService {
  submit(
    input: Contact,
    options: { signal: AbortSignal; idempotencyKey: string },
  ): Promise<{
    receiptId: string;
  }>;
}
```

This boundary makes success, rejection, timeout, abort, and retry behavior testable
without a live provider. It also keeps a future provider migration out of the component
tree.

## Progressive enhancement and provider detection

Preserve native `name`, `method`, and action semantics whenever the hosting path
supports them. If a platform discovers forms from static HTML, keep its detection
artifact synchronized with the visible form and test the field-name contract. A hidden
detection form is build metadata, not a second source of truth.

Do not put provider credentials in browser code. Public environment variables are public
by definition, even when their names contain `KEY` or `TOKEN`.

## Accessibility contract

Every form should provide:

- a programmatic label for every control;
- stable identifiers connecting help and error text with `aria-describedby`;
- `aria-invalid` when a control has an error;
- a visible summary or focused status when submission changes the page meaningfully;
- `role="status"` or a polite live region for success;
- `role="alert"` for errors that require immediate attention;
- keyboard-visible focus and a logical tab order;
- error language that explains recovery without relying on color;
- suitable `autocomplete`, input type, and mobile input mode values.

On success, clear fields only after the server has confirmed acceptance. Move focus to
the success message or next meaningful task. On failure, preserve the user's work and
focus the error summary or first invalid field.

## Privacy and analytics

Collect only fields needed for the stated purpose. Set length limits, retention
expectations, and safe log behavior before launch.

- Never send field values to analytics.
- Gate optional analytics behind the applicable consent contract.
- Record a coarse event such as `contact_submit_success`, not a name, email, message, or
  URL.
- Do not store attribution parameters indefinitely or assume they are safe user
  identifiers.
- Use synthetic addresses and content in tests, fixtures, screenshots, and
  documentation.

## Test the contract

Cover at least:

1. schema acceptance, trimming, limits, and honeypot rejection;
2. idle-to-submitting-to-success behavior;
3. duplicate submission suppression;
4. each user-visible failure class and its recovery path;
5. timeout ambiguity and idempotent retry behavior;
6. abort on unmount or actor stop;
7. field labels, descriptions, errors, live regions, and focus movement;
8. server-side revalidation and safe response bodies;
9. provider detection/build artifacts when the platform requires them;
10. proof that analytics receives no form values.

## Review checklist

- [ ] The server revalidates every untrusted field.
- [ ] Authorization and rate limiting are server-owned.
- [ ] Duplicate and ambiguous submissions have an explicit policy.
- [ ] Success and failure are accessible without sight or a pointer device.
- [ ] Logs, analytics, fixtures, and screenshots contain no submitted personal data.
- [ ] Provider-specific artifacts and the visible field contract cannot drift silently.
- [ ] Tests use deterministic services rather than a live endpoint.
