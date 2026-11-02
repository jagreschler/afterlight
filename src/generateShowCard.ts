const LABEL = "Generate Light Show";

export class GenerateShowCard {
  readonly button: HTMLButtonElement;

  constructor(root: HTMLElement) {
    root.classList.add("generate");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "generate-button";
    button.textContent = LABEL;
    button.hidden = true;
    root.replaceChildren(button);
    this.button = button;
  }

  show(): void {
    this.button.hidden = false;
  }
}
