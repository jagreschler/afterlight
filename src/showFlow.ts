import type { Song } from "./itunes";
import type { PulseMode } from "./pulse";
import { GenerateShowCard } from "./generateShowCard";

type GenerateHook = (mode: PulseMode, song: Song) => void;

const SPLIT: PulseMode = "split";
const TOGETHER: PulseMode = "together";

export class ShowFlow {
  private readonly generateHooks: GenerateHook[] = [];
  private readonly card: GenerateShowCard;
  private song: Song | null = null;

  constructor(root: HTMLElement) {
    this.card = new GenerateShowCard(root);
    this.card.button.addEventListener("click", () => {
      this.notify();
    });
  }

  songSelected(song: Song): void {
    this.song = song;
    this.card.show();
  }

  onGenerate(hook: GenerateHook): void {
    this.generateHooks.push(hook);
  }

  private notify(): void {
    const song = this.song;
    if (song === null) {
      return;
    }
    const mode = modeFromSync(this.card.sync.checked);
    for (const hook of this.generateHooks) {
      hook(mode, song);
    }
  }
}

export function mountShowFlow(root: HTMLElement): ShowFlow {
  return new ShowFlow(root);
}

function modeFromSync(checked: boolean): PulseMode {
  if (checked) {
    return TOGETHER;
  }
  return SPLIT;
}
