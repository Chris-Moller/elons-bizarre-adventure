# Plan: New Resource (Food) + New Building (Greenhouse)

## Summary

Add a `food` resource to the game and a `Greenhouse` building that generates 3 Food per turn. This follows established patterns for resources (rocks) and structures (Solar Panel, Rock Hovel, etc.).

## Architecture

The game is a single-file vanilla JS application (`game.js`) with supporting `index.html` and `style.css`. There is no build system, no framework, and no tests. All game logic, rendering, and state management live in a single IIFE in `game.js`.

### Key patterns to follow

1. **Resources** — stored on `state.resources` as key-value pairs (e.g., `state.resources.rocks`). Displayed in `#resources-panel` in `index.html` with emoji icon + count span.
2. **Structures** — objects pushed to `state.structures[]` with `type`, `row`, `col`, and optional extra fields. Each structure type has:
   - A `canBuild*()` guard function
   - A `build*()` action function
   - An entry in the `drawStructure()` dispatch + a dedicated `draw*()` function
   - A button in `index.html` `#action-panel`
   - An entry in the `updateUI()` actions array for show/hide/enable/disable
   - An event listener binding + a keyboard shortcut
   - A label in `updateTileInfo()` for tile inspection
3. **End-of-turn processing** — `endTurn()` calls processing functions sequentially: `processSubparBatteryExplosions()`, `processUnitDegradation()`, `processSolarPanels()`, `processDustStorms()`. The Greenhouse processing will be added here.
4. **Init reset** — `init()` resets `state.resources` and must include the new `food: 0` key.

## Changes Required

### 1. State & Init (`game.js`)

- Add `food: 0` to `state.resources` (line ~73).
- Add `food: 0` to the reset in `init()` (line ~1709).

### 2. Resource HUD (`index.html`)

- Add a new `<div class="resource-row">` for Food with a food emoji (🌿 or 🥫) and `<span id="food-count">0</span>` inside `#resources-panel`, after the Energy row.

### 3. UI Update (`game.js`)

- In `updateUI()`, add: `document.getElementById("food-count").textContent = state.resources.food;`

### 4. Build Greenhouse Button (`index.html`)

- Add `<button id="build-greenhouse-btn" class="action-btn" disabled>Build Greenhouse (10 🪨 5 ⚡)</button>` in `#action-panel`.

### 5. Greenhouse Logic (`game.js`)

- `canBuildGreenhouse()`: returns true when selected unit has no structure on tile, `state.resources.rocks >= 10`, and `getTotalHovelEnergy() >= 5`. Both Elon and Rocktimus can build.
- `buildGreenhouse()`: deducts 10 rocks and 5 energy (distributed across hovels like Comm Dish), pushes `{ type: "greenhouse", row, col }` to `state.structures`, logs the action.

### 6. Greenhouse Drawing (`game.js`)

- `drawGreenhouse(structure)`: renders a greenhouse sprite — green glass-panel structure with a plant motif and "GREENHOUSE" or "GRNHSE" label.
- Add dispatch in `drawStructure()`.

### 7. End-of-Turn: Food Generation (`game.js`)

- `processGreenhouses()`: iterates `state.structures`, counts greenhouses, adds `3 * count` to `state.resources.food`, logs if food was generated.
- Call `processGreenhouses()` in `endTurn()`.

### 8. UI Wiring (`game.js`)

- Add `["build-greenhouse-btn", canBuildGreenhouse()]` to the `actions` array in `updateUI()`.
- Add event listener for `#build-greenhouse-btn` click.
- Add keyboard shortcut (e.g., `h` for Greenhouse — `b` is taken by Rock Hovel).
- Add hotkey entry in `index.html` hotkey modal table.

### 9. Tile Info (`game.js`)

- Add `else if (tileStructure.type === "greenhouse") { structureText = "Greenhouse"; }` in `updateTileInfo()`.

### 10. Energy Deduction Pattern

The Greenhouse costs 5 Energy. Following the Comm Dish pattern (which deducts energy distributed across hovels), the build function will iterate hovels and deduct energy until 5 has been consumed.

## Task Decomposition

This is a **single task**. All changes are in 3 files (`game.js`, `index.html`, `style.css`) and are deeply interrelated — the button needs the JS logic, the JS logic needs the HTML elements, the drawing function references shared canvas context. Splitting would create integration overhead with no benefit.

## No external dependencies needed

The game is vanilla HTML/CSS/JS served by nginx. No npm, no build step.

## Tech debt note

The entire game is in a single 1733-line JS file with no modules, no types, and no tests. This is the existing pattern and we will work within it.
