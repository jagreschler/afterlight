import { searchSongs } from "./itunes";
import { mountSearchBar } from "./searchBar";

const searchRoot = document.querySelector("#search");

if (!(searchRoot instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #search element.");
}

mountSearchBar(searchRoot, {
  search: searchSongs,
  onSelect() {
    // Later tickets start a show from the song passed to this callback.
  },
});
