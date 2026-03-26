# Plan: Fix Mars Throne Dialog

## Problem

`buildMarsThrone()` (game.js:1382) prematurely sets `state.gameOver = true` and opens the throne dialog without initializing its message or step. This causes two bugs:

1. The throne dialog opens empty (no message text, no step initialized)
2. `canSitOnThrone()` (game.js:1408) checks `state.gameOver === false`, so the proper "Sit on the Mars Throne" action can never be triggered — the 3-step dialog sequence ending with "Elon's bones will sit on the Mars Throne forever. Game Over." never displays.

## Fix

In `buildMarsThrone()` (game.js ~lines 1382-1384), remove:
- `state.gameOver = true;`
- `state.throneDialogOpen = true;`
- `document.getElementById("throne-dialog").classList.remove("hidden");`

This allows the intended flow: build throne -> walk to it -> sit on it -> see 3-step dialog -> game over.

The `sitOnThrone()` function already handles the full dialog correctly:
- Step 1: "You are the king of Mars!"
- Step 2: "The throne is comfortable, but your space suit has caught on a sharp edge and sprung a leak."
- Step 3: Sets Elon to "Elon Bones", `state.gameOver = true`, displays "Elon's bones will sit on the Mars Throne forever. Game Over"

## Files Changed

- `game.js` — remove 3 lines from `buildMarsThrone()`

## Risk

Very low. The `sitOnThrone()` and `advanceThroneDialog()` flows are already fully implemented and correct. We're just unblocking them.
