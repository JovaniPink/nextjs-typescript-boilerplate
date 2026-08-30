import { z } from "zod";

import knowledgeObjectJsonSchema from "../../../public/contracts/knowledge-object.v1.schema.json";

export const KNOWLEDGE_CONTRACT_VERSION = "1.0" as const;

export type KnowledgeObjectKind =
  | "source"
  | "note"
  | "claim"
  | "dataset"
  | "scenario"
  | "model-run"
  | "forecast"
  | "observation"
  | "evaluation"
  | "retrospective"
  | "publication";

export type KnowledgeDomain =
  | "economics"
  | "finance"
  | "politics"
  | "policy"
  | "theology"
  | "technology"
  | "sports"
  | "health"
  | "philosophy"
  | "history"
  | "science";

export type VerificationStatus =
  | "unreviewed"
  | "source-reviewed"
  | "corroborated"
  | "contested"
  | "superseded"
  | "corrected";

export interface KnowledgeObjectBase {
  schemaVersion: typeof KNOWLEDGE_CONTRACT_VERSION;
  id: string;
  projectId: string;
  kind: KnowledgeObjectKind;
  legacyIds: string[];
  title: string;
  summary: string;
  dates: {
    createdAt: string;
    updatedAt?: string;
    publishedAt?: string;
    retrievedAt?: string;
    asOf?: string;
    lastReviewedAt?: string;
  };
  provenance: {
    sourceIds: string[];
    methodIds: string[];
    snapshotDigest?: string;
  };
  semantics: {
    domains: KnowledgeDomain[];
    topics: string[];
    tags: string[];
    entities: Array<{
      type:
        | "person"
        | "organization"
        | "place"
        | "team"
        | "policy"
        | "instrument"
        | "institution";
      name: string;
      identifier?: string;
      canonicalUrl?: string;
    }>;
  };
  evidenceStatus: VerificationStatus;
  editorialStatus:
    "draft" | "review" | "ready" | "published" | "corrected" | "archived";
  visibility: "public" | "sanitized" | "private-source";
  limitations: string[];
  relationships: Array<{
    type:
      | "supports"
      | "contradicts"
      | "updates"
      | "derived-from"
      | "about"
      | "used-by"
      | "evaluates"
      | "outcome-of"
      | "related-to"
      | "correction-of";
    targetId: string;
  }>;
  corrections: Array<{
    id: string;
    recordedAt: string;
    summary: string;
    replacesObjectId: string;
    replacementObjectId: string;
  }>;
}

export type KnowledgeObject =
  | (KnowledgeObjectBase & {
      kind: "source";
      source: {
        canonicalUrl: string;
        publisher: string;
        authors?: string[];
        authorityRole:
          | "publisher"
          | "official-record"
          | "primary-source"
          | "secondary-source"
          | "commentary";
        accessStatus:
          "open-access" | "registration-required" | "licensed" | "restricted";
        license: string;
        methodologyWarnings: string[];
      };
    })
  | (KnowledgeObjectBase & {
      kind: "note";
      note: { body: string; sourceIds: string[] };
    })
  | (KnowledgeObjectBase & {
      kind: "claim";
      claim: {
        statement: string;
        claimNature:
          | "observation"
          | "source-claim"
          | "interpretation"
          | "forecast"
          | "scenario"
          | "recommendation";
        sourceIds: string[];
      };
    })
  | (KnowledgeObjectBase & {
      kind: "dataset";
      dataset: {
        canonicalUrl: string;
        publisher: string;
        asOf: string;
        accessConditions: string;
        license: string;
        methodologyWarnings: string[];
      };
    })
  | (KnowledgeObjectBase & {
      kind: "scenario";
      scenario: { assumptions: string[]; sourceIds: string[]; synthetic: boolean };
    })
  | (KnowledgeObjectBase & {
      kind: "model-run";
      modelRun: {
        methodVersion: string;
        runAt: string;
        inputIds: string[];
        outputIds: string[];
        deterministic: boolean;
        seed?: number;
      };
    })
  | (KnowledgeObjectBase & {
      kind: "forecast";
      forecast: {
        cutoffAt: string;
        target: string;
        horizon: string;
        methodVersion: string;
        sourceSnapshotIds: string[];
        sourceSnapshotAsOf: string;
        prediction: { probability: number; unit: "probability" };
        outcomeId?: string;
      };
    })
  | (KnowledgeObjectBase & {
      kind: "observation";
      observation: { observedAt: string; statement: string; sourceIds: string[] };
    })
  | (KnowledgeObjectBase & {
      kind: "evaluation";
      evaluation: {
        evaluatedAt: string;
        subjectIds: string[];
        metrics: Record<string, number>;
        conclusion: string;
      };
    })
  | (KnowledgeObjectBase & {
      kind: "retrospective";
      retrospective: {
        periodStart: string;
        periodEnd: string;
        subjectIds: string[];
        findings: string[];
        remainingUnknowns: string[];
      };
    })
  | (KnowledgeObjectBase & {
      kind: "publication";
      publication: { canonicalUrl: string; publishedAt: string; objectIds: string[] };
    });

const RuntimeKnowledgeObjectSchema = z.fromJSONSchema(
  knowledgeObjectJsonSchema as unknown as Parameters<typeof z.fromJSONSchema>[0],
);

export function parseKnowledgeObject(input: unknown): KnowledgeObject {
  const parsed = RuntimeKnowledgeObjectSchema.parse(input) as KnowledgeObject;
  const [idProject, idKind] = parsed.id.split(":");
  if (idProject !== parsed.projectId || idKind !== parsed.kind) {
    throw new Error(
      "Knowledge object identifier project and kind must match the object fields.",
    );
  }
  if (
    parsed.kind === "forecast" &&
    Date.parse(parsed.forecast.sourceSnapshotAsOf) >
      Date.parse(parsed.forecast.cutoffAt)
  ) {
    throw new Error("Forecast source evidence cannot be newer than its cutoff.");
  }
  for (const correction of parsed.corrections) {
    if (
      correction.replacesObjectId !== parsed.id ||
      correction.replacementObjectId === parsed.id
    ) {
      throw new Error(
        "A correction must link the current object to a distinct replacement version.",
      );
    }
  }
  return parsed;
}

export function parseKnowledgeIndex(input: unknown): KnowledgeObject[] {
  const values = z.array(z.unknown()).parse(input);
  return values.map(parseKnowledgeObject);
}
