import type { VerificationStatus } from "./contract";

const evidenceLabels: Record<VerificationStatus, string> = {
  unreviewed: "Unreviewed",
  "source-reviewed": "Source reviewed",
  corroborated: "Corroborated",
  contested: "Contested",
  superseded: "Superseded",
  corrected: "Corrected",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function joinClassNames(base: string, className?: string): string {
  return className ? `${base} ${className}` : base;
}

export function EvidenceStatus({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  return (
    <span
      className={joinClassNames("knowledge-evidence-status", className)}
      data-evidence-status={status}
    >
      {evidenceLabels[status]}
    </span>
  );
}

export interface KnowledgeSourceSummary {
  id: string;
  title: string;
  publisher: string;
  url: string;
  retrievedAt?: string;
}

export function SourceList({
  sources,
  className,
}: {
  sources: KnowledgeSourceSummary[];
  className?: string;
}) {
  if (sources.length === 0) return null;
  return (
    <section className={joinClassNames("knowledge-sources", className)}>
      <h2>Sources</h2>
      <ol>
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url}>{source.title}</a>
            <span> - {source.publisher}</span>
            {source.retrievedAt ? (
              <span>
                {" "}
                (retrieved{" "}
                <time dateTime={source.retrievedAt}>
                  {formatDate(source.retrievedAt)}
                </time>
                )
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Limitations({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <aside className={joinClassNames("knowledge-limitations", className)}>
      <h2>Limitations</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}

export interface RelatedResourceSummary {
  id: string;
  title: string;
  url: string;
  relationship: string;
}

export function RelatedResources({
  resources,
  className,
}: {
  resources: RelatedResourceSummary[];
  className?: string;
}) {
  if (resources.length === 0) return null;
  return (
    <nav
      className={joinClassNames("knowledge-related-resources", className)}
      aria-labelledby="knowledge-related-resources-heading"
    >
      <h2 id="knowledge-related-resources-heading">Related resources</h2>
      <ul>
        {resources.map((resource) => (
          <li key={resource.id}>
            <a href={resource.url}>{resource.title}</a>
            <span> ({resource.relationship})</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ModelRunSummary({
  methodVersion,
  runAt,
  deterministic,
  inputCount,
  className,
}: {
  methodVersion: string;
  runAt: string;
  deterministic: boolean;
  inputCount: number;
  className?: string;
}) {
  return (
    <section className={joinClassNames("knowledge-model-run", className)}>
      <h2>Model run</h2>
      <dl>
        <div>
          <dt>Method version</dt>
          <dd>{methodVersion}</dd>
        </div>
        <div>
          <dt>Run date</dt>
          <dd>
            <time dateTime={runAt}>{formatDate(runAt)}</time>
          </dd>
        </div>
        <div>
          <dt>Inputs</dt>
          <dd>{inputCount}</dd>
        </div>
        <div>
          <dt>Replay boundary</dt>
          <dd>{deterministic ? "Deterministic" : "Non-deterministic"}</dd>
        </div>
      </dl>
    </section>
  );
}

export function ForecastSummary({
  target,
  horizon,
  cutoffAt,
  probability,
  methodVersion,
  className,
}: {
  target: string;
  horizon: string;
  cutoffAt: string;
  probability: number;
  methodVersion: string;
  className?: string;
}) {
  return (
    <section className={joinClassNames("knowledge-forecast", className)}>
      <h2>Forecast</h2>
      <p>{target}</p>
      <dl>
        <div>
          <dt>Probability</dt>
          <dd>{Math.round(probability * 100)}% probability</dd>
        </div>
        <div>
          <dt>Horizon</dt>
          <dd>{horizon}</dd>
        </div>
        <div>
          <dt>Evidence cutoff</dt>
          <dd>
            <time dateTime={cutoffAt}>{formatDate(cutoffAt)}</time>
          </dd>
        </div>
        <div>
          <dt>Method version</dt>
          <dd>{methodVersion}</dd>
        </div>
      </dl>
    </section>
  );
}

export interface CorrectionSummary {
  id: string;
  recordedAt: string;
  summary: string;
  replacementId: string;
}

export function CorrectionHistory({
  corrections,
  className,
}: {
  corrections: CorrectionSummary[];
  className?: string;
}) {
  if (corrections.length === 0) return null;
  return (
    <section className={joinClassNames("knowledge-corrections", className)}>
      <h2>Correction history</h2>
      <ol>
        {corrections.map((correction) => (
          <li key={correction.id}>
            <time dateTime={correction.recordedAt}>
              {formatDate(correction.recordedAt)}
            </time>
            <span>: {correction.summary}</span>
            <span> Replacement: {correction.replacementId}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RetrospectiveSummary({
  periodStart,
  periodEnd,
  findings,
  remainingUnknowns,
  className,
}: {
  periodStart: string;
  periodEnd: string;
  findings: string[];
  remainingUnknowns: string[];
  className?: string;
}) {
  return (
    <section className={joinClassNames("knowledge-retrospective", className)}>
      <h2>Retrospective</h2>
      <p>
        <time dateTime={periodStart}>{formatDate(periodStart)}</time> to{" "}
        <time dateTime={periodEnd}>{formatDate(periodEnd)}</time>
      </p>
      <h3>Findings</h3>
      <ul>
        {findings.map((finding) => (
          <li key={finding}>{finding}</li>
        ))}
      </ul>
      <h3>Remaining unknowns</h3>
      <ul>
        {remainingUnknowns.map((unknown) => (
          <li key={unknown}>{unknown}</li>
        ))}
      </ul>
    </section>
  );
}
