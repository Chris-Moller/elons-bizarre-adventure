# Plan: Hide Actions during Intro Dialog

## Problem
The `#action-panel` div (containing all game action buttons) is visible while the intro dialog is open. Players see actions they can't yet use.

## Solution
In `updateUI()` (game.js ~line 809), add a guard that hides the entire `#action-panel` when `state.introDialogOpen` is `true` and shows it otherwise. This is the minimal, correct fix because `updateUI()` already runs on every state change and controls action visibility.

## Files to Change
- `game.js` — add intro dialog check in `updateUI()` around the action panel visibility logic

## Approach
1. At the start of the action-button section in `updateUI()` (~line 809), get `action-panel` element
2. If `state.introDialogOpen`, hide it and skip individual button logic
3. Otherwise, show it and proceed with existing button visibility logic

No new dependencies. No CSS changes needed (the panel already uses inline display toggling).
