import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { electrobunViteAliases } from "./.hutch/devkit/api/config/electrobun-vite";

const projectRoot = __dirname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      ...electrobunViteAliases(resolve(projectRoot, ".hutch/devkit")),
      { find: /^@\//, replacement: `${resolve(projectRoot, "src/renderer")}/` },
      { find: /^@shared\//, replacement: `${resolve(projectRoot, "src/shared")}/` },
    ],
  },
  root: "src/renderer",
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
