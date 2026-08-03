// Now Playing taskbar-pin interactions.
// Visible ... button is inserted inside the visible taskbar pin pill.

(function () {
    const IMPORT_INPUT_ID = 'NowPlaying.ImportMusic';
    const IMPORT_INPUT_CLASS = 'NowPlaying.Widget.TaskbarPin.import.hidden';
    const MENU_CLASS = 'NowPlaying.TaskbarPin.Menu.Hidden';
    const OPEN_MENU_CLASS = 'NowPlaying.TaskbarPin.OpenMenu.shown';

    function player() {
        return typeof widgets !== 'undefined' && widgets && widgets.nowplaying ? widgets.nowplaying : null;
    }

    function pins() {
        return document.querySelectorAll('.wg.toolbar.nowplaying, .nowplaying.np-dock-nuclear');
    }

    function hiddenInput() {
        let input = document.getElementById(IMPORT_INPUT_ID);

        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.flac';
            input.className = IMPORT_INPUT_CLASS;
            input.id = IMPORT_INPUT_ID;
            input.hidden = true;
            document.body.appendChild(input);
        }

        return input;
    }

    function hasLoadedTrack(np) {
        const audio = np && np.audio;
        return !!(audio && (audio.currentSrc || audio.src));
    }

    function openImportPicker() {
        hiddenInput().click();
    }

    function loadSelectedFile(file) {
        const np = player();
        if (!np || !file) return;

        if (typeof np.loadFile === 'function') {
            np.loadFile(file);
            return;
        }

        if (!np.audio) {
            np.audio = new Audio();
        }

        np.audio.src = URL.createObjectURL(file);
        np.title = file.name || 'Local audio file';
        np.artist = 'Local audio file';

        if (typeof np.render === 'function') {
            np.render();
        }
    }

    function makeIcon(className) {
        const icon = document.createElement('i');
        icon.className = className;
        return icon;
    }

    function makeMenuButton(action, iconClass, title) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'np-dock-menu-item';
        button.title = title;
        button.setAttribute('aria-label', title);
        button.setAttribute('data-np-action', action);
        button.appendChild(makeIcon(iconClass));
        return button;
    }

    function updatePlayIcon() {
        const np = player();
        const audio = np && np.audio;
        const playing = audio && !audio.paused;
        const cls = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';

        document.querySelectorAll('.nowplaying.np-dock-nuclear .np-dock-play i, .wg.toolbar.nowplaying .np-play i, .nowplaying.np-dock-nuclear > .np-dock-menu [data-np-action="play"] i').forEach(function (icon) {
            icon.className = cls;
        });
    }

    function runAction(action) {
        const np = player();
        if (!np) return;

        if (action === 'import') {
            openImportPicker();
            return;
        }

        if (action === 'back' && typeof np.skip === 'function') {
            np.skip(-10);
            return;
        }

        if (action === 'play') {
            if (!hasLoadedTrack(np)) {
                openImportPicker();
                return;
            }

            if (typeof np.toggle === 'function') {
                Promise.resolve(np.toggle()).finally(updatePlayIcon);
            }

            return;
        }

        if (action === 'forward' && typeof np.skip === 'function') {
            np.skip(10);
        }
    }

    function ensureDotsMenu() {
        pins().forEach(function (dock) {
            dock.classList.add('np-dock-nuclear');

            const pill = dock.querySelector(':scope > .np-dock-pill') || dock;

            // Remove old attempts so only one visible button exists.
            dock.querySelectorAll(':scope > .np-dock-hamburger, :scope > .np-dock-trigger-wrap').forEach(function (node) {
                node.remove();
            });

            dock.querySelectorAll(':scope > .np-dock-widget-more').forEach(function (node) {
                node.remove();
            });

            pill.querySelectorAll(':scope > .np-dock-widget-more').forEach(function (node) {
                node.remove();
            });

            let openButton = document.createElement('button');
            openButton.type = 'button';
            openButton.className = 'np-dock-widget-more ' + OPEN_MENU_CLASS;
            openButton.title = 'Now Playing menu';
            openButton.setAttribute('aria-label', 'Now Playing menu');
            openButton.setAttribute('aria-expanded', 'false');
            openButton.appendChild(makeIcon('bi bi-three-dots'));
            pill.appendChild(openButton);

            Array.from(dock.querySelectorAll(':scope > .np-dock-menu')).slice(1).forEach(function (node) {
                node.remove();
            });

            let menu = dock.querySelector(':scope > .np-dock-menu');

            if (!menu) {
                menu = document.createElement('div');
                dock.appendChild(menu);
            }

            menu.className = 'np-dock-menu ' + MENU_CLASS;
            menu.textContent = '';
            menu.appendChild(makeMenuButton('import', 'bi bi-folder2-open', 'Import audio'));
            menu.appendChild(makeMenuButton('back', 'bi bi-skip-backward-fill', 'Back 10 seconds'));
            menu.appendChild(makeMenuButton('play', 'bi bi-play-fill', 'Play or pause'));
            menu.appendChild(makeMenuButton('forward', 'bi bi-skip-forward-fill', 'Forward 10 seconds'));
        });

        updatePlayIcon();
    }

    function closeMenus(exceptMenu) {
        document.querySelectorAll('.nowplaying.np-dock-nuclear > .np-dock-menu.show').forEach(function (menu) {
            if (!exceptMenu || menu !== exceptMenu) {
                menu.classList.remove('show');

                const dock = menu.closest('.nowplaying.np-dock-nuclear');
                const button = dock && dock.querySelector('.np-dock-widget-more');
                if (button) {
                    button.classList.remove('is-open');
                    button.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    function toggleMenu(openButton) {
        const dock = openButton.closest('.nowplaying.np-dock-nuclear');
        const menu = dock && dock.querySelector(':scope > .np-dock-menu');

        if (!menu) return;

        const shouldOpen = !menu.classList.contains('show');
        closeMenus(menu);

        menu.classList.toggle('show', shouldOpen);
        openButton.classList.toggle('is-open', shouldOpen);
        openButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    }

    function bindHiddenInput() {
        const input = hiddenInput();

        if (input.dataset.nowPlayingBound === 'true') return;

        input.dataset.nowPlayingBound = 'true';

        input.addEventListener('change', function () {
            const file = input.files && input.files[0];

            if (file) {
                loadSelectedFile(file);
            }

            input.value = '';
        });
    }

    function ensureDirectControls() {
        ensureDotsMenu();
        bindHiddenInput();
        updatePlayIcon();
    }

    function installClickHandler() {
        if (window.__nowPlayingVisibleDotsInstalled) return;
        window.__nowPlayingVisibleDotsInstalled = true;

        document.addEventListener('click', function (event) {
            const openButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-widget-more');
            const menuItem = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-menu .np-dock-menu-item');
            const menu = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-menu');

            const importButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-import, .wg.toolbar.nowplaying .np-import');
            const backButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-back, .wg.toolbar.nowplaying .np-back');
            const playButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-play, .wg.toolbar.nowplaying .np-play');
            const forwardButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-forward, .wg.toolbar.nowplaying .np-forward');

            if (openButton) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                toggleMenu(openButton);
                return;
            }

            if (menuItem) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                runAction(menuItem.getAttribute('data-np-action'));
                updatePlayIcon();
                return;
            }

            if (menu) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }

            if (importButton || backButton || playButton || forwardButton) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                if (importButton) runAction('import');
                if (backButton) runAction('back');
                if (playButton) runAction('play');
                if (forwardButton) runAction('forward');

                updatePlayIcon();
                return;
            }

            closeMenus();
        }, true);
    }

    function patchPlayer() {
        const np = player();
        if (!np || np.__visibleDotsMenuPatched) return;

        np.__visibleDotsMenuPatched = true;

        const init = np.init;
        const render = np.render;

        if (typeof init === 'function') {
            np.init = function () {
                init.call(np);
                ensureDirectControls();
            };
        }

        if (typeof render === 'function') {
            np.render = function () {
                render.call(np);
                ensureDirectControls();
            };
        }
    }

    function start() {
        bindHiddenInput();
        patchPlayer();
        installClickHandler();
        ensureDirectControls();

        window.setTimeout(function () {
            patchPlayer();
            ensureDirectControls();
        }, 250);

        window.setTimeout(function () {
            patchPlayer();
            ensureDirectControls();
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
