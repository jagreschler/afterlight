import { LEFT_TURN_SIGNALS, RIGHT_TURN_SIGNALS } from "./channels";

export const GAP_FRAMES = 50;
export const FILLER_SIDE_FRAMES = 25;

const LEFT_SIDE = 0;

export type GapSides = {
  on: readonly number[];
  off: readonly number[];
};

export function gapSides(index: number, lastBeat: number): GapSides | null {
  const sinceBeat = index - lastBeat;
  if (sinceBeat < GAP_FRAMES) {
    return null;
  }
  const intoGap = sinceBeat - GAP_FRAMES;
  const side = Math.floor(intoGap / FILLER_SIDE_FRAMES) % 2;
  const leftOn = side === LEFT_SIDE;
  if (leftOn) {
    return {
      on: LEFT_TURN_SIGNALS,
      off: RIGHT_TURN_SIGNALS,
    };
  }
  return {
    on: RIGHT_TURN_SIGNALS,
    off: LEFT_TURN_SIGNALS,
  };
}
