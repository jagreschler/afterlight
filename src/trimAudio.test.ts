import { describe, expect, it } from "vitest";
import { trimToSeconds } from "./trimAudio";

const SAMPLE_RATE = 8;
const PREVIEW_SECONDS = 30;
const LONG_SECONDS = 45;
const SHORT_SECONDS = 10;
const START_SECONDS = 10;
const LATE_START = 20;

describe("trimToSeconds", () => {
  it("keeps only the first 30 seconds", () => {
    const samples = new Float32Array(SAMPLE_RATE * LONG_SECONDS);
    samples[0] = 1;
    const kept = trimToSeconds(samples, SAMPLE_RATE, PREVIEW_SECONDS);

    expect(kept.length).toBe(SAMPLE_RATE * PREVIEW_SECONDS);
    expect(kept[0]).toBe(1);
  });

  it("leaves a shorter clip unchanged", () => {
    const samples = new Float32Array(SAMPLE_RATE * SHORT_SECONDS);
    const kept = trimToSeconds(samples, SAMPLE_RATE, PREVIEW_SECONDS);

    expect(kept).toBe(samples);
  });

  it("starts later in the song and keeps the requested length", () => {
    const samples = new Float32Array(SAMPLE_RATE * LONG_SECONDS);
    const mark = SAMPLE_RATE * START_SECONDS;
    samples[mark] = 1;
    const kept = trimToSeconds(samples, SAMPLE_RATE, PREVIEW_SECONDS, START_SECONDS);

    expect(kept.length).toBe(SAMPLE_RATE * PREVIEW_SECONDS);
    expect(kept[0]).toBe(1);
  });

  it("uses whatever is left when the window runs past the end", () => {
    const samples = new Float32Array(SAMPLE_RATE * LONG_SECONDS);
    const mark = SAMPLE_RATE * LATE_START;
    samples[mark] = 1;
    const kept = trimToSeconds(samples, SAMPLE_RATE, PREVIEW_SECONDS, LATE_START);
    const leftover = LONG_SECONDS - LATE_START;

    expect(kept.length).toBe(SAMPLE_RATE * leftover);
    expect(kept[0]).toBe(1);
  });
});
