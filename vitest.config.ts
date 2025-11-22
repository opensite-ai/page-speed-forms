import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    // Exclude legacy forms.old directory from test discovery
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{git,cache,output,temp}/**",
      "**/forms.old/**",
    ],
    // Run tests in isolated processes with increased heap to prevent memory leaks
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
        execArgv: ["--max-old-space-size=8192"],
      },
    },
    // Increase test timeout for async validation tests
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/test-setup.ts",
        "src/forms.old/**/*",
        "examples/**/*",
      ],
    },
  },
});
