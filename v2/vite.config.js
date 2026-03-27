import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  base: "/v2/",
  build: {
    emptyOutDir: true,
    outDir: path.resolve(__dirname, "../public/v2"),
  },
});
