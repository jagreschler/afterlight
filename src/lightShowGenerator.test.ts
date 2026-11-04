import { unzipSync } from "fflate";
import { afterEach, describe, expect, it } from "vitest";
import type { AudioAnalysis } from "./analyzeAudio";
import type { AnalyzedPreview } from "./analyzePreview";
import type { Song } from "./itunes";
import { mountLightShowGenerator, LightShowGenerator } from "./lightShowGenerator";

const GENERATE_LABEL = "Generate";
const DOWNLOAD_LABEL = "Download";
const LIGHT_PREVIEW = ".light-preview svg";
const GENERATE_BUTTON = ".generate .generate-button";
const DOWNLOAD_BUTTON = ".generate .download-button";
const SYNC_LABEL = "Sync lights";
const HIDDEN = true;
const SHOWN = false;
const DISABLED = true;
const ENABLED = false;
const UNCHECKED = false;
const CHECKED = true;
const SPLIT = "split";
const TOGETHER = "together";
const FIRST_TITLE = "Get Lucky";
const ANALYZING = "Analyzing song…";
const BUILDING = "Building light show…";
const FAILED = "Couldn't build the light show.";
const SAMPLE_RATE = 44100;
const SAMPLE_URL = "https://example.com/preview.m4a";
const FRAME_RATE = 50;
const ONE_FRAME = 1;
const ARTIST = "Daft Punk";
const SLUG = "daft-punk-get-lucky";
const ZIP_NAME = `${SLUG}.zip`;
const FSEQ_NAME = `${SLUG}.fseq`;
const WAV_NAME = `${SLUG}.wav`;
const NOTE_NAME = "README.txt";
const PREVIEW_SAMPLES = new Float32Array([0, 0.25, -0.25]);
const PREVIEW_SECONDS = 30;
const MID_SECONDS = 45;
const LONG_SECONDS = 60;
const UPLOAD_ID = 0;
const UPLOAD_ZIP = "my-song.zip";
const LENGTH_LABEL = "Show length";
const START_AT = 0;
const START_LATER = 10;
const PREVIEW_CHOICE = `${PREVIEW_SECONDS} s`;
const MID_CHOICE = `${MID_SECONDS} s`;
const LONG_CHOICE = `${LONG_SECONDS} s`;

afterEach(() => {
  document.body.replaceChildren();
});

