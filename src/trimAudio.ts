export function trimToSeconds(
  samples: Float32Array,
  sampleRate: number,
  seconds: number,
  start = 0,
): Float32Array {
  const max = Math.floor(sampleRate * seconds);
  const from = startIndex(Math.floor(sampleRate * start), samples.length);
  if (!Number.isFinite(max) || max < 0) {
    if (from === 0) {
      return samples;
    }
    return samples.subarray(from);
  }

  const to = Math.min(samples.length, from + max);
  if (from === 0 && samples.length <= max) {
    return samples;
  }
  return samples.subarray(from, to);
}

function startIndex(offset: number, length: number): number {
  if (!Number.isFinite(offset) || offset <= 0) {
    return 0;
  }
  if (offset > length) {
    return length;
  }
  return offset;
}
