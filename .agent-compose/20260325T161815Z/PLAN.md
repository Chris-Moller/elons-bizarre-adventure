# Plan: Rocktimus Robot Unit Type

## Summary

Add a constructible Rocktimus Robot unit to the game. This requires refactoring the single-unit architecture (`state.unit`) into a multi-unit system (`state.units[]` + `state.selectedUnit`), adding a unit registry/factory, turn-based lifecycle (degradation), generalized harvesting, and a "Build Rocktimus Robot" UI action.

## Current Architecture

- **Tech stack**: Vanilla HTML/CSS/JS, no build system, no framework, no package.json
- **Game state**: Single `state.unit` object (Elon), `state.structures[]`, `state.resources`, `state.turn`
- **Rendering**: Canvas 2D with manual draw functions per entity type
- **Input**: Keyboard (WASD/arrows) and click on canvas, actions via sidebar buttons
- **Turn loop**: `endTurn()` increments turn, resets Elon's moves, processes solar panels

## Design Decisions

### 1. Multi-Unit Architecture

**Decision**: Replace `state.unit` (single object) with `state.units` (array) + `state.selectedUnit` (index or reference).

- Elon becomes `state.units[0]` with `type: "elon"`
- Rocktimus Robots are added to `state.units[]` with `type: "rocktimus"`
- `state.selectedUnit` tracks which unit the player is controlling
- Tab key (or number keys) cycles between units
- Clicking a unit's tile selects it

**Rationale**: Array-based unit storage is the simplest extension of the current pattern (see `state.structures[]`). A selected-unit pointer enables the existing movement/action code to work with minimal changes — just replace `state.unit` references with `state.units[state.selectedUnit]`.

### 2. Unit Registry / Factory

**Decision**: Define a `UNIT_TYPES` registry object that maps type strings to unit definitions.

```js
const UNIT_TYPES = {
    elon: {
        name: "Elon Musk",
        movesPerTurn: 2,
        canHarvest: ["rocks"],
        lifespan: null,       // infinite
        degradeResource: null,
        buildCost: null,       // not constructible
    },
    rocktimus: {
        name: "Rocktimus Robot",
        movesPerTurn: 5,
        canHarvest: ["rocks"],
        lifespan: 5,
        degradeResource: { type: "rocks", amount: 1 },
        buildCost: { energy: 2, rocks: 1 },
    },
};
```

A `createUnit(type, row, col)` factory function reads from this registry and returns a fully initialized unit object with `turnsRemaining` set from `lifespan`.

**Rationale**: Adding a new unit type in the future means adding one entry to `UNIT_TYPES` and one `drawXxx()` function — no other code changes needed. This satisfies AC7.

### 3. Unit Selection & UI

**Decision**: Add a unit selection mechanism:
- `state.selectedUnit` is an index into `state.units`
- Clicking a tile with a unit on it selects that unit
- Tab key cycles through owned units
- The sidebar Unit panel updates to show the selected unit's name, moves, and (if applicable) remaining lifespan
- A new hotkey `R` constructs a Rocktimus Robot

**UI changes**:
- Unit panel shows unit name dynamically (not hardcoded "Elon Musk")
- Add "Lifespan: X turns" display for units with finite lifespan
- Add "Build Rocktimus (2⚡ 1🪨)" button in action panel
- Hotkey table gets new entries for Tab (cycle units) and R (build robot)

### 4. Construction at Structure

**Decision**: Rocktimus Robot is built when Elon (or any unit) is standing on a Rock Hovel. The new robot spawns on an adjacent empty tile.

- Validate: player has 2 Energy + 1 Rock
- Validate: selected unit is standing on a Rock Hovel
- Deduct resources
- Find adjacent open tile (no unit, no structure)
- Create Rocktimus unit at that tile
- Log the construction

**Rationale**: Rock Hovel is the only "building" structure; Solar Panel is a generator. It makes thematic sense to build robots at the hovel.

### 5. Generalized Harvesting

**Decision**: Refactor `gatherResource()` to use the unit registry's `canHarvest` field.

- Current: hardcoded `tile.resource === "rocks"` check
- New: check if `UNIT_TYPES[unit.type].canHarvest.includes(tile.resource)`
- The gather button enable/disable logic uses the same check

This means both Elon and Rocktimus Robot can gather rocks (AC3), and future units could harvest different resources.

### 6. Turn-Based Degradation

**Decision**: At the end of each turn, iterate `state.units` and for any unit with a finite `turnsRemaining`:
1. Decrement `turnsRemaining`
2. If `turnsRemaining <= 0`:
   - Place the degrade resource on the unit's tile (`tile.resource = "rocks"`)
   - Remove the unit from `state.units`
   - If the removed unit was selected, reselect Elon
   - Log the degradation

This runs inside `endTurn()` alongside `processSolarPanels()`.

### 7. Rendering

**Decision**: Add a `drawRocktimusRobot(unit)` function alongside `drawUnit(unit)`. The render loop iterates `state.units` and dispatches to the correct draw function based on `unit.type`.

The Rocktimus Robot sprite:
- Metallic gray/silver body (boxy robot shape)
- Orange/amber "eyes" (two small circles)
- Rocky texture accents to match the Rock theme
- Label "ROBO" beneath
- Highlight color: cyan/teal (distinct from Elon's yellow)
- When selected, show the standard yellow highlight; when not selected, show a dimmer highlight

Additionally, show remaining lifespan as a small number badge on the sprite.

### 8. Movement Range

**Decision**: `drawMoveRange()` already draws a 1-tile range. For Rocktimus with 5 moves, the visual range should show all tiles reachable within `movesLeft` steps (BFS flood fill up to `movesLeft` distance using Manhattan-like adjacency including diagonals).

However, the actual movement per click/keypress is still 1 tile at a time (each press costs 1 move). The range indicator just shows how far the unit can reach this turn.

## File Changes

All changes are in three files:
1. **`game.js`** — bulk of the work: unit registry, factory, multi-unit state, selection, construction, degradation, generalized harvesting, rendering
2. **`index.html`** — add Build Rocktimus button, update unit info panel for dynamic content, update hotkey table
3. **`style.css`** — styles for new button, lifespan display, robot-related log entries, unit selection indicators

## Task Decomposition

This is a **single task** because:
- All three files are tightly coupled (JS references HTML element IDs, CSS classes)
- The multi-unit refactor in `game.js` touches nearly every function
- Parallel decomposition would create constant merge conflicts
- A single implementer can work through this systematically

## Risk Mitigation

- The existing Elon gameplay must continue working identically after refactor
- Key risk: breaking Elon's movement/gathering when switching from `state.unit` to `state.units[state.selectedUnit]`
- Mitigation: the implementer should verify Elon's basic loop (move, gather, build, end turn) works before adding Rocktimus features

## Sources

- Existing codebase analysis (game.js, index.html, style.css)
- No external dependencies needed — this is all vanilla JS canvas rendering
