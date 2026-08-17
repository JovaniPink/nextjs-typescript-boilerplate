const omittedDependencies = new Set(
  (process.env.npm_config_omit ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

if (omittedDependencies.has("dev") || process.env.NODE_ENV === "production") {
  console.log("Skipping Git hook setup because development dependencies are omitted.");
} else {
  const { default: husky } = await import("husky");
  const message = husky();

  if (message) {
    console.log(message);
  }
}
