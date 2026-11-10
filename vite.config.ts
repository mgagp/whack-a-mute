/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Chemins relatifs : fonctionne sur GitHub Pages comme sur un autre hébergeur statique.
  base: "./",
  plugins: [react()],
  test: {
    include: ["tests/engine/**/*.test.ts"],
  },
});
