const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = 2;
const PCM_FORMAT = 1;
const HEADER_SIZE = 44;
const FMT_SIZE = 16;
const FULL_SCALE = 32767;

// One channel array is the same Float32Array shape decodeAudioData gives
// the analyzer. Pass several of them for stereo.
export function writeWav(channels: Float32Array[], sampleRate: number): Uint8Array {
  const channelCount = channels.length;
  const sampleCount = channels[0]?.length ?? 0;
  const dataSize = sampleCount * channelCount * BYTES_PER_SAMPLE;
  const bytes = new Uint8Array(HEADER_SIZE + dataSize);
  writeHeader(bytes, channelCount, sampleRate, dataSize);
  writeSamples(bytes, channels, sampleCount);
  return bytes;
}

function writeHeader(
  bytes: Uint8Array,
  channelCount: number,
  sampleRate: number,
  dataSize: number,
): void {
  writeText(bytes, 0, "RIFF");
  writeUint32(bytes, 4, bytes.length - 8);
  writeText(bytes, 8, "WAVE");
  writeText(bytes, 12, "fmt ");
  writeUint32(bytes, 16, FMT_SIZE);
  writeUint16(bytes, 20, PCM_FORMAT);
  writeUint16(bytes, 22, channelCount);
  writeUint32(bytes, 24, sampleRate);
  const byteRate = sampleRate * channelCount * BYTES_PER_SAMPLE;
  writeUint32(bytes, 28, byteRate);
  const blockAlign = channelCount * BYTES_PER_SAMPLE;
  writeUint16(bytes, 32, blockAlign);
  writeUint16(bytes, 34, BITS_PER_SAMPLE);
  writeText(bytes, 36, "data");
  writeUint32(bytes, 40, dataSize);
}

function writeSamples(bytes: Uint8Array, channels: Float32Array[], sampleCount: number): void {
  let offset = HEADER_SIZE;
  for (let index = 0; index < sampleCount; index += 1) {
    for (let channelIndex = 0; channelIndex < channels.length; channelIndex += 1) {
      const channel = channels[channelIndex];
      const sample = channel?.[index] ?? 0;
      writeInt16(bytes, offset, scale(sample));
      offset += BYTES_PER_SAMPLE;
    }
  }
}

function scale(sample: number): number {
  let clamped = sample;
  if (clamped > 1) {
    clamped = 1;
  }
  if (clamped < -1) {
    clamped = -1;
  }
  return Math.round(clamped * FULL_SCALE);
}

function writeText(bytes: Uint8Array, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    bytes[offset + index] = value.charCodeAt(index);
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

function writeInt16(bytes: Uint8Array, offset: number, value: number): void {
  writeUint16(bytes, offset, value & 0xffff);
}
