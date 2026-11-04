import { CAR_OUTLINE } from "./carOutline";
import { HEADLIGHTS, TURN_SIGNALS } from "./channels";

const SVG_NS = "http://www.w3.org/2000/svg";
const FULL = 255;
const VIEW_WIDTH = 120;
const VIEW_HEIGHT = 90;
const RADIUS = 4;

type Spot = {
  x: number;
  y: number;
};

const HEADLIGHT_SPOTS: Spot[] = [
  { x: 32, y: 44 },
  { x: 88, y: 44 },
  { x: 44, y: 46 },
  { x: 76, y: 46 },
];

const TURN_SPOTS: Spot[] = [
  { x: 22, y: 56 },
  { x: 98, y: 56 },
  { x: 28, y: 74 },
  { x: 92, y: 74 },
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
  svg.setAttribute("viewBox", `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`);
  addCarBody(svg);
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

function addCarBody(svg: SVGSVGElement): void {
  const body = document.createElementNS(SVG_NS, "path");
  body.setAttribute("class", "car-body");
  body.setAttribute("d", CAR_OUTLINE);
  svg.append(body);
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
