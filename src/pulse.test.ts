import { describe, expect, it } from "vitest";
import { SAMPLE_RATE, type AudioAnalysis, type AudioFrame } from "./analyzeAudio";
import { CHANNEL_COUNT, HEADLIGHTS, LIGHTS, TURN_SIGNALS } from "./channels";
import { choreographPulse, PULSE_DECAY, PULSE_ON } from "./pulse";

const FRAME_RATE = 50;
const BEAT_FRAME = 10;
const BEAT_TIME = BEAT_FRAME / FRAME_RATE;
const OFF = 0;
const UNUSED_CHANNEL = CHANNEL_COUNT - 1;

describe("choreographPulse", () => {
  it("flashes the headlights on a bass beat and leaves the other channels off", () => {
    const grid = choreographPulse(show({ bass: 1, mids: 0, treble: 0 }));

    expect(levels(grid, BEAT_FRAME, HEADLIGHTS)).toEqual(filled(HEADLIGHTS, PULSE_ON));
    expect(levels(grid, BEAT_FRAME, TURN_SIGNALS)).toEqual(filled(TURN_SIGNALS, OFF));
    expect(levels(grid, BEAT_FRAME - 1, LIGHTS)).toEqual(filled(LIGHTS, OFF));
    expect(grid[BEAT_FRAME]?.[UNUSED_CHANNEL]).toBe(OFF);
  });

  it("flashes the turn signals on a treble beat and leaves the headlights off", () => {
    const grid = choreographPulse(show({ bass: 0, mids: 0, treble: 1 }));

    expect(levels(grid, BEAT_FRAME, TURN_SIGNALS)).toEqual(filled(TURN_SIGNALS, PULSE_ON));
    expect(levels(grid, BEAT_FRAME, HEADLIGHTS)).toEqual(filled(HEADLIGHTS, OFF));
  });

  it("defaults to split, so a bass beat does not light the turn signals", () => {
    const grid = choreographPulse(show({ bass: 1, mids: 0, treble: 0 }));

    expect(levels(grid, BEAT_FRAME, TURN_SIGNALS)).toEqual(filled(TURN_SIGNALS, OFF));
  });

  it("flashes every mapped light on a beat in together mode", () => {
    const grid = choreographPulse(show({ bass: 1, mids: 0, treble: 0 }), { mode: "together" });

    expect(levels(grid, BEAT_FRAME, LIGHTS)).toEqual(filled(LIGHTS, PULSE_ON));
    expect(grid[BEAT_FRAME]?.[UNUSED_CHANNEL]).toBe(OFF);
    expect(grid[BEAT_FRAME]?.length).toBe(CHANNEL_COUNT);
  });

  it("decays the flash on the following frame", () => {
    const grid = choreographPulse(show({ bass: 1, mids: 0, treble: 0 }));
    const faded = Math.round(PULSE_ON * PULSE_DECAY);

    expect(levels(grid, BEAT_FRAME + 1, HEADLIGHTS)).toEqual(filled(HEADLIGHTS, faded));
    expect(levels(grid, BEAT_FRAME + 1, TURN_SIGNALS)).toEqual(filled(TURN_SIGNALS, OFF));
  });
});

function show(beat: Pick<AudioFrame, "bass" | "mids" | "treble">): AudioAnalysis {
  const frameCount = BEAT_FRAME + 3;
  const frames: AudioFrame[] = [];
  for (let index = 0; index < frameCount; index += 1) {
    const atBeat = index === BEAT_FRAME;
    frames.push({
      time: index / FRAME_RATE,
      bass: atBeat ? beat.bass : OFF,
      mids: atBeat ? beat.mids : OFF,
      treble: atBeat ? beat.treble : OFF,
    });
  }

  return {
    sampleRate: SAMPLE_RATE,
    frameRate: FRAME_RATE,
    frames,
    onsetTimes: [BEAT_TIME],
  };
}

function levels(grid: Uint8Array[], frame: number, channels: readonly number[]): number[] {
  const row = grid[frame];
  if (row === undefined) {
    throw new Error(`missing frame ${frame}`);
  }
  return channels.map((channel) => row[channel] ?? OFF);
}

function filled(channels: readonly number[], value: number): number[] {
  return channels.map(() => value);
}
