import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: true,
  clean: true,
  outDir: "dist",
  tsconfig: "tsconfig.json",
  platform: "node",
  treeshake: true,
});
