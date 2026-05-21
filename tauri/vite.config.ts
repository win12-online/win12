import { defineConfig } from "vite";

export default defineConfig({
  root: "..",
  base: "./",
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "tauri/dist",
    emptyOutDir: true,
  },
});