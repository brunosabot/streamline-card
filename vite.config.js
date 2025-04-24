import { defineConfig, loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const targetDirectory = path.resolve(env.TARGET_DIRECTORY || "dist");

  return {
    build: {
      lib: {
        entry: "src/streamline-card.js",
        formats: ["es"],
      },
      minify: false,
      outDir: path.resolve(targetDirectory),
    },
    test: {
      environment: "happy-dom",
    },
  };
});
