(function () {
    console.log('[Visualizer] script file loaded');

    // ----------------- TRACK LIST -----------------
const TRACKS = [
    'music/lucki unotheactivist thouxanbanfauni - beam me up (prod. skys).mp3',
    'music/Lucki - I see dead people x (Tunevert).mp3',
    'music/Lucki - Do You Want.mp3',
    'music/Lucki- 2012 Summer (Prod.4Conner).mp3',
    'music/lucki 2012 summer prod. mars diva III.mp3',
    'music/lucki out of touch prod. mars diva III.mp3',
    'music/made my day -lucki remix.mp3',
    'music/4g carti.mp3',
    'music/Acrobat.mp3',
    'music/Baby Smoove - Floyd May (Prod By MexikoDro).mp3',
    'music/C\'EST LA VIE..mp3',
    'music/ILuvMIRRAR.mp3',
    'music/NO WOK PROD. PLU2O & MEECH.mp3',
    'music/Super Pussy prod. wolfbwoy.mp3',
    'music/OUT THE MIX [s4ntana].mp3'
];

    // ----------------- CONFIG -----------------
    window.CONFIG = window.CONFIG || {
        segments: 140,
        maxHeight: 18,
        lineChar: '-',
        mode: 'wave',
        amplitude: 3.0,
        smoothing: 0.5
    };

    // ----------------- STATE ------------------
    let audioElement = null;
    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;

    let freqDataArray = null;
    let timeDataArray = null;
    let bufferLength = 0;

    let waveformSpans = [];
    let lastHeights = [];
    let animationId = null;

    let started = false;
    let muted = false;

    // random playlist pool — avoids repeats
    let trackPool = [...TRACKS];
    let currentTrackSrc = null;

    // ----------------- PLAYLIST LOGIC -----------------
    function getNextTrackSrc() {
        if (!TRACKS.length) return null;

        if (trackPool.length === 0) {
            trackPool = [...TRACKS];
            console.log('[Visualizer] track pool refilled');
        }

        const index = Math.floor(Math.random() * trackPool.length);
        const src = trackPool.splice(index, 1)[0];
        console.log('[Visualizer] next track:', src);
        return src;
    }

    function setTrackSrc(src) {
        if (!audioElement || !src) return;
        currentTrackSrc = src;
        audioElement.src = src;
    }

    function getTrackDisplayName(src) {
        if (!src) return '(no track)';
        const parts = src.split('/');
        let name = parts[parts.length - 1] || src;
        try {
            name = decodeURIComponent(name);
        } catch (e) {
            // ignore
        }
        return name;
    }

    // -------------- DOM SETUP -----------------
    function initWaveformDOM() {
        console.log('[Visualizer] initWaveformDOM');

        const container = document.getElementById('waveform-visualizer');
        if (!container) {
            console.warn('[Visualizer] #waveform-visualizer not found.');
            return;
        }

        container.innerHTML = '';
        waveformSpans = [];
        lastHeights = [];

        for (let i = 0; i < CONFIG.segments; i++) {
            const span = document.createElement('span');
            span.textContent = CONFIG.lineChar;
            container.appendChild(span);

            waveformSpans.push(span);
            lastHeights.push(0);
        }

        console.log('[Visualizer] created', waveformSpans.length, 'segments');
    }

    // -------------- AUDIO SETUP -----------------
    function setupAudioIfNeeded() {
        if (!audioElement) {
            audioElement = new Audio();
            audioElement.crossOrigin = 'anonymous';
            audioElement.loop = false;
            audioElement.muted = muted;

            audioElement.addEventListener('error', (e) => {
                console.error('[Visualizer] Audio file error:', e);
            });

            audioElement.addEventListener('ended', () => {
                console.log('[Visualizer] track ended → next');
                const next = getNextTrackSrc();
                if (!next) return;
                setTrackSrc(next);
                audioElement.play().catch(err => {
                    console.error('[Visualizer] autoplay next failed:', err);
                });
            });
        }

        if (!audioElement.src) {
            const first = getNextTrackSrc();
            if (first) setTrackSrc(first);
        }

        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AC();

            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;

            bufferLength = analyser.frequencyBinCount;
            freqDataArray = new Uint8Array(bufferLength);
            timeDataArray = new Uint8Array(bufferLength);

            sourceNode = audioCtx.createMediaElementSource(audioElement);
            sourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);

            console.log('[Visualizer] audio + analyser ready');
        }
    }

    // --------- FREQUENCY MAPPING (non-wave modes) ---------
    function getFreqIndexForSegment(i) {
        const step = Math.max(1, Math.floor(bufferLength / CONFIG.segments));
        let baseIndex = i * step;

        if (CONFIG.mode === 'left') {
            return Math.min(baseIndex, bufferLength - 1);
        }

        if (CONFIG.mode === 'center') {
            const half = Math.floor(CONFIG.segments / 2);
            const pos = i < half ? (half - i - 1) : (i - half);
            return Math.min(pos * step, bufferLength - 1);
        }

        if (CONFIG.mode === 'mirror') {
            const half = Math.floor(CONFIG.segments / 2);
            const mirrorIndex = (i < half) ? i : (CONFIG.segments - 1 - i);
            return Math.min(mirrorIndex * step, bufferLength - 1);
        }

        return Math.min(baseIndex, bufferLength - 1);
    }

    // ----------------- ANIMATION LOOP -----------------
    function animateWaveform() {
        if (!analyser || !waveformSpans.length) return;
        animationId = requestAnimationFrame(animateWaveform);

        analyser.getByteFrequencyData(freqDataArray);
        analyser.getByteTimeDomainData(timeDataArray);

        for (let i = 0; i < CONFIG.segments; i++) {
            let target = 0;

            if (CONFIG.mode === 'wave') {
                const idx = Math.floor(i / CONFIG.segments * bufferLength);
                const sample = timeDataArray[Math.min(idx, bufferLength - 1)] || 128;
                const norm = Math.abs(sample - 128) / 128;
                target = norm * CONFIG.maxHeight * CONFIG.amplitude;
            } else {
                const freqIdx = getFreqIndexForSegment(i);
                const raw = freqDataArray[freqIdx] || 0;
                target = (raw / 255) * CONFIG.maxHeight * CONFIG.amplitude;
            }

            const prev = lastHeights[i];
            const smoothed = prev + (target - prev) * CONFIG.smoothing;
            lastHeights[i] = smoothed;

            waveformSpans[i].style.transform = `translateY(${-smoothed}px)`;
        }
    }

    // ----------------- START VISUALIZER -----------------
    async function startVisualizer() {
        console.log('[Visualizer] startVisualizer()');

        setupAudioIfNeeded();
        if (!audioElement || !audioCtx) {
            console.warn('[Visualizer] audio not ready');
            return;
        }

        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        try {
            await audioElement.play();
        } catch (err) {
            console.error('[Visualizer] autoplay blocked:', err);
            throw err;
        }

        if (!animationId) animateWaveform();

        started = true;
    }

    // ----------------- AUTOSTART WITH FALLBACK -----------------
    function attachClickFallback() {
        const handler = () => {
            if (started) return;
            startVisualizer();
            document.removeEventListener('click', handler);
        };
        document.addEventListener('click', handler);
    }

    async function tryAutoStart() {
        try {
            await startVisualizer();
        } catch {
            console.warn('[Visualizer] Autoplay failed → waiting for click');
            attachClickFallback();
        }
    }

    // ----------------- PUBLIC AUDIO CONTROL API -----------------
    function setMuted(val) {
        muted = !!val;
        if (audioElement) {
            audioElement.muted = muted;
        }
    }

    function toggleMuted() {
        setMuted(!muted);
    }

    function ensureStarted() {
        if (!started) {
            tryAutoStart();
        }
    }

    function getTrackInfo() {
        if (!audioElement) return null;
        const src = currentTrackSrc || audioElement.src || "";
        return {
            src,
            name: getTrackDisplayName(src),
            currentTime: audioElement.currentTime || 0,
            duration: (audioElement.duration && isFinite(audioElement.duration))
                ? audioElement.duration
                : 0
        };
    }

    function isPaused() {
        if (!audioElement) return true;
        return audioElement.paused;
    }

    function togglePause() {
        setupAudioIfNeeded();
        if (!audioElement) return;

        if (audioElement.paused) {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {});
            }
            audioElement.play().catch(err => {
                console.error('[Visualizer] play() failed:', err);
            });
        } else {
            audioElement.pause();
        }
    }

    function nextTrack() {
        setupAudioIfNeeded();
        if (!audioElement) return;

        const next = getNextTrackSrc();
        if (!next) return;
        setTrackSrc(next);

        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        audioElement.play().catch(err => {
            console.error('[Visualizer] play() failed for next track:', err);
        });
    }

    // ----------------- PUBLIC API HOOK -----------------
    window.Visualizer = {
        ensureStarted,
        setMuted,
        toggleMuted,
        isMuted: () => muted,
        getTrackInfo,
        nextTrack,
        togglePause,
        isPaused
    };

    // ----------------- INIT -----------------
    document.addEventListener('DOMContentLoaded', () => {
        initWaveformDOM();
        setupAudioIfNeeded();
        tryAutoStart();
    });

})();
