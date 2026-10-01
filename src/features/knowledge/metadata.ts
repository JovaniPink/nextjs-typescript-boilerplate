import type { KnowledgeDomain, KnowledgeObjectKind } from "./contract";

export interface KnowledgeMetadataInput {
  canonicalUrl: string;
  title: string;
  summary: string;
  kind: KnowledgeObjectKind;
  publishedAt?: string;
  modifiedAt?: string;
  authorName?: string;
  domains: readonly KnowledgeDomain[];
}

function assertHttpsUrl(value: string): void {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error("Knowledge metadata requires an HTTPS canonical URL.");
  }
}

export function buildKnowledgeMetadata(input: KnowledgeMetadataInput) {
  assertHttpsUrl(input.canonicalUrl);
  return {
    title: input.title,
    description: input.summary,
    alternates: { canonical: input.canonicalUrl },
    openGraph: {
      type: "article" as const,
      url: input.canonicalUrl,
      title: input.title,
      description: input.summary,
      ...(input.publishedAt ? { publishedTime: input.publishedAt } : {}),
      ...(input.modifiedAt ? { modifiedTime: input.modifiedAt } : {}),
    },
  };
}

export function buildKnowledgeJsonLd(input: KnowledgeMetadataInput) {
  assertHttpsUrl(input.canonicalUrl);
  return {
    "@context": "https://schema.org",
    "@type": input.kind === "dataset" ? "Dataset" : "Article",
    additionalType: `urn:jovanipink:knowledge-object:${input.kind}`,
    url: input.canonicalUrl,
    headline: input.title,
    description: input.summary,
    about: input.domains,
    ...(input.publishedAt ? { datePublished: input.publishedAt } : {}),
    ...(input.modifiedAt ? { dateModified: input.modifiedAt } : {}),
    ...(input.authorName
      ? { author: { "@type": "Person", name: input.authorName } }
      : {}),
  };
}
