import { HEADLIGHTS, TURN_SIGNALS } from "./channels";

const SVG_NS = "http://www.w3.org/2000/svg";
const FULL = 255;
const VIEW_WIDTH = 120;
const VIEW_HEIGHT = 48;
const RADIUS = 6;
const LEFT = 16;
const COLUMN = 28;

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
  const lights: PlacedLight[] = [];
  addLights(lights, svg, HEADLIGHTS, "headlight", 14);
  addLights(lights, svg, TURN_SIGNALS, "turn-signal", 34);
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

function addLights(
  lights: PlacedLight[],
  svg: SVGSVGElement,
  channels: readonly number[],
  kind: string,
  y: number,
): void {
  for (let index = 0; index < channels.length; index += 1) {
    const channel = channels[index];
    if (channel === undefined) {
      continue;
    }
    const shape = document.createElementNS(SVG_NS, "circle");
    shape.setAttribute("class", kind);
    shape.setAttribute("cx", String(LEFT + index * COLUMN));
    shape.setAttribute("cy", String(y));
    shape.setAttribute("r", String(RADIUS));
    shape.setAttribute("opacity", "0");
    svg.append(shape);
    lights.push({
      channel: channel,
      shape: shape,
    });
  }
}
