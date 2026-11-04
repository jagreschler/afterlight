import { describe, expect, it } from "vitest";
import { FRONT_HEADLIGHTS, FRONT_TURNS, type Spot } from "./previewLayout";

const LEFT = 0;
const RIGHT = 1;
const LEFT_INNER = 2;
const RIGHT_INNER = 3;

type Lamp = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

// Image-left is the car's right. These boxes are the rendered headlight housings.
const CAR_LEFT_LAMP: Lamp = { minX: 610, maxX: 670, minY: 250, maxY: 325 };
const CAR_RIGHT_LAMP: Lamp = { minX: 130, maxX: 190, minY: 250, maxY: 325 };

describe("front light positions", () => {
  it("keeps the front overlay on the rendered lamps", () => {
    expectOnLamp(FRONT_HEADLIGHTS[LEFT], CAR_LEFT_LAMP);
    expectOnLamp(FRONT_HEADLIGHTS[LEFT_INNER], CAR_LEFT_LAMP);
    expectOnLamp(FRONT_TURNS[LEFT], CAR_LEFT_LAMP);
    expectOnLamp(FRONT_HEADLIGHTS[RIGHT], CAR_RIGHT_LAMP);
    expectOnLamp(FRONT_HEADLIGHTS[RIGHT_INNER], CAR_RIGHT_LAMP);
    expectOnLamp(FRONT_TURNS[RIGHT], CAR_RIGHT_LAMP);
  });
});

function expectOnLamp(spot: Spot | undefined, lamp: Lamp): void {
  if (spot === undefined) {
    throw new Error("missing light spot");
  }
  expect(spot.x).toBeGreaterThanOrEqual(lamp.minX);
  expect(spot.x).toBeLessThanOrEqual(lamp.maxX);
  expect(spot.y).toBeGreaterThanOrEqual(lamp.minY);
  expect(spot.y).toBeLessThanOrEqual(lamp.maxY);
}
