#!/usr/bin/env node

import { readFile, readdir, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleRoot = dirname(fileURLToPath(import.meta.url));
const manifestKeys = new Set([
  "schemaVersion",
  "baselineVersion",
  "profile",
  "projectRoot",
  "nextApps",
  "exceptions",
]);
const exceptionKeys = new Set(["ruleId", "reason", "issueUrl", "reviewAfter"]);
const safePathPattern = /^(?:\.|[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)$/u;
const shellFragmentPattern = /(?:\$\(|`|&&|\|\||[;<>]|\r|\n)/u;
const issuePattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/[1-9][0-9]*$/u;
const semanticVersionPattern = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/u;

export class BaselineInputError extends Error {}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    throw new BaselineInputError(
      `${label} contains unknown fields: ${unknown.join(", ")}`,
    );
  }
}

function assertSafeRelativePath(value, label) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 240 ||
    isAbsolute(value) ||
    value.includes("\\") ||
    value.split("/").includes("..") ||
    !safePathPattern.test(value) ||
    shellFragmentPattern.test(value)
  ) {
    throw new BaselineInputError(`${label} must be a bounded repository-relative path`);
  }
}

function isWithin(parent, candidate) {
  return candidate === parent || candidate.startsWith(`${parent}${sep}`);
}

async function resolveWithin(parentRealPath, value, label) {
  assertSafeRelativePath(value, label);
  const candidate = resolve(parentRealPath, value);
  let candidateRealPath;
  try {
    candidateRealPath = await realpath(candidate);
  } catch (error) {
    throw new BaselineInputError(`${label} does not exist: ${value}`, { cause: error });
  }
  if (!isWithin(parentRealPath, candidateRealPath)) {
    throw new BaselineInputError(`${label} resolves outside the repository: ${value}`);
  }
  return candidateRealPath;
}

async function readBoundedFile(filePath, maximumBytes, label) {
  const info = await stat(filePath);
  if (!info.isFile()) {
    throw new BaselineInputError(`${label} must be a regular file`);
  }
  if (info.size > maximumBytes) {
    throw new BaselineInputError(`${label} exceeds ${maximumBytes} bytes`);
  }
  const bytes = await readFile(filePath);
  if (bytes.length > maximumBytes) {
    throw new BaselineInputError(`${label} exceeds ${maximumBytes} bytes`);
  }
  return bytes.toString("utf8");
}

async function readJson(filePath, maximumBytes, label) {
  const text = await readBoundedFile(filePath, maximumBytes, label);
  try {
    return JSON.parse(text.replace(/^\uFEFF/u, ""));
  } catch (error) {
    throw new BaselineInputError(`${label} is not valid JSON`, { cause: error });
  }
}

function stripJsonComments(text) {
  let result = "";
  let inString = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
        result += character;
      }
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      } else if (character === "\n") {
        result += "\n";
      }
      continue;
    }
    if (inString) {
      result += character;
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }
    if (character === '"') {
      inString = true;
      result += character;
    } else if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
    } else if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
    } else {
      result += character;
    }
  }
  return result.replace(/,(\s*[}\]])/gu, "$1");
}

async function readJsonc(filePath, maximumBytes, label) {
  const text = await readBoundedFile(filePath, maximumBytes, label);
  try {
    return JSON.parse(stripJsonComments(text).replace(/^\uFEFF/u, ""));
  } catch (error) {
    throw new BaselineInputError(`${label} is not valid JSONC`, { cause: error });
  }
}

function validateSpec(spec) {
  if (
    !isPlainObject(spec) ||
    spec.schemaVersion !== "nextjs-baseline.spec.v1" ||
    !semanticVersionPattern.test(spec.version ?? "") ||
    !isPlainObject(spec.limits) ||
    !isPlainObject(spec.profiles) ||
    !Array.isArray(spec.rules)
  ) {
    throw new BaselineInputError("baseline spec is malformed");
  }
  const ruleIds = new Set();
  for (const rule of spec.rules) {
    if (!isPlainObject(rule) || typeof rule.id !== "string" || ruleIds.has(rule.id)) {
      throw new BaselineInputError(
        "baseline spec contains a malformed or duplicate rule",
      );
    }
    ruleIds.add(rule.id);
  }
  return ruleIds;
}

function validateManifest(manifest, spec, ruleIds, now) {
  if (!isPlainObject(manifest)) {
    throw new BaselineInputError("baseline manifest must be an object");
  }
  assertExactKeys(manifest, manifestKeys, "baseline manifest");
  if (manifest.schemaVersion !== "nextjs-baseline.manifest.v1") {
    throw new BaselineInputError("baseline manifest schemaVersion is unsupported");
  }
  if (manifest.baselineVersion !== spec.version) {
    throw new BaselineInputError(
      `baseline manifest pins ${String(manifest.baselineVersion)} but this action implements ${spec.version}`,
    );
  }
  if (!Object.hasOwn(spec.profiles, manifest.profile)) {
    throw new BaselineInputError(
      `unknown baseline profile: ${String(manifest.profile)}`,
    );
  }
  assertSafeRelativePath(manifest.projectRoot, "projectRoot");
  if (
    !Array.isArray(manifest.nextApps) ||
    manifest.nextApps.length === 0 ||
    manifest.nextApps.length > spec.limits.nextApps
  ) {
    throw new BaselineInputError(
      "nextApps must contain one to eight application roots",
    );
  }
  const seenApps = new Set();
  for (const [index, app] of manifest.nextApps.entries()) {
    assertSafeRelativePath(app, `nextApps[${index}]`);
    if (seenApps.has(app)) {
      throw new BaselineInputError(`nextApps contains a duplicate path: ${app}`);
    }
    seenApps.add(app);
  }
  if (
    !Array.isArray(manifest.exceptions) ||
    manifest.exceptions.length > spec.limits.exceptions
  ) {
    throw new BaselineInputError(
      `exceptions must contain no more than ${spec.limits.exceptions} entries`,
    );
  }

  const exceptionRules = new Set();
  for (const [index, exception] of manifest.exceptions.entries()) {
    if (!isPlainObject(exception)) {
      throw new BaselineInputError(`exceptions[${index}] must be an object`);
    }
    assertExactKeys(exception, exceptionKeys, `exceptions[${index}]`);
    if (!ruleIds.has(exception.ruleId)) {
      throw new BaselineInputError(
        `exceptions[${index}] references unknown rule ${String(exception.ruleId)}`,
      );
    }
    if (exceptionRules.has(exception.ruleId)) {
      throw new BaselineInputError(
        `only one exception is allowed for ${exception.ruleId}`,
      );
    }
    if (
      typeof exception.reason !== "string" ||
      exception.reason.length < 12 ||
      exception.reason.length > 500 ||
      shellFragmentPattern.test(exception.reason)
    ) {
      throw new BaselineInputError(
        `exceptions[${index}].reason is missing, unsafe, or unbounded`,
      );
    }
    if (
      typeof exception.issueUrl !== "string" ||
      !issuePattern.test(exception.issueUrl)
    ) {
      throw new BaselineInputError(
        `exceptions[${index}].issueUrl must be a GitHub issue URL`,
      );
    }
    const reviewDate = new Date(`${exception.reviewAfter}T00:00:00.000Z`);
    if (
      typeof exception.reviewAfter !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/u.test(exception.reviewAfter) ||
      Number.isNaN(reviewDate.valueOf()) ||
      reviewDate <= now
    ) {
      throw new BaselineInputError(
        `exceptions[${index}].reviewAfter is invalid or expired`,
      );
    }
    exceptionRules.add(exception.ruleId);
  }
}

async function findFirstExisting(root, paths, boundary = root) {
  for (const candidate of paths) {
    try {
      const candidateRealPath = await realpath(join(root, candidate));
      if (!isWithin(boundary, candidateRealPath)) {
        throw new BaselineInputError(`${candidate} resolves outside its declared root`);
      }
      await stat(candidateRealPath);
      return candidate;
    } catch (error) {
      if (error instanceof BaselineInputError) throw error;
    }
  }
  return null;
}

async function containsAppRouterPage(appRoot, appDirectory) {
  const queue = [{ path: join(appRoot, appDirectory), depth: 0 }];
  let visitedEntries = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    const entries = await readdir(current.path, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      visitedEntries += 1;
      if (visitedEntries > 4096) {
        throw new BaselineInputError(
          "App Router inspection exceeds 4096 directory entries",
        );
      }
      if (entry.isFile() && /^page\.(?:tsx?|jsx?)$/u.test(entry.name)) return true;
      if (
        entry.isDirectory() &&
        current.depth < 16 &&
        entry.name !== "node_modules" &&
        !entry.name.startsWith(".")
      ) {
        queue.push({ path: join(current.path, entry.name), depth: current.depth + 1 });
      }
    }
  }
  return false;
}

async function readWorkflowText(repositoryRoot, maximumBytes) {
  const workflowsRoot = join(repositoryRoot, ".github", "workflows");
  let entries;
  try {
    entries = await readdir(workflowsRoot, { withFileTypes: true });
  } catch {
    return "";
  }
  const texts = [];
  let totalBytes = 0;
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    if (!entry.isFile() || !/\.ya?ml$/u.test(entry.name)) continue;
    const workflowPath = await resolveWithin(
      repositoryRoot,
      `.github/workflows/${entry.name}`,
      "workflow",
    );
    const text = await readBoundedFile(
      workflowPath,
      maximumBytes,
      `workflow ${entry.name}`,
    );
    totalBytes += Buffer.byteLength(text);
    if (totalBytes > maximumBytes) {
      throw new BaselineInputError(`combined workflows exceed ${maximumBytes} bytes`);
    }
    texts.push(text);
  }
  return texts.join("\n");
}

function packageVersion(packageJson, name) {
  return (
    packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name] ?? null
  );
}

function hasScriptReference(script, name) {
  if (name === "test" && /(?:^|\s)(?:npm|corepack npm) test(?:\s|$)/u.test(script))
    return true;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`(?:npm|corepack npm) run ${escaped}(?:\\s|$)`, "u").test(script);
}

function scriptTransitivelyReferences(scripts, entry, target, visited = new Set()) {
  if (visited.has(entry) || typeof scripts[entry] !== "string") return false;
  visited.add(entry);
  if (hasScriptReference(scripts[entry], target)) return true;
  return Object.keys(scripts).some(
    (candidate) =>
      candidate !== entry &&
      hasScriptReference(scripts[entry], candidate) &&
      scriptTransitivelyReferences(scripts, candidate, target, visited),
  );
}

function compareSemanticVersions(left, right) {
  const leftMatch = semanticVersionPattern.exec(left);
  const rightMatch = semanticVersionPattern.exec(right);
  if (!leftMatch || !rightMatch)
    throw new BaselineInputError("currency document has an invalid version");
  for (let index = 1; index <= 3; index += 1) {
    const difference = Number(leftMatch[index]) - Number(rightMatch[index]);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

export function validateLatestDocument(document, manifestVersion) {
  if (!isPlainObject(document))
    throw new BaselineInputError("latest document must be an object");
  assertExactKeys(
    document,
    new Set(["schemaVersion", "latestVersion"]),
    "latest document",
  );
  if (
    document.schemaVersion !== "nextjs-baseline.latest.v1" ||
    !semanticVersionPattern.test(document.latestVersion ?? "")
  ) {
    throw new BaselineInputError("latest document is malformed");
  }
  if (compareSemanticVersions(manifestVersion, document.latestVersion) < 0) {
    throw new BaselineInputError(
      `baseline ${manifestVersion} is behind current version ${document.latestVersion}`,
    );
  }
  return document;
}

export async function fetchLatestDocument(
  url,
  {
    fetchImpl = globalThis.fetch,
    maximumBytes = 4096,
    timeoutMilliseconds = 5000,
  } = {},
) {
  if (typeof url !== "string" || !url.startsWith("https://")) {
    throw new BaselineInputError("latest URL must use HTTPS");
  }
  let response;
  try {
    response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(timeoutMilliseconds),
    });
  } catch (error) {
    throw new BaselineInputError("latest-version fetch failed closed", {
      cause: error,
    });
  }
  if (!response?.ok) {
    throw new BaselineInputError(
      `latest-version fetch returned HTTP ${String(response?.status)}`,
    );
  }
  const declaredLength = Number(response.headers?.get?.("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    throw new BaselineInputError(`latest document exceeds ${maximumBytes} bytes`);
  }
  if (!response.body) {
    throw new BaselineInputError("latest-version response has no body");
  }
  const reader = response.body.getReader();
  const chunks = [];
  let receivedBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > maximumBytes) {
      await reader.cancel();
      throw new BaselineInputError(`latest document exceeds ${maximumBytes} bytes`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch (error) {
    throw new BaselineInputError("latest document is not valid JSON", { cause: error });
  }
}

export async function checkRepository({
  repositoryRoot,
  manifestPath = ".github/nextjs-baseline.json",
  specPath = join(moduleRoot, "spec.json"),
  now = new Date(),
  latestUrl = null,
  fetchImpl = globalThis.fetch,
}) {
  const rootRealPath = await realpath(repositoryRoot);
  const spec = await readJson(specPath, 131072, "baseline spec");
  const ruleIds = validateSpec(spec);
  const manifestRealPath = await resolveWithin(
    rootRealPath,
    manifestPath,
    "baseline manifest",
  );
  const manifest = await readJson(
    manifestRealPath,
    spec.limits.manifestBytes,
    "baseline manifest",
  );
  validateManifest(manifest, spec, ruleIds, now);

  const projectRoot = await resolveWithin(
    rootRealPath,
    manifest.projectRoot,
    "projectRoot",
  );
  const profile = spec.profiles[manifest.profile];
  const framework = spec.frameworks[profile.family];
  const findings = [];
  const record = (ruleId, condition, message) => {
    if (!condition) findings.push({ ruleId, message });
  };

  const applications = [];
  for (const [index, appPath] of manifest.nextApps.entries()) {
    const appRoot = await resolveWithin(projectRoot, appPath, `nextApps[${index}]`);
    const appPackagePath = await resolveWithin(
      appRoot,
      "package.json",
      `nextApps[${index}] package.json`,
    );
    const packageJson = await readJson(
      appPackagePath,
      1048576,
      `nextApps[${index}] package.json`,
    );
    applications.push({ appPath, appRoot, packageJson });
  }

  const rootPackageName = await findFirstExisting(projectRoot, ["package.json"]);
  if (
    !rootPackageName &&
    (profile.deployment !== "hybrid" || applications.length !== 1)
  ) {
    throw new BaselineInputError("project package.json does not exist: package.json");
  }
  const packageControlRoot = rootPackageName ? projectRoot : applications[0].appRoot;
  const rootPackage = rootPackageName
    ? await readJson(
        join(projectRoot, rootPackageName),
        1048576,
        "project package.json",
      )
    : applications[0].packageJson;

  for (const application of applications) {
    const appDirectory = await findFirstExisting(application.appRoot, [
      "src/app",
      "app",
    ]);
    const hasLayout = appDirectory
      ? await findFirstExisting(application.appRoot, [
          `${appDirectory}/layout.tsx`,
          `${appDirectory}/layout.ts`,
          `${appDirectory}/layout.jsx`,
          `${appDirectory}/layout.js`,
        ])
      : null;
    const hasPage = appDirectory
      ? await containsAppRouterPage(application.appRoot, appDirectory)
      : false;
    record(
      "app-router",
      Boolean(appDirectory && hasLayout && hasPage),
      `${application.appPath} must contain an App Router layout and page`,
    );

    const tsconfigName = await findFirstExisting(application.appRoot, [
      "tsconfig.json",
    ]);
    let tsconfig = null;
    if (tsconfigName) {
      try {
        tsconfig = await readJsonc(
          join(application.appRoot, tsconfigName),
          1048576,
          `${application.appPath} tsconfig.json`,
        );
      } catch {
        // Invalid JSONC is reported by the strict TypeScript rule below.
      }
    }
    record(
      "strict-typescript",
      tsconfig?.compilerOptions?.strict === true,
      `${application.appPath} must explicitly set compilerOptions.strict to true`,
    );

    for (const dependency of ["next", "react", "react-dom"]) {
      record(
        "framework-versions",
        packageVersion(application.packageJson, dependency) === framework[dependency],
        `${application.appPath} ${dependency} must equal ${framework[dependency]}`,
      );
    }

    const favicon = await findFirstExisting(application.appRoot, [
      "src/app/favicon.ico",
      "app/favicon.ico",
      "public/favicon.ico",
    ]);
    const manifestAsset = await findFirstExisting(application.appRoot, [
      "src/app/manifest.ts",
      "src/app/manifest.tsx",
      "app/manifest.ts",
      "app/manifest.tsx",
      "public/site.webmanifest",
      "public/manifest.webmanifest",
    ]);
    const iconAsset = await findFirstExisting(application.appRoot, [
      "src/app/icon.tsx",
      "src/app/icon0.tsx",
      "src/app/icon.svg",
      "app/icon.tsx",
      "app/icon0.tsx",
      "app/icon.svg",
      "public/icon.svg",
      "public/favicon.svg",
    ]);
    const metadataSurface = await findFirstExisting(application.appRoot, [
      "src/app/layout.tsx",
      "src/app/metadata-contract.ts",
      "app/layout.tsx",
      "app/metadata-contract.ts",
    ]);
    record(
      "identity-assets",
      Boolean(favicon && manifestAsset && iconAsset && metadataSurface),
      `${application.appPath} must expose favicon, manifest, icon, and metadata surfaces`,
    );
  }

  record(
    "node-support",
    rootPackage.engines?.node === spec.node.range,
    `engines.node must equal ${spec.node.range}`,
  );
  record(
    "package-manager-integrity",
    new RegExp(spec.packageManager.integrityPattern, "u").test(
      rootPackage.packageManager ?? "",
    ),
    `packageManager must integrity-pin npm ${spec.packageManager.version}`,
  );
  let lockfileValid = false;
  const lockfileName = await findFirstExisting(packageControlRoot, [
    "package-lock.json",
  ]);
  if (lockfileName) {
    try {
      const lockfile = await readJson(
        join(packageControlRoot, lockfileName),
        20 * 1024 * 1024,
        "package-lock.json",
      );
      lockfileValid = lockfile.lockfileVersion === 3;
    } catch {
      lockfileValid = false;
    }
  }
  record(
    "package-manager-integrity",
    lockfileValid,
    "package-lock.json must use lockfileVersion 3",
  );

  record(
    "typescript-toolchain",
    packageVersion(rootPackage, "typescript") === framework.typescript,
    `typescript must equal ${framework.typescript}`,
  );
  for (const dependency of ["eslint", "eslint-config-next"]) {
    record(
      "eslint-toolchain",
      packageVersion(rootPackage, dependency) === framework[dependency],
      `${dependency} must equal ${framework[dependency]}`,
    );
  }
  if (profile.family !== "vinext") {
    record(
      "typescript-toolchain",
      packageVersion(rootPackage, "@typescript/native") ===
        framework["@typescript/native"],
      `@typescript/native must equal ${framework["@typescript/native"]}`,
    );
  }

  const scripts = rootPackage.scripts ?? {};
  const allowScripts = rootPackage.allowScripts;
  record(
    "install-script-policy",
    isPlainObject(allowScripts) &&
      Object.keys(allowScripts).length > 0 &&
      Object.values(allowScripts).every((value) => typeof value === "boolean"),
    "allowScripts must explicitly allow or deny each reviewed install-script package",
  );

  for (const scriptName of spec.qualityScripts) {
    record(
      "quality-scripts",
      typeof scripts[scriptName] === "string" && scripts[scriptName].trim().length > 0,
      `scripts.${scriptName} is required`,
    );
  }
  if (profile.requiresDualTypeScript) {
    for (const scriptName of spec.dualTypeScriptScripts) {
      record(
        "typescript-toolchain",
        typeof scripts[scriptName] === "string" &&
          scripts[scriptName].trim().length > 0,
        `scripts.${scriptName} is required for dual TypeScript validation`,
      );
    }
  }
  const testAll = scripts["test-all"] ?? "";
  for (const scriptName of ["format:check", "lint", "typecheck", "test", "build"]) {
    const isReferenced =
      scriptTransitivelyReferences(scripts, "test-all", scriptName) ||
      (scriptName === "test" &&
        scriptTransitivelyReferences(scripts, "test-all", "test:ci"));
    record(
      "quality-scripts",
      isReferenced,
      `scripts.test-all must invoke ${scriptName}`,
    );
  }
  if (profile.requiresDualTypeScript) {
    for (const scriptName of ["toolchain:check", "typecheck:compat"]) {
      record(
        "typescript-toolchain",
        scriptTransitivelyReferences(scripts, "test-all", scriptName),
        `scripts.test-all must invoke ${scriptName}`,
      );
    }
  }

  const workflows = await readWorkflowText(rootRealPath, spec.limits.workflowBytes);
  for (const token of [
    "pull_request",
    "push:",
    "22",
    "24",
    "corepack npm install-scripts ls",
    "corepack npm run test-all",
  ]) {
    record(
      "ci-coverage",
      workflows.includes(token),
      `hosted workflows must contain ${token}`,
    );
  }
  for (const auditScript of ["audit:production", "audit:dependencies"]) {
    record(
      "ci-coverage",
      workflows.includes(`corepack npm run ${auditScript}`) ||
        scriptTransitivelyReferences(scripts, "test-all", auditScript),
      `hosted workflows or scripts.test-all must invoke ${auditScript}`,
    );
  }

  const baselineActionPattern =
    /JovaniPink\/nextjs-typescript-boilerplate\/baseline\/v1@[0-9a-f]{40}/u;
  record(
    "baseline-workflow",
    workflows.includes("schedule:") &&
      workflows.includes("permissions:") &&
      workflows.includes("contents: read") &&
      workflows.includes("persist-credentials: false") &&
      workflows.includes("github.event_name == 'schedule'") &&
      baselineActionPattern.test(workflows),
    "caller workflow must pin the baseline action and enable inert scheduled currency checks",
  );

  const configText = [];
  for (const application of applications) {
    const configName = await findFirstExisting(application.appRoot, [
      "next.config.ts",
      "next.config.mjs",
      "next.config.js",
    ]);
    configText.push(
      configName
        ? await readBoundedFile(
            join(application.appRoot, configName),
            262144,
            `${application.appPath} config`,
          )
        : "",
    );
  }

  if (profile.deployment === "static") {
    record(
      "profile-static",
      configText.every((text) => /output\s*:\s*["']export["']/u.test(text)),
      "stock-static applications must declare output: export",
    );
    const artifactScript = spec.staticArtifactScripts.find(
      (scriptName) => typeof scripts[scriptName] === "string",
    );
    record(
      "profile-static",
      Boolean(
        artifactScript &&
        (scriptTransitivelyReferences(scripts, "test-all", artifactScript) ||
          hasScriptReference(scripts.build ?? "", artifactScript)),
      ),
      "stock-static applications must verify the generated static artifact",
    );
  } else if (profile.deployment === "server") {
    record(
      "profile-server",
      configText.every((text) => !/output\s*:\s*["']export["']/u.test(text)) &&
        /next build/u.test(scripts.build ?? ""),
      "stock-server applications must retain a non-exported Next production build",
    );
  } else if (profile.deployment === "hybrid") {
    record(
      "profile-hybrid",
      (rootPackageName ? Array.isArray(rootPackage.workspaces) : true) &&
        manifest.nextApps.every((app) => app !== ".") &&
        applications.every((app) => isWithin(projectRoot, app.appRoot)),
      "monorepo-hybrid applications must be declared workspace roots below projectRoot",
    );
  } else if (profile.deployment === "vinext") {
    record(
      "profile-vinext",
      packageVersion(rootPackage, "vinext") === framework.vinext &&
        /(?:^|\s)vite(?:\s|$)/u.test(scripts.dev ?? "") &&
        /vite build/u.test(scripts.build ?? "") &&
        typeof scripts["test:artifact"] === "string" &&
        Boolean(await findFirstExisting(projectRoot, ["netlify.toml"])),
      "vinext profile must preserve exact Vinext, Vite build, Netlify, and artifact-test boundaries",
    );
  }

  const exceptionByRule = new Map(
    manifest.exceptions.map((exception) => [exception.ruleId, exception]),
  );
  const failedRuleIds = new Set(findings.map((finding) => finding.ruleId));
  const exceptions = [];
  const failures = [];
  for (const finding of findings) {
    if (exceptionByRule.has(finding.ruleId)) {
      if (!exceptions.some((entry) => entry.ruleId === finding.ruleId)) {
        exceptions.push({
          ...exceptionByRule.get(finding.ruleId),
          findings: findings.filter((item) => item.ruleId === finding.ruleId),
        });
      }
    } else {
      failures.push(finding);
    }
  }
  for (const exception of manifest.exceptions) {
    if (!failedRuleIds.has(exception.ruleId)) {
      failures.push({
        ruleId: exception.ruleId,
        message: "declared exception is unused and must be removed",
      });
    }
  }

  if (latestUrl) {
    const latest = await fetchLatestDocument(latestUrl, {
      fetchImpl,
      maximumBytes: spec.limits.latestBytes,
    });
    validateLatestDocument(latest, manifest.baselineVersion);
  }

  return {
    schemaVersion: "nextjs-baseline.report.v1",
    baselineVersion: spec.version,
    profile: manifest.profile,
    projectRoot: manifest.projectRoot,
    nextApps: manifest.nextApps,
    passed: failures.length === 0,
    failures,
    exceptions,
  };
}

function parseArguments(arguments_) {
  if (arguments_[0] === "--from-action-env") {
    if (!new Set(["true", "false"]).has(process.env.NEXTJS_BASELINE_CHECK_LATEST)) {
      throw new BaselineInputError("check-latest input must be true or false");
    }
    const checkLatest = process.env.NEXTJS_BASELINE_CHECK_LATEST === "true";
    return {
      repositoryRoot: process.env.GITHUB_WORKSPACE ?? process.cwd(),
      manifestPath:
        process.env.NEXTJS_BASELINE_MANIFEST ?? ".github/nextjs-baseline.json",
      latestUrl: checkLatest ? process.env.NEXTJS_BASELINE_LATEST_URL : null,
    };
  }
  const options = {
    repositoryRoot: process.cwd(),
    manifestPath: ".github/nextjs-baseline.json",
    latestUrl: null,
  };
  for (let index = 0; index < arguments_.length; index += 2) {
    const flag = arguments_[index];
    const value = arguments_[index + 1];
    if (typeof value !== "string")
      throw new BaselineInputError(`missing value for ${String(flag)}`);
    if (flag === "--repository-root") options.repositoryRoot = value;
    else if (flag === "--manifest") options.manifestPath = value;
    else if (flag === "--latest-url") options.latestUrl = value;
    else throw new BaselineInputError(`unknown argument: ${String(flag)}`);
  }
  return options;
}

async function main() {
  try {
    const report = await checkRepository(parseArguments(process.argv.slice(2)));
    for (const exception of report.exceptions) {
      console.warn(
        `EXCEPTION ${exception.ruleId} until ${exception.reviewAfter}: ${exception.reason} (${exception.issueUrl})`,
      );
      for (const finding of exception.findings) console.warn(`  - ${finding.message}`);
    }
    if (!report.passed) {
      console.error("Next.js baseline verification failed:");
      for (const failure of report.failures) {
        console.error(`- [${failure.ruleId}] ${failure.message}`);
      }
      process.exitCode = 1;
      return;
    }
    console.log(
      `Next.js baseline ${report.baselineVersion} passed for ${report.profile} (${report.nextApps.join(", ")}).`,
    );
  } catch (error) {
    console.error(
      `Next.js baseline input rejected: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
