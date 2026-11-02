import { searchSongs } from "./itunes";
import { mountPreviewPlayer } from "./previewPlayer";
import { mountPulseModePicker } from "./pulseModePicker";
import { mountSearchBar } from "./searchBar";
import { mountSongCard } from "./songCard";

const modeRoot = document.querySelector("#pulse-mode");
const searchRoot = document.querySelector("#search");
const cardRoot = document.querySelector("#selected-song");
const previewRoot = document.querySelector("#preview");

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

mountPulseModePicker(modeRoot);
const card = mountSongCard(cardRoot);
const preview = mountPreviewPlayer(previewRoot);

mountSearchBar(searchRoot, {
  search: searchSongs,
  onSelect(song) {
    card.show(song);
    preview.load(song.previewUrl);
  },
});
