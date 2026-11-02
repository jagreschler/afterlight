import type { PulseMode } from "./pulse";
import { PulseModeCard } from "./pulseModeCard";

const DEFAULT_MODE: PulseMode = "split";

export class PulseModePicker {
  private selected: PulseMode = DEFAULT_MODE;
  private readonly changeHooks: Array<(mode: PulseMode) => void> = [];
  private readonly card: PulseModeCard;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.hidden = true;
    this.card = new PulseModeCard(root);
    this.card.setSelected(this.selected);
    this.card.splitButton.addEventListener("click", () => {
      this.choose("split");
    });
    this.card.togetherButton.addEventListener("click", () => {
      this.choose("together");
    });
  }

  get mode(): PulseMode {
    return this.selected;
  }

  onChange(hook: (mode: PulseMode) => void): void {
    this.changeHooks.push(hook);
  }

  show(): void {
    this.root.hidden = false;
  }

  hide(): void {
    this.root.hidden = true;
  }

  reset(): void {
    this.selected = DEFAULT_MODE;
    this.card.setSelected(this.selected);
  }

  private choose(mode: PulseMode): void {
    if (mode === this.selected) {
      return;
    }
    this.selected = mode;
    this.card.setSelected(mode);
    this.notify(mode);
  }

  private notify(mode: PulseMode): void {
    for (const hook of this.changeHooks) {
      hook(mode);
    }
  }
}

export function mountPulseModePicker(root: HTMLElement): PulseModePicker {
  return new PulseModePicker(root);
}