describe("light show generator", () => {
  it("hides the sync checkbox and Generate until a song is selected", () => {
    const view = mount();

    expect(view.root.hidden).toBe(HIDDEN);

    view.generator.songSelected(song(FIRST_TITLE));

    expect(view.root.hidden).toBe(SHOWN);
    expect(view.root.textContent).toContain(SYNC_LABEL);
    expect(view.syncLights.checked).toBe(UNCHECKED);
  });

  it("passes split when sync is off and together when it is checked", async () => {
    const view = mount(async () => readyPreview());
    const chosen = song(FIRST_TITLE);
    const seen: Array<{ mode: string; title: string }> = [];
    view.generator.onGenerate((mode, picked) => {
      seen.push({ mode: mode, title: picked.trackName });
    });
    view.generator.onGenerate((mode, picked) => {
      seen.push({ mode: mode, title: picked.trackName });
    });

    view.generator.songSelected(chosen);
    view.generate.click();
    await settle();

    const splitNotice = { mode: SPLIT, title: FIRST_TITLE };
    expect(seen).toEqual([splitNotice, splitNotice]);

    view.syncLights.click();
    expect(view.syncLights.checked).toBe(CHECKED);
    view.generate.click();
    await settle();

    const togetherNotice = { mode: TOGETHER, title: FIRST_TITLE };
    expect(seen).toEqual([splitNotice, splitNotice, togetherNotice, togetherNotice]);
  });

  it("disables the button while analyzing and building, and leaves it disabled once built", async () => {
    const pending = deferred<AnalyzedPreview>();
    const view = mount(() => pending.promise);
    view.generator.songSelected(song(FIRST_TITLE));

    view.generate.click();

    expect(view.generate.disabled).toBe(true);
    expect(view.generate.textContent).toBe(ANALYZING);

    pending.resolve(readyPreview());
    await Promise.resolve();

    expect(view.generate.disabled).toBe(true);
    expect(view.generate.textContent).toBe(BUILDING);

    await Promise.resolve();

    expect(view.generate.disabled).toBe(true);
    expect(view.generate.hidden).toBe(SHOWN);
    expect(view.generate.textContent).toBe(GENERATE_LABEL);
    expect(view.download.hidden).toBe(SHOWN);
    expect(view.generator.lightShow).toHaveLength(ONE_FRAME);
  });

  it("shows an error and re-enables the button when the preview cannot be analyzed", async () => {
    const pending = deferred<AnalyzedPreview>();
    const view = mount(() => pending.promise);
    view.generator.songSelected(song(FIRST_TITLE));

    view.generate.click();
    pending.reject(new Error("offline"));
    await Promise.resolve();

    expect(view.generate.disabled).toBe(false);
    expect(view.generate.textContent).toBe(FAILED);
    expect(view.generator.lightShow).toBeNull();
    expect(view.download.hidden).toBe(HIDDEN);
  });

  it("puts Download beside Generate", () => {
    const view = mount();
    const generate = view.root.querySelector(GENERATE_BUTTON);
    const download = view.root.querySelector(DOWNLOAD_BUTTON);

    expect(generate).toBeInstanceOf(HTMLButtonElement);
    expect(download).toBeInstanceOf(HTMLButtonElement);
    if (!(generate instanceof HTMLButtonElement) || !(download instanceof HTMLButtonElement)) {
      throw new Error("missing show buttons");
    }
    expect(generate.parentElement).toBe(download.parentElement);
    expect(generate.nextElementSibling).toBe(download);
  });

  it("shows an enabled Generate and no Download before a show is built", () => {
    const view = mount();
    view.generator.songSelected(song(FIRST_TITLE));

    expect(buttonHidden(view.root, GENERATE_BUTTON)).toBe(SHOWN);
    expect(buttonDisabled(view.root, GENERATE_BUTTON)).toBe(ENABLED);
    expect(buttonHidden(view.root, DOWNLOAD_BUTTON)).toBe(HIDDEN);
  });

  it("keeps Generate visible but disabled and shows Download after Generate", async () => {
    const view = mount(async () => readyPreview());
    view.generator.songSelected(song(FIRST_TITLE));
    view.generate.click();
    await settle();

    expect(buttonHidden(view.root, GENERATE_BUTTON)).toBe(SHOWN);
    expect(buttonDisabled(view.root, GENERATE_BUTTON)).toBe(DISABLED);
    expect(buttonHidden(view.root, DOWNLOAD_BUTTON)).toBe(SHOWN);
  });

  it("enables Generate and hides Download after an option changes", async () => {
    const view = mount(async () => readyPreview());
    view.generator.songSelected(song(FIRST_TITLE));
    view.generate.click();
    await settle();
    view.syncLights.click();

    expect(buttonHidden(view.root, GENERATE_BUTTON)).toBe(SHOWN);
    expect(buttonDisabled(view.root, GENERATE_BUTTON)).toBe(ENABLED);
    expect(buttonHidden(view.root, DOWNLOAD_BUTTON)).toBe(HIDDEN);
  });

  it("restores a song and its options, then generates", async () => {
    const view = mount(async () => readyPreview());
    const picked = song(FIRST_TITLE);

    view.generator.restore(picked, PREVIEW_SECONDS, START_AT, CHECKED);
    await settle();

    expect(view.syncLights.checked).toBe(CHECKED);
    expect(view.length.value).toBe(String(PREVIEW_SECONDS));
    expect(view.start.value).toBe(String(START_AT));
    expect(view.generator.lightShow).not.toBeNull();
  });

  it("shows the light preview after Generate and not before", async () => {
    const view = mount(async () => readyPreview());
    view.generator.songSelected(song(FIRST_TITLE));

    expect(view.root.querySelector(LIGHT_PREVIEW)).toBeNull();

    view.generate.click();
    await settle();

    expect(view.root.querySelector(LIGHT_PREVIEW)).toBeInstanceOf(SVGElement);
  });

  it("builds the show on Generate and saves the zip only from Download", async () => {
    const downloads: Array<{ name: string; bytes: Uint8Array }> = [];
    const view = mount(async () => readyPreview(), (name, bytes) => {
      downloads.push({ name: name, bytes: bytes });
    });
    view.generator.songSelected(song(FIRST_TITLE));
    expect(view.download.hidden).toBe(HIDDEN);

    view.generate.click();
    await settle();

    expect(view.generate.disabled).toBe(DISABLED);
    expect(view.generate.hidden).toBe(SHOWN);
    expect(view.generate.textContent).toBe(GENERATE_LABEL);
    expect(view.download.hidden).toBe(SHOWN);
    expect(view.download.textContent).toBe(DOWNLOAD_LABEL);
    expect(downloads).toHaveLength(0);

    view.download.click();

    expect(downloads).toHaveLength(1);
    const saved = downloads[0];
    expect(saved?.name).toBe(ZIP_NAME);
    const files = unzipSync(saved?.bytes ?? new Uint8Array());
    expect(sortedNames(files)).toEqual([FSEQ_NAME, NOTE_NAME, WAV_NAME].sort());
    expect(text(files[FSEQ_NAME], 0, 4)).toBe("PSEQ");
    expect(text(files[WAV_NAME], 0, 4)).toBe("RIFF");
  });

  it("hides Download when the song or the show settings change", async () => {
    const view = mount(async () => readyPreview());
    view.generator.songSelected(uploadedSong());
    view.generate.click();
    await settle();
    expect(view.download.hidden).toBe(SHOWN);

    view.syncLights.click();
    expect(view.download.hidden).toBe(HIDDEN);

    view.generate.click();
    await settle();
    view.length.value = String(LONG_SECONDS);
    view.length.dispatchEvent(new Event("change"));
    expect(view.download.hidden).toBe(HIDDEN);

    view.generate.click();
    await settle();
    view.start.value = String(START_LATER);
    view.start.dispatchEvent(new Event("input"));
    expect(view.download.hidden).toBe(HIDDEN);

    view.generate.click();
    await settle();
    view.generator.songSelected(song(FIRST_TITLE));
    expect(view.download.hidden).toBe(HIDDEN);
  });

  it("shows Download again when the length matches the last Generate", async () => {
    const downloads: Array<{ name: string; bytes: Uint8Array }> = [];
    const view = mount(async () => readyPreview(), (name, bytes) => {
      downloads.push({ name: name, bytes: bytes });
    });
    view.generator.songSelected(uploadedSong());
    view.generate.click();
    await settle();

    view.length.value = String(MID_SECONDS);
    view.length.dispatchEvent(new Event("change"));
    expect(view.download.hidden).toBe(HIDDEN);

    view.length.value = String(PREVIEW_SECONDS);
    view.length.dispatchEvent(new Event("change"));
    expect(view.download.hidden).toBe(SHOWN);

    view.download.click();
    expect(downloads).toHaveLength(1);
    expect(downloads[0]?.name).toBe(UPLOAD_ZIP);
  });

  it("stores Sync all lights as syncLights", async () => {
    const view = mount(async () => readyPreview());
    view.generator.songSelected(song(FIRST_TITLE));
    view.syncLights.click();
    view.generate.click();
    await settle();

    const stored = view.generator.builtShow();
    expect(stored?.syncLights).toBe(CHECKED);
  });

  it("keeps show length disabled at 30 seconds for an iTunes preview", () => {
    const view = mount();

    view.generator.songSelected(song(FIRST_TITLE));

    expect(view.length.disabled).toBe(true);
    expect(view.length.value).toBe(String(PREVIEW_SECONDS));
    expect(choiceLabels(view.length)).toEqual([PREVIEW_CHOICE, MID_CHOICE, LONG_CHOICE]);
    expect(view.length.labels[0]?.textContent).toContain(LENGTH_LABEL);
  });

  it("enables show length for an upload and trims the show to that choice", async () => {
    const seen: number[] = [];
    const view = mount(async (_url, seconds) => {
      seen.push(seconds);
      return readyPreview();
    });

    view.generator.songSelected(uploadedSong());
    expect(view.length.disabled).toBe(false);
    view.length.value = String(LONG_SECONDS);
    view.generate.click();
    await settle();

    expect(seen).toEqual([LONG_SECONDS]);

    view.generator.songSelected(song(FIRST_TITLE));
    expect(view.length.disabled).toBe(true);
    expect(view.length.value).toBe(String(PREVIEW_SECONDS));
    view.generate.click();
    await settle();

    expect(seen).toEqual([LONG_SECONDS, PREVIEW_SECONDS]);
  });

  it("keeps the start time disabled at 0 for an iTunes preview", () => {
    const view = mount();

    view.generator.songSelected(song(FIRST_TITLE));

    expect(view.start.disabled).toBe(true);
    expect(view.start.value).toBe(String(START_AT));
  });

  it("starts an uploaded show at the chosen second", async () => {
    const seen: Array<{ seconds: number; start: number }> = [];
    const view = mount(async (_url, seconds, start) => {
      seen.push({ seconds: seconds, start: start });
      return readyPreview();
    });

    view.generator.songSelected(uploadedSong());
    expect(view.start.disabled).toBe(false);
    view.start.value = String(START_LATER);
    view.length.value = String(PREVIEW_SECONDS);
    view.generate.click();
    await settle();

    const uploaded = { seconds: PREVIEW_SECONDS, start: START_LATER };
    expect(seen).toEqual([uploaded]);

    view.generator.songSelected(song(FIRST_TITLE));
    expect(view.start.disabled).toBe(true);
    expect(view.start.value).toBe(String(START_AT));
    view.generate.click();
    await settle();

    const preview = { seconds: PREVIEW_SECONDS, start: START_AT };
    expect(seen).toEqual([uploaded, preview]);
  });
});

