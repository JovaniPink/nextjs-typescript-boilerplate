import { cp, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

describe("knowledge contract artifact check", () => {
  it("accepts the pinned schema and rejects changed bytes", async () => {
    const valid = spawnSync(
      process.execPath,
      ["scripts/knowledge-contract.mjs", "--check"],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(valid.status).toBe(0);
    expect(valid.stdout).toContain("Knowledge contract v1 verified");

    const directory = await mkdtemp(path.join(tmpdir(), "knowledge-contract-"));
    await cp("public/contracts", directory, { recursive: true });
    await writeFile(
      path.join(directory, "knowledge-object.v1.schema.json"),
      "{}\n",
      "utf8",
    );
    const changed = spawnSync(
      process.execPath,
      ["scripts/knowledge-contract.mjs", "--check", "--directory", directory],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(changed.status).not.toBe(0);
    expect(changed.stderr).toContain("digest");
  });
});
