import { searchSongs } from "./itunes";
import { mountSearchBar } from "./searchBar";
import { mountSongCard } from "./songCard";

const searchRoot = document.querySelector("#search");
const cardRoot = document.querySelector("#selected-song");

if (!(searchRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #search element.");
}
if (!(cardRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #selected-song element.");
}

const card = mountSongCard(cardRoot);

mountSearchBar(searchRoot, {
  search: searchSongs,
  onSelect(song) {
    card.show(song);
  },
});
