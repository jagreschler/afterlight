// Wait until typing pauses, skip one-letter queries, and drop answers that
// belong to an older query.

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export type DebouncedSearch = {
  setQuery: (value: string) => void;
  cancel: () => void;
};

export type DebouncedSearchOptions<Result> = {
  search: (query: string) => Promise<Result[]>;
  onResults: (results: Result[]) => void;
  onError: () => void;
};

export function createDebouncedSearch<Result>(
  options: DebouncedSearchOptions<Result>,
): DebouncedSearch {
  let requestId = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function invalidate(): void {
    requestId += 1;
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  async function run(query: string, id: number): Promise<void> {
    try {
      const results = await options.search(query);
      if (id !== requestId) {
        return;
      }
      options.onResults(results);
    } catch {
      if (id !== requestId) {
        return;
      }
      options.onError();
    }
  }

  return {
    setQuery(value: string): void {
      invalidate();

      const query = value.trim();
      if (query.length < MIN_QUERY_LENGTH) {
        return;
      }

      const id = requestId;
      timer = setTimeout(() => {
        timer = undefined;
        if (id !== requestId) {
          return;
        }
        void run(query, id);
      }, DEBOUNCE_MS);
    },

    cancel: invalidate,
  };
}
