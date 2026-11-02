const LABEL = "Generate Light Show";

export class GenerateShowCard {
  readonly button: HTMLButtonElement;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add("generate");
    this.root.hidden = true;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "generate-button";
    button.textContent = LABEL;
    this.root.replaceChildren(button);
    this.button = button;
  }

  show(): void {
    this.root.hidden = false;
  }
}
