import { PreviewPlayerCard } from "./previewPlayerCard";

export type TimeHook = (currentTime: number, duration: number) => void;

export type PreviewControls = {
  load(url: string): void;
  onEnded(hook: () => void): void;
  onTimeUpdate(hook: TimeHook): void;
};

export class PreviewPlayer {
  private readonly audio: HTMLAudioElement;
  private readonly endedHooks: Array<() => void> = [];
  private readonly timeHooks: TimeHook[] = [];

  constructor(audio: HTMLAudioElement = new Audio()) {
    this.audio = audio;
    audio.addEventListener("ended", () => {
      this.notifyEnded();
    });
    audio.addEventListener("timeupdate", () => {
      this.notifyTime();
    });
  }

  load(url: string): void {
    this.pause();
    this.audio.src = url;
    this.audio.load();
  }

  play(): Promise<void> {
    return this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  get paused(): boolean {
    return this.audio.paused;
  }

  onEnded(hook: () => void): void {
    this.endedHooks.push(hook);
  }

  onTimeUpdate(hook: TimeHook): void {
    this.timeHooks.push(hook);
  }

  private notifyEnded(): void {
    for (const hook of this.endedHooks) {
      hook();
    }
  }

  private notifyTime(): void {
    const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
    for (const hook of this.timeHooks) {
      hook(this.audio.currentTime, duration);
    }
  }
}

export function mountPreviewPlayer(
  root: HTMLElement,
  audio: HTMLAudioElement = new Audio(),
): PreviewControls {
  const card = new PreviewPlayerCard(root);
  const player = new PreviewPlayer(audio);

  player.onTimeUpdate((currentTime, duration) => {
    card.setTime(currentTime, duration);
  });
  player.onEnded(() => {
    card.setPlaying(false);
  });
  card.button.addEventListener("click", () => {
    void toggle(player, card);
  });

  return {
    load(url: string): void {
      player.load(url);
      card.reset();
    },
    onEnded(hook: () => void): void {
      player.onEnded(hook);
    },
    onTimeUpdate(hook: TimeHook): void {
      player.onTimeUpdate(hook);
    },
  };
}

async function toggle(player: PreviewPlayer, card: PreviewPlayerCard): Promise<void> {
  if (!player.paused) {
    player.pause();
    card.setPlaying(false);
    return;
  }

  try {
    await player.play();
    card.setPlaying(true);
  } catch {
    card.setPlaying(false);
  }
}
