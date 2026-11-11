/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Chemins relatifs : fonctionne sur GitHub Pages comme sur un autre hébergeur statique.
  base: "./",
  plugins: [react()],
  // Le poids réel est surveillé par `pnpm size` (R-44, < 300 Ko compressés).
  build: { chunkSizeWarningLimit: 600 },
  test: {
    include: ["tests/engine/**/*.test.ts"],
    // Les tests jouent des parties complètes : les machines de GitHub Actions sont plus lentes.
    testTimeout: 30_000,
  },
});
