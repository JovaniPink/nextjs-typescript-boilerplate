/** @jest-environment node */

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns a deterministic, uncached health contract", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      service: "nextjs-typescript-boilerplate",
      status: "ok",
    });
  });
});
