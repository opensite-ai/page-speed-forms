import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    inputs: "src/inputs/index.ts",
    validation: "src/validation/index.ts",
    "validation-valibot": "src/validation/valibot.ts",
    "validation-rules": "src/validation/rules.ts",
    "validation-utils": "src/validation/utils.ts",
    // Placeholder modules commented out until implemented
    // upload: "src/upload/index.ts",
    // integration: "src/integration/index.ts",
    // builder: "src/builder/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ["react", "react-dom", "@legendapp/state", "valibot"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
