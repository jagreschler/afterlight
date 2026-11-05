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

## 2026-11-02 — One click generates, after the song is chosen

Before a song is picked, the page is only the search box. After a song is picked, the preview sits under the search, then one row: a "Sync all lights" checkbox and a compact "Generate & Download" button. Unchecked means split; checked means together. A checkbox with that fixed label replaced the earlier pair of Split and Together buttons. The choice stays if the user picks another song.

That click is the single generate action. It reports the style and the song. Later, the button will disable and show progress text, then the browser will download a zip of lightshow.fseq, lightshow.wav, and a short USB note. Analysis and that download are not built yet.

## 2026-11-03 — Generate analyzes the preview, then builds the pulse grid

Clicking Generate & Download analyzes the 30-second preview, then builds the pulse grid for split or together. The button stays disabled and reads "Analyzing song…", then "Building light show…", then returns to normal. If that fails, it shows a short error and can be clicked again. The grid stays in memory. The zip of lightshow.fseq, lightshow.wav, and a USB note is still a later step.

## 2026-11-03 — FSEQ writing is its own module

`src/fseqWriter.ts` turns a light grid into an uncompressed FSEQ 2.0 file. It is separate from the page so the format stays easy to check. Tesla's validator wants the magic `PSEQ`, version 2.0, 200 channels, a 20 ms step, and no compression. The page does not download the file yet.

## 2026-11-03 — WAV writing is its own module

`src/wavWriter.ts` turns float samples into a 16-bit PCM WAV file. Tesla accepts WAV, and uncompressed PCM has a length that matches the FSEQ frame for frame. It stays separate from the page. The download is still a later step.

## 2026-11-03 — The USB package is a zip of three files

`src/showPackage.ts` packs a `.fseq`, a `.wav`, and a short README into one zip. The two show files share a slug of the artist and song, such as `the-eagles-hotel-california.fseq`, because Tesla matches the file names and allows more than one show on a drive. The note tells you to format the stick as exFAT or FAT32, put both files in a root folder named LightShow, and start the show from Toybox. fflate builds the zip so we do not hand-write the format. The button does not download it yet.

## 2026-11-03 — Generate & Download saves the zip

The button now analyzes the preview, builds the pulse grid, writes the FSEQ and WAV from that same audio, and downloads one zip. The browser uses a short-lived link so the file name is the song slug. The button shows progress while that runs, then returns to normal. The zip is the USB package. Nothing else on the page changed.

## 2026-11-04 — A local song file uses the same show path

Apple previews are only 30 seconds. Next to search, the page can take a local audio file. The file stays in the browser: it plays in the preview, and Generate & Download builds the show from it through the same analyze, FSEQ, WAV, and zip path. For now that show still uses only the first 30 seconds. The download name is the file name without its extension, slugified. Uploads open the way to longer shows later.

## 2026-11-04 — Uploads can be 30, 45, or 60 seconds

Apple previews are only 30 seconds, so the length choice stays disabled at 30 for a catalog song. An uploaded file, the song with no catalog id, can be 30, 45, or 60 seconds from the start. The same trim and analyze path builds the show. A file shorter than the choice is used whole. A start point comes later.

## 2026-11-04 — An upload can start later in the song

Apple previews stay a fixed 30 seconds from the beginning, so Start at stays disabled at 0. An uploaded file can start at a chosen second, then run for the chosen length. The same trim takes that window. If the window runs past the end of the file, the show uses whatever audio is left.

## 2026-11-04 — Light preview spike uses SVG

This is a spike, not the finished preview. Later, Generate will animate a Tesla picture in time with the song. SVG wins over canvas: the show only drives a handful of headlights and turn signals, each one is a shape in the page, and a test can read whether that shape is on. Canvas would need a bitmap or a fake drawing context, which the test DOM does not provide. Changing a few opacities every 20 ms is cheap, and the picture scales with the page. The spike is not wired into the page yet.

## 2026-11-04 — Generate and Download are separate

The button now says Generate. It still analyzes the song and builds the zip, but it does not save the file. Download appears beside it only after that build. It stays visible while the song, length, start, and sync match that Generate, and hides when any of them differs. Changing a setting back shows it again, so there is no Reset button. The light preview will sit between those two steps. The stored sync choice is named syncLights so it is clearly the Sync all lights option. The checkbox property was renamed from sync to syncLights to match that stored field. The visible label is now "Sync lights": shorter, and "all" was unnecessary. markStale was renamed to notifyOptionsEdited because the name should describe the event, the options were edited, rather than the effect of marking the show stale. It only calls the onEdit hook.

## 2026-11-04 — The light preview is static first

After Generate succeeds, the page shows the SVG light picture from the spike, painted with the first frame of the show. It stays still. Animation in time with the song is the next step, and keeping this step static makes that change small. The picture uses the same red on black as the rest of the page and scales to the width of the column.

## 2026-11-04 — The light preview follows the preview player

The light preview now animates in step with the song. `main.ts` passes each audio `timeupdate`'s `currentTime` to `LightShowGenerator.follow`, which uses `frameAt` to pick the frame: subtract the chosen start, then step in 20 ms frames, and clamp to the first or last frame. On pause no `timeupdate` fires, so the lights hold. The preview player is the audio element Play controls, and it plays the whole file, so the start offset has to come out of the playback time.

## 2026-11-04 — Test files can stay longer than source files

Test files are not split at about 100–120 lines. Consider splitting one into specific test areas only around 200–400 lines. The about-100-line limit is for source files. That is why `src/previewSync.test.ts` (118 lines) stays one file.

## 2026-11-04 — The preview shows a car, not only dots

