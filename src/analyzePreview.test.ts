import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeAudio } from "./analyzeAudio";
import { analyzePreview } from "./analyzePreview";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("analyzePreview", () => {
  it("downloads the preview and analyzes the decoded samples", async () => {
    const samples = sine(100, 44100, 1);
    const decode = vi.fn(async () => ({ samples, sampleRate: 44100 }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 })),
    );

    const analysis = await analyzePreview("https://example.com/preview.m4a", decode);

    expect(fetch).toHaveBeenCalledWith("https://example.com/preview.m4a");
    expect(decode).toHaveBeenCalledOnce();
    expect(analysis.frames.map((frame) => frame.bass)).toEqual(
      analyzeAudio(samples, 44100).frames.map((frame) => frame.bass),
    );
    expect(mean(analysis.frames.map((frame) => frame.bass))).toBeGreaterThan(
      mean(analysis.frames.map((frame) => frame.mids)) * 3,
    );
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
