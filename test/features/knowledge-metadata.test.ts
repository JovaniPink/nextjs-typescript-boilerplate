import { buildKnowledgeJsonLd, buildKnowledgeMetadata } from "@/features/knowledge";

describe("knowledge metadata", () => {
  const input = {
    canonicalUrl: "https://example.com/research/public-record",
    title: "Public record analysis",
    summary: "An attributed interpretation with a dated evidence boundary.",
    kind: "claim" as const,
    publishedAt: "2026-08-30T12:00:00Z",
    modifiedAt: "2026-08-30T14:00:00Z",
    authorName: "Example Author",
    domains: ["economics", "policy"],
  } as const;

  it("builds canonical and Open Graph metadata without framework state", () => {
    expect(buildKnowledgeMetadata(input)).toEqual({
      title: input.title,
      description: input.summary,
      alternates: { canonical: input.canonicalUrl },
      openGraph: {
        type: "article",
        url: input.canonicalUrl,
        title: input.title,
        description: input.summary,
        publishedTime: input.publishedAt,
        modifiedTime: input.modifiedAt,
      },
    });
  });

  it("labels knowledge kind and domains in Schema.org JSON-LD", () => {
    expect(buildKnowledgeJsonLd(input)).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Article",
      additionalType: "urn:jovanipink:knowledge-object:claim",
      url: input.canonicalUrl,
      about: ["economics", "policy"],
      author: { "@type": "Person", name: "Example Author" },
    });
  });

  it("rejects a non-HTTPS canonical URL", () => {
    expect(() =>
      buildKnowledgeMetadata({ ...input, canonicalUrl: "http://example.com" }),
    ).toThrow("HTTPS");
  });
});
