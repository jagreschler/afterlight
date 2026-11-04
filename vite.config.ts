import { defineConfig } from "vite";
import { readAppVersion } from "./appVersion.ts";

// GitHub Pages project site: https://<user>.github.io/afterlight/
export default defineConfig({
  base: "/afterlight/",
  define: {
    __APP_VERSION__: JSON.stringify(readAppVersion()),
  },
});
