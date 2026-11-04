import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readAppVersion } from "../appVersion.ts";

const packagePath = join(process.cwd(), "package.json");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
  version: string;
};
const version = packageJson.version;

describe("readAppVersion", () => {
  it("returns the version string from package.json", () => {
    expect(readAppVersion()).toBe(version);
  });
});
