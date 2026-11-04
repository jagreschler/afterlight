import { HEADLIGHTS, TURN_SIGNALS } from "./channels";
import { addBody, addLights, addPhoto, bundled, makeView, type PlacedLight } from "./previewDraw";
import {
  FRONT_HEADLIGHTS,
  FRONT_HEIGHT,
  FRONT_PHOTO,
  FRONT_TURNS,
  FRONT_WIDTH,
  TOP_HEADLIGHTS,
  TOP_HEIGHT,
  TOP_OUTLINE,
  TOP_TURNS,
  TOP_WIDTH,
} from "./previewLayout";

const FULL = 255;
const FRONT_RADIUS = 16;
const TOP_RADIUS = 8;
const CREDIT = "Front photo: iMoD Official, CC BY 3.0";

export type LightPreview = {
  show(frame: Uint8Array): void;
};

export function mountPreviewRenderer(root: HTMLElement): LightPreview {
  root.classList.add("light-preview");
  const lights: PlacedLight[] = [];
  const front = makeView("view-front", FRONT_WIDTH, FRONT_HEIGHT);
  addPhoto(front, bundled(FRONT_PHOTO), FRONT_WIDTH, FRONT_HEIGHT);
  addLights(lights, front, HEADLIGHTS, "headlight", FRONT_HEADLIGHTS, FRONT_RADIUS);
  addLights(lights, front, TURN_SIGNALS, "turn-signal", FRONT_TURNS, FRONT_RADIUS);
  const top = makeView("view-top", TOP_WIDTH, TOP_HEIGHT);
  addBody(top, TOP_OUTLINE);
  addLights(lights, top, HEADLIGHTS, "headlight", TOP_HEADLIGHTS, TOP_RADIUS);
  addLights(lights, top, TURN_SIGNALS, "turn-signal", TOP_TURNS, TOP_RADIUS);
  const credit = document.createElement("p");
  credit.className = "photo-credit";
  credit.textContent = CREDIT;
  root.replaceChildren(front, top, credit);

  return {
    show(frame: Uint8Array): void {
      for (const light of lights) {
        const level = frame[light.channel] ?? 0;
        light.shape.setAttribute("opacity", String(level / FULL));
      }
    },
  };
}
