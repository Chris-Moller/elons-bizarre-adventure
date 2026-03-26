# Plan: Increase Contact Earth Success Rate & Multi-Dish Attempts

## Overview

Two focused changes to the Contact Earth mechanic in `game.js`:
1. Bump success probability from 1% to 5%
2. Allow multiple attempts per turn when the player has multiple Comm Dishes

## Tech Stack

- Vanilla JavaScript (`game.js` — single ~2260-line file)
- Vanilla HTML/CSS (`index.html`, `style.css`)
- No build system, no framework, no dependencies

## Current Architecture

- `getAdjacentCommDish(unit)` — returns the **first** adjacent comm dish (on-tile or neighboring). Does NOT skip used dishes.
- `canCallEarth()` — checks if the adjacent dish (from above) has been used this turn via `commDishesUsedThisTurn` array.
- `callEarth()` — performs the attempt, pushes dish key to `commDishesUsedThisTurn`, rolls `Math.random() < 0.01`.
- `refreshView()` — enables/disables the Call Earth button based on `canCallEarth()`.
- `commDishesUsedThisTurn` resets to `[]` at start of each turn (line ~1746).

## Changes Required

### 1. Success Rate (trivial)
- Line 1231: Change `Math.random() < 0.01` → `Math.random() < 0.05`

### 2. Multi-Dish Support
- Modify `getAdjacentCommDish(unit)` to accept an optional skip-list (or read `state.commDishesUsedThisTurn` directly) and return the first **unused** adjacent dish. This way:
  - `canCallEarth()` naturally returns `true` if any unused dish is nearby
  - `callEarth()` uses the correct (unused) dish
  - After a failed attempt on dish A, `canCallEarth()` finds dish B if available, so the button re-enables
  - The existing `commDishesUsedThisTurn` tracking and turn-reset logic is preserved unchanged

### 3. No HTML/CSS changes needed
The existing Call Earth button and dialog markup work as-is. The button enable/disable logic in `refreshView()` already calls `canCallEarth()`, which will correctly reflect the new multi-dish logic.

## Risk Assessment
- Low risk — changes are confined to 2-3 functions in `game.js`
- No new dependencies
- Existing `commDishesUsedThisTurn` reset behavior is untouched
