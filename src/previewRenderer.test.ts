import { afterEach, describe, expect, it } from "vitest";
import { CHANNEL_COUNT, HEADLIGHTS, TURN_SIGNALS } from "./channels";
import { mountPreviewRenderer, type LightPreview } from "./previewRenderer";

const ON = 255;
const LIT = "1";
const DARK = "0";
const FIRST = 0;
const HEADLIGHT = ".light-preview .headlight";
const TURN = ".light-preview .turn-signal";
const CAR_BODY = ".light-preview svg .car-body";
const CAR_PHOTO = ".light-preview svg image.car-photo";
const PHOTO_NAME = "tesla-model-3.jpg";

afterEach(() => {
  document.body.replaceChildren();
});

describe("light preview", () => {
  it("uses a photo of the car instead of a drawn outline", () => {
    const view = mount();
    const photo = view.root.querySelector(CAR_PHOTO);
    const headlight = view.root.querySelector(HEADLIGHT);

    expect(view.root.querySelector(CAR_BODY)).toBeNull();
    expect(photo).toBeInstanceOf(SVGElement);
    if (!(photo instanceof Element) || headlight === null) {
      throw new Error("missing car photo");
    }
    const href = photo.getAttribute("href") ?? "";
    expect(href).toContain(PHOTO_NAME);
    const order = photo.compareDocumentPosition(headlight);
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
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
