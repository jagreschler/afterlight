import { describe, expect, it } from "vitest";
import { writeWav } from "./wavWriter";

const SAMPLE_RATE = 44100;
const CHANNELS = 2;
const SAMPLE_COUNT = 3;
const BITS = 16;
const BYTES_PER_SAMPLE = 2;
const HEADER_SIZE = 44;
const PCM = 1;
const FMT_SIZE = 16;
const FULL_SCALE = 32767;
const HALF = 0.5;
const TOO_LOW = -1.5;
const TOO_HIGH = 2;
const SILENCE = 0;
const SIGN_BIT = 32768;
const UINT16_RANGE = 65536;

describe("writeWav", () => {
  it("writes a 16-bit PCM WAVE file with clamped, interleaved samples", () => {
    const left = new Float32Array([HALF, TOO_LOW, SILENCE]);
    const right = new Float32Array([1, -1, TOO_HIGH]);

    const bytes = writeWav([left, right], SAMPLE_RATE);

    expect(text(bytes, 0, 4)).toBe("RIFF");
    expect(uint32(bytes, 4)).toBe(bytes.length - 8);
    expect(text(bytes, 8, 4)).toBe("WAVE");
    expect(text(bytes, 12, 4)).toBe("fmt ");
    expect(uint32(bytes, 16)).toBe(FMT_SIZE);
    expect(uint16(bytes, 20)).toBe(PCM);
    expect(uint16(bytes, 22)).toBe(CHANNELS);
    expect(uint32(bytes, 24)).toBe(SAMPLE_RATE);
    const byteRate = SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE;
    expect(uint32(bytes, 28)).toBe(byteRate);
    const blockAlign = CHANNELS * BYTES_PER_SAMPLE;
    expect(uint16(bytes, 32)).toBe(blockAlign);
    expect(uint16(bytes, 34)).toBe(BITS);
    expect(text(bytes, 36, 4)).toBe("data");
    const dataSize = SAMPLE_COUNT * CHANNELS * BYTES_PER_SAMPLE;
    expect(uint32(bytes, 40)).toBe(dataSize);
    expect(bytes.length).toBe(HEADER_SIZE + dataSize);

    expect(int16(bytes, HEADER_SIZE)).toBe(Math.round(HALF * FULL_SCALE));
    expect(int16(bytes, HEADER_SIZE + BYTES_PER_SAMPLE)).toBe(FULL_SCALE);
    expect(int16(bytes, HEADER_SIZE + blockAlign)).toBe(-FULL_SCALE);
    expect(int16(bytes, HEADER_SIZE + blockAlign + BYTES_PER_SAMPLE)).toBe(-FULL_SCALE);
    expect(int16(bytes, HEADER_SIZE + blockAlign * 2)).toBe(SILENCE);
    expect(int16(bytes, HEADER_SIZE + blockAlign * 2 + BYTES_PER_SAMPLE)).toBe(FULL_SCALE);
  });
});

function text(bytes: Uint8Array, start: number, length: number): string {
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result += String.fromCharCode(bytes[start + index] ?? 0);
  }
  return result;
}

function uint16(bytes: Uint8Array, offset: number): number {
  const low = bytes[offset] ?? 0;
  const high = bytes[offset + 1] ?? 0;
  return low + high * 256;
}

function uint32(bytes: Uint8Array, offset: number): number {
  let value = 0;
  let place = 1;
  for (let index = 0; index < 4; index += 1) {
    value += (bytes[offset + index] ?? 0) * place;
    place *= 256;
  }
  return value;
}

function int16(bytes: Uint8Array, offset: number): number {
  const value = uint16(bytes, offset);
  if (value >= SIGN_BIT) {
    return value - UINT16_RANGE;
  }
  return value;
}
