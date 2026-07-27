import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    // Default to node for pure-function tests; convex-test integration suites opt
    // into the edge runtime per-file via `// @vitest-environment edge-runtime`.
    environment: "node",
    include: ["convex/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
  resolve: {
    alias: {
      "@renegade/convex": path.resolve(import.meta.dirname, "./convex"),
    },
  },
})
