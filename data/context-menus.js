/* 由 desktop.js 抽出的纯数据表。
 * 右键菜单注册表 cms。
 * 注意：值里用了 ${lang(...)}，求值即执行，必须在 desktop.js **之后**加载。
 */
const cms = {
    'save-bar': [
        arg => {
            return ['<i class="bi bi-window-x"></i> 移除', `removeEdgeSaveUrl('${arg}')`];
        }
    ],
    'titbar': [
        arg => {
            if (arg in nomax) {
                return 'null';
            }
            if ($('.window.' + arg).hasClass('max')) {
                return ['<i class="bi bi-window-stack"></i> ' + lang('还原', 'window.restore'), `maxwin('${arg}')`];
            }
            else {
                return ['<i class="bi bi-window-fullscreen"></i> ' + lang('最大化', 'window.max'), `maxwin('${arg}')`];
            }
        },
        arg => {
            if (arg in nomin) {
                return 'null';
            }
            else {
                return ['<i class="bi bi-window-dash"></i> ' + lang('最小化', 'window.min'), `minwin('${arg}')`];
            }
        },
        arg => {
            if (arg in nomin) {
                return ['<i class="bi bi-window-x"></i> ' + lang('关闭', 'close'), `hidewin('${arg}', 'configs')`];
            }
            else {
                return ['<i class="bi bi-window-x"></i> ' + lang('关闭', 'close'), `hidewin('${arg}')`];
            }
        },
    ],
    'taskbar': [
        arg => {
            return ['<i class="bi bi-window-x"></i> ' + lang('关闭', 'close'), `hidewin('${arg}')`];
        }
    ],
    'desktop': [
        [`<i class="bi bi-arrow-clockwise"></i> ${lang('刷新', 'refresh')} <info>F5</info>`, '$(\'#desktop\').css(\'opacity\',\'0\');setTimeout(()=>{$(\'#desktop\').css(\'opacity\',\'1\');},100);setIcon();'],
        ['<i class="bi bi-circle-square"></i> ' + lang('切换主题', 'desktop.tgltheme'), 'toggletheme()'],
        `<a onmousedown="window.open(\'https://github.com/win12-online/win12\',\'_blank\');" win12_title="https://github.com/win12-online/win12" onmouseenter="showdescp(event)" onmouseleave="hidedescp(event)"><i class="bi bi-github"></i> ${lang('在 Github 中查看此项目', 'desktop.vogithub')}</a>`,
        arg => {
            if (edit_mode) {
                return ['<i class="bi bi-pencil"></i> ' + lang('退出编辑模式', 'desktop.exitedit'), 'editMode();'];
            }
            else if (!edit_mode) {
                return ['<i class="bi bi-pencil"></i> ' + lang('进入编辑模式', 'desktop.enteredit'), 'editMode();'];
            }
        },
        ['<i class="bi bi-info-circle"></i> ' + getAboutAppTitle(), 'openapp(\'about\');'],
        ['<i class="bi bi-brush"></i> ' + lang('个性化', 'psnl'), 'openapp(\'setting\');$(\'#win-setting > div.menu > list > a.enable.appearance\')[0].click()']
    ],
    'desktop.icon': [
        arg => {
            return ['<i class="bi bi-folder2-open"></i> ' + lang('打开', 'open'), 'openapp(`' + arg[0] + '`)'];
        },
        arg => {
            if (arg[1] >= 0) {
                return ['<i class="bi bi-trash3"></i> ' + lang('删除', 'del'), 'desktopItem.splice(' + (arg[1]) + ', 1);saveDesktop();setIcon();addMenu();'];
            } else {
                return 'null';
            }
        }
    ],
    'winx': [
        arg => {
            if ($('#start-menu').hasClass('show')) {
                return ['<i class="bi bi-box-arrow-in-down"></i> 关闭开始菜单', 'hide_startmenu()'];
            }
            else {
                return ['<i class="bi bi-box-arrow-in-up"></i> 打开开始菜单', `$('#start-btn').addClass('show');
                if($('#search-win').hasClass('show')){$('#search-btn').removeClass('show');
                $('#search-win').removeClass('show');setTimeout(() => {$('#search-win').removeClass('show-begin');
                }, 200);}$('#start-menu').addClass('show-begin');setTimeout(() => {$('#start-menu').addClass('show');
                }, 0);`];
            }
        },
        '<hr>',
        ['<i class="bi bi-gear"></i> ' + lang('设置', 'setting.name'), 'openapp(\'setting\')'],
        ['<i class="bi bi-terminal"></i> ' + lang('运行', 'run.name'), 'openapp(\'run\')'],
        ['<i class="bi bi-folder2-open"></i> ' + lang('文件资源管理器', 'explorer.name'), 'openapp(\'explorer\')'],
        ['<i class="bi bi-search"></i> 搜索', `$('#search-btn').addClass('show');hide_startmenu();
        $('#search-win').addClass('show-begin');setTimeout(() => {$('#search-win').addClass('show');
        $('#search-input').focus();},200);`],
        '<hr>',
        ['<i class="bi bi-power"></i> 关机', 'window.location=\'shutdown.html\''],
        ['<i class="bi bi-arrow-counterclockwise"></i> 重启', 'window.location=\'reload.html\''],
    ],
    'smapp': [
        arg => {
            return ['<i class="bi bi-window"></i> ' + lang('打开', 'open'), `openapp('${arg[0]}');hide_startmenu();`];
        },
        arg => {
            return ['<i class="bi bi-link-45deg"></i> 在桌面创建链接', 'var s=`<div class=\'b\' ondblclick=openapp(\'' + arg[0] + '\')  ontouchstart=openapp(\'' + arg[0] + '\') appname=\'' + arg[0] + '\'><img src=\'icon/' + geticon(arg[0]) + '\'><p>' + arg[1] + '</p></div>`;$(\'#desktop\').append(s);desktopItem[desktopItem.length]=s;addMenu();saveDesktop();'];
        },
        arg => {
            return ['<i class="bi bi-x"></i> 取消固定', `$('#startmenu-r>.pinned>.apps>.sm-app.${arg[0]}').remove()`];
        }
    ],
    'smlapp': [
        arg => {
            return ['<i class="bi bi-window"></i> ' + lang('打开', 'open'), `openapp('${arg[0]}');hide_startmenu();`];
        },
        arg => {
            return ['<i class="bi bi-link-45deg"></i> 在桌面创建链接', 'var s=`<div class=\'b\' ondblclick=openapp(\'' + arg[0] + '\')  ontouchstart=openapp(\'' + arg[0] + '\') appname=\'' + arg[0] + '\'><img src=\'icon/' + geticon(arg[0]) + '\'><p>' + arg[1] + '</p></div>`;$(\'#desktop\').append(s);desktopItem[desktopItem.length]=s;addMenu();saveDesktop();'];
        },
        arg => {
            return ['<i class="bi bi-pin-angle"></i> 固定到开始菜单', 'pinapp(\'' + arg[0] + '\', \'' + arg[1] + '\', \'openapp(&quot;' + arg[0] + '&quot;);hide_startmenu();\')'];
        }
    ],
    'msgupdate': [
        ['<i class="bi bi-layout-text-window-reverse"></i> 查看详细', `openapp('about');if($('.window.about').hasClass('min'))
        minwin('about');apps.about.page('update');
        $('#win-about>.update.show>div>details:first-child').attr('open','open')`],
        ['<i class="bi bi-box-arrow-right"></i> 关闭', '$(\'.msg.update\').removeClass(\'show\')']
    ],
    'explorer.folder': [
        arg => {
            return ['<i class="bi bi-folder2-open"></i> ' + lang('打开', 'open'), `apps.explorer.goto('${arg}')`];
        },
        arg => {
            return ['<i class="bi bi-arrow-up-right-square"></i> 在新标签页中打开', `apps.explorer.newtab('${arg}');`];
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-trash3"></i> ' + lang('删除', 'del'), `apps.explorer.del('${arg}')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-files"></i> 复制', `apps.explorer.copy_or_cut('${arg}','copy')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-scissors"></i> 剪切', `apps.explorer.copy_or_cut('${arg}','cut')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-input-cursor-text"></i> 重命名', `apps.explorer.rename('${arg}')`];
            return 'null';
        }
    ],
    'explorer.file': [
        arg => {
            const drive = arg.split('/')[0];
            if (apps.explorer.mounts[drive])
                return ['<i class="bi bi-folder2-open"></i> ' + lang('打开','open'), `apps.explorer.openMountedFile('${arg}')`];
            // Find the file's command from virtual FS
            var pathl = arg.split('/'), fileName = pathl.pop();
            var tmp = apps.explorer.path;
            pathl.forEach(n => { if (tmp && tmp.folder) tmp = tmp.folder[n]; });
            var fileCmd = '';
            if (tmp && tmp.file) {
                var f = tmp.file.find(f => f.name === fileName);
                if (f && f.command) fileCmd = f.command;
            }
            if (fileCmd)
                return ['<i class="bi bi-folder2-open"></i> ' + lang('打开','open'), fileCmd];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-trash3"></i> ' + lang('删除', 'del'), `apps.explorer.del('${arg}')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text')[0].innerHTML != '此电脑')
                return ['<i class="bi bi-files"></i> 复制', `apps.explorer.copy_or_cut('${arg}','copy')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-scissors"></i> 剪切', `apps.explorer.copy_or_cut('${arg}','cut')`];
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-input-cursor-text"></i> 重命名', `apps.explorer.rename('${arg}')`];
            return 'null';
        }
    ],
    'explorer.content': [
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-file-earmark-plus"></i> 新建文件', 'apps.explorer.add($(\'#win-explorer>.path>.tit\')[0].dataset.path,\'新建文本文档.txt\')'];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-folder-plus"></i> 新建文件夹', 'apps.explorer.add($(\'#win-explorer>.path>.tit\')[0].dataset.path,\'新建文件夹\',type=\'files\')'];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-file-earmark-arrow-down"></i> 粘贴', 'apps.explorer.paste($(\'#win-explorer>.path>.tit\')[0].dataset.path,\'新建文件夹\',type=\'files\')'];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-arrow-clockwise"></i> 刷新', 'apps.explorer.goto($(\'#win-explorer>.path>.tit\')[0].dataset.path, false)'];
            return ['<i class="bi bi-arrow-clockwise"></i> 刷新', 'apps.explorer.reset()'];
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length <= 1 && apps.explorer.fsApiSupported)
                return ['<i class="bi bi-usb-drive"></i> 挂载本地文件夹', 'apps.explorer.mountDrive()'];
            return 'null';
        }
    ],
    'explorer.mounted': [
        arg => ['<i class="bi bi-folder2-open"></i> 打开', `apps.explorer.goto('${arg}')`],
        arg => ['<i class="bi bi-eject"></i> 卸载', `apps.explorer.unmountDrive('${arg}')`]
    ],
    'explorer.tab': [
        arg => {
            return ['<i class="bi bi-x"></i> 关闭标签页', `m_tab.close('explorer',${arg})`];
        }
    ],
    'edge.tab': [
        arg => {
            return ['<i class="bi bi-pencil-square"></i> 命名标签页', `apps.edge.c_rename(${arg})`];
        },
        arg => {
            return ['<i class="bi bi-x"></i> 关闭标签页', `m_tab.close('edge',${arg})`];
        }
    ],
    'taskmgr.processes': [
        arg => {
            return ['<i class="bi bi-x"></i> 结束任务', `apps.taskmgr.taskkill('${arg}')`];
        }
    ]
};
