import { afterEach, describe, expect, it } from "vitest";
import type { Song } from "./itunes";
import { mountShowFlow, ShowFlow } from "./showFlow";

const GENERATE_LABEL = "Generate & Download";
const SYNC_LABEL = "Sync all lights";
const HIDDEN = true;
const SHOWN = false;
const UNCHECKED = false;
const CHECKED = true;
const SPLIT = "split";
const TOGETHER = "together";
const FIRST_TITLE = "Get Lucky";

afterEach(() => {
  document.body.replaceChildren();
});

describe("show flow", () => {
  it("hides the sync checkbox and Generate until a song is selected", () => {
    const view = mount();

    expect(view.root.hidden).toBe(HIDDEN);

    view.flow.songSelected(song(FIRST_TITLE));

    expect(view.root.hidden).toBe(SHOWN);
    expect(view.sync.checked).toBe(UNCHECKED);
  });

  it("passes split when sync is off and together when it is checked", () => {
    const view = mount();
    const chosen = song(FIRST_TITLE);
    const seen: Array<{ mode: string; title: string }> = [];
    view.flow.onGenerate((mode, picked) => {
      seen.push({ mode: mode, title: picked.trackName });
    });
    view.flow.onGenerate((mode, picked) => {
      seen.push({ mode: mode, title: picked.trackName });
    });

    view.flow.songSelected(chosen);
    view.generate.click();

    const splitNotice = { mode: SPLIT, title: FIRST_TITLE };
    expect(seen).toEqual([splitNotice, splitNotice]);

    view.sync.click();
    expect(view.sync.checked).toBe(CHECKED);
    view.generate.click();

    const togetherNotice = { mode: TOGETHER, title: FIRST_TITLE };
    expect(seen).toEqual([splitNotice, splitNotice, togetherNotice, togetherNotice]);
  });
});

function mount(): {
  flow: ShowFlow;
  root: HTMLElement;
  generate: HTMLButtonElement;
  sync: HTMLInputElement;
} {
  const root = document.createElement("div");
  document.body.append(root);
  const flow = mountShowFlow(root);
  const generate = buttonNamed(root, GENERATE_LABEL);
  const sync = syncBox(root);
  return {
    flow: flow,
    root: root,
    generate: generate,
    sync: sync,
  };
}

function buttonNamed(root: ParentNode, label: string): HTMLButtonElement {
  const buttons = root.querySelectorAll("button");
  for (const button of buttons) {
    if (button.textContent === label) {
      return button;
    }
  }
  throw new Error(`missing ${label} button`);
}

function syncBox(root: ParentNode): HTMLInputElement {
  const labels = root.querySelectorAll("label");
  for (const label of labels) {
    if (label.textContent === SYNC_LABEL) {
      const input = label.querySelector("input");
      if (input instanceof HTMLInputElement) {
        return input;
      }
    }
  }
  throw new Error("missing sync checkbox");
}

function song(title: string): Song {
  return {
    trackId: title.length,
    trackName: title,
    artistName: "Daft Punk",
    artworkUrl: "https://example.com/art.jpg",
    previewUrl: "https://example.com/preview.m4a",
  };
}
