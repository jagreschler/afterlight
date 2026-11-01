import { afterEach, describe, expect, it, vi } from "vitest";
import { mountPreviewPlayer, PreviewPlayer } from "./previewPlayer";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("PreviewPlayer", () => {
  it("plays and pauses the audio element", async () => {
    const audio = stubAudio();
    const player = new PreviewPlayer(audio);

    await player.play();
    expect(audio.play).toHaveBeenCalledOnce();
    expect(player.paused).toBe(false);

    player.pause();
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(player.paused).toBe(true);
  });

  it("stops the current preview when a new one is loaded", async () => {
    const audio = stubAudio();
    const player = new PreviewPlayer(audio);

    await player.play();
    player.load("https://example.com/next.m4a");

    expect(audio.pause).toHaveBeenCalled();
    expect(player.paused).toBe(true);
    expect(audio.src).toContain("next.m4a");
    expect(audio.load).toHaveBeenCalled();
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("reports the playhead and the end of the clip", () => {
    const audio = stubAudio();
    audio.setClock(4, 30);
    const player = new PreviewPlayer(audio);
    const times: Array<[number, number]> = [];
    const ended = vi.fn();
    const alsoEnded = vi.fn();

    player.onTimeUpdate((currentTime, duration) => {
      times.push([currentTime, duration]);
    });
    player.onEnded(ended);
    player.onEnded(alsoEnded);
    audio.dispatchEvent(new Event("timeupdate"));
    audio.dispatchEvent(new Event("ended"));

    expect(times).toEqual([[4, 30]]);
    expect(ended).toHaveBeenCalledOnce();
    expect(alsoEnded).toHaveBeenCalledOnce();
  });

  it("reports a duration of 0 when the element does not know it yet", () => {
    const audio = stubAudio();
    audio.setClock(1, Number.NaN);
    const player = new PreviewPlayer(audio);
    const seen: number[] = [];

    player.onTimeUpdate((_currentTime, duration) => {
      seen.push(duration);
    });
    audio.dispatchEvent(new Event("timeupdate"));

    expect(seen).toEqual([0]);
  });
});

describe("mounted preview player", () => {
  it("plays and pauses from the button", async () => {
    const audio = stubAudio();
    const { button, player } = mount(audio);

    player.load("https://example.com/one.m4a");
    button.click();
    await flush();
    expect(button.textContent).toBe("Pause");
    expect(audio.play).toHaveBeenCalledOnce();

    button.click();
    expect(button.textContent).toBe("Play");
    expect(audio.pause).toHaveBeenCalled();
  });

  it("resets the clock and stops playback when a new preview is loaded", async () => {
    const audio = stubAudio();
    const { root, button, player } = mount(audio);

    player.load("https://example.com/one.m4a");
    button.click();
    await flush();
    audio.setClock(9, 30);
    audio.dispatchEvent(new Event("timeupdate"));
    expect(root.querySelector(".preview-time")?.textContent).toBe("0:09 / 0:30");

    player.load("https://example.com/two.m4a");

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.src).toContain("two.m4a");
    expect(button.textContent).toBe("Play");
    expect(root.querySelector(".preview-time")?.textContent).toBe("0:00 / 0:00");
    expect(root.hidden).toBe(false);
  });

  it("returns the button to Play when the clip ends", async () => {
    const audio = stubAudio();
    const { button, player } = mount(audio);

    player.load("https://example.com/one.m4a");
    button.click();
    await flush();
    audio.dispatchEvent(new Event("ended"));

    expect(button.textContent).toBe("Play");
  });

  it("leaves the button on Play when playback is rejected", async () => {
    const audio = stubAudio();
    audio.play.mockRejectedValue(new Error("blocked"));
    const { button, player } = mount(audio);

    player.load("https://example.com/one.m4a");
    button.click();
    await flush();

    expect(button.textContent).toBe("Play");
  });

  it("still notifies an outside listener while the clock is moving", () => {
    const audio = stubAudio();
    const { player } = mount(audio);
    const seen: number[] = [];

    player.onTimeUpdate((currentTime) => {
      seen.push(currentTime);
    });
    player.load("https://example.com/one.m4a");
    audio.setClock(3, 30);
    audio.dispatchEvent(new Event("timeupdate"));

    expect(seen).toEqual([3]);
  });
});

function mount(audio: StubAudio): {
  root: HTMLElement;
  button: HTMLButtonElement;
  player: ReturnType<typeof mountPreviewPlayer>;
} {
  const root = document.createElement("div");
  document.body.append(root);
  const player = mountPreviewPlayer(root, audio);
  const button = root.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("missing play button");
  }
  return { root, button, player };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

type StubAudio = HTMLAudioElement & {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  load: ReturnType<typeof vi.fn>;
  setClock: (currentTime: number, duration: number) => void;
};

function stubAudio(): StubAudio {
  const audio = new Audio();
  let paused = true;
  let currentTime = 0;
  let duration = Number.NaN;
  const play = vi.fn(() => {
    paused = false;
    return Promise.resolve();
  });
  const pause = vi.fn(() => {
    paused = true;
  });
  const load = vi.fn();

  Object.defineProperty(audio, "paused", { configurable: true, get: () => paused });
  Object.defineProperty(audio, "currentTime", {
    configurable: true,
    get: () => currentTime,
    set: (value: number) => {
      currentTime = value;
    },
  });
  Object.defineProperty(audio, "duration", { configurable: true, get: () => duration });
  audio.play = play as HTMLAudioElement["play"];
  audio.pause = pause as HTMLAudioElement["pause"];
  audio.load = load;

  return Object.assign(audio, {
    play,
    pause,
    load,
    setClock(nextTime: number, nextDuration: number): void {
      currentTime = nextTime;
      duration = nextDuration;
    },
  }) as StubAudio;
}
