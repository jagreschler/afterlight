import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ICON = 'link[rel="icon"]';
const FILE = "favicon.svg";
const HREF = `%BASE_URL%${FILE}`;
const STYLESHEET = /<link rel="stylesheet"[^>]*>/g;

describe("favicon", () => {
  it("links a favicon file that exists", () => {
    const html = readFileSync(join(process.cwd(), "index.html"), "utf8").replace(STYLESHEET, "");
    const doc = new DOMParser().parseFromString(html, "text/html");
    const link = doc.querySelector(ICON);
    expect(link).toBeInstanceOf(Element);
    if (!(link instanceof Element)) {
      throw new Error("missing favicon link");
    }
    expect(link.getAttribute("href")).toBe(HREF);
    expect(existsSync(join(process.cwd(), "public", FILE))).toBe(true);
  });
});
