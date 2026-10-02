import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaFileName = "knowledge-object.v1.schema.json";
const manifestFileName = "knowledge-object.v1.schema.sha256";
const expectedSchemaId = "urn:jovanipink:knowledge-contract:knowledge-object:v1";

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function verifyDirectory(directory) {
  const schemaPath = path.join(directory, schemaFileName);
  const manifestPath = path.join(directory, manifestFileName);
  const [schemaBytes, manifest] = await Promise.all([
    readFile(schemaPath),
    readFile(manifestPath, "utf8"),
  ]);
  const match = manifest.match(
    /^([a-f0-9]{64})  knowledge-object\.v1\.schema\.json\n$/,
  );
  if (!match) {
    throw new Error("Knowledge contract digest manifest is malformed.");
  }
  const actualDigest = createHash("sha256").update(schemaBytes).digest("hex");
  if (actualDigest !== match[1]) {
    throw new Error(
      `Knowledge contract digest mismatch: expected ${match[1]}, received ${actualDigest}.`,
    );
  }
  const schema = JSON.parse(schemaBytes.toString("utf8"));
  if (schema.$id !== expectedSchemaId || !Array.isArray(schema.oneOf)) {
    throw new Error("Knowledge contract schema identity or object union is invalid.");
  }
  return { schemaBytes, manifest, digest: actualDigest };
}

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const destination = path.resolve(
  optionValue("--directory") ?? path.join(repositoryRoot, "public", "contracts"),
);

try {
  if (process.argv.includes("--sync")) {
    const sourceOption = optionValue("--source");
    if (!sourceOption) {
      throw new Error("Knowledge contract sync requires --source DIRECTORY.");
    }
    const source = path.resolve(sourceOption);
    const verifiedSource = await verifyDirectory(source);
    await mkdir(destination, { recursive: true });
    await Promise.all([
      writeFile(path.join(destination, schemaFileName), verifiedSource.schemaBytes),
      writeFile(
        path.join(destination, manifestFileName),
        verifiedSource.manifest,
        "utf8",
      ),
    ]);
  }

  const verified = await verifyDirectory(destination);
  console.log(`Knowledge contract v1 verified at sha256:${verified.digest}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