The light preview shows two photographs, because one angled shot could not place every lamp. The front view is the repo owner's own photo of his Model 3, taken straight on and cropped around the car. No license credit is needed for that photo. It shows the four headlights plus the two front turn signals. The top view is a Tesla Roadster photographed from above. No freely licensed overhead photo of a Model 3 or Model Y turned up, and a Roadster is still a Tesla, so it carries all eight lights. The same channel drives the matching dot in both views. On a narrow screen the views stack; on a wide screen they sit side by side, aligned at the top so neither box is stretched. Both photos are bundled in the app, not loaded from a remote URL, so the preview works offline and the link cannot break.

The earlier stock front photo is no longer used. The next entry replaces this overhead photo.

## 2026-11-04 — ShowFlow is now LightShowGenerator

Renamed `ShowFlow` to `LightShowGenerator`, and `src/showFlow.ts` to `src/lightShowGenerator.ts`. The old name was vague. The class builds a light show from a song. This is a rename only. Nothing about how a show is built changed.

## 2026-11-04 — The overhead view is a Model 3 render

The top view no longer uses the Roadster photo. It uses an AI-generated top-down Model 3 render, nose up, on a plain charcoal background, with no plate. Jason approved that render. No freely licensed overhead photo of a Model 3 or Model Y exists. The overhead render in the car's touchscreen is Tesla's artwork, so it cannot be bundled. The Roadster was the wrong car, and the dots on that photo missed the lamps. The render needs no credit line, so the credit element and its CSS are gone. The eight top dots sit on this render's headlights, front corners, and taillights.

## 2026-11-04 — The page shows its version

A small version number sits in a corner of the page so Jason can tell which build he is viewing. The number lives in one place, `package.json`. The build reads that field and shows it. Bump it with every change: a patch for fixes and small tweaks, and a minor for features.

## 2026-11-04 — Car photos use content-hashed names

The car photos are imported, so the build gives each file a name from a hash of its bytes. Right after the car-preview deploy, a phone kept a cached old build that still pointed at deleted photos. GitHub Pages caches files for ten minutes, and the preview was blank. Unchanged bytes keep the same name, so a cached photo can stay. Changed bytes get a new name, so the next build cannot show a stale picture.

## 2026-11-04 — The version read lives in one module

The `package.json` version read now lives in one shared module. Both the Vite config and the Vitest config import it. There is a single place to read the version, so the two configs cannot drift.

## 2026-11-04 — The page has a favicon

The page was asking for a favicon and getting a 404. A small hand-written SVG light burst now sits in `public/`, and the page links it with `%BASE_URL%` so the icon resolves under the GitHub Pages path `/afterlight/`.

## 2026-11-04 — Download sits beside Generate

Download was showing below the preview, on the opposite corner from Generate. The preview sat between the two buttons, so the row wrapped and Download landed on the next line. Generate and Download now sit together. Generate stays visible so the actions are always clear. Before a show is built it is enabled and Download is hidden. Once a show is built for the current options, Generate is disabled and dimmed and Download appears beside it. Changing the length, the start time, sync, or the song enables Generate again at full brightness and hides Download.

## 2026-11-04 — Search and upload stack

On a wide screen the upload note sat beside the search box. The note is taller, and the row lined them up at the bottom, so the search field sat lower than the note. Search now comes first, and the note and Upload button sit under it, the same way they already do on a phone.

## 2026-11-04 — The front view is a render

The front view is now an AI-generated studio render, matching the top view. It replaces the owner's real front photo, which was too distracting. The car sits smaller in the frame, so the front headlight and turn-signal dots were moved onto the rendered lamps. No credit line is needed.

## 2026-11-04 — Recent history saves a recipe

After an iTunes show is generated, the page saves a recipe: the song details needed to fetch the preview again, plus the chosen options. It does not save the generated files, and it does not save uploaded songs, because those files cannot be kept in the browser. The five newest recipes are shown, newest first. Generating the same song with the same options moves that recipe to the top. Clicking one restores the song and options and generates the show again. The list stays hidden when it is empty. If storage is missing or the saved data is bad, history is empty.

## 2026-11-04 — Name a value before passing it on

Give a call its own named variable instead of nesting that call inside another call.

## 2026-11-04 — Generate stays put when Download hides

After a show is built, Generate and Download share a row under the options. Changing an option used to hide Download. The narrower button group then fit on the options row, so Generate jumped up. Download now stays visible and is disabled instead, so the button is still there but cannot be used, and the row does not collapse. The button group also takes the full width of the row, which keeps Generate in the same place if the disabled style ever stops reserving space.

## 2026-11-04 — Show length stays visible for iTunes

An iTunes preview is 30 seconds, so the show length control cannot change it. The control stays on screen, disabled, and set to 30, the same way Start at stays at 0. Hiding it would shift the row. An uploaded song still enables it. The disabled control is dimmed so it reads as unavailable.

## 2026-11-05 — Gap filler for pulse

Long gaps between beats left the car dark. Model 3 and Model Y cannot hold a steady mid brightness, and the rear turn signals are only on or off, so a slow left/right turn-signal alternation fills those gaps instead of a fade. After one second without a beat, including the start of the song, the left turns stay on for about half a second, then the right turns, repeating until the next beat. Then the normal pulse flash resumes. This happens in both split and together modes. The not-on-beat check is written `onBeat === false` rather than `!onBeat` because the explicit comparison reads more plainly.

## 2026-11-05 — Tag each version bump

Whenever the version is bumped, a matching Git release tag, like `v0.2.0`, is created on that same commit. The tag is created after the pull request merges, because it points at the merge commit on main.
