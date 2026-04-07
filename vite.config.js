import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "spa-fallback-404",
      closeBundle() {
        copyFileSync(
          resolve("dist/index.html"),
          resolve("dist/404.html"),
        );
      },
    },
  ],
  base: "/",
});
