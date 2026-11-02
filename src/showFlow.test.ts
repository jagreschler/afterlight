import { afterEach, describe, expect, it } from "vitest";
import type { Song } from "./itunes";
import { mountPulseModePicker } from "./pulseModePicker";
import { mountShowFlow, ShowFlow } from "./showFlow";

const GENERATE_LABEL = "Generate Light Show";
const HIDDEN = true;
const SHOWN = false;
const SPLIT = "split";
const TOGETHER = "together";
const TOGETHER_LABEL = "Together";
const FIRST_TITLE = "Get Lucky";
const SECOND_TITLE = "One More Time";

afterEach(() => {
  document.body.replaceChildren();
});

describe("show flow", () => {
  it("hides the style and Generate until a song is selected", () => {
    const view = mount();

    expect(view.generateRoot.hidden).toBe(HIDDEN);
    expect(view.pickerRoot.hidden).toBe(HIDDEN);

    view.flow.songSelected(song(FIRST_TITLE));

    expect(view.generateRoot.hidden).toBe(SHOWN);
    expect(view.pickerRoot.hidden).toBe(SHOWN);
    expect(view.picker.mode).toBe(SPLIT);
  });

  it("tells every listener the selected mode and the song", () => {
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
    buttonNamed(view.pickerRoot, TOGETHER_LABEL).click();
    view.generate.click();

    const notice = { mode: TOGETHER, title: FIRST_TITLE };
    expect(seen).toEqual([notice, notice]);
    expect(view.picker.mode).toBe(TOGETHER);
  });

  it("keeps the style visible and the chosen mode when the song changes", () => {
    const view = mount();

    view.flow.songSelected(song(FIRST_TITLE));
    buttonNamed(view.pickerRoot, TOGETHER_LABEL).click();
    view.flow.songSelected(song(SECOND_TITLE));

    expect(view.pickerRoot.hidden).toBe(SHOWN);
    expect(view.generateRoot.hidden).toBe(SHOWN);
    expect(view.picker.mode).toBe(TOGETHER);
  });
});

function mount(): {
  flow: ShowFlow;
  generate: HTMLButtonElement;
  generateRoot: HTMLElement;
  pickerRoot: HTMLElement;
  picker: ReturnType<typeof mountPulseModePicker>;
} {
  const generateRoot = document.createElement("div");
  const pickerRoot = document.createElement("div");
  document.body.append(generateRoot, pickerRoot);
  const picker = mountPulseModePicker(pickerRoot);
  const flow = mountShowFlow(generateRoot, picker);
  const generate = buttonNamed(generateRoot, GENERATE_LABEL);
  return {
    flow: flow,
    generate: generate,
    generateRoot: generateRoot,
    pickerRoot: pickerRoot,
    picker: picker,
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

function song(title: string): Song {
  return {
    trackId: title.length,
    trackName: title,
    artistName: "Daft Punk",
    artworkUrl: "https://example.com/art.jpg",
    previewUrl: "https://example.com/preview.m4a",
  };
}
