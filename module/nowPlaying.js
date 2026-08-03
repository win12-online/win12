// Now Playing direct taskbar-pin controls.
// This file intentionally does not create hamburger or menu buttons.

(function () {
    function player() {
        return typeof widgets !== 'undefined' && widgets && widgets.nowplaying ? widgets.nowplaying : null;
    }

    function updatePlayIcon() {
        var np = player();
        var audio = np && np.audio;
        var playing = audio && !audio.paused;
        var cls = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';

        document.querySelectorAll('.nowplaying.np-dock-nuclear .np-dock-play i, .wg.toolbar.nowplaying .np-play i').forEach(function (icon) {
            icon.className = cls;
        });
    }

    function runAction(action) {
        var np = player();
        if (!np) return;

        if (action === 'import') {
            if (typeof np.pickFile === 'function') {
                np.pickFile();
                return;
            }

            var input = document.querySelector('.wg.nowplaying:not(.template) .nowplaying-file');
            if (input) input.click();
            return;
        }

        if (action === 'back' && typeof np.skip === 'function') {
            np.skip(-10);
            return;
        }

        if (action === 'play' && typeof np.toggle === 'function') {
            Promise.resolve(np.toggle()).finally(updatePlayIcon);
            return;
        }

        if (action === 'forward' && typeof np.skip === 'function') {
            np.skip(10);
        }
    }

    function ensureDirectControls() {
        document.querySelectorAll('.wg.toolbar.nowplaying, .nowplaying.np-dock-nuclear').forEach(function (dock) {
            dock.classList.add('np-dock-nuclear');

            // Remove menu-only UI if older scripts created it.
            dock.querySelectorAll(':scope > .np-dock-menu, :scope > .np-dock-more, :scope > .np-dock-hamburger, :scope > .np-dock-widget-more, :scope > .np-dock-trigger-wrap').forEach(function (node) {
                node.remove();
            });

            // If the nuclear renderer exists, it already owns the real buttons.
            // If not, use the toolbar widget controls already in the widget content.
        });

        updatePlayIcon();
    }

    if (!window.__nowPlayingDirectControlsInstalled) {
        window.__nowPlayingDirectControlsInstalled = true;

        document.addEventListener('click', function (event) {
            var importButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-import, .wg.toolbar.nowplaying .np-import');
            var backButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-back, .wg.toolbar.nowplaying .np-back');
            var playButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-play, .wg.toolbar.nowplaying .np-play');
            var forwardButton = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-forward, .wg.toolbar.nowplaying .np-forward');

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
        var np = player();
        if (!np || np.__directControlsPatched) return;

        np.__directControlsPatched = true;

        var init = np.init;
        var render = np.render;

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
        patchPlayer();
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
