import { afterEach, describe, expect, it } from "vitest";
import { mountPulseModePicker, PulseModePicker } from "./pulseModePicker";

const SPLIT = "split";
const TOGETHER = "together";
const PRESSED = "true";
const RELEASED = "false";
const SPLIT_LABEL = "Split";
const TOGETHER_LABEL = "Together";

afterEach(() => {
  document.body.replaceChildren();
});

describe("pulse mode picker", () => {
  it("starts on Split", () => {
    const view = mount();

    expect(view.picker.mode).toBe(SPLIT);
    expect(view.split.getAttribute("aria-pressed")).toBe(PRESSED);
    expect(view.together.getAttribute("aria-pressed")).toBe(RELEASED);
  });

  it("switches the selection and tells every listener", () => {
    const view = mount();
    const seen: string[] = [];
    view.picker.onChange((mode) => {
      seen.push(mode);
    });
    view.picker.onChange((mode) => {
      seen.push(mode);
    });

    view.together.click();

    expect(view.picker.mode).toBe(TOGETHER);
    expect(view.split.getAttribute("aria-pressed")).toBe(RELEASED);
    expect(view.together.getAttribute("aria-pressed")).toBe(PRESSED);
    expect(seen).toEqual([TOGETHER, TOGETHER]);

    view.split.click();

    expect(view.picker.mode).toBe(SPLIT);
    expect(view.split.getAttribute("aria-pressed")).toBe(PRESSED);
    expect(view.together.getAttribute("aria-pressed")).toBe(RELEASED);
    expect(seen).toEqual([TOGETHER, TOGETHER, SPLIT, SPLIT]);
  });
});

function mount(): {
  picker: PulseModePicker;
  split: HTMLButtonElement;
  together: HTMLButtonElement;
} {
  const root = document.createElement("div");
  document.body.append(root);
  const picker = mountPulseModePicker(root);
  const split = buttonNamed(root, SPLIT_LABEL);
  const together = buttonNamed(root, TOGETHER_LABEL);
  return { picker, split, together };
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
