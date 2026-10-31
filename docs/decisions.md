# Decisions

Short log of choices for this rebuild. The original Afterlight was a React app on TanStack Start. That source is gone; this repo starts over.

## 2026-10-31 — Vite and plain TypeScript

The first version used React. This one uses Vite with plain TypeScript and no UI framework. The goal is code a reader can explain line by line, with few dependencies.

## 2026-10-31 — Browser only, no server

Analysis, file writing, and the zip all happen in the browser. There is no app server and no database. Anything that needs outside data, such as a song search, has to work from the page itself.

## 2026-10-31 — GitHub Pages

The built site is a GitHub Pages project site at `/afterlight/`. Vite's `base` is that path so asset URLs resolve. A workflow deploys on push to `main`. Pages must use the **GitHub Actions** source in the repository settings before that workflow can publish.
