import { GenerateShowCard } from "./generateShowCard";
import type { PulseModePicker } from "./pulseModePicker";

export class ShowFlow {
  private readonly generateHooks: Array<() => void> = [];
  private readonly card: GenerateShowCard;
  private readonly picker: PulseModePicker;

  constructor(generateRoot: HTMLElement, picker: PulseModePicker) {
    this.picker = picker;
    this.picker.hide();
    this.card = new GenerateShowCard(generateRoot);
    this.card.button.addEventListener("click", () => {
      this.picker.show();
      this.notify();
    });
  }

  songSelected(): void {
    this.card.show();
    this.picker.hide();
    this.picker.reset();
  }

  onGenerate(hook: () => void): void {
    this.generateHooks.push(hook);
  }

  private notify(): void {
    for (const hook of this.generateHooks) {
      hook();
    }
  }
}

export function mountShowFlow(generateRoot: HTMLElement, picker: PulseModePicker): ShowFlow {
  return new ShowFlow(generateRoot, picker);
}
