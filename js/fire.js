// --- ASCII FIRE CONFIG ---
const fireWidth = 300;
const fireHeight = 70;

// Fire settings (exposed for admin panel)
const config = window.FIRE_CONFIG || {
    speed: 60,      // ms per frame
    decay: 7,       // higher = shorter flames
    wind: 0.0,      // -1.0 to 1.0
    chaos: 0.3,     // 0.0 to 1.0 (internal)
    flameOffset: 0, // distance between text and flame source
    palette: "red"  // 'red' | 'purple' | 'green'
};

window.FIRE_CONFIG = config;

// Data buffers
const firePixels = new Array(fireWidth * fireHeight).fill(0);
let fireSourceIndices = [];
let textOverlayIndices = new Map();

// ASCII Art for the header
const asciiArtRaw = [
    " ██████             ██    ██            ███████            ██████             ██                  ██████              ██████             ██   ██ ",
    "██    ██            ██    ██            ██                 ██   ██            ██                 ██    ██            ██    ██            ██   ██  ",
    "██    ██            ██    ██            █████              ██████             ██                 ██    ██            ██    ██            █████   ",
    "██    ██             ██  ██             ██                 ██   ██            ██                 ██    ██            ██    ██            ██   ██  ",
    " ██████               ████              ███████            ██   ██            ███████             ██████              ██████             ██   ██ "
];

// ---- PALETTES ----

// RED palette
const redPalette = [
  {"r":7,"g":7,"b":7},
  {"r":31,"g":7,"b":7},
  {"r":47,"g":15,"b":7},
  {"r":71,"g":15,"b":7},
  {"r":87,"g":23,"b":7},
  {"r":103,"g":31,"b":7},
  {"r":119,"g":31,"b":7},
  {"r":143,"g":39,"b":7},
  {"r":159,"g":47,"b":7},
  {"r":175,"g":63,"b":7},
  {"r":191,"g":71,"b":7},
  {"r":199,"g":71,"b":7},
  {"r":223,"g":79,"b":7},
  {"r":223,"g":87,"b":7},
  {"r":223,"g":87,"b":7},
  {"r":215,"g":95,"b":7},
  {"r":215,"g":95,"b":7},
  {"r":215,"g":103,"b":15},
  {"r":207,"g":111,"b":15},
  {"r":207,"g":119,"b":15},
  {"r":207,"g":127,"b":15},
  {"r":207,"g":135,"b":23},
  {"r":199,"g":135,"b":23},
  {"r":199,"g":143,"b":23},
  {"r":199,"g":151,"b":31},
  {"r":191,"g":159,"b":31},
  {"r":191,"g":159,"b":31},
  {"r":191,"g":167,"b":39},
  {"r":191,"g":167,"b":39},
  {"r":191,"g":175,"b":47},
  {"r":183,"g":175,"b":47},
  {"r":183,"g":183,"b":47},
  {"r":183,"g":183,"b":55},
  {"r":207,"g":207,"b":111},
  {"r":223,"g":223,"b":159},
  {"r":239,"g":239,"b":199},
  {"r":255,"g":255,"b":255}
];

// PURPLE palette
const purplePalette = [
  {"r":4,"g":4,"b":16},
  {"r":33,"g":0,"b":33},
  {"r":51,"g":2,"b":51},
  {"r":77,"g":0,"b":77},
  {"r":94,"g":0,"b":94},
  {"r":111,"g":2,"b":111},
  {"r":129,"g":0,"b":129},
  {"r":154,"g":0,"b":154},
  {"r":172,"g":2,"b":172},
  {"r":189,"g":20,"b":189},
  {"r":206,"g":25,"b":206},
  {"r":215,"g":21,"b":215},
  {"r":241,"g":23,"b":241},
  {"r":241,"g":35,"b":241},
  {"r":241,"g":35,"b":241},
  {"r":232,"g":51,"b":232},
  {"r":232,"g":51,"b":232},
  {"r":229,"g":59,"b":241},
  {"r":217,"g":71,"b":241},
  {"r":217,"g":84,"b":241},
  {"r":207,"g":88,"b":255},
  {"r":207,"g":100,"b":255},
  {"r":195,"g":100,"b":255},
  {"r":195,"g":112,"b":255},
  {"r":186,"g":116,"b":255},
  {"r":174,"g":128,"b":255},
  {"r":174,"g":128,"b":255},
  {"r":165,"g":132,"b":255},
  {"r":165,"g":132,"b":255},
  {"r":165,"g":143,"b":255},
  {"r":154,"g":143,"b":255},
  {"r":154,"g":154,"b":255},
  {"r":154,"g":154,"b":255},
  {"r":188,"g":188,"b":255},
  {"r":210,"g":210,"b":255},
  {"r":233,"g":233,"b":255},
  {"r":255,"g":255,"b":255}
];

