import { analyzePreview, type AnalyzedPreview } from "./analyzePreview";
import { downloadFile } from "./downloadFile";
import type { Song } from "./itunes";
import { choreographPulse, type PulseMode } from "./pulse";
import { buildShowZip } from "./showPackage";
import { showSlug } from "./slugify";
import { writeFseq } from "./fseqWriter";
import { writeWav } from "./wavWriter";
import { GenerateShowCard } from "./generateShowCard";

type GenerateHook = (mode: PulseMode, song: Song) => void;
type AnalyzePreview = (url: string, seconds: number, start: number) => Promise<AnalyzedPreview>;
type DownloadZip = (name: string, bytes: Uint8Array) => void;

const SPLIT: PulseMode = "split";
const TOGETHER: PulseMode = "together";
const ANALYZING = "Analyzing song…";
const BUILDING = "Building light show…";
const FAILED = "Couldn't build the light show.";
const READY = "Generate & Download";
const UPLOAD_TRACK_ID = 0;

export class ShowFlow {
  lightShow: Uint8Array[] | null = null;
  private readonly generateHooks: GenerateHook[] = [];
  private readonly card: GenerateShowCard;
  private readonly analyze: AnalyzePreview;
  private readonly download: DownloadZip;
  private song: Song | null = null;
  private busy = false;

  constructor(
    root: HTMLElement,
    analyze: AnalyzePreview = analyzePreview,
    download: DownloadZip = downloadFile,
  ) {
    this.analyze = analyze;
    this.download = download;
    this.card = new GenerateShowCard(root);
    this.card.button.addEventListener("click", () => {
      void this.run();
    });
  }

  songSelected(song: Song): void {
    this.song = song;
    this.card.setUploaded(song.trackId === UPLOAD_TRACK_ID);
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
      const prepared = await this.analyze(song.previewUrl, this.card.seconds(), this.card.startSeconds());
      this.card.setBusy(BUILDING);
      // Let the browser paint "Building light show…" before the files are written.
      await Promise.resolve();
      const frames = choreographPulse(prepared.analysis, { mode: mode });
      this.lightShow = frames;
      const slug = showSlug(song.artistName, song.trackName);
      const fseq = writeFseq(frames);
      const wav = writeWav([prepared.samples], prepared.sampleRate);
      this.download(`${slug}.zip`, buildShowZip(slug, fseq, wav));
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

export function mountShowFlow(
  root: HTMLElement,
  analyze: AnalyzePreview = analyzePreview,
  download: DownloadZip = downloadFile,
): ShowFlow {
  return new ShowFlow(root, analyze, download);
}

function modeFromSync(checked: boolean): PulseMode {
  if (checked) {
    return TOGETHER;
  }
  return SPLIT;
}
