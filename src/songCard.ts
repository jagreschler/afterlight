import type { Song } from "./itunes";

export type SongCard = {
  show: (song: Song) => void;
};

export function mountSongCard(root: HTMLElement): SongCard {
  const card = document.createElement("article");
  card.className = "choice";
  card.setAttribute("aria-label", "Selected song");
  card.hidden = true;

  const image = document.createElement("img");
  image.alt = "";
  const text = document.createElement("div");
  const title = document.createElement("p");
  title.className = "choice-title";
  const artist = document.createElement("p");
  artist.className = "choice-artist";
  text.append(title, artist);
  card.append(image, text);
  root.replaceChildren(card);

  return {
    show(song: Song): void {
      image.src = song.artworkUrl;
      image.alt = `Artwork for ${song.trackName} by ${song.artistName}`;
      title.textContent = song.trackName;
      artist.textContent = song.artistName;
      card.hidden = false;
    },
  };
}
