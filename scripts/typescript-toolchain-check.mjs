import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const rootUrl = new URL("../", import.meta.url);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, rootUrl), "utf8"));
}

function major(version) {
  return Number.parseInt(version.split(".", 1)[0], 10);
}

const [project, nativeCompiler, compatibilityCompiler, renovate] = await Promise.all([
  readJson("package.json"),
  readJson("node_modules/@typescript/native/package.json"),
  readJson("node_modules/typescript/package.json"),
  readJson("renovate.json"),
]);

const failures = [];
const expectedNpmVersion = project.devEngines?.packageManager?.version;
const npmExecutable = process.env.npm_execpath;

if (!npmExecutable || expectedNpmVersion !== "12.0.2") {
  failures.push(
    "package metadata and the active npm executable must identify npm 12.0.2",
  );
} else {
  const activeNpm = spawnSync(process.execPath, [npmExecutable, "--version"], {
    encoding: "utf8",
  });
  const activeNpmVersion = activeNpm.stdout.trim();

  if (activeNpm.status !== 0 || activeNpmVersion !== expectedNpmVersion) {
    failures.push(
      `active npm must be ${expectedNpmVersion}; found ${activeNpmVersion || `exit ${activeNpm.status}`}`,
    );
  }
}

const expectedRenovateRules = {
  "@typescript/native": ">=7 <8",
  typescript: "<7",
};

for (const [dependency, allowedVersions] of Object.entries(expectedRenovateRules)) {
  const matchingRule = renovate.packageRules?.find(
    (rule) =>
      rule.matchManagers?.includes("npm") &&
      rule.matchDepNames?.length === 1 &&
      rule.matchDepNames[0] === dependency,
  );

  if (matchingRule?.allowedVersions !== allowedVersions) {
    failures.push(
      `Renovate must keep ${dependency} within ${allowedVersions} by dependency name`,
    );
  }
}

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
    `Toolchain contract passed: npm ${expectedNpmVersion}; TypeScript CLI ${nativeCompiler.version}; API ${compatibilityCompiler.version}; Renovate lanes 2.`,
  );
}
