import { afterEach, describe, expect, it } from "vitest";
import { loadRecipes, recipeFromShow, rememberRecipe, type Recipe, type RecipeStore } from "./recentHistory";
import type { Song } from "./itunes";
import { mountRecentHistory } from "./recentHistoryCard";

const TRACK_ID = 7;
const OTHER_ID = 8;
const TITLE = "Get Lucky";
const OTHER_TITLE = "Instant Crush";
const ARTIST = "Daft Punk";
const OTHER_ARTIST = "Daft Punk";
const PREVIEW = "https://example.com/preview.m4a";
const ART = "https://example.com/art.jpg";
const SECONDS = 30;
const START = 0;
const SYNCED = true;
const UNSYNCED = false;
const UPLOAD_ID = 0;
const BUTTON = ".recent-history button";
const TITLE_TEXT = ".recent-history .recent-title";
const ARTIST_TEXT = ".recent-history .recent-artist";
const HIDDEN = true;

afterEach(() => {
  document.body.replaceChildren();
});

describe("recent recipes", () => {
  it("keeps the five newest iTunes recipes and moves a repeat to the top", () => {
    const store = memory();
    rememberRecipe(store, recipe(TRACK_ID, TITLE, ARTIST, UNSYNCED));
    rememberRecipe(store, recipe(OTHER_ID, OTHER_TITLE, OTHER_ARTIST, UNSYNCED));
    rememberRecipe(store, recipe(3, "One", "A", UNSYNCED));
    rememberRecipe(store, recipe(4, "Two", "B", UNSYNCED));
    rememberRecipe(store, recipe(5, "Three", "C", UNSYNCED));
    rememberRecipe(store, recipe(6, "Four", "D", UNSYNCED));
    const again = recipe(TRACK_ID, TITLE, ARTIST, UNSYNCED);
    const saved = rememberRecipe(store, again);

    expect(saved).toHaveLength(5);
    expect(saved[0]).toEqual(again);
    expect(saved.some((item) => item.song.trackId === OTHER_ID)).toBe(false);
    expect(loadRecipes(store)).toEqual(saved);
  });

  it("keeps a song with different options as its own recipe", () => {
    const store = memory();
    rememberRecipe(store, recipe(TRACK_ID, TITLE, ARTIST, UNSYNCED));
    const saved = rememberRecipe(store, recipe(TRACK_ID, TITLE, ARTIST, SYNCED));

    expect(saved).toHaveLength(2);
    expect(saved[0]?.syncLights).toBe(SYNCED);
  });

  it("does not save an uploaded song", () => {
    const store = memory();
    const uploaded = recipeFromShow(song(UPLOAD_ID, "My Song", ""), SECONDS, START, UNSYNCED);

    expect(uploaded).toBeNull();
    expect(loadRecipes(store)).toEqual([]);
  });

  it("treats broken storage and bad data as an empty list", () => {
    expect(loadRecipes(throwingStore())).toEqual([]);
    expect(rememberRecipe(throwingStore(), recipe(TRACK_ID, TITLE, ARTIST, UNSYNCED))).toEqual([]);
    expect(loadRecipes(fixedStore("{"))).toEqual([]);
    expect(loadRecipes(fixedStore(JSON.stringify([{ trackId: "nope" }])))).toEqual([]);
  });

  it("hides the list until there is a recipe, then restores it on click", () => {
    const picked: Recipe[] = [];
    const view = mountRecentHistory(root(), [], (recipe) => {
      picked.push(recipe);
    });

    expect(view.root.hidden).toBe(HIDDEN);
    expect(view.root.querySelector(BUTTON)).toBeNull();

    const first = recipe(TRACK_ID, TITLE, ARTIST, UNSYNCED);
    const second = recipe(OTHER_ID, OTHER_TITLE, OTHER_ARTIST, SYNCED);
    view.show([second, first]);

    const titles = view.root.querySelectorAll(TITLE_TEXT);
    const artists = view.root.querySelectorAll(ARTIST_TEXT);
    expect(view.root.hidden).toBe(false);
    expect(titles[0]?.textContent).toBe(OTHER_TITLE);
    expect(artists[0]?.textContent).toBe(OTHER_ARTIST);
    const button = view.root.querySelector(BUTTON);
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error("missing recent button");
    }
    button.click();

    expect(picked).toEqual([second]);
  });
});

function recipe(trackId: number, title: string, artist: string, syncLights: boolean): Recipe {
  return {
    song: song(trackId, title, artist),
    seconds: SECONDS,
    start: START,
    syncLights: syncLights,
  };
}

function song(trackId: number, title: string, artist: string): Song {
  return {
    trackId: trackId,
    trackName: title,
    artistName: artist,
    artworkUrl: ART,
    previewUrl: PREVIEW,
  };
}

function root(): HTMLElement {
  const element = document.createElement("section");
  document.body.append(element);
  return element;
}

function memory(): RecipeStore {
  const items = new Map<string, string>();
  return {
    getItem(key: string) {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      items.set(key, value);
    },
  };
}

function fixedStore(value: string): RecipeStore {
  return {
    getItem() {
      return value;
    },
    setItem() {
      return undefined;
    },
  };
}

function throwingStore(): RecipeStore {
  return {
    getItem() {
      throw new Error("storage unavailable");
    },
    setItem() {
      throw new Error("storage unavailable");
    },
  };
}
