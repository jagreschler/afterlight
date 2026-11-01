import type { AudioAnalysis, AudioFrame } from "./analyzeAudio";
import { CHANNEL_COUNT, HEADLIGHTS, LIGHTS, TURN_SIGNALS } from "./channels";

export const PULSE_ON = 255;
export const PULSE_DECAY = 0.5;

export type PulseMode = "together" | "split";

export type PulseOptions = {
  mode?: PulseMode;
};

export function choreographPulse(
  analysis: AudioAnalysis,
  options: PulseOptions = {},
): Uint8Array[] {
  const mode = options.mode ?? "split";
  const beats = beatFrames(analysis);
  const grid: Uint8Array[] = [];

  for (let index = 0; index < analysis.frames.length; index += 1) {
    const frame = decay(grid[index - 1]);
    if (beats.has(index)) {
      const features = analysis.frames[index];
      if (features !== undefined) {
        flash(frame, channelsFor(features, mode));
      }
    }
    grid.push(frame);
  }

  return grid;
}

function beatFrames(analysis: AudioAnalysis): Set<number> {
  const frames = new Set<number>();
  for (const time of analysis.onsetTimes) {
    const index = Math.round(time * analysis.frameRate);
    if (index >= 0 && index < analysis.frames.length) {
      frames.add(index);
    }
  }
  return frames;
}

function channelsFor(frame: AudioFrame, mode: PulseMode): readonly number[] {
  if (mode === "together") {
    return LIGHTS;
  }

  const channels: number[] = [];
  if (frame.bass > 0 && frame.bass >= frame.treble) {
    channels.push(...HEADLIGHTS);
  }
  if (frame.treble > 0 && frame.treble >= frame.bass) {
    channels.push(...TURN_SIGNALS);
  }
  return channels;
}

function flash(frame: Uint8Array, channels: readonly number[]): void {
  for (const channel of channels) {
    frame[channel] = PULSE_ON;
  }
}

function decay(previous: Uint8Array | undefined): Uint8Array {
  const frame = new Uint8Array(CHANNEL_COUNT);
  if (previous === undefined) {
    return frame;
  }

  for (let channel = 0; channel < CHANNEL_COUNT; channel += 1) {
    frame[channel] = Math.round((previous[channel] ?? 0) * PULSE_DECAY);
  }
  return frame;
}
