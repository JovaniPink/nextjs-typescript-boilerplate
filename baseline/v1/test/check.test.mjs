import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  BaselineInputError,
  checkRepository,
  fetchLatestDocument,
  validateLatestDocument,
} from "../check.mjs";

const fixtureRoot = new URL("./fixtures/", import.meta.url);
const actionReference =
  "JovaniPink/nextjs-typescript-boilerplate/baseline/v1@0123456789abcdef0123456789abcdef01234567";
const packageManager =
  "npm@12.0.2+sha224.0123456789abcdef0123456789abcdef0123456789abcdef01234567";

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(value, null, 2) + "\n");
}

function basePackage() {
  return {
    name: "fixture",
    private: true,
    packageManager,
    engines: { node: "^22.22.2 || ^24.15.0" },
    allowScripts: { "reviewed-native-package": false },
    scripts: {
      "format:check": "prettier --check .",
      lint: "eslint .",
      "toolchain:check": "node scripts/toolchain.mjs",
      typecheck: "next typegen && tsgo --noEmit",
      "typecheck:compat": "next typegen && tsc --noEmit",
      test: "node --test",
      build: "next build",
      "artifact:check": "node scripts/artifact.mjs",
      "test-all":
        "npm run format:check && npm run lint && npm run toolchain:check && npm run typecheck && npm run typecheck:compat && npm test && npm run build",
      "audit:production": "npm audit --omit=dev --audit-level=high",
      "audit:dependencies": "npm audit --audit-level=high",
    },
    dependencies: {
      next: "16.3.3",
      react: "19.2.8",
      "react-dom": "19.2.8",
    },
    devDependencies: {
      "@typescript/native": "npm:typescript@7.0.2",
      eslint: "10.9.1",
      "eslint-config-next": "16.3.3",
      typescript: "6.0.3",
    },
  };
}

function manifest(profile, nextApps = ["."]) {
  return {
    schemaVersion: "nextjs-baseline.manifest.v1",
    baselineVersion: "1.0.0",
    profile,
    projectRoot: ".",
    nextApps,
    exceptions: [],
  };
}

function workflow() {
  return [
    "name: baseline fixture",
    "on:",
    "  pull_request:",
    "  push:",
    "  schedule:",
    '    - cron: "0 1 * * 1"',
    "permissions:",
    "  contents: read",
    "jobs:",
    "  complete:",
    "    strategy:",
    "      matrix:",
    "        node-version: [22, 24]",
    "    steps:",
    "      - uses: actions/checkout@0123456789abcdef0123456789abcdef01234567",
    "        with:",
    "          persist-credentials: false",
    "      - uses: actions/setup-node@0123456789abcdef0123456789abcdef01234567",
    "        with:",
    "          node-version: $" + "{{ matrix.node-version }}",
    "      - run: corepack npm install-scripts ls",
    "      - run: corepack npm run test-all",
    "      - run: corepack npm run audit:production",
    "      - run: corepack npm run audit:dependencies",
    "      - uses: " + actionReference,
    "        with:",
    "          check-latest: $" + "{{ github.event_name == 'schedule' }}",
    "",
  ].join("\n");
}

async function addApp(root, relativePath, packageJson, options = {}) {
  const appRoot = join(root, relativePath);
  await mkdir(join(appRoot, "src", "app"), { recursive: true });
  await writeJson(join(appRoot, "package.json"), packageJson);
  await writeJson(join(appRoot, "tsconfig.json"), {
    compilerOptions: { strict: true },
  });
  await writeFile(
    join(appRoot, "src", "app", "layout.tsx"),
    "export default function Layout() {}\n",
  );
  await writeFile(
    join(appRoot, "src", "app", "page.tsx"),
    "export default function Page() {}\n",
  );
  await writeFile(join(appRoot, "src", "app", "favicon.ico"), "fixture\n");
  await writeFile(
    join(appRoot, "src", "app", "manifest.ts"),
    "export default function manifest() {}\n",
  );
  await writeFile(
    join(appRoot, "src", "app", "icon0.tsx"),
    "export default function Icon() {}\n",
  );
  const config = options.output
    ? 'export default { output: "' + options.output + '" };\n'
    : "export default {};\n";
  await writeFile(join(appRoot, "next.config.ts"), config);
}

