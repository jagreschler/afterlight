const CHANNEL_COUNT = 200;
const STEP_TIME_MS = 20;
const HEADER_SIZE = 32;
const MINOR_VERSION = 0;
const MAJOR_VERSION = 2;

export type FseqOptions = {
  channelCount?: number;
  stepTimeMs?: number;
};

export function writeFseq(frames: Uint8Array[], options: FseqOptions = {}): Uint8Array {
  const channelCount = options.channelCount ?? CHANNEL_COUNT;
  const stepTimeMs = options.stepTimeMs ?? STEP_TIME_MS;
  const bytes = new Uint8Array(HEADER_SIZE + frames.length * channelCount);
  writeHeader(bytes, frames.length, channelCount, stepTimeMs);
  writeFrames(bytes, frames, channelCount);
  return bytes;
}

function writeHeader(
  bytes: Uint8Array,
  frameCount: number,
  channelCount: number,
  stepTimeMs: number,
): void {
  bytes[0] = 0x50;
  bytes[1] = 0x53;
  bytes[2] = 0x45;
  bytes[3] = 0x51;
  writeUint16(bytes, 4, HEADER_SIZE);
  bytes[6] = MINOR_VERSION;
  bytes[7] = MAJOR_VERSION;
  writeUint16(bytes, 8, HEADER_SIZE);
  writeUint32(bytes, 10, channelCount);
  writeUint32(bytes, 14, frameCount);
  bytes[18] = stepTimeMs;
  bytes[20] = 0;
}

function writeFrames(bytes: Uint8Array, frames: Uint8Array[], channelCount: number): void {
  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    if (frame === undefined) {
      continue;
    }
    const start = HEADER_SIZE + index * channelCount;
    const count = Math.min(channelCount, frame.length);
    bytes.set(frame.subarray(0, count), start);
  }
}

function writeUint16(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
}

function writeUint32(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
  bytes[offset + 2] = (value >> 16) & 0xff;
  bytes[offset + 3] = (value >> 24) & 0xff;
}
