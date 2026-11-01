import { searchSongs } from "./itunes";
import { mountPreviewPlayer } from "./previewPlayer";
import { mountSearchBar } from "./searchBar";
import { mountSongCard } from "./songCard";

const searchRoot = document.querySelector("#search");
const cardRoot = document.querySelector("#selected-song");
const previewRoot = document.querySelector("#preview");

if (!(searchRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #search element.");
}
if (!(cardRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #selected-song element.");
}
if (!(previewRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #preview element.");
}

const card = mountSongCard(cardRoot);
const preview = mountPreviewPlayer(previewRoot);

mountSearchBar(searchRoot, {
  search: searchSongs,
  onSelect(song) {
    card.show(song);
    preview.load(song.previewUrl);
  },
});