async function makeRepository(profile) {
  const root = await mkdtemp(join(tmpdir(), "nextjs-baseline-test-"));
  const pkg = basePackage();
  let apps = ["."];

  if (profile === "stock-static") {
    pkg.scripts.build = "next build && npm run artifact:check";
    pkg.scripts["test-all"] += " && npm run artifact:check";
    await addApp(root, ".", pkg, { output: "export" });
  } else if (profile === "stock-server") {
    await addApp(root, ".", pkg);
  } else if (profile === "monorepo-hybrid") {
    apps = ["apps/web"];
    pkg.devDependencies.eslint = "9.39.5";
    pkg.workspaces = ["apps/*"];
    pkg.scripts.check = pkg.scripts["test-all"];
    pkg.scripts["test-all"] = "npm run check";
    const appPackage = {
      name: "@fixture/web",
      private: true,
      dependencies: pkg.dependencies,
      scripts: { build: "next build" },
    };
    await writeJson(join(root, "package.json"), pkg);
    await addApp(root, "apps/web", appPackage);
  } else if (profile === "vinext") {
    const vinext = basePackage();
    vinext.dependencies.next = "16.3.3";
    vinext.dependencies.vinext = "1.0.0-beta.6";
    vinext.devDependencies.typescript = "6.0.3";
    vinext.devDependencies.eslint = "9.39.5";
    vinext.devDependencies["eslint-config-next"] = "16.3.3";
    delete vinext.scripts["toolchain:check"];
    delete vinext.scripts["typecheck:compat"];
    vinext.scripts.dev = "vite";
    vinext.scripts.build = "vite build && npm run validate:artifact";
    vinext.scripts["test:artifact"] = "node --test test/artifact.test.mjs";
    vinext.scripts["test-all"] =
      "npm run format:check && npm run lint && npm run typecheck && npm test && npm run build";
    await addApp(root, ".", vinext);
    await writeFile(join(root, "netlify.toml"), '[build]\npublish = "dist"\n');
  }

  await writeJson(join(root, "package-lock.json"), {
    lockfileVersion: 3,
    packages: {
      "node_modules/reviewed-native-package": {
        version: "1.2.3",
        hasInstallScript: true,
      },
    },
  });
  await writeJson(
    join(root, ".github", "nextjs-baseline.json"),
    manifest(profile, apps),
  );
  await mkdir(join(root, ".github", "workflows"), { recursive: true });
  await writeFile(join(root, ".github", "workflows", "ci.yml"), workflow());
  return root;
}

async function verify(root, options = {}) {
  return checkRepository({
    repositoryRoot: root,
    manifestPath: ".github/nextjs-baseline.json",
    now: new Date("2026-09-02T12:00:00.000Z"),
    ...options,
  });
}

for (const profile of ["stock-static", "stock-server", "monorepo-hybrid", "vinext"]) {
  test(profile + " accepts a valid profile fixture", async () => {
    const report = await verify(await makeRepository(profile));
    assert.equal(report.passed, true, JSON.stringify(report.failures));
  });
}

test("rejects malformed and traversal manifests before repository inspection", async () => {
  const root = await makeRepository("stock-server");
  await writeFile(
    join(root, ".github", "nextjs-baseline.json"),
    await readFile(new URL("malformed-manifest.txt", fixtureRoot)),
  );
  await assert.rejects(() => verify(root), BaselineInputError);
  await writeFile(
    join(root, ".github", "nextjs-baseline.json"),
    await readFile(new URL("traversal-manifest.json", fixtureRoot)),
  );
  await assert.rejects(() => verify(root), /bounded repository-relative path/u);
});

test("rejects missing and oversized manifests", async () => {
  const root = await makeRepository("stock-server");
  const path = join(root, ".github", "nextjs-baseline.json");
  await unlink(path);
  await assert.rejects(() => verify(root), /does not exist/u);
  await writeFile(path, JSON.stringify({ padding: "x".repeat(17_000) }));
  await assert.rejects(() => verify(root), /exceeds/u);
});

