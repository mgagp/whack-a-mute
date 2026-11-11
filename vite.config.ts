/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Chemins relatifs : fonctionne sur GitHub Pages comme sur un autre hébergeur statique.
  base: "./",
  plugins: [react()],
  // Le poids réel est surveillé par `pnpm size` (R-44, < 300 Ko compressés).
  build: {
    chunkSizeWarningLimit: 600,
    // Deux pages pour le même jeu : `/` et `/en/`, qui a son propre aperçu de lien en anglais (R-60).
    rollupOptions: { input: { main: "index.html", en: "en/index.html" } },
  },
  test: {
    include: ["tests/engine/**/*.test.ts", "tests/ui/**/*.test.ts"],
    // Les tests jouent des parties complètes : les machines de GitHub Actions sont plus lentes.
    testTimeout: 30_000,
  },
});
