// --- ADMIN ACTIVATION: type "admin" anywhere ---
let adminSequence = "";
const adminCode = "admin";

document.addEventListener("keydown", (e) => {
    adminSequence += e.key.toLowerCase();

    if (adminSequence.length > adminCode.length) {
        adminSequence = adminSequence.slice(-adminCode.length);
    }

    if (adminSequence === adminCode) {
        openAdminPanel();
        adminSequence = "";
    }
});

function openAdminPanel() {
    const panel = document.getElementById("admin-panel");
    panel.classList.remove("admin-hidden");

    const win = document.getElementById("admin-window");

    // clear any previous transform
    win.style.transform = "";
    // temporarily position so we can measure size
    win.style.left = "0px";
    win.style.top = "0px";

    // measure window size
    const rect = win.getBoundingClientRect();

    // center using real pixel positions
    const x = (window.innerWidth - rect.width) / 2;
    const y = (window.innerHeight - rect.height) / 2;

    win.style.left = `${Math.max(0, x)}px`;
    win.style.top = `${Math.max(0, y)}px`;

    showAdminView("panel");
}


function closeAdminPanel() {
    const panel = document.getElementById("admin-panel");
    panel.classList.add("admin-hidden");
}

document.getElementById("admin-close").onclick = closeAdminPanel;


// --- DRAGGABLE WINDOW (drag from title bar) ---
(function () {
    const win = document.getElementById("admin-window");
    const bar = document.getElementById("admin-titlebar");

    let offsetX = 0;
    let offsetY = 0;
    let isDown = false;

    bar.addEventListener("mousedown", (e) => {
        isDown = true;
        win.style.transform = ""; // stop centering after drag
        offsetX = win.offsetLeft - e.clientX;
        offsetY = win.offsetTop - e.clientY;
    });

    document.addEventListener("mouseup", () => {
        isDown = false;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        win.style.left = e.clientX + offsetX + "px";
        win.style.top = e.clientY + offsetY + "px";
    });
})();


// --- VIEW SWITCHING (file-style UI) ---
const titleText = document.getElementById("admin-title-text");
const backBtn = document.getElementById("admin-back");

function showAdminView(viewName) {
    const views = document.querySelectorAll(".admin-view");
    views.forEach(v => v.classList.remove("admin-view-active"));

    if (viewName === "panel") {
        document.getElementById("admin-view-panel").classList.add("admin-view-active");
        titleText.textContent = "admin - panel";
    } else if (viewName === "fire") {
        document.getElementById("admin-view-fire").classList.add("admin-view-active");
        titleText.textContent = "admin - fire.config";
    } else if (viewName === "visualizer") {
        document.getElementById("admin-view-visualizer").classList.add("admin-view-active");
        titleText.textContent = "admin - visualizer.config";
    } else if (viewName === "music") {
        document.getElementById("admin-view-music").classList.add("admin-view-active");
        titleText.textContent = "admin - music.control";
    } else if (viewName === "other") {
        document.getElementById("admin-view-other").classList.add("admin-view-active");
        titleText.textContent = "admin - other";
    }
}

// Back button always visible: goes to panel
backBtn.addEventListener("click", () => {
    showAdminView("panel");
});

// File links click → switch views
document.addEventListener("click", (e) => {
    const link = e.target.closest(".admin-file-link");
    if (!link) return;

    const view = link.dataset.view;
    if (view === "fire") showAdminView("fire");
    if (view === "visualizer") showAdminView("visualizer");
    if (view === "music") showAdminView("music");
    if (view === "other") showAdminView("other");
});


// --- CUSTOM DROPDOWN SETUP (floating over window) ---
function setupDropdown(dropdownId, onChange) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const display = dropdown.querySelector(".admin-dropdown-display");
    const list = dropdown.querySelector(".admin-dropdown-list");
    const items = list.querySelectorAll("li");

    function closeAllDropdowns() {
        document.querySelectorAll(".admin-dropdown.open").forEach(dd => {
            dd.classList.remove("open");
        });
    }

    display.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains("open");
        closeAllDropdowns();

        if (!isOpen) {
            const rect = display.getBoundingClientRect();
            list.style.left = rect.left + "px";
            list.style.top = rect.bottom + "px";
            list.style.width = rect.width + "px";

            dropdown.classList.add("open");
        }
    });

    items.forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const value = item.dataset.value;
            display.textContent = value;
            dropdown.classList.remove("open");
            if (onChange) onChange(value);
        });
    });

    document.addEventListener("click", () => {
        closeAllDropdowns();
    });

    return {
        setValue(value) {
            display.textContent = value;
        }
    };
}