test("rejects a projectRoot symlink that escapes the checkout", async () => {
  const root = await makeRepository("stock-server");
  const outside = await mkdtemp(join(tmpdir(), "nextjs-baseline-outside-"));
  await symlink(outside, join(root, "escaped"));
  const value = manifest("stock-server");
  value.projectRoot = "escaped";
  await writeJson(join(root, ".github", "nextjs-baseline.json"), value);
  await assert.rejects(() => verify(root), /outside the repository/u);
});

test("rejects unknown, expired, shell-like, and unused exceptions", async () => {
  const root = await makeRepository("stock-server");
  const path = join(root, ".github", "nextjs-baseline.json");
  const value = manifest("stock-server");
  value.exceptions = [
    {
      ruleId: "not-a-rule",
      reason: "Tracked compatibility boundary",
      issueUrl: "https://github.com/JovaniPink/fixture/issues/1",
      reviewAfter: "2026-12-01",
    },
  ];
  await writeJson(path, value);
  await assert.rejects(() => verify(root), /unknown rule/u);
  value.exceptions[0].ruleId = "node-support";
  value.exceptions[0].reviewAfter = "2026-09-01";
  await writeJson(path, value);
  await assert.rejects(() => verify(root), /expired/u);
  value.exceptions[0].reviewAfter = "2026-12-01";
  value.exceptions[0].reason = "Run $" + "(dangerous command) later";
  await writeJson(path, value);
  await assert.rejects(() => verify(root), /unsafe/u);
  value.exceptions[0].reason =
    "Temporary compatibility boundary tracked by the linked issue";
  await writeJson(path, value);
  const report = await verify(root);
  assert.equal(report.passed, false);
  assert.match(report.failures[0].message, /unused/u);
});

test("reports package-manager, Node, toolchain, audit, and build drift", async () => {
  const root = await makeRepository("stock-server");
  const path = join(root, "package.json");
  const pkg = JSON.parse(await readFile(path, "utf8"));
  pkg.packageManager = "npm@12.0.2";
  pkg.engines.node = ">=24";
  pkg.devDependencies.typescript = "^6.0.3";
  delete pkg.scripts["audit:production"];
  delete pkg.scripts.build;
  await writeJson(path, pkg);
  const report = await verify(root);
  assert.equal(report.passed, false);
  assert.deepEqual(
    new Set(report.failures.map((finding) => finding.ruleId)),
    new Set([
      "node-support",
      "package-manager-integrity",
      "typescript-toolchain",
      "quality-scripts",
      "profile-server",
    ]),
  );
});

test("detects App Router and static/server profile mismatches", async () => {
  const staticRoot = await makeRepository("stock-static");
  await writeFile(join(staticRoot, "next.config.ts"), "export default {};\n");
  const staticReport = await verify(staticRoot);
  assert.ok(
    staticReport.failures.some((finding) => finding.ruleId === "profile-static"),
  );

  const serverRoot = await makeRepository("stock-server");
  await writeFile(
    join(serverRoot, "next.config.ts"),
    'export default { output: "export" };\n',
  );
  await unlink(join(serverRoot, "src", "app", "page.tsx"));
  const serverReport = await verify(serverRoot);
  assert.ok(serverReport.failures.some((finding) => finding.ruleId === "app-router"));
  assert.ok(
    serverReport.failures.some((finding) => finding.ruleId === "profile-server"),
  );
});

test("accepts a page nested below an App Router route group", async () => {
  const root = await makeRepository("stock-server");
  await mkdir(join(root, "src", "app", "(marketing)"), { recursive: true });
  await writeFile(
    join(root, "src", "app", "(marketing)", "page.tsx"),
    "export default function Page() {}\n",
  );
  await unlink(join(root, "src", "app", "page.tsx"));
  assert.equal((await verify(root)).passed, true);
});

test("detects Vinext replacement and monorepo application-root violations", async () => {
  const vinextRoot = await makeRepository("vinext");
  const vinextPath = join(vinextRoot, "package.json");
  const vinextPackage = JSON.parse(await readFile(vinextPath, "utf8"));
  vinextPackage.dependencies.vinext = "latest";
  await writeJson(vinextPath, vinextPackage);
  assert.ok(
    (await verify(vinextRoot)).failures.some(
      (finding) => finding.ruleId === "profile-vinext",
    ),
  );

  const hybridRoot = await makeRepository("monorepo-hybrid");
  await writeJson(
    join(hybridRoot, ".github", "nextjs-baseline.json"),
    manifest("monorepo-hybrid", ["."]),
  );
  const report = await verify(hybridRoot);
  assert.ok(report.failures.some((finding) => finding.ruleId === "profile-hybrid"));
});

