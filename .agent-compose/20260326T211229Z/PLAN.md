# Plan: Battery Explosion Can Destroy Elon

## Summary

Extend the existing `processSubparBatteryExplosions()` function in `game.js` to check if Elon is on any of the 8 adjacent tiles when a battery explodes. If so, roll a 10% chance to kill Elon (set to "Elon Bones", trigger game over).

## Technical Approach

### Where to change

**Single file**: `game.js`, function `processSubparBatteryExplosions()` (line ~1739).

### Current behavior (line 1739–1761)

The function iterates `state.structures` in reverse. For each `subpar_battery`, it rolls `Math.random() < 0.02`. On success it logs the explosion, splices the structure out, and sets `anyExploded = true`. After the loop, it clamps hovel energy if anything exploded.

### New behavior

After the explosion log and splice, but before continuing the loop:

1. Find Elon in `state.units` (type `"elon"`).
2. Check if Elon is on any of the 8 adjacent tiles using the `dr/dc` loop pattern already used by `getAdjacentStructures()`.
3. If adjacent, roll `Math.random() < 0.10`.
4. If the roll succeeds:
   - Set `elon.name = "Elon Bones"`, `elon.movesLeft = 0`, `elon.movesMax = 0`.
   - Set `state.gameOver = true`.
   - Call `addLog(...)` with type `"explosion"`.
   - Break out of the loop (game is over, no point processing more batteries).
5. If Elon is not adjacent or the roll fails, continue normally.

### Patterns to follow

- **Elon Bones death**: Reuse the exact pattern from dust storm collision (line ~1700–1706): set name, zero moves, set gameOver, addLog.
- **Adjacency check**: Use the `dr = -1..1, dc = -1..1, skip 0,0` loop (same as `getAdjacentStructures`).
- **Log type**: Use `"explosion"` (already used for battery explosion logs).
- **Robots unaffected**: Only check for `unit.type === "elon"`, skip robots entirely.

### Risks

- None significant. The change is ~15 lines in a single function with well-established patterns.

## Architecture Decision

Single task — this is a ~15-line change in one function in one file. No parallelism benefit.
