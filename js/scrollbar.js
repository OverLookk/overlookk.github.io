document.addEventListener("DOMContentLoaded", () => {
    const thumb = document.getElementById("custom-scroll-thumb");
    const bar = document.getElementById("custom-scrollbar");

    if (!thumb || !bar) {
        console.warn("[scrollbar] custom scrollbar elements not found");
        return;
    }

    let isDragging = false;
    let dragOffsetY = 0;

    function getDocHeights() {
        const doc = document.documentElement;
        return {
            docHeight: doc.scrollHeight,
            winHeight: window.innerHeight
        };
    }

    function updateThumb() {
        const { docHeight, winHeight } = getDocHeights();
        let maxScroll = docHeight - winHeight;

        // if no scroll, just show thumb at full track height at the top
        if (maxScroll <= 0) {
            thumb.style.display = "block";
            thumb.style.height = winHeight + "px";
            thumb.style.top = "0px";
            return;
        }

        thumb.style.display = "block";

        const minThumb = 30; // minimum thumb height
        const thumbHeight = Math.max((winHeight / docHeight) * winHeight, minThumb);
        thumb.style.height = thumbHeight + "px";

        const maxThumbTop = winHeight - thumbHeight;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollRatio = scrollTop / maxScroll;

        const thumbTop = scrollRatio * maxThumbTop;
        thumb.style.top = thumbTop + "px";
    }

    function scrollFromThumbPosition(clientY) {
        const { docHeight, winHeight } = getDocHeights();
        let maxScroll = docHeight - winHeight;

        if (maxScroll <= 0) return; // nothing to scroll

        const barRect = bar.getBoundingClientRect();
        const thumbRect = thumb.getBoundingClientRect();
        const thumbHeight = thumbRect.height;

        const maxThumbTop = winHeight - thumbHeight;

        let newTop = clientY - barRect.top - dragOffsetY;
        newTop = Math.max(0, Math.min(maxThumbTop, newTop));

        const scrollRatio = newTop / maxThumbTop;
        const newScrollTop = scrollRatio * maxScroll;

        window.scrollTo({
            top: newScrollTop,
            behavior: "auto"
        });
    }

    // Drag start
    thumb.addEventListener("mousedown", (e) => {
        isDragging = true;
        const thumbRect = thumb.getBoundingClientRect();
        dragOffsetY = e.clientY - thumbRect.top;
        document.body.style.userSelect = "none";
    });

    // Drag move
    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        scrollFromThumbPosition(e.clientY);
    });

    // Drag end
    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = "";
    });

    // Sync thumb on scroll + resize
    window.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);

    // Initial position
    updateThumb();
});
