import { afterEach, describe, expect, it } from "vitest";
import { CHANNEL_COUNT, HEADLIGHTS, TURN_SIGNALS } from "./channels";
import { mountPreviewRenderer, type LightPreview } from "./previewRenderer";

const ON = 255;
const LIT = "1";
const DARK = "0";
const FIRST = 0;
const HEADLIGHT = ".light-preview .headlight";
const TURN = ".light-preview .turn-signal";
const FRONT = ".light-preview .view-front";
const TOP = ".light-preview .view-top";
const FRONT_PHOTO = "tesla-model-3-front.jpg";
const TOP_PHOTO = "tesla-top.jpg";
const HEADLIGHT_COUNT = 4;
const FRONT_TURNS = 2;
const ALL_TURNS = 4;

afterEach(() => {
  document.body.replaceChildren();
});

describe("light preview", () => {
  it("shows a front photo and a top view, and lights the same channel in both", () => {
    const view = mount();
    const front = view.root.querySelector(FRONT);
    const top = view.root.querySelector(TOP);

    expect(front).toBeInstanceOf(SVGElement);
    expect(top).toBeInstanceOf(SVGElement);
    if (!(front instanceof Element) || !(top instanceof Element)) {
      throw new Error("missing car views");
    }
    const photo = front.querySelector("image.car-photo");
    expect(photo).toBeInstanceOf(SVGElement);
    if (!(photo instanceof Element)) {
      throw new Error("missing front photo");
    }
    const href = photo.getAttribute("href") ?? "";
    expect(href).toContain(FRONT_PHOTO);
    const frontBox = front.getAttribute("viewBox") ?? "";
    const frontParts = frontBox.split(" ");
    const frontWidth = Number(frontParts[2]);
    const frontHeight = Number(frontParts[3]);
    const frontRatio = frontHeight / frontWidth;
    expect(frontRatio).toBeGreaterThan(0.5);
    expect(frontRatio).toBeLessThan(0.9);
    expect(front.querySelector(".car-body")).toBeNull();
    expect(front.querySelectorAll(".headlight")).toHaveLength(HEADLIGHT_COUNT);
    expect(front.querySelectorAll(".turn-signal")).toHaveLength(FRONT_TURNS);
    const topPhoto = top.querySelector("image.car-photo");
    expect(topPhoto).toBeInstanceOf(SVGElement);
    if (!(topPhoto instanceof Element)) {
      throw new Error("missing top photo");
    }
    const topHref = topPhoto.getAttribute("href") ?? "";
    expect(topHref).toContain(TOP_PHOTO);
    expect(top.querySelector(".car-body")).toBeNull();
    expect(top.querySelectorAll(".headlight")).toHaveLength(HEADLIGHT_COUNT);
    expect(top.querySelectorAll(".turn-signal")).toHaveLength(ALL_TURNS);

    const leftOuter = HEADLIGHTS[FIRST];
    if (leftOuter === undefined) {
      throw new Error("missing headlight");
    }
    view.preview.show(frame(leftOuter, ON));
    expect(opacity(front, ".headlight")).toBe(LIT);
    expect(opacity(top, ".headlight")).toBe(LIT);

    const credit = view.root.querySelector(".photo-credit");
    const creditText = credit?.textContent ?? "";
    expect(creditText).not.toContain("iMoD");
    expect(creditText).toContain("Norio Nakayama");
  });

  it("turns a headlight on for one frame and off for the next", () => {
    const view = mount();
    const leftOuter = HEADLIGHTS[FIRST];
    const leftTurn = TURN_SIGNALS[FIRST];
    if (leftOuter === undefined || leftTurn === undefined) {
      throw new Error("missing light channel");
    }

    view.preview.show(frame(leftOuter, ON));

    expect(opacity(view.root, HEADLIGHT)).toBe(LIT);
    expect(opacity(view.root, TURN)).toBe(DARK);

    view.preview.show(frame(leftTurn, ON));

    expect(opacity(view.root, HEADLIGHT)).toBe(DARK);
    expect(opacity(view.root, TURN)).toBe(LIT);
  });
});

function mount(): { root: HTMLElement; preview: LightPreview } {
  const root = document.createElement("div");
  document.body.append(root);
  const preview = mountPreviewRenderer(root);
  return {
    root: root,
    preview: preview,
  };
}

function frame(channel: number, level: number): Uint8Array {
  const samples = new Uint8Array(CHANNEL_COUNT);
  samples[channel] = level;
  return samples;
}

function opacity(root: ParentNode, selector: string): string {
  const light = root.querySelector(selector);
  if (!(light instanceof Element)) {
    throw new Error(`missing ${selector}`);
  }
  return light.getAttribute("opacity") ?? "";
}
