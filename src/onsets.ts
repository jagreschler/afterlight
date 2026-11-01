export function spectralFlux(previous: Float32Array, next: Float32Array): number {
  let flux = 0;
  for (let bin = 1; bin < next.length; bin += 1) {
    const rise = (next[bin] ?? 0) - (previous[bin] ?? 0);
    if (rise > 0) {
      flux += rise;
    }
  }
  return flux;
}

export function onsetTimes(flux: number[], framesPerSecond: number): number[] {
  const mean = average(flux);
  const spread = deviation(flux, mean);
  const threshold = mean + spread;
  const times: number[] = [];
  let previousTime = -1;

  for (let index = 1; index < flux.length - 1; index += 1) {
    const value = flux[index] ?? 0;
    const before = flux[index - 1] ?? 0;
    const after = flux[index + 1] ?? 0;
    const time = index / framesPerSecond;
    const isPeak = value > before && value >= after && value > threshold;
    if (!isPeak || time - previousTime < 0.1) {
      continue;
    }
    times.push(time);
    previousTime = time;
  }

  return times;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
}

function deviation(values: number[], mean: number): number {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    const delta = value - mean;
    total += delta * delta;
  }
  return Math.sqrt(total / values.length);
}
