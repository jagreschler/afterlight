const SYNC_LABEL = "Sync all lights";
const GENERATE_LABEL = "Generate & Download";
const LENGTH_LABEL = "Show length";
const PREVIEW_SECONDS = 30;
const MID_SECONDS = 45;
const LONG_SECONDS = 60;
const LENGTH_SECONDS = [PREVIEW_SECONDS, MID_SECONDS, LONG_SECONDS];

export class GenerateShowCard {
  readonly sync: HTMLInputElement;
  readonly button: HTMLButtonElement;
  private readonly length: HTMLSelectElement;
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add("generate");
    this.root.hidden = true;

    const lengthLabel = document.createElement("label");
    lengthLabel.className = "show-length";
    const lengthCaption = document.createElement("span");
    lengthCaption.textContent = LENGTH_LABEL;
    this.length = document.createElement("select");
    this.length.disabled = true;
    for (const seconds of LENGTH_SECONDS) {
      const option = document.createElement("option");
      option.value = String(seconds);
      option.textContent = `${seconds} s`;
      this.length.append(option);
    }
    lengthLabel.append(lengthCaption, this.length);

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

    this.root.replaceChildren(lengthLabel, label, button);
  }

  show(): void {
    this.root.hidden = false;
  }

  setUploaded(uploaded: boolean): void {
    if (uploaded) {
      this.length.disabled = false;
      return;
    }
    this.length.value = String(PREVIEW_SECONDS);
    this.length.disabled = true;
  }

  seconds(): number {
    return Number(this.length.value);
  }

  setBusy(message: string): void {
    this.button.disabled = true;
    this.button.textContent = message;
  }

  setReady(label: string): void {
    this.button.disabled = false;
    this.button.textContent = label;
  }

  setFailed(message: string): void {
    this.button.disabled = false;
    this.button.textContent = message;
  }
}
