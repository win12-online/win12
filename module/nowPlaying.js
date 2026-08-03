(function () {
    function player() {
        return typeof widgets !== 'undefined' && widgets && widgets.nowplaying ? widgets.nowplaying : null;
    }

    function pins() {
        return document.querySelectorAll('.wg.toolbar.nowplaying, .nowplaying.np-dock-nuclear');
    }

    function closeMenus(exceptMenu) {
        document.querySelectorAll('.nowplaying.np-dock-nuclear > .np-dock-menu.show').forEach(function (menu) {
            if (!exceptMenu || menu !== exceptMenu) {
                menu.classList.remove('show');

                var dock = menu.closest('.nowplaying.np-dock-nuclear');
                if (dock) {
                    dock.querySelectorAll('.np-dock-hamburger, .np-dock-widget-more').forEach(function (button) {
                        button.classList.remove('is-open');
                        button.setAttribute('aria-expanded', 'false');
                    });
                }
            }
        });
    }

    function makeIcon(className) {
        var icon = document.createElement('i');
        icon.className = className;
        return icon;
    }

    function makeButton(className, label) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.title = label;
        button.setAttribute('aria-label', label);
        return button;
    }

    function makeHamburger() {
        var button = makeButton('np-dock-hamburger', 'Now Playing controls');
        button.setAttribute('aria-expanded', 'false');
        button.appendChild(document.createElement('span'));
        button.appendChild(document.createElement('span'));
        button.appendChild(document.createElement('span'));
        return button;
    }

    function makeDots() {
        var button = makeButton('np-dock-widget-more', 'Widget menu');
        button.setAttribute('aria-expanded', 'false');
        button.appendChild(makeIcon('bi bi-three-dots'));
        return button;
    }

    function makeMenuButton(action, iconClass, label) {
        var button = makeButton('np-dock-menu-item', label);
        button.setAttribute('data-np-action', action);
        button.appendChild(makeIcon(iconClass));
        return button;
    }

    function ensureMenu() {
        var np = player();
        if (!np) return;

        pins().forEach(function (dock) {
            dock.classList.add('np-dock-nuclear');

            var pill = dock.querySelector(':scope > .np-dock-pill') || dock;
            var triggers = dock.querySelector(':scope > .np-dock-trigger-wrap');

            if (!triggers) {
                triggers = document.createElement('div');
                triggers.className = 'np-dock-trigger-wrap';
                dock.appendChild(triggers);
            }

            var hamburger = triggers.querySelector(':scope > .np-dock-hamburger');
            if (!hamburger) {
                hamburger = makeHamburger();
                triggers.appendChild(hamburger);
            }

            if (!hamburger.querySelector('span')) {
                hamburger.textContent = '';
                hamburger.appendChild(document.createElement('span'));
                hamburger.appendChild(document.createElement('span'));
                hamburger.appendChild(document.createElement('span'));
            }

            var dots = triggers.querySelector(':scope > .np-dock-widget-more');
            if (!dots) {
                dots = makeDots();
                triggers.appendChild(dots);
            }

            var menu = dock.querySelector(':scope > .np-dock-menu');
            if (!menu) {
                menu = document.createElement('div');
                menu.className = 'np-dock-menu';
                dock.appendChild(menu);
            }

            menu.textContent = '';
            menu.appendChild(makeMenuButton('import', 'bi bi-folder2-open', 'Import audio'));
            menu.appendChild(makeMenuButton('back', 'bi bi-skip-backward-fill', 'Back 10 seconds'));
            menu.appendChild(makeMenuButton('play', 'bi bi-play-fill', 'Play or pause'));
            menu.appendChild(makeMenuButton('forward', 'bi bi-skip-forward-fill', 'Forward 10 seconds'));

            if (pill && pill !== dock) {
                pill.classList.add('np-dock-pill-has-menu');
            }
        });

        updatePlayIcon();
    }

    function updatePlayIcon() {
        var np = player();
        var audio = np && np.audio;
        var playing = audio && !audio.paused;
        var playClass = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';

        document.querySelectorAll('.nowplaying.np-dock-nuclear > .np-dock-menu [data-np-action="play"] i').forEach(function (icon) {
            icon.className = playClass;
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

    function toggleMenu(button) {
        var dock = button.closest('.nowplaying.np-dock-nuclear');
        var menu = dock && dock.querySelector(':scope > .np-dock-menu');

        if (!menu) return;

        var open = !menu.classList.contains('show');
        closeMenus(menu);

        menu.classList.toggle('show', open);

        dock.querySelectorAll('.np-dock-hamburger, .np-dock-widget-more').forEach(function (trigger) {
            trigger.classList.toggle('is-open', open);
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function installEvents() {
        if (window.__nowPlayingSeparateInteractionsInstalled) return;
        window.__nowPlayingSeparateInteractionsInstalled = true;

        document.addEventListener('click', function (event) {
            var trigger = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear .np-dock-hamburger, .nowplaying.np-dock-nuclear .np-dock-widget-more');
            var item = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-menu .np-dock-menu-item');
            var menu = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-menu');
            var dock = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear');

            if (trigger) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                toggleMenu(trigger);
                return;
            }

            if (item) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                runAction(item.getAttribute('data-np-action'));
                updatePlayIcon();
                return;
            }

            if (menu) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }

            if (dock) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                runAction('play');
                return;
            }

            closeMenus();
        }, true);
    }

    function patchPlayer() {
        var np = player();
        if (!np || np.__nowPlayingSeparateInteractionsPatched) return;

        np.__nowPlayingSeparateInteractionsPatched = true;

        var init = np.init;
        var render = np.render;

        if (typeof init === 'function') {
            np.init = function () {
                init.call(np);
                ensureMenu();
            };
        }

        if (typeof render === 'function') {
            np.render = function () {
                render.call(np);
                ensureMenu();
            };
        }
    }

    function start() {
        patchPlayer();
        installEvents();
        ensureMenu();

        window.setTimeout(function () {
            patchPlayer();
            ensureMenu();
        }, 250);

        window.setTimeout(function () {
            patchPlayer();
            ensureMenu();
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
