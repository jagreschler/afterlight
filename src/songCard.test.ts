import { afterEach, describe, expect, it } from "vitest";
import type { Song } from "./itunes";
import { mountSongCard } from "./songCard";

afterEach(() => {
  document.body.replaceChildren();
});

describe("song card", () => {
  it("stays hidden until a song is shown", () => {
    const root = document.createElement("div");
    document.body.append(root);
    mountSongCard(root);

    const card = root.querySelector(".choice");
    expect(card).toBeInstanceOf(HTMLElement);
    if (!(card instanceof HTMLElement)) {
      return;
    }
    expect(card.hidden).toBe(true);
  });

  it("shows the chosen song's artwork, title, and artist", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const card = mountSongCard(root);
    const song: Song = {
      trackId: 7,
      trackName: "Get Lucky",
      artistName: "Daft Punk",
      artworkUrl: "https://example.com/7.jpg",
      previewUrl: "https://example.com/7.m4a",
    };

    card.show(song);

    const shown = root.querySelector(".choice");
    if (!(shown instanceof HTMLElement)) {
      throw new Error("missing song card");
    }
    expect(shown.hidden).toBe(false);
    expect(shown.textContent).toContain("Get Lucky");
    expect(shown.textContent).toContain("Daft Punk");
    expect(shown.querySelector("img")?.getAttribute("src")).toBe(song.artworkUrl);
  });
});
