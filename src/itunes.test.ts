import { afterEach, describe, expect, it, vi } from "vitest";
import { searchSongs } from "./itunes";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchSongs", () => {
  it("maps iTunes rows to songs and skips rows that cannot be played", async () => {
    const fetchMock = stubFetch({
      resultCount: 3,
      results: [
        {
          wrapperType: "track",
          kind: "song",
          trackId: 617154366,
          trackName: "Get Lucky",
          artistName: "Daft Punk",
          collectionName: "Random Access Memories",
          artworkUrl100: "https://example.com/art.jpg",
          previewUrl: "https://example.com/preview.m4a",
        },
        {
          trackId: 2,
          trackName: "No Preview",
          artistName: "Someone",
          artworkUrl100: "https://example.com/nope.jpg",
        },
        {
          trackId: 3,
          trackName: "",
          artistName: "Missing Name",
          artworkUrl100: "https://example.com/empty.jpg",
          previewUrl: "https://example.com/empty.m4a",
        },
      ],
    });

    const songs = await searchSongs("get lucky");

    expect(songs).toEqual([
      {
        trackId: 617154366,
        trackName: "Get Lucky",
        artistName: "Daft Punk",
        artworkUrl: "https://example.com/art.jpg",
        previewUrl: "https://example.com/preview.m4a",
      },
    ]);

    const requested = fetchMock.mock.calls[0]?.[0];
    if (!(requested instanceof URL)) {
      throw new Error("searchSongs should call fetch with a URL");
    }
    expect(requested.origin).toBe("https://itunes.apple.com");
    expect(requested.pathname).toBe("/search");
    expect(requested.searchParams.get("term")).toBe("get lucky");
    expect(requested.searchParams.get("entity")).toBe("song");
    expect(requested.searchParams.get("limit")).toBe("8");
  });

  it("returns no songs when the payload is not a result list", async () => {
    stubFetch({ resultCount: 0 });

    await expect(searchSongs("zzzz")).resolves.toEqual([]);
  });

  it("throws when iTunes responds with an error status", async () => {
    stubFetch({ errorMessage: "nope" }, 500);

    await expect(searchSongs("get lucky")).rejects.toThrow("iTunes search failed (500)");
  });
});

function stubFetch(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
