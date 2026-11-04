export type Spot = {
  x: number;
  y: number;
};

export const FRONT_PHOTO = "tesla-model-3-front.jpg";
export const FRONT_WIDTH = 800;
export const FRONT_HEIGHT = 373;

export const TOP_WIDTH = 160;
export const TOP_HEIGHT = 360;
export const TOP_OUTLINE =
  "M48 36C48 14 112 14 112 36L128 78L128 268C128 324 114 346 80 346C46 346 32 324 32 268L32 78Z";

// Looking at the front of the car, image-left is the car's right.
export const FRONT_HEADLIGHTS: Spot[] = [
  { x: 410, y: 155 },
  { x: 70, y: 162 },
  { x: 330, y: 165 },
  { x: 100, y: 155 },
];

export const FRONT_TURNS: Spot[] = [
  { x: 425, y: 172 },
  { x: 68, y: 180 },
];

export const TOP_HEADLIGHTS: Spot[] = [
  { x: 48, y: 46 },
  { x: 112, y: 46 },
  { x: 62, y: 50 },
  { x: 98, y: 50 },
];

export const TOP_TURNS: Spot[] = [
  { x: 36, y: 68 },
  { x: 124, y: 68 },
  { x: 40, y: 328 },
  { x: 120, y: 328 },
];
