import type { Song } from "./itunes";
import type { PulseMode } from "./pulse";
import { GenerateShowCard } from "./generateShowCard";
import type { PulseModePicker } from "./pulseModePicker";

type GenerateHook = (mode: PulseMode, song: Song) => void;

export class ShowFlow {
  private readonly generateHooks: GenerateHook[] = [];
  private readonly card: GenerateShowCard;
  private readonly picker: PulseModePicker;
  private song: Song | null = null;

  constructor(generateRoot: HTMLElement, picker: PulseModePicker) {
    this.picker = picker;
    this.card = new GenerateShowCard(generateRoot);
    this.card.button.addEventListener("click", () => {
      this.notify();
    });
  }

  songSelected(song: Song): void {
    this.song = song;
    this.card.show();
    this.picker.show();
  }

  onGenerate(hook: GenerateHook): void {
    this.generateHooks.push(hook);
  }

  private notify(): void {
    const song = this.song;
    if (song === null) {
      return;
    }
    const mode = this.picker.mode;
    for (const hook of this.generateHooks) {
      hook(mode, song);
    }
  }
}

export function mountShowFlow(generateRoot: HTMLElement, picker: PulseModePicker): ShowFlow {
  return new ShowFlow(generateRoot, picker);
}
