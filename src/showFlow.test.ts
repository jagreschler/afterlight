import { afterEach, describe, expect, it } from "vitest";
import { mountPulseModePicker } from "./pulseModePicker";
import { mountShowFlow, ShowFlow } from "./showFlow";

const GENERATE_LABEL = "Generate Light Show";
const HIDDEN = true;
const SHOWN = false;
const SPLIT = "split";
const NOTIFIED = 1;

afterEach(() => {
  document.body.replaceChildren();
});

describe("show flow", () => {
  it("hides Generate until a song is selected", () => {
    const view = mount();

    expect(view.generate.hidden).toBe(HIDDEN);
    view.flow.songSelected();
    expect(view.generate.hidden).toBe(SHOWN);
  });

  it("keeps the pulse picker hidden until Generate is clicked", () => {
    const view = mount();
    const seen: number[] = [];
    view.flow.onGenerate(() => {
      seen.push(NOTIFIED);
    });
    view.flow.onGenerate(() => {
      seen.push(NOTIFIED);
    });

    expect(view.pickerRoot.hidden).toBe(HIDDEN);
    view.flow.songSelected();
    expect(view.pickerRoot.hidden).toBe(HIDDEN);

    view.generate.click();

    expect(view.pickerRoot.hidden).toBe(SHOWN);
    expect(view.picker.mode).toBe(SPLIT);
    expect(seen).toEqual([NOTIFIED, NOTIFIED]);
  });

  it("hides the picker again when a new song is chosen", () => {
    const view = mount();

    view.flow.songSelected();
    view.generate.click();
    view.flow.songSelected();

    expect(view.pickerRoot.hidden).toBe(HIDDEN);
    expect(view.generate.hidden).toBe(SHOWN);
    expect(view.picker.mode).toBe(SPLIT);
  });
});

function mount(): {
  flow: ShowFlow;
  generate: HTMLButtonElement;
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
