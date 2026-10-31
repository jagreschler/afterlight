import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases words and joins them with hyphens", () => {
    expect(slugify("Daft Punk")).toBe("daft-punk");
  });

  it("drops punctuation so the name is safe in a file path", () => {
    expect(slugify("AC/DC: Thunderstruck!")).toBe("ac-dc-thunderstruck");
  });

  it("strips accents", () => {
    expect(slugify("Björk")).toBe("bjork");
  });

  it("uses untitled when the name has no letters or digits", () => {
    expect(slugify("   !!!   ")).toBe("untitled");
  });
});
