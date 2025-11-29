window.addEventListener("load", () => {
    console.log("[favicon] script loaded");

    const size = 32; // favicon size (browser will downscale if needed)
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // list of your frame images in /assets
    const frameSources = [
        "assets/frame_00_delay-0.04s.jpeg",
        "assets/frame_01_delay-0.04s.jpeg",
        "assets/frame_02_delay-0.04s.jpeg",
        "assets/frame_03_delay-0.04s.jpeg",
        "assets/frame_04_delay-0.04s.jpeg",
        "assets/frame_05_delay-0.04s.jpeg",
        "assets/frame_06_delay-0.04s.jpeg",
        "assets/frame_07_delay-0.04s.jpeg",
        "assets/frame_08_delay-0.04s.jpeg",
        "assets/frame_09_delay-0.04s.jpeg",
        "assets/frame_10_delay-0.04s.jpeg",
        "assets/frame_11_delay-0.04s.jpeg",
        "assets/frame_12_delay-0.04s.jpeg",
        "assets/frame_13_delay-0.04s.jpeg",
        "assets/frame_14_delay-0.04s.jpeg"
    ];

    const frames = [];
    let loadedCount = 0;

    // find or create favicon link element
    const faviconEl = (function () {
        let el = document.getElementById("dynamic-favicon");
        if (!el) {
            el = document.createElement("link");
            el.id = "dynamic-favicon";
            el.rel = "icon";
            el.type = "image/png";
            document.head.appendChild(el);
        }
        return el;
    })();

    // preload all frames
    frameSources.forEach((src, index) => {
        const img = new Image();
        img.onload = () => {
            frames[index] = img;
            loadedCount++;
            if (loadedCount === frameSources.length) {
                console.log("[favicon] all frames loaded");
                startAnimation();
            }
        };
        img.onerror = (e) => {
            console.warn("[favicon] failed to load frame:", src, e);
        };
        img.src = src;
    });

    function drawFrame(frameIndex) {
        const img = frames[frameIndex];
        if (!img) return;

        ctx.clearRect(0, 0, size, size);

        // draw the frame scaled into the favicon canvas
        ctx.drawImage(img, 0, 0, size, size);

        try {
            const url = canvas.toDataURL("image/png");
            faviconEl.href = url;
        } catch (e) {
            console.warn("[favicon] toDataURL failed", e);
        }
    }

    function startAnimation() {
        let current = 0;
        const total = frames.length;
        const frameDelay = 40; // ms, matches your 0.04s-ish

        function tick() {
            drawFrame(current);
            current = (current + 1) % total;
            setTimeout(tick, frameDelay);
        }

        tick();
    }
});
