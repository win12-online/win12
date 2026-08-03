// Now Playing taskbar pin interactions.
// Kept separate from module/widget.js so the widget renderer and taskbar controls can be debugged independently.

(function () {
    function getPlayer() {
        return typeof widgets !== 'undefined' && widgets && widgets.nowplaying ? widgets.nowplaying : null;
    }

    function getDockPins() {
        return document.querySelectorAll('.wg.toolbar.nowplaying, .nowplaying.np-dock-nuclear');
    }

    function closeMenus(exceptMenu) {
        document.querySelectorAll('.nowplaying.np-dock-nuclear > .np-dock-menu.show').forEach(function (menu) {
            if (!exceptMenu || menu !== exceptMenu) {
                menu.classList.remove('show');

                const trigger = menu.parentElement && menu.parentElement.querySelector(':scope > .np-dock-more');
                if (trigger) {
                    trigger.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    function makeButton(className, title) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.title = title;
        return button;
    }

    function makeIcon(className) {
        const icon = document.createElement('i');
        icon.className = className;
        return icon;
    }

    function makeHamburgerButton() {
        const button = makeButton('np-dock-more', 'Now Playing controls');
        button.setAttribute('aria-label', 'Now Playing controls');
        button.setAttribute('aria-expanded', 'false');

        button.appendChild(document.createElement('span'));
        button.appendChild(document.createElement('span'));
        button.appendChild(document.createElement('span'));

        return button;
    }

    function makeMenuButton(sourceButton, action, iconClass, title) {
        const button = sourceButton.cloneNode(false);

        button.className = 'np-dock-menu-item';
        button.type = 'button';
        button.title = title;
        button.setAttribute('aria-label', title);
        button.setAttribute('data-np-action', action);
        button.removeAttribute('id');
        button.removeAttribute('onclick');
        button.removeAttribute('aria-expanded');

        button.appendChild(makeIcon(iconClass));

        return button;
    }

    function ensureMenu() {
        const player = getPlayer();
        if (!player) return;

        getDockPins().forEach(function (dock) {
            dock.classList.add('np-dock-nuclear');

            Array.from(dock.querySelectorAll(':scope > .np-dock-more')).slice(1).forEach(function (node) {
                node.remove();
            });

            Array.from(dock.querySelectorAll(':scope > .np-dock-menu')).slice(1).forEach(function (node) {
                node.remove();
            });

            let hamburger = dock.querySelector(':scope > .np-dock-more');
            if (!hamburger) {
                hamburger = makeHamburgerButton();
                dock.appendChild(hamburger);
            }

            if (!hamburger.querySelector('span')) {
                hamburger.textContent = '';
                hamburger.appendChild(document.createElement('span'));
                hamburger.appendChild(document.createElement('span'));
                hamburger.appendChild(document.createElement('span'));
            }

            hamburger.setAttribute('aria-label', 'Now Playing controls');

            let menu = dock.querySelector(':scope > .np-dock-menu');
            if (!menu) {
                menu = document.createElement('div');
                menu.className = 'np-dock-menu';
                dock.appendChild(menu);
            }

            menu.textContent = '';
            menu.appendChild(makeMenuButton(hamburger, 'import', 'bi bi-folder2-open', 'Import audio'));
            menu.appendChild(makeMenuButton(hamburger, 'back', 'bi bi-skip-backward-fill', 'Back 10 seconds'));
            menu.appendChild(makeMenuButton(hamburger, 'play', 'bi bi-play-fill', 'Play or pause'));
            menu.appendChild(makeMenuButton(hamburger, 'forward', 'bi bi-skip-forward-fill', 'Forward 10 seconds'));
        });

        updatePlayIcon();
    }

    function updatePlayIcon() {
        const player = getPlayer();
        const audio = player && player.audio;
        const isPlaying = audio && !audio.paused;
        const iconClass = isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill';

        document.querySelectorAll('.nowplaying.np-dock-nuclear > .np-dock-menu [data-np-action="play"] i').forEach(function (icon) {
            icon.className = iconClass;
        });
    }

    function runAction(action) {
        const player = getPlayer();
        if (!player) return;

        if (action === 'import') {
            if (typeof player.pickFile === 'function') {
                player.pickFile();
                return;
            }

            const fileInput = document.querySelector('.wg.nowplaying:not(.template) .nowplaying-file');
            if (fileInput) fileInput.click();
            return;
        }

        if (action === 'back' && typeof player.skip === 'function') {
            player.skip(-10);
            return;
        }

        if (action === 'play' && typeof player.toggle === 'function') {
            Promise.resolve(player.toggle()).finally(updatePlayIcon);
            return;
        }

        if (action === 'forward' && typeof player.skip === 'function') {
            player.skip(10);
        }
    }

    function installClickHandlers() {
        if (window.__nowPlayingInteractionsInstalled) return;
        window.__nowPlayingInteractionsInstalled = true;

        document.addEventListener('click', function (event) {
            const hamburger = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-more');
            const menuItem = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-menu .np-dock-menu-item');
            const menu = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear > .np-dock-menu');
            const dock = event.target.closest && event.target.closest('.nowplaying.np-dock-nuclear');

            if (hamburger) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                const parentDock = hamburger.closest('.nowplaying.np-dock-nuclear');
                const dockMenu = parentDock && parentDock.querySelector(':scope > .np-dock-menu');

                if (dockMenu) {
                    const shouldOpen = !dockMenu.classList.contains('show');
                    closeMenus(dockMenu);

                    dockMenu.classList.toggle('show', shouldOpen);
                    hamburger.classList.toggle('is-open', shouldOpen);
                    hamburger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
                }

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

    function patchPlayerHooks() {
        const player = getPlayer();
        if (!player || player.__nowPlayingInteractionsPatched) return;

        player.__nowPlayingInteractionsPatched = true;

        const oldInit = player.init;
        const oldRender = player.render;

        if (typeof oldInit === 'function') {
            player.init = function () {
                oldInit.call(player);
                ensureMenu();
            };
        }

        if (typeof oldRender === 'function') {
            player.render = function () {
                oldRender.call(player);
                ensureMenu();
            };
        }
    }

    function start() {
        patchPlayerHooks();
        installClickHandlers();
        ensureMenu();

        window.setTimeout(function () {
            patchPlayerHooks();
            ensureMenu();
        }, 250);

        window.setTimeout(function () {
            patchPlayerHooks();
            ensureMenu();
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
