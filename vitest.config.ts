import { defineConfig } from "vitest/config";
import { readAppVersion } from "./appVersion.ts";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(readAppVersion()),
  },
  test: {
    environment: "happy-dom",
  },
});
