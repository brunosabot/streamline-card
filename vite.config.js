import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const targetDirectory = path.resolve(env.TARGET_DIRECTORY || "dist");

  return {
    build: {
      outDir: path.resolve(targetDirectory),
      lib: {
        entry: "src/streamline-card.js",
        formats: ["es"],
      },
    },
  };
});
