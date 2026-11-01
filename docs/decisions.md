# Decisions

Short log of choices for this rebuild. The original Afterlight was a React app on TanStack Start. That source is gone; this repo starts over.

## 2026-10-31 — Vite and plain TypeScript

The first version used React. This one uses Vite with plain TypeScript and no UI framework. The goal is code a reader can explain line by line, with few dependencies.

## 2026-10-31 — Browser only, no server

Analysis, file writing, and the zip all happen in the browser. There is no app server and no database. Anything that needs outside data, such as a song search, has to work from the page itself.

## 2026-10-31 — GitHub Pages

The built site is a GitHub Pages project site at `/afterlight/`. Vite's `base` is that path so asset URLs resolve. A workflow deploys on push to `main`. Pages must use the **GitHub Actions** source in the repository settings before that workflow can publish.

## 2026-10-31 — Don't search on every keystroke

The search box waits 300 ms after typing stops, and it does not ask iTunes until the query is at least 2 characters. A request on every letter would spam iTunes.

## 2026-10-31 — One boundary for the music catalog

`src/itunes.ts` is the only module that knows about Apple. The rest of the app sees a song: track name, artist, artwork URL, 30-second preview URL, and track id.

## 2026-10-31 — Shows are 30 seconds

A show uses the iTunes 30-second preview. Uploaded audio, when that exists, will be trimmed to 30 seconds. Longer shows get boring.

## 2026-11-01 — The preview player is separate from the song card

Play and pause live in their own player, not on the song card. That player wraps one audio element and reports the playhead and the end of the clip. A later light show can listen to those same events and stay in sync with the preview.

## 2026-11-01 — Analyze the preview up front, for pulse first

The 30-second preview is analyzed once, before playback, not from a live microphone. The result is 50 frames per second (one every 20 ms): bass, mids, and treble, plus the times of the beats. Pulse, lights flashing on those beats, is the first style. The others can wait.

## 2026-11-01 — Pulse flashes mapped lights, then lets them fade

Pulse writes one row of 200 channel levels (0–255) per analysis frame. Together mode flashes every mapped light on a beat. Split mode, the default, flashes headlights on a bass beat and turn signals on a treble beat. The lit channels then decay.

Model 3 and Model Y use that same 200-channel file. Tesla's guide (teslamotors/light-show) says one show plays on every supported car, and the xLights project authors it on the "Model S" controller with MaxChannels 200. Headlights are xLights 1–4 (left and right outer and inner main beams). Turn signals are xLights 13–14 in front and 23–24 in the rear. The grid index is the xLights number minus 1.

On Model 3/Y, xLights 7–12 (channels 4, 5, and 6) share one bulb, and aux park plus side markers (xLights 17–20) share another. Model 3 Standard Range+ has no front fog and no aux park. Pulse does not drive those. Outer main beam ramps on a reflector lamp and is on/off on a projector lamp, so the fade still needs a look on Jason's cars.
