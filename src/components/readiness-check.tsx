"use client";

import { useState } from "react";

export function ReadinessCheck() {
  const [verified, setVerified] = useState(false);

  return (
    <aside
      className="rounded-[2rem] border border-ink bg-ink p-6 text-surface shadow-[0_24px_80px_rgb(23_33_29/0.2)] sm:p-8"
      aria-labelledby="readiness-title"
    >
      <p className="font-mono text-xs font-semibold tracking-[0.14em] text-accent uppercase">
        Interactive boundary
      </p>
      <h2
        id="readiness-title"
        className="mt-3 text-3xl font-semibold tracking-[-0.04em]"
      >
        Ready to make it yours?
      </h2>
      <p className="mt-4 leading-7 text-white/65">
        Server components stay the default. Client state begins here, at an explicit and
        testable boundary.
      </p>
      <button
        type="button"
        aria-pressed={verified}
        className="mt-8 flex w-full items-center justify-between rounded-2xl bg-surface px-5 py-4 text-left font-semibold text-ink transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-90"
        disabled={verified}
        onClick={() => setVerified(true)}
      >
        <span>{verified ? "Baseline verified" : "Verify the interaction"}</span>
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-full bg-accent text-lg"
        >
          {verified ? "Yes" : "Go"}
        </span>
      </button>
      <p className="mt-4 min-h-6 font-mono text-xs text-white/60" aria-live="polite">
        {verified
          ? "Client behavior is wired and observable."
          : "No client JavaScript outside this component."}
      </p>
    </aside>
  );
}
