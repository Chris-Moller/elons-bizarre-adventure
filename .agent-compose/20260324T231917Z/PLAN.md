# Implementation Plan: Initial Game Build — Elon's Bizarre Adventure

## Overview

Build a turn-based strategy game where Elon Musk has crash-landed on Mars. The game features a randomly generated tile map (~10% tiles contain Rocks), a movable Elon Musk unit, turn-based movement, and resource gathering mechanics. Inspired by Civilization / Alpha Centauri.

## Tech Stack

### Core
- **Phaser 3.90.0** — Full 2D game framework with built-in tilemap support, scene management, camera, input handling, and sprite rendering. The right tool for a Civ-like tile game.
- **React 19** — UI overlay layer (HUD, resource display, turn counter, action buttons). Connected to Phaser via EventBus bridge.
- **TypeScript 5.7** — Type safety throughout.
- **Vite 6** — Fast bundler with HMR.

### Why Phaser over alternatives
- **vs. plain Canvas/React**: Phaser provides built-in tilemap rendering, camera scrolling/zooming, sprite management, and input handling — all of which we'd need to build from scratch otherwise. For a Civ-like game, these are essential.
- **vs. PixiJS**: PixiJS is only a renderer. We'd need to build scene management, input handling, tilemap support, and camera manually. Phaser bundles all of this.
- **vs. Phaser 4**: Still in RC stage (RC6 as of Dec 2025). Phaser 3.90.0 is stable and well-documented. No templates for v4 yet.

### Foundation
- Based on the official [phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts) — provides the React-Phaser bridge, Vite bundling, and TypeScript setup out of the box.

