// Inspect a deliberately bounded, inert subset of workflow YAML. Unsupported
// dynamic matrices, aliases, exclusions, and conditional gates provide no proof.
function unquote(value) {
  return value.replace(/^(["'])(.*)\1$/u, "$2");
}

function linesWithoutComments(text) {
  return text
    .split(/\r?\n/u)
    .map((line) => {
      let quote = null;
      for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (quote) {
          if (character === "\\" && quote === '"') index += 1;
          else if (character === quote) quote = null;
        } else if (character === '"' || character === "'") quote = character;
        else if (character === "#" && (index === 0 || /\s/u.test(line[index - 1])))
          return line.slice(0, index).trimEnd();
      }
      return line.trimEnd();
    })
    .filter((line) => line.trim().length > 0);
}

function indent(line) {
  return line.length - line.trimStart().length;
}

function blocks(lines, sequence = false) {
  if (lines.length === 0 || lines.some((line) => /^\t/u.test(line))) return [];
  const depth = lines.reduce(
    (minimum, line) => Math.min(minimum, indent(line)),
    Infinity,
  );
  const starts = lines.flatMap((line, index) =>
    indent(line) === depth ? [index] : [],
  );
  if (sequence && starts.some((index) => !lines[index].trimStart().startsWith("- ")))
    return [];
  return starts.map((start, index) => {
    const body = lines.slice(start, starts[index + 1] ?? lines.length);
    if (sequence) {
      body[0] = body[0].slice(0, depth) + "  " + body[0].slice(depth + 2);
      return { value: "", body };
    }
    const match = /^\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_.-]+)):\s*(.*)$/u.exec(
      body[0],
    );
    return {
      key: match?.[1] ?? match?.[2] ?? match?.[3],
      value: match ? unquote(match[4]) : null,
      body: body.slice(1),
    };
  });
}

function field(block, key) {
  if (!block || block.value !== "") return null;
  const matches = blocks(block.body).filter((entry) => entry.key === key);
  return matches.length === 1 ? matches[0] : null;
}

function items(block) {
  return block?.value === "" ? blocks(block.body, true) : [];
}

function list(block) {
  if (!block) return [];
  if (/^\[.*\]$/u.test(block.value ?? ""))
    return block.value
      .slice(1, -1)
      .split(",")
      .map((value) => unquote(value.trim()));
  if (block.value === "" && block.body.every((line) => /^\s*-\s+[^:]+$/u.test(line)))
    return block.body.map((line) => unquote(line.trim().slice(2).trim()));
  return [];
}

function unconditional(block) {
  return (
    !block.body.some((line) => /^\s*<<:/u.test(line)) &&
    !field(block, "if") &&
    (!field(block, "continue-on-error") ||
      field(block, "continue-on-error").value === "false")
  );
}

function runCommands(step) {
  if (!unconditional(step)) return [];
  const run = field(step, "run");
  if (!run) return [];
  const commands = /^[|>][-+]?$/u.test(run.value ?? "")
    ? run.body.map((line) => line.trim())
    : [run.value];
  // Count executable gate lines, never echoed text, shell branches, or comments.
  return commands.every((line) =>
    /^corepack npm (?:install-scripts ls|run [A-Za-z0-9:_-]+)$/u.test(line),
  )
    ? commands
    : [];
}

function nodeVersions(job, steps) {
  const setup = steps.filter((step) =>
    /^actions\/setup-node@[\w.-]+$/u.test(field(step, "uses")?.value ?? ""),
  );
  if (setup.length !== 1 || !unconditional(setup[0])) return [];
  const value = field(field(setup[0], "with"), "node-version")?.value ?? "";
  if (/^\d+(?:\.\d+){0,2}$/u.test(value)) return [value];
  const reference = /^\$\{\{\s*matrix\.([A-Za-z0-9_-]+)\s*\}\}$/u.exec(value);
  if (!reference) return [];
  const matrix = field(field(job, "strategy"), "matrix");
  if (!matrix || matrix.value !== "" || field(matrix, "exclude")) return [];
  const axis = field(matrix, reference[1]);
  const include = field(matrix, "include");
  // Include-only matrices support paired Node/Python coverage. Mixed expansion
  // semantics are intentionally not inferred by this read-only declaration gate.
  if (axis && include) return [];
  const values = axis
    ? list(axis)
    : items(include).map((entry) => field(entry, reference[1])?.value ?? "");
  return values.every((version) => /^\d+(?:\.\d+){0,2}$/u.test(version)) ? values : [];
}

export function hasCompleteCiCoverage(workflows, auditScripts) {
  const covered = new Set();
  for (const text of workflows) {
    const workflow = { value: "", body: linesWithoutComments(text) };
    const events = field(workflow, "on");
    if (
      !["pull_request", "push"].every(
        (event) => field(events, event) || list(events).includes(event),
      )
    )
      continue;
    const jobs = field(workflow, "jobs");
    if (!jobs || jobs.value !== "") continue;
    for (const job of blocks(jobs.body)) {
      if (!unconditional(job)) continue;
      const steps = items(field(job, "steps"));
      const setupIndex = steps.findIndex((step) =>
        /^actions\/setup-node@[\w.-]+$/u.test(field(step, "uses")?.value ?? ""),
      );
      const commands = steps.slice(setupIndex + 1).flatMap(runCommands);
      if (
        ![
          "corepack npm install-scripts ls",
          "corepack npm run test-all",
          ...auditScripts.map((name) => "corepack npm run " + name),
        ].every((command) => commands.includes(command))
      )
        continue;
      for (const version of nodeVersions(job, steps))
        covered.add(version.split(".")[0]);
    }
  }
  return covered.has("22") && covered.has("24");
}
