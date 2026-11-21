# AGENTS.md

Standing rules for agents. For why past choices were made, read `docs/decisions.md`. This file holds the rules, and that file holds the history. Add a dated decisions entry in every PR.

## Stack
- Vite, plain TypeScript, Vitest, Node 22. No UI framework and no server.
- Static site on GitHub Pages under the repo's project path.
- `appVersion.ts` is the only module that reads the version. Configs share values through small modules and never depend on each other.
- A fresh clone must run with one setup command (`npm ci`, then `npm run dev`). If setup changes, fix it in the same PR.

## Branches (Git flow)
- Feature branches come off `develop`, or off `main` when there is no `develop` branch.
- Hotfix branches come straight off `main`.
- Release branches are cut from `develop`.
- No direct pushes to `main`, ever. Everything reaches it through a pull request.

## Before you start
- Never commit to main, ever. Every change goes on its own branch, cut from the latest `origin/main` (run `git fetch origin` first).
- Every change reaches main only through a pull request that Jason reviews and approves.
- Name branches in JIRA style, with the project name or abbreviation first: PROJ-TICKET-NUMBER-FEATURE-NAME.
- Work on the named problem in the brief. Make one small, targeted change per PR.
- No unrequested refactors. Change architecture only when it clearly makes the code better, and say why.
- Read the feature note in `docs/features/` for any feature you touch.

## Design
- Prefer composition over inheritance. Build from small parts you pick, not a parent class that can change under you.
- Publish a past-tense event, like `OverlayDrawn`, instead of handling downstream effects inside a class.
- Keep entry files thin, and keep show logic separate from display.

## Proof of done
- Write tests first. For a bug, add a test that fails before the fix and passes after.
- Test a user would notice. Never hard-code stored data like coordinates or full lists. Keep tests few, short, and clearly named.
- When a test file grows past about 200 lines or starts covering more than one behavior, split it into smaller files, one per behavior. Same tests, smaller files, fewer merge conflicts.
- Typecheck, tests, and build must pass.
- For visual changes, check the running app at phone and desktop sizes and include screenshots.
- Use heavy checks only for risky features. For a simple fix, just say it's cheaper for Jason to check it himself.

## Feature notes
- Each feature gets one short Markdown file in `docs/features/`, a few lines long.
- It says what the feature does and points at the files it touches.
- Update it in the same PR that changes the feature. Edit by hand only; never auto-refresh it.

## Business rules
- When a rule is unclear, ask, then write the answer down in the feature note or `docs/decisions.md`. Never guess silently.

## Avoid
- Hidden behavior: no magic, no metaprogramming, no clever tricks.
- Environment checks scattered around. Dev mode comes in through one object.
- Vague class names like Manager, Helper, or Utils, or words that are both noun and verb.
- `any`, and `!x`. Write `x === false`.
- Source files over about 100 lines.

## Reviews
- When the same review comment comes up twice, propose a lint or CI check for it. Don't just leave a note.
- Every PR gets a short plain-English "What this does and why" section.
- Never push to main. Never merge or delete a branch without Jason's OK.

## Repo-specific
- A show is one 200-channel FSEQ at 20 ms, written for Tesla's Model S xLights layout. Model 3 and Model Y share some bulbs, so pulse does not drive those channels (`src/channels.ts`).
- Catalog songs are the 30-second iTunes preview, and `src/itunes.ts` is the only module that talks to Apple. An uploaded file can run 30, 45, or 60 seconds and can start later in the song.
