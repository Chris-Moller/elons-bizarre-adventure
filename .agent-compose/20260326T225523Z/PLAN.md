# Plan: Dust Storms can collapse Rock Hovel

## Overview

Extend `checkDustStormCollisions()` in `game.js` to add a 5% collapse chance for Rock Hovels hit by dust storms. On collapse, the hovel is removed, a rock resource is placed, and any unit on the tile faces a 20% destruction chance.

## Current Architecture

- Single-file vanilla JS game (`game.js`, ~2500 lines).
- `checkDustStormCollisions()` (line 1735) iterates over all storm tiles, checks units and solar panels.
- Structures are stored in `state.structures` array; `getStructureAt(row, col)` finds one.
- `isUnitInHovel(row, col)` checks if a unit is sheltered — this becomes important because a collapsing hovel means the unit is no longer sheltered.
- Elon death pattern: set `unit.name = "Elon Bones"`, `movesLeft/Max = 0`, `state.gameOver = true`, log with `"storm"` type.
- Robot death pattern: place `degradeResource` on tile, splice from `state.units`.
- Battery explosion in `processSubparBatteryExplosions()` (line 1787) is a close analog for structure destruction.

## Implementation Approach

After the existing solar panel check in `checkDustStormCollisions()` (around line 1782), add a new block:

1. Get structure at storm tile via `getStructureAt(tile.row, tile.col)`.
2. If it's a `rock_hovel`, roll `Math.random() < 0.05` for collapse.
3. On collapse:
   - Remove the hovel from `state.structures` (splice by index).
   - Set `state.map[tile.row][tile.col].resource = 'rocks'`.
   - Log: `"A Rock Hovel at (col, row) was destroyed by the Dust Storm!"` with type `"storm"`.
4. Check units on that tile for destruction (20% chance each):
   - For Elon: convert to Elon Bones, game over.
   - For Rocktimus: place `degradeResource`, splice from units.
   - Log appropriately with `"storm"` type.

**Key detail**: The existing unit check uses `isUnitInHovel()` to protect units. Since we process hovel collapse _after_ the unit check, units inside the hovel are safe from the normal storm damage. The hovel collapse has its own independent 20% death roll — this is the correct behavior per the acceptance criteria.

**Order of operations**: We must process hovel collapse after the unit survival check so that units in hovels don't get killed by the normal storm logic AND potentially by the collapse logic in the same tick. The hovel collapse block should run after the solar panel block but we need to be careful: `getStructureAt` is called earlier for solar panels, but since we're now potentially removing structures, we should get the structure fresh or handle it carefully. Since `stormStructure` is already fetched at line 1778, we can reuse it for the rock hovel check.

**Adjacency concern (AC #7)**: Batteries and solar panels check adjacency to hovels for capacity. If a hovel is destroyed, those structures simply won't find it in adjacency checks anymore — they function independently with their base capacity. No special handling needed.

## No new dependencies required.

## Complexity: Single task, ~30 lines of code in one file.