test("accepts a Python-first hybrid repository with one app-scoped package", async () => {
  const root = await makeRepository("monorepo-hybrid");
  const packagePath = join(root, "package.json");
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  delete pkg.workspaces;
  await writeJson(join(root, "apps", "web", "package.json"), pkg);
  await writeJson(join(root, "apps", "web", "package-lock.json"), {
    lockfileVersion: 3,
    packages: {},
  });
  await unlink(packagePath);
  await unlink(join(root, "package-lock.json"));
  assert.equal((await verify(root)).passed, true);
});

test("an ESLint exception cannot hide framework-version drift", async () => {
  const root = await makeRepository("stock-server");
  const packagePath = join(root, "package.json");
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  pkg.devDependencies.eslint = "9.39.5";
  await writeJson(packagePath, pkg);
  const manifestPath = join(root, ".github", "nextjs-baseline.json");
  const value = manifest("stock-server");
  value.exceptions = [
    {
      ruleId: "eslint-toolchain",
      reason: "Compatibility migration is tracked by the linked repository issue",
      issueUrl: "https://github.com/JovaniPink/fixture/issues/2",
      reviewAfter: "2026-12-01",
    },
  ];
  await writeJson(manifestPath, value);
  assert.equal((await verify(root)).passed, true);

  pkg.dependencies.next = "latest";
  await writeJson(packagePath, pkg);
  const report = await verify(root);
  assert.equal(report.passed, false);
  assert.ok(report.failures.some((finding) => finding.ruleId === "framework-versions"));
});

test("allows stronger product-specific gates", async () => {
  const root = await makeRepository("stock-server");
  const path = join(root, "package.json");
  const pkg = JSON.parse(await readFile(path, "utf8"));
  pkg.scripts["product:evidence"] = "node scripts/product-evidence.mjs";
  pkg.scripts["test-all"] += " && npm run product:evidence";
  await writeJson(path, pkg);
  assert.equal((await verify(root)).passed, true);
});

test("requires a decision for every locked install-script package", async () => {
  const root = await makeRepository("stock-server");
  const packagePath = join(root, "package.json");
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  await writeJson(join(root, "package-lock.json"), {
    lockfileVersion: 3,
    packages: {
      "": { hasInstallScript: true },
      "node_modules/reviewed-native-package": {
        version: "1.2.3",
        hasInstallScript: true,
      },
      "node_modules/parent/node_modules/@scope/native": {
        version: "2.0.0",
        hasInstallScript: true,
        optional: true,
        os: ["linux"],
      },
    },
  });
  assert.ok(
    (await verify(root)).failures.some(
      (finding) => finding.ruleId === "install-script-policy",
    ),
  );
  pkg.allowScripts["@scope/native@2.0.0"] = true;
  await writeJson(packagePath, pkg);
  assert.equal((await verify(root)).passed, true);
  delete pkg.allowScripts["@scope/native@2.0.0"];
  pkg.allowScripts["@scope/native@1.0.0"] = true;
  await writeJson(packagePath, pkg);
  assert.ok(
    (await verify(root)).failures.some(
      (finding) => finding.ruleId === "install-script-policy",
    ),
  );
  pkg.allowScripts = { dummy: false };
  await writeJson(packagePath, pkg);
  assert.ok(
    (await verify(root)).failures.some(
      (finding) => finding.ruleId === "install-script-policy",
    ),
  );
});