function mount(
  analyze?: (url: string, seconds: number, start: number) => Promise<AnalyzedPreview>,
  saveZip?: (name: string, bytes: Uint8Array) => void,
): {
  generator: LightShowGenerator;
  root: HTMLElement;
  generate: HTMLButtonElement;
  syncLights: HTMLInputElement;
  length: HTMLSelectElement;
  start: HTMLInputElement;
  download: HTMLButtonElement;
} {
  const root = document.createElement("div");
  document.body.append(root);
  const generator = saveZip === undefined
    ? analyze === undefined
      ? mountLightShowGenerator(root)
      : mountLightShowGenerator(root, analyze)
    : mountLightShowGenerator(root, analyze ?? (async () => readyPreview()), saveZip);
  const generate = buttonNamed(root, GENERATE_LABEL);
  const syncLights = syncBox(root);
  const length = lengthBox(root);
  const start = startBox(root);
  const download = downloadButton(root);
  return {
    generator: generator,
    root: root,
    generate: generate,
    syncLights: syncLights,
    length: length,
    start: start,
    download: download,
  };
}

function buttonHidden(root: ParentNode, selector: string): boolean {
  return showButton(root, selector).hidden !== false;
}

function buttonDisabled(root: ParentNode, selector: string): boolean {
  return showButton(root, selector).disabled;
}

