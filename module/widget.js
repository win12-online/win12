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