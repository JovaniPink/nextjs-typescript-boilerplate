import { render, screen } from "@testing-library/react";

import {
  CorrectionHistory,
  EvidenceStatus,
  ForecastSummary,
  Limitations,
  ModelRunSummary,
  RelatedResources,
  RetrospectiveSummary,
  SourceList,
} from "@/features/knowledge";

describe("knowledge presentation primitives", () => {
  it("presents evidence and sources with accessible semantic structure", () => {
    render(
      <article>
        <h1>Research finding</h1>
        <EvidenceStatus status="source-reviewed" />
        <SourceList
          sources={[
            {
              id: "example-project:source:public-record",
              title: "Public record",
              publisher: "Example Agency",
              url: "https://example.com/public-record",
              retrievedAt: "2026-08-30",
            },
          ]}
        />
        <Limitations items={["This is a synthetic fixture."]} />
        <RelatedResources
          resources={[
            {
              id: "example-project:publication:related",
              title: "Related publication",
              url: "https://example.com/related",
              relationship: "derived-from",
            },
          ]}
        />
      </article>,
    );

    expect(screen.getByText("Source reviewed")).toHaveAttribute(
      "data-evidence-status",
      "source-reviewed",
    );
    expect(screen.getByRole("heading", { name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Public record" })).toHaveAttribute(
      "href",
      "https://example.com/public-record",
    );
    expect(screen.getByRole("heading", { name: "Limitations" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Related resources" }),
    ).toBeInTheDocument();
  });

  it("keeps model output, forecasts, corrections, and retrospectives explicit", () => {
    render(
      <div>
        <ModelRunSummary
          methodVersion="baseline-v1"
          runAt="2026-08-30T12:00:00Z"
          deterministic
          inputCount={3}
        />
        <ForecastSummary
          target="Home team win"
          horizon="Week 1"
          cutoffAt="2026-08-30T14:00:00Z"
          probability={0.61}
          methodVersion="baseline-v1"
        />
        <CorrectionHistory
          corrections={[
            {
              id: "example-project:correction:record-v2",
              recordedAt: "2026-08-30T15:00:00Z",
              summary: "Corrected the retrieval date.",
              replacementId: "example-project:source:record-v2",
            },
          ]}
        />
        <RetrospectiveSummary
          periodStart="2026-08-01"
          periodEnd="2026-08-30"
          findings={["The baseline remained calibrated in the synthetic sample."]}
          remainingUnknowns={["Observed performance is not established."]}
        />
      </div>,
    );

    expect(screen.getByRole("heading", { name: "Model run" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Forecast" })).toBeInTheDocument();
    expect(screen.getByText("61% probability")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Correction history" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Retrospective" })).toBeInTheDocument();
    expect(screen.getByText("Remaining unknowns")).toBeInTheDocument();
  });
});
