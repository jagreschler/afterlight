import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Song } from "./itunes";
import { mountSearchBar } from "./searchBar";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("search bar", () => {
  it("calls onSelect with the song clicked and closes the list", async () => {
    const picked = song(7, "Get Lucky", "Daft Punk");
    const search = vi.fn(async () => [picked, song(8, "Other", "Someone")]);
    const onSelect = vi.fn();
    const { root, input } = mount(search, onSelect);

    type(input, "get");
    await vi.advanceTimersByTimeAsync(300);

    const option = root.querySelectorAll('[role="option"]')[0];
    if (!(option instanceof HTMLButtonElement)) {
      throw new Error("missing search result");
    }
    option.click();

    expect(onSelect).toHaveBeenCalledWith(picked);
    expect(input.value).toBe("Get Lucky — Daft Punk");
    expect(root.querySelectorAll('[role="option"]')).toHaveLength(0);
    expect(root.querySelector(".choice")).toBeNull();
  });

  it("selects the highlighted song with the arrow keys and enter", async () => {
    const first = song(1, "First", "Ada");
    const second = song(2, "Second", "Grace");
    const search = vi.fn(async () => [first, second]);
    const onSelect = vi.fn();
    const { input } = mount(search, onSelect);

    type(input, "so");
    await vi.advanceTimersByTimeAsync(300);

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onSelect).toHaveBeenCalledWith(second);
    expect(input.value).toBe("Second — Grace");
  });
});

function mount(
  search: (query: string) => Promise<Song[]>,
  onSelect: (song: Song) => void = () => {},
): { root: HTMLElement; input: HTMLInputElement } {
  const root = document.createElement("div");
  document.body.append(root);
  mountSearchBar(root, { search, onSelect });

  const input = root.querySelector("input");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("missing search input");
  }
  return { root, input };
}

function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
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