function showButton(root: ParentNode, selector: string): HTMLButtonElement {
  const button = root.querySelector(selector);
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`missing ${selector}`);
  }
  return button;
}

function downloadButton(root: ParentNode): HTMLButtonElement {
  const button = root.querySelector(".download-button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("missing download button");
  }
  return button;
}

function startBox(root: ParentNode): HTMLInputElement {
  const input = root.querySelector(".start-point input");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("missing start point");
  }
  return input;
}

function lengthBox(root: ParentNode): HTMLSelectElement {
  const select = root.querySelector(".show-length select");
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error("missing show length choice");
  }
  return select;
}

function choiceLabels(select: HTMLSelectElement): string[] {
  const labels: string[] = [];
  for (const option of select.options) {
    labels.push(option.textContent ?? "");
  }
  return labels;
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

function readyPreview(): AnalyzedPreview {
  return {
    analysis: oneBeat(),
    samples: PREVIEW_SAMPLES,
    sampleRate: SAMPLE_RATE,
  };
}

function sortedNames(files: Record<string, Uint8Array>): string[] {
  const names: string[] = [];
  for (const name of Object.keys(files)) {
    names.push(name);
  }
  names.sort();
  return names;
}

function text(bytes: Uint8Array | undefined, start: number, length: number): string {
  let result = "";
  if (bytes === undefined) {
    return result;
  }
  for (let index = 0; index < length; index += 1) {
    result += String.fromCharCode(bytes[start + index] ?? 0);
  }
  return result;
}

function song(title: string): Song {
  return {
    trackId: title.length,
    trackName: title,
    artistName: ARTIST,
    artworkUrl: "https://example.com/art.jpg",
    previewUrl: SAMPLE_URL,
  };
}

function uploadedSong(): Song {
  return {
    trackId: UPLOAD_ID,
    trackName: "My Song",
    artistName: "",
    artworkUrl: "",
    previewUrl: SAMPLE_URL,
  };
}
