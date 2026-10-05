# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DialSafe Simulator - an educational web tool for the legitimate opening of a 4-disc fixed dial lock (common in Japanese home safes). The dial turns like a real one (the scale increases clockwise, so turning right lowers the number at the index). The wheel pack is a physical model of chained pin play, so the gates line up only as a result of dialing; nothing is snapped into place. Learn and Simulator tabs, step guide, inside view, five demonstrations, Japanese and English UI, light and dark themes. Part of the "100 Security Tools with Generative AI" project (Day050).

## Architecture

All scripts are plain (non-module) scripts so that the page works from `file://`. Each script puts one object on `globalThis`.

- **index.html**: header (language and theme buttons), WAI-ARIA tabs (Learn, Simulator). Learn text carries `data-i18n` (bold as `<strong>`, line breaks as `<br>`; `learn.why.desc2` takes values from `data-i18n-vars`). Simulator: SVG dial (`#dial-face` rotated by `-p*3.6`), turn buttons, key and reset, step guide, inside view (`#wheels`), demonstrations. Meta CSP without `'unsafe-inline'`; no style attributes, inline scripts or handlers
- **js/dial-core.js** (`DialCore`): pure logic, no DOM. Units are graduations (100 per revolution). State `{ p, a: [disc1, disc2, disc3] }` with unwrapped angles; `step(lock, s, 'R'|'L')` moves the spindle by −1/+1 and pushes each disc when the slack to its driver leaves `[0, play]` (`play = 100 − PIN_WIDTH`, PIN_WIDTH 4). `makeLock(numbers)` works back the gate angles from the combination (Disc 2 is offset by `2 × play` because it is set while pushed left). `offsets` / `isOpen` (all within TOLERANCE 1). `updateGuide` follows the manual's steps (statuses start, turning, ready, past, over, restart, wrongStart) but never decides opening. `demoPlans` (six, started from `demoStart` = left contact at the 1st number + 6), `view` (strip positions of gates and pins), `pickupDistances` (97, 193, 289), `leftStartNumbers`. Combination conditions: `combinationGaps` / `gapLimits` (88, 92, 96) / `isExact` / `isDialable` (+ tolerance) / `exactCount` (77,721,600); practice: `randomCombination` (margin `PRACTICE_MARGIN` 3 below each limit), `randomState`, `practiceFromSeed` (number 1–999999). Review: `appendMove` merges turns; `analyzeHistory(lock, start, history, guide)` replays the record and returns per-turn moved discs, guide status, and for key turns the offsets and the turn that last moved each misaligned disc (`blame`). `fenceWindow` / `fenceStop` for the lock view
- **js/messages.js** (`DialMessages`): all strings in Japanese and English (same keys, placeholders and `**` pairs). `t(key, vars, lang)`
- **js/i18n.js** (`DialI18n`): language from `?lang=` → saved (`dialsafe-simulator-lang`) → browser language; `applyStaticText` renders `**bold**` and `\n` as elements (no innerHTML)
- **js/theme-init.js / theme.js** (`DialTheme`): theme applied before paint, follows the OS unless saved (`dialsafe-simulator-theme`)
- **js/script.js**: UI only. Turning goes through `turn(dir, count)`, which updates the guide and the model one graduation at a time (drag, hold buttons and keys all use it). Keys only on the focused dial. Demonstrations animate the same `step` calls. Practice mode swaps `lock` for a random combination and starts from `randomState`; "Close" keeps the gates aligned until the dial is turned right 4 revolutions (`SCRAMBLE`). Manual turns, key turns and closes are recorded (`HISTORY_MAX` 300) from `recordStart`; demonstrations and the replay run through `runSequence`. The lock view (`#lockview`) moves only by toggling classes (`open`, `trying`, `stop-0`…`stop-3`). Diagrams are SVG attributes only (no `.style`)
- **css/style.css**: color tokens on `:root`; the OS dark block and `[data-theme="dark"]` must stay identical (tested)

## Development Commands

- `npm test` — node:test, no dependencies, Node 22+. Runs in GitHub Actions on push and pull requests
- No build step. Open index.html directly or serve the folder

## Testing

- `test/model.test.js`: the model against a separately written reference (2,000 random starts, seed 20261005): correct steps, overshoot, too few, wrong numbers, left start; play stays in range; pick-up distances
- `test/guide.test.js`, `test/demo.test.js`: step guide statuses and demonstration results
- `test/combination.test.js`: combination conditions against the model (1,900 combinations), practice numbers and start states
- `test/review.test.js`: merging the record, the review of turns and blame, the fence window and stop, practice numbers
- `test/html.test.js`, `test/messages.test.js`, `test/i18n.test.js`, `test/contrast.test.js`, `test/format.test.js`: CSP and markup, static text equals the dictionary, dictionaries, language choice, contrast (text 4.5:1, graphics 3:1), 44px buttons, line length and LF
- `test/readme.test.js`: both READMEs (same headings), YAML structure, the model table and numbers recomputed from the core, directory tree, images (9 screenshots each, no unreferenced images), and the "world dial locks" section (same source URLs, reference numbers and table rows in ja/en; every cited number is listed)

## Key Implementation Notes

- Never use `innerHTML` or inline styles; draw with SVG attributes
- Do not decide opening from the guide; only `isOpen` (gate offsets) decides
- README numbers are recomputed by tests — update them from the core, not by hand. README states only what is true for the current version. The "world dial locks" section only states what was checked against sources (fact-check table in the ipusiron-work research notes); no techniques for defeating locks, no factory default combinations
- Japanese strings do not put half-width spaces between Japanese and alphanumeric characters
