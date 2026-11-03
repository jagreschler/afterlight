import { afterEach, describe, expect, it } from "vitest";
import type { AudioAnalysis } from "./analyzeAudio";
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
const ANALYZING = "Analyzing song…";
const BUILDING = "Building light show…";
const FAILED = "Couldn't build the light show.";
const SAMPLE_RATE = 44100;
const FRAME_RATE = 50;
const ONE_FRAME = 1;

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

  it("passes split when sync is off and together when it is checked", async () => {
    const view = mount(async () => oneBeat());
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
    await settle();

    const splitNotice = { mode: SPLIT, title: FIRST_TITLE };
    expect(seen).toEqual([splitNotice, splitNotice]);

    view.sync.click();
    expect(view.sync.checked).toBe(CHECKED);
    view.generate.click();
    await settle();

    const togetherNotice = { mode: TOGETHER, title: FIRST_TITLE };
    expect(seen).toEqual([splitNotice, splitNotice, togetherNotice, togetherNotice]);
  });

  it("disables the button while analyzing, then while building, then enables it", async () => {
    const pending = deferred<AudioAnalysis>();
    const view = mount(() => pending.promise);
    view.flow.songSelected(song(FIRST_TITLE));

    view.generate.click();

    expect(view.generate.disabled).toBe(true);
    expect(view.generate.textContent).toBe(ANALYZING);

    pending.resolve(oneBeat());
    await Promise.resolve();

    expect(view.generate.disabled).toBe(true);
    expect(view.generate.textContent).toBe(BUILDING);

    await Promise.resolve();

    expect(view.generate.disabled).toBe(false);
    expect(view.generate.textContent).toBe(GENERATE_LABEL);
    expect(view.flow.lightShow).toHaveLength(ONE_FRAME);
  });

  it("shows an error and re-enables the button when the preview cannot be analyzed", async () => {
    const pending = deferred<AudioAnalysis>();
    const view = mount(() => pending.promise);
    view.flow.songSelected(song(FIRST_TITLE));

    view.generate.click();
    pending.reject(new Error("offline"));
    await Promise.resolve();

    expect(view.generate.disabled).toBe(false);
    expect(view.generate.textContent).toBe(FAILED);
    expect(view.flow.lightShow).toBeNull();
  });
});

function mount(analyze?: (url: string) => Promise<AudioAnalysis>): {
  flow: ShowFlow;
  root: HTMLElement;
  generate: HTMLButtonElement;
  sync: HTMLInputElement;
} {
  const root = document.createElement("div");
  document.body.append(root);
  const flow = analyze === undefined ? mountShowFlow(root) : mountShowFlow(root, analyze);
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

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function oneBeat(): AudioAnalysis {
  return {
    sampleRate: SAMPLE_RATE,
    frameRate: FRAME_RATE,
    frames: [{ time: 0, bass: 1, mids: 0, treble: 0 }],
    onsetTimes: [0],
  };
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolvePromise: (value: T) => void = () => {
    throw new Error("deferred promise resolved before it was created");
  };
  let rejectPromise: (error: Error) => void = () => {
    throw new Error("deferred promise rejected before it was created");
  };
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return {
    promise: promise,
    resolve: (value) => {
      resolvePromise(value);
    },
    reject: (error) => {
      rejectPromise(error);
    },
  };
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
