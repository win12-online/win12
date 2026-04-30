/**
 * Windows 12 Web - dragHandler.js
 * Mission: Fix the "Fake Drag" issue for .dock-box
 */

(function() {
    // Wait for the DOM to be fully available due to 'defer'
    window.addEventListener('load', () => {
        const dock = document.querySelector('.dock-box');
        
        if (!dock) {
            console.warn("DragHandler: .dock-box not found. The community still needs help!");
            return;
        }

        // Apply initial styles to ensure it can actually move
        dock.style.cursor = 'move';
        dock.style.position = 'absolute';
        dock.style.transition = 'none'; // Prevents CSS animations from fighting the mouse
        dock.style.userSelect = 'none'; // Prevents text highlighting while dragging

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        dock.addEventListener('mousedown', (e) => {
            isDragging = true;
            
            // Get current mouse position
            startX = e.clientX;
            startY = e.clientY;

            // Get current dock position
            const rect = dock.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            dock.style.zIndex = "9999";
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Calculate distance moved
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Update position based on initial location + delta
            let newX = initialLeft + dx;
            let newY = initialTop + dy;

            // Optional: Simple Screen Boundary Constraining
            const maxX = window.innerWidth - dock.offsetWidth;
            const maxY = window.innerHeight - dock.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            dock.style.left = `${newX}px`;
            dock.style.top = `${newY}px`;
            dock.style.bottom = 'auto'; // Important: Overrides the CSS "bottom: 0"
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });
})();
