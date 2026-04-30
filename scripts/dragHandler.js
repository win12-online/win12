/**
 * Windows 12 Web - dragHandler.js
 * Implementation for a draggable desktop dock/taskbar
 */

(function() {
    const initDraggableDock = () => {
        // Targets the dock element (checking for common project class names)
        const dock = document.querySelector('.dock-box') || document.querySelector('.dock-bar');
        
        if (!dock) {
            // No error thrown to avoid cluttering production console if element is absent
            return;
        }

        /**
         * Identification Log: Confirms for the maintainers exactly what was found.
         * Identifies the "pill" taskbar as requested.
         */
        console.log(`[DragHandler] Desktop element found: <${dock.tagName.toLowerCase()}> with class "${dock.className}"`);

        // Functional overrides to enable movement
        // (Visual styles like 'cursor' should ideally be moved to CSS as suggested by reviewers)
        Object.assign(dock.style, {
            position: 'absolute',
            transition: 'none', // Prevents CSS transitions from causing "stutter" during drag
            userSelect: 'none',
            cursor: 'move'
        });

        let isDragging = false;
        let offset = { x: 0, y: 0 };

        /**
         * Handles the movement logic with screen boundary constraints
         */
        const onMouseMove = (e) => {
            if (!isDragging) return;

            // Calculate new position
            let newX = e.clientX - offset.x;
            let newY = e.clientY - offset.y;

            // Screen Boundary Constraining
            const maxX = window.innerWidth - dock.offsetWidth;
            const maxY = window.innerHeight - dock.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            // Apply coordinates
            dock.style.left = `${newX}px`;
            dock.style.top = `${newY}px`;
            dock.style.bottom = 'auto'; // Overrides the fixed "bottom: 0" layout
        };

        const onMouseUp = () => {
            isDragging = false;
            // Remove listeners when not in use for better performance
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        /**
         * Initial click listener to start the drag process
         */
        dock.addEventListener('mousedown', (e) => {
            // Ensure we are clicking the dock itself, not an interactive icon inside it
            if (e.target !== dock) return;

            isDragging = true;
            
            const rect = dock.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;

            // Attach document-level listeners only while dragging
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    // Ensure the DOM is ready before attempting to find the dock
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDraggableDock);
    } else {
        initDraggableDock();
    }
})();
