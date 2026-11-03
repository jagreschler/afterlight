import { describe, expect, it } from "vitest";
import { showSlug, slugify } from "./slugify";

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

describe("showSlug", () => {
  it("joins the artist and song into one file name", () => {
    expect(showSlug("The Eagles", "Hotel California")).toBe("the-eagles-hotel-california");
  });

  it("turns punctuation into single hyphens", () => {
    expect(showSlug("AC/DC", "Thunderstruck!")).toBe("ac-dc-thunderstruck");
  });

  it("strips accents from the artist and the song", () => {
    expect(showSlug("Björk", "Jóga")).toBe("bjork-joga");
  });
});
