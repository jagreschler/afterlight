import type { PulseMode } from "./pulse";

export class PulseModeCard {
  readonly splitButton: HTMLButtonElement;
  readonly togetherButton: HTMLButtonElement;

  constructor(root: HTMLElement) {
    root.classList.add("pulse-mode");
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", "Light style");

    const label = document.createElement("p");
    label.className = "pulse-mode-label";
    label.textContent = "Light style";

    const options = document.createElement("div");
    options.className = "pulse-mode-options";
    this.splitButton = modeButton("Split");
    this.togetherButton = modeButton("Together");
    options.append(this.splitButton, this.togetherButton);
    root.replaceChildren(label, options);
  }

  setSelected(mode: PulseMode): void {
    const splitSelected = mode === "split";
    this.splitButton.setAttribute("aria-pressed", splitSelected ? "true" : "false");
    this.togetherButton.setAttribute("aria-pressed", splitSelected ? "false" : "true");
  }
}

function modeButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-pressed", "false");
  return button;
}
