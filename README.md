# Afterlight

Afterlight is a browser-only Tesla light show generator. You pick a song, the app analyzes it in the browser, and it writes a Tesla-compatible `.fseq` file plus a matching WAV, zipped for a USB stick.

The original app was React on TanStack Start. This rebuild uses Vite and plain TypeScript so the code stays small enough to read line by line. The home page can search the iTunes catalog. Analysis and export are not built yet.

## Requirements

Node.js 22 (see `.nvmrc`).

## Run

```bash
npm ci
npm run dev
```

Vite serves the app under `/afterlight/`, the same path GitHub Pages will use. Open the local URL it prints.

## Test

```bash
npm test
```

## Typecheck

```bash
npm run typecheck
```

## Build

```bash
npm run build
```

The static site is written to `dist/`. Preview that build with `npm run preview`.

## GitHub Pages

Pushes to `main` build the site and deploy it with the "Deploy GitHub Pages" workflow. In the repository settings, open **Pages** and set the source to **GitHub Actions**. The site is a project page, so the public URL ends in `/afterlight/`.

Why the stack looks like this: [docs/decisions.md](docs/decisions.md).
