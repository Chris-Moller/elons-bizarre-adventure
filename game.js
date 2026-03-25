/**
 * Elon's Bizarre Adventure - Mars Colony
 * A turn-based strategy game where Elon Musk crash-lands on Mars.
 */

(function () {
    "use strict";

    // --------------- Configuration ---------------
    const MAP_COLS = 24;
    const MAP_ROWS = 18;
    const TILE_SIZE = 40;
    const ROCK_CHANCE = 0.10;

    // Tile terrain types
    const TERRAIN = {
        SAND: "sand",
        DUST: "dust",
        CRATER: "crater",
    };

    const TERRAIN_COLORS = {
        [TERRAIN.SAND]: ["#8B4513", "#7A3B10", "#9C5015"],
        [TERRAIN.DUST]: ["#A0522D", "#934920", "#B05A30"],
        [TERRAIN.CRATER]: ["#654321", "#5A3A1C", "#704C26"],
    };

    // --------------- Unit Registry ---------------
    const UNIT_TYPES = {
        elon: {
            name: "Elon Musk",
            movesPerTurn: 2,
            canHarvest: ["rocks"],
            lifespan: null,
            degradeResource: null,
            buildCost: null,
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

    function createUnit(type, row, col) {
        var def = UNIT_TYPES[type];
        return {
            type: type,
            name: def.name,
            row: row,
            col: col,
            movesLeft: def.movesPerTurn,
            movesMax: def.movesPerTurn,
            turnsRemaining: def.lifespan,
        };
    }

    // --------------- State ---------------
    const state = {
        map: [],
        units: [],
        selectedUnit: 0,
        turn: 1,
        resources: { rocks: 0, energy: 0 },
        structures: [],
        selectedTile: null,
        logs: [],
        hotkeyModalOpen: false,
    };

    function getSelectedUnit() {
        return state.units[state.selectedUnit];
    }

    function getUnitAt(row, col) {
        for (var i = 0; i < state.units.length; i++) {
            if (state.units[i].row === row && state.units[i].col === col) {
                return state.units[i];
            }
        }
        return null;
    }

    // --------------- Map Generation ---------------
    function generateMap() {
        const terrainTypes = Object.values(TERRAIN);
        const map = [];
        for (let row = 0; row < MAP_ROWS; row++) {
            const mapRow = [];
            for (let col = 0; col < MAP_COLS; col++) {
                const terrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
                const hasRocks = Math.random() < ROCK_CHANCE;
                mapRow.push({
                    row,
                    col,
                    terrain,
                    resource: hasRocks ? "rocks" : null,
                    colorVariant: Math.floor(Math.random() * 3),
                });
            }
            map.push(mapRow);
        }
        return map;
    }

    function placeUnit(map) {
        let row, col;
        do {
            row = Math.floor(Math.random() * MAP_ROWS);
            col = Math.floor(Math.random() * MAP_COLS);
        } while (map[row][col].resource !== null);
        return createUnit("elon", row, col);
    }

    // --------------- Canvas Rendering ---------------
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = MAP_COLS * TILE_SIZE;
        canvas.height = MAP_ROWS * TILE_SIZE;
    }

    function drawTile(tile) {
        const x = tile.col * TILE_SIZE;
        const y = tile.row * TILE_SIZE;
        const colors = TERRAIN_COLORS[tile.terrain];
        ctx.fillStyle = colors[tile.colorVariant];
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Grid line
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

        // Resource: rocks
        if (tile.resource === "rocks") {
            drawRocks(x, y);
        }
    }

    function drawRocks(x, y) {
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;
        ctx.fillStyle = "#888888";
        // Draw a small cluster of rocks
        drawCircle(cx - 5, cy + 2, 6);
        ctx.fillStyle = "#777777";
        drawCircle(cx + 5, cy - 1, 5);
        ctx.fillStyle = "#999999";
        drawCircle(cx - 1, cy - 5, 4);
    }

    function drawCircle(x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawStructure(structure) {
        if (structure.type === "solar_panel") {
            drawSolarPanel(structure);
            return;
        }
        var x = structure.col * TILE_SIZE;
        var y = structure.row * TILE_SIZE;

        // Stone base
        ctx.fillStyle = "#6b5b4f";
        ctx.beginPath();
        ctx.moveTo(x + 6, y + TILE_SIZE - 6);
        ctx.lineTo(x + TILE_SIZE - 6, y + TILE_SIZE - 6);
        ctx.lineTo(x + TILE_SIZE - 8, y + 14);
        ctx.lineTo(x + 8, y + 14);
        ctx.closePath();
        ctx.fill();

        // Darker stone outline
        ctx.strokeStyle = "#4a3c33";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Roof (triangle)
        ctx.fillStyle = "#8b7355";
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 16);
        ctx.lineTo(x + TILE_SIZE - 4, y + 16);
        ctx.lineTo(x + TILE_SIZE / 2, y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#5a4a3a";
        ctx.stroke();

        // Door
        ctx.fillStyle = "#2a1a0a";
        ctx.fillRect(x + TILE_SIZE / 2 - 3, y + TILE_SIZE - 12, 6, 6);

        // Label
        ctx.fillStyle = "#d4a574";
        ctx.font = "bold 7px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("HOVEL", x + TILE_SIZE / 2, y + TILE_SIZE - 1);
    }

    function drawSolarPanel(structure) {
        var x = structure.col * TILE_SIZE;
        var y = structure.row * TILE_SIZE;

        // Panel base (dark frame)
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, TILE_SIZE - 16);

        // Solar cells (blue gradient)
        ctx.fillStyle = "#2255aa";
        ctx.fillRect(x + 6, y + 10, TILE_SIZE - 12, TILE_SIZE - 20);

        // Grid lines on panel
        ctx.strokeStyle = "#3366cc";
        ctx.lineWidth = 0.5;
        // Horizontal lines
        var panelTop = y + 10;
        var panelBottom = y + TILE_SIZE - 10;
        var panelLeft = x + 6;
        var panelRight = x + TILE_SIZE - 6;
        var cellHeight = (panelBottom - panelTop) / 3;
        for (var i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(panelLeft, panelTop + cellHeight * i);
            ctx.lineTo(panelRight, panelTop + cellHeight * i);
            ctx.stroke();
        }
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x + TILE_SIZE / 2, panelTop);
        ctx.lineTo(x + TILE_SIZE / 2, panelBottom);
        ctx.stroke();

        // Shine effect
        ctx.fillStyle = "rgba(100, 180, 255, 0.25)";
        ctx.fillRect(x + 7, y + 11, 8, 5);

        // Support pole
        ctx.fillStyle = "#555555";
        ctx.fillRect(x + TILE_SIZE / 2 - 2, y + TILE_SIZE - 10, 4, 6);

        // Frame outline
        ctx.strokeStyle = "#334466";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 4, y + 8, TILE_SIZE - 8, TILE_SIZE - 16);

        // Label
        ctx.fillStyle = "#66aaff";
        ctx.font = "bold 6px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SOLAR", x + TILE_SIZE / 2, y + TILE_SIZE - 1);
    }

    function drawElonUnit(unit, isSelected) {
        const x = unit.col * TILE_SIZE;
        const y = unit.row * TILE_SIZE;

        // Highlight the unit tile
        ctx.fillStyle = isSelected ? "rgba(255, 204, 0, 0.25)" : "rgba(255, 204, 0, 0.10)";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Draw Elon as a simple character
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;

        // Spacesuit body
        ctx.fillStyle = "#dddddd";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = "#4488cc";
        drawCircle(cx, cy - 6, 8);

        // Visor
        ctx.fillStyle = "#88ccff";
        drawCircle(cx, cy - 6, 5);

        // Face
        ctx.fillStyle = "#ffcc88";
        drawCircle(cx, cy - 6, 4);

        // Label
        ctx.fillStyle = isSelected ? "#ffcc00" : "#aa8800";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ELON", cx, y + TILE_SIZE - 2);
    }

    function drawRocktimusRobot(unit, isSelected) {
        var x = unit.col * TILE_SIZE;
        var y = unit.row * TILE_SIZE;
        var cx = x + TILE_SIZE / 2;

        // Highlight the unit tile
        ctx.fillStyle = isSelected ? "rgba(255, 204, 0, 0.25)" : "rgba(100, 200, 160, 0.10)";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Metallic gray rectangular body
        ctx.fillStyle = "#888888";
        ctx.fillRect(x + 10, y + 10, TILE_SIZE - 20, TILE_SIZE - 18);

        // Darker outline
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 10, y + 10, TILE_SIZE - 20, TILE_SIZE - 18);

        // Head (smaller rect on top)
        ctx.fillStyle = "#999999";
        ctx.fillRect(x + 13, y + 4, TILE_SIZE - 26, 8);
        ctx.strokeStyle = "#666666";
        ctx.strokeRect(x + 13, y + 4, TILE_SIZE - 26, 8);

        // Orange/amber eyes
        ctx.fillStyle = "#ff8800";
        drawCircle(cx - 4, y + 8, 2);
        drawCircle(cx + 4, y + 8, 2);

        // Rocky texture details (small gray circles on body)
        ctx.fillStyle = "#777777";
        drawCircle(cx - 3, y + 18, 2);
        ctx.fillStyle = "#999999";
        drawCircle(cx + 4, y + 22, 2);
        ctx.fillStyle = "#6a6a6a";
        drawCircle(cx, y + 26, 1.5);

        // Label
        ctx.fillStyle = isSelected ? "#44ccaa" : "#338866";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ROBO", cx, y + TILE_SIZE - 2);

        // Lifespan badge (small number in top-right corner)
        if (unit.turnsRemaining !== null) {
            ctx.fillStyle = "#cc3333";
            drawCircle(x + TILE_SIZE - 8, y + 6, 6);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(String(unit.turnsRemaining), x + TILE_SIZE - 8, y + 9);
        }
    }

    function drawHighlight(tile, color) {
        const x = tile.col * TILE_SIZE;
        const y = tile.row * TILE_SIZE;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    function drawMoveRange(unit) {
        if (unit.movesLeft <= 0) return;

        // BFS flood fill for reachable tiles within movesLeft steps (8-directional)
        var visited = {};
        var queue = [{ row: unit.row, col: unit.col, dist: 0 }];
        visited[unit.row + "," + unit.col] = true;

        while (queue.length > 0) {
            var current = queue.shift();
            if (current.dist >= unit.movesLeft) continue;

            for (var dr = -1; dr <= 1; dr++) {
                for (var dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    var nr = current.row + dr;
                    var nc = current.col + dc;
                    var key = nr + "," + nc;
                    if (nr >= 0 && nr < MAP_ROWS && nc >= 0 && nc < MAP_COLS && !visited[key]) {
                        visited[key] = true;
                        queue.push({ row: nr, col: nc, dist: current.dist + 1 });
                    }
                }
            }
        }

        // Draw all reachable tiles (except the unit's own tile)
        for (var tileKey in visited) {
            var parts = tileKey.split(",");
            var r = parseInt(parts[0], 10);
            var c = parseInt(parts[1], 10);
            if (r === unit.row && c === unit.col) continue;
            var tx = c * TILE_SIZE;
            var ty = r * TILE_SIZE;
            ctx.fillStyle = "rgba(100, 180, 255, 0.15)";
            ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "rgba(100, 180, 255, 0.4)";
            ctx.lineWidth = 1;
            ctx.strokeRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all tiles
        for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
                drawTile(state.map[row][col]);
            }
        }

        // Draw structures
        for (var i = 0; i < state.structures.length; i++) {
            drawStructure(state.structures[i]);
        }

        // Draw movement range for selected unit
        var selected = getSelectedUnit();
        if (selected) {
            drawMoveRange(selected);
        }

        // Draw all units
        for (var u = 0; u < state.units.length; u++) {
            var unit = state.units[u];
            var isSelected = (u === state.selectedUnit);
            if (unit.type === "rocktimus") {
                drawRocktimusRobot(unit, isSelected);
            } else {
                drawElonUnit(unit, isSelected);
            }
        }

        // Draw selected unit border highlight
        if (selected) {
            drawHighlight({ col: selected.col, row: selected.row }, "#ffcc00");
        }

        // Draw selected tile highlight
        if (state.selectedTile) {
            drawHighlight(state.selectedTile, "#ffcc00");
        }
    }

    // --------------- UI Updates ---------------
    function updateUI() {
        var unit = getSelectedUnit();
        document.getElementById("turn-number").textContent = state.turn;
        document.getElementById("unit-name").textContent = unit.name;
        document.getElementById("moves-left").textContent = unit.movesLeft;
        document.getElementById("moves-max").textContent = unit.movesMax;
        document.getElementById("rocks-count").textContent = state.resources.rocks;
        document.getElementById("energy-count").textContent = state.resources.energy;

        // Lifespan display
        var lifespanEl = document.getElementById("unit-lifespan");
        if (lifespanEl) {
            if (unit.turnsRemaining !== null) {
                lifespanEl.textContent = "Lifespan: " + unit.turnsRemaining + " turns";
                lifespanEl.style.display = "";
            } else {
                lifespanEl.textContent = "";
                lifespanEl.style.display = "none";
            }
        }

        // Gather button — use generalized canHarvest
        const gatherBtn = document.getElementById("gather-btn");
        const unitTile = state.map[unit.row][unit.col];
        var canHarvest = unitTile.resource && UNIT_TYPES[unit.type].canHarvest.includes(unitTile.resource);
        gatherBtn.disabled = !canHarvest;

        // Build Rock Hovel button
        var buildBtn = document.getElementById("build-hovel-btn");
        var hasStructureOnTile = getStructureAt(unit.row, unit.col) !== null;
        buildBtn.disabled = state.resources.rocks < 10 || hasStructureOnTile;

        // Build Solar Panel button
        var solarBtn = document.getElementById("build-solar-btn");
        solarBtn.disabled = !canBuildSolarPanel();

        // Build Rocktimus button
        var rocktimusBtn = document.getElementById("build-rocktimus-btn");
        if (rocktimusBtn) {
            rocktimusBtn.disabled = !canBuildRocktimus();
        }

        // Tile info
        updateTileInfo();
    }

    function updateTileInfo() {
        const el = document.getElementById("tile-details");
        if (!state.selectedTile) {
            el.innerHTML = "Click a tile to inspect";
            return;
        }
        const tile = state.selectedTile;
        const terrainName = tile.terrain.charAt(0).toUpperCase() + tile.terrain.slice(1);
        const resourceText = tile.resource ? "Rocks" : "None";
        var unitOnTile = getUnitAt(tile.row, tile.col);
        var tileStructure = getStructureAt(tile.row, tile.col);
        var structureText = "None";
        var energyText = "";
        if (tileStructure) {
            if (tileStructure.type === "rock_hovel") {
                structureText = "Rock Hovel";
                energyText = '<div><strong>Energy:</strong> ' + tileStructure.energy + ' / 2</div>';
            } else if (tileStructure.type === "solar_panel") {
                structureText = "Solar Panel";
            }
        }
        var unitText = unitOnTile ? '<div><strong>Unit:</strong> ' + unitOnTile.name + '</div>' : "";
        el.innerHTML = '<div><strong>Terrain:</strong> ' + terrainName + '</div>' +
            '<div><strong>Position:</strong> (' + tile.col + ', ' + tile.row + ')</div>' +
            '<div><strong>Resource:</strong> ' + resourceText + '</div>' +
            '<div><strong>Structure:</strong> ' + structureText + '</div>' +
            energyText + unitText;
    }

    function addLog(message, type) {
        state.logs.unshift({ message, type });
        if (state.logs.length > 50) state.logs.pop();
        renderLog();
    }

    function renderLog() {
        const logEl = document.getElementById("game-log");
        logEl.innerHTML = state.logs
            .map((l) => `<div class="log-entry ${l.type}">${l.message}</div>`)
            .join("");
    }

    // --------------- Game Actions ---------------
    function moveUnit(targetRow, targetCol) {
        const unit = getSelectedUnit();
        if (unit.movesLeft <= 0) return;

        const dr = Math.abs(targetRow - unit.row);
        const dc = Math.abs(targetCol - unit.col);

        // Must be adjacent (including diagonal)
        if (dr > 1 || dc > 1 || (dr === 0 && dc === 0)) return;

        // Bounds check
        if (targetRow < 0 || targetRow >= MAP_ROWS || targetCol < 0 || targetCol >= MAP_COLS) return;

        // Cannot move onto a tile occupied by another unit
        if (getUnitAt(targetRow, targetCol)) return;

        unit.row = targetRow;
        unit.col = targetCol;
        unit.movesLeft--;

        addLog(unit.name + " moved to (" + targetCol + ", " + targetRow + ")", "move");

        state.selectedTile = state.map[targetRow][targetCol];
        render();
        updateUI();
    }

    function gatherResource() {
        var unit = getSelectedUnit();
        const tile = state.map[unit.row][unit.col];
        var canHarvest = tile.resource && UNIT_TYPES[unit.type].canHarvest.includes(tile.resource);
        if (!canHarvest) return;

        if (tile.resource === "rocks") {
            tile.resource = null;
            state.resources.rocks++;
            addLog(unit.name + " gathered Rocks! (Total: " + state.resources.rocks + ")", "gather");
        }

        render();
        updateUI();
    }

    function getStructureAt(row, col) {
        for (var i = 0; i < state.structures.length; i++) {
            if (state.structures[i].row === row && state.structures[i].col === col) {
                return state.structures[i];
            }
        }
        return null;
    }

    function buildRockHovel() {
        if (state.resources.rocks < 10) return;
        var unit = getSelectedUnit();
        if (getStructureAt(unit.row, unit.col) !== null) return;

        state.resources.rocks -= 10;
        state.structures.push({
            type: "rock_hovel",
            row: unit.row,
            col: unit.col,
            energy: 0,
        });

        addLog(unit.name + " built a Rock Hovel at (" + unit.col + ", " + unit.row + ")", "build");

        render();
        updateUI();
    }

    function getAdjacentHovels(row, col) {
        var hovels = [];
        for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                var nr = row + dr;
                var nc = col + dc;
                if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) continue;
                var s = getStructureAt(nr, nc);
                if (s && s.type === "rock_hovel") {
                    hovels.push(s);
                }
            }
        }
        return hovels;
    }

    function canBuildSolarPanel() {
        var unit = getSelectedUnit();
        if (state.resources.rocks < 2) return false;
        if (getStructureAt(unit.row, unit.col) !== null) return false;
        var hovels = getAdjacentHovels(unit.row, unit.col);
        return hovels.length > 0;
    }

    function buildSolarPanel() {
        if (!canBuildSolarPanel()) return;
        var unit = getSelectedUnit();

        state.resources.rocks -= 2;
        state.structures.push({
            type: "solar_panel",
            row: unit.row,
            col: unit.col,
        });

        addLog(unit.name + " built a Solar Panel at (" + unit.col + ", " + unit.row + ")", "build");

        render();
        updateUI();
    }

    // --------------- Rocktimus Construction ---------------
    function findAdjacentOpenTile(row, col) {
        for (var dr = -1; dr <= 1; dr++) {
            for (var dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                var nr = row + dr;
                var nc = col + dc;
                if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) continue;
                if (getUnitAt(nr, nc)) continue;
                if (getStructureAt(nr, nc)) continue;
                return { row: nr, col: nc };
            }
        }
        return null;
    }

    function canBuildRocktimus() {
        var unit = getSelectedUnit();
        var structure = getStructureAt(unit.row, unit.col);
        if (!structure || structure.type !== "rock_hovel") return false;
        if (state.resources.energy < 2) return false;
        if (state.resources.rocks < 1) return false;
        if (!findAdjacentOpenTile(unit.row, unit.col)) return false;
        return true;
    }

    function buildRocktimus() {
        if (!canBuildRocktimus()) return;
        var unit = getSelectedUnit();

        state.resources.energy -= 2;
        state.resources.rocks -= 1;

        var openTile = findAdjacentOpenTile(unit.row, unit.col);
        var robot = createUnit("rocktimus", openTile.row, openTile.col);
        state.units.push(robot);

        addLog(unit.name + " constructed a Rocktimus Robot at (" + openTile.col + ", " + openTile.row + ")", "construct");

        render();
        updateUI();
    }

    // --------------- Solar Panels ---------------
    function processSolarPanels() {
        var totalGenerated = 0;
        for (var i = 0; i < state.structures.length; i++) {
            var panel = state.structures[i];
            if (panel.type !== "solar_panel") continue;

            // 50% chance to generate energy
            if (Math.random() < 0.5) {
                var hovels = getAdjacentHovels(panel.row, panel.col);
                for (var j = 0; j < hovels.length; j++) {
                    if (hovels[j].energy < 2) {
                        hovels[j].energy++;
                        state.resources.energy++;
                        totalGenerated++;
                        break;
                    }
                }
            }
        }
        if (totalGenerated > 0) {
            addLog("Solar Panels generated " + totalGenerated + " Energy! (Total: " + state.resources.energy + ")", "energy");
        }
    }

    // --------------- Unit Degradation ---------------
    function processUnitDegradation() {
        for (var i = state.units.length - 1; i >= 0; i--) {
            var unit = state.units[i];
            if (unit.turnsRemaining === null) continue;
            unit.turnsRemaining--;
            if (unit.turnsRemaining <= 0) {
                // Place degrade resource on tile
                var def = UNIT_TYPES[unit.type];
                if (def.degradeResource) {
                    var tile = state.map[unit.row][unit.col];
                    tile.resource = def.degradeResource.type;
                }
                addLog(unit.name + " has degraded at (" + unit.col + ", " + unit.row + ")", "degrade");
                state.units.splice(i, 1);
                // Clamp selectedUnit
                if (state.selectedUnit >= state.units.length) {
                    state.selectedUnit = 0;
                }
            }
        }
    }

    // --------------- Turn ---------------
    function endTurn() {
        state.turn++;

        // Reset moves for all units
        for (var i = 0; i < state.units.length; i++) {
            state.units[i].movesLeft = state.units[i].movesMax;
        }

        addLog("--- Turn " + state.turn + " ---", "turn");

        processUnitDegradation();
        processSolarPanels();

        render();
        updateUI();
    }

    function toggleHotkeyModal() {
        state.hotkeyModalOpen = !state.hotkeyModalOpen;
        document.getElementById("hotkey-modal").classList.toggle("hidden", !state.hotkeyModalOpen);
    }

    // --------------- Input Handling ---------------
    function getTileFromClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / TILE_SIZE);
        const row = Math.floor(y / TILE_SIZE);
        if (row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS) {
            return state.map[row][col];
        }
        return null;
    }

    canvas.addEventListener("click", function (e) {
        const tile = getTileFromClick(e);
        if (!tile) return;

        // Check if clicked tile has a unit — select it
        var clickedUnit = getUnitAt(tile.row, tile.col);
        if (clickedUnit) {
            var idx = state.units.indexOf(clickedUnit);
            if (idx !== -1) {
                state.selectedUnit = idx;
                state.selectedTile = tile;
                render();
                updateUI();
                return;
            }
        }

        // Otherwise, try to move the selected unit
        const unit = getSelectedUnit();
        const dr = Math.abs(tile.row - unit.row);
        const dc = Math.abs(tile.col - unit.col);

        if (dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0) && unit.movesLeft > 0) {
            moveUnit(tile.row, tile.col);
        } else {
            // Just select the tile
            state.selectedTile = tile;
            render();
            updateUI();
        }
    });

    document.getElementById("end-turn-btn").addEventListener("click", endTurn);
    document.getElementById("gather-btn").addEventListener("click", gatherResource);
    document.getElementById("build-hovel-btn").addEventListener("click", buildRockHovel);
    document.getElementById("build-solar-btn").addEventListener("click", buildSolarPanel);
    document.getElementById("build-rocktimus-btn").addEventListener("click", buildRocktimus);
    document.getElementById("close-hotkey-modal").addEventListener("click", toggleHotkeyModal);

    // Keyboard controls
    document.addEventListener("keydown", function (e) {
        // Handle hotkey modal toggle
        if (e.key === "Escape") {
            e.preventDefault();
            toggleHotkeyModal();
            return;
        }

        // Block all game input while modal is open
        if (state.hotkeyModalOpen) return;

        const unit = getSelectedUnit();
        let dr = 0;
        let dc = 0;

        switch (e.key) {
            case "ArrowUp":
            case "w":
                dr = -1;
                break;
            case "ArrowDown":
            case "s":
                dr = 1;
                break;
            case "ArrowLeft":
            case "a":
                dc = -1;
                break;
            case "ArrowRight":
            case "d":
                dc = 1;
                break;
            case "g":
                gatherResource();
                return;
            case "b":
                buildRockHovel();
                return;
            case "p":
                buildSolarPanel();
                return;
            case "r":
                buildRocktimus();
                return;
            case "Tab":
                e.preventDefault();
                if (state.units.length > 1) {
                    state.selectedUnit = (state.selectedUnit + 1) % state.units.length;
                    var sel = getSelectedUnit();
                    state.selectedTile = state.map[sel.row][sel.col];
                    render();
                    updateUI();
                }
                return;
            case "Enter":
            case "e":
                endTurn();
                return;
            default:
                return;
        }

        e.preventDefault();
        moveUnit(unit.row + dr, unit.col + dc);
    });

    // --------------- Initialization ---------------
    function init() {
        state.map = generateMap();
        var elonUnit = placeUnit(state.map);
        state.units = [elonUnit];
        state.selectedUnit = 0;
        state.turn = 1;
        state.resources = { rocks: 0, energy: 0 };
        state.structures = [];
        state.logs = [];
        state.selectedTile = state.map[elonUnit.row][elonUnit.col];

        resizeCanvas();
        addLog("Elon has crash-landed on Mars!", "turn");
        addLog("--- Turn 1 ---", "turn");
        render();
        updateUI();
    }

    init();
})();
