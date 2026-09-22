import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactDir, "..", "..");

// Bundles the Express app into one CommonJS file that Vercel runs as a
// serverless function at <repo>/api/index.js
await build({
  entryPoints: [path.resolve(artifactDir, "src/vercel.ts")],
  outfile: path.resolve(repoRoot, "api/index.js"),
  platform: "node",
  target: "node20",
  format: "cjs",
  bundle: true,
  logLevel: "info",
  external: ["pg-native", "*.node"],
  define: { "process.env.NODE_ENV": '"production"' },
});
