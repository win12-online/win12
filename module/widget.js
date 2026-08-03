// 小组件功能

let widgets = {
    widgets: {
        add: (arg) => {
            if ($(`.wg.${arg}.menu,.wg.${arg}.toolbar,.wg.${arg}.desktop`).length != 0) {
                return;
            }
            $('#widgets>.widgets>.content>.grid')[0].innerHTML += $('#widgets>.widgets>.content>.template>.' + arg).html();
            $('#widgets>.widgets>.content>.grid>.wg.' + arg).removeClass('template').addClass('menu');
            widgets[arg].init();

        },
        remove: (arg) => {
            $(`.wg.${arg}.menu,.wg.${arg}.toolbar,.wg.${arg}.desktop`).remove();
            widgets[arg].remove();
        },
        addToToolbar: (arg) => {
            // widgets.widgets.remove(arg);
            if ($('.wg.toolbar.' + arg).length != 0) {
                return;
            }
            $('#toolbar')[0].innerHTML += $('#widgets>.widgets>.content>.template>.' + arg).html();
            $('#toolbar>.wg.' + arg).removeClass('template').addClass('toolbar');
            widgets[arg].init();
        },
        addToDesktop: (arg) => {
            // widgets.widgets.remove(arg);
            if ($('.wg.toolbar.' + arg).length != 0) {
                return;
            }
            $('#desktop-widgets')[0].innerHTML += $('#widgets>.widgets>.content>.template>.' + arg).html();
            $('#desktop-widgets>.' + arg).removeClass('template').addClass('desktop');
            // setTimeout(() => {
                widgets[arg].init();
            // }, 5000);
        }
    },
    calc: {
        init: () => {
            widgetCalculator = new Calculator('.wg.calc:not(.template)>.content>.container>#calc-input-widgets', '.wg.calc:not(.template)>.content');
        },
        remove: () => {
            // $('#calc-input-widgets')[0].value = '0';
            $('#calc-input-widgets').val('0');
        }
    },
    weather: {
        init: () => {
            widgets.weather.update();
            widgets.weather.handel = setInterval(widgets.weather.update, 100000);
        },
        remove: () => {
            clearInterval(widgets.weather.handel);
        },
        update: () => {
            let wic = {
                "d000": "SunnyDayV3",
                "d100": "MostlySunnyDay",
                "d200": "D200PartlySunnyV2",
                "d210": "D210LightRainShowersV2",
                "d211": "D211LightRainSowShowersV2",
                "d212": "D212LightSnowShowersV2",
                "d220": "LightRainShowerDay",
                "d221": "D221RainSnowShowersV2",
                "d222": "SnowShowersDayV2",
                "d240": "D240TstormsV2",
                "d300": "MostlyCloudyDayV2",
                "d310": "D310LightRainShowersV2",
                "d311": "D311LightRainSnowShowersV2",
                "d312": "LightSnowShowersDay",
                "d320": "RainShowersDayV2",
                "d321": "D321RainSnowShowersV2",
                "d322": "SnowShowersDayV2",
                "d340": "D340TstormsV2",
                "d400": "CloudyV3",
                "d410": "LightRainV3",
                "d411": "RainSnowV2",
                "d412": "LightSnowV2",
                "d420": "HeavyDrizzle",
                "d421": "RainSnowV2",
                "d422": "Snow",
                "d430": "ModerateRainV2",
                "d431": "RainSnowV2",
                "d432": "HeavySnowV2",
                "d440": "Thunderstorm",
                "d500": "MostlyCloudyDayV2",
                "d600": "FogV2",
                "d603": "FreezingRainV2",
                "d605": "IcePelletsV2",
                "d705": "BlowingHailV2",
                "d905": "BlowingHailV2",
                "d907": "Haze",
                "d900": "Haze",
                "n000": "ClearNightV3",
                "n100": "MostlyClearNight",
                "n200": "PartlyCloudyNightV2",
                "n210": "N210LightRainShowersV2",
                "n211": "N211LightRainSnowShowersV2",
                "n212": "N212LightSnowShowersV2",
                "n220": "LightRainShowerNight",
                "n221": "N221RainSnowShowersV2",
                "n222": "N222SnowShowersV2",
                "n240": "N240TstormsV2",
                "n300": "MostlyCloudyNightV2",
                "n310": "N310LightRainShowersV2",
                "n311": "N311LightRainSnowShowersV2",
                "n312": "LightSnowShowersNight",
                "n320": "RainShowersNightV2",
                "n321": "N321RainSnowShowersV2",
                "n322": "N322SnowShowersV2",
                "n340": "N340TstormsV2",
                "n400": "CloudyV3",
                "n410": "LightRainV3",
                "n411": "RainSnowV2",
                "n412": "LightSnowV2",
                "n420": "HeavyDrizzle",
                "n421": "RainSnowShowersNightV2",
                "n422": "N422SnowV2",
                "n430": "ModerateRainV2",
                "n431": "RainSnowV2",
                "n432": "HeavySnowV2",
                "n440": "Thunderstorm",
                "n500": "PartlyCloudyNightV2",
                "n600": "FogV2",
                "n603": "FreezingRainV2",
                "n605": "BlowingHailV2",
                "n705": "BlowingHailV2",
                "n905": "BlowingHailV2",
                "n907": "Hazy-Night",
                "n900": "Hazy-Night",
                "xxxx1": "WindyV2"
            };
            $.getJSON('https://api.msn.cn/weather/overview?apikey=j5i4gDqHL6nGYwx5wi5kRhXjtf2c5qgFX9fzfk0TOo&locale=zh-cn&ocid=msftweather').then(r => {
                let inf = r.value[0].responses[0].weather[0].current;
                // console.log(inf.icon,wic[inf.icon]);
                $('.wg.weather>.content>.img').attr('src', `https://assets.msn.cn/weathermapdata/1/static/weather/Icons/taskbar_v10/Condition_Card/${wic[inf.symbol]}.svg`);
                $('.wg.weather>.content>.text>.temperature').text(`${inf.temp}℃`);
                $('.wg.weather>.content>.text>.detail').text(`${inf.cap} 体感温度${inf.feels}℃`);
            });
        },
    },
    monitor: {
        type: 'cpu',
        handle: null,
        init: () => {
            if ($('*:not(.template)>*>.wg.monitor')[0].classList.contains('toolbar')) {
                $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle').attr('r', '15px');
            }
            else {
                $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle').attr('r', '26px');
            }
            if (apps.taskmgr.preLoaded != true && apps.taskmgr.loaded != true) {
                apps.taskmgr.load(false);
            }
            apps.taskmgr.preLoaded = true;
            widgets.monitor.update();
            widgets.monitor.handle = window.setInterval(widgets.monitor.update, 1000);
        },
        update: () => {
            $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child').css('stroke-dasharray', `${widgets.monitor.type != 'gpu' ? widgets.monitor.type.match('wifi') ? widgets.monitor.type == 'wifi-send' ? apps.taskmgr.wifi.send / 100 * (Math.PI * $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child')[0].r.baseVal.value * 2) : apps.taskmgr.wifi.receive / 100 * (Math.PI * $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child')[0].r.baseVal.value * 2) : apps.taskmgr[widgets.monitor.type] / 100 * (Math.PI * $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child')[0].r.baseVal.value * 2) : apps.taskmgr.gpu.usage / 100 * (Math.PI * $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child')[0].r.baseVal.value * 2)}, 170`);
            if (widgets.monitor.type == 'cpu' || widgets.monitor.type == 'gpu') {
                $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child').css('stroke', '#2983cc');
                $('*:not(.template)>*>.wg.monitor>.content>.text>.type')[0].innerText = widgets.monitor.type == 'cpu' ? 'CPU 利用率' : 'GPU 利用率';
            }
            else if (widgets.monitor.type == 'memory') {
                $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child').css('stroke', '#660099');
                $('*:not(.template)>*>.wg.monitor>.content>.text>.type')[0].innerText = '内存使用量';
            }
            else if (widgets.monitor.type == 'disk') {
                $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child').css('stroke', '#008000');
                $('*:not(.template)>*>.wg.monitor>.content>.text>.type')[0].innerText = '磁盘活动时间';
            }
            else if (widgets.monitor.type == 'wifi-send') {
                $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child').css('stroke', '#8e5829');
                $('*:not(.template)>*>.wg.monitor>.content>.text>.type')[0].innerText = '网络吞吐量 - 发送';
            }
            else if (widgets.monitor.type == 'wifi-receive') {
                $('*:not(.template)>*>.wg.monitor>.content>.container>svg>circle:last-child').css('stroke', '#8e5829');
                $('*:not(.template)>*>.wg.monitor>.content>.text>.type')[0].innerText = '网络吞吐量 - 接收';
            }
            $('*:not(.template)>*>.wg.monitor>.content>.text>.value')[0].innerText = (widgets.monitor.type != 'gpu' ? widgets.monitor.type.match('wifi') ? widgets.monitor.type == 'wifi-send' ? apps.taskmgr.wifi.send : apps.taskmgr.wifi.receive : apps.taskmgr[widgets.monitor.type] : apps.taskmgr.gpu.usage).toFixed(widgets.monitor.type.match('wifi') ? 2 : 1) + (widgets.monitor.type.match('wifi') ? 'Mbps' : '%');
            $('*:not(.template)>*>.wg.monitor>.content>.container>.text>.value')[0].innerText = (widgets.monitor.type != 'gpu' ? widgets.monitor.type.match('wifi') ? widgets.monitor.type == 'wifi-send' ? apps.taskmgr.wifi.send : apps.taskmgr.wifi.receive : apps.taskmgr[widgets.monitor.type] : apps.taskmgr.gpu.usage).toFixed(widgets.monitor.type.match('wifi') ? 2 : 1) + (widgets.monitor.type.match('wifi') ? 'Mbps' : '%');
        },
        remove: () => {
            window.clearInterval(widgets.monitor.handle);
        }
    }
};
let edit_mode = false,gridnow;
function editMode() {
    if (edit_mode) {
        $('#desktop-editbar-container').removeClass('show');
        $('#desktop-widgets').removeClass('edit');
    }
    else if (!edit_mode) {
        $('#desktop-editbar-container').addClass('show');
        $('#desktop-widgets').addClass('edit');
    }
    edit_mode = !edit_mode;
}
function widgetsMove(elt, e) {
    if (elt.classList.contains('desktop') && edit_mode == true) {
        let width = elt.getBoundingClientRect().width;
        let height = elt.getBoundingClientRect().height;
        let gridrow = window.getComputedStyle(elt, null).gridRowEnd.replace('span ', '');
        let gridcol = window.getComputedStyle(elt, null).gridColumnEnd.replace('span ', '');
        let gridrowmax = window.getComputedStyle($('#desktop-widgets')[0], null).gridTemplateRows.split(' ').length;
        let gridcolmax = window.getComputedStyle($('#desktop-widgets')[0], null).gridTemplateColumns.split(' ').length;
        let deltaLeft = e.clientX - elt.getBoundingClientRect().left;
        let deltaTop = e.clientY - elt.getBoundingClientRect().top;
        elt.style.position = 'fixed';
        elt.style.width = `${width}px`;
        elt.style.height = `${height}px`;
        elt.classList.add('moving');
        elt.classList.add('notrans');
        // elt.style.left = `${e.clientX - deltaLeft}px`;
        // elt.style.top = `${e.clientY - deltaTop}px`;

        $('#desktop-widgets>.widgets-move').addClass('show');
        // $('#desktop-widgets>.widgets-move').css('cssText', `width: ${width}px; height: ${height}px;`);
        function widgetsMoving(e) {
            let left = 0, top = 0;
            if (e.type.match('mouse')) {
                left = e.clientX - deltaLeft;
                top = e.clientY - deltaTop;
            }
            else if (e.type.match('touch')) {
                left = e.touches[0].clientX - deltaLeft;
                top = e.touches[0].clientY - deltaTop;
            }
            elt.style.left = `${left}px`;
            elt.style.top = `${top}px`;
            // 基于人脑计算 qwq
            gridnow = {
                // 四舍五入 (组件宽度 / 2 + 组件视窗右边距 - 布局右边距) / ((网格总列数 * 网格宽度 + 网格间距 * 网格间距数量) / 网格总数量) - 元素网格列尾 + 校正值)
                col: ((width / 2 + elt.getBoundingClientRect().right - 20) / ((gridcolmax * 83 + 10 * (gridcolmax - 1)) / gridcolmax) - gridcol/* + (gridcol - 2) * 0.5*/).toFixed(0),
                row: ((height / 2 + top - 20) / ((gridrowmax * 83 + 10 * (gridrowmax - 1)) / gridrowmax) + (2 - gridrow) * 0.5).toFixed(0)
            };
            gridnow.col = gridnow.col <= Math.floor(gridcol / 2) ? 1 + Math.floor(gridcol / 2) : gridnow.col > (gridcolmax - gridcol + (gridcol % 2 ? (Number(gridcol) + 1) / 2 : gridcol / 2)) ? (gridcolmax - gridcol + (gridcol % 2 ? (Number(gridcol) + 1) / 2 : gridcol / 2)) : gridnow.col;
            gridnow.row = gridnow.row <= 0 ? 1 : gridnow.row >= (gridrowmax - gridrow + 1) ? gridrowmax - gridrow + 1 : gridnow.row;
            $('#desktop-widgets>.widgets-move').css('cssText', `grid-column: ${gridcolmax - gridnow.col} / span ${gridcol}; grid-row: ${gridnow.row} / span ${gridrow}`);
        }
        function up() {
            elt.classList.remove('notrans');
            elt.classList.remove('moving');
            let destTop = $('#desktop-widgets>.widgets-move')[0].getBoundingClientRect().top;
            let destLeft = $('#desktop-widgets>.widgets-move')[0].getBoundingClientRect().left;
            elt.style.left = `${destLeft}px`;
            elt.style.top = `${destTop}px`;
            window.setTimeout(() => {
                elt.style.position = 'static';
                $(elt).css('cssText', `grid-column: ${gridcolmax - gridnow.col} / span ${gridcol}; grid-row: ${gridnow.row} / span ${gridrow}`);
                elt.style.left = '0px';
                elt.style.top = '0px';
                $('#desktop-widgets>.widgets-move').removeClass('show');
            }, 500);
            page.onmousemove = null;
            page.ontouchmove = null;
            page.onmouseup = null;
            page.ontouchend = null;
            page.ontouchcancel = null;
        }
        widgetsMoving(e);
        page.onmousemove = widgetsMoving;
        page.ontouchmove = widgetsMoving;
        page.onmouseup = up;
        page.ontouchend = up;
        page.ontouchcancel = up;
    }
}

