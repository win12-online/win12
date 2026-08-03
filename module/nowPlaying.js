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
                    dock.querySelectorAll(':scope > .np-dock-hamburger, :scope > .np-dock-widget-more').forEach(function (button) {
                        button.classList.remove('is-open');
                        button.setAttribute('aria-expanded', 'false');
                    });
                }
            }
        });
    }

    function icon(className) {
        var node = document.createElement('i');
        node.className = className;
        return node;
    }

    function button(className, label) {
        var node = document.createElement('button');
        node.type = 'button';
        node.className = className;
        node.title = label;
        node.setAttribute('aria-label', label);
        node.setAttribute('aria-expanded', 'false');
        return node;
    }

    function hamburger() {
        var node = button('np-dock-hamburger', 'Now Playing controls');
        node.appendChild(document.createElement('span'));
        node.appendChild(document.createElement('span'));
        node.appendChild(document.createElement('span'));
        return node;
    }

    function dots() {
        var node = button('np-dock-widget-more', 'Widget menu');
        node.appendChild(icon('bi bi-three-dots'));
        return node;
    }

    function menuButton(action, iconClass, label) {
        var node = document.createElement('button');
        node.type = 'button';
        node.className = 'np-dock-menu-item';
        node.title = label;
        node.setAttribute('aria-label', label);
        node.setAttribute('data-np-action', action);
        node.appendChild(icon(iconClass));
        return node;
    }

    function ensureMenu() {
        var np = player();
        if (!np) return;

        pins().forEach(function (dock) {
            dock.classList.add('np-dock-nuclear');

            Array.from(dock.querySelectorAll(':scope > .np-dock-hamburger')).slice(1).forEach(function (node) {
                node.remove();
            });

            Array.from(dock.querySelectorAll(':scope > .np-dock-widget-more')).slice(1).forEach(function (node) {
                node.remove();
            });

            Array.from(dock.querySelectorAll(':scope > .np-dock-menu')).slice(1).forEach(function (node) {
                node.remove();
            });

            var hamburgerButton = dock.querySelector(':scope > .np-dock-hamburger');
            if (!hamburgerButton) {
                hamburgerButton = hamburger();
                dock.appendChild(hamburgerButton);
            }

            if (!hamburgerButton.querySelector('span')) {
                hamburgerButton.textContent = '';
                hamburgerButton.appendChild(document.createElement('span'));
                hamburgerButton.appendChild(document.createElement('span'));
                hamburgerButton.appendChild(document.createElement('span'));
            }

            var dotsButton = dock.querySelector(':scope > .np-dock-widget-more');
            if (!dotsButton) {
                dotsButton = dots();
                dock.appendChild(dotsButton);
            }

            if (!dotsButton.querySelector('i')) {
                dotsButton.textContent = '';
                dotsButton.appendChild(icon('bi bi-three-dots'));
            }

            var menu = dock.querySelector(':scope > .np-dock-menu');
            if (!menu) {
                menu = document.createElement('div');
                menu.className = 'np-dock-menu';
                dock.appendChild(menu);
            }

            menu.textContent = '';
            menu.appendChild(menuButton('import', 'bi bi-folder2-open', 'Import audio'));
            menu.appendChild(menuButton('back', 'bi bi-skip-backward-fill', 'Back 10 seconds'));
            menu.appendChild(menuButton('play', 'bi bi-play-fill', 'Play or pause'));
            menu.appendChild(menuButton('forward', 'bi bi-skip-forward-fill', 'Forward 10 seconds'));
        });

        updatePlayIcon();
    }

    function updatePlayIcon() {
        var np = player();
        var audio = np && np.audio;
        var playing = audio && !audio.paused;
        var className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';

        document.querySelectorAll('.nowplaying.np-dock-nuclear > .np-dock-menu [data-np-action="play"] i').forEach(function (node) {
            node.className = className;
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

    function toggleMenu(trigger) {
        var dock = trigger.closest('.nowplaying.np-dock-nuclear');
        var menu = dock && dock.querySelector(':scope > .np-dock-menu');

        if (!menu) return;

        var open = !menu.classList.contains('show');
        closeMenus(menu);
        menu.classList.toggle('show', open);

        dock.querySelectorAll(':scope > .np-dock-hamburger, :scope > .np-dock-widget-more').forEach(function (button) {
            button.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function installEvents() {
        if (window.__nowPlayingDirectButtonsInstalled) return;
        window.__nowPlayingDirectButtonsInstalled = true;

        document.addEventListener('click', function (event) {
            var trigger = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-hamburger, .nowplaying.np-dock-nuclear > .np-dock-widget-more');
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
        if (!np || np.__nowPlayingDirectButtonsPatched) return;

        np.__nowPlayingDirectButtonsPatched = true;

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
