import { createDebouncedSearch } from "./debouncedSearch";
import type { Song } from "./itunes";
import { SearchBarCard } from "./searchBarCard";

export type SearchBarOptions = {
  search: (query: string) => Promise<Song[]>;
  onSelect: (song: Song) => void;
};

export function mountSearchBar(root: HTMLElement, options: SearchBarOptions): void {
  const card = new SearchBarCard(root);
  let songs: Song[] = [];
  let activeIndex = 0;

  const timing = createDebouncedSearch({
    async search(query) {
      card.setStatus("Searching…");
      return options.search(query);
    },
    onResults(found) {
      songs = found;
      activeIndex = 0;
      bindPicks(card.showResults(found));
    },
    onError() {
      forgetSongs();
      card.hideList();
      card.setStatus("Search failed. Try again.");
    },
  });

  function forgetSongs(): void {
    songs = [];
    activeIndex = 0;
  }

  function bindPicks(buttons: HTMLButtonElement[]): void {
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        choose(index);
      });
      button.addEventListener("mouseenter", () => {
        activeIndex = index;
        card.setActive(index);
      });
    });
  }

  function choose(index: number): void {
    const song = songs[index];
    if (song === undefined) {
      return;
    }

    timing.cancel();
    card.input.value = `${song.trackName} — ${song.artistName}`;
    forgetSongs();
    card.hideList();
    card.setStatus(null);
    options.onSelect(song);
  }

  function move(delta: number): void {
    if (songs.length === 0) {
      return;
    }

    const next = activeIndex + delta;
    if (next < 0 || next >= songs.length) {
      return;
    }

    activeIndex = next;
    card.setActive(activeIndex);
  }

  card.input.addEventListener("input", () => {
    forgetSongs();
    card.hideList();
    card.setStatus(null);
    timing.setQuery(card.input.value);
  });

  card.input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
      return;
    }
    if (event.key === "Enter") {
      if (songs.length === 0) {
        return;
      }
      event.preventDefault();
      choose(activeIndex);
      return;
    }
    if (event.key === "Escape" && !card.list.hidden) {
      event.preventDefault();
      timing.cancel();
      forgetSongs();
      card.hideList();
      card.setStatus(null);
    }
  });
}
