import { afterEach, describe, expect, it } from "vitest";
import type { Song } from "./itunes";
import { slugify } from "./slugify";
import { mountUploadSong } from "./uploadSong";

const FILE_NAME = "My Song.mp3";
const SONG_NAME = "My Song";
const SLUG = "my-song";
const ACCEPT = "audio/*";
const NOTE = "Apple previews are only 30 seconds. Upload your own song file for longer shows. Longer lengths are coming soon.";

afterEach(() => {
  document.body.replaceChildren();
});

describe("upload song", () => {
  it("explains that Apple previews are 30 seconds and offers an audio file input", () => {
    const view = mount();

    expect(view.root.textContent).toContain(NOTE);
    expect(view.input.type).toBe("file");
    expect(view.input.accept).toBe(ACCEPT);
  });

  it("turns the chosen file into a song named from the file", () => {
    const seen: Song[] = [];
    const view = mount((picked) => {
      seen.push(picked);
    });
    const file = new File([new Uint8Array([1, 2, 3])], FILE_NAME, { type: "audio/mpeg" });
    chooseFile(view.input, file);

    expect(seen).toHaveLength(1);
    const picked = seen[0];
    expect(picked?.trackName).toBe(SONG_NAME);
    expect(picked?.artistName).toBe("");
    expect(slugify(picked?.trackName ?? "")).toBe(SLUG);
    expect(picked?.previewUrl.length).toBeGreaterThan(0);
  });
});

function mount(onSong: (song: Song) => void = () => {}): {
  root: HTMLElement;
  input: HTMLInputElement;
} {
  const root = document.createElement("div");
  document.body.append(root);
  mountUploadSong(root, onSong);
  const input = root.querySelector("input");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("missing file input");
  }
  return {
    root: root,
    input: input,
  };
}

function chooseFile(input: HTMLInputElement, file: File): void {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
