export class PreviewPlayerCard {
  readonly button: HTMLButtonElement;
  private readonly progress: HTMLProgressElement;
  private readonly time: HTMLElement;

  constructor(private readonly root: HTMLElement) {
    root.classList.add("preview");
    root.hidden = true;

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.disabled = true;
    this.setPlaying(false);

    this.progress = document.createElement("progress");
    this.progress.value = 0;
    this.progress.max = 1;
    this.progress.setAttribute("aria-label", "Preview progress");

    this.time = document.createElement("span");
    this.time.className = "preview-time";
    this.time.textContent = "0:00 / 0:00";

    root.replaceChildren(this.button, this.progress, this.time);
  }

  reset(): void {
    this.root.hidden = false;
    this.button.disabled = false;
    this.setPlaying(false);
    this.setTime(0, 0);
  }

  setPlaying(playing: boolean): void {
    this.button.textContent = playing ? "Pause" : "Play";
    this.button.setAttribute("aria-pressed", playing ? "true" : "false");
  }

  setTime(currentTime: number, duration: number): void {
    const total = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const position = Number.isFinite(currentTime) && currentTime > 0 ? currentTime : 0;
    this.progress.max = total > 0 ? total : 1;
    this.progress.value = Math.min(position, this.progress.max);
    this.time.textContent = `${formatTime(position)} / ${formatTime(total)}`;
  }
}

function formatTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const remainder = whole % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}
