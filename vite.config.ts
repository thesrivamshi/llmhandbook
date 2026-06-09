import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Local-only app. `npm run dev` serves it; `npm run build` produces ONE
// self-contained index.html (everything inlined) that opens by double-click.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  server: { host: true, port: 5173 },
});
