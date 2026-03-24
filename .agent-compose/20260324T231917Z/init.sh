#!/bin/bash
set -euo pipefail

# Init script for Elon's Bizarre Adventure
# Scaffolds from official Phaser 3 React TypeScript template + installs deps
# Safe to run multiple times (idempotent)

PROJECT_DIR="/home/user/workspace-faf59d75-planner-e22a5618"
TEMPLATE_REPO="https://github.com/phaserjs/template-react-ts.git"
TEMPLATE_BRANCH="main"

cd "$PROJECT_DIR"

# Check if project is already scaffolded (package.json with phaser dep exists)
if [ -f "package.json" ] && grep -q '"phaser"' package.json 2>/dev/null; then
  echo "[init] package.json with phaser already exists — skipping template clone"
else
  echo "[init] Scaffolding from Phaser 3 React TypeScript template..."

  # Clone template into a temp dir, then copy files (preserving our existing files)
  TMPDIR=$(mktemp -d)
  git clone --depth 1 --branch "$TEMPLATE_BRANCH" "$TEMPLATE_REPO" "$TMPDIR"

  # Copy template files into project, but don't overwrite CLAUDE.md, README.md, or .github/
  # Use rsync-like approach with cp
  for item in "$TMPDIR"/*; do
    basename_item=$(basename "$item")
    # Skip files we want to keep from our repo
    case "$basename_item" in
      CLAUDE.md|README.md|.git|.github)
        echo "[init] Skipping $basename_item (preserving existing)"
        continue
        ;;
    esac
    cp -r "$item" "$PROJECT_DIR/"
  done

  # Copy hidden files from template (like .gitignore, .eslintrc, etc.) but not .git
  for item in "$TMPDIR"/.*; do
    basename_item=$(basename "$item")
    case "$basename_item" in
      .|..|.git|.github)
        continue
        ;;
    esac
    cp -r "$item" "$PROJECT_DIR/"
  done

  rm -rf "$TMPDIR"
  echo "[init] Template files copied successfully"
fi

# Install dependencies
if [ -d "node_modules" ] && [ -f "node_modules/.package-lock.json" ]; then
  echo "[init] node_modules exists — skipping npm install"
else
  echo "[init] Installing dependencies..."
  npm install
  echo "[init] Dependencies installed"
fi

# Verify key files exist
echo "[init] Verifying project structure..."
for f in package.json tsconfig.json index.html src/main.tsx src/App.tsx src/PhaserGame.tsx src/game/main.ts src/game/EventBus.ts; do
  if [ ! -f "$PROJECT_DIR/$f" ]; then
    echo "[init] WARNING: Expected file missing: $f"
  fi
done

echo "[init] Setup complete. Run 'npm run dev' to start development server."
