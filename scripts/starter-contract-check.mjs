import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const rootUrl = new URL("../", import.meta.url);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, rootUrl), "utf8"));
}

const [project, tsconfig] = await Promise.all([
  readJson("package.json"),
  readJson("tsconfig.json"),
]);

const failures = [];
const requiredGeneratedTypes = [".next/types/**/*.ts", ".next/dev/types/**/*.ts"];
const includedPaths = new Set(tsconfig.include ?? []);
const excludedPaths = new Set(tsconfig.exclude ?? []);

for (const generatedTypePath of requiredGeneratedTypes) {
  if (!includedPaths.has(generatedTypePath)) {
    failures.push(`tsconfig.json must include ${generatedTypePath}`);
  }
}

if (excludedPaths.has(".next") || excludedPaths.has(".next/**")) {
  failures.push("tsconfig.json must not exclude generated .next route validators");
}

const expectedPrepareScript = "node scripts/prepare.mjs";
if (project.scripts?.prepare !== expectedPrepareScript) {
  failures.push(`npm run prepare must execute: ${expectedPrepareScript}`);
}

const prepareScenarios = [
  { label: "development dependencies omitted", env: { npm_config_omit: "dev" } },
  {
    label: "multiple dependency classes omitted",
    env: { npm_config_omit: "optional,dev" },
  },
  { label: "production environment", env: { NODE_ENV: "production" } },
];

for (const scenario of prepareScenarios) {
  const result = spawnSync(process.execPath, ["scripts/prepare.mjs"], {
    cwd: new URL(".", rootUrl),
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_ENV: "",
      npm_config_omit: "",
      ...scenario.env,
    },
  });

  if (result.status !== 0) {
    failures.push(
      `prepare must succeed when ${scenario.label}: ${result.stderr.trim() || `exit ${result.status}`}`,
    );
  } else if (!result.stdout.includes("Skipping Git hook setup")) {
    failures.push(`prepare must skip Git hooks when ${scenario.label}`);
  }
}

if (failures.length > 0) {
  console.error(`Starter contract failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(
    "Starter contract passed: production installs skip Git hooks and generated route validators remain typechecked.",
  );
}
