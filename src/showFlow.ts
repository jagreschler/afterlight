import type { AudioAnalysis } from "./analyzeAudio";
import { analyzePreview } from "./analyzePreview";
import type { Song } from "./itunes";
import { choreographPulse, type PulseMode } from "./pulse";
import { GenerateShowCard } from "./generateShowCard";

type GenerateHook = (mode: PulseMode, song: Song) => void;
type AnalyzePreview = (url: string) => Promise<AudioAnalysis>;

const SPLIT: PulseMode = "split";
const TOGETHER: PulseMode = "together";
const ANALYZING = "Analyzing song…";
const BUILDING = "Building light show…";
const FAILED = "Couldn't build the light show.";
const READY = "Generate & Download";

export class ShowFlow {
  lightShow: Uint8Array[] | null = null;
  private readonly generateHooks: GenerateHook[] = [];
  private readonly card: GenerateShowCard;
  private readonly analyze: AnalyzePreview;
  private song: Song | null = null;
  private busy = false;

  constructor(root: HTMLElement, analyze: AnalyzePreview = analyzePreview) {
    this.analyze = analyze;
    this.card = new GenerateShowCard(root);
    this.card.button.addEventListener("click", () => {
      void this.run();
    });
  }

  songSelected(song: Song): void {
    this.song = song;
    this.card.show();
  }

  onGenerate(hook: GenerateHook): void {
    this.generateHooks.push(hook);
  }

  private async run(): Promise<void> {
    const song = this.song;
    if (song === null || this.busy) {
      return;
    }

    this.busy = true;
    const mode = modeFromSync(this.card.sync.checked);
    this.card.setBusy(ANALYZING);
    try {
      const analysis = await this.analyze(song.previewUrl);
      this.card.setBusy(BUILDING);
      // Let the browser paint "Building light show…" before the grid is filled.
      await Promise.resolve();
      this.lightShow = choreographPulse(analysis, { mode: mode });
      this.card.setReady(READY);
      this.notify(mode, song);
    } catch {
      this.lightShow = null;
      this.card.setFailed(FAILED);
    } finally {
      this.busy = false;
    }
  }

  private notify(mode: PulseMode, song: Song): void {
    for (const hook of this.generateHooks) {
      hook(mode, song);
    }
  }
}

export function mountShowFlow(root: HTMLElement, analyze: AnalyzePreview = analyzePreview): ShowFlow {
  return new ShowFlow(root, analyze);
}

function modeFromSync(checked: boolean): PulseMode {
  if (checked) {
    return TOGETHER;
  }
  return SPLIT;
}
