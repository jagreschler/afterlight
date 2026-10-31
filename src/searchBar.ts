import type { Song } from "./itunes";

// Wait until typing pauses, and don't call iTunes for a single letter.
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export type SearchBarOptions = {
  search: (query: string) => Promise<Song[]>;
  onSelect: (song: Song) => void;
};

export function mountSearchBar(root: HTMLElement, options: SearchBarOptions): void {
  const label = document.createElement("label");
  label.htmlFor = "song-search";
  label.textContent = "Find a song";

  const input = document.createElement("input");
  input.id = "song-search";
  input.type = "search";
  input.placeholder = "Song or artist";
  input.autocomplete = "off";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", "song-results");

  const list = document.createElement("ul");
  list.id = "song-results";
  list.className = "results";
  list.setAttribute("role", "listbox");
  list.hidden = true;

  const status = document.createElement("p");
  status.className = "status";
  status.setAttribute("aria-live", "polite");
  status.hidden = true;

  const choice = document.createElement("article");
  choice.className = "choice";
  choice.setAttribute("aria-label", "Selected song");
  choice.hidden = true;
  const choiceImage = document.createElement("img");
  choiceImage.alt = "";
  const choiceText = document.createElement("div");
  const choiceTitle = document.createElement("p");
  choiceTitle.className = "choice-title";
  const choiceArtist = document.createElement("p");
  choiceArtist.className = "choice-artist";
  choiceText.append(choiceTitle, choiceArtist);
  choice.append(choiceImage, choiceText);

  root.replaceChildren(label, input, list, status, choice);
  root.classList.add("search");

  let requestId = 0;
  let timer: number | undefined;
  let songs: Song[] = [];
  let activeIndex = 0;

  function hideList(): void {
    songs = [];
    activeIndex = 0;
    list.replaceChildren();
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function invalidate(): void {
    requestId += 1;
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  }

  function paintActive(): void {
    const optionButtons = list.querySelectorAll<HTMLElement>('[role="option"]');
    optionButtons.forEach((option, index) => {
      const selected = index === activeIndex;
      option.setAttribute("aria-selected", selected ? "true" : "false");
      if (selected) {
        input.setAttribute("aria-activedescendant", option.id);
      }
    });
  }

  function showResults(found: Song[]): void {
    songs = found;
    list.replaceChildren();

    if (found.length === 0) {
      hideList();
      status.hidden = false;
      status.textContent = "No matches.";
      return;
    }

    status.hidden = true;
    activeIndex = 0;

    for (const [index, song] of found.entries()) {
      list.append(optionButton(song, index));
    }

    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    paintActive();
  }

  function optionButton(song: Song, index: number): HTMLLIElement {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.id = `song-option-${index}`;
    button.setAttribute("role", "option");

    const image = document.createElement("img");
    image.src = song.artworkUrl;
    image.alt = "";

    const text = document.createElement("span");
    const title = document.createElement("span");
    title.className = "option-title";
    title.textContent = song.trackName;
    const artist = document.createElement("span");
    artist.className = "option-artist";
    artist.textContent = song.artistName;
    text.append(title, artist);

    button.append(image, text);
    button.addEventListener("click", () => {
      choose(index);
    });
    button.addEventListener("mouseenter", () => {
      activeIndex = index;
      paintActive();
    });

    item.append(button);
    return item;
  }

  function choose(index: number): void {
    const song = songs[index];
    if (song === undefined) {
      return;
    }

    invalidate();
    choiceImage.src = song.artworkUrl;
    choiceImage.alt = `Artwork for ${song.trackName} by ${song.artistName}`;
    choiceTitle.textContent = song.trackName;
    choiceArtist.textContent = song.artistName;
    choice.hidden = false;
    input.value = `${song.trackName} — ${song.artistName}`;
    hideList();
    status.hidden = true;
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
    paintActive();
  }

  async function runSearch(query: string, id: number): Promise<void> {
    status.hidden = false;
    status.textContent = "Searching…";

    let found: Song[];
    try {
      found = await options.search(query);
    } catch {
      if (id !== requestId) {
        return;
      }
      hideList();
      status.hidden = false;
      status.textContent = "Search failed. Try again.";
      return;
    }

    if (id !== requestId) {
      return;
    }

    showResults(found);
  }

  function onInput(): void {
    invalidate();
    hideList();
    status.hidden = true;

    const query = input.value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      return;
    }

    const id = requestId;
    timer = window.setTimeout(() => {
      timer = undefined;
      if (id !== requestId) {
        return;
      }

      const current = input.value.trim();
      if (current.length < MIN_QUERY_LENGTH) {
        return;
      }

      void runSearch(current, id);
    }, DEBOUNCE_MS);
  }

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", (event) => {
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
    if (event.key === "Escape" && !list.hidden) {
      event.preventDefault();
      invalidate();
      hideList();
      status.hidden = true;
    }
  });
}
