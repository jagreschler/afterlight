const SYNC_LABEL = "Sync all lights";
const GENERATE_LABEL = "Generate & Download";

export class GenerateShowCard {
  readonly sync: HTMLInputElement;
  readonly button: HTMLButtonElement;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add("generate");
    this.root.hidden = true;

    const label = document.createElement("label");
    label.className = "sync-lights";
    this.sync = document.createElement("input");
    this.sync.type = "checkbox";
    const caption = document.createElement("span");
    caption.textContent = SYNC_LABEL;
    label.append(this.sync, caption);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "generate-button";
    button.textContent = GENERATE_LABEL;
    this.button = button;

    this.root.replaceChildren(label, button);
  }

  show(): void {
    this.root.hidden = false;
  }
}
