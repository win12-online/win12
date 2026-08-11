/* 终端与运行对话框的命令解释器。从 desktop.js 抽出。
 * 四个彩蛋（matrix/snow/dance/starwars）在 scripts/terminal-eggs.js。
 * 依赖（均在运行时解析，不在解析期）：lang / openapp / apps / shownotice /
 * run_cmd / shutdown_task / terminalEggs / jQuery。
 */
'use strict';
// 运行的指令
function runcmd(cmd, inTerminal = false) {
    var cmds = cmd.split(' ');
    var commandName = cmds[0].toLowerCase();

    if (cmd.slice(0, 3) == 'cmd') {
        run_cmd = cmd;
        if (!inTerminal) {
            openapp('terminal');
        }
        return true;
    }
    else if (cmd === 'cls') {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').html('');
        }
        return true;
    }
    else if (cmd === 'help') {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append(`
${lang('有关某个命令的详细信息，请键入 HELP 命令名', 'terminal.help.title')}
DIR             ${lang('显示目录中的文件和子目录列表', 'terminal.help.dir')}
LS              ${lang('显示目录中的文件和子目录列表 (DIR 的别名)', 'terminal.help.ls')}
DEL             ${lang('删除一个或多个文件', 'terminal.help.del')}
CD              ${lang('显示当前目录的名称或将其更改', 'terminal.help.cd')}
CLS             ${lang('清除屏幕', 'terminal.help.cls')}
HELP            ${lang('提供 Windows 命令的帮助信息', 'terminal.help.help')}
SYSTEMINFO      ${lang('显示系统信息', 'terminal.help.systeminfo')}
SHUTDOWN        ${lang('关闭计算机', 'terminal.help.shutdown')}
CMD             ${lang('打开新的命令提示符窗口', 'terminal.help.cmd')}
EXIT            ${lang('退出命令提示符程序', 'terminal.help.exit')}

${lang('彩蛋命令：', 'terminal.help.easter')}
HELLO           ${lang('打个招呼', 'terminal.help.hello')}
MATRIX          ${lang('黑客帝国特效', 'terminal.help.matrix')}
SNOW            ${lang('下雪特效', 'terminal.help.snow')}
DANCE           ${lang('让窗口跳舞', 'terminal.help.dance')}
STARWARS        ${lang('原力觉醒', 'terminal.help.starwars')}
`);
        }
        return true;
    }
    else if (commandName === 'ping' || commandName === 'ping6') {
        if (!inTerminal) {
            openapp('terminal');
        }

        const host = cmds.slice(1).join(' ').trim();
        const ipv6 = commandName === 'ping6';
        const terminalOutput = $('#win-terminal>.text-cmd');
        const terminalInput = $('#win-terminal input');

        if (!window.win12Native || !window.win12Native.isTauri()) {
            terminalOutput.append(`${commandName} 仅在 桌面版 中支持使用\n`);
            return true;
        }

        if (!host) {
            terminalOutput.append(`用法: ${commandName} <host>\n`);
            return true;
        }

        terminalInput.prop('disabled', true);
        window.win12Native.pingHost(host, ipv6, (output) => {
            terminalOutput[0].appendChild(document.createTextNode(output));
        }).catch((error) => {
            terminalOutput.append((error && error.message ? error.message : String(error)) + '\n');
        }).finally(() => {
            terminalInput.prop('disabled', false);
            terminalInput.focus();
        });
        return true;
    }
    else if (cmd === 'dir' || cmd === 'ls') {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append(`
 驱动器 C 中的卷没有标签。
 卷的序列号是 3E47-2B9A

 C:\\Windows\\System32 的目录

${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}    <DIR>          .
${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}    <DIR>          ..
2023/10/01  10:30:00             1,024 calc.exe
2023/10/01  10:30:00               512 cmd.exe
2023/10/01  10:30:00             2,048 notepad.exe
2023/10/01  10:30:00             4,096 taskmgr.exe
2023/10/01  10:30:00               256 winver.exe
               5 个文件          7,936 字节
               2 个目录  21,474,836,480 可用字节
`);
        }
        return true;
    }
    else if (cmd.startsWith('del ')) {
        if (inTerminal) {
            const fileName = cmd.substring(4).trim();
            if (fileName.toLowerCase().includes('system32') || fileName.toLowerCase().includes('windows') || fileName.toLowerCase().includes('program files')) {
                $('#win-terminal>.text-cmd').append(`错误: 拒绝访问。无法删除系统关键文件或目录。\n`);
            } else {
                $('#win-terminal>.text-cmd').append(`找不到文件 "${fileName}"。\n`);
            }
        }
        return true;
    }
    else if (cmd.startsWith('cd ')) {
        if (inTerminal) {
            const path = cmd.substring(3).trim();
            if (path === '..') {
                $('#win-terminal>.text-cmd').append(`C:\\Windows\n`);
            } else if (path === '\\' || path === '/') {
                $('#win-terminal>.text-cmd').append(`C:\\\n`);
            } else {
                $('#win-terminal>.text-cmd').append(`C:\\Windows\\System32\\${path}\n`);
            }
        }
        return true;
    }
    else if (cmd.toLowerCase() === 'hello') {
        if (inTerminal) {
            const greetings = [
                '你好呀！今天也是元气满满的一天呢！(◍•ᴗ•◍)',
                'Hello! 欢迎来到 Windows 12! ╰(*°▽°*)╯',
                '嗨！很高兴见到你！(｡♥‿♥｡)',
                '你好！我是 Windows 12 终端，有什么可以帮你的吗？(❁´◡`❁)'
            ];
            $('#win-terminal>.text-cmd').append(greetings[Math.floor(Math.random() * greetings.length)] + '\n');
        }
        return true;
    }
    else if (cmd.toLowerCase() === 'matrix') { return terminalEggs.matrix(inTerminal); }
    else if (cmd.toLowerCase() === 'snow') { return terminalEggs.snow(inTerminal); }
    else if (cmd.toLowerCase() === 'dance') { return terminalEggs.dance(inTerminal); }
    else if (cmd === 'systeminfo') {
        if (inTerminal) {
            const d = new Date();
            $('#win-terminal>.text-cmd').append(`
主机名：WIN12-WEB
OS 名称：Microsoft Windows 12 网页版
OS 版本：12.0.39035.7324
OS 制造商：Microsoft Corporation
OS 配置：主要工作站
OS 构建类型：Multiprocessor Free
注册的所有人：Web User
注册的组织：Web Organization
产品 ID:               12345-67890-09876-54321
初始安装日期：         ${d.toLocaleDateString()}
系统启动时间：         ${d.toLocaleString()}
系统制造商：Web Browser
系统型号：Virtual Machine
系统类型：x64-based PC
处理器：AMD64 Family Web Browser
BIOS 版本：Web Browser Virtual BIOS
Windows 目录：C:\\Windows
系统目录：C:\\Windows\\System32
启动设备：             \\Device\\HarddiskVolume1
系统区域设置：zh-cn;中文 (中国)
输入法区域设置：zh-cn;中文 (中国)
时区：                 (UTC+08:00) 北京，重庆，香港特别行政区，乌鲁木齐
物理内存总量：8,192 MB
可用的物理内存：4,096 MB
虚拟内存：最大值：16,384 MB
虚拟内存：可用：12,288 MB
虚拟内存：使用中：4,096 MB
页面文件位置：C:\\pagefile.sys
域：WORKGROUP
登录服务器：           \\\\WIN12-WEB
修补程序：0 个修补程序已安装
网卡：1 个 NIC 已安装
                      [01]: Ethernet Browser Adapter
`);
        }
        return true;
    }
    else if (cmd in apps) {
        openapp(cmd);
        return true;
    }
    else if (cmd.replace('.exe', '') in apps) {
        openapp(cmd.replace('.exe', ''));
        return true;
    }
    else if (cmd.includes('shutdown')) {//关机指令 by fzlzjerry
        // 保存当前命令以供后续使用
        run_cmd = cmd;
        // 将命令按空格分割成数组以便解析参数
        var cmds = cmd.split(' ');
        // 检查命令是否为 shutdown 或 shutdown.exe
        if ((cmds[0] == 'shutdown') || (cmds[0] == 'shutdown.exe')) {
            // 如果没有参数，显示帮助信息
            if (cmds.length == 1) {
                // 如果不是在终端中执行，则打开终端
                if (!inTerminal) {
                    openapp('terminal');
                    $('#win-terminal').html('<pre class="text-cmd"></pre>');
                }
                // 显示帮助信息
                $('#win-terminal>.text-cmd').append(`
shutdown [-s] [-r] [-f] [-a] [-t time]
-s:关机
-r:重启
-f:注销
-a:取消之前的操作
-t time:指定在 time 秒 后操作

其余不多做介绍了` + (inTerminal ? '' : `
请按任意键继续.&nbsp;.&nbsp;.<input type="text" onkeydown="hidewin('terminal')"></input>`));
                if (!inTerminal) {
                    $('#win-terminal>pre>input').focus();
                }
                return true;
            }

            // 初始化参数变量
            let hasTime = false;      // 是否指定了时间
            let timeValue = 0;        // 延迟时间值（秒）
            let operation = '';       // 操作类型（关机/重启/注销）
            let forceMode = false;    // 是否为强制模式（不显示通知）

            // 检查并解析时间参数 (-t 或 /t)
            if (cmds.includes('-t') || cmds.includes('/t')) {
                const timeFlag = cmds.includes('-t') ? '-t' : '/t';
                const timeIndex = cmds.indexOf(timeFlag);
                // 检查时间参数是否有效
                if (timeIndex < cmds.length - 1 && !isNaN(cmds[timeIndex + 1])) {
                    hasTime = true;
                    timeValue = parseInt(cmds[timeIndex + 1]);
                } else {
                    // 时间参数无效时显示错误信息
                    $('#win-terminal>.text-cmd').append(`错误：无效的时间参数\n`);
                    return true;
                }
            }

            // 检查是否为强制模式 (-f 或 /f)
            if (cmds.includes('-f') || cmds.includes('/f')) {
                forceMode = true;
            }

            // 检查是否为取消操作 (-a 或 /a)
            if (cmds.includes('-a') || cmds.includes('/a')) {
                // 如果有正在进行的关机任务
                if (shutdown_task.length > 0) {
                    // 清除所有关机任务
                    for (let task of shutdown_task) {
                        if (task != null) {
                            try {
                                clearTimeout(task);
                            } catch (err) { console.log(err); }
                        }
                    }
                    shutdown_task = [];
                    // 显示取消通知
                    nts['shutdown'] = {
                        cnt: `
                        <p class="tit">注销已取消</p>
                        <p>计划的关闭已取消。</p>`,
                        btn: [
                            { type: 'main', text: lang('关闭', 'close'), js: 'closenotice();' },
                        ]
                    };
                    shownotice('shutdown');
                } else {
                    // 如果没有正在进行的关机任务，显示错误信息
                    $('#win-terminal>.text-cmd').append(`错误：没有正在进行的关机操作\n`);
                }
                return true;
            }

            // 确定操作类型
            if (cmds.includes('-s') || cmds.includes('/s')) {
                operation = 'shutdown';    // 关机
            }
            else if (cmds.includes('-r') || cmds.includes('/r')) {
                operation = 'restart';     // 重启
            }
            else if (cmds.includes('-f') || cmds.includes('/f')) {
                operation = 'logoff';      // 注销
            }
            else {
                // 如果没有指定有效的操作类型，显示错误信息
                $('#win-terminal>.text-cmd').append(`错误：无效的操作参数\n`);
                return true;
            }

            // 计算延迟时间和显示文本
            const delay = hasTime ? timeValue * 1000 : 0;  // 将秒转换为毫秒
            const timeString = hasTime ? calcTimeString(timeValue) : '立即';

            // 准备通知内容
            nts['shutdown'] = {
                cnt: `
                <p class="tit">即将${operation === 'restart' ? '重启' : operation === 'logoff' ? '注销' : '关机'}</p>
                <p>Windows 将在 ${timeString} 后${operation === 'restart' ? '重启' : operation === 'logoff' ? '注销' : '关机'}。</p>`,
                btn: [
                    { type: 'main', text: lang('关闭', 'close'), js: 'closenotice();' },
                ]
            };

            // 创建定时任务
            const task = setTimeout(() => {
                // 根据操作类型跳转到相应页面
                if (operation === 'restart') {
                    window.location.href = './reload.html';
                } else if (operation === 'logoff') {
                    window.location.href = './login.html';
                } else {
                    window.location.href = './shutdown.html';
                }
            }, delay);

            // 将任务添加到任务列表
            shutdown_task.push(task);

            // 如果不是强制模式，显示通知
            if (!forceMode) {
                shownotice('shutdown');
            }
            return true;
        }
    }
    else if (cmd.toLowerCase() === 'starwars') { return terminalEggs.starwars(inTerminal); }
    return false;
}
