import { describe, expect, it } from "vitest";
import { frameAt } from "./frameAt";

const FRAME_MS = 20;
const FRAME_COUNT = 50;
const SHOW_START = 10;
const FIRST = 0;
const NEXT = 1;
const LAST = FRAME_COUNT - 1;
const STEP_SECONDS = FRAME_MS / 1000;

describe("frameAt", () => {
  it("maps playback time onto the show, using the clip start as frame zero", () => {
    expect(frameAt(SHOW_START, SHOW_START, FRAME_MS, FRAME_COUNT)).toBe(FIRST);
    expect(frameAt(SHOW_START + STEP_SECONDS, SHOW_START, FRAME_MS, FRAME_COUNT)).toBe(NEXT);
  });

  it("clamps times before the clip and after the last frame", () => {
    expect(frameAt(0, SHOW_START, FRAME_MS, FRAME_COUNT)).toBe(FIRST);
    expect(frameAt(SHOW_START + 100, SHOW_START, FRAME_MS, FRAME_COUNT)).toBe(LAST);
    expect(frameAt(Number.NaN, SHOW_START, FRAME_MS, FRAME_COUNT)).toBe(FIRST);
  });
});
