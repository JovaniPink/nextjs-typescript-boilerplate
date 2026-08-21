# XState

Use XState when a workflow has states that matter to the product, not simply because a
component has state. A state machine should make impossible transitions impossible and
make every external effect visible at a named boundary.

This guide describes XState 5-style patterns. Install `xstate` and `@xstate/react` in a
product only after the workflow justifies them.

## Good triggers for a machine

Reach for a machine when several of these are true:

- the workflow has three or more meaningful phases;
- events are legal in some states and illegal in others;
- async work can succeed, fail, time out, or be canceled;
- the interface needs guarded transitions or explicit retry policy;
- multiple components observe or send events to one workflow;
- the sequence must be tested independently from React;
- nested or parallel states describe the product more clearly than booleans.

Use local React state for a disclosure, selected tab, input value, or another small
interaction. Do not turn `isOpen`, `isLoading`, and `hasError` into contradictory
boolean combinations and then call the result a workflow.

## Model vocabulary

- **State** describes the current phase, such as `idle`, `submitting`, or `success`.
- **Event** describes something that happened, such as `SUBMIT`, `CANCEL`, or `RETRY`.
- **Context** holds data needed across transitions.
- **Guard** answers whether a transition is allowed.
- **Action** performs a synchronous update or notification.
- **Actor** owns async work or another independently running process.

Events should express domain intent rather than DOM mechanics. Prefer `SUBMIT_PROFILE`
to `BUTTON_CLICKED`. Keep event payloads minimal and typed.

## A small async machine

The example below is illustrative and intentionally provider-neutral:

```ts
import { assign, fromPromise, setup } from "xstate";

type SaveInput = { displayName: string };
type SaveOutput = { receiptId: string };

type Context = {
  input: SaveInput | null;
  receiptId: string | null;
  errorCode: "network" | "server" | null;
};

type Event =
  { type: "SUBMIT"; input: SaveInput } | { type: "RETRY" } | { type: "RESET" };

export function createSaveMachine(
  save: (input: SaveInput, signal: AbortSignal) => Promise<SaveOutput>,
) {
  return setup({
    types: {
      context: {} as Context,
      events: {} as Event,
    },
    actors: {
      saveRequest: fromPromise(
        ({ input, signal }: { input: SaveInput; signal: AbortSignal }) =>
          save(input, signal),
      ),
    },
    actions: {
      rememberInput: assign(({ event }) =>
        event.type === "SUBMIT" ? { input: event.input, errorCode: null } : {},
      ),
      rememberReceipt: assign(({ event }) =>
        "output" in event ? { receiptId: event.output.receiptId, errorCode: null } : {},
      ),
      rememberFailure: assign({ errorCode: "network" }),
      clear: assign({ input: null, receiptId: null, errorCode: null }),
    },
  }).createMachine({
    id: "save-profile",
    initial: "idle",
    context: { input: null, receiptId: null, errorCode: null },
    states: {
      idle: {
        on: { SUBMIT: { target: "saving", actions: "rememberInput" } },
      },
      saving: {
        invoke: {
          src: "saveRequest",
          input: ({ context }) => {
            if (!context.input) throw new Error("Save input is required.");
            return context.input;
          },
          onDone: { target: "success", actions: "rememberReceipt" },
          onError: { target: "failure", actions: "rememberFailure" },
        },
      },
      success: {
        on: { RESET: { target: "idle", actions: "clear" } },
      },
      failure: {
        on: {
          RETRY: "saving",
          RESET: { target: "idle", actions: "clear" },
        },
      },
    },
  });
}
```

The injected service keeps the machine deterministic in tests. The actor lifecycle
signal lets a real adapter cancel a request when the actor stops. A production adapter
should map raw failures into the feature's typed error taxonomy instead of labeling
every rejection `network`.

## Keep effects at the edge

Prefer pure guards and small `assign` actions. Put fetches, timers that represent
external work, storage, and provider SDK calls in actors or adapters.

Do not read mutable globals from guards. Pass initial services or data as machine input,
and send new external facts as events. This makes a test snapshot explain why a
transition happened.

When time itself matters, name the delay and control it in tests. Clearly label scripted
or mock actors in the user interface; a delayed deterministic response must not be
presented as a model or live service.

## Server authority remains on the server

A browser machine can coordinate a form, editor, simulation control, or training flow.
It must not be the only enforcement for:

- authentication or authorization;
- account balance, quota, or rate limits;
- locking, grading, settlement, or durable status;
- uniqueness and concurrency constraints;
- access to private data;
- irreversible external actions.

The client sends a request. The server validates current facts inside the correct
transaction and returns a receipt or conflict. The machine then observes that result. A
state named `approved` is not proof that an authoritative approval exists.

## Context and persistence

Keep context minimal. Derived display values belong in selectors, not duplicated context
fields. Avoid placing secrets, access tokens, large provider payloads, or
non-serializable SDK objects in context.

Persistence is a separate product decision. If snapshots must survive navigation or
reload:

1. define a versioned public snapshot shape;
2. persist only the minimum non-sensitive fields;
3. validate and migrate the snapshot on read;
4. reconcile it with current server authority;
5. define expiry and reset behavior;
6. test an older and malformed snapshot.

Session-only workflows should clear context on close, sign-out, or reset and should say
so in user language when that behavior matters.

## React and App Router

The component using `useMachine` or `useActor` is a client component. Keep the boundary
as small as possible:

```tsx
"use client";

import { useMachine } from "@xstate/react";

export function SaveProfile({
  machine,
}: {
  machine: ReturnType<typeof createSaveMachine>;
}) {
  const [snapshot, send] = useMachine(machine);
  // Render from snapshot; send domain events from user interactions.
}
```

Pass serializable initial facts from a server component. Do not move an entire route to
the client only because one workflow uses XState.

## Test transitions before components

Machine tests should cover:

- the initial state and context;
- every permitted happy-path transition;
- ignored or rejected events in the wrong state;
- every guard boundary;
- success, typed failure, retry, cancel, and reset;
- duplicate events while an actor is active;
- actor cancellation and stale-result behavior;
- server conflict or updated-fact events;
- persisted snapshot migration when persistence exists.

Then use component tests to prove accessible rendering, focus, and event wiring. Do not
repeat the entire statechart through expensive browser tests.

## Review checklist

- [ ] The state names describe product phases, not implementation booleans.
- [ ] Events are typed domain events with minimal payloads.
- [ ] Guards are deterministic and effects live in actors or adapters.
- [ ] Client state is never treated as server authorization.
- [ ] Context contains no credentials or unnecessary personal data.
- [ ] Async work defines failure, retry, cancellation, and stale-result behavior.
- [ ] Machine tests cover invalid as well as valid transitions.
- [ ] The dependency is justified by workflow complexity.