(function () {
    if (!widgets) return;

    widgets.nowplaying = {
        audio: null,
        objectUrl: null,
        title: '',
        artist: '',
        onEnded: null,

        text: () => ({
            label: lang('正在播放', 'nts.addwg.nowplaying'),
            noTrack: lang('未选择曲目', 'nts.nowplaying.noTrack'),
            importHint: lang('导入本地音频文件', 'nts.nowplaying.importHint'),
            localFile: lang('本地音频文件', 'nts.nowplaying.localFile'),
            back: lang('后退 10 秒', 'nts.nowplaying.back'),
            playPause: lang('播放 / 暂停', 'nts.nowplaying.playPause'),
            forward: lang('前进 10 秒', 'nts.nowplaying.forward'),
            importAudio: lang('导入音频', 'nts.nowplaying.import')
        }),

        init: () => {
            if (!widgets.nowplaying.audio) {
                widgets.nowplaying.audio = new Audio();
                widgets.nowplaying.onEnded = () => widgets.nowplaying.render();

                widgets.nowplaying.audio.addEventListener('timeupdate', widgets.nowplaying.render);
                widgets.nowplaying.audio.addEventListener('loadedmetadata', widgets.nowplaying.render);
                widgets.nowplaying.audio.addEventListener('ended', widgets.nowplaying.onEnded);
            }

            widgets.nowplaying.bind();
            widgets.nowplaying.render();
        },

        bind: () => {
            $('.wg.nowplaying:not(.template) .nowplaying-file')
                .off('change.nowplaying')
                .on('change.nowplaying', function () {
                    if (this.files && this.files[0]) {
                        widgets.nowplaying.loadFile(this.files[0]);
                    }

                    this.value = '';
                });

            $('.wg.nowplaying:not(.template) .nowplaying-progress')
                .off('input.nowplaying')
                .on('input.nowplaying', function () {
                    if (!widgets.nowplaying.audio || !isFinite(widgets.nowplaying.audio.duration)) return;

                    widgets.nowplaying.audio.currentTime = Number(this.value);
                    widgets.nowplaying.render();
                });
        },

        pickFile: () => {
            $('.wg.nowplaying:not(.template) .nowplaying-file').first().click();
        },

        loadFile: (file) => {
            const labels = widgets.nowplaying.text();

            if (widgets.nowplaying.objectUrl) {
                URL.revokeObjectURL(widgets.nowplaying.objectUrl);
                widgets.nowplaying.objectUrl = null;
            }

            widgets.nowplaying.objectUrl = URL.createObjectURL(file);
            widgets.nowplaying.audio.src = widgets.nowplaying.objectUrl;
            widgets.nowplaying.title = file.name.replace(/\.[^/.]+$/, '') || file.name;
            widgets.nowplaying.artist = labels.localFile;
            widgets.nowplaying.render();
        },

        toggle: async () => {
            if (!widgets.nowplaying.audio || !widgets.nowplaying.audio.src) {
                widgets.nowplaying.pickFile();
                return;
            }

            if (widgets.nowplaying.audio.paused) {
                await widgets.nowplaying.audio.play();
            } else {
                widgets.nowplaying.audio.pause();
            }

            widgets.nowplaying.render();
        },

        skip: (seconds) => {
            if (!widgets.nowplaying.audio || !widgets.nowplaying.audio.src) return;

            const audio = widgets.nowplaying.audio;
            const duration = isFinite(audio.duration) ? audio.duration : 0;
            const nextTime = Math.max(
                0,
                Math.min(duration || audio.currentTime + seconds, audio.currentTime + seconds)
            );

            audio.currentTime = nextTime;
            widgets.nowplaying.render();
        },

        formatTime: (seconds) => {
            if (!isFinite(seconds)) return '0:00';

            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60).toString().padStart(2, '0');

            return `${m}:${s}`;
        },

        render: () => {
            const labels = widgets.nowplaying.text();
            const audio = widgets.nowplaying.audio;
            const current = audio ? audio.currentTime : 0;
            const duration = audio && isFinite(audio.duration) ? audio.duration : 0;
            const playing = audio && !audio.paused;
            const title = widgets.nowplaying.title || labels.noTrack;
            const artist = widgets.nowplaying.artist || labels.importHint;

            $('.wg.nowplaying:not(.template) .np-label').text(labels.label);
            $('.wg.nowplaying:not(.template) .np-title').text(title);
            $('.wg.nowplaying:not(.template) .np-artist').text(artist);

            $('.wg.nowplaying:not(.template) .np-back').attr('win12_title', labels.back);
            $('.wg.nowplaying:not(.template) .np-play').attr('win12_title', labels.playPause);
            $('.wg.nowplaying:not(.template) .np-forward').attr('win12_title', labels.forward);
            $('.wg.nowplaying:not(.template) .np-import').attr('win12_title', labels.importAudio);

            $('.wg.nowplaying:not(.template) .np-play')
                .html(playing ? '<i class="bi bi-pause-fill"></i>' : '<i class="bi bi-play-fill"></i>');

            $('.wg.nowplaying:not(.template) .np-current').text(widgets.nowplaying.formatTime(current));
            $('.wg.nowplaying:not(.template) .np-duration').text(widgets.nowplaying.formatTime(duration));

            $('.wg.nowplaying:not(.template) .nowplaying-progress')
                .attr('max', duration || 100)
                .val(current || 0);
        },

        remove: () => {
            if (widgets.nowplaying.audio) {
                widgets.nowplaying.audio.pause();

                widgets.nowplaying.audio.removeEventListener('timeupdate', widgets.nowplaying.render);
                widgets.nowplaying.audio.removeEventListener('loadedmetadata', widgets.nowplaying.render);

                if (widgets.nowplaying.onEnded) {
                    widgets.nowplaying.audio.removeEventListener('ended', widgets.nowplaying.onEnded);
                }

                widgets.nowplaying.audio.removeAttribute('src');
                widgets.nowplaying.audio.load();
                widgets.nowplaying.audio = null;
            }

            if (widgets.nowplaying.objectUrl) {
                URL.revokeObjectURL(widgets.nowplaying.objectUrl);
                widgets.nowplaying.objectUrl = null;
            }

            widgets.nowplaying.onEnded = null;
            widgets.nowplaying.title = '';
            widgets.nowplaying.artist = '';

            widgets.nowplaying.render();
        }
    };
})();


