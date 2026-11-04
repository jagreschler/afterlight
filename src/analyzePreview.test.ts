import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeAudio } from "./analyzeAudio";
import { analyzePreview } from "./analyzePreview";

const SAMPLE_RATE = 44100;
const SAMPLE_URL = "https://example.com/preview.m4a";
const SHOW_SECONDS = 2;
const LONG_SECONDS = 5;
const SHORT_SECONDS = 1;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analyzePreview", () => {
  it("downloads the preview and analyzes the decoded samples", async () => {
    const samples = sine(100, SAMPLE_RATE, 1);
    const decode = vi.fn(async () => ({ samples, sampleRate: SAMPLE_RATE }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 })),
    );

    const prepared = await analyzePreview(SAMPLE_URL, SHORT_SECONDS, decode);
    const analysis = prepared.analysis;

    expect(fetch).toHaveBeenCalledWith(SAMPLE_URL);
    expect(decode).toHaveBeenCalledOnce();
    expect(prepared.samples).toBe(samples);
    expect(prepared.sampleRate).toBe(SAMPLE_RATE);
    expect(analysis.frames.map((frame) => frame.bass)).toEqual(
      analyzeAudio(samples, SAMPLE_RATE).frames.map((frame) => frame.bass),
    );
    expect(mean(analysis.frames.map((frame) => frame.bass))).toBeGreaterThan(
      mean(analysis.frames.map((frame) => frame.mids)) * 3,
    );
  });

  it("keeps the requested length from the start, or the whole clip when it is shorter", async () => {
    const longSamples = sine(100, SAMPLE_RATE, LONG_SECONDS);
    const decodeLong = vi.fn(async () => ({ samples: longSamples, sampleRate: SAMPLE_RATE }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 })),
    );

    const trimmed = await analyzePreview(SAMPLE_URL, SHOW_SECONDS, decodeLong);

    expect(trimmed.samples.length).toBe(SAMPLE_RATE * SHOW_SECONDS);
    expect(trimmed.samples[0]).toBe(longSamples[0]);

    const shortSamples = sine(100, SAMPLE_RATE, SHORT_SECONDS);
    const decodeShort = vi.fn(async () => ({ samples: shortSamples, sampleRate: SAMPLE_RATE }));
    const whole = await analyzePreview(SAMPLE_URL, SHOW_SECONDS, decodeShort);

    expect(whole.samples).toBe(shortSamples);
  });

  it("throws when the preview cannot be downloaded", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 404 })));

    await expect(analyzePreview("https://example.com/missing.m4a")).rejects.toThrow(
      "Could not download the preview (404).",
    );
  });
});

function sine(frequency: number, sampleRate: number, seconds: number): Float32Array {
  const length = Math.floor(sampleRate * seconds);
  const samples = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    samples[index] = Math.sin((2 * Math.PI * frequency * index) / sampleRate);
  }
  return samples;
}

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