### Sources
- [JS/TS Game Engines 2025 — GameFromScratch](https://gamefromscratch.com/javascript-typescript-game-engines-in-2025/)
- [Phaser vs PixiJS — DEV Community](https://dev.to/ritza/phaser-vs-pixijs-for-making-2d-games-2j8c)
- [Phaser 3 React TS Template — Phaser Studio](https://github.com/phaserjs/template-react-ts)
- [Phaser v3.90.0 stable release](https://phaser.io/download/stable)
- [Planet Mars Color Palette — color-hex.com](https://www.color-hex.com/color-palette/7175)

## Design Direction: "Dusty Mars Outpost"

A gritty, industrial sci-fi aesthetic evoking a survival outpost on Mars. Not clean Apple-white UI — this is a dusty, weathered interface.

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Background (deep) | Dark Martian soil | `#1a0d07` |
| Background (panel) | Dark rust | `#2d1810` |
| Surface / tiles | Mars red-brown | `#8b4513` |
| Rocks resource | Slate gray | `#708090` |
| Empty terrain | Rusty sand | `#c4956a` |
| Accent (primary) | Amber warning | `#e77d11` |
| Accent (secondary) | Tech teal | `#1ba2aa` |
| Text (primary) | Pale dust | `#e8ddd3` |
| Text (secondary) | Muted sand | `#a89580` |
| Unit highlight | Bright amber | `#fda600` |

### Typography
- **Display / HUD**: `"Share Tech Mono"` (Google Fonts) — monospaced, industrial, sci-fi feel
- **Body / tooltips**: `"Exo 2"` (Google Fonts) — clean, slightly futuristic, good readability

### Tile Design
Tiles rendered as flat colored rectangles with subtle border lines (not sprite-based for initial build). Each tile type has a distinct color:
- **Empty Mars terrain**: Rusty sand with slight color variation (procedural noise)
- **Rocks resource**: Gray stone overlay on terrain
- **Elon unit**: Bright amber marker with directional indicator

## Architecture

### Game Scenes (Phaser)
```
BootScene → GameScene
```

- **BootScene**: Minimal — sets up game config, transitions to GameScene
- **GameScene**: Main gameplay — renders tile map, handles unit movement, turn logic

### Game State Model
```typescript
interface GameState {
  map: TileMap;          // 2D grid of tiles
  unit: Unit;            // Elon Musk position + inventory
  turn: number;          // Current turn counter
  movesRemaining: number; // Moves left this turn
  phase: 'move' | 'action' | 'idle'; // Current turn phase
}

interface Tile {
  x: number;
  y: number;
  type: 'empty' | 'rocks';
  hasResource: boolean;
}

interface Unit {
  x: number;           // Grid position
  y: number;
  rocks: number;       // Collected rocks count
  movesPerTurn: number; // Movement budget (e.g., 3)
}
```

### Map Generation
- Grid size: 20x15 tiles (fits well in viewport with scrolling)
- ~10% tiles randomly assigned as 'rocks' resource tiles
- Elon placed at a random non-resource tile near center
- Seeded random for reproducibility (optional)

### Turn-Based System
1. **Start of turn**: Elon gets `movesPerTurn` (3) movement points
2. **Movement**: Click adjacent tile to move (costs 1 move point). Only orthogonal movement (4-directional).
3. **Gather action**: When on a rocks tile, player can click "Gather" to collect the resource (costs 1 move point). Removes rocks from tile, adds to inventory.
4. **End turn**: Player clicks "End Turn" or runs out of moves. Turn counter increments.

### React UI Layer (HUD)
- **Top bar**: Turn counter, rocks inventory count
- **Bottom bar**: "End Turn" button, "Gather Rocks" button (shown when on resource tile)
- **Status text**: Current phase indicator

### Phaser ↔ React Communication
Using the EventBus pattern from the official template:
- Phaser → React: `EventBus.emit('state-updated', gameState)` — sent after every state change
- React → Phaser: `EventBus.emit('end-turn')`, `EventBus.emit('gather-rocks')` — sent on button clicks
- GameScene listens for React events and updates state accordingly

### File Structure
```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Main React app (wraps PhaserGame + HUD)
├── PhaserGame.tsx              # Phaser-React bridge (from template)
├── game/
│   ├── main.ts                 # Phaser game config
│   ├── EventBus.ts             # Event bus (from template)
│   ├── scenes/
│   │   ├── Boot.ts             # Boot scene
│   │   └── Game.ts             # Main game scene
│   ├── map/
│   │   ├── MapGenerator.ts     # Random map generation
│   │   ├── TileRenderer.ts     # Tile rendering with Phaser graphics
│   │   └── types.ts            # Tile/map type definitions
│   ├── units/
│   │   └── Unit.ts             # Unit class (position, movement, inventory)
│   └── systems/
│       └── TurnSystem.ts       # Turn management logic
├── ui/
│   ├── HUD.tsx                 # Main HUD overlay component
│   ├── TopBar.tsx              # Turn counter + resources display
│   └── ActionBar.tsx           # End turn + gather buttons
└── styles/
    └── hud.css                 # HUD styling
public/
├── style.css                   # Global styles
└── assets/                     # (empty for now, sprites later)
```

## Module Boundaries

This is a **single-task** implementation. The game engine and UI are tightly coupled through the EventBus bridge — splitting them would create unnecessary integration overhead. The implementer will build both in sequence:

1. Project scaffolding (from template)
2. Map generation + rendering
3. Unit placement + movement
4. Turn system
5. Resource gathering
6. React HUD

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Game framework | Phaser 3 | Built-in tilemaps, camera, input — perfect for Civ-like game |
| UI framework | React | HUD/overlay layer, connected via EventBus |
| Rendering approach | Phaser Graphics API (rectangles) | No sprite assets needed for MVP; clean, colorful tiles |
| State location | Phaser scene | Game state lives in GameScene; React gets updates via EventBus |
| Map size | 20×15 | Playable without scrolling on most screens, but camera pan available |
| Movement | 4-directional, click-to-move | Simple, Civ-like; 3 moves per turn |
| Resource gathering | Explicit action on resource tile | Player must click "Gather" — not automatic on step |

## Constraints

- **No `.github/workflows/` changes** — agent fork token lacks workflow scope
- **No new dependencies beyond template** — Phaser + React + Vite covers everything needed
- **No sprite assets** — initial build uses Phaser Graphics API for all rendering (colored rectangles, circles, lines)
