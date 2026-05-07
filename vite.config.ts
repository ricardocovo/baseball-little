/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
  },
});
