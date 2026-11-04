import type { Spot } from "./previewLayout";

const SVG_NS = "http://www.w3.org/2000/svg";

export type PlacedLight = {
  channel: number;
  shape: SVGElement;
};

export function makeView(className: string, width: number, height: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  return svg;
}

export function addPhoto(svg: SVGSVGElement, href: string, width: number, height: number): void {
  const photo = document.createElementNS(SVG_NS, "image");
  photo.setAttribute("class", "car-photo");
  photo.setAttribute("href", href);
  photo.setAttribute("x", "0");
  photo.setAttribute("y", "0");
  photo.setAttribute("width", String(width));
  photo.setAttribute("height", String(height));
  svg.append(photo);
}

export function bundled(file: string): string {
  const base = import.meta.env.BASE_URL;
  const prefix = base.endsWith("/") ? base : `${base}/`;
  return `${prefix}${file}`;
}

export function addLights(
  lights: PlacedLight[],
  svg: SVGSVGElement,
  channels: readonly number[],
  kind: string,
  spots: readonly Spot[],
  radius: number,
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
    shape.setAttribute("r", String(radius));
    shape.setAttribute("opacity", "0");
    svg.append(shape);
    lights.push({
      channel: channel,
      shape: shape,
    });
  }
}
