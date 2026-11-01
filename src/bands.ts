const BASS = { low: 20, high: 250 };
const MIDS = { low: 250, high: 2000 };
const TREBLE = { low: 2000, high: 16000 };

export type BandEnergy = {
  bass: number;
  mids: number;
  treble: number;
};

export function bandEnergies(spectrum: Float32Array, sampleRate: number): BandEnergy {
  return {
    bass: energy(spectrum, sampleRate, BASS.low, BASS.high),
    mids: energy(spectrum, sampleRate, MIDS.low, MIDS.high),
    treble: energy(spectrum, sampleRate, TREBLE.low, TREBLE.high),
  };
}

function energy(spectrum: Float32Array, sampleRate: number, lowHz: number, highHz: number): number {
  const fftSize = spectrum.length * 2;
  const first = Math.max(1, Math.floor((lowHz * fftSize) / sampleRate));
  const last = Math.min(spectrum.length - 1, Math.ceil((highHz * fftSize) / sampleRate));
  let total = 0;
  for (let bin = first; bin <= last; bin += 1) {
    const magnitude = spectrum[bin] ?? 0;
    total += magnitude * magnitude;
  }
  return total;
}
