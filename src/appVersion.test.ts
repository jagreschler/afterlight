import { afterEach, describe, expect, it } from "vitest";

const VERSION = ".app-version";
const LABEL = "v0.1.0";

afterEach(() => {
  document.body.replaceChildren();
});

describe("app version", () => {
  it("shows the version on the page", async () => {
    document.body.append(page());
    await import("./main");

    const version = document.querySelector(VERSION);
    expect(version).toBeInstanceOf(HTMLElement);
    if (!(version instanceof HTMLElement)) {
      throw new Error("missing app version");
    }
    expect(version.textContent).toContain(LABEL);
  });
});

function page(): HTMLElement {
  const main = document.createElement("main");
  const search = document.createElement("div");
  const upload = document.createElement("div");
  const card = document.createElement("div");
  const preview = document.createElement("div");
  const recent = document.createElement("div");
  const generate = document.createElement("div");
  search.id = "search";
  upload.id = "upload";
  recent.id = "recent";
  card.id = "selected-song";
  preview.id = "preview";
  generate.id = "generate";
  main.append(search, upload, recent, card, preview, generate);
  return main;
}
