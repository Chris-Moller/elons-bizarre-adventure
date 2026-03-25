# Plan: Hide Unusable Actions

## Summary

Modify the `updateUI()` function in `game.js` to hide action buttons (via `style.display = 'none'`) when the player lacks sufficient resources/preconditions, rather than just disabling them. Buttons reappear when preconditions are met again.

## Current State

- **`game.js:694-742`** — `updateUI()` already computes disabled state for each button:
  - `gather-btn`: disabled when `!canUnitHarvest(unit)`
  - `build-hovel-btn`: disabled when `rocks < 10 || hasStructureOnTile`
  - `build-solar-btn`: disabled when `!canBuildSolarPanel()`
  - `build-battery-btn`: disabled when `!canBuildSubparBattery()`
  - `build-rocktimus-btn`: disabled when `!canBuildRocktimus()`
  - `build-comm-dish-btn`: disabled when `!canBuildCommDish()`
- Hotkeys (G, B, P, T, R, C) directly call the action functions (`gatherResource`, `buildRockHovel`, etc.), each of which has its own guard check (e.g., `if (!canBuildSolarPanel()) return;`). Hotkeys do **not** check button disabled state, so hiding buttons won't break them — they'll simply be no-ops when preconditions aren't met, matching current disabled behavior.
- `updateUI()` is called via `refreshView()` after every game action and at turn start, so visibility will update reactively.

## Implementation

### Changes to `game.js` (updateUI function, lines 716-738)

For each action button, add a `style.display` line alongside the existing `disabled` line:

```js
// Gather button
const gatherBtn = document.getElementById("gather-btn");
const canGather = canUnitHarvest(unit);
gatherBtn.disabled = !canGather;
gatherBtn.style.display = canGather ? "" : "none";

// Build Rock Hovel button
var buildBtn = document.getElementById("build-hovel-btn");
var hasStructureOnTile = getStructureAt(unit.row, unit.col) !== null;
var canHovel = state.resources.rocks >= 10 && !hasStructureOnTile;
buildBtn.disabled = !canHovel;
buildBtn.style.display = canHovel ? "" : "none";

// Build Solar Panel button
var solarBtn = document.getElementById("build-solar-btn");
var canSolar = canBuildSolarPanel();
solarBtn.disabled = !canSolar;
solarBtn.style.display = canSolar ? "" : "none";

// Build Subpar Battery button
var batteryBtn = document.getElementById("build-battery-btn");
var canBattery = canBuildSubparBattery();
batteryBtn.disabled = !canBattery;
batteryBtn.style.display = canBattery ? "" : "none";

// Build Rocktimus button
var rocktimusBtn = document.getElementById("build-rocktimus-btn");
var canRock = canBuildRocktimus();
rocktimusBtn.disabled = !canRock;
rocktimusBtn.style.display = canRock ? "" : "none";

// Build Comm Dish button
var commDishBtn = document.getElementById("build-comm-dish-btn");
var canComm = canBuildCommDish();
commDishBtn.disabled = !canComm;
commDishBtn.style.display = canComm ? "" : "none";
```

### Ensuring the UI is never empty

The "End Turn" button and the "Actions" panel header (`<h2>Actions</h2>`) are always visible. The end turn button is outside the action panel and always rendered. The action panel's `<h2>Actions</h2>` heading remains visible. Additionally, the sidebar always shows Turn Info, Unit Info, Resources, Tile Info, and Log panels. There is no scenario where the UI would be completely empty.

However, to add a contextual fallback, we should add a small message inside the action panel when **all** action buttons are hidden, e.g., "No actions available" — to make it clear the panel isn't broken.

### No changes needed for hotkeys

Hotkeys call action functions directly (e.g., `gatherResource()`, `buildRockHovel()`), and each function has its own guard clause that returns early if preconditions aren't met. Button visibility has no effect on hotkey behavior.

### No CSS changes needed

`style.display = 'none'` and `style.display = ''` are set inline via JS, which overrides/restores the default block display. The existing `.action-btn` margin rules use `+` adjacent sibling combinator, which naturally skips hidden elements.

## Risk Assessment

- **Low risk**: The change is additive — only modifying `updateUI()` to set `style.display` alongside existing `disabled`. All guard clauses in action functions remain intact.
- **Hotkeys safe**: Hotkeys never check button DOM state; they call functions that have their own `can*` guards.
- **Reactivity ensured**: `updateUI()` is called after every state change via `refreshView()`.

## Tech Debt Note

The project is vanilla HTML/CSS/JS with no build system, framework, or module bundling. This is noted tech debt but we work within the existing constraints for this change.
