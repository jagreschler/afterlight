import { afterEach, describe, expect, it } from "vitest";
import type { AudioAnalysis } from "./analyzeAudio";
import type { Song } from "./itunes";
import { mountPreviewPlayer } from "./previewPlayer";
import { mountLightShowGenerator } from "./lightShowGenerator";

const SAMPLE_RATE = 44100;
const FRAME_RATE = 50;
const SAMPLE_URL = "https://example.com/preview.m4a";
const UPLOAD_ID = 0;
const SHOW_START = 10;
const FRAME_MS = 20;
const STEP_SECONDS = FRAME_MS / 1000;
const ON = 255;
const LIT = "1";
const HEADLIGHT = ".light-preview .headlight";
const SONG_SECONDS = 30;

afterEach(() => {
  document.body.replaceChildren();
});

describe("preview sync", () => {
  it("repaints the light preview from the preview player's time and holds when paused", async () => {
    const audio = clock();
    const playerRoot = document.createElement("div");
    const showRoot = document.createElement("div");
    document.body.append(playerRoot, showRoot);
    const player = mountPreviewPlayer(playerRoot, audio);
    const generator = mountLightShowGenerator(showRoot, async () => readyPreview());
    player.onTimeUpdate((currentTime) => {
      generator.follow(currentTime);
    });
    generator.songSelected(uploadedSong());
    const start = showRoot.querySelector(".start-point input");
    if (!(start instanceof HTMLInputElement)) {
      throw new Error("missing start point");
    }
    start.value = String(SHOW_START);
    const generate = showRoot.querySelector(".generate-button");
    if (!(generate instanceof HTMLButtonElement)) {
      throw new Error("missing generate button");
    }
    generate.click();
    await settle();

    audio.currentTime = SHOW_START;
    audio.dispatchEvent(new Event("timeupdate"));
    expect(opacity(showRoot)).toBe(LIT);

    audio.currentTime = SHOW_START + STEP_SECONDS;
    audio.dispatchEvent(new Event("timeupdate"));
    const held = opacity(showRoot);
    expect(held).not.toBe(LIT);

    audio.dispatchEvent(new Event("pause"));
    expect(opacity(showRoot)).toBe(held);
  });
});

function opacity(root: ParentNode): string {
  const light = root.querySelector(HEADLIGHT);
  if (!(light instanceof Element)) {
    throw new Error("missing headlight");
  }
  return light.getAttribute("opacity") ?? "";
}

function clock(): HTMLAudioElement {
  const audio = new Audio();
  let currentTime = 0;
  Object.defineProperty(audio, "currentTime", {
    configurable: true,
    get: () => currentTime,
    set: (value: number) => {
      currentTime = value;
    },
  });
  Object.defineProperty(audio, "duration", {
    configurable: true,
    get: () => SONG_SECONDS,
  });
  return audio;
}

function readyPreview(): {
  analysis: AudioAnalysis;
  samples: Float32Array;
  sampleRate: number;
} {
  const first = { time: 0, bass: ON, mids: 0, treble: 0 };
  const second = { time: STEP_SECONDS, bass: 0, mids: 0, treble: 0 };
  return {
    analysis: {
      sampleRate: SAMPLE_RATE,
      frameRate: FRAME_RATE,
      frames: [first, second],
      onsetTimes: [0],
    },
    samples: new Float32Array([0]),
    sampleRate: SAMPLE_RATE,
  };
}

function uploadedSong(): Song {
  return {
    trackId: UPLOAD_ID,
    trackName: "My Song",
    artistName: "",
    artworkUrl: "",
    previewUrl: SAMPLE_URL,
  };
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
