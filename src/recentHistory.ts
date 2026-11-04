import type { Song } from "./itunes";

const STORAGE_KEY = "afterlight.recent";
const LIMIT = 5;
const UPLOAD_ID = 0;

export type Recipe = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl: string;
  previewUrl: string;
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
  if (recipe.trackId === UPLOAD_ID) {
    return current;
  }
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

export function songFromRecipe(recipe: Recipe): Song {
  return {
    trackId: recipe.trackId,
    trackName: recipe.trackName,
    artistName: recipe.artistName,
    artworkUrl: recipe.artworkUrl,
    previewUrl: recipe.previewUrl,
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
    const recipe = recipeFrom(item);
    if (recipe !== null) {
      recipes.push(recipe);
    }
  }
  return recipes;
}

function recipeFrom(value: unknown): Recipe | null {
  if (!isRecord(value)) {
    return null;
  }
  const trackId = finiteNumber(value.trackId);
  const seconds = finiteNumber(value.seconds);
  const start = finiteNumber(value.start);
  if (trackId === null || trackId === UPLOAD_ID || seconds === null || start === null) {
    return null;
  }
  if (!nonEmpty(value.trackName) || !nonEmpty(value.artistName) || !nonEmpty(value.previewUrl)) {
    return null;
  }
  if (typeof value.artworkUrl !== "string" || typeof value.syncLights !== "boolean") {
    return null;
  }
  return {
    trackId: trackId,
    trackName: value.trackName,
    artistName: value.artistName,
    artworkUrl: value.artworkUrl,
    previewUrl: value.previewUrl,
    seconds: seconds,
    start: start,
    syncLights: value.syncLights,
  };
}

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function sameRecipe(left: Recipe, right: Recipe): boolean {
  return (
    left.trackId === right.trackId &&
    left.seconds === right.seconds &&
    left.start === right.start &&
    left.syncLights === right.syncLights
  );
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