// GREEN palette
const greenPalette = [
  {"r":4,"g":16,"b":4},
  {"r":10,"g":33,"b":10},
  {"r":15,"g":50,"b":15},
  {"r":18,"g":75,"b":18},
  {"r":24,"g":92,"b":24},
  {"r":29,"g":109,"b":29},
  {"r":35,"g":126,"b":35},
  {"r":40,"g":151,"b":40},
  {"r":47,"g":168,"b":47},
  {"r":54,"g":184,"b":54},
  {"r":61,"g":201,"b":61},
  {"r":68,"g":210,"b":68},
  {"r":76,"g":236,"b":76},
  {"r":83,"g":236,"b":83},
  {"r":91,"g":236,"b":91},
  {"r":99,"g":228,"b":99},
  {"r":108,"g":228,"b":108},
  {"r":122,"g":236,"b":122},
  {"r":133,"g":236,"b":133},
  {"r":145,"g":236,"b":145},
  {"r":157,"g":252,"b":157},
  {"r":168,"g":252,"b":168},
  {"r":180,"g":252,"b":180},
  {"r":192,"g":252,"b":192},
  {"r":204,"g":255,"b":204},
  {"r":216,"g":255,"b":216},
  {"r":228,"g":255,"b":228},
  {"r":239,"g":255,"b":239},
  {"r":247,"g":255,"b":247},
  {"r":255,"g":255,"b":255},
  {"r":255,"g":255,"b":212},
  {"r":255,"g":255,"b":190},
  {"r":255,"g":255,"b":169},
  {"r":255,"g":255,"b":147},
  {"r":255,"g":255,"b":125},
  {"r":255,"g":255,"b":125},
  {"r":255,"g":255,"b":125}
];

function getCurrentPalette() {
    const tint = (window.FIRE_CONFIG && FIRE_CONFIG.palette) || "red";
    if (tint === "purple") return purplePalette;
    if (tint === "green") return greenPalette;
    return redPalette;
}

// ------------------------------
// FIRE INITIALIZATION
// ------------------------------
function init() {
    parseArtForSources();
    gameLoop();
}

function parseArtForSources() {
    const artHeight = asciiArtRaw.length;
    const artWidth = asciiArtRaw[0].length;

    const startX = Math.floor((fireWidth - artWidth) / 2);
    const startY = fireHeight - artHeight - 4;

    for (let x = 0; x < artWidth; x++) {
        let foundTopForColumn = false;

        for (let y = 0; y < artHeight; y++) {
            const char = asciiArtRaw[y][x];
            const isBlock = char && char.trim().length > 0;

            if (isBlock) {
                const gridIndex = (startY + y) * fireWidth + (startX + x);
                textOverlayIndices.set(gridIndex, char);

                if (!foundTopForColumn) {
                    const sourceRow = (startY + y) - config.flameOffset;
                    if (sourceRow >= 0) {
                        const sourceIndex = sourceRow * fireWidth + (startX + x);
                        fireSourceIndices.push(sourceIndex);
                    }
                    foundTopForColumn = true;
                }
            }
        }
    }
}

function updateFireSource() {
    fireSourceIndices.forEach(index => {
        if (Math.random() > (config.chaos * 0.2)) {
            firePixels[index] = 30 + Math.floor(Math.random() * 7);
        } else {
            firePixels[index] = Math.max(0, firePixels[index] - 10);
        }
    });
}

function spreadFire(src) {
    const pixel = firePixels[src];

    if (pixel === 0) {
        firePixels[src - fireWidth] = 0;
    } else {
        const rand = Math.random();
        const decay = Math.floor(rand * config.decay);

        let wind = 0;
        const windRoll = Math.random() + (config.wind * 0.5);
        if (windRoll < 0.33) wind = -1;
        else if (windRoll > 0.66) wind = 1;

        if (config.wind > 1) wind = 1;
        if (config.wind < -1) wind = -1;

        const destIndex = src - fireWidth + wind;

        if (destIndex >= 0 && destIndex < firePixels.length) {
            const currentRow = Math.floor(src / fireWidth);
            const destRow = Math.floor(destIndex / fireWidth);
            if (destRow !== currentRow - 1) return;

            const newHeat = pixel - decay;
            firePixels[destIndex] = newHeat > 0 ? newHeat : 0;
        }
    }
}

function getCharForHeat(heat) {
    if (heat < 6) return ' ';

    const rand = Math.random();

    if (heat < 15) return rand > 0.5 ? '.' : '`';
    if (heat < 25) return rand > 0.5 ? '\\' : '/';
    return rand > 0.5 ? '(' : ')';
}

function renderFire() {
    let html = '';
    const palette = getCurrentPalette();

    for (let y = 0; y < fireHeight; y++) {
        let row = '';

        for (let x = 0; x < fireWidth; x++) {
            const index = y * fireWidth + x;

            if (textOverlayIndices.has(index)) {
                row += `<span style="color: #FFFFFF;">${textOverlayIndices.get(index)}</span>`;
                continue;
            }

            const heat = firePixels[index];

            if (heat > 0) {
                const color = palette[heat] || palette[palette.length - 1];
                const char = getCharForHeat(heat);
                const rgb = `rgb(${color.r},${color.g},${color.b})`;

                const shadow = heat > 28 ? `text-shadow: 0 0 4px ${rgb};` : '';

                row += `<span style="color: ${rgb}; ${shadow}">${char}</span>`;
            } else {
                row += `<span> </span>`;
            }
        }

        html += row + '<br>';
    }

    const stage = document.getElementById('fire-stage');
    if (stage) {
        stage.innerHTML = html;
    }
}

function updateFire() {
    updateFireSource();
    for (let x = 0; x < fireWidth; x++) {
        for (let y = 1; y < fireHeight; y++) {
            spreadFire(y * fireWidth + x);
        }
    }
    renderFire();
}

function gameLoop() {
    updateFire();
    setTimeout(gameLoop, config.speed);
}

init();
