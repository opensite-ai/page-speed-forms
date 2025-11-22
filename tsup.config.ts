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
    upload: "src/upload/index.ts",
    integration: "src/integration/index.ts",
    // Placeholder modules commented out until implemented
    // builder: "src/builder/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    "react",
    "react-dom",
    "@legendapp/state",
    "valibot",
  ],
  // Note: "use client" directive removed - should be added by consuming application
  // For Next.js 13+ App Router, add "use client" at the top of files that import this library
});
