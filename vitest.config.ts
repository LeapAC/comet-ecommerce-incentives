import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` throws when imported outside a React Server context; stub
      // it so the server-only Leap client can be unit-tested under Node.
      "server-only": path.resolve(__dirname, "test/stubs/empty.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
})
