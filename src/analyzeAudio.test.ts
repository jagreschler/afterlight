import { describe, expect, it } from "vitest";
import { analyzeAudio, type AudioFrame } from "./analyzeAudio";

describe("analyzeAudio", () => {
  it("puts a low sine in the bass, a middle sine in the mids, and a high sine in the treble", () => {
    expectBand(analyzeAudio(sine(100, 44100, 1), 44100).frames, "bass");
    expectBand(analyzeAudio(sine(1000, 44100, 1), 44100).frames, "mids");
    expectBand(analyzeAudio(sine(5000, 44100, 1), 44100).frames, "treble");
  });

  it("keeps every band between 0 and 1", () => {
    const { frames } = analyzeAudio(sine(1000, 44100, 1), 44100);

    for (const frame of frames) {
      expect(frame.bass).toBeGreaterThanOrEqual(0);
      expect(frame.bass).toBeLessThanOrEqual(1);
      expect(frame.mids).toBeGreaterThanOrEqual(0);
      expect(frame.mids).toBeLessThanOrEqual(1);
      expect(frame.treble).toBeGreaterThanOrEqual(0);
      expect(frame.treble).toBeLessThanOrEqual(1);
    }
  });

  it("measures one frame every 20 ms", () => {
    const { frameRate, frames } = analyzeAudio(sine(100, 44100, 1), 44100);

    expect(frameRate).toBe(50);
    expect(frames).toHaveLength(50);
    expect(frames[0]?.time).toBe(0);
    expect(frames[1]?.time).toBeCloseTo(0.02);
  });

  it("still hears the bass after a 48 kHz clip is resampled", () => {
    expectBand(analyzeAudio(sine(100, 48000, 1), 48000).frames, "bass");
  });

  it("finds clicks at the times they happen", () => {
    const clicksAt = [0.4, 0.9, 1.4];
    const { onsetTimes } = analyzeAudio(clicks(clicksAt, 44100, 2), 44100);

    expect(onsetTimes).toHaveLength(clicksAt.length);
    for (const time of clicksAt) {
      expect(onsetTimes.some((onset) => Math.abs(onset - time) <= 0.05)).toBe(true);
    }
  });

  it("reports no energy and no beats for silence", () => {
    const { frames, onsetTimes } = analyzeAudio(new Float32Array(44100), 44100);

    expect(onsetTimes).toEqual([]);
    expect(frames.every((frame) => frame.bass === 0 && frame.mids === 0 && frame.treble === 0)).toBe(
      true,
    );
  });
});

function expectBand(frames: AudioFrame[], band: "bass" | "mids" | "treble"): void {
  const scores = {
    bass: mean(frames.map((frame) => frame.bass)),
    mids: mean(frames.map((frame) => frame.mids)),
    treble: mean(frames.map((frame) => frame.treble)),
  };

  expect(scores[band]).toBeGreaterThan(0.5);
  for (const name of ["bass", "mids", "treble"] as const) {
    if (name === band) {
      continue;
    }
    expect(scores[band]).toBeGreaterThan(scores[name] * 3);
  }
}

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function sine(frequency: number, sampleRate: number, seconds: number): Float32Array {
  const length = Math.floor(sampleRate * seconds);
  const samples = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    samples[index] = Math.sin((2 * Math.PI * frequency * index) / sampleRate);
  }
  return samples;
}

function clicks(times: number[], sampleRate: number, seconds: number): Float32Array {
  const samples = new Float32Array(Math.floor(sampleRate * seconds));
  for (const time of times) {
    const index = Math.round(time * sampleRate);
    if (index >= 0 && index < samples.length) {
      samples[index] = 1;
    }
  }
  return samples;
}
