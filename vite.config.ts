import { defineConfig } from "vitest/config";
import { htmlInclude } from "./plugins/html-include";

export default defineConfig({
  base: "./",
  plugins: [htmlInclude()],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
