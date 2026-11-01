import { bandEnergies, type BandEnergy } from "./bands";
import { magnitudeSpectrum } from "./fft";
import { onsetTimes, spectralFlux } from "./onsets";
import { resample } from "./resample";

// One light frame every 20 ms. The preview is measured on that grid
// before anything plays, then the player can run in time with it.
const FRAMES_PER_SECOND = 50;
const SAMPLE_RATE = 44100;
const WINDOW_SIZE = 2048;
const HOP_SIZE = SAMPLE_RATE / FRAMES_PER_SECOND;

export type AudioFrame = {
  time: number;
  bass: number;
  mids: number;
  treble: number;
};

export type AudioAnalysis = {
  sampleRate: number;
  frameRate: number;
  frames: AudioFrame[];
  onsetTimes: number[];
};

export function analyzeAudio(samples: Float32Array, sampleRate: number): AudioAnalysis {
  if (samples.length === 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    return emptyAnalysis();
  }

  const audio = resample(samples, sampleRate, SAMPLE_RATE);
  const measured = measureFrames(audio);
  return {
    sampleRate: SAMPLE_RATE,
    frameRate: FRAMES_PER_SECOND,
    frames: normalize(measured.bands),
    onsetTimes: onsetTimes(measured.flux, FRAMES_PER_SECOND),
  };
}

function emptyAnalysis(): AudioAnalysis {
  return {
    sampleRate: SAMPLE_RATE,
    frameRate: FRAMES_PER_SECOND,
    frames: [],
    onsetTimes: [],
  };
}

function measureFrames(samples: Float32Array): { bands: BandEnergy[]; flux: number[] } {
  const frameCount = Math.ceil(samples.length / HOP_SIZE);
  const bands: BandEnergy[] = [];
  const flux: number[] = [];
  let previous: Float32Array = new Float32Array(WINDOW_SIZE / 2);

  for (let index = 0; index < frameCount; index += 1) {
    const spectrum = magnitudeSpectrum(windowAt(samples, index * HOP_SIZE));
    bands.push(bandEnergies(spectrum, SAMPLE_RATE));
    flux.push(spectralFlux(previous, spectrum));
    previous = spectrum;
  }

  return { bands, flux };
}

function windowAt(samples: Float32Array, start: number): Float32Array {
  const window = new Float32Array(WINDOW_SIZE);
  if (start >= samples.length) {
    return window;
  }
  const end = Math.min(samples.length, start + WINDOW_SIZE);
  window.set(samples.subarray(start, end));
  return window;
}

function normalize(bands: BandEnergy[]): AudioFrame[] {
  let loudest = 0;
  for (const band of bands) {
    loudest = Math.max(loudest, band.bass, band.mids, band.treble);
  }

  return bands.map((band, index) => ({
    time: index / FRAMES_PER_SECOND,
    bass: scale(band.bass, loudest),
    mids: scale(band.mids, loudest),
    treble: scale(band.treble, loudest),
  }));
}

function scale(value: number, loudest: number): number {
  if (loudest <= 0) {
    return 0;
  }
  return value / loudest;
}