// --- VISUALIZER + FIRE CONTROLS + HUD ICONS + MUSIC CONTROL ---
window.addEventListener("DOMContentLoaded", () => {
    // VISUALIZER CONFIG
    const amp = document.getElementById("admin-amp");
    const smooth = document.getElementById("admin-smooth");
    const ampValue = document.getElementById("admin-amp-value");
    const smoothValue = document.getElementById("admin-smooth-value");

    if (window.CONFIG) {
        amp.value = CONFIG.amplitude;
        smooth.value = CONFIG.smoothing;

        ampValue.textContent = CONFIG.amplitude.toFixed(1);
        smoothValue.textContent = CONFIG.smoothing.toFixed(1);

        amp.oninput = () => {
            const val = parseFloat(amp.value);
            CONFIG.amplitude = val;
            ampValue.textContent = val.toFixed(1);
        };

        smooth.oninput = () => {
            const val = parseFloat(smooth.value);
            CONFIG.smoothing = val;
            smoothValue.textContent = val.toFixed(1);
        };

        const modeDropdownControl = setupDropdown("admin-mode-dropdown", (value) => {
            CONFIG.mode = value;
        });

        if (modeDropdownControl) {
            modeDropdownControl.setValue(CONFIG.mode);
        }
    } else {
        console.warn("[admin] CONFIG not found – visualizer.js might not be loaded yet");
    }

    // FIRE CONFIG
    const fireSpeed = document.getElementById("admin-fire-speed");
    const fireDecay = document.getElementById("admin-fire-decay");
    const fireWind = document.getElementById("admin-fire-wind");

    const fireSpeedValue = document.getElementById("admin-fire-speed-value");
    const fireDecayValue = document.getElementById("admin-fire-decay-value");
    const fireWindValue = document.getElementById("admin-fire-wind-value");

    if (window.FIRE_CONFIG) {
        fireSpeed.value = FIRE_CONFIG.speed;
        fireDecay.value = FIRE_CONFIG.decay;
        fireWind.value = FIRE_CONFIG.wind;

        fireSpeedValue.textContent = FIRE_CONFIG.speed;
        fireDecayValue.textContent = FIRE_CONFIG.decay.toFixed(1);
        fireWindValue.textContent = FIRE_CONFIG.wind.toFixed(1);

        fireSpeed.oninput = () => {
            const val = parseFloat(fireSpeed.value);
            FIRE_CONFIG.speed = val;
            fireSpeedValue.textContent = val;
        };

        fireDecay.oninput = () => {
            const val = parseFloat(fireDecay.value);
            FIRE_CONFIG.decay = val;
            fireDecayValue.textContent = val.toFixed(1);
        };

        fireWind.oninput = () => {
            const val = parseFloat(fireWind.value);
            FIRE_CONFIG.wind = val;
            fireWindValue.textContent = val.toFixed(1);
        };

        const firePaletteDropdownControl = setupDropdown("admin-fire-palette-dropdown", (value) => {
            FIRE_CONFIG.palette = value;
        });

        if (firePaletteDropdownControl) {
            firePaletteDropdownControl.setValue(FIRE_CONFIG.palette || "red");
        }
    } else {
        console.warn("[admin] FIRE_CONFIG not found – make sure fire.js loads before admin.js");
    }

    // HUD ICONS
    const hudMusic = document.getElementById("hud-music");
    const hudAdmin = document.getElementById("hud-admin");

    if (hudMusic) {
        hudMusic.addEventListener("click", () => {
            if (window.Visualizer) {
                Visualizer.ensureStarted();
                Visualizer.toggleMuted();
                const muted = Visualizer.isMuted();
                hudMusic.classList.toggle("hud-icon-muted", muted);
            }
        });
    }

    if (hudAdmin) {
        hudAdmin.addEventListener("click", () => {
            openAdminPanel();
        });
    }

    // MUSIC.CONTROL TAB
    if (window.Visualizer) {
        const titleEl = document.getElementById("admin-music-title");
        const timeEl = document.getElementById("admin-music-time");
        const btnPause = document.getElementById("admin-music-pause");
        const btnSkip = document.getElementById("admin-music-skip");

        function fmt(sec, fallback) {
            if (!sec || !isFinite(sec) || sec < 0) return fallback;
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60).toString().padStart(2, "0");
            return `${m}:${s}`;
        }

        function refreshMusicUI() {
            if (!window.Visualizer) return;
            const info = Visualizer.getTrackInfo ? Visualizer.getTrackInfo() : null;
            if (!info) {
                titleEl.textContent = "(no track)";
                timeEl.textContent = "0:00-0:00";
                return;
            }

            titleEl.textContent = info.name || "(unknown)";
            const current = fmt(info.currentTime, "0:00");
            const total = fmt(info.duration, "--:--");
            timeEl.textContent = `${current}-${total}`;

            const paused = Visualizer.isPaused ? Visualizer.isPaused() : false;
            btnPause.textContent = paused ? "Play" : "Pause";
        }

        btnPause.addEventListener("click", () => {
            Visualizer.ensureStarted();
            if (Visualizer.togglePause) Visualizer.togglePause();
            refreshMusicUI();
        });

        btnSkip.addEventListener("click", () => {
            Visualizer.ensureStarted();
            if (Visualizer.nextTrack) Visualizer.nextTrack();
            refreshMusicUI();
        });

        refreshMusicUI();
        setInterval(refreshMusicUI, 500);
    } else {
        console.warn("[admin] Visualizer API not found – make sure visualizer.js loads before admin.js");
    }
});
