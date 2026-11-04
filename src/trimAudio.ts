export function trimToSeconds(
  samples: Float32Array,
  sampleRate: number,
  seconds: number,
): Float32Array {
  const max = Math.floor(sampleRate * seconds);
  if (!Number.isFinite(max) || max < 0 || samples.length <= max) {
    return samples;
  }
  return samples.subarray(0, max);
}
