import { HEADLIGHTS, TURN_SIGNALS } from "./channels";

const SVG_NS = "http://www.w3.org/2000/svg";
const FULL = 255;
const PHOTO_FILE = "tesla-model-3.jpg";
const PHOTO_WIDTH = 800;
const PHOTO_HEIGHT = 373;
const RADIUS = 14;
type Spot = {
  x: number;
  y: number;
};

// Front-left photo. Left lamps are the far housing; right lamps are the near one.
const HEADLIGHT_SPOTS: Spot[] = [
  { x: 400, y: 172 },
  { x: 56, y: 166 },
  { x: 280, y: 170 },
  { x: 74, y: 158 },
];

const TURN_SPOTS: Spot[] = [
  { x: 415, y: 188 },
  { x: 54, y: 184 },
  { x: 640, y: 155 },
  { x: 670, y: 175 },
];

type PlacedLight = {
  channel: number;
  shape: SVGElement;
};

export type LightPreview = {
  show(frame: Uint8Array): void;
};

export function mountPreviewRenderer(root: HTMLElement): LightPreview {
  root.classList.add("light-preview");
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${PHOTO_WIDTH} ${PHOTO_HEIGHT}`);
  addCarPhoto(svg);
  const lights: PlacedLight[] = [];
  addLights(lights, svg, HEADLIGHTS, "headlight", HEADLIGHT_SPOTS);
  addLights(lights, svg, TURN_SIGNALS, "turn-signal", TURN_SPOTS);
  root.replaceChildren(svg);

  return {
    show(frame: Uint8Array): void {
      for (const light of lights) {
        const level = frame[light.channel] ?? 0;
        light.shape.setAttribute("opacity", String(level / FULL));
      }
    },
  };
}

function addCarPhoto(svg: SVGSVGElement): void {
  const photo = document.createElementNS(SVG_NS, "image");
  photo.setAttribute("class", "car-photo");
  photo.setAttribute("href", carPhotoUrl());
  photo.setAttribute("x", "0");
  photo.setAttribute("y", "0");
  photo.setAttribute("width", String(PHOTO_WIDTH));
  photo.setAttribute("height", String(PHOTO_HEIGHT));
  svg.append(photo);
}

function carPhotoUrl(): string {
  const base = import.meta.env.BASE_URL;
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}${PHOTO_FILE}`;
}

function addLights(
  lights: PlacedLight[],
  svg: SVGSVGElement,
  channels: readonly number[],
  kind: string,
  spots: readonly Spot[],
): void {
  for (let index = 0; index < channels.length; index += 1) {
    const channel = channels[index];
    const spot = spots[index];
    if (channel === undefined || spot === undefined) {
      continue;
    }
    const shape = document.createElementNS(SVG_NS, "circle");
    shape.setAttribute("class", kind);
    shape.setAttribute("cx", String(spot.x));
    shape.setAttribute("cy", String(spot.y));
    shape.setAttribute("r", String(RADIUS));
    shape.setAttribute("opacity", "0");
    svg.append(shape);
    lights.push({
      channel: channel,
      shape: shape,
    });
  }
}
