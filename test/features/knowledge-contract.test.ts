import { parseKnowledgeObject } from "@/features/knowledge";

const sourceFixture = {
  schemaVersion: "1.0",
  id: "example-project:source:public-record",
  projectId: "example-project",
  kind: "source",
  legacyIds: ["public-record"],
  title: "Public record",
  summary: "A synthetic source fixture for the shared starter.",
  dates: {
    createdAt: "2026-08-30",
    retrievedAt: "2026-08-30T12:00:00Z",
    asOf: "2026-08-30T12:00:00Z",
  },
  provenance: { sourceIds: [], methodIds: [] },
  semantics: {
    domains: ["economics"],
    topics: ["public-data"],
    tags: ["synthetic-fixture"],
    entities: [{ type: "organization", name: "Example Agency" }],
  },
  evidenceStatus: "source-reviewed",
  editorialStatus: "ready",
  visibility: "public",
  limitations: ["Shape validation does not establish source authority."],
  relationships: [],
  corrections: [],
  source: {
    canonicalUrl: "https://example.com/public-record",
    publisher: "Example Agency",
    authorityRole: "official-record",
    accessStatus: "open-access",
    license: "Synthetic fixture only.",
    methodologyWarnings: ["Confirm the real publisher methodology before use."],
  },
} as const;

describe("knowledge contract adapter", () => {
  it("accepts a valid object from the vendored schema", () => {
    expect(parseKnowledgeObject(sourceFixture)).toEqual(sourceFixture);
  });

  it("rejects an identifier whose kind differs from the object kind", () => {
    expect(() =>
      parseKnowledgeObject({
        ...sourceFixture,
        id: "example-project:forecast:public-record",
      }),
    ).toThrow();
  });

  it("rejects an unknown contract version", () => {
    expect(() =>
      parseKnowledgeObject({ ...sourceFixture, schemaVersion: "2.0" }),
    ).toThrow();
  });

  it("rejects a project identifier that differs from projectId", () => {
    expect(() =>
      parseKnowledgeObject({
        ...sourceFixture,
        id: "another-project:source:public-record",
      }),
    ).toThrow("project");
  });

  it("rejects forecast evidence captured after the forecast cutoff", () => {
    const base = { ...sourceFixture } as Record<string, unknown>;
    delete base.source;
    expect(() =>
      parseKnowledgeObject({
        ...base,
        id: "example-project:forecast:week-1",
        kind: "forecast",
        forecast: {
          cutoffAt: "2026-08-30T12:00:00Z",
          target: "Home team win",
          horizon: "Week 1",
          methodVersion: "baseline-v1",
          sourceSnapshotIds: [sourceFixture.id],
          sourceSnapshotAsOf: "2026-08-30T12:00:01Z",
          prediction: { probability: 0.61, unit: "probability" },
        },
      }),
    ).toThrow("cutoff");
  });
});
