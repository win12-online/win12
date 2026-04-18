// 应用功能
let apps = {
    setting: {
        init: () => {
            $('#win-setting>.menu>list>a.home')[0].click();
            $('#win-setting>.page>.cnt.update>.setting-list>div:last-child>.alr>a.checkbox')[localStorage.getItem('autoUpdate') == 'true' ? 'addClass' : 'removeClass']('checked');
            apps.setting.checkUpdate();
        },
        page: (name) => {
            $('#win-setting>.page>.cnt.' + name).scrollTop(0);
            $('#win-setting>.page>.cnt.show').removeClass('show');
            $('#win-setting>.page>.cnt.' + name).addClass('show');
            $('#win-setting>.menu>list>a.check').removeClass('check');
            $('#win-setting>.menu>list>a.' + name).addClass('check');
        },
        theme_get: () => {
            $('#set-theme').html(`<loading><svg width="30px" height="30px" viewBox="0 0 16 16">
            <circle cx="8px" cy="8px" r="7px" style="stroke:#7f7f7f50;fill:none;stroke-width:3px;"></circle>
            <circle cx="8px" cy="8px" r="7px" style="stroke:#2983cc;stroke-width:3px;"></circle></svg></loading>`);
            // 实时获取主题
            api('repos/tjy-gitnub/win12-theme/contents').then(res => {res.json().then(cs => {
                console.log(cs);
                cs.forEach(c => {
                    if (c.type == 'dir') {
                        api(c.url,true).then(res => {res.json().then(cnt => {
                            $('#set-theme').html('');
                            cnt.forEach(cn => {
                                if (cn.name == 'theme.json') {
                                    $.getJSON('https://tjy-gitnub.github.io/win12-theme/' + cn.path).then(inf => {
                                        $('#set-theme>loading').remove();
                                        $('#set-theme').append(`<a class="a act" onclick="apps.setting.theme_set('${c.name}')" style="background-image:url('https://tjy-gitnub.github.io/win12-theme/${c.name}/view.jpg')">${c.name}</a>`);
                                    });
                                }
                            });
                        })});
                    }
                });
            })});
            $('#set-theme').append(`<a class="a btn" onclick="$(':root').removeAttr('style');" style="background: #555;">默认主题</a>`);
        },
        theme_set: (infp) => {
            api('repos/tjy-gitnub/win12-theme/contents/' + infp).then(res => {res.json().then(cnt => {
                // console.log('https://api.github.com/repos/tjy-gitnub/win12-theme/contents/' + infp);
                cnt.forEach(cn => {
                    if (cn.name == 'theme.json') {
                        $.getJSON('https://tjy-gitnub.github.io/win12-theme/' + cn.path).then(inf => {
                            let infjs = inf;
                            cnt.forEach(fbg => {
                                console.log(fbg, infjs);
                                if (fbg.name == infjs.bg) {
                                    $(':root').css('--bgul', `url('https://tjy-gitnub.github.io/win12-theme/${fbg.path}')`);
                                    $(':root').css('--theme-1', infjs.color1);
                                    $(':root').css('--theme-2', infjs.color2);
                                    $(':root').css('--href', infjs.href);
                                    // $('#set-theme').append(`<a class="a act" onclick="apps.setting.theme_set(\`(${inf})\`)" style="background-image:url('https://tjy-gitnub.github.io/win12-theme/${fbg.path}')">${c.name}</a>`);
                                }
                            });
                        });
                    }
                });
            })});
        },
        // 无法正常运行，待调试
        checkUpdate: () => {
            $('#win-setting>.page>.cnt.update>.lo>.update-main .notice')[0].innerText = '开发者暂未完善此功能';
            $('#win-setting>.page>.cnt.update>.lo>.update-main .detail')[0].innerHTML = 'Windows 更新已被禁用';
            $('#win-setting>.page>.cnt.update>.setting-list>.update-now').addClass('disabled');
            $('#win-setting>.page>.cnt.update>.lo>.update-main>div:last-child').addClass('disabled');
            // Simulate the previous functionality for backward compatibility but disable actual updates
            setTimeout(() => {
                $('#win-setting>.page>.cnt.update>.lo>.update-main .notice')[0].innerText = '开发者暂未完善此功能';
                $('#win-setting>.page>.cnt.update>.lo>.update-main .detail')[0].innerText = 'Windows 更新已被禁用';
                // $('#win-setting>.page>.cnt.update>.setting-list>.update-now>div>p:first-child')[0].innerText = '开发者暂未完善此功能';
                // $('#win-setting>.page>.cnt.update>.setting-list>.update-now>div>p:last-child')[0].innerText = 'Windows 更新已被禁用';
                // Keep buttons disabled as requested
                $('#win-setting>.page>.cnt.update>.setting-list>.update-now').addClass('disabled');
                $('#win-setting>.page>.cnt.update>.lo>.update-main>div:last-child').addClass('disabled');
            }, 1000);
        },
    },
    msstore: {
        init: () => {
            $('#win-msstore>.menu>list>a.home')[0].click();
        },
        page: (name) => {
            $('#win-msstore>.page>.cnt.' + name).scrollTop(0);
            $('#win-msstore>.page>.cnt.show').removeClass('show');
            $('#win-msstore>.page>.cnt.' + name).addClass('show');
            $('#win-msstore>.menu>list>a.check').removeClass('check');
            $('#win-msstore>.menu>list>a.' + name).addClass('check');
        }
    },
    run: {
        init: () => {
            $('#win-run>.open>input').val(run_cmd);   //在windows中，运行输入的内容会被保留
            window.setTimeout(() => {
                $('#win-run>.open>input').focus();
                $('#win-run>.open>input').select();
            }, 300);
        },
        run: (cmd) => {
            if (!runcmd(cmd)) {
                if (cmd != '') {
                    try {
                        cmd = cmd.replace(/\/$/, '');
                        var pathl = cmd.split('/');
                        let tmp = apps.explorer.path;
                        let valid = true;
                        pathl.forEach(name => {
                            if (Object.prototype.hasOwnProperty.call(tmp['folder'], name)) {
                                tmp = tmp['folder'][name];
                            }
                            else {
                                valid = false;
                                return false;
                            }
                        });
                        if (valid == true) {
                            run_cmd = cmd;
                            openapp('explorer');
                            window.setTimeout(() => {
                                apps.explorer.goto(cmd);
                            }, 300);
                        }
                        else {
                            nts['Can-not-open-file'] = {
                                cnt: '<p class="tit">' + cmd + `</p>
                                <p>Windows 找不到文件 '` + cmd + '\'。请确定文件名是否正确后，再试一次。</p> ',
                                btn: [
                                    { type: 'main', text: '确定', js: 'closenotice();showwin(\'run\');$(\'#win-run>.open>input\').select();' },
                                    { type: 'cancel', text: '在 Micrsoft Edge 中搜索', js: 'closenotice();openapp(\'edge\');window.setTimeout(() => {apps.edge.newtab();apps.edge.goto(\'https://www.bing.com/search?q=' + encodeURIComponent(cmd) + '\');}, 300);' }
                                ]
                            };
                            shownotice('Can-not-open-file');
                        }
                    }
                    catch {
                        nts['Can-not-open-file'] = {
                            cnt: '<p class="tit">' + cmd + `</p>
                            <p>Windows 找不到文件 '` + cmd + '\'。请确定文件名是否正确后，再试一次。</p> ',
                            btn: [
                                { type: 'main', text: '确定', js: 'closenotice();showwin(\'run\');$(\'#win-run>.open>input\').select();' },
                                { type: 'cancel', text: '在 Micrsoft Edge 中搜索', js: 'closenotice();openapp(\'edge\');window.setTimeout(() => {apps.edge.newtab();apps.edge.goto(\'https://www.bing.com/search?q=' + encodeURIComponent(cmd) + '\');}, 300);' }
                            ]
                        };
                        shownotice('Can-not-open-file');
                    }
                }
            }
        }
    },
    taskmgr: {
        sortType: 'cpu',
        sortOrder: 'up-down',
        tasks: structuredClone(taskmgrTasks),
        cpu: 0,
        cpuChart: null,
        cpuBg: null,
        memory: 0,
        memoryChart: null,
        memoryBg: null,
        memory2Elt: null,
        cpuRunningTime: 0,
        disk: 0,
        diskChart: null,
        diskBg: null,
        disk2Chart: null,
        disk2Bg: null,
        diskSpeed: {
            read: 0,
            write: 0
        },
        wifi: {
            receive: 0,
            send: 0
        },
        wifiChart: null,
        wifiBg: null,
        gpu: {
            d3: 0,
            copy: 0,
            videod: 0,
            videop: 0,
            usage: 0
        },
        gpuChart: [null, null, null, null],
        gpuBg: [null, null, null, null],
        gpu2Chart: [null, null],
        gpu2Bg: [null, null],
        gpuMemory: {
            private: 0,
            public: 0
        },
        gpu3Chart: null,
        processList: [],
        handle: 0,
        foldHide: false,
        delay: 0,
        remove: () => {
            apps.taskmgr.loaded = false;
            window.clearInterval(apps.taskmgr.handle);
            if (apps.taskmgr.preLoaded == true) {
                apps.taskmgr.preLoaded = false;
                apps.taskmgr.load(false);
            }
            else {
                apps.taskmgr.preLoaded = false;
            }
        },
        init: () => {
            window.setTimeout(() => {
                $('#win-taskmgr>.menu>list.focs>a')[0].click();
            }, 200);
        },
        fold: () => {
            if (!apps.taskmgr.foldHide) {
                window.setTimeout(() => {
                    $('#win-taskmgr>.menu>.focs>a>p').hide();
                }, 50);
                $('#win-taskmgr')[0].style.gridTemplateColumns = '78px auto';
            }
            else {
                window.setTimeout(() => {
                    $('#win-taskmgr>.menu>.focs>a>p').show();
                }, 100);
                $('#win-taskmgr')[0].style.gridTemplateColumns = '320px auto';
            }
            apps.taskmgr.foldHide = !apps.taskmgr.foldHide;
        },
        load: (init_all = true) => {
            if (init_all == true) {
                const performance = $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph')[0];
                performance.$$('.graph-cpu>.information>.left>div:nth-child(3)>.value')[0].innerText = apps.taskmgr.tasks.length;

                apps.taskmgr.cpuChart = performance.$$('.graph-cpu>.graph>.chart')[0];
                apps.taskmgr.cpuBg = performance.$$('.graph-cpu>.graph>.bg')[0];
                apps.taskmgr.cpuBg.innerHTML = '<g class="col"></g><g class="row"></g>';
                apps.taskmgr.cpuChart.innerHTML = '<path d="M 6000 1000" stroke="#2983cc" stroke-width="3px" fill="#2983cc22" />';

                apps.taskmgr.memoryChart = performance.$$('.graph-memory>.graph>.chart')[0];
                apps.taskmgr.memoryBg = performance.$$('.graph-memory>.graph>.bg')[0];
                apps.taskmgr.memoryBg.innerHTML = '<g class="col"></g><g class="row"></g>';
                apps.taskmgr.memoryChart.innerHTML = '<path d="M 6000 1000" stroke="#660099" stroke-width="3px" fill="#66009922" />';

                apps.taskmgr.memory2Elt = performance.$$('.graph-memory>.graph2>.chart')[0];

                apps.taskmgr.diskChart = performance.$$('.graph-disk>.graph>.chart')[0];
                apps.taskmgr.diskBg = performance.$$('.graph-disk>.graph>.bg')[0];
                apps.taskmgr.diskBg.innerHTML = '<g class="col"></g><g class="row"></g>';
                apps.taskmgr.diskChart.innerHTML = '<path d="M 6000 1000" stroke="#008000" stroke-width="3px" fill="#00800022" />';

                apps.taskmgr.disk2Chart = performance.$$('.graph-disk>.graph2>.chart')[0];
                apps.taskmgr.disk2Bg = performance.$$('.graph-disk>.graph2>.bg')[0];
                apps.taskmgr.disk2Bg.innerHTML = '<g class="col"></g><g class="row"></g>';
                apps.taskmgr.disk2Chart.innerHTML = '<path d="M 6000 1000" stroke="#008000" stroke-width="3px" fill="#00800022" /><path d="M 6000 1000" stroke="#008000" stroke-width="3px" fill="none" stroke-dasharray="15, 15" />';

                apps.taskmgr.wifiChart = performance.$$('.graph-wifi>.graph>.chart')[0];
                apps.taskmgr.wifiBg = performance.$$('.graph-wifi>.graph>.bg')[0];
                apps.taskmgr.wifiChart.innerHTML = '<path d="M 6000 1000" stroke="#8e5829" stroke-width="3px" fill="#8e582922" /><path d="M 6000 1000" stroke="#8e5829" stroke-width="3px" fill="none" stroke-dasharray="10, 10" />';
                apps.taskmgr.wifiBg.innerHTML = '<g class="col"></g><g class="row"></g>';

                apps.taskmgr.gpu3Chart = performance.$$('.graph-gpu>.graphs>svg')[0];
                apps.taskmgr.gpu3Chart.innerHTML = '<path d="M 6000 1000" stroke="#2983cc" stroke-width="3px" fill="#2983cc22" />';

                for (var i = 1; i <= 4; i++) {
                    apps.taskmgr.gpuChart[i-1] = performance.$$('.graph-gpu>.graphs>.graph' + i + '>.chart>.chart')[0];
                    apps.taskmgr.gpuChart[i-1].innerHTML = '<path d="M 6000 1000" stroke-width="3px" stroke="#2983cc" fill="#2983cc22" />';
                    apps.taskmgr.gpuBg[i-1] = performance.$$('.graph-gpu>.graphs>.graph' + i + '>.chart>.bg')[0];
                    apps.taskmgr.gpuBg[i-1].innerHTML = '<g class="col"></g><g class="row"></g>';
                }
                for (var i = 1; i <= 2; i++) {
                    apps.taskmgr.gpu2Chart[i-1] = performance.$$('.graph-gpu>.gpu2-' + i + '>.chart')[0];
                    apps.taskmgr.gpu2Bg[i-1] = performance.$$('.graph-gpu>.gpu2-' + i + '>.bg')[0];
                    apps.taskmgr.gpu2Bg[i-1].innerHTML = '<g class="col"></g><g class="row"></g>';
                    apps.taskmgr.gpu2Chart[i-1].innerHTML = '<path d="M 6000 1000" stroke-width="3px" stroke="#2983cc" fill="#2983cc22" />';
                }
            }

            if (apps.taskmgr.preLoaded != true && apps.taskmgr.loaded != true) {
                apps.taskmgr.gpuMemory.private = Number((Math.random() * 4).toFixed(2));
                apps.taskmgr.gpuMemory.public = Number((Math.random() * 4).toFixed(2));
                apps.taskmgr.generateProcesses();
                apps.taskmgr.sort();
                apps.taskmgr.loadProcesses();
                apps.taskmgr.performanceLoad();
            }

            if (init_all == true) {
                apps.taskmgr.gpuMemory.private = Number((Math.random() * 4).toFixed(2));
                apps.taskmgr.gpuMemory.public = Number((Math.random() * 4).toFixed(2));
                apps.taskmgr.loadProcesses();
                apps.taskmgr.generateProcesses();
                apps.taskmgr.sort();
                apps.taskmgr.performanceLoad();
                apps.taskmgr.drawGrids();
                apps.taskmgr.handle = window.setInterval(() => {
                    apps.taskmgr.loadProcesses();
                    apps.taskmgr.generateProcesses();
                    apps.taskmgr.sort();
                    apps.taskmgr.performanceLoad();
                    apps.taskmgr.loadGraph();
                    apps.taskmgr.gridLine();
                    apps.taskmgr.memory2Elt.style.width = apps.taskmgr.memory + '%';
                }, 1000);
            }
            else if (apps.taskmgr.loaded != true && apps.taskmgr.preLoaded != true) {
                apps.taskmgr.handle = window.setInterval(() => {
                    apps.taskmgr.loadProcesses();
                    apps.taskmgr.generateProcesses();
                    apps.taskmgr.sort();
                    apps.taskmgr.performanceLoad();
                }, 1000);
            }
        },
        page: (name) => {
            $('#win-taskmgr>.main>.cnt.' + name).scrollTop(0);
            $('#win-taskmgr>.main>.cnt.show').removeClass('show');
            $('#win-taskmgr>.main>.cnt.' + name).addClass('show');
            $('#win-taskmgr>.menu>list.focs>a.check').removeClass('check');
            $('#win-taskmgr>.menu>list.focs>a.' + name).addClass('check');
            if (!(name == 'processes' || name == '404')) {
                document.getElementById('tsk-search').style.display = 'none';
            } else {
                document.getElementById('tsk-search').style.display = '';
            }
        },
        graph: (name) => {
            $('#win-setting>.page>.cnt.' + name).scrollTop(0);
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.show').removeClass('show');
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.' + name).addClass('show');
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.check').removeClass('check');
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.' + name).addClass('check');
        },
        generateProcesses: () => {
            let processList = [];
            let max = 100 / apps.taskmgr.tasks.length;
            let cpusum = 0, memorysum = 0, disksum = 0, diskUsing = Number(Math.random()) > 0.7/*, color = window.getComputedStyle(page, null).getPropertyValue('--href')*/;
            var search_len = 0;
            for (const elt of apps.taskmgr.tasks) {
                let cpu = Number((Math.random() * max).toFixed(1)),
                    memory = apps.taskmgr.memory != 0 ? apps.taskmgr.memory / apps.taskmgr.tasks.length + Number(((Math.random() - 0.5) / 5).toFixed(1)) : Number((Math.random() * max).toFixed(1)),
                    disk = Number((Math.random() * max).toFixed(1)) > (max / 1.2) && diskUsing ? max * Number(Math.random().toFixed(1)) : 0;
                cpusum = Number((cpusum + cpu).toFixed(1));
                memorysum = Number((memorysum + memory).toFixed(1));
                disksum = Number((disksum + disk).toFixed(1));
                if (document.getElementById('tsk-search').value != '' && document.getElementById('tsk-search').style.display == '' && (!elt.name.toLowerCase().includes(document.getElementById('tsk-search').value.toLowerCase()))) {
                    continue;
                }
                processList.splice(processList.length, 0, {
                    name: elt.name,
                    icon: elt.icon || '',
                    system: elt.system,
                    cpu: cpu,
                    memory: memory,
                    disk: disk
                });
                search_len++;
            }
            if (search_len == 0) {
                apps.taskmgr.page('404');
            }
            else {
                if ($('#tsk-search').val() != '' && $('#tsk-search')[0].style.display == '') {
                    apps.taskmgr.page('processes');
                }
            }
            apps.taskmgr.cpu = cpusum;
            apps.taskmgr.memory = memorysum;
            apps.taskmgr.disk = disksum;
            apps.taskmgr.processList = processList;

        },
        loadProcesses: (processList = apps.taskmgr.processList) => {
            const processContainer = $('#win-taskmgr>.main>.cnt.processes tbody.view')[0];
            const values = $('#win-taskmgr>.main>.cnt.processes thead>tr>th>.value');
            const cpu = values[0], memory = values[1], disk = values[2];
            let selected;
            if ($('#win-taskmgr>.main>.cnt.processes tbody.view>tr.select>td:first-child>.text')[0]) {
                selected = $('#win-taskmgr>.main>.cnt.processes tbody.view>tr.select>td:first-child>.text')[0].innerText;
            }
            let max = 100 / apps.taskmgr.tasks.length;
            processContainer.innerHTML = '';
            for (const elt of processList) {
                const newElt = document.createElement('tr');
                newElt.classList.add('notrans');
                newElt.innerHTML = `<td><div class="text"><div class="icon" style="background-image: url('${elt.icon ? elt.icon : ''}');"></div>${elt.name}</div></td><td style="text-align: right;background-color: color-mix(in srgb, var(--theme-2) ${elt.cpu >= (max / 1.3) ? '75%' : '50%'}, transparent);">${elt.cpu.toFixed(1)}%</td><td style="text-align: right;background-color: color-mix(in srgb, var(--theme-2) ${elt.memory >= (max / 1) ? '75%' : '50%'}, transparent);">${elt.memory.toFixed(1)}%</td><td style="text-align: right;background-color: color-mix(in srgb, var(--theme-2) ${elt.disk >= (max / 1.3) ? '75%' : '50%'}, transparent);">${elt.disk.toFixed(1)}%</td><td>${['非常低', '非常低', '非常低', '低', '中'][Math.floor(Math.random() * 5)]}</td>`;
                if (elt.name == selected) {
                    newElt.classList.add('select');
                }
                processContainer.appendChild(newElt);
                newElt.onclick = function () {
                    apps.taskmgr.selectProcess(this);
                };
                newElt.oncontextmenu = function (e) {
                    return showcm(e, 'taskmgr.processes', elt.name);
                };
                window.setTimeout(() => {
                    newElt.classList.remove('notrans');
                }, 100);
            }
            cpu.innerText = apps.taskmgr.cpu.toFixed(1) + '%';
            memory.innerText = apps.taskmgr.memory.toFixed(1) + '%';
            disk.innerText = apps.taskmgr.disk.toFixed(1) + '%';
        },
        sort: (processList = apps.taskmgr.processList, type = apps.taskmgr.sortType, order = apps.taskmgr.sortOrder) => {
            processList.sort((a, b) => {
                if (a[type] > b[type]) {
                    return order == 'up-down' ? -1 : 1;
                }
                else if (a[type] <= b[type]) {
                    return order == 'up-down' ? 1 : -1;
                }
            });
            apps.taskmgr.processList = processList;
        },
        performanceLoad: () => {
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-cpu>.information>.left>div:nth-child(1)>.value')[0].innerText = `${apps.taskmgr.cpu.toFixed(1)}%`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-cpu>.information>.left>div:nth-child(2)>.value')[0].innerText = `${(3200 / 100 * apps.taskmgr.cpu).toFixed(1)} GHz`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-cpu>.information>.left>div:nth-child(4)>.value')[0].innerText = `${apps.taskmgr.tasks.length * (5 + Math.floor(Math.random() * 5))}`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-cpu>.information>.left>div:nth-child(5)>.value')[0].innerText = `${apps.taskmgr.tasks.length * (10 + Math.floor(Math.random() * 20))}`;
            let sec = apps.taskmgr.cpuRunningTime;
            let min = Math.floor(sec / 60);
            sec %= 60;
            let hour = Math.floor(min / 60);
            min %= 60;
            let day = Math.floor(hour / 24);
            hour %= 24;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-cpu>.information>.left>div:nth-child(6)>.value')[0].innerText = `${day}:${String(hour).length < 2 ? '0' : ''}${hour}:${String(min).length < 2 ? '0' : ''}${min}:${String(sec).length < 2 ? '0' : ''}${sec}`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.graph-cpu>.right>.data>.value1')[0].innerText = `${apps.taskmgr.cpu.toFixed(1)}%`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.graph-cpu>.right>.data>.value2')[0].innerText = `${(3200 / 100 * apps.taskmgr.cpu).toFixed(1)}GHz`;

            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-memory>.information>.left>div:nth-child(1)>.value')[0].innerText = `${apps.taskmgr.memory.toFixed(1)} GB (0 MB)`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-memory>.information>.left>div:nth-child(2)>.value')[0].innerText = `${(100 - apps.taskmgr.memory).toFixed(1)} GB`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-memory>.information>.left>div:nth-child(3)>.value')[0].innerText = `${(apps.taskmgr.memory - 2).toFixed(1)} / 100 GB`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-memory>.information>.left>div:nth-child(4)>.value')[0].innerText = `${(apps.taskmgr.memory / 2).toFixed(2)} GB`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.graph-memory>.right>.data>.value1')[0].innerText = `${apps.taskmgr.memory.toFixed(1)} / 100 GB`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.graph-memory>.right>.data>.value2')[0].innerText = `${apps.taskmgr.memory.toFixed(1)}%`;

            apps.taskmgr.diskSpeed.read = apps.taskmgr.disk != 0 ? (Math.random() * 100).toFixed(2) : 0;
            apps.taskmgr.diskSpeed.write = apps.taskmgr.disk != 0 ? (Math.random() * 100).toFixed(2) : 0;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-disk>.information>.left>div:nth-child(1)>.value')[0].innerText = `${apps.taskmgr.disk}%`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-disk>.information>.left>div:nth-child(2)>.value')[0].innerText = `${apps.taskmgr.disk != 0 ? Math.random().toFixed(2) : 0} 毫秒`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-disk>.information>.left>div:nth-child(3)>.value')[0].innerText = `${apps.taskmgr.diskSpeed.read} ${apps.taskmgr.disk != 0 ? 'MB/秒' : 'KB/秒'}`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-disk>.information>.left>div:nth-child(4)>.value')[0].innerText = `${apps.taskmgr.diskSpeed.write} ${apps.taskmgr.disk != 0 ? 'MB/秒' : 'KB/秒'}`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.graph-disk>.right>.data>.value2')[0].innerText = `${apps.taskmgr.disk}%`;

            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.graph-gpu>.right>.data>.value2')[0].innerText = `${apps.taskmgr.gpu.usage.toFixed(1)}%`;

            apps.taskmgr.gpu.d3 = Number((Math.random() * 15).toFixed(2));
            apps.taskmgr.gpu.copy = Number((Math.random() * 15).toFixed(2));
            apps.taskmgr.gpu.videop = Number((Math.random() * 15).toFixed(2));
            apps.taskmgr.gpu.videod = Number((Math.random() * 15).toFixed(2));
            apps.taskmgr.gpu.usage = Number(((apps.taskmgr.gpu.d3 + apps.taskmgr.gpu.copy + apps.taskmgr.gpu.videop + apps.taskmgr.gpu.videod) / 4).toFixed(1));

            apps.taskmgr.wifi.receive = Number((Math.random() * 100).toFixed(2));
            apps.taskmgr.wifi.send = Number((Math.random() * 100).toFixed(2));
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-wifi>.information>.left>div:nth-child(1)>.value')[0].innerText = `${apps.taskmgr.wifi.send.toFixed(2)} Mbps`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.performance-graph>.graph-wifi>.information>.left>div:nth-child(2)>.value')[0].innerText = `${apps.taskmgr.wifi.receive.toFixed(2)} Mbps`;
            $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu>.graph-wifi>.right>.data>.value2')[0].innerText = `发送: ${apps.taskmgr.wifi.send} 接收: ${apps.taskmgr.wifi.receive} Mbps`;
        },
        drawGraph: (chart, data, nth = 0) => {
            var path = $(chart.querySelectorAll('path')[nth]).attr('d');
            path = path.replace(/ L 6000 1000$/, '');
            var pathl = path.split(' ');
            var newPath = '';
            var sum = 0, head = 0;
            for (var i = 0; i < pathl.length; i += 3) {
                const arg = pathl[i];
                if (arg == 'M' && Number(pathl[i + 1]) > 0) {
                    pathl[i + 1] = Number(pathl[i + 1]) - 100;
                    pathl[i + 2] = pathl[i + 2];
                }
                else if (arg == 'M' && Number(pathl[i + 1]) <= 0) {
                    pathl[i + 1] = 0;
                    pathl[i + 2] = 1000;
                }
                else if (arg == 'L') {
                    if (sum == 0) {
                        head = i;
                    }
                    else if (sum >= 60) {
                        pathl.splice(head, 3);
                        sum--;
                        i -= 3;
                    }
                    pathl[i + 1] = Number(pathl[i + 1]) - 100;
                    sum++;
                }
            }
            pathl.push('L', '6000', 1000 - data, 'L', '6000', '1000');
            window.setTimeout(() => {
                $(chart.querySelectorAll('path')[nth]).attr('d', '');
                for (const arg of pathl) {
                    if (!(arg === '')) {
                        newPath += arg + ' ';
                    }
                }
                newPath = newPath.substring(0, newPath.length - 1);
                $(chart.querySelectorAll('path')[nth]).attr('d', newPath);
            }, apps.taskmgr.delay);
        },
        loadGraph: () => {
            apps.taskmgr.drawGraph(apps.taskmgr.cpuChart, apps.taskmgr.cpu * 10);
            apps.taskmgr.drawGraph(apps.taskmgr.memoryChart, apps.taskmgr.memory * 10);
            apps.taskmgr.drawGraph(apps.taskmgr.diskChart, apps.taskmgr.disk * 10);
            apps.taskmgr.drawGraph(apps.taskmgr.disk2Chart, apps.taskmgr.diskSpeed.read * 10, 0);
            apps.taskmgr.drawGraph(apps.taskmgr.disk2Chart, apps.taskmgr.diskSpeed.write * 10, 1);
            apps.taskmgr.drawGraph(apps.taskmgr.wifiChart, apps.taskmgr.wifi.receive * 10, 0);
            apps.taskmgr.drawGraph(apps.taskmgr.wifiChart, apps.taskmgr.wifi.send * 10, 1);
            for (var i = 0; i < 4; i++) {
                apps.taskmgr.drawGraph(apps.taskmgr.gpuChart[i], apps.taskmgr.gpu[['d3', 'copy', 'videop', 'videod'][i]] * 10);
            }
            for (var i = 0; i < 2; i++) {
                apps.taskmgr.drawGraph(apps.taskmgr.gpu2Chart[i], apps.taskmgr.gpuMemory[['private', 'public'][i]] * (i == 1 ? (1000 / 32) : (1000 / 16)));
            }
            apps.taskmgr.drawGraph(apps.taskmgr.gpu3Chart, apps.taskmgr.gpu.usage * 10);
            const menu = $('#win-taskmgr>.main>.cnt.performance>.content>.select-menu')[0];
            menu.$$('.graph-cpu svg')[0].innerHTML = apps.taskmgr.cpuChart.innerHTML;
            menu.$$('.graph-memory svg')[0].innerHTML = apps.taskmgr.memoryChart.innerHTML;
            menu.$$('.graph-disk svg')[0].innerHTML = apps.taskmgr.diskChart.innerHTML;
            menu.$$('.graph-wifi svg')[0].innerHTML = apps.taskmgr.wifiChart.innerHTML;
            menu.$$('.graph-gpu svg')[0].innerHTML = apps.taskmgr.gpu3Chart.innerHTML;
        },
        changeSort: (elt, type) => {
            for (const _elt of $('#win-taskmgr>.main>.cnt.processes thead>tr>th>i')) {
                _elt.className = 'bi';
            }
            if (apps.taskmgr.sortOrder == 'up-down' && apps.taskmgr.sortType == type) {
                elt.className = 'bi bi-chevron-up';
                apps.taskmgr.sortOrder = 'down-up';
                apps.taskmgr.sort(apps.taskmgr.processList, type, 'down-up');
            }
            else {
                elt.className = 'bi bi-chevron-down';
                apps.taskmgr.sortOrder = 'up-down';
                apps.taskmgr.sortType = type;
                apps.taskmgr.sort(apps.taskmgr.processList, type, 'up-down');
            }
        },
        gridLine: () => {
            apps.taskmgr.changeGrids(apps.taskmgr.memoryBg);
            apps.taskmgr.changeGrids(apps.taskmgr.cpuBg);
            apps.taskmgr.changeGrids(apps.taskmgr.diskBg);
            apps.taskmgr.changeGrids(apps.taskmgr.disk2Bg);
            apps.taskmgr.changeGrids(apps.taskmgr.wifiBg);
            apps.taskmgr.gpuBg.forEach(function (chart) {
                apps.taskmgr.changeGrids(chart);
            });
            apps.taskmgr.gpu2Bg.forEach(function (chart) {
                apps.taskmgr.changeGrids(chart);
            });
        },
        selectProcess: (elt) => {
            $('#win-taskmgr>.main>.cnt.processes tbody.view>.select').removeClass('select');
            $(elt).addClass('select');
        },
        taskkill: (name) => {
            if (name == 'System') {
                window.location = 'bluescreen.html';
            }
            else {
                apps.taskmgr.tasks.splice(apps.taskmgr.tasks.findIndex(elt => elt.name == name), 1);
                if (taskmgrTasks.find(elt => elt.name == name).link != null) {
                    hidewin(taskmgrTasks.find(elt => elt.name == name).link);
                }
            }
        },
        initgrids: (chart) => {
            const column = chart.querySelector('g.col'), row = chart.querySelector('g.row');
            for (var i = 0; i <= 20; i++) {
                column.innerHTML += `<path d="M ${i * 300} 0 L ${i * 300} 1000 Z" stroke="#aeaeae" fill="none" />`;
            }
            for (var i = 0; i <= 10; i++) {
                row.innerHTML += `<path d="M 0 ${i * 100} L 6000 ${i * 100} Z" stroke="#aeaeae" fill="none" />`;
            }
        },
        drawGrids: () => {
            apps.taskmgr.initgrids(apps.taskmgr.cpuBg);
            apps.taskmgr.initgrids(apps.taskmgr.diskBg);
            apps.taskmgr.initgrids(apps.taskmgr.memoryBg);
            apps.taskmgr.initgrids(apps.taskmgr.disk2Bg);
            apps.taskmgr.initgrids(apps.taskmgr.wifiBg);
            for (var i = 0; i < 4; i++) {
                apps.taskmgr.initgrids(apps.taskmgr.gpuBg[i]);
            }
            for (var i = 0; i < 2; i++) {
                apps.taskmgr.initgrids(apps.taskmgr.gpu2Bg[i]);
            }
        },
        changeGrids: (chart) => {
            const grid = chart.querySelectorAll('g.col>path');
            for (const elt of grid) {
                let path = $(elt).attr('d').split(' ');
                for (var i = 0; i < path.length; i++) {
                    if (path[i] == 'M' || path[i] == 'L') {
                        var cur = Number(path[i+1]);
                        cur -= 100;
                        if (cur < 0) {
                            cur = (300 - (-cur)) + 6000;
                        }
                        path[i+1] = String(cur);
                    }
                }
                $(elt).attr('d', '');
                let tmp = '';
                for (const comp of path) {
                    tmp += comp + ' ';
                }
                $(elt).attr('d', tmp);
                console.log($(elt).attr('d'));
            }
        }
    },
    whiteboard: {
        canvas: null,
        ctx: null,
        windowResizeObserver: null,
        color: 'red',
        init: () => {
            apps.whiteboard.ctx.lineJoin = 'round';
            apps.whiteboard.ctx.lineCap = 'round';
            apps.whiteboard.changeColor(apps.whiteboard.color);
            if ($(':root').hasClass('dark')) {
                $('.window.whiteboard>.titbar>p').text('Blackboard');
            } else {
                $('.window.whiteboard>.titbar>p').text('Whiteboard');
            }
        },
        changeColor: (color) => {
            apps.whiteboard.color = color;
            if (color == 'eraser') {
                apps.whiteboard.ctx.strokeStyle = 'black';
                apps.whiteboard.ctx.lineWidth = 35;
                apps.whiteboard.ctx.globalCompositeOperation = 'destination-out';
            }
            else {
                apps.whiteboard.ctx.strokeStyle = color;
                apps.whiteboard.ctx.globalCompositeOperation = 'source-over';
                apps.whiteboard.ctx.lineWidth = 8;
            }
        },
        changePen: function () {
            const pens = $('#win-whiteboard>.toolbar>.tools>*');
            for (const elt of pens) {
                elt.classList.remove('active');
            }
            this.classList.add('active');
            apps.whiteboard.changeColor(this.dataset.color);
        },
        load: () => {
            apps.whiteboard.canvas = $('#win-whiteboard>canvas')[0];
            apps.whiteboard.ctx = apps.whiteboard.canvas.getContext('2d');
            apps.whiteboard.windowResizeObserver = new ResizeObserver(apps.whiteboard.resize);
            apps.whiteboard.windowResizeObserver.observe($('.window.whiteboard')[0], { box: 'border-box' });
        },
        resize: () => {
            try {
                const imgData = apps.whiteboard.ctx.getImageData(0, 0, apps.whiteboard.canvas.width, apps.whiteboard.canvas.height);
                apps.whiteboard.canvas.width = $('#win-whiteboard')[0].clientWidth;
                apps.whiteboard.canvas.height = $('#win-whiteboard')[0].clientHeight;
                apps.whiteboard.ctx.putImageData(imgData, 0, 0);
            }
            catch {
                apps.whiteboard.canvas.width = $('#win-whiteboard')[0].clientWidth;
                apps.whiteboard.canvas.height = $('#win-whiteboard')[0].clientHeight;
            }
            apps.whiteboard.init();
        },
        draw: (e) => {
            let offsetX, offsetY, left = $('#win-whiteboard')[0].getBoundingClientRect().left, top = $('#win-whiteboard')[0].getBoundingClientRect().top;
            if (e.type.match('mouse')) {
                offsetX = e.clientX - left, offsetY = e.clientY - top;
            }
            else if (e.type.match('touch')) {
                offsetX = e.touches[0].clientX - left, offsetY = e.touches[0].clientY - top;
            }
            apps.whiteboard.ctx.beginPath();
            apps.whiteboard.ctx.moveTo(offsetX, offsetY);
            page.onmousemove = apps.whiteboard.drawing;
            page.ontouchmove = apps.whiteboard.drawing;
            page.onmouseup = apps.whiteboard.up;
            page.ontouchend = apps.whiteboard.up;
            page.ontouchcancel = apps.whiteboard.up;
        },
        drawing: (e) => {
            let offsetX, offsetY, left = $('#win-whiteboard')[0].getBoundingClientRect().left, top = $('#win-whiteboard')[0].getBoundingClientRect().top;
            if (e.type.match('mouse')) {
                offsetX = e.clientX - left, offsetY = e.clientY - top;
            }
            else if (e.type.match('touch')) {
                offsetX = e.touches[0].clientX - left, offsetY = e.touches[0].clientY - top;
            }
            apps.whiteboard.ctx.lineTo(offsetX, offsetY);
            apps.whiteboard.ctx.stroke();
        },
        up: () => {
            apps.whiteboard.ctx.stroke();
            page.onmousemove = null;
            page.ontouchmove = null;
            page.onmouseup = null;
            page.ontouchend = null;
            page.ontouchcancel = null;
        },
        download: () => {
            const url = apps.whiteboard.canvas.toDataURL();
            $('#win-whiteboard>a.download')[0].href = url;
            $('#win-whiteboard>a.download')[0].click();
        },
        saveAs: () => {
            // Show filename input dialog using notice system
            shownotice('whiteboard-saveas');
        },
        doSaveAs: () => {
            // Execute the actual save with the filename from the notice input
            const fileName = document.getElementById('whiteboard-filename').value.trim() || 
                           `Whiteboard_${new Date().toISOString().slice(0,10)}`;
            
            const url = apps.whiteboard.canvas.toDataURL();
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName.endsWith('.png') ? fileName : fileName + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            closenotice();
        },
        delete: () => {
            apps.whiteboard.ctx.clearRect(0, 0, apps.whiteboard.canvas.width, apps.whiteboard.canvas.height);
        }
    },
    // webapp 即将网页嵌套作为应用内容，格式参考 desktop.html 中 vscode, bilibili
    webapps: {
        apps: ['vscode', 'bilibili','copilot','minesweeper'],
        init: () => {
            for (const app of apps.webapps.apps) {
                apps[app].load();
            }
        }
    },
    vscode: {
        init: () => {
            return null;
        },
        load: () => {
            // 不能改成 vscode.dev, 别问，问就算用不了
            $('#win-vscode')[0].insertAdjacentHTML('afterbegin', '<iframe src="https://github1s.com/" frameborder="0" style="width: 100%; height: 100%;" loading="lazy"></iframe>');
        }
    },
    bilibili: {
        init: () => {
            return null;
        },
        load: () => {
            $('#win-bilibili')[0].insertAdjacentHTML('afterbegin', '<iframe src="https://bilibili.com/" frameborder="0" style="width: 100%; height: 100%;" loading="lazy"></iframe>');
        }
    },
    'copilot': {
        init: () => {
            return null;
        },
        load: () => {
            $('#win-copilot')[0].insertAdjacentHTML('afterbegin', '<iframe src="/chatgh/copilot.html" frameborder="0" style="width: 100%; height: 100%;" loading="lazy"></iframe>');
        }
    },
    'minesweeper': {
      init: () => {
          return null;
        },
        load: () => {
            $('#win-minesweeper')[0].insertAdjacentHTML('afterbegin', '<iframe src="https://win12-online.github.io/win12/games/minesweeper.html" frameborder="0" style="width: 100%; height: 100%;" loading="lazy"></iframe>');
        }
    },
    defender: {
        init: () => {
            return null;
        },
        load: () => {
            var chart = $('#chart')[0].getContext('2d'),
                gradient = chart.createLinearGradient(0, 0, 0, 450);
            gradient.addColorStop(0, 'rgba(0, 199, 214, 0.32)');
            gradient.addColorStop(0.3, 'rgba(0, 199, 214, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 199, 214, 0)');
            var data = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                datasets: [{
                    label: '病毒攻击次数',
                    backgroundColor: gradient,
                    pointBackgroundColor: '#00c7d6',
                    borderWidth: 1,
                    borderColor: '#0e1a2f',
                    data: [60, 45, 80, 30, 35, 55, 25, 80, 40, 50, 80, 50]
                }]
            };
            var options = {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    easing: 'easeInOutQuad',
                    duration: 520
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: '#5e6a81'
                        },
                        gridLines: {
                            color: 'rgba(200, 200, 200, 0.08)',
                            lineWidth: 1
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: '#5e6a81'
                        }
                    }]
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                },
                legend: {
                    display: false
                },
                point: {
                    backgroundColor: '#00c7d6'
                },
                tooltips: {
                    titleFontFamily: 'Poppins',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    titleFontColor: 'white',
                    caretSize: 5,
                    cornerRadius: 2,
                    xPadding: 10,
                    yPadding: 10
                }
            };
            var chartInstance = new Chart(chart, {
                type: 'line',
                data: data,
                options: options
            });
        }
    },
    camera: {
        init: () => {
            if (!localStorage.getItem('camera')) {
                showwin('camera-notice');
                return null;
            }
            if (localStorage.getItem('camera')) {
                apps.camera.streaming = false;
                apps.camera.video = $('#win-camera video')[0];
                apps.camera.canvas = $('#win-camera canvas')[0];
                apps.camera.context = apps.camera.canvas.getContext('2d');
                apps.camera.context.fillStyle = '#aaa';
                apps.camera.downloadLink = $('#win-camera a')[0];
                // apps.camera.control = document.querySelector('#win-camera>.control')
                navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                    .then(stream => {
                        apps.camera.video.srcObject = stream;
                        apps.camera.video.play();
                    })
                    .catch(() => {
                        hidewin('camera');
                    });
                apps.camera.video.addEventListener('canplay', () => {
                    if (!apps.camera.streaming) {
                        apps.camera.aspectRatio = apps.camera.video.videoWidth / apps.camera.video.videoHeight;
                        apps.camera.canvas.width = apps.camera.video.videoWidth;
                        apps.camera.canvas.height = apps.camera.video.videoHeight;
                        apps.camera.windowResizeObserver = new ResizeObserver(apps.camera.resize);
                        apps.camera.windowResizeObserver.observe($('.window.camera')[0], { box: 'border-box' });
                        apps.camera.streaming = true;
                    }
                });
            }
            else {
                hidewin('camera');
            }
        },
        clearCanvas: () => {
            apps.camera.context.fillRect(0, 0, canvas.width, canvas.height);
        },
        takePhoto: () => {
            apps.camera.context.drawImage(apps.camera.video, 0, 0, apps.camera.canvas.width, apps.camera.canvas.height);
            apps.camera.downloadLink.href = apps.camera.canvas.toDataURL('image/png');
            apps.camera.downloadLink.download = 'photo.png';
            apps.camera.downloadLink.click();
        },
        notice: () => {
            if (!localStorage.getItem('camera')) {
                showwin('camera-notice');
            }
            else {
                openapp('camera');
            }
        },
        resize: () => {
            let w = $('#win-camera')[0].offsetWidth,
                h = $('#win-camera')[0].offsetHeight;
            if (w / apps.camera.aspectRatio <= h) {
                if (!$('#win-camera').hasClass('v')) {
                    $('#win-camera').removeClass('h');
                    $('#win-camera').addClass('v');
                }
            }
            else if (w / apps.camera.aspectRatio >= h) {
                if (!$('#win-camera').hasClass('h')) {
                    $('#win-camera').removeClass('v');
                    $('#win-camera').addClass('h');
                }
            }
        },
        remove: () => {
            apps.camera.video.srcObject.getTracks().forEach((t) => {
                t.stop();
            });
            apps.camera.video.srcObject = null;
        }
    },
    explorer: {
        mounts: {},
        nextDriveLetter: 'E',
        fsApiSupported: ('showDirectoryPicker' in window),
        init: () => {
            apps.explorer.tabs = [];
            apps.explorer.len = 0;
            apps.explorer.newtab();
            // apps.explorer.reset();
            apps.explorer.Process_Of_Select = '';
            apps.explorer.is_use = 0;//千万不要删除它，它依托bug运行
            apps.explorer.is_use2 = 0;//千万不要删除它，它依托bug运行
            apps.explorer.old_name = '';
            apps.explorer.clipboard = null;
            if (!apps.explorer.fsApiSupported) $('#explorer-mount-btn').hide();
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Delete' && $('.window.foc')[0].classList[1] == 'explorer') {
                    apps.explorer.del(apps.explorer.Process_Of_Select);
                }
            });
        },
        mountDrive: async () => {
            if (!apps.explorer.fsApiSupported) { shownotice('fs-api-unsupported'); return; }
            try {
                const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                document.body.style.cursor = 'wait';
                const letter = apps.explorer.nextDriveLetter + ':';
                apps.explorer.nextDriveLetter = String.fromCharCode(
                    apps.explorer.nextDriveLetter.charCodeAt(0) + 1);
                apps.explorer.mounts[letter] = dirHandle;
                apps.explorer.path.folder[letter] = { folder: {}, file: [], _mounted: true, _handle: dirHandle };
                if (!apps.explorer.tabs[apps.explorer.now][2].length) apps.explorer.reset();
                document.body.style.cursor = '';
            } catch (e) {
                document.body.style.cursor = '';
                if (e.name !== 'AbortError') shownotice('fs-mount-error');
            }
        },
        openMountedFile: async (path) => {
            var pathl = path.split('/');
            var fileName = pathl[pathl.length - 1];
            var ext = fileName.split('.').pop().toLowerCase();
            let tmp = apps.explorer.path;
            for (let i = 0; i < pathl.length - 1; i++) {
                tmp = tmp['folder'][pathl[i]];
            }
            var fileObj = tmp['file'].find(f => f.name === fileName);
            if (!fileObj || !fileObj._mounted || !fileObj._handle) return;
            try {
                const file = await fileObj._handle.getFile();
                const codeExts = ['js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'less', 'html', 'htm', 'xml',
                    'json', 'yaml', 'yml', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go',
                    'rs', 'rb', 'php', 'sh', 'bat', 'ps1', 'sql', 'svg'];
                const notepadExts = ['txt', 'log', 'md', 'csv', 'ini', 'cfg'];
                if (codeExts.includes(ext)) {
                    const text = await file.text();
                    apps.codeEditor.open(text, fileName, fileObj._handle);
                } else if (notepadExts.includes(ext)) {
                    const text = await file.text();
                    apps.notepad._mountedFileHandle = fileObj._handle;
                    apps.notepad._dirty = false;
                    apps.notepad._loading = true;
                    if ($('#taskbar>.notepad').length != 0) {
                        $('#win-notepad>.text-box')[0].innerText = text;
                        if ($('.window.notepad').hasClass('min')) minwin('notepad');
                        focwin('notepad');
                        requestAnimationFrame(() => { apps.notepad._loading = false; });
                    } else {
                        apps.notepad._pendingContent = text;
                        openapp('notepad');
                    }
                    $('.window.notepad>.titbar>p').text(fileName);
                    apps.notepad.setMdMode(ext === 'md');
                } else if (['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'ico'].includes(ext)) {
                    const url = URL.createObjectURL(file);
                    apps.imgviewer.open(url, fileName);
                } else if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'].includes(ext)) {
                    const url = URL.createObjectURL(file);
                    apps.mediaplayer.open(url, fileName, 'video');
                } else if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'wma', 'm4a'].includes(ext)) {
                    const url = URL.createObjectURL(file);
                    apps.mediaplayer.open(url, fileName, 'audio');
                } else if (ext === 'pdf') {
                    const url = URL.createObjectURL(file);
                    apps.pdfviewer.open(url, fileName);
                } else {
                    shownotice('unsupported-file-type');
                }
            } catch (e) {
                shownotice('file-read-error');
            }
        },
        unmountDrive: (letter) => {
            delete apps.explorer.mounts[letter];
            delete apps.explorer.path.folder[letter];
            if (!apps.explorer.tabs[apps.explorer.now][2].length) apps.explorer.reset();
            else if (apps.explorer.tabs[apps.explorer.now][2].startsWith(letter)) apps.explorer.reset();
        },
        populateFromHandle: async (dirHandle, targetObj) => {
            targetObj.folder = {};
            targetObj.file = [];
            for await (const entry of dirHandle.values()) {
                if (entry.kind === 'directory') {
                    targetObj.folder[entry.name] = { folder: {}, file: [], _mounted: true, _handle: entry };
                } else {
                    const ext = entry.name.split('.').pop().toLowerCase();
                    let ico = 'icon/files/none.png';
                    if (['txt', 'log', 'md', 'csv', 'ini', 'cfg'].includes(ext)) ico = 'icon/files/txt.png';
                    else if (['js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'less', 'html', 'htm', 'xml',
                              'json', 'yaml', 'yml', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go',
                              'rs', 'rb', 'php', 'sh', 'bat', 'ps1', 'sql'].includes(ext)) ico = 'icon/files/txt.png';
                    else if (['png', 'jpg', 'bmp', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'tiff'].includes(ext)) ico = 'icon/files/picture.png';
                    else if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) ico = 'icon/files/word.png';
                    else if (['xls', 'xlsx', 'ods'].includes(ext)) ico = 'icon/files/excel.png';
                    else if (['ppt', 'pptx', 'odp'].includes(ext)) ico = 'icon/files/ppt.png';
                    else if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'wma', 'm4a'].includes(ext)) ico = 'icon/files/music.png';
                    else if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm', 'flv'].includes(ext)) ico = 'icon/files/vidio.png';
                    else if (['exe', 'msi'].includes(ext)) ico = 'icon/files/exefile.png';
                    else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) ico = 'icon/files/none.png';
                    else if ('pdf' === ext) ico = 'icon/files/pdf.svg';
                    targetObj.file.push({ name: entry.name, ico: ico, command: '', _handle: entry, _mounted: true });
                }
            }
        },
        tabs: [],
        now: null,
        len: 0,
        newtab: (path = '') => {
            m_tab.newtab('explorer', '');
            apps.explorer.tabs[apps.explorer.tabs.length - 1][2] = path;
            apps.explorer.initHistory(apps.explorer.tabs[apps.explorer.tabs.length - 1][0]);
            apps.explorer.checkHistory(apps.explorer.tabs[apps.explorer.tabs.length - 1][0]);
            m_tab.tab('explorer', apps.explorer.tabs.length - 1);
            // }
        },
        settab: (t, i) => {
            return `
                <div class="tab ${t[0]}" onclick="m_tab.tab('explorer',${i})"
                oncontextmenu="showcm(event,'explorer.tab',${i});stop(event);return false"
                onmousedown="
                    if(event.button==1){m_tab.close('explorer',${i});stop(event);}
                    else{m_tab.moving('explorer',this,event,${i});stop(event);disableIframes();}"
                ontouchstart="m_tab.moving('explorer',this,event,${i});stop(event);disableIframes();">
                    <p>${t[1]}</p>
                    <span class="clbtn bi bi-x" onclick="m_tab.close('explorer',${i});stop(event);"></span>
                </div>`;
        },
        tab: (c, load = true) => {
            if (load) {
                console.log(c);
                if (!apps.explorer.tabs[c][2].length) apps.explorer.reset();
                else apps.explorer.goto(apps.explorer.tabs[c][2]);
            }
            apps.explorer.checkHistory(apps.explorer.tabs[c][0]);
        },
        reset: (clear = true) => {
            let resetHtml = `<style>#win-explorer>.page>.main>.content>.view>.class{margin: 5px 0 0 10px;display: flex;}
            #win-explorer>.page>.main>.content>.view>.class>img{width: 20px;height: 20px;margin-top: 3px;margin-right: 5px;filter:brightness(0.9);}
            #win-explorer>.page>.main>.content>.view>.group{display: flex;flex-wrap: wrap;padding: 10px 20px;}
            #win-explorer>.page>.main>.content>.view>.group>.item{width: 280px;margin: 5px;height:80px;
    box-shadow: 0 1px 2px var(--s3d);
                background: radial-gradient(circle, var(--card),var(--card));border-radius: 10px;display: flex;}
            #win-explorer>.page>.main>.content>.view>.group>.item:hover{background-color: var(--hover);}

            #win-explorer>.page>.main>.content>.view>.group>.item>img{width: 55px;height: 55px;margin-top: 18px;margin-left: 10px;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div{flex-grow: 1;padding: 5px 5px 0 0;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div>.bar{width: calc(100% - 10px);height: 8px;border-radius: 10px;
                background-color: var(--hover-b);margin: 5px 5px;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div>.bar>.content{height: 100%;background-image: linear-gradient(90deg, var(--theme-1), var(--theme-2));
                border-radius: 10px;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div>.info{color: #959595;font-size: 14px;}</style>
            <p class="class"><img src="apps/icons/explorer/disk.svg"> 设备和驱动器</p><div class="group">
            <a class="a item act" ondblclick="apps.explorer.goto('C:')" ontouchend="apps.explorer.goto('C:')" oncontextmenu="showcm(event,'explorer.folder','C:');return stop(event);">
            <img src="apps/icons/explorer/diskwin.svg"><div><p class="name">本地磁盘 (C:)</p>
            <div class="bar"><div class="content" style="width: 88%;"></div>
            </div><p class="info">32.6 GB 可用, 共 143 GB</p></div></a><a class="a item act" ondblclick="apps.explorer.goto('D:')" ontouchend="apps.explorer.goto('D:')"
            oncontextmenu="showcm(event,'explorer.folder','D:');return stop(event);">
            <img src="apps/icons/explorer/disk.svg"><div><p class="name">本地磁盘 (D:)</p><div class="bar"><div class="content" style="width: 15%;"></div>
            </div><p class="info">185.3 GB 可用, 共 216 GB</p></div></a>`;
            for (let letter in apps.explorer.mounts) {
                const handle = apps.explorer.mounts[letter];
                resetHtml += `<a class="a item act" ondblclick="apps.explorer.goto('${letter}')" ontouchend="apps.explorer.goto('${letter}')" oncontextmenu="showcm(event,'explorer.mounted','${letter}');return stop(event);">
                <img src="apps/icons/explorer/disk.svg"><div><p class="name">${handle.name} (${letter})</p>
                <div class="bar"><div class="content" style="width: 0%;"></div>
                </div><p class="info">本地文件夹</p></div></a>`;
            }
            resetHtml += `</div>`;
            $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = resetHtml;
            $('#win-explorer>.path>.tit')[0].innerHTML = '<div class="icon" style="background-image: url(\'./apps/icons/explorer/thispc.svg\')"></div><div class="path"><div class="text" onclick="apps.explorer.reset()">此电脑</div><div class="arrow">&gt;</div></div>';
            // if(rename){
            m_tab.rename('explorer', '<img src="./apps/icons/explorer/thispc.svg"> 此电脑');
            apps.explorer.tabs[apps.explorer.now][2] = '';
            if (clear) {
                apps.explorer.delHistory(apps.explorer.tabs[apps.explorer.now][0]);
                apps.explorer.pushHistory(apps.explorer.tabs[apps.explorer.now][0], '此电脑');
            }
            // }
        },
        select: (path, id) => {
            var elements = document.querySelectorAll('#win-explorer > .main > .content > .view > .select');
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove('select');
            }
            apps.explorer.Process_Of_Select = path;
            var element = document.getElementById(id);
            element.classList.add('select');
            apps.explorer.is_use += 1;
        },
        copy_or_cut: (path, operate) => { //operate只能为copy或cut
            var pathl = path.split('/');
            var name = pathl[pathl.length - 1];
            pathl.pop();
            let tmp = apps.explorer.path;
            pathl.forEach(name => {
                tmp = tmp['folder'][name];
            });

            if (Object.keys(tmp['folder']).includes(name)) {
                apps.explorer.clipboard = ['folder', [name], tmp['folder'][name]];
                if (operate == 'cut') {
                    delete tmp['folder'][name];
                }
            }
            else {
                for (var i = 0; i < tmp['file'].length; i++) {
                    if (tmp['file'][i]['name'] == name) {
                        apps.explorer.clipboard = ['file', tmp['file'][i]];
                        if (operate == 'cut') {
                            tmp['file'].splice(i, 1); // Use splice instead of delete
                        }
                        break;
                    }
                }
            }
            apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, false);
        },
        paste: (path) => {
            if (!apps.explorer.clipboard) {
                return;
            }
            var pathl = path.split('/');
            let tmp = apps.explorer.path;
            pathl.forEach(name => {
                if (!tmp['folder'][name]) {
                    return;
                }
                tmp = tmp['folder'][name];
            });

            var clipboard = apps.explorer.clipboard;
            if (clipboard[0] == 'file') {
                // Check for duplicate file name
                if (tmp['file'].some(file => file.name === clipboard[1].name)) {
                    shownotice('duplication file name');
                    return;
                }
                tmp['file'].push({...clipboard[1]}); // Create a copy of the file object
            } else {
                // Check for duplicate folder name
                if (tmp['folder'][clipboard[1][0]]) {
                    shownotice('duplication file name');
                    return;
                }
                tmp['folder'][clipboard[1][0]] = JSON.parse(JSON.stringify(clipboard[2])); // Deep copy the folder
            }
            apps.explorer.goto(path);
        },
        del_select: () => {
            if (apps.explorer.is_use >= 1 && apps.explorer.is_use2 != apps.explorer.is_use) {
                apps.explorer.is_use2 = apps.explorer.is_use;
                return;
            }
            var elements = document.querySelectorAll('#win-explorer>.page>.main>.content>.view>.change');
            console.log(elements);
            for (var i = 0; i < elements.length; i++) {
                var name_1, icon_;
                elements[i].classList.remove('change');
                let aTag = elements[i];
                var on = apps.explorer.old_name;
                let inputTag = aTag.querySelector('#new_name');
                var pathl = $('#win-explorer>.path>.tit')[0].dataset.path.split('/');
                let tmp = apps.explorer.path;
                pathl.forEach(name => {
                    tmp = tmp['folder'][name];
                });
                if (inputTag.value == '' || apps.explorer.traverseDirectory(tmp, inputTag.value) || on == inputTag.value) {
                    if (apps.explorer.traverseDirectory(tmp, inputTag.value) && on != inputTag.value) {
                        shownotice('duplication file name');
                    }
                    var element = document.getElementById('new_name');
                    element.parentNode.removeChild(element);
                    aTag.innerHTML += on;
                    continue;
                }
                name_1 = inputTag.value.split('.');
                if (name_1[0].indexOf('/') > -1) alert('恭喜你发现了这个bug,但是太懒了不想修qwq');
                console.log(name_1);
                if (name_1[1] == 'txt') {
                    icon_ = 'icon/files/txt.png';
                }
                else if (name_1[1] == 'png' || name_1[1] == 'jpg' | name_1[1] == 'bmp') {
                    icon_ = 'icon/files/picture.png';
                }
                else {
                    icon_ = 'icon/files/none.png';
                }
                //这边可以适配更多的文件类型

                aTag.innerHTML += inputTag.value;
                var isMountedRename = !!apps.explorer.mounts[pathl[0]];
                for (var j = 0; j < tmp['file'].length; j++) {
                    if (tmp['file'][j]['name'] == on) {
                        tmp['file'][j]['name'] = inputTag.value;
                        tmp['file'][j]['ico'] = icon_;
                        if (isMountedRename && tmp._handle) {
                            (async () => {
                                try {
                                    const oldHandle = await tmp._handle.getFileHandle(on);
                                    const file = await oldHandle.getFile();
                                    const newHandle = await tmp._handle.getFileHandle(inputTag.value, { create: true });
                                    const writable = await newHandle.createWritable();
                                    await writable.write(await file.arrayBuffer());
                                    await writable.close();
                                    await tmp._handle.removeEntry(on);
                                    tmp['file'][j]._handle = newHandle;
                                } catch (e) {
                                    console.warn('Rename on mounted FS failed:', e);
                                }
                            })();
                        }
                    }
                }
                const keys = Object.keys(tmp['folder']);
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i] == on) {
                        keys[i] = inputTag.value;
                        tmp['folder'][inputTag.value] = tmp['folder'][on];
                        delete tmp['folder'][on];
                    }
                }
                element = document.getElementById('new_name');
                element.parentNode.removeChild(element);
                apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, false);

            }
            apps.explorer.is_use2 = apps.explorer.is_use;
            elements = document.querySelectorAll('#win-explorer>.page>.main>.content>.view>.select');
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove('select');
            }
            apps.explorer.Process_Of_Select = '';
        },
        goto: (path, clear = true) => {
            if (path == '此电脑') { apps.explorer.reset(clear); return null; }
            var pathl = path.split('/');
            if (apps.explorer.mounts[pathl[0]]) {
                apps.explorer._gotoAsync(path, clear, !clear);
            } else {
                apps.explorer._gotoSync(path, clear);
            }
        },
        _gotoAsync: async (path, clear, forceRefresh = false) => {
            $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '<p class="info" style="opacity:0.6;">加载中...</p>';
            var pathl = path.split('/');
            let tmp = apps.explorer.path;
            try {
                for (let i = 0; i < pathl.length; i++) {
                    tmp = tmp['folder'][pathl[i]];
                    const needLoad = Object.keys(tmp.folder).length === 0 && tmp.file.length === 0;
                    if (tmp._mounted && tmp._handle && (needLoad || (forceRefresh && i === pathl.length - 1))) {
                        await apps.explorer.populateFromHandle(tmp._handle, tmp);
                    }
                }
                apps.explorer._gotoSync(path, clear);
            } catch (e) {
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '<p class="info">无法读取此文件夹。</p>';
            }
        },
        _gotoSync: (path, clear = true) => {
            apps.explorer.Process_Of_Select = '';
            $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '';
            var pathl = path.split('/');
            var pathqwq = '';
            var index_ = 0;
            let tmp = apps.explorer.path;
            $('#win-explorer>.path>.tit')[0].dataset.path = path;
            $('#win-explorer>.path>.tit>.path')[0].innerHTML = '<div class="text" onclick="apps.explorer.reset()">此电脑</div><div class="arrow">&gt;</div>';
            $('#win-explorer>.path>.tit>.icon')[0].style.marginTop = '0px';
            if (pathl[pathl.length - 1] == 'C:') {
                $('#win-explorer>.path>.tit>.icon')[0].style.backgroundImage = 'url("apps/icons/explorer/diskwin.svg")';
                $('#win-explorer>.path>.tit>.icon')[0].style.marginTop = '2.5px';
                m_tab.rename('explorer', '<img src="./apps/icons/explorer/diskwin.svg" style="margin-top:2.5px">' + pathl[pathl.length - 1]);
            }
            else if (pathl[pathl.length - 1] == 'D:') {
                $('#win-explorer>.path>.tit>.icon')[0].style.backgroundImage = 'url("apps/icons/explorer/disk.svg")';
                m_tab.rename('explorer', '<img src="./apps/icons/explorer/disk.svg">' + pathl[pathl.length - 1]);
            }
            else if (apps.explorer.mounts[pathl[pathl.length - 1]]) {
                $('#win-explorer>.path>.tit>.icon')[0].style.backgroundImage = 'url("apps/icons/explorer/disk.svg")';
                m_tab.rename('explorer', '<img src="./apps/icons/explorer/disk.svg">' + pathl[pathl.length - 1]);
            }
            else {
                $('#win-explorer>.path>.tit>.icon')[0].style.backgroundImage = 'url("apps/icons/explorer/folder.svg")';
                m_tab.rename('explorer', '<img src="./apps/icons/explorer/folder.svg">' + pathl[pathl.length - 1]);
            }
            // if(rename){
            apps.explorer.tabs[apps.explorer.now][2] = path;
            // }
            pathl.forEach(name => {
                pathqwq += name;
                $('#win-explorer>.path>.tit>.path')[0].innerHTML += `<div class="text" onclick="apps.explorer.goto('${pathqwq}')">${name}</div><div class="arrow">&gt;</div>`;
                tmp = tmp['folder'][name];
                pathqwq += '/';
            });
            var path_ = path;
            if (Object.keys(tmp['folder']) == 0 && tmp['file'].length == 0) {
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '<p class="info">此文件夹为空。</p>';
            }
            else {
                let ht = '';
                for (let folder in tmp['folder']) {
                    ht += `<a class="a item files" id="file${index_}" onclick="apps.explorer.select('${path}/${folder}','file${index_}');" ondblclick="apps.explorer.goto('${path}/${folder}')" ontouchend="apps.explorer.goto('${path}/${folder}')" oncontextmenu="showcm(event,'explorer.folder','${path}/${folder}');return stop(event);">
                        <img src="apps/icons/explorer/folder.svg">${folder}</a>`;
                    index_ += 1;
                }
                if (tmp['file']) {
                    tmp['file'].forEach(file => {
                        let cmd = file['command'];
                        if (file._mounted && file._handle) {
                            cmd = `apps.explorer.openMountedFile('${path_}/${file['name']}')`;
                        }
                        ht += `<a class="a item file" id="file${index_}" onclick="apps.explorer.select('${path_}/${file['name']}','file${index_}');" ondblclick="${cmd}" ontouchend="${cmd}" oncontextmenu="showcm(event,'explorer.file','${path_}/${file['name']}');return stop(event);">
                            <img src="${file['ico']}">${file['name']}</a>`;
                        index_ += 1;
                    });
                }
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = ht;
            }
            if (pathl.length == 1) {
                $('#win-explorer>.path>.goback').attr('onclick', 'apps.explorer.reset()');
            } else {
                $('#win-explorer>.path>.goback').attr('onclick', `apps.explorer.goto('${path.substring(0, path.length - pathl[pathl.length - 1].length - 1)}')`);
            }

            if (clear) {
                apps.explorer.delHistory(apps.explorer.tabs[apps.explorer.now][0]);
                apps.explorer.pushHistory(apps.explorer.tabs[apps.explorer.now][0], $('#win-explorer>.path>.tit')[0].dataset.path);
            }
            apps.explorer.checkHistory(apps.explorer.tabs[apps.explorer.now][0]);
        },
        add: (path, name_, type = 'file', command = '', icon = '') => { //type为文件类型，只有文件夹files和文件file
            var pathl = path.split('/');
            var icon_ = '';
            var isMounted = !!apps.explorer.mounts[pathl[0]];
            let tmp = apps.explorer.path;
			
            pathl.forEach(name => {
                tmp = tmp['folder'][name];
            });
            if (tmp == null) {
                tmp = { folder: {}, file: [] };
            }
			
    		let finalName = name_;
    		let counter = 1;
    		let baseName = name_;
    		let extension = "";
    
    		if (type === 'file' && name_.includes('.')) {
        		const lastDotIndex = name_.lastIndexOf('.');
        		baseName = name_.substring(0, lastDotIndex);
        		extension = name_.substring(lastDotIndex); // e.g., ".txt"
    		}

            while (apps.explorer.traverseDirectory(tmp, finalName)) {
              finalName = `${baseName} (${counter})${extension}`;
              counter++; 
            }
    
            name_ = finalName; // Now this is safely back inside the function
            //fix: resolved boot crash (syntax error on line 1403 and scope issue)
            // 检查是否是文件夹
            if (type === 'folder') {
                if (icon !== '') {
                    icon_ = icon;
                } else {
                    icon_ = 'icon/folder.png';
                }
                try {
                    if (isMounted && tmp._handle) {
                        tmp.folder[name_] = { folder: {}, file: [], _mounted: true };
                        tmp._handle.getDirectoryHandle(name_, { create: true }).then(h => {
                            tmp.folder[name_]._handle = h;
                        }).catch(() => shownotice('file-write-error'));
                    } else {
                        tmp.folder[name_] = { folder: {}, file: [] };
                    }
                } catch {
                    tmp = { folder: {}, file: [] };
                    tmp.folder[name_] = { folder: {}, file: [] };
                }
                return;
            }

            // 处理文件
            const name_1 = name_.split('.');
            if (name_1.length < 2) {
                icon_ = 'icon/files/none.png';
            }
            else if (name_1[1] === 'txt') {
                icon_ = 'icon/files/txt.png';
                if (command === '') {
                    command = 'openapp(\'notepad\')';
                }
            }
            else if (['png', 'jpg', 'bmp'].includes(name_1[1])) {
                icon_ = 'icon/files/picture.png';
            }
            else {
                icon_ = 'icon/files/none.png';
            }

            if (icon !== '') {
                icon_ = icon;
            }

            try {
                if (isMounted && tmp._handle) {
                    var fileEntry = { name: name_, ico: icon_, command: '', _mounted: true };
                    tmp.file.push(fileEntry);
                    tmp._handle.getFileHandle(name_, { create: true }).then(h => {
                        fileEntry._handle = h;
                    }).catch(() => shownotice('file-write-error'));
                } else {
                    tmp.file.push({ name: name_, ico: icon_, command: command });
                }
            }
            catch {
                tmp = { folder: {}, file: [] };
                tmp.file = [{ name: name_, ico: icon_, command: command }];
            }
            apps.explorer.goto(path);
            apps.explorer.rename(path + '/' + name_);
        },
        rename: (path) => {
            var pathl = path.split('/');
            var name = pathl[pathl.length - 1];
            apps.explorer.old_name = name;
            pathl.pop();
            let tmp = apps.explorer.path;
            pathl.forEach(name => {
                tmp = tmp['folder'][name];
            });
            let element = document.querySelector('#' + apps.explorer.get_file_id(name));
            let img = element.querySelector('img').outerHTML;
            element.innerHTML = img;
            let input = document.createElement('input');
            // input.style.cssText = '';
            input.id = 'new_name';
            input.className = 'input';
            input.value = apps.explorer.old_name;
            element.appendChild(input);
            setTimeout(() => { $('#new_name').focus(); $('#new_name').select(); }, 200);

            element.classList.add('change');
            var input_ = document.getElementById('new_name');
            input_.addEventListener('keyup', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    apps.explorer.del_select();
                }
            });
        },
        get_file_id: (name) => {  //只能找到已经打开了的文件夹的元素id
            var elements = document.getElementsByClassName('item');
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                if (element.innerText == name) {
                    return element.id;
                }
            }
        },
        del: (path) => {
            var pathl = path.split('/');
            var name = pathl[pathl.length - 1];
            var isMounted = !!apps.explorer.mounts[pathl[0]];
            pathl.pop();
            let tmp = apps.explorer.path;
            pathl.forEach(name => {
                tmp = tmp['folder'][name];
            });
            let tmp_file = tmp['file'];
            for (var i = 0; i < tmp_file.length; i++) {
                if (tmp_file[i]['name'] == name) {
                    tmp_file.splice(i, 1);
                }
            }
            let tmp_files = tmp['folder'];
            delete tmp_files[name];
            if (isMounted && tmp._handle) {
                tmp._handle.removeEntry(name, { recursive: true }).catch(() => shownotice('file-write-error'));
            }
            apps.explorer.goto(pathl.join('/'));
            apps.explorer.history.forEach(item => {
                while (item.includes(path)) {
                    item.splice(item.findIndex(elt => { return elt == path; }), 1);
                }
            });
        },
        traverseDirectory(dir, name) {
            if (dir['file'] == null && dir['folder'] == null)
                return false;
            for (var i = 0; i < dir['file'].length; i++) {
                if (dir['file'][i]['name'] == name) {
                    return true;
                }
            }
            const keys = Object.keys(dir['folder']);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] == name) {
                    return true;
                }
            }
            return false;
        },
        // 禁止奇奇怪怪的缩进！尽量压行，不要毫无意义地全部格式化和展开！ 
        // 给我看蒙了这东西，写的是啥？
        path: {folder:{'C:':{folder:{'Program Files':{folder:{'WindowsApps':{folder:{},file:[]},'Microsoft':{folder:{},file:[]}},file:[{name:'about.exe',ico:'icon/about.svg',command:'openapp(\'about\')'},{name:'setting.exe',ico:'icon/setting.svg',command:'openapp(\'setting\')'},]},'Program Files (x86)':{folder:{'Microsoft':{folder:{'Edge':{folder:{'Application':{folder:{'SetupMetrics':{folder:{},file:[]}},file:[{name:'msedge.exe',ico:'icon/edge.svg',command:'openapp(\'edge\')'}]}}}}}}},'Windows':{folder:{'Boot':{folder:{},file:[]},'System':{folder:{},file:[]},'SysWOW64':{folder:{},file:[]},'System32':{folder:{},file:[{name:'calc.exe',ico:'icon/calc.svg',command:'openapp(\'calc\')'},{name:'cmd.exe',ico:'icon/terminal.svg',command:'openapp(\'terminal\')'},{name:'notepad.exe',ico:'icon/notepad.svg',command:'openapp(\'notepad\')'},{name:'taskmgr.exe',ico:'icon/taskmgr.png',command:'openapp(\'taskmgr\')'},{name:'winver.exe',ico:'icon/about.svg',command:'openapp(\'winver\')'},]}},file:[{name:'explorer.exe',ico:'icon/explorer.svg',command:'apps.explorer.newtab()'},{name:'notepad.exe',ico:'icon/notepad.svg',command:'openapp(\'notepad\')'},{name:'py.exe',ico:'icon/python.svg',command:'openapp(\'python\')'},]},'用户':{folder:{'Administrator':{folder:{'推荐的项目':{folder:{},file:[{name:'瓶盖介绍.doc',ico:'icon/files/word.png',command:'openapp(\'word\');apps.word.edit()'},{name:'瓶盖质量统计分析.xlsx',ico:'icon/files/excel.png',command:''},]},'文档':{folder:{'IISExpress':{folder:{},file:[]},'PowerToys':{folder:{},file:[]}},file:[{name:'瓶盖介绍.doc',ico:'icon/files/word.png',command:''},{name:'瓶盖质量统计分析.xlsx',ico:'icon/files/excel.png',command:''},]},'图片':{folder:{'本机照片':{folder:{},file:[]},'屏幕截图':{folder:{},file:[]}},file:[{name:'瓶盖构造图.png',ico:'icon/files/img.png',command:''},{name:'可口可乐瓶盖.jpg',ico:'icon/files/img.png',command:''},]},'AppData':{folder:{'Local':{folder:{'Microsoft':{folder:{'Windows':{folder:{'Fonts':{},'TaskManager':{},'Themes':{},'Shell':{},'应用程序快捷方式':{},}},}},'Programs':{folder:{'Python':{folder:{'Python310':{folder:{'DLLs':{},'Doc':{},'include':{},'Lib':{folder:{'site-packages':{},'tkinter':{},}},'libs':{},'Script':{},'share':{},'tcl':{},'Tools':{}},file:[{name:'python.exe',ico:'icon/python.png',command:'openapp(\'python\')'}]}},}}},'Temp':{folder:{}},}},'LocalLow':{folder:{'Microsoft':{folder:{'Windows':{},}},}},'Roaming':{folder:{'Microsoft':{folder:{'Windows':{folder:{'「开始」菜单':{folder:{'程序':{folder:{}},}},}},}},}},},file:[]},'音乐':{folder:{'录音机':{folder:{},file:[]}}}}},'公用':{folder:{'公用文档':{folder:{'IISExpress':{folder:{},file:[]},'PowerToys':{folder:{},file:[]}},file:[]},'公用图片':{folder:{'本机照片':{folder:{},file:[]},'屏幕截图':{folder:{},file:[]}},file:[]},'公用音乐':{folder:{'录音机':{folder:{},file:[]}}}}}}}},file:[]},'D:':{folder:{'Microsoft':{folder:{},file:[]}},file:[{name:'瓶盖结构说明.docx',ico:'icon/files/word.png',command:''},{name:'可口可乐瓶盖历史.pptx',ico:'icon/files/ppt.png',command:''},]}}},
        history: [],
        historypt: [],
        initHistory: (tab) => {
            apps.explorer.history[tab] = [];
            apps.explorer.historypt[tab] = -1;
        },
        pushHistory: (tab, u) => {
            apps.explorer.history[tab].push(u);
            apps.explorer.historypt[tab]++;
        },
        topHistory: (tab) => {
            return apps.explorer.history[tab][apps.explorer.historypt[tab]];
        },
        popHistory: (tab) => {
            apps.explorer.historypt[tab]--;
            return apps.explorer.history[tab][apps.explorer.historypt[tab]];
        },
        incHistory: (tab) => {
            apps.explorer.historypt[tab]++;
            return apps.explorer.history[tab][apps.explorer.historypt[tab]];
        },
        delHistory: (tab) => {
            apps.explorer.history[tab].splice(apps.explorer.historypt[tab] + 1, apps.explorer.history[tab].length - 1 - apps.explorer.historypt[tab]);
        },
        historyIsEmpty: (tab) => {
            return apps.explorer.historypt[tab] <= 0;
        },
        historyIsFull: (tab) => {
            return apps.explorer.historypt[tab] >= apps.explorer.history[tab].length - 1;
        },
        checkHistory: (tab) => {
            if (apps.explorer.historyIsEmpty(tab)) {
                $('#win-explorer>.path>.back').addClass('disabled');
            }
            else if (!apps.explorer.historyIsEmpty(tab)) {
                $('#win-explorer>.path>.back').removeClass('disabled');
            }
            if (apps.explorer.historyIsFull(tab)) {
                $('#win-explorer>.path>.front').addClass('disabled');
            }
            else if (!apps.explorer.historyIsFull(tab)) {
                $('#win-explorer>.path>.front').removeClass('disabled');
            }
        },
        back: (tab) => {
            apps.explorer.goto(apps.explorer.popHistory(tab), false);
            apps.explorer.checkHistory(tab);
        },
        front: (tab) => {
            apps.explorer.goto(apps.explorer.incHistory(tab), false);
            apps.explorer.checkHistory(tab);
        }
    },
    calc: {
        init: () => {
            document.getElementById('calc-input').innerHTML = '0';
        }
    },
    about: {
        init: () => {
            $('#win-about>.about').addClass('show');
            $('#win-about>.update').removeClass('show');
            if (!($('#contri').length > 1)) apps.about.get();
            if (!($('#StarShow').html().includes('刷新'))) apps.about.get_star();
        },
        run_loading: (expr) => {
            $(expr).html(`<loading><svg width="30px" height="30px" viewBox="0 0 16 16">
            <circle cx="8px" cy="8px" r="7px" style="stroke:#7f7f7f50;fill:none;stroke-width:3px;"></circle>
            <circle cx="8px" cy="8px" r="7px" style="stroke:#2983cc;stroke-width:3px;"></circle></svg></loading>`);
        },
        get: () => {
            apps.about.run_loading('#contri');
            // 实时获取项目贡献者
            $.get('https://api.github.com/repos/win12-online/win12/contributors').then(cs => {
                setTimeout(() => {
                    $('#contri').html('');
                    cs.forEach(c => {
                        $('#contri').append(`<a class="a" onclick="window.open('${c['html_url']}','_blank');"><p class="name">${c['login']}</p><p class="cbs">贡献：<span class="num">${c['contributions']}</span></p></a>`);
                    });
                    $('#contri').append('<a class="button" onclick="apps.about.get()"><i class="bi bi-arrow-clockwise"></i> 刷新</a>');
                }, 200);
            });
        },
        get_star: () => {
            apps.about.run_loading('#StarShow');
            const repoFullName = 'win12-online/win12';
            fetch(`https://api.github.com/repos/${repoFullName}`)
                .then(response => response.json())
                .then(data => {
                    setTimeout(() => {
                        const starCount = data.stargazers_count;
                        $('#StarShow').html('<div style="display: flex;"><p>&emsp;&emsp;Star 数量：' + starCount + ' (实时数据)</p>&emsp;<a class="button" onclick="apps.about.get_star()"><i class="bi bi-arrow-clockwise"></i> 刷新</a></div>');
                    }, 200);
                })
                .catch(error => {
                    console.error('获取star数量时出错：', error);
                    $('#StarShow').html('<div style="display: flex;"><p>&emsp;&emsp;哎呀！出错了！</p>&emsp;<a class="button" onclick="apps.about.get_star()"><i class="bi bi-arrow-clockwise"></i> 重试</a></div>');
                });
        }
    },
    notepad: {
        _pendingContent: null,
        _mountedFileHandle: null,
        _keyBound: false,
        _isMd: false,
        _previewing: false,
        _dirty: false,
        _loading: false,
        _markDirty: () => {
            if (!apps.notepad._dirty && apps.notepad._mountedFileHandle && !apps.notepad._loading) {
                apps.notepad._dirty = true;
                var p = $('.window.notepad>.titbar>p');
                if (!p.text().startsWith('* ')) p.text('* ' + p.text());
            }
        },
        init: () => {
            apps.notepad._resetPreview();
            apps.notepad._dirty = false;
            apps.notepad._loading = true;
            $('#win-notepad>.text-box').addClass('down');
            setTimeout(() => {
                if (apps.notepad._pendingContent !== null) {
                    $('#win-notepad>.text-box')[0].innerText = apps.notepad._pendingContent;
                    apps.notepad._pendingContent = null;
                } else {
                    $('#win-notepad>.text-box').val('');
                    apps.notepad._mountedFileHandle = null;
                }
                $('#win-notepad>.text-box').removeClass('down');
                requestAnimationFrame(() => { apps.notepad._loading = false; });
            }, 200);
            if (!apps.notepad._keyBound) {
                apps.notepad._keyBound = true;
                $('#win-notepad>.text-box').on('input', apps.notepad._markDirty);
                document.addEventListener('keydown', function (e) {
                    if (e.ctrlKey && e.key === 's' && $('.window.foc')[0]?.classList.contains('notepad')) {
                        e.preventDefault();
                        apps.notepad.saveMounted();
                    }
                });
            }
        },
        _resetPreview: () => {
            apps.notepad._isMd = false;
            apps.notepad._previewing = false;
            $('#notepad-md-toggle').hide().removeClass('active').html('<i class="bi bi-eye"></i> 预览');
            $('#notepad-md-preview').hide();
            $('#win-notepad>.text-box').show();
        },
        setMdMode: (enabled) => {
            apps.notepad._resetPreview();
            apps.notepad._isMd = enabled;
            if (enabled) {
                $('#notepad-md-toggle').show();
            }
        },
        togglePreview: () => {
            apps.notepad._previewing = !apps.notepad._previewing;
            if (apps.notepad._previewing) {
                var text = $('#win-notepad>.text-box')[0].innerText;
                var html = marked.parse(text);
                $('#notepad-md-preview').html(typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html).show();
                $('#win-notepad>.text-box').hide();
                $('#notepad-md-toggle').addClass('active').html('<i class="bi bi-pencil"></i> 编辑');
            } else {
                $('#notepad-md-preview').hide();
                $('#win-notepad>.text-box').show();
                $('#notepad-md-toggle').removeClass('active').html('<i class="bi bi-eye"></i> 预览');
            }
        },
        saveMounted: async () => {
            if (!apps.notepad._mountedFileHandle) return;
            try {
                const writable = await apps.notepad._mountedFileHandle.createWritable();
                await writable.write($('#win-notepad>.text-box')[0].innerText);
                await writable.close();
                apps.notepad._dirty = false;
                var p = $('.window.notepad>.titbar>p');
                p.text(p.text().replace(/^\* /, ''));
                p.css('opacity', '0.5');
                setTimeout(() => p.css('opacity', ''), 300);
            } catch (e) {
                shownotice('file-write-error');
            }
        },
        close: () => {
            if (apps.notepad._dirty && apps.notepad._mountedFileHandle) {
                shownotice('unsaved-notepad');
                return;
            }
            apps.notepad._forceClose();
        },
        _forceClose: () => {
            apps.notepad._dirty = false;
            apps.notepad._mountedFileHandle = null;
            hidewin('notepad');
            hidewin('notepad-fonts', 'configs');
        }
    },
    imgviewer: {
        _blobUrl: null,
        _scale: 1,
        _rotate: 0,
        init: () => {},
        open: (url, name) => {
            openapp('imgviewer');
            apps.imgviewer._blobUrl = url;
            apps.imgviewer._scale = 1;
            apps.imgviewer._rotate = 0;
            apps.imgviewer._applyTransform();
            $('#win-imgviewer .preview-img').attr('src', url);
            $('.window.imgviewer>.titbar>p').text(name || lang('图片查看器', 'imgviewer.name'));
        },
        close: () => {
            if (apps.imgviewer._blobUrl) {
                URL.revokeObjectURL(apps.imgviewer._blobUrl);
                apps.imgviewer._blobUrl = null;
            }
            hidewin('imgviewer');
        },
        zoomIn: () => {
            apps.imgviewer._scale = Math.min(apps.imgviewer._scale * 1.25, 10);
            apps.imgviewer._applyTransform();
        },
        zoomOut: () => {
            apps.imgviewer._scale = Math.max(apps.imgviewer._scale / 1.25, 0.1);
            apps.imgviewer._applyTransform();
        },
        rotateRight: () => {
            apps.imgviewer._rotate = (apps.imgviewer._rotate + 90) % 360;
            apps.imgviewer._applyTransform();
        },
        resetView: () => {
            apps.imgviewer._scale = 1;
            apps.imgviewer._rotate = 0;
            apps.imgviewer._applyTransform();
        },
        _applyTransform: () => {
            $('#win-imgviewer .preview-img').css('transform',
                `scale(${apps.imgviewer._scale}) rotate(${apps.imgviewer._rotate}deg)`);
        }
    },
    mediaplayer: {
        _blobUrl: null,
        init: () => {},
        open: (url, name, type) => {
            openapp('mediaplayer');
            apps.mediaplayer._blobUrl = url;
            $('.window.mediaplayer>.titbar>p').text(name || lang('媒体播放器', 'mediaplayer.name'));
            if (type === 'video') {
                $('#mediaplayer-video').attr('src', url).show()[0].load();
                $('#mediaplayer-audio').hide()[0].pause();
                $('.window.mediaplayer>.titbar>img').attr('src', 'icon/files/vidio.png');
            } else {
                $('#mediaplayer-audio').attr('src', url).show()[0].load();
                $('#mediaplayer-video').hide()[0].pause();
                $('.window.mediaplayer>.titbar>img').attr('src', 'icon/files/music.png');
            }
        },
        close: () => {
            $('#mediaplayer-video')[0].pause();
            $('#mediaplayer-audio')[0].pause();
            if (apps.mediaplayer._blobUrl) {
                URL.revokeObjectURL(apps.mediaplayer._blobUrl);
                apps.mediaplayer._blobUrl = null;
            }
            hidewin('mediaplayer');
        }
    },
    pdfviewer: {
        _blobUrl: null,
        init: () => {},
        open: (url, name) => {
            openapp('pdfviewer');
            apps.pdfviewer._blobUrl = url;
            $('#pdfviewer-frame').attr('src', url);
            $('.window.pdfviewer>.titbar>p').text(name || lang('PDF 查看器', 'pdfviewer.name'));
        },
        close: () => {
            $('#pdfviewer-frame').attr('src', '');
            if (apps.pdfviewer._blobUrl) {
                URL.revokeObjectURL(apps.pdfviewer._blobUrl);
                apps.pdfviewer._blobUrl = null;
            }
            hidewin('pdfviewer');
        }
    },
    codeEditor: {
        editor: null,
        _fileHandle: null,
        _dirty: false,
        _loading: false,
        _wrap: false,
        _fontSize: 15,
        _modeMap: {
            js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
            css: 'css', scss: 'scss', less: 'less',
            html: 'html', htm: 'html', xml: 'xml', svg: 'svg',
            json: 'json', yaml: 'yaml', yml: 'yaml',
            py: 'python', java: 'java', c: 'c_cpp', cpp: 'c_cpp', h: 'c_cpp',
            cs: 'csharp', go: 'golang', rs: 'rust', rb: 'ruby',
            php: 'php', sh: 'sh', bat: 'batchfile', ps1: 'powershell',
            sql: 'sql', md: 'markdown', r: 'r', lua: 'lua', swift: 'swift',
            kt: 'kotlin', dart: 'dart', toml: 'toml', ini: 'ini',
            dockerfile: 'dockerfile', makefile: 'makefile'
        },
        _modeLabelMap: {
            javascript: 'JavaScript', jsx: 'JSX', typescript: 'TypeScript', tsx: 'TSX',
            css: 'CSS', scss: 'SCSS', less: 'Less',
            html: 'HTML', xml: 'XML', svg: 'SVG',
            json: 'JSON', yaml: 'YAML',
            python: 'Python', java: 'Java', c_cpp: 'C/C++',
            csharp: 'C#', golang: 'Go', rust: 'Rust', ruby: 'Ruby',
            php: 'PHP', sh: 'Shell', batchfile: 'Batch', powershell: 'PowerShell',
            sql: 'SQL', markdown: 'Markdown', r: 'R', lua: 'Lua', swift: 'Swift',
            kotlin: 'Kotlin', dart: 'Dart', toml: 'TOML', ini: 'INI',
            text: 'Text'
        },
        init: () => { return null; },
        load: () => {
            ace.require('ace/ext/language_tools');
            var ed = ace.edit('code-ace-editor');
            apps.codeEditor.editor = ed;
            ed.setTheme('ace/theme/vibrant_ink');
            ed.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                showPrintMargin: false,
                enableLiveAutocompletion: true,
                fontSize: 15,
                tabSize: 4,
                useSoftTabs: true,
                scrollPastEnd: 0.5
            });
            ed.commands.addCommand({
                name: 'save', bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
                exec: () => apps.codeEditor.save()
            });
            ed.commands.addCommand({
                name: 'gotoline', bindKey: { win: 'Ctrl-G', mac: 'Command-G' },
                exec: () => {
                    var line = prompt('跳转到行:');
                    if (line) ed.gotoLine(parseInt(line), 0, true);
                }
            });
            ed.on('change', () => {
                if (!apps.codeEditor._dirty && apps.codeEditor._fileHandle && !apps.codeEditor._loading) {
                    apps.codeEditor._dirty = true;
                    var p = $('.window.code-editor>.titbar>p');
                    if (!p.text().startsWith('* ')) p.text('* ' + p.text());
                }
            });
            ed.selection.on('changeCursor', () => apps.codeEditor._updateStatus());
            ed.on('changeSession', () => apps.codeEditor._updateStatus());
        },
        _updateStatus: () => {
            var ed = apps.codeEditor.editor;
            if (!ed) return;
            var cursor = ed.getCursorPosition();
            $('#code-status-cursor').text('行 ' + (cursor.row + 1) + ', 列 ' + (cursor.column + 1));
            var sel = ed.getSelectedText();
            if (sel.length > 0) {
                $('#code-status-cursor').text(
                    '行 ' + (cursor.row + 1) + ', 列 ' + (cursor.column + 1) +
                    ' (已选 ' + sel.length + ' 字符)');
            }
            var modePath = ed.session.getMode().$id || '';
            var modeName = modePath.split('/').pop();
            $('#code-status-lang').text(apps.codeEditor._modeLabelMap[modeName] || modeName || 'Text');
            var tab = ed.session.getUseSoftTabs() ? '空格' : 'Tab';
            $('#code-status-tab').text(tab + ': ' + ed.session.getTabSize());
        },
        open: (text, fileName, fileHandle) => {
            apps.codeEditor._fileHandle = fileHandle || null;
            apps.codeEditor._dirty = false;
            openapp('code-editor');
            if (!apps.codeEditor.editor) {
                shownotice('file-read-error');
                return;
            }
            var ext = fileName.split('.').pop().toLowerCase();
            var mode = apps.codeEditor._modeMap[ext] || 'text';
            apps.codeEditor._loading = true;
            apps.codeEditor.editor.session.setMode('ace/mode/' + mode);
            apps.codeEditor.editor.setValue(text, -1);
            apps.codeEditor._loading = false;
            apps.codeEditor._dirty = false;
            $('.window.code-editor>.titbar>p').text(fileName);
            apps.codeEditor._updateStatus();
        },
        save: async () => {
            if (!apps.codeEditor._fileHandle) return;
            try {
                const writable = await apps.codeEditor._fileHandle.createWritable();
                await writable.write(apps.codeEditor.editor.getValue());
                await writable.close();
                apps.codeEditor._dirty = false;
                var p = $('.window.code-editor>.titbar>p');
                p.text(p.text().replace(/^\* /, ''));
                p.css('opacity', '0.5');
                setTimeout(() => p.css('opacity', ''), 300);
            } catch (e) {
                shownotice('file-write-error');
            }
        },
        setTheme: (theme) => {
            if (apps.codeEditor.editor) apps.codeEditor.editor.setTheme(theme);
        },
        toggleWrap: () => {
            apps.codeEditor._wrap = !apps.codeEditor._wrap;
            if (apps.codeEditor.editor)
                apps.codeEditor.editor.session.setUseWrapMode(apps.codeEditor._wrap);
            $('#code-wrap-btn').toggleClass('active', apps.codeEditor._wrap);
        },
        changeFontSize: (delta) => {
            apps.codeEditor._fontSize = Math.max(10, Math.min(30, apps.codeEditor._fontSize + delta));
            if (apps.codeEditor.editor)
                apps.codeEditor.editor.setFontSize(apps.codeEditor._fontSize);
        },
        close: () => {
            if (apps.codeEditor._dirty && apps.codeEditor._fileHandle) {
                shownotice('unsaved-code-editor');
                return;
            }
            apps.codeEditor._forceClose();
        },
        _forceClose: () => {
            apps.codeEditor._dirty = false;
            apps.codeEditor._fileHandle = null;
            hidewin('code-editor');
        }
    },
    pythonEditor: {
        editor: null,
        init: () => {
            return null;
        },
        run: () => {
            let result;
            let output = document.getElementById('output');
            try {
                if (apps.python.pyodide) {
                    let code = apps.pythonEditor.editor.getValue();
                    apps.python.pyodide.runPython('sys.stdout = io.StringIO()');
                    apps.python.pyodide.runPython(code);
                    result = apps.python.pyodide.runPython('sys.stdout.getvalue()');
                }
            }
            catch (e) {
                result = e.message;
            }
            output.innerHTML = result;
        },
        load: () => {
            if (!apps.python.loaded) {
                apps.python.loaded = true;
                apps.python.load();
            }
            ace.require('ace/ext/language_tools');
            apps.pythonEditor.editor = ace.edit('win-python-ace-editor');
            apps.pythonEditor.editor.session.setMode('ace/mode/python');
            apps.pythonEditor.editor.setTheme('ace/theme/vibrant_ink');
            apps.pythonEditor.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                showPrintMargin: false,
                enableLiveAutocompletion: true
            });
        }
    },
    notepadFonts: {
        sizes: {
            '初号': '56',
            '小初': '48',
            '一号': '34.7',
            '小一': '32',
            '二号': '29.3',
            '小二': '24',
            '三号': '21.3',
            '小三': '20',
            '四号': '18.7',
            '小四': '16',
            '五号': '14',
            '小五': '12'
        },
        styles: {
            '正常': '',
            '粗体': 'font-weight: bold;',
            '斜体': 'font-style: italic;',
            '粗偏斜体': 'font-weight: bold; font-style: italic;'
        },
        load: () => {
            apps.notepadFonts.fontvalues = $('#win-notepad-font>.row>#win-notepad-font-type>.value-box>.option');
            apps.notepadFonts.sizevalues = $('#win-notepad-font>.row>#win-notepad-font-size>.value-box>.option');
            apps.notepadFonts.stylevalues = $('#win-notepad-font>.row>#win-notepad-font-style>.value-box>.option');
            apps.notepadFonts.typeinput = $('#win-notepad-font>.row>#win-notepad-font-type>input[type=text]')[0];
            apps.notepadFonts.sizeinput = $('#win-notepad-font>.row>#win-notepad-font-size>input[type=text]')[0];
            apps.notepadFonts.styleinput = $('#win-notepad-font>.row>#win-notepad-font-style>input[type=text]')[0];
            apps.notepadFonts.previewBox = $('#win-notepad-font>.preview>.preview-box');
            apps.notepadFonts.textBox = $('.notepad>#win-notepad>.text-box');

            for (const elt of apps.notepadFonts.fontvalues) {
                elt.onclick = function () {
                    apps.notepadFonts.typeinput.value = this.innerText;
                    apps.notepadFonts.preview();
                };
                elt.setAttribute('style', `font-family: ${elt.innerText};`);
            }

            for (const elt of apps.notepadFonts.sizevalues) {
                elt.onclick = function () {
                    apps.notepadFonts.sizeinput.value = this.innerText;
                    apps.notepadFonts.preview();
                };
            }

            for (const elt of apps.notepadFonts.stylevalues) {
                elt.onclick = function () {
                    apps.notepadFonts.styleinput.value = this.innerText;
                    apps.notepadFonts.preview();
                };
                elt.setAttribute('style', apps.notepadFonts.styles[elt.innerText]);
            }

            apps.notepadFonts.sizeinput.addEventListener('keyup', apps.notepadFonts.preview);
            apps.notepadFonts.typeinput.addEventListener('keyup', apps.notepadFonts.preview);
        },
        preview: () => {
            var fontsize = 0;
            var fontstyle;
            if (!apps.notepadFonts.sizeinput.value.match(/^[0-9]*$/)) {
                if (apps.notepadFonts.sizes[apps.notepadFonts.sizeinput.value] != undefined) {
                    fontsize = apps.notepadFonts.sizes[apps.notepadFonts.sizeinput.value];
                }
            }
            else if (apps.notepadFonts.sizeinput.value.match(/^[0-9]*$/)) {
                fontsize = apps.notepadFonts.sizeinput.value;
            }
            if (apps.notepadFonts.styles[apps.notepadFonts.styleinput.value] != undefined) {
                fontstyle = apps.notepadFonts.styles[apps.notepadFonts.styleinput.value];
            }
            else if (apps.notepadFonts.styles[apps.notepadFonts.styleinput.value] == undefined) {
                fontstyle = apps.notepadFonts.styles['正常'];
            }
            apps.notepadFonts.previewBox.attr('style', `font-family: ${apps.notepadFonts.typeinput.value} !important; font-size: ${fontsize}px !important;${fontstyle}`);
        },
        commitFont: () => {
            const styles = window.getComputedStyle(apps.notepadFonts.previewBox[0], null);
            apps.notepadFonts.textBox.attr('style', `font-family: ${styles.fontFamily} !important; font-size: ${styles.fontSize} !important; font-weight: ${styles.fontWeight} !important; font-style: ${styles.fontStyle} !important;`);
            hidewin('notepad-fonts', 'configs');
        },
        reset: () => {
            const styles = window.getComputedStyle(apps.notepadFonts.textBox[0], null);
            apps.notepadFonts.typeinput.value = styles.fontFamily.split(', ')[0];
            var fontsize = styles.fontSize.split('px')[0];
            var fontweight = styles.fontWeight;
            var fontstyle = styles.fontStyle;
            if (fontweight == '700' && fontstyle == 'normal') {
                apps.notepadFonts.styleinput.value = '粗体';
            }
            else if (fontweight == '400' && fontstyle == 'italic') {
                apps.notepadFonts.styleinput = '斜体';
            }
            else if (fontweight == '700' && fontstyle == 'italic') {
                apps.notepadFonts.styleinput.value = '粗偏斜体';
            }
            else if (fontweight == '400' && fontstyle == 'normal') {
                apps.notepadFonts.styleinput.value = '正常';
            }
            for (const [key, value] of Object.entries(apps.notepadFonts.sizes)) {
                if (value == fontsize) {
                    fontsize = key;
                    break;
                }
            }
            apps.notepadFonts.sizeinput.value = fontsize;
        },
    },
    python: {
        codeCache: '',
        prompt: '>>> ',
        indent: false,
        load: () => {
            (async function () {
                apps.python.pyodide = await loadPyodide();
                apps.python.pyodide.runPython(`
import sys
import io
`);
            })();
        },
        init: () => {
            $('#win-python').html(`
        <pre>
Python 3.10.2  [MSC v.1912 64 bit (AMD64)] :: Anaconda, Inc. on win32
Type "help", "copyright", "credits" or "license" for more information.
        </pre>
        <pre class="text-cmd"></pre>
        <pre style="display: flex;"><span class='prompt'>>>> </span><input type="text" onkeyup="if (event.keyCode == 13) { apps.python.run(); }"></pre>`);
        },
        run: () => {
            if (apps.python.pyodide) {
                const input = $('#win-python>pre>input');
                const _code = input.val();
                if (_code == 'exit()') {
                    hidewin('python');
                    input.val('');
                }
                else {
                    const elt = $('#win-python>pre.text-cmd')[0];
                    const lastChar = _code[_code.length - 1];
                    var newD = document.createElement('div');
                    newD.innerText = `${apps.python.prompt}${_code}`;
                    elt.appendChild(newD);
                    if (lastChar != ':' && lastChar != '\\' && ((!apps.python.indent || _code == ''))) {
                        apps.python.prompt = '>>> ';
                        apps.python.codeCache += _code;
                        apps.python.indent = false;
                        const code = apps.python.codeCache;
                        apps.python.codeCache = '';
                        apps.python.pyodide.runPython('sys.stdout = io.StringIO()');
                        try {
                            const result = String(apps.python.pyodide.runPython(code));
                            if (apps.python.pyodide.runPython('sys.stdout.getvalue()')) {
                                var newD = document.createElement('div');
                                newD.innerText = `${apps.python.pyodide.runPython('sys.stdout.getvalue()')}`;
                                elt.appendChild(newD);
                            }
                            if (result && result != 'undefined') {
                                var newD = document.createElement('div');
                                if (result == 'false') {
                                    newD.innerText = 'False';
                                }
                                else if (result == 'true') {
                                    newD.innerText = 'True';
                                }
                                else {
                                    newD.innerText = result;
                                }
                                elt.appendChild(newD);
                            }
                        }
                        catch (err) {
                            var newD = document.createElement('div');
                            newD.innerText = `${err.message}`;
                            elt.appendChild(newD);
                        }
                    }
                    else {
                        apps.python.prompt = '... ';
                        if (lastChar == ':') {
                            apps.python.indent = true;
                        }
                        apps.python.codeCache += _code + '\n';
                    }
                    input.val('');

                    // 自动聚焦
                    input.blur();
                    input.focus();

                    $('#win-python .prompt')[0].innerText = apps.python.prompt;
                }
            }
        }
    },
    terminal: {
        historyList: [],
        historypt: 0,
        historyTemp: '',
        isViewingHistory: false,
        init: () => {
            $('#win-terminal').html(`<pre>
Micrȯsoft Windows [版本 12.0.39035.7324]
(c) Microṡoft Corporation。保留所有杈利。
        </pre>
        <pre class="text-cmd"></pre>
        <pre style="display: flex"><span class="prompt">C:\\Windows\\System32> </span><input type="text" onkeyup="apps.terminal.handleKeyUp(event)"></pre>`);
            $('#win-terminal>pre>input').focus();
        },
        handleKeyUp: (event) => {
            const input = $('#win-terminal input');
            if (event.keyCode === 13) { // Enter
                apps.terminal.run();
            } else if (event.keyCode === 38) { // Up arrow
                apps.terminal.history('up');
            } else if (event.keyCode === 40) { // Down arrow
                apps.terminal.history('down');
            }
        },
        run: () => {
            const elt = $('#win-terminal>pre.text-cmd')[0];
            const input = $('#win-terminal input');
            const command = input.val().trim();
            
            if (command !== '') {
                // Add command to history
                apps.terminal.historyList.push(command);
                apps.terminal.historypt = apps.terminal.historyList.length;
                
                var newD = document.createElement('div');
                newD.innerText = `C:\\Windows\\System32> ${command}`;
                elt.appendChild(newD);
                
                if (command === 'exit') {
                    hidewin('terminal');
                } else if (!runcmd(command, true)) {
                    var newD = document.createElement('div');
                    newD.innerText = `"${command}" 不是内部或外部命令,也不是可运行程序或批处理文件`;
                    elt.appendChild(newD);
                }
            }
            
            input.val('');
            input.blur();
            input.focus();
        },
        history: (direction) => {
            const input = $('#win-terminal input');
            
            if (!apps.terminal.isViewingHistory) {
                apps.terminal.isViewingHistory = true;
                apps.terminal.historyTemp = input.val();
            }
            
            if (direction === 'up' && apps.terminal.historypt > 0) {
                apps.terminal.historypt--;
                input.val(apps.terminal.historyList[apps.terminal.historypt]);
            } else if (direction === 'down') {
                apps.terminal.historypt++;
                if (apps.terminal.historypt >= apps.terminal.historyList.length) {
                    apps.terminal.historypt = apps.terminal.historyList.length;
                    apps.terminal.isViewingHistory = false;
                    input.val(apps.terminal.historyTemp);
                } else {
                    input.val(apps.terminal.historyList[apps.terminal.historypt]);
                }
            }
        }
    },
    search: {
        rand: [{ name: '农夫山泉瓶盖简介.txt', bi: 'text', ty: '文本文档' },
            { name: '瓶盖构造图.png', bi: 'image', ty: 'PNG 文件' },
            { name: '瓶盖结构说明.docx', bi: 'richtext', ty: 'Microsoft Word 文档' },
            { name: '可口可乐瓶盖.jpg', bi: 'image', ty: 'JPG 文件' },
            { name: '可口可乐瓶盖历史.pptx', bi: 'slides', ty: 'Microsoft Powerpoint 演示文稿' },
            { name: '瓶盖质量统计分析.xlsx', bi: 'ruled', ty: 'Microsoft Excel 工作表' },
            { name: '农夫山泉瓶盖.svg', bi: 'image', ty: 'SVG 文件' },
            { name: '瓶盖介绍.doc', bi: 'richtext', ty: 'Microsoft Word 文档' }],
        search: le => {
            if (le > 0) {
                $('#search-win>.ans>.list>list').html(
                    `<a class="a" onclick="apps.search.showdetail(${le % 8})"><i class="bi bi-file-earmark-${apps.search.rand[le % 8].bi}"></i> ${apps.search.rand[le % 8].name
                    }</a><a class="a" onclick="apps.search.showdetail(${(le + 3) % 8})"><i class="bi bi-file-earmark-${apps.search.rand[(le + 3) % 8].bi}"></i> ${apps.search.rand[(le + 3) % 8].name}</a>`);
                apps.search.showdetail(le % 8);
            } else {
                $('#search-win>.ans>.list>list').html(
                    `<p class="text">推荐</p>
					<a onclick="openapp('setting');$('#search-btn').removeClass('show');
					$('#search-win').removeClass('show');
					setTimeout(() => {
						$('#search-win').removeClass('show-begin');
					}, 200);">
						<img src="icon/setting.svg"><p>设置</p></a>
					<a onclick="openapp('about');$('#search-btn').removeClass('show');
					$('#search-win').removeClass('show');
					setTimeout(() => {
						$('#search-win').removeClass('show-begin');
					}, 200);">
						<img src="icon/about.svg"><p>关于Win12网页版</p></a>`);
                $('#search-win>.ans>.view').removeClass('show');
            }
        },
        showdetail: i => {
            $('#search-win>.ans>.view').addClass('show');
            let inf = apps.search.rand[i];
            $('#search-win>.ans>.view>.fname>.bi').attr('class', 'bi bi-file-earmark-' + inf.bi);
            $('#search-win>.ans>.view>.fname>.name').text(inf.name);
            $('#search-win>.ans>.view>.fname>.type').text(inf.ty);
        }
    },
    edge: {
        init: () => {
            $('#win-edge>iframe').remove();
            apps.edge.tabs = [];
            apps.edge.len = 0;
            apps.edge.newtab();
        },
        tabs: [],
        now: null,
        len: 0,
        history: [],
        historypt: [],
        reloadElt: '<loading class="reloading"><svg viewBox="0 0 16 16"><circle cx="8px" cy="8px" r="5px"></circle><circle cx="8px" cy="8px" r="5px"></circle></svg></loading>',
        max: false,
        fuls: false,
        b1: false, b2: false, b3: false,
        newtab: () => {
            m_tab.newtab('edge', '新建标签页');
            apps.edge.initHistory(apps.edge.tabs[apps.edge.tabs.length - 1][0]);
            apps.edge.pushHistory(apps.edge.tabs[apps.edge.tabs.length - 1][0], 'mainpage.html');
            $('#win-edge').append(`<iframe src="mainpage.html" frameborder="0" class="${apps.edge.tabs[apps.edge.tabs.length - 1][0]}">`);
            $('#win-edge>.tool>input.url').focus();
            $('#win-edge>iframe')[apps.edge.tabs.length - 1].onload = function () {
                this.contentDocument.querySelector('input').onkeyup = function (e) {
                    if (e.keyCode == 13 && $(this).val() != '') {
                        apps.edge.goto($(this).val());
                    }
                };
                this.contentDocument.querySelector('svg').onclick = () => {
                    if ($(this.contentDocument.querySelector('input')).val() != '') {
                        apps.edge.goto($(this.contentDocument.querySelector('input')).val());
                    }
                };
            };
            m_tab.tab('edge', apps.edge.tabs.length - 1);
            apps.edge.checkHistory(apps.edge.tabs[apps.edge.now][0]);
        },
        fullscreen: () => {
            if (!apps.edge.max) {
                maxwin('edge');
                apps.edge.max = !apps.edge.max;
            }
            document.getElementById('fuls-edge').style.display = 'none';
            document.getElementById('edge-max').style.display = 'none';
            document.getElementById('fuls-edge-exit').style.display = '';
            document.getElementById('over-bar').style.display = '';
            $('.edge>.titbar').hide();
            $('.edge>.content>.tool').hide();
            apps.edge.fuls = !apps.edge.fuls;
        },
        exitfullscreen: () => {
            if (apps.edge.max) {
                maxwin('edge'); apps.edge.max = !apps.edge.max;
            }
            document.getElementById('fuls-edge').style.display = '';
            document.getElementById('edge-max').style.display = '';
            document.getElementById('fuls-edge-exit').style.display = 'none';
            document.getElementById('over-bar').style.display = 'none';
            $('.edge>.titbar').show();
            $('.edge>.content>.tool').show();
            apps.edge.fuls = !apps.edge.fuls;
        },
        in_div(id,event) {
            var div = document.getElementById(id);
            var x = event.clientX;
            var y = event.clientY;
            var divx1 = div.offsetLeft;
            var divy1 = div.offsetTop;
            var divx2 = div.offsetLeft + div.offsetWidth;
            var divy2 = div.offsetTop + div.offsetHeight;
            if (x < divx1 || x > divx2 || y < divy1 || y > divy2) {
                //如果离开，则执行。。 
                return false;
            }
            else {
                //如检播到，则执行。。 
                return true;
            }
        },
        settab: (t, i) => {
            if ($('.window.edge>.titbar>.tabs>.tab.' + t[0] + '>.reloading')[0]) {
                return `<div class="tab ${t[0]}" onclick="m_tab.tab('edge',${i})" oncontextmenu="showcm(event,'edge.tab',${i});stop(event);return false" onmousedown="m_tab.moving('edge',this,event,${i});stop(event);disableIframes();" ontouchstart="m_tab.moving('edge',this,event,${i});stop(event);disableIframes();">${apps.edge.reloadElt}<p>${t[1]}</p><span class="clbtn bi bi-x" onclick="m_tab.close('edge',${i})"></span></div>`;
            }
            else {
                return `<div class="tab ${t[0]}" onclick="m_tab.tab('edge',${i})" oncontextmenu="showcm(event,'edge.tab',${i});stop(event);return false" onmousedown="m_tab.moving('edge',this,event,${i});stop(event);disableIframes();" ontouchstart="m_tab.moving('edge',this,event,${i});stop(event);disableIframes();"><p>${t[1]}</p><span class="clbtn bi bi-x" onclick="m_tab.close('edge',${i})"></span></div>`;
            }
        },
        tab: (c) => {
            $('#win-edge>iframe.show').removeClass('show');
            $('#win-edge>iframe.' + apps.edge.tabs[c][0]).addClass('show');
            $('#win-edge>.tool>input.url').val($('#win-edge>iframe.' + apps.edge.tabs[c][0]).attr('src') == 'mainpage.html' ? '' : $('#win-edge>iframe.' + apps.edge.tabs[c][0]).attr('src'));
            $('#win-edge>.tool>input.rename').removeClass('show');
            apps.edge.checkHistory(apps.edge.tabs[apps.edge.now][0]);
        },
        c_rename: (c) => {
            m_tab.tab('edge', c);
            $('#win-edge>.tool>input.rename').val(apps.edge.tabs[apps.edge.now][1]);
            $('#win-edge>.tool>input.rename').addClass('show');
            setTimeout(() => {
                $('#win-edge>.tool>input.rename').focus();
            }, 300);
        },
        reload: () => {
            if (wifiStatus == false) {
                $('#win-edge>iframe.show').attr('src', 'data/disconnected' + (isDark ? '_dark' : '') + '.html');
            }
            else {
                $('#win-edge>iframe.show').attr('src', $('#win-edge>iframe.show').attr('src'));
                if (!$('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0] + '>.reloading')[0]) {
                    $('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0])[0].insertAdjacentHTML('afterbegin', apps.edge.reloadElt);
                    $('#win-edge>iframe.' + apps.edge.tabs[apps.edge.now][0])[0].onload = function () {
                        $('.window.edge>.titbar>.tabs>.tab.' + this.classList[0])[0].removeChild($('.window.edge>.titbar>.tabs>.tab.' + this.classList[0] + '>.reloading')[0]);
                    };
                }
            }
        },
        getTitle: async (url, np) => {
            const response = await fetch(server + pages['get-title'] + `?url=${url}`);
            if (response.ok == true) {
                const text = await response.text();
                apps.edge.tabs[np][1] = text;
                m_tab.settabs('edge');
                m_tab.tab('edge', np);
            }
        },
        goto: (u, clear = true) => {
            if (wifiStatus == false) {
                m_tab.rename('edge', u);
                $('#win-edge>iframe.show').attr('src', '.data/disconnected' + (isDark ? '_dark' : '') + '.html');
                $('#win-edge>.tool>input.url').val(u);
            }
            else {
                // 6
                if (!/^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/.test(u) && !u.match(/^mainpage.html$/)) {
                    // 启用必应搜索
                    $('#win-edge>iframe.show').attr('src', 'https://bing.com/search?q=' + encodeURIComponent(u));
                    m_tab.rename('edge', u);
                }
                // 检测网址是否带有http头
                else if (!/^https?:\/\//.test(u) && !u.match(/^mainpage.html$/)) {
                    $('#win-edge>iframe.show').attr('src', 'http://' + u);
                    m_tab.rename('edge', 'http://' + u);
                }
                else {
                    $('#win-edge>iframe.show').attr('src', u);
                    m_tab.rename('edge', u.match(/^mainpage.html$/) ? '新建标签页' : u);
                }
                if (!$('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0] + '>.reloading')[0]) {
                    $('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0])[0].insertAdjacentHTML('afterbegin', apps.edge.reloadElt);
                }
                $('#win-edge>iframe.' + apps.edge.tabs[apps.edge.now][0])[0].onload = function () {
                    $('.window.edge>.titbar>.tabs>.tab.' + this.classList[0])[0].removeChild($('.window.edge>.titbar>.tabs>.tab.' + this.classList[0] + '>.reloading')[0]);
                };
                apps.edge.getTitle($('#win-edge>iframe.show').attr('src'), apps.edge.now);
                if (clear) {
                    apps.edge.delHistory(apps.edge.tabs[apps.edge.now][0]);
                    apps.edge.pushHistory(apps.edge.tabs[apps.edge.now][0], $('#win-edge>iframe.show').attr('src'));
                }
                apps.edge.checkHistory(apps.edge.tabs[apps.edge.now][0]);
            }

        },
        initHistory: (tab) => {
            apps.edge.history[tab] = [];
            apps.edge.historypt[tab] = -1;
        },
        pushHistory: (tab, u) => {
            apps.edge.history[tab].push(u);
            apps.edge.historypt[tab]++;
        },
        topHistory: (tab) => {
            return apps.edge.history[tab][apps.edge.historypt[tab]];
        },
        popHistory: (tab) => {
            apps.edge.historypt[tab]--;
            return apps.edge.history[tab][apps.edge.historypt[tab]];
        },
        incHistory: (tab) => {
            apps.edge.historypt[tab]++;
            return apps.edge.history[tab][apps.edge.historypt[tab]];
        },
        delHistory: (tab) => {
            apps.edge.history[tab].splice(apps.edge.historypt[tab] + 1, apps.edge.history[tab].length - 1 - apps.edge.historypt[tab]);
        },
        historyIsEmpty: (tab) => {
            return apps.edge.historypt[tab] <= 0;
        },
        historyIsFull: (tab) => {
            return apps.edge.historypt[tab] >= apps.edge.history[tab].length - 1;
        },
        checkHistory: (tab) => {
            if (apps.edge.historyIsEmpty(tab)) {
                $('#win-edge>.tool>.back').addClass('disabled');
            }
            else if (!apps.edge.historyIsEmpty(tab)) {
                $('#win-edge>.tool>.back').removeClass('disabled');
            }
            if (apps.edge.historyIsFull(tab)) {
                $('#win-edge>.tool>.front').addClass('disabled');
            }
            else if (!apps.edge.historyIsFull(tab)) {
                $('#win-edge>.tool>.front').removeClass('disabled');
            }
        },
        back: (tab) => {
            apps.edge.goto(apps.edge.popHistory(tab), false);
            apps.edge.checkHistory(tab);
        },
        front: (tab) => {
            apps.edge.goto(apps.edge.incHistory(tab), false);
            apps.edge.checkHistory(tab);
        }
    },
    winver: {
        init: () => {
            $('#win-winver>.mesg').show();
        },
    },
    windows12: {
        init: () => {
            document.getElementById('win12-window').src = './boot.html';
        }
    },
    wsa: {
        init: () => {
            null;
        }
    },
    word: {
        init: () => {
            $('#win-word>.app-left>.focs>.home').css("display", "flex");
            $('#win-word>.app-left>.focs>.back').css("display", "none");
            $('.window.word>.pages>.edit').removeClass('show');
            $('.window.word>.pages>.home').addClass('show');
            $(`.window.word>.pages>.edit>.content`).empty();
            $(`.window.word>.pages>.edit>.content`).append(`<div class="doc homepage" contenteditable></div>`);
        },
        edit: () => {
            $('.window.word>.pages>.home').removeClass('show');
            $('.window.word>.pages>.edit').addClass('show');
        },
        home: () => {
            $('#win-word>.app-left>.focs>.home').css("display", "none");
            $('#win-word>.app-left>.focs>.back').css("display", "flex");
            $('.window.word>.pages>.edit').removeClass('show');
            $('.window.word>.pages>.home').addClass('show');
        },
        new: () => {
            $(`.window.word>.pages>.edit>.content`).empty();
            $(`.window.word>.pages>.edit>.content`).append(`<div class="doc homepage" contenteditable></div>`);
            $('.window.word>.pages>.home').removeClass('show');
            $('.window.word>.pages>.edit').addClass('show');
        },
    }
};
