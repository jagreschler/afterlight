import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readAppVersion(): string {
  const packagePath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
    version: string;
  };
  return packageJson.version;
}