(function () {
    function stopDockEvent(event) {
        if (typeof stop === 'function') {
            stop(event);
        } else {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    function player() {
        return typeof widgets !== 'undefined' && widgets && widgets.nowplaying ? widgets.nowplaying : null;
    }

    function formatTime(seconds) {
        if (!isFinite(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return minutes + ':' + secs;
    }

    function looksLikeBottomDockNowPlaying(el) {
        if (!el || !el.classList || !el.classList.contains('nowplaying')) return false;
        if (el.classList.contains('template')) return false;
        if (el.classList.contains('window')) return false;

        const rect = el.getBoundingClientRect();
        const isSmallDockSized = rect.height <= 120 && rect.width <= 460;
        const nearBottom = rect.bottom > window.innerHeight - 150;
        const inKnownDock = !!el.closest('#taskbar,.dock,.toolbar');

        return el.classList.contains('toolbar') || inKnownDock || (nearBottom && isSmallDockSized);
    }

    function dockNowPlayingElements() {
        return Array.from(document.querySelectorAll('.nowplaying')).filter(looksLikeBottomDockNowPlaying);
    }

    function makeIconButton(className, iconClass, title) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.title = title || '';

        const icon = document.createElement('i');
        icon.className = iconClass;
        button.appendChild(icon);

        return button;
    }

    function ensureOpenApp(menu) {
        if (!menu || menu.querySelector('.nowplaying-open-app')) return;

        const open = document.createElement('a');
        open.className = 'a nowplaying-open-app';
        open.setAttribute('win12_title', 'Open app');

        const icon = document.createElement('i');
        icon.className = 'bi bi-window';
        open.appendChild(icon);

        open.onclick = function (event) {
            stopDockEvent(event);
            if (typeof openapp === 'function') openapp('nowplaying');
            menu.classList.remove('show');
        };

        const deleteButton = menu.querySelector('.delete');
        if (deleteButton && deleteButton.parentNode) {
            deleteButton.parentNode.insertBefore(open, deleteButton);
        } else {
            menu.insertBefore(open, menu.firstChild);
        }
    }

    function extractMenu(widget) {
        let menu = widget.querySelector(':scope > .np-dock-menu');
        if (menu) {
            menu.remove();
            return menu;
        }

        menu = widget.querySelector(':scope > .titbar > .menu, .titbar .menu, :scope > .menu, .menu');

        if (menu) {
            menu.classList.remove('show');
            menu.classList.add('np-dock-menu');
            menu.remove();
            return menu;
        }

        menu = document.createElement('div');
        menu.className = 'menu np-dock-menu';

        return menu;
    }

    function buildPill(widget) {
        const menu = extractMenu(widget);
        ensureOpenApp(menu);

        while (widget.firstChild) {
            widget.removeChild(widget.firstChild);
        }

        widget.classList.add('np-dock-nuclear');

        const pill = document.createElement('div');
        pill.className = 'np-dock-pill';

        const cover = document.createElement('div');
        cover.className = 'np-dock-cover';
        const coverIcon = document.createElement('i');
        coverIcon.className = 'bi bi-music-note-beamed';
        cover.appendChild(coverIcon);

        const title = document.createElement('div');
        title.className = 'np-dock-title';
        title.textContent = '未选择曲目';

        const time = document.createElement('div');
        time.className = 'np-dock-time';
        time.textContent = '0:00';

        const importButton = makeIconButton('np-dock-import', 'bi bi-folder2-open', 'Import');

        const slider = document.createElement('input');
        slider.className = 'np-dock-slider';
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = '0';

        const controls = document.createElement('div');
        controls.className = 'np-dock-controls';

        const back = makeIconButton('np-dock-back', 'bi bi-skip-backward-fill', '-10s');
        const play = makeIconButton('np-dock-play', 'bi bi-play-fill', 'Play/Pause');
        const forward = makeIconButton('np-dock-forward', 'bi bi-skip-forward-fill', '+10s');

        controls.appendChild(back);
        controls.appendChild(play);
        controls.appendChild(forward);

        const more = makeIconButton('np-dock-more', 'bi bi-three-dots', 'More');

        pill.appendChild(cover);
        pill.appendChild(title);
        pill.appendChild(time);
        pill.appendChild(importButton);
        pill.appendChild(slider);
        pill.appendChild(controls);

        widget.appendChild(pill);
        widget.appendChild(more);
        widget.appendChild(menu);

        importButton.onclick = function (event) {
            stopDockEvent(event);
            const p = player();
            if (p && typeof p.pickFile === 'function') p.pickFile();
        };

        back.onclick = function (event) {
            stopDockEvent(event);
            const p = player();
            if (p && typeof p.skip === 'function') {
                p.skip(-10);
                updateDock();
            }
        };

        forward.onclick = function (event) {
            stopDockEvent(event);
            const p = player();
            if (p && typeof p.skip === 'function') {
                p.skip(10);
                updateDock();
            }
        };

        play.onclick = function (event) {
            stopDockEvent(event);
            const p = player();

            if (!p) return;

            if (!p.audio || !p.audio.src) {
                if (typeof p.pickFile === 'function') p.pickFile();
                return;
            }

            if (typeof p.toggle === 'function') {
                Promise.resolve(p.toggle()).then(updateDock);
            }
        };

        slider.onclick = stopDockEvent;
        slider.onmousedown = stopDockEvent;
        slider.oninput = function (event) {
            stopDockEvent(event);
            const p = player();
            const audio = p && p.audio;

            if (!audio || !isFinite(audio.duration)) return;

            audio.currentTime = Number(slider.value);
            if (typeof p.render === 'function') p.render();
            updateDock();
        };

        more.onclick = function (event) {
            stopDockEvent(event);
            const currentMenu = widget.querySelector(':scope > .np-dock-menu');
            if (!currentMenu) return;

            document.querySelectorAll('.np-dock-menu.show').forEach(function (openMenu) {
                if (openMenu !== currentMenu) openMenu.classList.remove('show');
            });

            currentMenu.classList.toggle('show');
        };
    }

    function needsRebuild(widget) {
        if (!widget.classList.contains('np-dock-nuclear')) return true;
        if (!widget.querySelector(':scope > .np-dock-pill')) return true;
        if (!widget.querySelector(':scope > .np-dock-more')) return true;

        return Array.from(widget.children).some(function (child) {
            return !child.classList.contains('np-dock-pill') &&
                !child.classList.contains('np-dock-more') &&
                !child.classList.contains('np-dock-menu');
        });
    }

    window.updateDock = function () {
        const p = player();
        const audio = p && p.audio;
        const title = p && p.title ? p.title : '未选择曲目';
        const current = audio ? audio.currentTime : 0;
        const duration = audio && isFinite(audio.duration) ? audio.duration : 0;
        const playing = audio && !audio.paused;

        dockNowPlayingElements().forEach(function (widget) {
            if (needsRebuild(widget)) buildPill(widget);

            const pill = widget.querySelector(':scope > .np-dock-pill');
            if (!pill) return;

            pill.querySelector('.np-dock-title').textContent = title;
            pill.querySelector('.np-dock-time').textContent = formatTime(current);

            const slider = pill.querySelector('.np-dock-slider');
            slider.max = duration || 100;
            slider.value = current || 0;

            pill.querySelector('.np-dock-play > i').className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';
        });

        const preview = document.querySelector('#taskbar-preview');
        if (preview) preview.classList.remove('show');

        document.querySelectorAll('.nowplaying-taskbar-panel,.nowplaying-preview,.nowplaying-popover').forEach(function (el) {
            el.remove();
        });
    };

    function hook() {
        if (typeof widgets !== 'undefined' && widgets && widgets.nowplaying && !widgets.nowplaying._dockNuclearPositionApplied) {
            widgets.nowplaying._dockNuclearPositionApplied = true;

            const oldInit = widgets.nowplaying.init;
            const oldRender = widgets.nowplaying.render;

            widgets.nowplaying.init = function () {
                oldInit.call(widgets.nowplaying);
                updateDock();
                window.setTimeout(updateDock, 50);
            };

            widgets.nowplaying.render = function () {
                oldRender.call(widgets.nowplaying);
                updateDock();
                window.setTimeout(updateDock, 50);
            };
        }

        updateDock();
    }

    hook();
    updateDock();

    const observer = new MutationObserver(function () {
        window.setTimeout(updateDock, 0);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.setInterval(updateDock, 250);
})();


(function () {
    const patchName = 'nowplaying-dock-pin-interaction-fix';

    function applyNowPlayingDockPinFix() {
        if (!widgets || !widgets.nowplaying) return;

        $('.wg.toolbar.nowplaying, .nowplaying.np-dock-nuclear').each(function () {
            const dock = $(this);

            dock.addClass('np-dock-nuclear');
            dock.attr('data-nowplaying-dock-fixed', 'true');

            dock.children('.np-dock-menu').not(':first').remove();
            dock.children('.np-dock-more').not(':first').remove();

            let more = dock.children('.np-dock-more').first();
            if (!more.length) {
                more = $('<button class="np-dock-more" type="button" title="Now Playing options"><i class="bi bi-three-dots"></i></button>');
                dock.append(more);
            }

            let menu = dock.children('.np-dock-menu').first();
            if (!menu.length) {
                menu = $('<div class="np-dock-menu"></div>');
                dock.append(menu);
            }

            if (!menu.children().length) {
                const importButton = $('<button class="np-dock-menu-item" type="button" title="Import song"><i class="bi bi-folder2-open"></i></button>');
                const playButton = $('<button class="np-dock-menu-item" type="button" title="Play or pause"><i class="bi bi-play-fill"></i></button>');
                const backButton = $('<button class="np-dock-menu-item" type="button" title="Back 10 seconds"><i class="bi bi-skip-backward-fill"></i></button>');
                const forwardButton = $('<button class="np-dock-menu-item" type="button" title="Forward 10 seconds"><i class="bi bi-skip-forward-fill"></i></button>');

                importButton.on('click.nowplayingDockPin', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (widgets.nowplaying.pickFile) widgets.nowplaying.pickFile();
                    menu.removeClass('show');
                });

                playButton.on('click.nowplayingDockPin', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (widgets.nowplaying.toggle) widgets.nowplaying.toggle();
                    menu.removeClass('show');
                });

                backButton.on('click.nowplayingDockPin', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (widgets.nowplaying.skip) widgets.nowplaying.skip(-10);
                });

                forwardButton.on('click.nowplayingDockPin', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (widgets.nowplaying.skip) widgets.nowplaying.skip(10);
                });

                menu.append(importButton, backButton, playButton, forwardButton);
            }

            more.off('click.nowplayingDockPin').on('click.nowplayingDockPin', function (event) {
                event.preventDefault();
                event.stopPropagation();

                $('.nowplaying.np-dock-nuclear > .np-dock-menu.show').not(menu).removeClass('show');
                menu.toggleClass('show');
            });

            menu.off('click.nowplayingDockPin').on('click.nowplayingDockPin', function (event) {
                event.stopPropagation();
            });

            dock.off('click.nowplayingDockPin').on('click.nowplayingDockPin', function (event) {
                if ($(event.target).closest('.np-dock-more, .np-dock-menu, button, a, input, label').length) return;

                event.preventDefault();
                event.stopPropagation();

                if (widgets.nowplaying.toggle) widgets.nowplaying.toggle();
            });
        });
    }

    $(document)
        .off('click.nowplayingDockPinGlobal')
        .on('click.nowplayingDockPinGlobal', function () {
            $('.nowplaying.np-dock-nuclear > .np-dock-menu.show').removeClass('show');
        });

    const oldInit = widgets && widgets.nowplaying && widgets.nowplaying.init;
    const oldRender = widgets && widgets.nowplaying && widgets.nowplaying.render;

    if (widgets && widgets.nowplaying && !widgets.nowplaying._dockPinInteractionFixed) {
        widgets.nowplaying._dockPinInteractionFixed = true;

        if (typeof oldInit === 'function') {
            widgets.nowplaying.init = function () {
                oldInit.call(widgets.nowplaying);
                applyNowPlayingDockPinFix();
            };
        }

        if (typeof oldRender === 'function') {
            widgets.nowplaying.render = function () {
                oldRender.call(widgets.nowplaying);
                applyNowPlayingDockPinFix();

                const audio = widgets.nowplaying.audio;
                const playing = audio && !audio.paused;
                $('.nowplaying.np-dock-nuclear .np-dock-menu-item .bi-play-fill, .nowplaying.np-dock-nuclear .np-dock-menu-item .bi-pause-fill')
                    .attr('class', playing ? 'bi bi-pause-fill' : 'bi bi-play-fill');
            };
        }
    }

    applyNowPlayingDockPinFix();

    /* end-nowplaying-dock-pin-interaction-fix */
})();


(function () {
    function hasWidgets() {
        return typeof widgets !== 'undefined' && widgets && widgets.widgets;
    }

    function refreshNowPlayingSoon() {
        window.setTimeout(function () {
            if (!hasWidgets() || !widgets.nowplaying) return;

            if (typeof widgets.nowplaying.init === 'function') {
                widgets.nowplaying.init();
            }

            if (typeof widgets.nowplaying.render === 'function') {
                widgets.nowplaying.render();
            }
        }, 0);
    }

    function wrapCreateMethod(name) {
        if (!hasWidgets()) return;

        const original = widgets.widgets[name];
        if (typeof original !== 'function' || original._nowplayingCreateWrapped) return;

        const wrapped = function (arg) {
            const result = original.apply(this, arguments);

            if (arg === 'nowplaying') {
                refreshNowPlayingSoon();
            }

            return result;
        };

        wrapped._nowplayingCreateWrapped = true;
        widgets.widgets[name] = wrapped;
    }

    function installNowPlayingCreateFix() {
        if (!hasWidgets()) return;

        wrapCreateMethod('add');
        wrapCreateMethod('addToDesktop');
        wrapCreateMethod('addToToolbar');

        if (!widgets.widgets._nowplayingCreateClickFixed) {
            widgets.widgets._nowplayingCreateClickFixed = true;

            document.addEventListener('click', function (event) {
                const trigger = event.target.closest && event.target.closest('[onclick*="nowplaying"]');
                if (trigger) {
                    refreshNowPlayingSoon();
                }
            }, true);
        }
    }

    installNowPlayingCreateFix();
    window.setTimeout(installNowPlayingCreateFix, 250);
    window.setTimeout(installNowPlayingCreateFix, 1000);
})();


/* nowplaying-hamburger-menu-fix */
(function () {
    function getPlayer() {
        return typeof widgets !== 'undefined' && widgets && widgets.nowplaying ? widgets.nowplaying : null;
    }

    function getDockPins() {
        return $('.wg.toolbar.nowplaying, .nowplaying.np-dock-nuclear');
    }

    function closeMenus(exceptMenu) {
        $('.nowplaying.np-dock-nuclear > .np-dock-menu.show').each(function () {
            if (!exceptMenu || this !== exceptMenu) {
                this.classList.remove('show');
            }
        });
    }

    function createMenuButton(sourceButton, action, iconClass, title) {
        const button = sourceButton.clone(false, false);

        button
            .removeClass('np-dock-more')
            .addClass('np-dock-menu-item')
            .attr('type', 'button')
            .attr('data-np-action', action)
            .attr('title', title)
            .removeAttr('id')
            .removeAttr('onclick');

        button.empty();
        button.append($('<i></i>').attr('class', iconClass));

        return button;
    }

    function ensureMenu() {
        const player = getPlayer();
        if (!player) return;

        getDockPins().each(function () {
            const dock = $(this);

            dock.addClass('np-dock-nuclear');

            dock.children('.np-dock-more').not(':first').remove();
            dock.children('.np-dock-menu').not(':first').remove();

            let hamburger = dock.children('.np-dock-more').first();

            if (!hamburger.length) {
                hamburger = $('<button></button>')
                    .addClass('np-dock-more')
                    .attr('type', 'button')
                    .attr('title', 'Now Playing controls');

                dock.append(hamburger);
            }

            hamburger.empty();
            hamburger.append($('<i></i>').attr('class', 'bi bi-list'));

            let menu = dock.children('.np-dock-menu').first();

            if (!menu.length) {
                menu = $('<div></div>').addClass('np-dock-menu');
                dock.append(menu);
            }

            menu.empty();
            menu.append(createMenuButton(hamburger, 'import', 'bi bi-folder2-open', 'Import audio'));
            menu.append(createMenuButton(hamburger, 'back', 'bi bi-skip-backward-fill', 'Back 10 seconds'));
            menu.append(createMenuButton(hamburger, 'play', 'bi bi-play-fill', 'Play or pause'));
            menu.append(createMenuButton(hamburger, 'forward', 'bi bi-skip-forward-fill', 'Forward 10 seconds'));
        });

        updatePlayIcon();
    }

    function updatePlayIcon() {
        const player = getPlayer();
        const audio = player && player.audio;
        const isPlaying = audio && !audio.paused;

        $('.nowplaying.np-dock-nuclear > .np-dock-menu [data-np-action="play"] i')
            .attr('class', isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill');
    }

    function runAction(action) {
        const player = getPlayer();
        if (!player) return;

        if (action === 'import' && typeof player.pickFile === 'function') {
            player.pickFile();
        }

        if (action === 'back' && typeof player.skip === 'function') {
            player.skip(-10);
        }

        if (action === 'play' && typeof player.toggle === 'function') {
            Promise.resolve(player.toggle()).finally(updatePlayIcon);
        }

        if (action === 'forward' && typeof player.skip === 'function') {
            player.skip(10);
        }
    }

    if (!window.__nowPlayingHamburgerMenuFixInstalled) {
        window.__nowPlayingHamburgerMenuFixInstalled = true;

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
                }

                return;
            }

            if (menuItem) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                const action = menuItem.getAttribute('data-np-action');
                runAction(action);

                if (action === 'import' || action === 'play') {
                    closeMenus();
                }

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
        if (!player || player.__hamburgerMenuFixPatched) return;

        player.__hamburgerMenuFixPatched = true;

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

    patchPlayerHooks();
    ensureMenu();

    window.setTimeout(function () {
        patchPlayerHooks();
        ensureMenu();
    }, 250);
})();
/* end-nowplaying-hamburger-menu-fix */

