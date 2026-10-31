// The only module that talks to Apple. The rest of the app sees Song values.

const SEARCH_URL = "https://itunes.apple.com/search";
const MAX_RESULTS = 8;

export type Song = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl: string;
  previewUrl: string;
};

export async function searchSongs(query: string): Promise<Song[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("term", query);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", String(MAX_RESULTS));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`iTunes search failed (${response.status})`);
  }

  const body: unknown = await response.json();
  return songsFromBody(body);
}

function songsFromBody(body: unknown): Song[] {
  if (!isRecord(body) || !Array.isArray(body.results)) {
    return [];
  }

  const songs: Song[] = [];
  for (const row of body.results) {
    const song = songFromRow(row);
    if (song !== null) {
      songs.push(song);
    }
  }
  return songs;
}

function songFromRow(row: unknown): Song | null {
  if (!isRecord(row)) {
    return null;
  }

  const trackId = row.trackId;
  const trackName = row.trackName;
  const artistName = row.artistName;
  const artworkUrl = row.artworkUrl100;
  const previewUrl = row.previewUrl;

  if (typeof trackId !== "number" || !Number.isFinite(trackId)) {
    return null;
  }
  if (!nonEmptyString(trackName) || !nonEmptyString(artistName)) {
    return null;
  }
  if (!nonEmptyString(artworkUrl) || !nonEmptyString(previewUrl)) {
    return null;
  }

  return { trackId, trackName, artistName, artworkUrl, previewUrl };
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
