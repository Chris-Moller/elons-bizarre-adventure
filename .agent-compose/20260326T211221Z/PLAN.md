# Plan: Dynamic Dust Storm Growth/Shrinkage

## Context

This is a vanilla JS browser game (`game.js`, ~2300 lines). Dust storms are objects with a `tiles` array and a `direction` string. They spawn on map edges, move each turn via `moveDustStorms()`, and collisions are checked afterward via `checkDustStormCollisions()`.

## Approach

Add growth/shrink logic **inside `moveDustStorms()`**, after each storm's tiles are moved but before the off-map check. This ensures new tiles participate in the existing collision system (which runs after `moveDustStorms`).

### Growth (20% chance per storm per move)
- Determine perpendicular axis based on `storm.direction`:
  - north/south → perpendicular is col axis (add tile with col ± 1)
  - east/west → perpendicular is row axis (add tile with row ± 1)
- Pick a random existing tile, then attempt to add a neighbor perpendicular to it. Try both directions (randomly ordered); skip if the candidate position already has a storm tile.
- New tile gets the same row/col offset as the chosen tile on the movement axis.
- Clamp: only add if the new tile is within map bounds.

### Shrinkage (10% chance per storm per move)
- Remove the first or last tile from `storm.tiles` (random choice).
- Guard: do not shrink below 1 tile.

### Logging
- Growth: `addLog("A Dust Storm grew in size!", "storm")`
- Shrinkage: `addLog("A Dust Storm shrank in size.", "storm")`

### Interaction rules for new tiles
No extra code needed — `checkDustStormCollisions()` already iterates all `storm.tiles` after movement, so newly added tiles will be checked for unit damage, solar panel dusting, etc.

## Files Changed
- `game.js` — modify `moveDustStorms()` only

## Risk
Low. Single function modification, no new dependencies, no structural changes.
