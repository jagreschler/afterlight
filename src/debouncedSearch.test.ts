import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDebouncedSearch } from "./debouncedSearch";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("debounced search", () => {
  it("waits 300 ms after typing stops before searching", async () => {
    const search = vi.fn(async () => [] as string[]);
    const timing = createDebouncedSearch({
      search,
      onResults() {},
      onError() {},
    });

    timing.setQuery("ab");
    await vi.advanceTimersByTimeAsync(299);
    expect(search).not.toHaveBeenCalled();

    timing.setQuery("abc");
    await vi.advanceTimersByTimeAsync(299);
    expect(search).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith("abc");
  });

  it("does not search until the query has at least two characters", async () => {
    const search = vi.fn(async () => [] as string[]);
    const timing = createDebouncedSearch({
      search,
      onResults() {},
      onError() {},
    });

    timing.setQuery("a");
    await vi.advanceTimersByTimeAsync(300);
    expect(search).not.toHaveBeenCalled();

    timing.setQuery(" a ");
    await vi.advanceTimersByTimeAsync(300);
    expect(search).not.toHaveBeenCalled();

    timing.setQuery("  ab  ");
    await vi.advanceTimersByTimeAsync(300);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith("ab");
  });

  it("keeps the newer matches when an older search returns last", async () => {
    const first = deferred<string[]>();
    const second = deferred<string[]>();
    const seen: string[][] = [];
    const timing = createDebouncedSearch({
      async search(query: string) {
        if (query === "ab") {
          return first.promise;
        }
        if (query === "abc") {
          return second.promise;
        }
        return [];
      },
      onResults(results) {
        seen.push(results);
      },
      onError() {},
    });

    timing.setQuery("ab");
    await vi.advanceTimersByTimeAsync(300);
    timing.setQuery("abc");
    await vi.advanceTimersByTimeAsync(300);

    second.resolve(["newer"]);
    await vi.advanceTimersByTimeAsync(0);
    expect(seen).toEqual([["newer"]]);

    first.resolve(["older"]);
    await vi.advanceTimersByTimeAsync(0);
    expect(seen).toEqual([["newer"]]);
  });
});

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolvePromise: (value: T) => void = () => {
    throw new Error("deferred promise resolved before it was created");
  };
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return {
    promise,
    resolve: (value) => {
      resolvePromise(value);
    },
  };
}
