const SYNC_LABEL = "Sync lights";
const GENERATE_LABEL = "Generate";
const DOWNLOAD_LABEL = "Download";
const LENGTH_LABEL = "Show length";
const START_LABEL = "Start at";
const START_AT = 0;
const PREVIEW_SECONDS = 30;
const MID_SECONDS = 45;
const LONG_SECONDS = 60;
const LENGTH_SECONDS = [PREVIEW_SECONDS, MID_SECONDS, LONG_SECONDS];

export class GenerateShowCard {
  readonly syncLights: HTMLInputElement;
  readonly button: HTMLButtonElement;
  readonly download: HTMLButtonElement;
  private readonly length: HTMLSelectElement;
  private readonly start: HTMLInputElement;
  private readonly root: HTMLElement;
  private edited: (() => void) | null = null;

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

    const startLabel = document.createElement("label");
    startLabel.className = "start-point";
    const startCaption = document.createElement("span");
    startCaption.textContent = START_LABEL;
    this.start = document.createElement("input");
    this.start.type = "number";
    this.start.min = String(START_AT);
    this.start.step = "1";
    this.start.value = String(START_AT);
    this.start.disabled = true;
    startLabel.append(startCaption, this.start);

    const label = document.createElement("label");
    label.className = "sync-lights";
    this.syncLights = document.createElement("input");
    this.syncLights.type = "checkbox";
    const caption = document.createElement("span");
    caption.textContent = SYNC_LABEL;
    label.append(this.syncLights, caption);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "generate-button";
    button.textContent = GENERATE_LABEL;
    this.button = button;

    const save = document.createElement("button");
    save.type = "button";
    save.className = "download-button";
    save.textContent = DOWNLOAD_LABEL;
    save.hidden = true;
    this.download = save;

    this.syncLights.addEventListener("change", () => {
      this.markStale();
    });
    this.length.addEventListener("change", () => {
      this.markStale();
    });
    this.start.addEventListener("input", () => {
      this.markStale();
    });

    this.root.replaceChildren(lengthLabel, startLabel, label, button, save);
  }

  onEdit(hook: () => void): void {
    this.edited = hook;
  }

  markStale(): void {
    if (this.edited !== null) {
      this.edited();
    }
  }

  showDownload(): void {
    this.download.hidden = false;
  }

  hideDownload(): void {
    this.download.hidden = true;
  }

  show(): void {
    this.root.hidden = false;
  }

  setUploaded(uploaded: boolean): void {
    if (uploaded) {
      this.length.disabled = false;
      this.start.disabled = false;
      return;
    }
    this.length.value = String(PREVIEW_SECONDS);
    this.length.disabled = true;
    this.start.value = String(START_AT);
    this.start.disabled = true;
  }

  seconds(): number {
    return Number(this.length.value);
  }

  startSeconds(): number {
    const start = Number(this.start.value);
    if (!Number.isFinite(start) || start < START_AT) {
      return START_AT;
    }
    return start;
  }

  setBusy(message: string): void {
    this.button.disabled = true;
    this.button.textContent = message;
    this.hideDownload();
  }

  setReady(label: string): void {
    this.button.disabled = false;
    this.button.textContent = label;
  }

  setFailed(message: string): void {
    this.button.disabled = false;
    this.button.textContent = message;
    this.hideDownload();
  }
}
