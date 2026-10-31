import { afterEach, describe, expect, it } from "vitest";
import type { Song } from "./itunes";
import { SearchBarCard } from "./searchBarCard";

afterEach(() => {
  document.body.replaceChildren();
});

describe("SearchBarCard", () => {
  it("builds a label, a search input, a hidden list, and a hidden status", () => {
    const { card, root } = mount();

    expect(root.classList.contains("search")).toBe(true);
    expect(card.label.textContent).toBe("Find a song");
    expect(card.label.htmlFor).toBe("song-search");
    expect(card.input.id).toBe("song-search");
    expect(card.input.getAttribute("role")).toBe("combobox");
    expect(card.list.hidden).toBe(true);
    expect(card.list.getAttribute("role")).toBe("listbox");
    expect(card.status.hidden).toBe(true);
  });

  it("shows a row per song and highlights the first", () => {
    const { card } = mount();
    const first = song(1, "Get Lucky", "Daft Punk");
    const second = song(2, "One More Time", "Daft Punk");

    const buttons = card.showResults([first, second]);

    expect(buttons).toHaveLength(2);
    expect(card.list.hidden).toBe(false);
    expect(buttons[0]?.querySelector(".option-title")?.textContent).toBe("Get Lucky");
    expect(buttons[0]?.querySelector(".option-artist")?.textContent).toBe("Daft Punk");
    expect(buttons[0]?.querySelector("img")?.getAttribute("src")).toBe(first.artworkUrl);
    expect(buttons[0]?.getAttribute("aria-selected")).toBe("true");
    expect(card.input.getAttribute("aria-activedescendant")).toBe("song-option-0");
    expect(card.status.hidden).toBe(true);
  });

  it("moves the highlight with setActive", () => {
    const { card } = mount();
    const buttons = card.showResults([
      song(1, "First", "Ada"),
      song(2, "Second", "Grace"),
    ]);

    card.setActive(1);

    expect(buttons[0]?.getAttribute("aria-selected")).toBe("false");
    expect(buttons[1]?.getAttribute("aria-selected")).toBe("true");
    expect(card.input.getAttribute("aria-activedescendant")).toBe("song-option-1");
  });

  it("hides the list and clears its rows", () => {
    const { card } = mount();
    card.showResults([song(1, "Get Lucky", "Daft Punk")]);

    card.hideList();

    expect(card.list.hidden).toBe(true);
    expect(card.list.children).toHaveLength(0);
    expect(card.input.getAttribute("aria-expanded")).toBe("false");
    expect(card.input.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("shows a status message, and says when nothing matched", () => {
    const { card } = mount();

    card.setStatus("Searching…");
    expect(card.status.hidden).toBe(false);
    expect(card.status.textContent).toBe("Searching…");

    card.setStatus(null);
    expect(card.status.hidden).toBe(true);

    expect(card.showResults([])).toEqual([]);
    expect(card.list.hidden).toBe(true);
    expect(card.status.hidden).toBe(false);
    expect(card.status.textContent).toBe("No matches.");
  });
});

function mount(): { root: HTMLElement; card: SearchBarCard } {
  const root = document.createElement("div");
  document.body.append(root);
  return { root, card: new SearchBarCard(root) };
}

function song(trackId: number, trackName: string, artistName: string): Song {
  return {
    trackId,
    trackName,
    artistName,
    artworkUrl: `https://example.com/${trackId}.jpg`,
    previewUrl: `https://example.com/${trackId}.m4a`,
  };
}
