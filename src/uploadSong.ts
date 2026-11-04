import type { Song } from "./itunes";

const NOTE =
  "Apple previews are only 30 seconds. Upload your own song file for longer shows. Longer lengths are coming soon.";

export function mountUploadSong(root: HTMLElement, onSong: (song: Song) => void): void {
  root.classList.add("upload-song");

  const note = document.createElement("p");
  note.className = "upload-note";
  note.textContent = NOTE;

  const label = document.createElement("label");
  label.className = "upload-button";
  const caption = document.createElement("span");
  caption.textContent = "Upload a song";
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "audio/*";
  label.append(caption, input);

  let currentUrl = "";
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file === undefined) {
      return;
    }
    if (currentUrl.length > 0) {
      URL.revokeObjectURL(currentUrl);
    }
    currentUrl = URL.createObjectURL(file);
    onSong(songFromFile(file, currentUrl));
  });

  root.replaceChildren(note, label);
}

function songFromFile(file: File, previewUrl: string): Song {
  return {
    trackId: 0,
    trackName: baseName(file.name),
    artistName: "",
    artworkUrl: "",
    previewUrl: previewUrl,
  };
}

function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot <= 0) {
    return fileName;
  }
  return fileName.slice(0, dot);
}
