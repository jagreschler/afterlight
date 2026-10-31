import type { Song } from "./itunes";

export class SearchBarCard {
  readonly label: HTMLLabelElement;
  readonly input: HTMLInputElement;
  readonly list: HTMLUListElement;
  readonly status: HTMLParagraphElement;

  constructor(root: HTMLElement) {
    this.label = document.createElement("label");
    this.label.htmlFor = "song-search";
    this.label.textContent = "Find a song";

    this.input = document.createElement("input");
    this.input.id = "song-search";
    this.input.type = "search";
    this.input.placeholder = "Song or artist";
    this.input.autocomplete = "off";
    this.input.setAttribute("role", "combobox");
    this.input.setAttribute("aria-autocomplete", "list");
    this.input.setAttribute("aria-expanded", "false");
    this.input.setAttribute("aria-controls", "song-results");

    this.list = document.createElement("ul");
    this.list.id = "song-results";
    this.list.className = "results";
    this.list.setAttribute("role", "listbox");
    this.list.hidden = true;

    this.status = document.createElement("p");
    this.status.className = "status";
    this.status.setAttribute("aria-live", "polite");
    this.status.hidden = true;

    root.replaceChildren(this.label, this.input, this.list, this.status);
    root.classList.add("search");
  }

  showResults(songs: Song[]): HTMLButtonElement[] {
    this.list.replaceChildren();

    if (songs.length === 0) {
      this.hideList();
      this.setStatus("No matches.");
      return [];
    }

    const buttons: HTMLButtonElement[] = [];
    for (const [index, song] of songs.entries()) {
      const row = this.optionRow(song, index);
      this.list.append(row.item);
      buttons.push(row.button);
    }

    this.setStatus(null);
    this.list.hidden = false;
    this.input.setAttribute("aria-expanded", "true");
    this.setActive(0);
    return buttons;
  }

  hideList(): void {
    this.list.replaceChildren();
    this.list.hidden = true;
    this.input.setAttribute("aria-expanded", "false");
    this.input.removeAttribute("aria-activedescendant");
  }

  setStatus(message: string | null): void {
    if (message === null) {
      this.status.hidden = true;
      return;
    }

    this.status.hidden = false;
    this.status.textContent = message;
  }

  setActive(index: number): void {
    const options = this.list.querySelectorAll<HTMLElement>('[role="option"]');
    options.forEach((option, optionIndex) => {
      const selected = optionIndex === index;
      option.setAttribute("aria-selected", selected ? "true" : "false");
      if (selected) {
        this.input.setAttribute("aria-activedescendant", option.id);
      }
    });
  }

  private optionRow(song: Song, index: number): { item: HTMLLIElement; button: HTMLButtonElement } {
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
    item.append(button);
    return { item, button };
  }
}