test("requires the complete gate on an actual Node 22 and 24 job matrix", async () => {
  const valid = workflow();
  for (const changed of [
    valid.replace("[22, 24]", "[22]") + "\n# Node 24 is planned\n",
    valid.replace("[22, 24]", "[22]") +
      "\n  unrelated:\n    steps:\n      - run: echo Node 24\n",
    valid.replace("$" + "{{ matrix.node-version }}", "22"),
    valid.replace("  complete:\n", "  complete:\n    continue-on-error: true\n"),
    valid.replace("  complete:\n", "  complete:\n    <<: *conditional-job\n"),
    valid
      .replace("    steps:\n", "    steps:\n      - run: corepack npm run test-all\n")
      .replace(
        "      - run: corepack npm run test-all\n      - run: corepack npm run audit:production",
        "      - run: corepack npm run audit:production",
      ),
    valid.replace(
      "      - run: corepack npm run test-all",
      "      - if: false\n        run: corepack npm run test-all",
    ),
    valid.replace(
      "      - run: corepack npm run test-all",
      "      - run: echo 'corepack npm run test-all'",
    ),
    valid.replace(
      "        node-version: [22, 24]",
      "        node-version: [22, 24]\n        exclude:\n          - node-version: 24",
    ),
  ]) {
    const root = await makeRepository("stock-server");
    await writeFile(join(root, ".github", "workflows", "ci.yml"), changed);
    assert.ok(
      (await verify(root)).failures.some((finding) => finding.ruleId === "ci-coverage"),
      changed,
    );
  }
  const root = await makeRepository("stock-server");
  await writeFile(
    join(root, ".github", "workflows", "ci.yml"),
    valid.replace(
      "        node-version: [22, 24]",
      '        include:\n          - node-version: "22.22.2"\n          - node-version: "24"',
    ),
  );
  assert.equal((await verify(root)).passed, true);
});

test("requires each hybrid application to be a declared workspace", async () => {
  const root = await makeRepository("monorepo-hybrid");
  const path = join(root, "package.json");
  const pkg = JSON.parse(await readFile(path, "utf8"));
  for (const workspaces of [[], ["packages/*"], ["apps/*", "!apps/web"]]) {
    pkg.workspaces = workspaces;
    await writeJson(path, pkg);
    assert.ok(
      (await verify(root)).failures.some(
        (finding) => finding.ruleId === "profile-hybrid",
      ),
    );
  }
  for (const workspaces of [["apps/web"], ["apps/*"], ["apps/**"]]) {
    pkg.workspaces = workspaces;
    await writeJson(path, pkg);
    assert.equal((await verify(root)).passed, true);
  }
});

test("rejects impossible exception dates instead of normalizing them", async () => {
  const root = await makeRepository("stock-server");
  const value = manifest("stock-server");
  value.exceptions = [
    {
      ruleId: "node-support",
      reason: "Temporary compatibility boundary tracked by the linked issue",
      issueUrl: "https://github.com/JovaniPink/fixture/issues/1",
      reviewAfter: "2027-02-31",
    },
  ];
  await writeJson(join(root, ".github", "nextjs-baseline.json"), value);
  await assert.rejects(() => verify(root), /invalid or expired/u);
});

test("validates current, outdated, malformed, oversized, and failed currency fetches", async () => {
  const current = JSON.parse(
    await readFile(new URL("latest-valid.json", fixtureRoot), "utf8"),
  );
  const newer = JSON.parse(
    await readFile(new URL("latest-outdated.json", fixtureRoot), "utf8"),
  );
  assert.equal(validateLatestDocument(current, "1.0.0").latestVersion, "1.0.0");
  assert.throws(() => validateLatestDocument(newer, "1.0.0"), /behind/u);
  assert.throws(
    () =>
      validateLatestDocument(
        { schemaVersion: "wrong", latestVersion: "1.0.0" },
        "1.0.0",
      ),
    /malformed/u,
  );

  const successfulFetch = async () =>
    new Response(JSON.stringify(current), { status: 200 });
  assert.deepEqual(
    await fetchLatestDocument("https://example.test/latest.json", {
      fetchImpl: successfulFetch,
    }),
    current,
  );
  const oversizedFetch = async () => new Response("x".repeat(4097), { status: 200 });
  await assert.rejects(
    () =>
      fetchLatestDocument("https://example.test/latest.json", {
        fetchImpl: oversizedFetch,
      }),
    /exceeds/u,
  );
  const malformedFetch = async () => new Response("{", { status: 200 });
  await assert.rejects(
    () =>
      fetchLatestDocument("https://example.test/latest.json", {
        fetchImpl: malformedFetch,
      }),
    /not valid JSON/u,
  );
  const failedFetch = async () => {
    throw new Error("offline");
  };
  await assert.rejects(
    () =>
      fetchLatestDocument("https://example.test/latest.json", {
        fetchImpl: failedFetch,
      }),
    /failed closed/u,
  );
});
