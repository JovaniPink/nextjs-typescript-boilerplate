import { ReadinessCheck } from "@/components/readiness-check";

const standards = [
  {
    eyebrow: "Framework",
    title: "Modern by default",
    detail: "App Router, React 19, server-first components, and Turbopack.",
  },
  {
    eyebrow: "Confidence",
    title: "One honest gate",
    detail: "Formatting, lint, two compilers, tests, coverage, and a production build.",
  },
  {
    eyebrow: "Operations",
    title: "Ready to maintain",
    detail: "Pinned dependencies, audit commands, CI, Renovate, and a health contract.",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
      <nav
        className="flex items-center justify-between border-b border-line pb-5"
        aria-label="Primary"
      >
        <a
          className="font-mono text-xs font-semibold tracking-[0.18em] uppercase"
          href="#top"
        >
          Next / TypeScript
        </a>
        <a
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-ink"
          href="/api/health"
        >
          Health endpoint
        </a>
      </nav>

      <section
        id="top"
        className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:py-24"
      >
        <div>
          <p className="mb-5 inline-flex rounded-full bg-accent px-3 py-1 font-mono text-xs font-semibold tracking-[0.14em] uppercase">
            Production-minded starter
          </p>
          <h1 className="max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.055em] text-balance sm:text-7xl lg:text-8xl">
            Start with the quality bar already in place.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            A focused Next.js baseline for turning an idea into a maintainable
            product—without carrying six years of obsolete defaults into day one.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-surface transition hover:-translate-y-0.5 hover:shadow-lg"
              href="https://nextjs.org/docs/app"
            >
              Read the Next.js docs
            </a>
            <a
              className="rounded-full border border-line bg-surface px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-ink"
              href="#standards"
            >
              Explore the baseline
            </a>
          </div>
        </div>

        <ReadinessCheck />
      </section>

      <section
        id="standards"
        className="border-t border-line py-12 sm:py-16"
        aria-labelledby="standards-title"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.14em] text-accent-strong uppercase">
              Baseline
            </p>
            <h2
              id="standards-title"
              className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
            >
              Small surface. Serious defaults.
            </h2>
          </div>
          <code className="w-fit whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 font-mono text-xs">
            npm run test-all
          </code>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {standards.map((standard, index) => (
            <li
              key={standard.title}
              className="rounded-3xl border border-line bg-surface p-6 shadow-[0_18px_50px_rgb(23_33_29/0.05)]"
            >
              <div className="flex items-center justify-between font-mono text-xs font-semibold tracking-[0.12em] text-muted uppercase">
                <span>{standard.eyebrow}</span>
                <span>0{index + 1}</span>
              </div>
              <h3 className="mt-12 text-2xl font-semibold tracking-[-0.03em]">
                {standard.title}
              </h3>
              <p className="mt-3 leading-7 text-muted">{standard.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex flex-col justify-between gap-3 border-t border-line py-6 text-sm text-muted sm:flex-row">
        <p>
          Edit <code className="font-mono text-xs text-ink">src/app/page.tsx</code> to
          begin.
        </p>
        <p>Next.js 16 · React 19 · TypeScript 7/6</p>
      </footer>
    </main>
  );
}
