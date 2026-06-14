import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
  },
  resolve: {
    alias: {
      "sql.js": path.resolve(__dirname, "node_modules/sql.js/dist/sql-wasm.js"),
    },
  },
});
