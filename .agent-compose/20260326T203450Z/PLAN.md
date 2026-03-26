# Plan: Press X to Close Any Dialog Box

## Summary

Add a universal 'X' key handler that dismisses whichever dialog is currently open. The game currently has two dialog types (call-earth dialog and hotkey modal). The acceptance criteria also references an "intro dialog" and "throne dialog" — neither exists in the codebase. These must be created.

## Codebase Analysis

- **Tech stack**: Vanilla HTML/CSS/JS, single-file IIFE in `game.js`, no build system
- **Existing dialogs**:
  - `#call-earth-dialog` — toggled via `state.callEarthDialogOpen`, closed by `closeCallEarthDialog()`
  - `#hotkey-modal` — toggled via `state.hotkeyModalOpen`, closed by `toggleHotkeyModal()`
- **Missing dialogs** (must be created):
  - **Intro dialog** — shown on game start before gameplay begins; "Begin" button starts the game
  - **Throne dialog** — shown when Mars Throne is built (victory); "Continue" button advances (currently `state.gameOver = true` is set inline)
- **Keyboard handler**: Single `keydown` listener at line 1623. ESC toggles hotkey modal; other keys are blocked when a modal/dialog is open.

## Approach

### 1. Create Intro Dialog
- Add HTML markup in `index.html` with a "Begin" button
- Add CSS using existing `.modal-*` patterns
- Add state flag `introDialogOpen: true` (starts open)
- Block all game input while intro is showing
- "Begin" button (or pressing X) hides the dialog and starts the game

### 2. Create Throne Dialog
- Add HTML markup for a victory/throne dialog
- When Mars Throne is built, show the dialog instead of just setting gameOver
- "Continue" button (or pressing X) advances/closes the dialog
- Add state flag `throneDialogOpen: false`

### 3. Add Universal X Key Handler
- In the `keydown` listener, before the existing ESC handler, check for 'x' key
- Priority order: intro dialog > call-earth dialog > throne dialog > hotkey modal
- Each dialog type maps to its specific close/action function
- If no dialog is open, 'x' does nothing (no interference with gameplay — 'x' is not currently mapped)

### 4. Update Hotkey Modal
- Add a row to the hotkey table: `<kbd>X</kbd>` → "Close dialog"

## Key Decisions

- **Single task**: All changes are tightly coupled (HTML + CSS + JS in 3 files). No benefit from parallelism.
- **Intro dialog behavior**: Pressing X triggers "Begin" (same as clicking the button), matching AC #2.
- **Throne dialog behavior**: Pressing X triggers "Continue" (advances dialog step), matching AC #4. Since building the throne ends the game, "Continue" will dismiss the victory message.
- **Quality**: `full` — touches core game logic and UI across all 3 files.
