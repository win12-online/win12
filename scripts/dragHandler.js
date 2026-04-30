/**
 * Windows 12 Web - Drag functionality for the desktop taskbar
 */

(function() {
    const initDraggableDock = () => {
        // Updated selector to match desktop.html structure
        const dock = document.querySelector('.dock-box') || document.querySelector('.dock-bar');
        
        if (!dock) return;

        // Log identification to clarify the element for the maintainers
        console.log(`[DragHandler] Initialized draggable functionality for <${dock.tagName.toLowerCase()}>.${dock.className}`);

        // Maintainers suggested moving static styles to CSS. 
        // Applying functional overrides here.
        Object.assign(dock.style, {
            position: 'absolute',
            transition: 'none',
            userSelect: 'none',
            cursor: 'move'
        });

        let isDragging = false;
        let offset = { x: 0, y: 0 };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            // Calculate position with screen boundaries
            let newX = e.clientX - offset.x;
            let newY = e.clientY - offset.y;

            const maxX = window.innerWidth - dock.offsetWidth;
            const maxY = window.innerHeight - dock.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            dock.style.left = `${newX}px`;
            dock.style.top = `${newY}px`;
            dock.style.bottom = 'auto'; 
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        dock.addEventListener('mousedown', (e) => {
            // Prevent dragging if clicking buttons/icons inside the dock
            if (e.target !== dock) return; 

            isDragging = true;
            const rect = dock.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDraggableDock);
    } else {
        initDraggableDock();
    }
})();
