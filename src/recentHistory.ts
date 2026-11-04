import type { Song } from "./itunes";

const STORAGE_KEY = "afterlight.recent";
const LIMIT = 5;

export type Recipe = {
  song: Song;
  seconds: number;
  start: number;
  syncLights: boolean;
};

export type RecipeStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function loadRecipes(store: RecipeStore): Recipe[] {
  try {
    return recipesFrom(store.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function rememberRecipe(store: RecipeStore, recipe: Recipe): Recipe[] {
  const current = loadRecipes(store);
  const next = [recipe];
  for (const item of current) {
    if (!sameRecipe(item, recipe)) {
      next.push(item);
    }
  }
  const kept = next.slice(0, LIMIT);
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(kept));
  } catch {
    return current;
  }
  return kept;
}

export function recipeFromShow(
  song: Song,
  seconds: number,
  start: number,
  syncLights: boolean,
): Recipe | null {
  if (song.trackId === 0) {
    return null;
  }
  return {
    song: song,
    seconds: seconds,
    start: start,
    syncLights: syncLights,
  };
}

function recipesFrom(raw: string | null): Recipe[] {
  if (raw === null) {
    return [];
  }
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }
  const recipes: Recipe[] = [];
  for (const item of parsed) {
    if (isRecipe(item)) {
      recipes.push(item);
    }
  }
  return recipes;
}

function isRecipe(value: unknown): value is Recipe {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return "song" in value && "seconds" in value && "start" in value && "syncLights" in value;
}

function sameRecipe(left: Recipe, right: Recipe): boolean {
  return (
    left.song.trackId === right.song.trackId &&
    left.seconds === right.seconds &&
    left.start === right.start &&
    left.syncLights === right.syncLights
  );
}
