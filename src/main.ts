import { searchSongs } from "./itunes";
import { mountPreviewPlayer } from "./previewPlayer";
import { mountPulseModePicker } from "./pulseModePicker";
import { mountSearchBar } from "./searchBar";
import { mountShowFlow } from "./showFlow";
import { mountSongCard } from "./songCard";

const searchRoot = document.querySelector("#search");
const cardRoot = document.querySelector("#selected-song");
const previewRoot = document.querySelector("#preview");
const generateRoot = document.querySelector("#generate");
const modeRoot = document.querySelector("#pulse-mode");

if (!(generateRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #generate element.");
}
if (!(modeRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #pulse-mode element.");
}
if (!(searchRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #search element.");
}
if (!(cardRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #selected-song element.");
}
if (!(previewRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #preview element.");
}

const picker = mountPulseModePicker(modeRoot);
const flow = mountShowFlow(generateRoot, picker);
const card = mountSongCard(cardRoot);
const preview = mountPreviewPlayer(previewRoot);

mountSearchBar(searchRoot, {
  search: searchSongs,
  onSelect(song) {
    card.show(song);
    preview.load(song.previewUrl);
    flow.songSelected();
  },
});
