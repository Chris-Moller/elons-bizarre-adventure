# Plan: Rocktimus can go rogue

## Summary

Add a 1% chance that a newly constructed Rocktimus robot goes rogue, killing Elon (setting name to "Elon Bones", `state.gameOver = true`) and preventing the robot from being added to `state.units`.

## Technical Approach

**Single file change**: `game.js`, function `buildRocktimus()` (line 1162).

The change is minimal — after resources are deducted and the robot is created, but before adding to `state.units`, insert a rogue check:

1. After `createUnit("rocktimus", ...)` on line 1171, check `Math.random() < 0.01`.
2. If rogue triggers:
   - Set `state.units[0].name = "Elon Bones"` (Elon is always index 0).
   - Set `state.gameOver = true`.
   - Add a thematic log message.
   - Do NOT push the robot to `state.units`.
   - Call `refreshView()` and return early.
3. If rogue does not trigger, proceed as normal (push robot, log, refresh).

## Patterns Followed

- **Randomness**: `Math.random() < 0.01` — consistent with `Math.random() < 0.05` (callEarth), `Math.random() < 0.02` (dust storms), etc.
- **Elon Bones**: `state.units[0].name = "Elon Bones"` + `state.gameOver = true` — identical to throne death (line 1435-1439), storm death (line 1690-1693), explosion death (line 1796-1799).
- **Logging**: `addLog(...)` with a thematic message — consistent with all game events.
- **Resources**: Resources are deducted before the rogue check (the robot was built, it just turned rogue). This is intentional — the construction succeeded, the outcome was bad.

## Scope

- 1 file changed: `game.js`
- ~10 lines added
- No new dependencies
- No test files exist in the repo
