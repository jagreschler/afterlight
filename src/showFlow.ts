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
type BuiltShow = {
  previewUrl: string;
  seconds: number;
  start: number;
  sync: boolean;
};

const SPLIT: PulseMode = "split";
const TOGETHER: PulseMode = "together";
const ANALYZING = "Analyzing song…";
const BUILDING = "Building light show…";
const FAILED = "Couldn't build the light show.";
const READY = "Generate";
const UPLOAD_TRACK_ID = 0;

export class ShowFlow {
  lightShow: Uint8Array[] | null = null;
  private readonly generateHooks: GenerateHook[] = [];
  private readonly card: GenerateShowCard;
  private readonly analyze: AnalyzePreview;
  private readonly download: DownloadZip;
  private song: Song | null = null;
  private busy = false;
  private built: BuiltShow | null = null;
  private zipName = "";
  private zipBytes: Uint8Array | null = null;

  constructor(
    root: HTMLElement,
    analyze: AnalyzePreview = analyzePreview,
    download: DownloadZip = downloadFile,
  ) {
    this.analyze = analyze;
    this.download = download;
    this.card = new GenerateShowCard(root);
    this.card.onEdit(() => {
      this.refreshDownload();
    });
    this.card.button.addEventListener("click", () => {
      void this.run();
    });
    this.card.download.addEventListener("click", () => {
      this.save();
    });
  }

  songSelected(song: Song): void {
    this.song = song;
    this.card.setUploaded(song.trackId === UPLOAD_TRACK_ID);
    this.card.show();
    this.card.markStale();
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
    const seconds = this.card.seconds();
    const start = this.card.startSeconds();
    const synced = this.card.sync.checked;
    const mode = modeFromSync(synced);
    this.card.setBusy(ANALYZING);
    try {
      const prepared = await this.analyze(song.previewUrl, seconds, start);
      this.card.setBusy(BUILDING);
      // Let the browser paint "Building light show…" before the files are written.
      await Promise.resolve();
      const frames = choreographPulse(prepared.analysis, { mode: mode });
      this.lightShow = frames;
      const slug = showSlug(song.artistName, song.trackName);
      const fseq = writeFseq(frames);
      const wav = writeWav([prepared.samples], prepared.sampleRate);
      this.built = {
        previewUrl: song.previewUrl,
        seconds: seconds,
        start: start,
        sync: synced,
      };
      this.zipName = `${slug}.zip`;
      this.zipBytes = buildShowZip(slug, fseq, wav);
      this.card.setReady(READY);
      this.refreshDownload();
      this.notify(mode, song);
    } catch {
      this.lightShow = null;
      this.zipBytes = null;
      this.built = null;
      this.card.setFailed(FAILED);
    } finally {
      this.busy = false;
    }
  }

  private save(): void {
    if (this.zipBytes === null) {
      return;
    }
    this.download(this.zipName, this.zipBytes);
  }

  private refreshDownload(): void {
    if (this.matchesBuilt()) {
      this.card.showDownload();
      return;
    }
    this.card.hideDownload();
  }

  private matchesBuilt(): boolean {
    const built = this.built;
    const song = this.song;
    if (built === null || song === null || this.zipBytes === null) {
      return false;
    }
    if (song.previewUrl !== built.previewUrl) {
      return false;
    }
    if (this.card.seconds() !== built.seconds) {
      return false;
    }
    if (this.card.startSeconds() !== built.start) {
      return false;
    }
    return this.card.sync.checked === built.sync;
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
