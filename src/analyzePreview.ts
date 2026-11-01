import { analyzeAudio, type AudioAnalysis } from "./analyzeAudio";

export type DecodedPreview = {
  samples: Float32Array;
  sampleRate: number;
};

export async function analyzePreview(
  url: string,
  decode: (bytes: ArrayBuffer) => Promise<DecodedPreview> = decodeWithWebAudio,
): Promise<AudioAnalysis> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download the preview (${response.status}).`);
  }

  const bytes = await response.arrayBuffer();
  const preview = await decode(bytes);
  return analyzeAudio(preview.samples, preview.sampleRate);
}

async function decodeWithWebAudio(bytes: ArrayBuffer): Promise<DecodedPreview> {
  const context = new OfflineAudioContext(1, 1, 44100);
  const audio = await context.decodeAudioData(bytes);
  return {
    samples: mixToMono(audio),
    sampleRate: audio.sampleRate,
  };
}

function mixToMono(audio: AudioBuffer): Float32Array {
  if (audio.numberOfChannels === 1) {
    return audio.getChannelData(0);
  }

  const mixed = new Float32Array(audio.length);
  for (let channel = 0; channel < audio.numberOfChannels; channel += 1) {
    const data = audio.getChannelData(channel);
    for (let index = 0; index < audio.length; index += 1) {
      mixed[index] = (mixed[index] ?? 0) + (data[index] ?? 0) / audio.numberOfChannels;
    }
  }
  return mixed;
}
