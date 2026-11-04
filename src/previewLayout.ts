export type Spot = {
  x: number;
  y: number;
};

export const FRONT_WIDTH = 800;
export const FRONT_HEIGHT = 599;

export const TOP_WIDTH = 480;
export const TOP_HEIGHT = 640;

// Front photo faces the camera. Image-left is the car's right.
export const FRONT_HEADLIGHTS: Spot[] = [
  { x: 655, y: 262 },
  { x: 145, y: 262 },
  { x: 632, y: 290 },
  { x: 168, y: 290 },
];

export const FRONT_TURNS: Spot[] = [
  { x: 648, y: 308 },
  { x: 152, y: 310 },
];

// Overhead Model 3 render. The nose points up.
export const TOP_HEADLIGHTS: Spot[] = [
  { x: 149, y: 87 },
  { x: 330, y: 86 },
  { x: 155, y: 75 },
  { x: 323, y: 75 },
];

export const TOP_TURNS: Spot[] = [
  { x: 142, y: 115 },
  { x: 336, y: 115 },
  { x: 144, y: 534 },
  { x: 335, y: 533 },
];
