import { readFile } from "node:fs/promises";

const rootUrl = new URL("../", import.meta.url);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, rootUrl), "utf8"));
}

function major(version) {
  return Number.parseInt(version.split(".", 1)[0], 10);
}

const [project, nativeCompiler, compatibilityCompiler] = await Promise.all([
  readJson("package.json"),
  readJson("node_modules/@typescript/native/package.json"),
  readJson("node_modules/typescript/package.json"),
]);

const failures = [];

if (nativeCompiler.name !== "typescript" || major(nativeCompiler.version) !== 7) {
  failures.push(
    `@typescript/native must resolve to TypeScript 7; found ${nativeCompiler.name}@${nativeCompiler.version}`,
  );
}

if (
  compatibilityCompiler.name !== "typescript" ||
  major(compatibilityCompiler.version) !== 6
) {
  failures.push(
    `typescript must resolve to the TypeScript 6 API line; found ${compatibilityCompiler.name}@${compatibilityCompiler.version}`,
  );
}

const expectedScripts = {
  typecheck: "next typegen && node node_modules/@typescript/native/bin/tsc --noEmit",
  "typecheck:compat": "next typegen && node node_modules/typescript/bin/tsc --noEmit",
};

for (const [name, expected] of Object.entries(expectedScripts)) {
  if (project.scripts?.[name] !== expected) {
    failures.push(`npm run ${name} must execute: ${expected}`);
  }
}

if (failures.length > 0) {
  console.error(`TypeScript toolchain contract failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(
    `TypeScript toolchain contract passed: CLI ${nativeCompiler.version}; API ${compatibilityCompiler.version}.`,
  );
}
