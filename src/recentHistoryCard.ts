import type { Recipe } from "./recentHistory";

const LABEL = "Recent";

export type RecentList = {
  root: HTMLElement;
  show(recipes: Recipe[]): void;
};

export function mountRecentHistory(
  root: HTMLElement,
  recipes: Recipe[],
  onPick: (recipe: Recipe) => void,
): RecentList {
  root.classList.add("recent-history");
  show(root, recipes, onPick);
  return {
    root: root,
    show(next: Recipe[]): void {
      show(root, next, onPick);
    },
  };
}

function show(root: HTMLElement, recipes: Recipe[], onPick: (recipe: Recipe) => void): void {
  root.replaceChildren();
  root.hidden = recipes.length === 0;
  if (recipes.length === 0) {
    return;
  }
  const label = document.createElement("p");
  label.className = "recent-label";
  label.textContent = LABEL;
  root.append(label);
  for (const recipe of recipes) {
    const button = buttonFor(recipe, onPick);
    root.append(button);
  }
}

function buttonFor(recipe: Recipe, onPick: (recipe: Recipe) => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  const title = document.createElement("span");
  title.className = "recent-title";
  title.textContent = recipe.song.trackName;
  const artist = document.createElement("span");
  artist.className = "recent-artist";
  artist.textContent = recipe.song.artistName;
  button.append(title, artist);
  button.addEventListener("click", () => {
    onPick(recipe);
  });
  return button;
}
