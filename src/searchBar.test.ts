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
  it("waits 300 ms after typing stops before searching", async () => {
    const search = vi.fn(async () => [] as Song[]);
    const { input } = mount(search);

    type(input, "ab");
    await vi.advanceTimersByTimeAsync(299);
    expect(search).not.toHaveBeenCalled();

    type(input, "abc");
    await vi.advanceTimersByTimeAsync(299);
    expect(search).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith("abc");
  });

  it("does not search until the query has at least two characters", async () => {
    const search = vi.fn(async () => [] as Song[]);
    const { input } = mount(search);

    type(input, "a");
    await vi.advanceTimersByTimeAsync(300);
    expect(search).not.toHaveBeenCalled();

    type(input, " a ");
    await vi.advanceTimersByTimeAsync(300);
    expect(search).not.toHaveBeenCalled();

    type(input, "  ab  ");
    await vi.advanceTimersByTimeAsync(300);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith("ab");
  });

  it("keeps the newer matches when an older search returns last", async () => {
    const older = song(1, "Older", "Ada");
    const newer = song(2, "Newer", "Grace");
    const first = deferred<Song[]>();
    const second = deferred<Song[]>();
    const search = vi.fn(async (query: string) => {
      if (query === "ab") {
        return first.promise;
      }
      if (query === "abc") {
        return second.promise;
      }
      return [];
    });
    const { root, input } = mount(search);

    type(input, "ab");
    await vi.advanceTimersByTimeAsync(300);
    type(input, "abc");
    await vi.advanceTimersByTimeAsync(300);

    second.resolve([newer]);
    await vi.advanceTimersByTimeAsync(0);
    expect(optionTitles(root)).toEqual(["Newer"]);

    first.resolve([older]);
    await vi.advanceTimersByTimeAsync(0);
    expect(optionTitles(root)).toEqual(["Newer"]);
  });

  it("shows the song chosen with the mouse and passes it to the callback", async () => {
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
    expect(selectedText(root)).toContain("Get Lucky");
    expect(selectedText(root)).toContain("Daft Punk");
    expect(root.querySelector(".choice img")?.getAttribute("src")).toBe(picked.artworkUrl);
    expect(root.querySelectorAll('[role="option"]')).toHaveLength(0);
  });

  it("selects the highlighted song with the arrow keys and enter", async () => {
    const first = song(1, "First", "Ada");
    const second = song(2, "Second", "Grace");
    const search = vi.fn(async () => [first, second]);
    const onSelect = vi.fn();
    const { root, input } = mount(search, onSelect);

    type(input, "so");
    await vi.advanceTimersByTimeAsync(300);

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onSelect).toHaveBeenCalledWith(second);
    expect(selectedText(root)).toContain("Second");
    expect(selectedText(root)).toContain("Grace");
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

function optionTitles(root: ParentNode): string[] {
  return [...root.querySelectorAll(".option-title")].map((node) => node.textContent ?? "");
}

function selectedText(root: ParentNode): string {
  const choice = root.querySelector(".choice");
  if (!(choice instanceof HTMLElement) || choice.hidden) {
    return "";
  }
  return choice.textContent ?? "";
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

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolvePromise: (value: T) => void = () => {
    throw new Error("deferred promise resolved before it was created");
  };
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return {
    promise,
    resolve: (value) => {
      resolvePromise(value);
    },
  };
}
