# Plan: Contact Earth Success Animation

## Context

The game is a vanilla HTML/CSS/JS Mars colony game (`game.js` ~2360 lines, `index.html`, `style.css`). It uses a single `<canvas>` for the game map and HTML dialogs/modals for UI overlays. There is already a precedent for canvas-based animations — the intro crash-landing animation (`playIntroAnimation` at game.js:2034) renders directly onto the game canvas with requestAnimationFrame over ~3.5 seconds.

The "Contact Earth" dialog is at index.html:85-95. When `callEarth()` succeeds (5% chance), it sets `state.contactedEarth = true` and shows a modal with the message: *"We hope you are enjoying your exile on Mars, Elon. No, we have not changed our minds."* The dialog uses the shared `.modal-content` / `.modal-backdrop` pattern.

## Approach

**Add a dedicated canvas inside the success dialog** that plays a UN Security Council scene animation. This approach:
- Avoids interfering with the game canvas
- Keeps the animation scoped to the dialog modal
- Follows the existing pattern of canvas-based animation (intro crash)

### Animation Design

A ~3-second canvas animation depicting:
1. **UN emblem** — a simplified globe/laurel wreath rendered with arc/line drawing, centered
2. **Signal/transmission effect** — radiating concentric rings emanating from center, simulating a received transmission
3. **Council silhouettes** — a row of seated figure silhouettes along the bottom edge, representing the Security Council chamber
4. **Text overlay** — "TRANSMISSION RECEIVED" fading in on the canvas

Color palette: dark navy background (#0a1628), UN blue (#4b92db) for the emblem/effects, warm amber (#d4a574) accents matching the game's existing palette.

### Dialog Structure Changes

The success variant of the call-earth-dialog will:
1. Add a `<canvas id="call-earth-animation">` element inside `.modal-content`, above the message
2. On success, start the animation via `requestAnimationFrame`
3. The existing message text becomes a subtitle below the canvas
4. On failure (static), no animation — dialog shows as before
5. Close button and X key remain fully functional at all times

### Files Modified

1. **index.html** — Add canvas element to call-earth-dialog
2. **style.css** — Style the animation canvas within the dialog
3. **game.js** — Add `playContactEarthAnimation()` function, modify `callEarth()` to trigger it on success

## Key Decisions

- **Canvas inside dialog vs. game canvas**: Using a dedicated canvas avoids z-index/overlay complexity and keeps the animation self-contained within the modal.
- **No external dependencies**: Pure canvas API drawing, consistent with the intro animation pattern.
- **Animation duration**: ~3 seconds, matching the 2-4 second AC requirement.
- **Non-blocking**: Animation plays automatically but close handlers remain active throughout.
