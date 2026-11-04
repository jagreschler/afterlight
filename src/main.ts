import type { Song } from "./itunes";
import { searchSongs } from "./itunes";
import { mountPreviewPlayer } from "./previewPlayer";
import { mountSearchBar } from "./searchBar";
import { mountShowFlow } from "./showFlow";
import { mountSongCard } from "./songCard";
import { mountUploadSong } from "./uploadSong";

const searchRoot = document.querySelector("#search");
const uploadRoot = document.querySelector("#upload");
const cardRoot = document.querySelector("#selected-song");
const previewRoot = document.querySelector("#preview");
const generateRoot = document.querySelector("#generate");

if (!(generateRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #generate element.");
}
if (!(searchRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #search element.");
}
if (!(uploadRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #upload element.");
}
if (!(cardRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #selected-song element.");
}
if (!(previewRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #preview element.");
}

const flow = mountShowFlow(generateRoot);
const card = mountSongCard(cardRoot);
const preview = mountPreviewPlayer(previewRoot);

function chooseSong(song: Song): void {
  card.show(song);
  preview.load(song.previewUrl);
  flow.songSelected(song);
}

mountSearchBar(searchRoot, {
  search: searchSongs,
  onSelect: chooseSong,
});
mountUploadSong(uploadRoot, chooseSong);
