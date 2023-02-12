import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/node/cli.ts", "src/node/index.ts", "src/node/dev.ts"],
  clean: true,
  bundle: true,
  splitting: true,
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  shims: true
});
