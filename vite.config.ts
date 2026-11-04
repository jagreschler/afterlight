import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  version: string;
};
const appVersion = packageJson.version;

// GitHub Pages project site: https://<user>.github.io/afterlight/
export default defineConfig({
  base: "/afterlight/",
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
});
