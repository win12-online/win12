// Now Playing taskbar-pin interactions.
// Dedicated hidden input: #NowPlaying.ImportMusic

(function () {
    function player() {
        return typeof widgets !== 'undefined' && widgets && widgets.nowplaying ? widgets.nowplaying : null;
    }

    function hiddenInput() {
        let input = document.getElementById('NowPlaying.ImportMusic');

        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.flac';
            input.className = 'NowPlaying.Widget.TaskbarPin.import.hidden';
            input.id = 'NowPlaying.ImportMusic';
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

    function updatePlayIcon() {
        const np = player();
        const audio = np && np.audio;
        const playing = audio && !audio.paused;
        const cls = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';

        document.querySelectorAll('.nowplaying.np-dock-nuclear .np-dock-play i, .wg.toolbar.nowplaying .np-play i').forEach(function (icon) {
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
        document.querySelectorAll('.wg.toolbar.nowplaying, .nowplaying.np-dock-nuclear').forEach(function (dock) {
            dock.classList.add('np-dock-nuclear');

            dock.querySelectorAll(':scope > .np-dock-menu, :scope > .np-dock-more, :scope > .np-dock-hamburger, :scope > .np-dock-widget-more, :scope > .np-dock-trigger-wrap').forEach(function (node) {
                node.remove();
            });
        });

        bindHiddenInput();
        updatePlayIcon();
    }

    function installClickHandler() {
        if (window.__nowPlayingHiddenImportInstalled) return;
        window.__nowPlayingHiddenImportInstalled = true;

        document.addEventListener('click', function (event) {
            const importButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-import, .wg.toolbar.nowplaying .np-import');
            const backButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-back, .wg.toolbar.nowplaying .np-back');
            const playButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-play, .wg.toolbar.nowplaying .np-play');
            const forwardButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-forward, .wg.toolbar.nowplaying .np-forward');

            if (importButton || backButton || playButton || forwardButton) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                if (importButton) runAction('import');
                if (backButton) runAction('back');
                if (playButton) runAction('play');
                if (forwardButton) runAction('forward');

                updatePlayIcon();
            }
        }, true);
    }

    function patchPlayer() {
        const np = player();
        if (!np || np.__hiddenImportPatched) return;

        np.__hiddenImportPatched = true;

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
