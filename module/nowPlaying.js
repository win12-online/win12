// Now Playing taskbar-pin interactions.
// Direct playback controls stay in the pin.
// The ... menu is the widget actions menu and stays open until explicitly closed.

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

        const icon = makeIcon(iconClass);
        const label = document.createElement('span');
        label.className = 'np-dock-menu-label';
        label.textContent = title;

        button.appendChild(icon);
        button.appendChild(label);

        return button;
    }

    function updatePlayIcon() {
        const np = player();
        const audio = np && np.audio;
        const playing = audio && !audio.paused;
        const cls = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';

        document.querySelectorAll('.nowplaying.np-dock-nuclear .np-dock-play i, .wg.toolbar.nowplaying .np-play i').forEach(function (icon) {
            icon.className = cls;
        });
    }

    function runPlaybackAction(action) {
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

    function moveToWidgetMenu() {
        if (typeof widgets === 'undefined' || !widgets || !widgets.widgets) return;

        if (typeof widgets.widgets.remove === 'function') {
            widgets.widgets.remove('nowplaying');
        }

        if (typeof widgets.widgets.add === 'function') {
            widgets.widgets.add('nowplaying');
        }
    }

    function pinToDesktop() {
        if (typeof widgets === 'undefined' || !widgets || !widgets.widgets) return;

        if (typeof widgets.widgets.remove === 'function') {
            widgets.widgets.remove('nowplaying');
        }

        if (typeof widgets.widgets.addToDesktop === 'function') {
            widgets.widgets.addToDesktop('nowplaying');
        }
    }

    function runMenuAction(action) {
        if (action === 'widget-menu') {
            moveToWidgetMenu();
            return;
        }

        if (action === 'desktop') {
            pinToDesktop();
            return;
        }

        if (action === 'import') {
            openImportPicker();
        }
    }

    function ensureMenu() {
        pins().forEach(function (dock) {
            dock.classList.add('np-dock-nuclear');

            const pill = dock.querySelector(':scope > .np-dock-pill') || dock;
            const wasOpen = !!dock.querySelector(':scope > .np-dock-menu.show');

            dock.querySelectorAll(':scope > .np-dock-hamburger, :scope > .np-dock-trigger-wrap').forEach(function (node) {
                node.remove();
            });

            dock.querySelectorAll(':scope > .np-dock-widget-more').forEach(function (node) {
                node.remove();
            });

            pill.querySelectorAll(':scope > .np-dock-widget-more').forEach(function (node) {
                node.remove();
            });

            const openButton = document.createElement('button');
            openButton.type = 'button';
            openButton.className = 'np-dock-widget-more ' + OPEN_MENU_CLASS;
            openButton.title = 'Widget menu';
            openButton.setAttribute('aria-label', 'Widget menu');
            openButton.setAttribute('aria-expanded', wasOpen ? 'true' : 'false');
            openButton.appendChild(makeIcon('bi bi-three-dots'));

            if (wasOpen) {
                openButton.classList.add('is-open');
            }

            pill.appendChild(openButton);

            let menu = dock.querySelector(':scope > .np-dock-menu');

            if (!menu) {
                menu = document.createElement('div');
                dock.appendChild(menu);
            }

            menu.className = 'np-dock-menu ' + MENU_CLASS + (wasOpen ? ' show' : '');

            if (!menu.dataset.nowPlayingMenuBuilt) {
                menu.textContent = '';
                menu.appendChild(makeMenuButton('widget-menu', 'bi bi-grid-3x3-gap', 'Add to widgets'));
                menu.appendChild(makeMenuButton('desktop', 'bi bi-display', 'Add to desktop'));
                menu.appendChild(makeMenuButton('import', 'bi bi-folder2-open', 'Import music'));
                menu.dataset.nowPlayingMenuBuilt = 'true';
            }
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
        ensureMenu();
        bindHiddenInput();
        updatePlayIcon();
    }

    function installClickHandler() {
        if (window.__nowPlayingWidgetMenuDotsInstalled) return;
        window.__nowPlayingWidgetMenuDotsInstalled = true;

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

                runMenuAction(menuItem.getAttribute('data-np-action'));
                closeMenus();
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

                if (importButton) runPlaybackAction('import');
                if (backButton) runPlaybackAction('back');
                if (playButton) runPlaybackAction('play');
                if (forwardButton) runPlaybackAction('forward');

                updatePlayIcon();
                return;
            }

            closeMenus();
        }, true);
    }

    function patchPlayer() {
        const np = player();
        if (!np || np.__widgetMenuDotsPatched) return;

        np.__widgetMenuDotsPatched = true;

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
