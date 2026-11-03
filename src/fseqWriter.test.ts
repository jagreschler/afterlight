import { describe, expect, it } from "vitest";
import { writeFseq } from "./fseqWriter";

const CHANNELS = 200;
const STEP_MS = 20;
const HEADER_SIZE = 32;
const MINOR_VERSION = 0;
const MAJOR_VERSION = 2;
const UNCOMPRESSED = 0;
const FIRST_FILL = 11;
const SECOND_MARK = 22;

describe("writeFseq", () => {
  it("writes an uncompressed FSEQ 2.0 header and then the frames in order", () => {
    const first = row(FIRST_FILL);
    first[0] = FIRST_FILL + 1;
    const second = row(SECOND_MARK);
    second[3] = SECOND_MARK + 1;

    const bytes = writeFseq([first, second]);

    expect(text(bytes, 0, 4)).toBe("PSEQ");
    expect(bytes[6]).toBe(MINOR_VERSION);
    expect(bytes[7]).toBe(MAJOR_VERSION);
    expect(uint16(bytes, 4)).toBe(HEADER_SIZE);
    expect(uint16(bytes, 8)).toBe(HEADER_SIZE);
    expect(uint32(bytes, 10)).toBe(CHANNELS);
    expect(uint32(bytes, 14)).toBe(2);
    expect(bytes[18]).toBe(STEP_MS);
    expect(bytes[20]).toBe(UNCOMPRESSED);

    expect(bytes.length).toBe(HEADER_SIZE + CHANNELS * 2);
    expect(bytes[HEADER_SIZE]).toBe(FIRST_FILL + 1);
    expect(bytes[HEADER_SIZE + 1]).toBe(FIRST_FILL);
    expect(bytes[HEADER_SIZE + CHANNELS + 3]).toBe(SECOND_MARK + 1);
  });
});

function row(value: number): Uint8Array {
  const frame = new Uint8Array(CHANNELS);
  frame.fill(value);
  return frame;
}

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
