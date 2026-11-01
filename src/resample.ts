export function resample(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) {
    return samples;
  }

  const length = Math.max(1, Math.round((samples.length * toRate) / fromRate));
  const output = new Float32Array(length);
  const scale = fromRate / toRate;

  for (let index = 0; index < length; index += 1) {
    const position = index * scale;
    const left = Math.floor(position);
    const fraction = position - left;
    const start = samples[left] ?? 0;
    const end = samples[left + 1] ?? start;
    output[index] = start + (end - start) * fraction;
  }

  return output;
}
