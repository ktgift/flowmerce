import { defineConfig } from "vitest/config"
import path from "path"
import type { Plugin } from "vite"

// Stub all bun:* built-ins so Vite can bundle spec files for Node.js execution.
const bunCompatPlugin: Plugin = {
  name: "bun-compat",
  enforce: "pre",
  resolveId(id) {
    if (id.startsWith("bun:")) return `\0bun-stub`
    return null
  },
  load(id) {
    if (id === "\0bun-stub") {
      return `
        export class Database {
          exec() { return this }
          run() { return { changes: 0, lastInsertRowid: 0 } }
          prepare() { return { run: () => ({}), get: () => undefined, all: () => [] } }
          close() {}
        }
        export default {}
      `
    }
    return null
  },
}

export default defineConfig({
  plugins: [bunCompatPlugin],
  ssr: {
    noExternal: true,
  },
  test: {
    environment: "node",
    globals:     true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include:  ["src/services/**"],
      exclude:  ["src/services/**/*.spec.ts", "src/db/**"],
    },
  },
  resolve: {
    alias: {
      shared: path.resolve("../shared"),
    },
  },
})
