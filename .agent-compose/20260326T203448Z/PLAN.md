# Plan: Dust on Solar Panels

## Overview

Add a "dusty" mechanic to Solar Panels: when a dust storm tile overlaps a Solar Panel, it becomes dusty (10% energy generation instead of 50%). Units on the dusty panel can use a "Remove Dust" action (costs 1 move) to restore it. Visual, UI, logging, and hotkey support included.

## Technical Approach

This is a single-task change across 3 files (`game.js`, `index.html`, `style.css`), all tightly coupled.

### Changes by File

#### game.js

1. **State: `dusty` property on solar panel structures**
   - When `buildSolarPanel()` creates a structure, add `dusty: false`.
   - In `checkDustStormCollisions()`, after checking units, also check structures: if a storm tile overlaps a `solar_panel`, set `structure.dusty = true` and log it.

2. **Energy generation: respect dusty state**
   - In `processSolarPanels()`, change the probability check: use `0.1` if `panel.dusty`, else `0.5`.

3. **Remove Dust action**
   - `canRemoveDust()`: selected unit is on a solar panel that is dusty, and unit has moves left.
   - `removeDust()`: sets `panel.dusty = false`, costs 1 move, logs the action.

4. **Visual: dusty solar panel**
   - In `drawSolarPanel()`, if `structure.dusty`, draw with muted/brown colors and a semi-transparent dust overlay.

5. **UI updates**
   - Add "Remove Dust" button to `updateUI()` actions array, following "Hide Unusable Actions" pattern (show/hide based on `canRemoveDust()`).
   - In `updateTileInfo()`, when structure is `solar_panel`, append "(Dusty)" if dusty.

6. **Hotkey: `X` for Remove Dust** (unused key)
   - Add case in keydown handler.

7. **Hotkey modal entry** — add row in `index.html`.

8. **Button** — add `<button id="remove-dust-btn">` in `index.html`.

9. **Log styling** — add `.log-entry.dust` class in `style.css`.

#### index.html

- Add `<button id="remove-dust-btn" class="action-btn" disabled>Remove Dust (1 move)</button>` in action panel.
- Add `<tr><td><kbd>X</kbd></td><td>Remove Dust</td></tr>` in hotkey table.

#### style.css

- Add `#game-log .log-entry.dust` style (brownish/sandy color).

### Key Decisions

- **Hotkey `X`**: Letters F, H, I, J, K, N, O, Q, U, V, X, Y, Z are all unused. `X` is mnemonic for "clean/wipe" and easy to reach.
- **"On tile" not "adjacent"**: AC #4 says "standing on a dusty Solar Panel tile", so the unit must be on the panel, not adjacent. (AC says "adjacent to or on" in description but AC #4 says "standing on" — we'll implement "on or adjacent" per the description.)
- **Dust overlay rendering**: Use a semi-transparent brownish fill + stipple dots over the solar panel to make it visually distinct without a complex sprite system.
- **Log types**: `"dust"` for both becoming dusty and being cleaned — differentiated by message text.

### No External Dependencies

Pure vanilla JS/HTML/CSS. No build step, no packages.
