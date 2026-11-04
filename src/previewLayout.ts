export type Spot = {
  x: number;
  y: number;
};

export const FRONT_PHOTO = "tesla-model-3-front.jpg";
export const FRONT_WIDTH = 800;
export const FRONT_HEIGHT = 599;

export const TOP_PHOTO = "tesla-top.jpg";
export const TOP_WIDTH = 640;
export const TOP_HEIGHT = 582;

// Front photo faces the camera. Image-left is the car's right.
export const FRONT_HEADLIGHTS: Spot[] = [
  { x: 690, y: 270 },
  { x: 115, y: 270 },
  { x: 635, y: 278 },
  { x: 165, y: 278 },
];

export const FRONT_TURNS: Spot[] = [
  { x: 685, y: 295 },
  { x: 120, y: 295 },
];

// Overhead Roadster. The nose, with the grille, is at the bottom.
export const TOP_HEADLIGHTS: Spot[] = [
  { x: 310, y: 470 },
  { x: 430, y: 500 },
  { x: 340, y: 490 },
  { x: 400, y: 510 },
];

export const TOP_TURNS: Spot[] = [
  { x: 290, y: 450 },
  { x: 450, y: 480 },
  { x: 440, y: 60 },
  { x: 540, y: 85 },
];
