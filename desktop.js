'use strict';

/*

Windows 12 网页版
    GitHub: tjy-gitnub/win12

*/

/********** 禁止格式化此文档！ **********/

console.log('%cWindows 12 网页版 (GitHub: win12-online/win12)', 'background-image: linear-gradient(to right,rgb(174, 115, 229),rgb(21, 105, 223)); border-radius: 8px; font-size: 1.3em; padding: 10px 15px; color: #fff; ');
// 好高级，还能这样？？



// Simple custom i18n implementation (no decodeURI bug)
const i18nData = {};

function normalizedLangCode(code) {
    return {
        'zh-CN': 'zh_CN',
        'zh-cn': 'zh_CN',
        'zh-TW': 'zh_TW',
        'zh-tw': 'zh_TW',
        'en-US': 'en-US',
        'en-us': 'en-US',
        'en-GB': 'en',
        'en-gb': 'en'
    }[code] || code;
}

function parseProperties(data) {
    const translations = {};
    const lines = data.split('\n');

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('!')) continue;

        const eqIndex = line.indexOf('=');
        if (eqIndex === -1) continue;

        const key = line.substring(0, eqIndex).trim();
        const value = line.substring(eqIndex + 1).trim();

        if (key) translations[key] = value;
    }

    return translations;
}

function getTranslations(code) {
    return i18nData[code] || i18nData[normalizedLangCode(code)] || i18nData.en || {};
}

function applyTranslations(code) {
    const translations = getTranslations(code);
    let applied = 0;

    $('[data-i18n]').each(function () {
        const key = $(this).data("i18n");
        const value = translations[key];
        if (value) {
            $(this).html(value);
            applied++;
        }
    });

    $('[data-i18n-attr]').each(function () {
        const key = $(this).data("i18n-key");
        const value = translations[key];
        if (value) {
            $(this).attr($(this).data("i18n-attr"), value);
            applied++;
        }
    });

    translateLooseEnglishText(code);

    return applied;
}

const looseEnglishTranslations = [
    ['立即体验', 'Try it now'],
    ['主题', 'Theme'],
    ['语言', 'Language'],
    ['简体中文', 'Simplified Chinese'],
    ['繁體中文', 'Traditional Chinese'],
    ['Github Trending 榜', 'GitHub Trending'],
    ['第 3 名', 'No. 3'],
    ['本项目在 Github Trending 榜上最高排名第 3 名，中文榜最高排名第 1 名！', 'This project reached No. 3 on GitHub Trending and No. 1 on the Chinese chart.'],
    ['Github 开源仓库获得', 'GitHub open-source repository has received'],
    ['至今，本项目在 Github 上获得了 7000 多个星标！', 'So far, this project has received more than 7,000 stars on GitHub.'],
    ['以及', 'And'],
    ['你们的支持', 'Your support'],
    ['开发团队', 'Development team'],
    ['贡献者们', 'Contributors'],
    ['更多', 'More'],
    ['项目主仓库', 'Main repository'],
    ['项目介绍页（此页）', 'Project introduction page (this page)'],
    ['个性化主题仓库', 'Personalization theme repository'],
    ['主页', 'Home'],
    ['已固定', 'Pinned'],
    ['快速访问', 'Quick access'],
    ['回收站', 'Recycle Bin'],
    ['挂载本地文件夹', 'Mount local folder'],
    ['标签', 'Tags'],
    ['红色', 'Red'],
    ['蓝色', 'Blue'],
    ['黄色', 'Yellow'],
    ['绿色', 'Green'],
    ['橙色', 'Orange'],
    ['紫色', 'Purple'],
    ['粉色', 'Pink'],
    ['新建', 'New'],
    ['排序方式', 'Sort'],
    ['布局', 'View'],
    ['简介', 'Introduction'],
    ['更新记录', 'Update history'],
    ['文件', 'File'],
    ['编辑', 'Edit'],
    ['格式', 'Format'],
    ['提示', 'Notice'],
    ['同意并继续', 'Agree and continue'],
    ['不同意', 'Disagree'],
    ['打开：', 'Open:'],
    ['关于 Windows', 'About Windows'],
    ['代码编辑器', 'Code Editor'],
    ['进程', 'Processes'],
    ['性能', 'Performance'],
    ['进程名称', 'Process name'],
    ['内存', 'Memory'],
    ['硬盘', 'Disk'],
    ['无筛选结果', 'No filtered results'],
    ['重置筛选器', 'Reset filter'],
    ['窗口管理', 'Window management'],
    ['置于顶层', 'Stay on top'],
    ['反馈', 'Feedback'],
    ['发送反馈', 'Send feedback'],
    ['新建文本Documents.txt', 'New Text Document.txt'],
    ['在必应中搜索，或输入一个网址', 'Search with Bing or enter a web address'],
    ['为标签页命名', 'Name this tab'],
    ['Login后，即可在设备上使用你最喜爱的 Microsoft Apps和服务。可以备份设备、让设备更安全，并使用 Microsoft 365 Apps版和云储存空间。', 'After signing in, use your favorite Microsoft apps and services on this device. Back up your device, make it safer, and use Microsoft 365 apps and cloud storage.'],
    ['您可以在这里填入您的 Github Access Token 来提高 Github API 限制访问次数，即可以更好地使用 Windows Update、主题等功能。您的 Token 仅会存放在本地浏览器中，该数据不会传输至服务端，也更不会外泄，但请您妥善保管好自己的 Token。', 'Enter your GitHub access token here to increase GitHub API limits, which improves Windows Update, themes, and related features. Your token is stored only in this browser and is never sent to a server. Keep it safe.'],
    ['Windows 和某些Apps程序根据您所在的地区Settings日期和时间的格式', 'Windows and some apps format dates and times based on your region settings'],
    ['当更新或System出现问题，使用此项Downloads最新完整内容', 'Download the latest full package when updates or the system have problems'],
    ['获取 Windows 的预览版本，以分享有关新功能的更新和反馈', 'Get Windows preview builds to share feedback on new features and updates'],
    ['备份您的文件、Apps程序、首选项以跨设备恢复它们', 'Back up your files, apps, and preferences so you can restore them across devices'],
    ['Login时自动启动的Apps程序', 'Apps that start automatically when you sign in'],
    ['已安装的Apps程序、Apps程序执行别名', 'Installed apps and app execution aliases'],
    ['可以在Apps程序而不是浏览器中打开的网站', 'Websites that can open in apps instead of the browser'],
    ['电子邮件、Apps程序和网络等组织资源', 'Email, apps, network, and other organization resources'],
    ['管理您的家庭群组、编辑帐户类型和设备权限', 'Manage your family group, account types, and device permissions'],
    ['设备访问、工作或学校用户、信息亭分配的访问', 'Device access, work or school users, and kiosk assigned access'],
    ['显示器、亮度、夜间模式、显示描述', 'Displays, brightness, night light, and display profile'],
    ['睡眠、电池使用情况、节电模式', 'Sleep, battery usage, and battery saver'],
    ['存储空间、驱动器、配置规则', 'Storage space, drives, and configuration rules'],
    ['建议的疑难解答、首选项和历史记录', 'Recommended troubleshooting, preferences, and history'],
    ['贴靠窗口、桌面、任务切换', 'Snap windows, desktops, and task switching'],
    ['重置、高级启动、返回', 'Reset, advanced startup, and go back'],
    ['设备规格、重命名电脑、Windows 规格', 'Device specifications, rename PC, and Windows specifications'],
    ['激活状态、订阅、产品密钥', 'Activation status, subscriptions, and product key'],
    ['管理、Add和Delete设备', 'Manage, add, and remove devices'],
    ['Bluetooth鼠标、键盘、其他Bluetooth设备', 'Bluetooth mice, keyboards, and other Bluetooth devices'],
    ['Settings触控笔、Settings触控屏幕', 'Set up pen and touch screen'],
    ['权限、配对 PIN、可发现性', 'Permissions, pairing PIN, and discoverability'],
    ['这是您在其他设备的Bluetooth列表中的名称', 'This is the name shown in Bluetooth lists on other devices'],
    ['连接、管理已连接网络', 'Connect and manage connected networks'],
    ['通过Move网络访问互联网', 'Access the internet through mobile network'],
    ['Settings拨号 Internet 连接', 'Set up dial-up internet connections'],
    ['Add、连接、管理', 'Add, connect, and manage'],
    ['用于 WI-Fi 和以太网的代理服务器', 'Proxy server for Wi-Fi and Ethernet'],
    ['查看所有网络适配器、网络重置', 'View all network adapters and network reset'],
    ['Settings Windows 的主题色', 'Set the Windows accent color'],
    ['(Consumes large amount of GitHub API limit!) Settings Windows 的Theme 想要', '(Consumes a large amount of GitHub API limit!) Set the Windows theme. Want to'],
    ['(Consumes large amount of GitHub API limit!) Settings Windows 的主题 想要', '(Consumes a large amount of GitHub API limit!) Set the Windows theme. Want to'],
    ['启用平滑圆角（需要较新浏览器）', 'Enable smooth rounded corners (requires a newer browser)'],
    ['System界面元素过渡动画', 'System interface transition animations'],
    ['为System界面元素Add阴影效果', 'Add shadow effects to system interface elements'],
    ['为焦点窗口开启 Mica 效果', 'Enable Mica effects for the focused window'],
    ['是否启用开机Music', 'Whether to enable startup sound'],
    ['是否启用语音输入球', 'Whether to enable the voice input ball'],
    ['文件和链接类型的默认值，其他默认值', 'Defaults for file and link types, plus other defaults'],
    ['Downloads、存储位置、地图更新', 'Downloads, storage location, and map updates'],
    ['为您的设备提供额外功能', 'Provide extra features for your device'],
    ['Windows Hello、安全密钥、Password、动态锁', 'Windows Hello, security key, password, and dynamic lock'],
    ['电子邮件、日历和联系人使用的帐户', 'Accounts used by email, calendar, and contacts'],
    ['时区、自动时钟Settings、日历显示', 'Time zone, automatic clock settings, and calendar display'],
    ['触摸键盘、文本建议、首选项', 'Touch keyboard, text suggestions, and preferences'],
    ['语音语言、语音识别麦克风Settings、声音', 'Speech language, speech recognition microphone settings, and voices'],
    ['保存位置，录制首选项', 'Save location and recording preferences'],
    ['控制器和键盘快捷方式', 'Controllers and keyboard shortcuts'],
    ['优化电脑以便畅玩', 'Optimize your PC for gaming'],
    ['Settings是否启用自动更新', 'Set whether automatic updates are enabled'],
    ['查看历史版本功能', 'View historical version features'],
    ['通知、自动规则', 'Notifications and automatic rules'],
    ['通知、USB 节电模式', 'Notifications and USB power saver'],
    ['来自System和Apps的警报', 'Alerts from system and apps'],
    ['立即从电脑访问Move设备', 'Access mobile devices from your PC now'],
    ['点击、滚动、缩放、手势', 'Taps, scrolling, zoom, and gestures'],
    ['剪贴和复制历史记录、同步、清除', 'Cut and copy history, sync, and clear'],
    ['这将清除用户自定义的所有图标', 'This will clear all user-customized icons'],
    ['管理你的信息和数据', 'Manage your information and data'],
    ['订阅、账单等', 'Subscriptions, billing, and more'],
    ['所有功能尽在 Microsoft Accounts', 'All features are available with a Microsoft account'],
    ['最近使用的和常用的Settings', 'Recent and frequently used settings'],
    ['Personalization你的System', 'Personalize your system'],
    ['Settings打印机、排除故障', 'Printer settings and troubleshooting'],
    ['停止无线通信', 'Stop wireless communication'],
    ['共享 Internet 连接', 'Share internet connection'],
    ['视频格式调整、HDR 流媒体、电池选项', 'Video format adjustment, HDR streaming, and battery options'],
    ['高级网络Settings', 'Advanced network settings'],
    ['Downloads完整内容', 'Download full content'],
    ['Move网络 未连接', 'Mobile network not connected'],
    ['Move设备', 'Mobile devices'],
    ['Power和电池', 'Power & battery'],
    ['System信息', 'System information'],
    ['Token 管理', 'Token management'],
    ['Windows 备份', 'Windows Backup'],
    ['Windows 预览体验计划', 'Windows Insider Program'],
    ['WLAN 已连接', 'WLAN connected'],
    ['Bluetooth与设备', 'Bluetooth & devices'],
    ['Bluetooth设备', 'Bluetooth devices'],
    ['Gaming模式', 'Game Mode'],
    ['Login工作或学校Accounts', 'Sign in to work or school'],
    ['Login选项', 'Sign-in options'],
    ['Mica 背景', 'Mica background'],
    ['Add或Delete GitHub Access Token', 'Add or remove GitHub access token'],
    ['主题色', 'Accent color'],
    ['代理', 'Proxy'],
    ['保存 Token', 'Save token'],
    ['保存', 'Save'],
    ['其他用户', 'Other users'],
    ['加载中', 'Loading'],
    ['动画', 'Animation'],
    ['可打开的网站Apps', 'Apps for websites'],
    ['可选内容', 'Optional features'],
    ['启动', 'Startup'],
    ['声音级别、输入、输出、声音设备', 'Volume levels, input, output, and sound devices'],
    ['声音', 'Sound'],
    ['多任务处理', 'Multitasking'],
    ['存储', 'Storage'],
    ['安装的Apps', 'Installed apps'],
    ['家庭', 'Family'],
    ['屏幕', 'Display'],
    ['平滑圆角', 'Smooth rounded corners'],
    ['开机Music', 'Startup sound'],
    ['当前设备时间：', 'Current device time:'],
    ['当前颜色', 'Current color'],
    ['恢复', 'Recovery'],
    ['您的Accounts信息', 'Your account info'],
    ['您的微软Accounts', 'Your Microsoft account'],
    ['我的Bluetooth名称', 'My Bluetooth name'],
    ['打印机和扫描仪', 'Printers & scanners'],
    ['投影到此电脑', 'Projecting to this PC'],
    ['拨号', 'Dial-up'],
    ['推荐Settings', 'Recommended settings'],
    ['搜索新的Bluetooth设备', 'Search for new Bluetooth devices'],
    ['摄像', 'Captures'],
    ['断开', 'Disconnect'],
    ['日期与时间', 'Date & time'],
    ['更新历史记录', 'Update history'],
    ['查看 Token', 'View token'],
    ['检查更新', 'Check for updates'],
    ['正在检查更新...', 'Checking for updates...'],
    ['清除 Token', 'Clear token'],
    ['清除桌面图标', 'Clear desktop icons'],
    ['激活', 'Activation'],
    ['疑难解答', 'Troubleshoot'],
    ['视频播放', 'Video playback'],
    ['离线地图', 'Offline maps'],
    ['笔和 Windows Ink', 'Pen & Windows Ink'],
    ['自动更新', 'Automatic updates'],
    ['自定义颜色', 'Custom color'],
    ['触摸板', 'Touchpad'],
    ['输入', 'Typing'],
    ['远程桌面', 'Remote Desktop'],
    ['远程桌面用户、连接权限', 'Remote Desktop users and connection permissions'],
    ['连接', 'Connect'],
    ['通知', 'Notifications'],
    ['重命名', 'Rename'],
    ['阴影', 'Shadow'],
    ['隐私与安全性', 'Privacy & security'],
    ['颜色', 'Colors'],
    ['默认Apps', 'Default apps'],
    ['电子邮件和Accounts', 'Email & accounts'],
    ['启用平滑圆角', 'Enable smooth rounded corners'],
    ['剪贴板', 'Clipboard'],
    ['专注', 'Focus'],
    ['设备', 'Devices'],
    ['语言和区域', 'Language & region'],
    ['语音输入球', 'Voice input ball'],
    ['语音', 'Speech'],
    ['主页', 'Home'],
    ['瓶盖', 'Bottle cap']
];

function translateLooseString(value) {
    if (!value || langcode == 'zh-CN' || langcode == 'zh-TW') return value;

    let next = value;
    const translations = looseEnglishTranslations
        .slice()
        .sort((a, b) => b[0].length - a[0].length);
    for (const [from, to] of translations) {
        next = next.split(from).join(to);
    }
    return next;
}

function translateLooseEnglishText(code = langcode) {
    if (code == 'zh-CN' || code == 'zh-TW' || typeof document === 'undefined') return;

    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    for (const node of textNodes) {
        const translated = translateLooseString(node.nodeValue);
        if (translated !== node.nodeValue) node.nodeValue = translated;
    }

    $('[placeholder],[title],[win12_title]').each(function () {
        for (const attr of ['placeholder', 'title', 'win12_title']) {
            const value = $(this).attr(attr);
            const translated = translateLooseString(value);
            if (translated !== value) $(this).attr(attr, translated);
        }
    });
}

function observeLooseEnglishText() {
    if (langcode == 'zh-CN' || langcode == 'zh-TW' || !window.MutationObserver) return;

    let queued = false;
    const observer = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(() => {
            queued = false;
            translateLooseEnglishText();
        });
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['placeholder', 'title', 'win12_title']
    });
}

function loadlangSync(code) {
    const fileCode = normalizedLangCode(code);
    const filename = 'lang/lang/lang_' + fileCode + '.properties';

    try {
        const request = new XMLHttpRequest();
        request.open('GET', filename, false);
        request.send(null);

        if (request.status >= 200 && request.status < 300) {
            i18nData[code] = parseProperties(request.responseText);
            if (fileCode !== code) i18nData[fileCode] = i18nData[code];
            console.log('Synchronously loaded', Object.keys(i18nData[code]).length, 'translations for', code);
            return true;
        }
    } catch (error) {
        console.warn('Synchronous language preload failed:', code, error);
    }

    return false;
}

function loadlang(code) {
    console.log('Loading language:', code);

    const fileCode = normalizedLangCode(code);
    const filename = 'lang/lang/lang_' + fileCode + '.properties';

    fetch(filename)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(data => {
            console.log('Language file loaded successfully:', code);

            const translations = parseProperties(data);

            i18nData[code] = translations;
            if (fileCode !== code) i18nData[fileCode] = translations;
            console.log('Parsed', Object.keys(translations).length, 'translations');

            // Try immediately, then retry after delay if needed
            let applied = applyTranslations(code);
            console.log('Applied', applied, 'translations immediately');

            if (applied === 0) {
                // Retry after DOM fully loads
                setTimeout(() => {
                    applied = applyTranslations(code);
                    console.log('Applied', applied, 'translations after delay');
                }, 500);
            }
        })
        .catch(error => {
            console.error('Failed to load language:', code, error);
            lang = (txt, id) => txt; // Fallback to HTML text
        });
}

let nl = 'zh-TW';
let langc = {
    'zh-CN': 'zh-CN',
    'zh-cn': 'zh-CN',
    'zh-hans': 'zh-CN',
    'zh-Hans': 'zh-CN',
    'zh-TW': 'zh-TW',
    'zh-tw': 'zh-TW',
    'zh-hant': 'zh-TW',
    'zh-Hant': 'zh-TW',
    'zh-HK': 'zh-TW',
    'zh-hk': 'zh-TW',
    'zh': 'zh-CN',

    'en': 'en',
    'en-US': 'en-US',
    'en-us': 'en-US',
    'en-GB': 'en',
    'en-gb': 'en'
}

let langcode, lang = (txt, id) => {
    // First check if translation exists in i18nData
    const translations = getTranslations(langcode);
    if (translations[id]) {
        return translations[id];
    }
    // Fall back to provided English text
    return txt;
};

if (localStorage.getItem('lang') != null) {
    if (localStorage.getItem('lang') == 'hans' || localStorage.getItem('lang') == 'zh_cn' || localStorage.getItem('lang') == 'zh-cn') {
        localStorage.setItem('lang', 'zh-CN');
    }
} else {
    if (navigator.language in langc)
        localStorage.setItem('lang', langc[navigator.language]);
    else
        localStorage.setItem('lang', 'en');
}
langcode = localStorage.getItem('lang');


if (document.querySelectorAll('#loginback>.langselect>.' + langcode).length != 0) {
    $('#loginback>.langselect>.' + langcode).addClass('selected')
} else {
    $('#loginback>.langselect>.en').addClass('selected')
}


if (langcode != 'zh-CN') {
    try {
        console.log('Attempting to load language:', langcode);
        console.log('Looking for file: lang/lang/lang_' + langcode + '.properties');
        loadlangSync(langcode);
        loadlang(langcode);
    } catch (e) {
        console.warn('Language file failed to load, using fallback:', e);
        lang = (txt, id) => txt;
    }
}

if (langcode == 'zh-CN') {
    lang = (txt, id) => {
        // if(txt!=$.i18n.prop(id))console.log(id,txt);
        return txt;
    };
}
$(function () {
    translateLooseEnglishText();
    observeLooseEnglishText();
});
console.log('?')


// 函数 lang(txt,id)
/// langcode==zh_cn 下返回 txt,
/// 否则返回语言 properties 文件中键 id 对应的值。
/// 用例：lang('设置','setting.name')
// 
// 为开发方便，故不将简体中文纳入语言考虑


// 后端服务器
const server = 'http://win12server.freehk.svipss.top/';
const pages = {
    'get-title': '', // 获取标题
};
const page = $('html')[0];

function disableIframes() {
    $('iframe:not(.nochanges)').css('pointer-events', 'none');
    $('iframe:not(.nochanges)').css('touch-action', 'none');
}

function enableIframes() {
    $('iframe:not(.nochanges)').css('pointer-events', 'auto');
    $('iframe:not(.nochanges)').css('touch-action', 'auto');
}

async function api(index, nobase = false) {
    if (!nobase) index = 'https://api.github.com/' + index;
    const token = localStorage.getItem('token');
    if (token) {
        const headers = new Headers();
        headers.append('Authorization', token);
        const res = await fetch(index, { headers: headers });
        return res;
    }
    else {
        const res = await fetch(index);
        return res;
    }
}

page.addEventListener('mousedown', disableIframes);
page.addEventListener('touchstart', disableIframes);
page.addEventListener('mouseup', enableIframes);
page.addEventListener('touchend', enableIframes);
page.addEventListener('touchcancel', enableIframes);

page.addEventListener('click', (event) => {
    if ($('#start-menu').hasClass('show') && !$(event.target).closest('#start-menu').length) {
        hide_startmenu();
    }
});
// 开始菜单收回
page.addEventListener('click', (event) => {
    if ($('#search-win').hasClass('show') && !$(event.target).closest('#search-win').length) {
        hide_search();
    }
});
// 搜索收回

// 上古代码，列表前的小竖线
document.querySelectorAll('list.focs').forEach(li => {
    li.addEventListener('click', () => {
        let _ = li.$$('span.focs')[0], la = li.$$('a.check')[0],
            las = li.$$('a');
        if (_.dataset.type == 'abs') {
            $(_).addClass('cl');
            $(_).css('top', (la.getBoundingClientRect().top - li.parentElement.getBoundingClientRect().top) + 'px');
            setTimeout(() => {
                $(_).removeClass('cl');
            }, 500);
        }
        else {
            $(_).addClass('cl');
            $(_).css('top', la.offsetTop - las[las.length - 1].offsetTop);
            $(_).css('left', la.offsetLeft - li.offsetLeft);
            setTimeout(() => {
                $(_).removeClass('cl');
            }, 500);
        }
    });
});

// 禁止拖拽图片
$('img').on('dragstart', () => {
    return false;
});
// 右键菜单
$('html').on('contextmenu', () => {
    return false;
});
function stop(e) {
    e.stopPropagation();
    return false;
}

let loginPasswordHasPassword = false;

function win12FinishLogin() {
    $('#login').css('opacity', '0');
    $('#login-password').css('opacity', '0');
    $('#login-error').css('opacity', '0');
    $('#login-welc').css('opacity', '1');
    setTimeout(() => {
        $('#loginback').addClass('close');
        setTimeout(() => {
            $('#loginback').css('opacity', '0');
        }, 500);
        setTimeout(() => {
            $('#loginback').css('display', 'none');
        }, 2000);
        if (use_music) {
            document.querySelector('audio#startup-music').play();
        }
    }, 2000);
}

function setLoginError(text) {
    $('#login-error').text(text);
}

async function initLoginPassword() {
    if (window.win12Native && window.win12Native.isTauri() && (new URL(location.href)).searchParams.get('skip_login') !== '1') {
        try {
            const status = await window.win12Native.getLoginPasswordStatus();
            loginPasswordHasPassword = !!(status && status.has_password);
            if (loginPasswordHasPassword) {
                $('#loginback').addClass('tauri-password');
                $('#login-password').attr('placeholder', 'Password');
                $('#login-password').focus();
            }
            else {
                $('#loginback').removeClass('tauri-password');
            }
        }
        catch (e) {
            setLoginError('Unable to read local password status');
        }
    }
}

async function win12LoginSubmit() {
    if (!(window.win12Native && window.win12Native.isTauri())) {
        win12FinishLogin();
        return;
    }

    if (!loginPasswordHasPassword) {
        win12FinishLogin();
        return;
    }

    const password = $('#login-password').val();
    if (!password) {
        setLoginError('Please enter password');
        $('#login-password').focus();
        return;
    }

    $('#login').css('pointer-events', 'none');
    setLoginError('Verifying...');

    try {
        const result = await window.win12Native.verifyLoginPassword(password);
        if (result && result.ok) {
            $('#login-password').val('');
            win12FinishLogin();
            return;
        }
        setLoginError('Incorrect password');
        $('#login-password').val('').focus();
    }
    catch (e) {
        setLoginError(String(e));
    }
    finally {
        $('#login').css('pointer-events', 'auto');
    }
}

async function win12RefreshPasswordSettingStatus() {
    if (!(window.win12Native && window.win12Native.isTauri())) {
        $('#setting-password-status').text('Only available in Tauri App');
        $('#setting-password-current').hide();
        $('#setting-password-new').prop('disabled', true);
        $('#setting-password-submit').addClass('disabled');
        return;
    }

    try {
        const status = await window.win12Native.getLoginPasswordStatus();
        loginPasswordHasPassword = !!(status && status.has_password);
        $('#setting-password-status').text(loginPasswordHasPassword ? 'Password is set' : 'Password is not set');
        $('#setting-password-current')[loginPasswordHasPassword ? 'show' : 'hide']();
        $('#setting-password-current').val('');
        $('#setting-password-new').val('').prop('disabled', false);
        $('#setting-password-new').attr('placeholder', loginPasswordHasPassword ? 'New password (leave empty to clear)' : 'New password');
        $('#setting-password-submit').removeClass('disabled');
    }
    catch (e) {
        $('#setting-password-status').text(String(e));
    }
}

async function win12SetLoginPassword() {
    if (!(window.win12Native && window.win12Native.isTauri())) {
        $('#setting-password-status').text('Only available in Tauri App');
        return;
    }

    const currentPassword = $('#setting-password-current').val();
    const newPassword = $('#setting-password-new').val();
    if (!loginPasswordHasPassword && !newPassword) {
        $('#setting-password-status').text('Please enter new password');
        $('#setting-password-new').focus();
        return;
    }
    if (loginPasswordHasPassword && !currentPassword) {
        $('#setting-password-status').text('Please enter current password');
        $('#setting-password-current').focus();
        return;
    }

    $('#setting-password-submit').addClass('disabled');
    const clearingPassword = loginPasswordHasPassword && !newPassword;
    $('#setting-password-status').text(clearingPassword ? 'Clearing...' : 'Saving...');

    try {
        await window.win12Native.setLoginPassword(loginPasswordHasPassword ? currentPassword : null, newPassword);
        await win12RefreshPasswordSettingStatus();
        $('#setting-password-status').text(clearingPassword ? 'Password cleared' : 'Password saved');
    }
    catch (e) {
        $('#setting-password-status').text(String(e));
    }
    finally {
        $('#setting-password-submit').removeClass('disabled');
    }
}

$('input,textarea,*[contenteditable=true]').on('contextmenu', (e) => {
    stop(e);
    return true;
});
// 给桌面上的图标加右键菜单
function addMenu() {
    var parentDiv = $('#desktop')[0];
    var childDivs = parentDiv.$$('#div');

    for (var i = 0; i < childDivs.length; i++) {
        if (i <= 4) {//win12内置的5个图标不添加
            continue;
        }
        let div = childDivs[i];
        div.setAttribute('iconIndex', i - 5);
        div.addEventListener('contextmenu', (event) => {
            if (div.getAttribute('appname') != undefined) {
                return showcm(event, 'desktop.icon', [div.getAttribute('appname'), div.getAttribute('iconIndex')]);
            }
            return false;
        }, useCapture = true);
    }
}
var run_cmd = '';
const nomax = { 'calc': 0, 'notepad-fonts': 0, 'camera-notice': 0, 'winver': 0, 'run': 0, 'wsa': 0 };
const nomin = { 'notepad-fonts': 0, 'camera-notice': 0, 'run': 0 };
var topmost = [];
var sys_setting = [1, 1, 1, 0, 1, 1, 1];
var use_music = true;
var use_mic_voice = true;

// 右键菜单
/* 参考 desktop.html 开头信息
    每个标识对应一个列表，每一项为一个右键菜单中显示的项，可以有以下形式：
1. 'text', 文本信息
2. ['text','script'], 分别为显示内容，点击执行的代码
3. arg => {
        ...
        return ...
    }
    形参 arg 为 showcm() 方法第三个位置的用以传参的参数内容，
    返回内容或为 'null' 表示跳过此项，或参考条目 2 的格式
*/
const cms = {
    'save-bar': [
        arg => {
            return ['<i class="bi bi-window-x"></i> Remove', `removeEdgeSaveUrl('${arg}')`];
        }
    ],
    'titbar': [
        arg => {
            if (arg in nomax) {
                return 'null';
            }
            if ($('.window.' + arg).hasClass('max')) {
                return ['<i class="bi bi-window-stack"></i> ' + lang('Restore', 'window.restore'), `maxwin('${arg}')`];
            }
            else {
                return ['<i class="bi bi-window-fullscreen"></i> ' + lang('Maximize', 'window.max'), `maxwin('${arg}')`];
            }
        },
        arg => {
            if (arg in nomin) {
                return 'null';
            }
            else {
                return ['<i class="bi bi-window-dash"></i> ' + lang('Minimize', 'window.min'), `minwin('${arg}')`];
            }
        },
        arg => {
            if (arg in nomin) {
                return ['<i class="bi bi-window-x"></i> ' + lang('Close', 'close'), `hidewin('${arg}', 'configs')`];
            }
            else {
                return ['<i class="bi bi-window-x"></i> ' + lang('Close', 'close'), `hidewin('${arg}')`];
            }
        },
    ],
    'taskbar': [
        arg => {
            return ['<i class="bi bi-window-x"></i> ' + lang('Close', 'close'), `hidewin('${arg}')`];
        }
    ],
    'desktop': [
        [`<i class="bi bi-arrow-clockwise"></i> ${lang('Refresh', 'refresh')} <info>F5</info>`, '$(\'#desktop\').css(\'opacity\',\'0\');setTimeout(()=>{$(\'#desktop\').css(\'opacity\',\'1\');},100);setIcon();'],
        ['<i class="bi bi-circle-square"></i> ' + lang('Toggle Theme', 'desktop.tgltheme'), 'toggletheme()'],
        `<a onmousedown="window.open(\'https://github.com/win12-online/win12\',\'_blank\');" win12_title="https://github.com/win12-online/win12" onmouseenter="showdescp(event)" onmouseleave="hidedescp(event)"><i class="bi bi-github"></i> ${lang('View this project on Github', 'desktop.vogithub')}</a>`,
        arg => {
            if (edit_mode) {
                return ['<i class="bi bi-pencil"></i> ' + lang('Exit editing mode', 'desktop.exitedit'), 'editMode();'];
            }
            else if (!edit_mode) {
                return ['<i class="bi bi-pencil"></i> ' + lang('Enter editing mode', 'desktop.enteredit'), 'editMode();'];
            }
        },
        ['<i class="bi bi-info-circle"></i> ' + lang('About Win12 Online', 'about.name'), '$(\'#win-about>.about\').addClass(\'show\');$(\'#win-about>.update\').removeClass(\'show\');openapp(\'about\');if($(\'.window.about\').hasClass(\'min\'))minwin(\'about\');'],
        ['<i class="bi bi-brush"></i> ' + lang('Personalization', 'psnl'), 'openapp(\'setting\');$(\'#win-setting > div.menu > list > a.enable.appearance\')[0].click()']
    ],
    'desktop.icon': [
        arg => {
            return ['<i class="bi bi-folder2-open"></i> ' + lang('Open', 'open'), 'openapp(`' + arg[0] + '`)'];
        },
        arg => {
            if (arg[1] >= 0) {
                return ['<i class="bi bi-trash3"></i> ' + lang('Delete', 'del'), 'desktopItem.splice(' + (arg[1]) + ', 1);saveDesktop();setIcon();addMenu();'];
            } else {
                return 'null';
            }
        }
    ],
    'winx': [
        arg => {
            if ($('#start-menu').hasClass('show')) {
                return ['<i class="bi bi-box-arrow-in-down"></i> Close Start Menu', 'hide_startmenu()'];
            }
            else {
                return ['<i class="bi bi-box-arrow-in-up"></i> Open开始菜单', `$('#start-btn').addClass('show');
                if($('#search-win').hasClass('show')){$('#search-btn').removeClass('show');
                $('#search-win').removeClass('show');setTimeout(() => {$('#search-win').removeClass('show-begin');
                }, 200);}$('#start-menu').addClass('show-begin');setTimeout(() => {$('#start-menu').addClass('show');
                }, 0);`];
            }
        },
        '<hr>',
        ['<i class="bi bi-gear"></i> ' + lang('Settings', 'setting.name'), 'openapp(\'setting\')'],
        ['<i class="bi bi-terminal"></i> ' + lang('Run', 'run.name'), 'openapp(\'run\')'],
        ['<i class="bi bi-folder2-open"></i> ' + lang('File Explorer', 'explorer.name'), 'openapp(\'explorer\')'],
        ['<i class="bi bi-search"></i> 搜索', `$('#search-btn').addClass('show');hide_startmenu();
        $('#search-win').addClass('show-begin');setTimeout(() => {$('#search-win').addClass('show');
        $('#search-input').focus();}, 0);`],
        '<hr>',
        ['<i class="bi bi-power"></i> 关机', 'window.location=\'shutdown.html\''],
        ['<i class="bi bi-arrow-counterclockwise"></i> Restart', 'window.location=\'reload.html\''],
    ],
    'smapp': [
        arg => {
            return ['<i class="bi bi-window"></i> ' + lang('Open', 'open'), `openapp('${arg[0]}');hide_startmenu();`];
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
            return ['<i class="bi bi-window"></i> ' + lang('Open', 'open'), `openapp('${arg[0]}');hide_startmenu();`];
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
        minwin('about');$('#win-about>.about').removeClass('show');$('#win-about>.update').addClass('show');
        $('#win-about>.update>div>details:first-child').attr('open','open')`],
        ['<i class="bi bi-box-arrow-right"></i> 关闭', '$(\'.msg.update\').removeClass(\'show\')']
    ],
    'explorer.folder': [
        arg => {
            return ['<i class="bi bi-folder2-open"></i> ' + lang('Open', 'open'), `apps.explorer.goto('${arg}')`];
        },
        arg => {
            return ['<i class="bi bi-arrow-up-right-square"></i> 在新标签页中Open', `apps.explorer.newtab('${arg}');`];
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-trash3"></i> ' + lang('Delete', 'del'), `apps.explorer.del('${arg}')`];
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
                return ['<i class="bi bi-folder2-open"></i> ' + lang('Open','open'), `apps.explorer.openMountedFile('${arg}')`];
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
                return ['<i class="bi bi-folder2-open"></i> ' + lang('Open','open'), fileCmd];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-trash3"></i> ' + lang('Delete', 'del'), `apps.explorer.del('${arg}')`];
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
                return ['<i class="bi bi-file-earmark-arrow-down"></i> Paste', 'apps.explorer.paste($(\'#win-explorer>.path>.tit\')[0].dataset.path,\'新建文件夹\',type=\'files\')'];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-arrow-clockwise"></i> Refresh', 'apps.explorer.goto($(\'#win-explorer>.path>.tit\')[0].dataset.path, false)'];
            return ['<i class="bi bi-arrow-clockwise"></i> Refresh', 'apps.explorer.reset()'];
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length <= 1 && apps.explorer.fsApiSupported)
                return ['<i class="bi bi-usb-drive"></i> 挂载本地文件夹', 'apps.explorer.mountDrive()'];
            return 'null';
        }
    ],
    'explorer.mounted': [
        arg => ['<i class="bi bi-folder2-open"></i> Open', `apps.explorer.goto('${arg}')`],
        arg => ['<i class="bi bi-eject"></i> 卸载', `apps.explorer.unmountDrive('${arg}')`]
    ],
    'explorer.tab': [
        arg => {
            return ['<i class="bi bi-x"></i> Close Tab', `m_tab.close('explorer',${arg})`];
        }
    ],
    'edge.tab': [
        arg => {
            return ['<i class="bi bi-pencil-square"></i> Rename Tab', `apps.edge.c_rename(${arg})`];
        },
        arg => {
            return ['<i class="bi bi-x"></i> Close Tab', `m_tab.close('edge',${arg})`];
        }
    ],
    'taskmgr.processes': [
        arg => {
            return ['<i class="bi bi-x"></i> End Task', `apps.taskmgr.taskkill('${arg}')`];
        }
    ]
};

function showcm(e, cl, arg) {
    if ($('#cm').hasClass('show-begin')) {
        setTimeout(() => {
            $('#cm').css('left', e.clientX);
            $('#cm').css('top', e.clientY);
            let h = '';
            cms[cl].forEach(item => {
                if (typeof (item) == 'function') {
                    arg.event = e;
                    ret = item(arg);
                    if (ret == 'null') return true;
                    h += `<a class="a" onmousedown="${ret[1]}">${ret[0]}</a>\n`;
                }
                else if (typeof (item) == 'string') {
                    h += item + '\n';
                }
                else {
                    h += `<a class="a" onmousedown="${item[1]}">${item[0]}</a>\n`;
                }
            });
            $('#cm>list')[0].innerHTML = h;
            $('#cm').addClass('show-begin');
            $('#cm>.foc').focus();
            // .foc 是用来模拟焦点的，将焦点放在右键菜单上
            setTimeout(() => {
                $('#cm').addClass('show');
            }, 0);
            setTimeout(() => {
                if (e.clientY + $('#cm')[0].offsetHeight > $('html')[0].offsetHeight) {
                    $('#cm').css('top', e.clientY - $('#cm')[0].offsetHeight);
                }
                if (e.clientX + $('#cm')[0].offsetWidth > $('html')[0].offsetWidth) {
                    $('#cm').css('left', $('html')[0].offsetWidth - $('#cm')[0].offsetWidth - 5);
                }
            }, 200);
        }, 200);
        return;
    }
    $('#cm').css('left', e.clientX);
    $('#cm').css('top', e.clientY);
    let h = '';
    cms[cl].forEach(item => {
        if (typeof (item) == 'function') {
            let ret = item(arg);
            if (ret == 'null') {
                return true;
            };
            h += `<a class="a" onmousedown="${ret[1]}">${ret[0]}</a>\n`;
        } else if (typeof (item) == 'string') {
            h += item + '\n';
        } else {
            h += `<a class="a" onmousedown="${item[1]}">${item[0]}</a>\n`;
        }
    });
    $('#cm>list')[0].innerHTML = h;
    $('#cm').addClass('show-begin');
    $('#cm>.foc').focus();
    setTimeout(() => {
        $('#cm').addClass('show');
    }, 0);
    setTimeout(() => {
        if (e.clientY + $('#cm')[0].offsetHeight > $('html')[0].offsetHeight) {
            $('#cm').css('top', e.clientY - $('#cm')[0].offsetHeight);
        }
        if (e.clientX + $('#cm')[0].offsetWidth > $('html')[0].offsetWidth) {
            $('#cm').css('left', $('html')[0].offsetWidth - $('#cm')[0].offsetWidth - 5);
        }
    }, 200);
}
$('#cm>.foc').blur(() => {
    let x = event.target.parentNode;
    $(x).removeClass('show');
    setTimeout(() => {
        $(x).removeClass('show-begin');
    }, 200);
});
let font_window = false;

// 下拉菜单
const dps = {
    'notepad.file': [
        ['<i class="bi bi-file-earmark-plus"></i> 新建', `hidedp(true);apps.notepad._mountedFileHandle=null;$('#win-notepad>.text-box').addClass('down');
        setTimeout(()=>{$('#win-notepad>.text-box').val('');$('#win-notepad>.text-box').removeClass('down')},200);`],
        ['<i class="bi bi-floppy"></i> 保存 <info>Ctrl+S</info>', `hidedp(true);apps.notepad.saveMounted();`],
        ['<i class="bi bi-box-arrow-right"></i> 另存为', `hidedp(true);$('#win-notepad>.save').attr('href', window.URL.createObjectURL(new Blob([$('#win-notepad>.text-box').html()])));
        $('#win-notepad>.save')[0].click();`],
        '<hr>',
        ['<i class="bi bi-x"></i> 退出', 'isOnDp=false;hidedp(true);hidewin(\'notepad\')'],
    ],
    'notepad.edit': [
        ['<i class="bi bi-files"></i> 复制 <info>Ctrl+C</info>', 'document.execCommand(\'copy\')'],
        ['<i class="bi bi-clipboard"></i> Paste <info>Ctrl+V</info>', 'document.execCommand(\'paste\')'],
        ['<i class="bi bi-scissors"></i> 剪切 <info>Ctrl+X</info>', 'document.execCommand(\'cut\')'],
        '<hr>',
        ['<i class="bi bi-arrow-return-left"></i> 撤销 <info>Ctrl+Z</info>', 'document.execCommand(\'undo\')'],
        ['<i class="bi bi-arrow-clockwise"></i> 重做 <info>Ctrl+Y</info>', 'document.execCommand(\'redo\')'],
    ],
    'notepad.view': [
        ['<i class="bi bi-type"></i> 插入正常字块', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<p>T</p>\''],
        ['<i class="bi bi-type-h1"></i> 插入主标题', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<h1>H1</h1>\''],
        ['<i class="bi bi-type-h2"></i> 插入次标题', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<h2>H2</h2>\''],
        ['<i class="bi bi-type-h3"></i> 插入副标题', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<h3>H3</h3>\''],
        ['<i class="bi bi-type-underline"></i> 插入下划线', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<u>U</u>\''],
        ['<i class="bi bi-type-strikethrough"></i> 插入Delete线', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<s>S</s>\''],
        ['<i class="bi bi-type-italic"></i> 插入斜体字', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<i>I</i>\''],
        ['<i class="bi bi-type-bold"></i> 插入加粗字', 'hidedp(true);$(\'#win-notepad>.text-box\')[0].innerHTML+=\'<b>B</b>\''],
        '<hr>',
        ['<i class="bi bi-fonts"></i> 字体', 'font_window=true;hidedp(true);showwin(\'notepad-fonts\');apps.notepadFonts.reset();'],
    ]
};

function playWindowsBackground() {
    var audio = new Audio('./media/Windows Background.wav');
    audio.play();
}

let dpt = null, isOnDp = false;
$('#dp')[0].onmouseover = () => { isOnDp = true; };
$('#dp')[0].onmouseleave = () => { isOnDp = false; hidedp(); };
function showdp(e, cl, arg) {
    if ($('#dp').hasClass('show-begin')) {
        $('#dp').removeClass('show');
        setTimeout(() => {
            $('#dp').removeClass('show-begin');
        }, 200);
        if (e != dpt) {
            setTimeout(() => {
                showdp(e, cl, arg);
            }, 400);
        }
        return;
    }
    // dpt = e;
    const off = $(e).offset();
    $('#dp').css('left', off.left);
    $('#dp').css('top', off.top + e.offsetHeight);
    let h = '';
    dps[cl].forEach(item => {
        if (typeof (item) == 'function') {
            let ret = item(arg);
            if (ret == 'null') {
                return true;
            }
            h += `<a class="a" onclick="${ret[1]}">${ret[0]}</a>\n`;
        } else if (typeof (item) == 'string') {
            h += item + '\n';
        } else {
            h += `<a class="a" onclick="${item[1]}">${item[0]}</a>\n`;
        }
    });
    $('#dp>list')[0].innerHTML = h;
    $('#dp').addClass('show-begin');
    setTimeout(() => {
        $('#dp').addClass('show');
    }, 0);
    setTimeout(() => {
        if (off.top + e.offsetHeight + $('#dp')[0].offsetHeight > $('html')[0].offsetHeight) {
            $('#dp').css('top', off.top - $('#dp')[0].offsetHeight);
        }
        if (off.left + $('#dp')[0].offsetWidth > $('html')[0].offsetWidth) {
            $('#dp').css('left', $('html')[0].offsetWidth - $('#dp')[0].offsetWidth - 5);
        }
    }, 200);
}
function hidedp(force = false) {
    setTimeout(() => {
        if (isOnDp && !force) {
            return;
        }
        $('#dp').removeClass('show');
        setTimeout(() => {
            $('#dp').removeClass('show-begin');
        }, 200);
    }, 100);
}
// 悬停提示
document.querySelectorAll('*[win12_title]:not(.notip)').forEach(a => {
    a.addEventListener('mouseenter', showdescp);
    a.addEventListener('mouseleave', hidedescp);
});
function showdescp(e) {
    $(e.target).attr('data-descp', 'waiting');
    setTimeout(() => {
        if ($(e.target).attr('data-descp') == 'hide') {
            return;
        }
        $(e.target).attr('data-descp', 'show');
        $('#descp').css('left', e.clientX + 15);
        $('#descp').css('top', e.clientY + 20);
        $('#descp').text($(e.target).attr('win12_title'));
        $('#descp').addClass('show-begin');
        setTimeout(() => {
            if (e.clientY + $('#descp')[0].offsetHeight + 20 >= $('html')[0].offsetHeight) {
                $('#descp').css('top', e.clientY - $('#descp')[0].offsetHeight - 10);
            }
            if (e.clientX + $('#descp')[0].offsetWidth + 15 >= $('html')[0].offsetWidth) {
                $('#descp').css('left', e.clientX - $('#descp')[0].offsetWidth - 10);
            }
            $('#descp').addClass('show');
        }, 100);
    }, 500);
}
function hidedescp(e) {
    $('#descp').removeClass('show');
    $(e.target).attr('data-descp', 'hide');
    setTimeout(() => {
        $('#descp').removeClass('show-begin');
    }, 100);
}

// 提示窗
/* 参考 desktop.html 开头信息，
格式、功能较简单，自行研究，不作赘述*/

const nts = {
    'about': {
        cnt: lang(`<p class="tit">Windows 12 网页版</p>
            <p>Windows 12 网页版是一个开放源项目,<br />
            希望让用户在网络上预先体验 Windows 12,<br />
            内容可能与 Windows 12 正式版本不一致。<br />
            Using standard web technologies such as HTML, CSS and JavaScript<br />
            This project is not affiliated with Microsoft and should not be confused with Microsoft operating systems or products,<br />
            This is also not Windows 365 cloud PC<br />
            Microsoft, Windows and other demonstration products in this project are trademarks of Microsoft Corporation<br />
            Android in this project is a trademark of Google Inc.</p>`, 'nts.about'),
        btn: [
            { type: 'main', text: lang('Close', 'close'), js: 'closenotice();' },
            { type: 'detail', text: lang('More', 'more'), js: 'closenotice();openapp(\'about\');if($(\'.window.about\').hasClass(\'min\'))minwin(\'about\');$(\'.dock.about\').removeClass(\'show\')' },
        ]
    },
    'feedback': {
        cnt: `<p class="tit">${lang('Feedback', 'nts.feedback.name')}</p>
            <p>${lang('We place great emphasis on user experience and feedback', 'nts.feedback.txt')}</p>
            <list class="new">
                <a class="a" onclick="window.open('https://github.com/win12-online/win12/issues','_blank');" win12_title="在浏览器新窗口Open链接" onmouseenter="showdescp(event)" onmouseleave="hidedescp(event)">${lang('Submit an issue on GitHub (requires a GitHub account)', 'nts.feedback.github')}</a>
            </list>`,
        btn: [
            { type: 'main', text: lang('Close', 'close'), js: 'closenotice();' },
        ]
    },
    'widgets': {
        cnt: `
            <p class="tit">${lang('Add a widget', 'nts.addwg')}</p>
            <list class="new">
                <a class="a" onclick="closenotice(); widgets.widgets.add('calc');">${lang('Calculator', 'calc.name')}</a>
                <a class="a" onclick="closenotice(); widgets.widgets.add('weather');">${lang('Weather', 'nts.addwg.weather')}</a>
                <a class="a" onclick="closenotice(); widgets.widgets.add('monitor');">${lang('Resource monitor', 'nts.addwg.monitor')}</a>
            </list>`,
        btn: [
            { type: 'cancel', text: lang('Cancel', 'cancel'), js: 'closenotice();' }
        ]
    },
    'ZeroDivision': {//计算器报错窗口
        // 甚至还报错我真的哭死，直接输入框显示 error 啥的不就完了。。
        cnt: lang(`<p class="tit">错误</p>
            <p>除数不得等于 0</p>`, 'calc.error.zero'),
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' },
        ]
    },
    'Can-not-open-file': {
        cnt: '<p class="tit">' + run_cmd + `</p>
        <p>Windows 找不到文件 '` + run_cmd + '\'。请确定文件名是否正确后，再试一次。</p> ',
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' },
            { type: 'detail', text: '在 Micrsoft Edge 中搜索', js: 'closenotice();openapp(\'edge\');window.setTimeout(() => {apps.edge.newtab();apps.edge.goto(' + run_cmd + ');}, 300);' }
        ]
    },
    'widgets.monitor': {
        cnt: `
        <p class="tit">切换监视器类型</p>
        <list class="new">
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'cpu';">CPU 利用率</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'memory';">内存使用率</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'disk';">磁盘活动时间</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'wifi-receive';">网络吞吐量 - 接收</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'wifi-send';">网络吞吐量 - 发送</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'gpu';">GPU 利用率</a>
        </list>`,
        btn: [
            { type: 'cancel', text: lang('Cancel', 'cancel'), js: 'closenotice();' }
        ]
    },
    'widgets.desktop': {
        cnt: `
            <p class="tit">添加桌面小组件</p>
            <list class="new">
                <a class="a" onclick="closenotice(); widgets.widgets.addToDesktop('calc');">计算器</a>
                <a class="a" onclick="closenotice(); widgets.widgets.addToDesktop('weather');">天气</a>
                <a class="a" onclick="closenotice(); widgets.widgets.addToDesktop('monitor');">系统性能监视器</a>
            </list>`,
        btn: [
            { type: 'cancel', text: lang('Cancel', 'cancel'), js: 'closenotice();' }
        ]
    },
    'widgets.news.source': {
        cnt: `
            <p class="tit">切换新闻源</p>
            <list class="new">
                新闻源未加载，请检查网络连接
            </list>`,
        btn: [{ type: 'cancel', text: lang('Cancel', 'cancel'), js: 'closenotice();' }],
    },
    'duplication file name': {
        cnt: `
            <p class="tit">错误</p>
            <p>文件名重复</p>`,
        btn: [
            { type: 'cancel', text: lang('Cancel', 'cancel'), js: 'closenotice();' }
        ]
    },
    'about-copilot': {
        cnt: `
            <p class="tit">关于 Windows 12 Copilot</p>
             <p>你可以使用此 AI 助手帮助你更快地完成工作，此 AI 助手基于 Deepseek v4 pro 模型 (有人用 Win12 工作？)<br>
            也请适当使用，不要谈论敏感、违规话题，<br>请有身为一个人类最基本的道德底线。<br>根据相关法律法规，我们不向欧盟用户提供服务。<br>
            在此特别感谢云智 api(yunzhiapi.cn) 为本项目提供赞助！</p>
            <a class="a" onclick="window.open('https://status.win12.tech/status/win12/','_blank');" win12_title="在浏览器新窗口Open链接">状态监测</a><br>
            <a class="a" onclick="window.open('https://www.yunzhiapi.cn/','_blank');" win12_title="在浏览器新窗口Open链接">云智 API 官网</a>
        `,
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' },
        ]
    },
    'shutdown': {
        cnt: `
        <p class="tit">即将注销你的登录</p>
        <p>Windows will shut down in 114514 minutes.</p>`,
        btn: [
            { type: 'main', text: lang('Close', 'close'), js: 'closenotice();' }
        ]
    },
    'setting.update': {
        cnt: `
            <p class="tit">更新已就绪</p>
            <p>请Restart电脑以应用更新</p>
        `,
        btn: [
            { type: 'main', text: '立即Restart', js: 'location.href = `./reload.html`;' },
            { type: 'detail', text: '稍后Restart', js: 'closenotice();' }
        ]
    },
    'recognition': {
        cnt: `
        <p class="tit">语音输入法使用须知</p>
        <p>本语音输入法由@nb-group开发<br>
        使用的语音识别api 仅可在使用 Chromium 内核的浏览器上使用，<br>
        包括Microsoft Edge，Google Chrome等，<br>
        api（理论上）完全离线.<br>
        我们绝不会窃取您的输入信息，请放心使用。<br><br>
        每次语音识别都会重新申请一下麦克风，这是浏览器的问题，<br>
        可以在浏览器设置里选择始终允许。<br><br>
        哦对了，关掉提示窗口之后再点一次语音球才能开始识别。
        </p>
         `,
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' },
        ]
    },
    'setting.down': {
        cnt: `
        <p class="tit">下载完毕</p>
        <p>请立即重新启动以应用更改</p>
        `,
        btn: [
            { type: 'main', text: '重新启动', js: 'closenotice(); setTimeout(() => {window.location=`reload.html`;},200);' }
        ]
    },
    'whiteboard-saveas': {
        cnt: `
        <p class="tit">${lang('Save As', 'whiteboard.saveas.title')}</p>
        <p>${lang('Enter filename:', 'whiteboard.saveas.prompt')}</p>
        <input type="text" id="whiteboard-filename" placeholder="Whiteboard_${new Date().toISOString().slice(0, 10)}" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;">
        `,
        btn: [
            { type: 'main', text: lang('Save', 'whiteboard.saveas.save'), js: 'apps.whiteboard.doSaveAs();' },
            { type: 'detail', text: lang('取消', 'whiteboard.saveas.cancel'), js: 'closenotice();' }
        ]
    },
    'no-files-permission': {
        cnt: lang(`<p class="tit">文件资源管理器</p>
            <p>你没有权限Open该文件，请向文件的所有者或管理员申请权限<br /></p>`),
        btn: [
            { type: 'main', text: lang(lang('Close', 'close'), 'close'), js: 'closenotice();' }
        ]
    },
    'rename-pc': {
        cnt: `
        <p class="tit">重命名你的电脑</p>
        <p>你可以使用字母、连字符和数字的组合</p>
        <input type="text" id="rename-name" placeholder="Desktop-${Math.floor(Math.random() * 1000000)}">
        `,
        btn: [
            { type: 'main', text: lang('Save', 'pc.saveas.save'), js: '' },
            { type: 'detail', text: lang('取消', 'pc.saveas.cancel'), js: 'closenotice();' }
        ]
    },
    'no-files-permission': {
        cnt: lang(`<p class="tit">文件资源管理器</p>
            <p>你没有权限Open该文件，请向文件的所有者或管理员申请权限<br /></p>`),
        btn: [
            { type: 'main', text: lang(lang('Close', 'close'), 'close'), js: 'closenotice();' }
        ]
    },
    'rename-pc': {
        cnt: `
        <p class="tit">重命名你的电脑</p>
        <p>你可以使用字母、连字符和数字的组合</p>
        <input type="text" id="rename-name" placeholder="Desktop-${Math.floor(Math.random() * 1000000)}" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;">
        `,
        btn: [
            { type: 'main', text: lang('Save', 'pc.saveas.save'), js: 'closenotice();' },
            { type: 'detail', text: lang('取消', 'pc.saveas.cancel'), js: 'closenotice();' }
        ]
    },
    'word-open-files-fail': {
        cnt: lang(`<p class="tit">Open失败</p>
            <p>Word在试图Open文件时遇到错误<br /></p>`),
        btn: [
            { type: 'main', text: lang(lang('Close', 'close'), 'close'), js: 'closenotice();' }
        ]
    },
    'fs-api-unsupported': {
        cnt: lang(`<p class="tit">不支持的功能</p>
            <p>您的浏览器不支持文件系统访问 API。请使用 Chrome 或 Edge 浏览器。</p>`, 'nts.fs-api-unsupported'),
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' }
        ]
    },
    'fs-mount-error': {
        cnt: lang(`<p class="tit">挂载失败</p>
            <p>无法挂载本地文件夹，权限可能被拒绝。</p>`, 'nts.fs-mount-error'),
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' }
        ]
    },
    'unsupported-file-type': {
        cnt: lang(`<p class="tit">无法Open文件</p>
            <p>没有找到可以Open此类型文件的应用程序。</p>`, 'nts.unsupported-file-type'),
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' }
        ]
    },
    'file-read-error': {
        cnt: lang(`<p class="tit">读取失败</p>
            <p>无法读取文件内容，权限可能已过期。</p>`, 'nts.file-read-error'),
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' }
        ]
    },
    'file-write-error': {
        cnt: lang(`<p class="tit">保存失败</p>
            <p>无法写入文件，权限可能已过期。</p>`, 'nts.file-write-error'),
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' }
        ]
    },
    'unsaved-notepad': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('Save','save'), js: 'closenotice();apps.notepad.saveMounted().then(()=>{apps.notepad._forceClose();})' },
            { type: '', text: lang('Do not Save','discard'), js: 'closenotice();apps.notepad._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'unsaved-code-editor': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('Save','save'), js: 'closenotice();apps.codeEditor.save().then(()=>{apps.codeEditor._forceClose();})' },
            { type: '', text: lang('Do not Save','discard'), js: 'closenotice();apps.codeEditor._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'unsaved-notepad': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('Save','save'), js: 'closenotice();apps.notepad.saveMounted().then(()=>{apps.notepad._forceClose();})' },
            { type: '', text: lang('Do not Save','discard'), js: 'closenotice();apps.notepad._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'unsaved-code-editor': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('Save','save'), js: 'closenotice();apps.codeEditor.save().then(()=>{apps.codeEditor._forceClose();})' },
            { type: '', text: lang('Do not Save','discard'), js: 'closenotice();apps.codeEditor._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'error_aichat': {
        cnt: lang(`<p class="tit">AI Chat 无法使用</p>
            <p>暂时无法使用此功能，请转用语音输入球</p>`),
        btn: [
            { type: 'main', text: lang('OK', 'ok'), js: 'closenotice();' }
        ]
    },
};
function shownotice(name) {
    $('#notice>.cnt').html(nts[name].cnt);
    let tmp = '';
    nts[name].btn.forEach(btn => {
        tmp += `<a class="a btn ${btn.type}" onclick="${btn.js}">${btn.text}</a>`;
    });
    $('#notice>.btns').html(tmp);
    $('#notice-back').addClass('show');
    setTimeout(() => {
        $('#notice').addClass('show');
    }, 200);
}
function closenotice() {
    $('#notice').removeClass('show');
    setTimeout(() => {
        $('#notice-back').removeClass('show');
    }, 200);
}

function closeVideo() {
    var video = apps.camera.video
    if (video) {
        try {
            var stream = video.srcObject;
            var tracks = stream.getTracks();
            tracks.forEach(function (track) {
                track.stop();
            });
            video.srcObject = null;
        } catch (error) { }
    }
}

var shutdown_task = []; //关机任务，储存在这个数组里
// 为什么要数组？

// 运行的指令
function runcmd(cmd, inTerminal = false) {
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
${lang('For detailed info, type HELP command name', 'terminal.help.title')}
DIR             ${lang('Display directory listing', 'terminal.help.dir')}
LS              ${lang('Display directory listing (DIR alias)', 'terminal.help.ls')}
DEL             ${lang('Delete one or more files', 'terminal.help.del')}
CD              ${lang('Show or change directory', 'terminal.help.cd')}
CLS             ${lang('Clear screen', 'terminal.help.cls')}
HELP            ${lang('Provide help for Windows commands', 'terminal.help.help')}
SYSTEMINFO      ${lang('Display system information', 'terminal.help.systeminfo')}
SHUTDOWN        ${lang('Shut down computer', 'terminal.help.shutdown')}
CMD             ${lang('Open new command prompt window', 'terminal.help.cmd')}
EXIT            ${lang('Exit command prompt', 'terminal.help.exit')}

${lang('Easter egg commands:', 'terminal.help.easter')}
HELLO           ${lang('Say hello', 'terminal.help.hello')}
MATRIX          ${lang('Matrix effect', 'terminal.help.matrix')}
SNOW            ${lang('Snow effect', 'terminal.help.snow')}
DANCE           ${lang('Make windows dance', 'terminal.help.dance')}
STARWARS        ${lang('The Force awakens', 'terminal.help.starwars')}
`);
        }
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
                $('#win-terminal>.text-cmd').append(`错误: 拒绝访问。无法Delete系统关键文件或目录。\n`);
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
    else if (cmd.toLowerCase() === 'matrix') {
        if (inTerminal) {
            const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890'; // 哈？(from stsc)
            let matrix = '';

            // 创建一个专门的容器来放置 matrix 效果
            const matrixContainer = $('<div class="matrix-container" style="font-family: monospace; line-height: 1.2;"></div>');
            $('#win-terminal>.text-cmd').append(matrixContainer);

            for (let i = 0; i < 15; i++) {
                let line = '';
                for (let j = 0; j < 50; j++) {
                    const rand = Math.random();
                    if (rand < 0.3) {
                        line += `<span style="color: #0f0; text-shadow: 0 0 8px #0f0;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else if (rand < 0.4) {
                        line += `<span style="color: #fff; text-shadow: 0 0 8px #fff;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else {
                        line += `<span style="color: #050;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    }
                }
                matrix += line + '\n';
            }
            matrixContainer.html(matrix);

            // 添加动画效果
            const interval = setInterval(() => {
                const newLine = Array.from({ length: 50 }, () => {
                    const rand = Math.random();
                    if (rand < 0.3) {
                        return `<span style="color: #0f0; text-shadow: 0 0 8px #0f0;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else if (rand < 0.4) {
                        return `<span style="color: #fff; text-shadow: 0 0 8px #fff;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    } else {
                        return `<span style="color: #050;">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
                    }
                }).join('');

                const matrixContent = matrixContainer.html().split('\n');
                matrixContent.shift();
                matrixContent.push(newLine);
                matrixContainer.html(matrixContent.join('\n'));
            }, 100);

            // 10 秒后停止动画并Remove容器
            setTimeout(() => {
                clearInterval(interval);
                setTimeout(() => {
                    matrixContainer.fadeOut(500, function () {
                        $(this).remove();
                    });
                }, 500);
            }, 10000);
        }
        return true;
    }
    else if (cmd.toLowerCase() === 'snow') {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append('让整个屏幕下雪吧! ❄️\n');
            if (!$('#snow-container').length) {
                $('body').append(`
                    <div id="snow-container" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999;">
                        <div id="snow-pile" style="position: absolute; bottom: 0; left: 0; width: 100%; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; perspective: 1000px; transform-style: preserve-3d;"></div>
                    </div>
                `);
            }

            const snowflakes = ['❄', '❅', '❆', '✻', '✼', '❉'];
            const pileFlakes = ['❄', '❅', '❆'];
            const colors = ['#fff', '#eef', '#ddf'];
            let pileCount = 0;
            let lastPilePosition = 50; // 用于记录上一个堆积位置

            function createSnowflake() {
                const flake = snowflakes[Math.floor(Math.random() * snowflakes.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = Math.random() * 1.2 + 0.6;
                const left = Math.random() * 100;
                const fallDuration = 3 + Math.random() * 2;
                const $snowflake = $(`<span class="snowflake" style="position: absolute; left: ${left}%; top: -10%; font-size: ${size}em; color: ${color}; text-shadow: 0 0 5px ${color}; transition: all ${fallDuration}s linear; opacity: 0.8; transform: rotate(0deg) translateZ(0);">${flake}</span>`);

                $('#snow-container').append($snowflake);

                setTimeout(() => {
                    const rotation = Math.random() * 360;
                    const finalLeft = left + (Math.random() - 0.5) * 20;
                    $snowflake.css({
                        transform: `rotate(${rotation}deg) translateZ(0)`,
                        top: '90%',
                        left: `${finalLeft}%`
                    });
                }, 50);

                setTimeout(() => {
                    $snowflake.css({
                        transition: 'all 0.5s ease-out',
                        opacity: 0
                    });

                    if (pileCount < 200) {
                        const pileFlake = pileFlakes[Math.floor(Math.random() * pileFlakes.length)];
                        const pileSize = Math.random() * 0.4 + 0.3; // 减小堆积雪花的大小

                        // 计算新的堆积位置，使其更自然
                        const deviation = (Math.random() - 0.5) * 30;
                        lastPilePosition = Math.max(10, Math.min(90, lastPilePosition + deviation));
                        const pileLeft = lastPilePosition;

                        // 计算堆积高度，使其形成自然的山形
                        const baseHeight = Math.sin((pileLeft - 50) * Math.PI / 180) * 20;
                        const pileHeight = Math.max(0, 20 - Math.abs(pileLeft - 50) / 2.5 + baseHeight);

                        const $pile = $(`<span style="position: absolute; left: ${pileLeft}%; bottom: ${pileHeight}px; font-size: ${pileSize}em; opacity: 0; transform: scale(0) translateZ(${Math.random() * 50}px); transition: all 0.3s ease-out;">${pileFlake}</span>`);
                        $('#snow-pile').append($pile);

                        setTimeout(() => {
                            $pile.css({
                                transform: `scale(1) translateZ(${Math.random() * 50}px) rotate(${Math.random() * 30 - 15}deg)`,
                                opacity: 0.85
                            });
                        }, 50);

                        pileCount++;
                    }

                    setTimeout(() => $snowflake.remove(), 500);
                }, fallDuration * 1000);
            }

            // 持续创建新雪花
            const snowInterval = setInterval(() => {
                if ($('#snow-container .snowflake').length < 100) {
                    createSnowflake();
                }
            }, 200);

            // 30 秒后停止动画并缓慢消失
            setTimeout(() => {
                clearInterval(snowInterval);
                // 让所有堆积的雪花缓慢消失
                $('#snow-pile span').each(function (i) {
                    const $pile = $(this);
                    setTimeout(() => {
                        $pile.css({
                            transition: 'all 0.5s ease-in',
                            opacity: 0,
                            transform: 'scale(0) translateY(10px)'
                        });
                    }, Math.random() * 2000);
                });
                // 让飘落的雪花消失
                $('#snow-container .snowflake').each(function (i) {
                    const $flake = $(this);
                    setTimeout(() => {
                        $flake.css({
                            transition: 'all 1s ease-in',
                            opacity: 0
                        });
                    }, Math.random() * 2000);
                });
                setTimeout(() => {
                    $('#snow-container').fadeOut(1000, function () {
                        $(this).remove();
                    });
                }, 2500);
            }, 30000);
        }
        return true;
    }
    else if (cmd.toLowerCase() === 'dance') {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append('窗口开始跳舞啦! ♪(^∇^*)\n');
            const windows = $('.window:not(.min)');
            const danceSteps = [
                { transform: 'rotate(5deg) translateY(-10px)' },
                { transform: 'rotate(-5deg) translateY(0px)' },
                { transform: 'rotate(5deg) translateX(10px)' },
                { transform: 'rotate(-5deg) translateX(-10px)' },
                { transform: 'rotate(0deg) translate(0, 0)' }
            ];

            windows.each(function () {
                const win = $(this);
                let danceCount = 0;
                const danceInterval = setInterval(() => {
                    danceCount++;
                    win.css({
                        transition: 'transform 0.3s ease-in-out',
                        transform: danceSteps[danceCount % danceSteps.length].transform
                    });

                    // 跳舞 15 次后停止
                    if (danceCount >= 15) {
                        clearInterval(danceInterval);
                        win.css({
                            transition: 'transform 0.5s ease-out',
                            transform: 'none'
                        });
                    }
                }, 300);
            });
        }
        return true;
    }
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
                // 如果不是在终端中执行，则Open终端
                if (!inTerminal) {
                    openapp('terminal');
                    $('#win-terminal').html('<pre class="text-cmd"></pre>');
                }
                // 显示帮助信息
                $('#win-terminal>.text-cmd').append(`
shutdown [-s] [-r] [-f] [-a] [-t time]
-s:关机
-r:Restart
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
            let operation = '';       // 操作类型（关机/Restart/注销）
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
                            { type: 'main', text: lang('Close', 'close'), js: 'closenotice();' },
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
                operation = 'restart';     // Restart
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
                <p class="tit">即将${operation === 'restart' ? 'Restart' : operation === 'logoff' ? '注销' : '关机'}</p>
                <p>Windows will shut down in ${timeString} 后${operation === 'restart' ? 'Restart' : operation === 'logoff' ? '注销' : '关机'}。</p>`,
                btn: [
                    { type: 'main', text: lang('Close', 'close'), js: 'closenotice();' },
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
    else if (cmd.toLowerCase() === 'starwars') {
        if (inTerminal) {
            $('#win-terminal>.text-cmd').append('原力与你同在... ⚔️\n');

            // 创建星球大战容器
            const starWarsContainer = $('<div class="starwars-container" style="font-family: monospace; perspective: 400px; color: #ffd700; position: relative; height: 400px; overflow: hidden; background: #000;"></div>');
            $('#win-terminal>.text-cmd').append(starWarsContainer);

            // 添加星球大战文本
            const text = `
            Episode XII
            WIN12 STRIKES BACK

            在遥远的未来，一个充满
            科技的银河系中...

            Windows 操作系统已经
            进化到了第 12 代。

            然而，这个系统不仅仅
            是一个操作系统，它是
            一个充满原力的存在。

            此刻，一股神秘的力量
            正在你的电脑中觉醒...

            你，就是那个被选中的人，
            将带领这个系统走向新的
            纪元...

            愿原力与你同在！
            `;

            const crawl = $(`<div class="crawl" style="position: relative; top: 400px; transform-origin: 50% 100%; transform: rotateX(60deg); text-align: center; font-size: 24px; line-height: 1.5; white-space: pre-line; text-shadow: 0 0 10px #ffd700;"></div>`);
            crawl.html(text);
            starWarsContainer.append(crawl);

            // 添加动态背景星星
            for (let i = 0; i < 200; i++) {
                const size = Math.random() * 2 + 1;
                const speed = Math.random() * 3 + 1;
                const star = $(`<div class="star" style="position: absolute; width: ${size}px; height: ${size}px; background: #fff; left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation: twinkle ${speed}s infinite alternate;"></div>`);
                starWarsContainer.append(star);
            }

            // 添加 CSS 动画
            const style = $(`<style>
                @keyframes twinkle {
                    0% { opacity: 0.2; }
                    100% { opacity: 1; }
                }
                .star {
                    border-radius: 50%;
                    box-shadow: 0 0 3px #fff;
                }
                .crawl {
                    animation: crawl 30s linear;
                }
                @keyframes crawl {
                    0% { top: 400px; opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: -1000px; opacity: 0; }
                }
            </style>`);
            starWarsContainer.append(style);

            // 30 秒后清理
            setTimeout(() => {
                starWarsContainer.fadeOut(2000, function () {
                    $(this).remove();
                });
            }, 30000);
        }
        return true;
    }
    return false;
}


// 语音球

var voiceBall = document.getElementById("voiceBall"); 
var nbFlag = true; 
var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; 
var isDragging = false; 

voiceBall.addEventListener("pointerdown", dragMouseDown); 
voiceBall.addEventListener("pointerup", stopDrag); 

function dragMouseDown(e) { 
  e.preventDefault(); 
  pos3 = e.clientX; 
  pos4 = e.clientY; 
  document.addEventListener("pointermove", elementDrag); 
  isDragging = false; 
} 

function elementDrag(e) { 
  e.preventDefault(); 
  pos1 = pos3 - e.clientX; 
  pos2 = pos4 - e.clientY; 
  pos3 = e.clientX; 
  pos4 = e.clientY; 
  voiceBall.style.top = (voiceBall.offsetTop - pos2) + "px"; 
  voiceBall.style.left = (voiceBall.offsetLeft - pos1) + "px"; 
  isDragging = true; 
} 

function stopDrag() { 
  document.removeEventListener("pointermove", elementDrag); 
  if (!isDragging) { 
    startSpeechRecognition(); 
  } 
}

function insertTextAtCursor(text) {
    var range, selection;

    if (window.getSelection) {
        selection = window.getSelection();

        if (selection.rangeCount) {
            range = selection.getRangeAt(0);

            if (range.commonAncestorContainer.parentNode.isContentEditable) {
                range.collapse(false);
                var textNode = document.createTextNode(text);
                range.insertNode(textNode);

                range.setEndAfter(textNode);
                range.setStartAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            else {
                var el = document.activeElement;
                const start = el.selectionStart;
                const value = el.value;
                el.value = value.slice(0, start) + text + value.slice(el.selectionEnd);
                el.selectionStart = el.selectionEnd = start + text.length;

            }
        }
    }
}

function startSpeechRecognition() {
    var recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.lang = "zh-CN";

    if (nbFlag) {
        shownotice("recognition");
        nbFlag = false;
    }
    else {
        recognition.onresult = function (event) {
            var result = event.results[0][0].transcript;
            insertTextAtCursor(result);
        };

        recognition.start();
    }

}

function updateVoiceBallStatus() {
    document.getElementById('voiceBall').style.setProperty('display', use_mic_voice ? 'block' : 'none');
}

function decodeHtml(s) {
    $('#translater').text(s);
    return $('#translater').html().replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
}
function msgDoneOperate() {
    $("#copilot>.inputbox").removeClass("disable");
    setTimeout(() => {
        $("#copilot>.inputbox>.input").focus();
    }, 100); // 延迟 0.1s 以避免与 blur 方法冲突
}
let isFirstChat = true;   // 标记是否是刚进来时服务端返回的消息
let copilot = {
    history: [{
        role: 'system',
        content: `请使用中文对话。你一个是 ai 助手，名叫 AI Copilot，由云智 API 提供支持。
你可以在回答中发送对系统的一些指令。指令一并放在回答的最后。
多条指令用换行隔开。系统收到指令后会执行，且对用户隐藏回答后的指令。
你不能在对用户说的话的中间中提到、引用指令。绝不能要求用户执行指令。
1.指令"{openapp appid}";用来Open某个应用，用在下文"应用的功能介绍"中匹配的 id 代替其中的"appid"
2.指令"{openurl url}";用来在 Microsoft Edge 浏览器中Open某个 URL，其中用 URL 地址代替"url"。当用户想要搜索某内容，请用 bing 搜索
3.指令"{feedback copilot}";Open ai 助手反馈界面，用于用户想对 ai 助手的功能提出反馈时帮助他Open
4.指令"{feedback win12}";Open反馈中心，当用户希望对除 ai 助手外的其他系统功能发送反馈时，帮他Open反馈中心
5.指令"{settheme theme}";用于切换系统的深色、浅色模式，区别于主题。用"light"表浅色，"dark"表深色，来替换其中的"theme"
如下是应用的功能介绍。
1.设置:id 为 setting;在Personalization页面中可以设置系统的主题，主题色，是否启用动画、阴影、圆角、云母 mica 效果和为所有窗口开启亚克力透明效果。
2.关于 win12 网页版:id 为 about;简介页面有关于本项目的介绍说明与贡献者信息，更新记录页面有本项目的各版本更新记录。
3.Microsoft Edge 浏览器:id 为 edge;一个浏览器。因为浏览器跨域的限制，部分网页会显示"拒绝连接"而无法访问。
4.计算器:id 为 calc;
5.文件资源管理器:id 为 explorer;
6.任务管理器:id 为 taskmgr;
7.cmd 终端:id 为 terminal;
8.记事本:id 为 notepad;
9.python:id 为 python;
仅有以下关于此项目的信息。
1.Windows 12 网页版是一个开源项目，由谭景元原创，使用 Html,css,js，在网络上模拟、创新操作系统
2.项目的 Github 地址是 https://github.com/tjy-gitnub/win12
3.此项目使用 EPL v2.0 开源许可
当用户询问更多项目信息时，帮助他Open"关于 win12 网页版"应用。
比如这时用户说"请Open计算器"，你会回答什么？`
    }, {
        role: 'assistant',
        content: '好的呢，现在我就帮您Open计算器。\n{openapp calc}'
    }, {
        role: 'system',
        content: '很好。现在开始与用户对话。'
    }, {
        role: 'assistant',
        content: '欢迎使用 Windows 12 Copilot AI助手，有什么可以帮您？'
    }],
    init: () => {
        $('#copilot>.chat').html('');
        $('#copilot>.chat').append(`<div class="line system"><p class="text">本 AI 助手基于 Deepseek v4 pro 模型，目前支持以下操作：<br>
        1.Open除 webapp 外大多应用<br>
        2.在浏览器中Open链接、搜索<br>
        3.发送对系统、AI 助手的反馈<br>
        4.切换颜色主题<br>
        需注意，根据相关法律法规，我们不向欧盟用户提供服务。</p></div>`);
        setTimeout(() => {
            $('#copilot>.chat').append(`<div class="line ai"><p class="text">欢迎使用 Windows 12，有什么可以帮您？</p></div>`);
            $('#copilot>.inputbox').removeClass('disable');
            $('#copilot>.chat').scrollTop($('#copilot>.chat')[0].scrollHeight);
        }, 200);
    },
    send: (t, showusr = true, role = 'user') => {
        // 输入验证
        if (t.length == 0) {
            $('#copilot>.chat').append('<div class="line system"><p class="text">请发一些有意义的东西</p></div>');
            $('#copilot>.chat').scrollTop($('#copilot>.chat')[0].scrollHeight);
            msgDoneOperate();
            return;
        }

        $('#copilot>.inputbox').addClass('disable');

        // 显示用户消息
        if (showusr) {
            $('#copilot>.chat').append(`<div class="line user"><p class="text">${t}</p></div>`);
        }
        copilot.history.push({ role: role, content: t });
        $('#copilot>.chat').scrollTop($('#copilot>.chat')[0].scrollHeight);
        // 存储 uid
        const uid = localStorage.getItem('copilot_uid') ||
            (() => {
                const newUid = Math.floor(100000 + Math.random() * 900000); // 生成 100000-999999 的随机六位数
                localStorage.setItem('copilot_uid', newUid.toString());
                return newUid;
            })();
        // 构建 API 请求 URL
        const encodedQuestion = encodeURIComponent(t);
        const apiUrl = `https://yunzhiapi.cn/vip/win12/deepseek-v4-pro/index.php?question=${encodedQuestion}&system=${encodeURIComponent(copilot.history[0].content)}&uid=${uid}`;

        // API 请求
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function (responseText) {
                msgDoneOperate();

                // 处理特殊命令
                let rt = responseText;
                let r = [];
                if (/{.+}/.test(rt)) {
                    r = rt.match(/{.+?}/g) || [];
                }

                if (r.length) {
                    for (const i of r) {
                        if (/{openapp .+?}/.test(i)) {
                            let t = i.match(/(?<={openapp ).+(?=})/)[0];
                            if ($('.window.' + t).length) {
                                openapp(t);
                                rt = rt.replace(i, `<div class="action"><p class="tit">Open应用</p><p class="detail">${$(`.window.${t}>.titbar>p`).text()}</p></div>`);
                            } else {
                                rt = rt.replace(i, `<div class="action"><p class="tit">Open应用</p><p class="detail">${t} <span style="color:red">(AI 理解力较差，见谅)</span></p></div>`);
                            }
                        } else if (/{openurl .+?}/.test(i)) {
                            const t = i.match(/(?<={openurl ).+(?=})/)[0];
                            openapp('edge');
                            apps.edge.newtab();
                            apps.edge.goto(t);
                            rt = rt.replace(i, `<div class="action"><p class="tit">Open URL</p><p class="detail">${decodeHtml(t)}</p></div>`);
                        } else if (/{feedback win12}/.test(i)) {
                            shownotice('feedback');
                            rt = rt.replace(i, '<div class="action"><p class="tit">反馈</p><p class="detail">关于 Windows 12 网页版</p></div>');
                        } else if (/{feedback copilot}/.test(i)) {
                            shownotice('feedback-copilot');
                            rt = rt.replace(i, '<div class="action"><p class="tit">反馈</p><p class="detail">关于 Windows 12 Copilot</p></div>');
                        } else if (/{settheme .+?}/.test(i)) {
                            const t = i.match(/(?<={settheme ).+(?=})/)[0];
                            if ((t == 'light' && $(':root').hasClass('dark')) || (t == 'dark' && !$(':root').hasClass('dark'))) {
                                toggletheme();
                            }
                            if (t != 'light' && t != 'dark')
                                rt = rt.replace(i, `<div class="action"><p class="tit">切换外观模式</p><p class="detail">${t} 模式 <span style="color:red">(AI 理解力较差，见谅)</span></p></div>`);
                            else
                                rt = rt.replace(i, `<div class="action"><p class="tit">切换外观模式</p><p class="detail">${t == 'dark' ? '深色' : '浅色'} 模式</p></div>`);
                        }
                    }
                    $('#copilot>.chat').append(`<div class="line ai"><div class="text">${rt}</div></div>`);
                } else {
                    $('#copilot>.chat').append(`<div class="line ai"><p class="text">${decodeHtml(rt)}</p></div>`);
                }

                copilot.history.push({ role: 'assistant', content: responseText });
                $('#copilot>.chat').scrollTop($('#copilot>.chat')[0].scrollHeight);
                msgDoneOperate();
            },
            error: function (error) {
                console.log(error);
                $('#copilot>.chat').append('<div class="line system"><p class="text">发生错误，请查看控制台输出或重试</p></div>');
                $('#copilot>.chat').scrollTop($('#copilot>.chat')[0].scrollHeight);
                msgDoneOperate();
            }
        });
    },
    ana: (resp) => {

    }
};
// 日期、时间
let da = new Date();

const date = {
    'zh-CN': `星期${['日', '一', '二', '三', '四', '五', '六'][da.getDay()]}, ${da.getFullYear()}年${(da.getMonth() + 1).toString().padStart(2, '0')}月${da.getDate().toString().padStart(2, '0')}日`,
    'zh-TW': `星期${['日', '一', '二', '三', '四', '五', '六'][da.getDay()]}, ${da.getFullYear()}年${(da.getMonth() + 1).toString().padStart(2, '0')}月${da.getDate().toString().padStart(2, '0')}日`,
    en: `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][da.getDay()]}, ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][da.getMonth()]} ${da.getDate().toString().padStart(2, '0')}, ${da.getFullYear()}`
}[langcode];

$('#startmenu-r>.row1>.tool>.date').text(date);
$('.dock.date>.date').text(`${da.getFullYear()}/${(da.getMonth() + 1).toString().padStart(2, '0')}/${da.getDate().toString().padStart(2, '0')}`);
$('#datebox>.tit>.date').text(date);
function loadtime() {
    let d = new Date();
    let time = d.toLocaleTimeString();
    $('#startmenu-r>.row1>.tool>.time').text(time);
    $('.dock.date>.time').text(time);
    $('#datebox>.tit>.time').text(time);
    $('.settingTime').text(time);
}
// apps.setting.theme_get();//提前加载主题
loadtime();
setTimeout(() => {
    loadtime(); setInterval(loadtime, 1000);
}, 1000 - da.getMilliseconds());//修复时间不精准的问题。以前的误差：0-999 毫秒；现在：几乎没有
let d = new Date();
let today = new Date().getDate();
let start = 7 - ((d.getDate() - d.getDay()) % 7) + 1;
let daysum = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
for (let i = 1; i < start; i++) {
    $('#datebox>.cont>.body')[0].innerHTML += '<span></span>';
}
for (let i = 1; i <= daysum; i++) {
    if (i == today) {
        $('#datebox>.cont>.body')[0].innerHTML += `<p class="today">${i}</p>`;
        continue;
    }
    $('#datebox>.cont>.body')[0].innerHTML += `<p>${i}</p>`;
}
function pinapp(id, name, command) {
    if ($('#startmenu-r>.pinned>.apps>.a.sm-app.' + id).length) return;
    $('#startmenu-r>.pinned>.apps').append(`<a class='a sm-app enable ${id}' onclick='${command}';hide_startmenu();' oncontextmenu='return showcm(event,\"smapp\",[\"${id}\",\"${name}\"])'><img src='icon/${geticon(id)}'><p>${name}</p></a>`);
}

// 应用方法

// png 格式的图标在此备注，否则以 标识+.svg 的名称自动检索
const icon = {
    bilibili: 'bilibili.png',
    vscode: 'vscode.png',
    // python: 'python.png',
    winver: 'about.svg',
    // run: 'run.png',
    // whiteboard: 'whiteboard.png',
    taskmgr: 'taskmgr.png',
    imgviewer: 'files/picture.png',
    'code-editor': 'vscode.png',
    mediaplayer: 'files/vidio.png',
    pdfviewer: 'files/pdf.svg'
};
function geticon(name) {
    if (icon[name]) return icon[name];
    else return name + '.svg';
}

function syncTaskbarLayout() {
    const count = $('#taskbar>a').length;
    $('#taskbar').attr('count', count);
    $('#taskbar').css('display', count == 0 ? 'none' : 'flex');
    $('#taskbar').css('width', 4 + count * (34 + 4));
}

function openapp(name) {
    if (taskmgrTasks.findIndex(elt => elt.link == name) > -1 && apps.taskmgr.tasks.findIndex(elt => elt.link == name) == -1) {
        apps.taskmgr.tasks.splice(apps.taskmgr.tasks.length, 0, taskmgrTasks.find(elt => elt.link == name));
    }
    if ($('#taskbar>.' + name).length != 0) {
        if ($('.window.' + name).hasClass('min')) {
            minwin(name);
        }
        focwin(name);
        return;
    }
    $('.window.' + name).addClass('load');
    showwin(name);
    $('#taskbar').append(`<a class="${name}" onclick="taskbarclick('${name}\')" win12_title="${$(`.window.${name}>.titbar>p`).text()}" onmouseenter="showdescp(event)" onmouseleave="hidedescp(event)" oncontextmenu="return showcm(event, 'taskbar', '${name}')"><img src="icon/${icon[name] || (name + '.svg')}"></a>`);
    syncTaskbarLayout();
    $('#taskbar>.' + name).addClass('foc');
    setTimeout(() => {
        syncTaskbarLayout();
    }, 0);
    let tmp = name.replace(/\-(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
    if (apps[tmp].load && !apps[tmp].loaded) {
        apps[tmp].loaded = true;
        apps[tmp].load();
        apps[tmp].init();
        $('.window.' + name).removeClass('load');
        return;
    }
    apps[tmp].init();
    setTimeout(() => {
        $('.window.' + name).removeClass('load');
    }, Number($('.window.' + name + '>.loadback').attr('data-delay')) || 500);
}

// 开始菜单一类



//Open任务栏按钮对应的 widget

// 为啥管这个东西叫 widget?? from stsc
function openDockWidget(name) {
    if (name == "start-menu") { //Open开始菜单
        if ($('#start-menu').hasClass('show')) {
            hide_startmenu();
        }
        else {
            $('#start-btn').addClass('show');
            if ($('#search-win').hasClass('show')) {
                $('#search-btn').removeClass('show');
                $('#search-win').removeClass('show');
                setTimeout(() => {
                    $('#search-win').removeClass('show-begin');
                }, 200);
                hide_widgets();
            }
            if ($('#widgets').hasClass('show')) hide_widgets();
            $('#start-menu').addClass('show-begin');
            setTimeout(() => {
                $('#start-menu').addClass('show');
            }, 0);
        }
    } else if (name == "search-win") {   //Open搜索框
        if ($('#search-win').hasClass('show')) {
            $('#search-btn').removeClass('show');
            $('#search-win').removeClass('show');
            setTimeout(() => {
                $('#search-win').removeClass('show-begin');
            }, 200);
        }
        else {
            $('#search-btn').addClass('show');
            if ($('#start-menu').hasClass('show')) hide_startmenu();
            if ($('#widgets').hasClass('show')) hide_widgets();
            $('#search-win').addClass('show-begin');
            setTimeout(() => {
                $('#search-win').addClass('show');
            }, 0);
            $('#search-input').focus();
        }
    } else if (name == "widgets") {  //Open小组件
        if ($('#widgets').hasClass('show')) {
            hide_widgets();
        }
        else {
            $('#widgets-btn').addClass('show');
            if ($('#search-win').hasClass('show')) {
                $('#search-btn').removeClass('show');
                $('#search-win').removeClass('show');
                setTimeout(() => {
                    $('#search-win').removeClass('show-begin');
                }, 200);
            }
            if ($('#start-menu').hasClass('show')) hide_startmenu();
            $('#widgets').addClass('show-begin');
            setTimeout(() => {
                $('#widgets').addClass('show');
            }, 0);
            $('#widgets-input').focus();
        }
    } else if (name == "control") {  //Open控制
        if ($('#control').hasClass('show')) {
            $('#control').removeClass('show');
            setTimeout(() => {
                $('#control').removeClass('show-begin');
            }, 200);
        }
        else {
            if ($('#datebox').hasClass('show')) {
                $('.dock.date').removeClass('show');
                $('#datebox').removeClass('show');
                setTimeout(() => {
                    $('#datebox').removeClass('show-begin');
                }, 200);
            }
            $('#control').css('left', $('.a.dock.control').position().left - 123);
            $('#control').addClass('show-begin');
            setTimeout(() => {
                $('#control').addClass('show');
            }, 0);
        }
    } else if (name == "datebox") {  //Open时间框
        if ($('#datebox').hasClass('show')) {
            $('.dock.date').removeClass('show');
            $('#datebox').removeClass('show');
            setTimeout(() => {
                $('#datebox').removeClass('show-begin');
            }, 200);
        }
        else {
            if ($('#control').hasClass('show')) {
                $('#control').removeClass('show');
                setTimeout(() => {
                    $('#control').removeClass('show-begin');
                }, 200);
            }
            $('.dock.date').addClass('show');
            $('#datebox').css('left', $('.a.dock.date').position().left - 125);
            $('#datebox').addClass('show-begin');
            setTimeout(() => {
                $('#datebox').addClass('show');
            }, 0);
        }
    } else {
        console.err("openDockWidget() 传递的 name 不正确！");
    }
}

function removeEdgeSaveUrl(classname) {
    $('.' + classname).remove()
}

function hide_startmenu() {
    $('#start-menu').removeClass('show');
    $('#start-btn').removeClass('show');
    setTimeout(() => { $('#start-menu').removeClass('show-begin'); }, 200);
}
function hide_search() {
    $('#search-win').removeClass('show');
    $('#search-btn').removeClass('show');
    setTimeout(() => { $('#search-win').removeClass('show-begin'); }, 200);
}
function hide_widgets() {
    $('#widgets').removeClass('show');
    $('#widgets-btn').removeClass('show');
    setTimeout(() => { $('#widgets').removeClass('show-begin'); }, 200);
}
const FLY_HIDDEN_LIST_KEY = 'control_status_fly_hidden_list'
function controlStatus(name) {
    if (this.classList.contains('active')) {
        this.classList.remove('active');
        if (name == 'wifi') {
            wifiStatus = false;
        }
        if (name == 'fly') {
            flyStatus = false
            if (localStorage.getItem(FLY_HIDDEN_LIST_KEY)) {
                const flyHiddenData = JSON.parse(localStorage.getItem(FLY_HIDDEN_LIST_KEY))
                const flyHiddenList = Array.isArray(flyHiddenData) ? flyHiddenData : []
                flyHiddenList.forEach(item => {
                    const dom = $(`#control .${item} .icon`)
                    if (!dom.hasClass('active')) {
                        dom.addClass('active')
                    }
                })
                localStorage.removeItem(FLY_HIDDEN_LIST_KEY)
            }
        }
    }
    else if (!this.classList.contains('active')) {
        this.classList.add('active');
        if (name == 'wifi') {
            wifiStatus = true;
        }
        if (name == 'fly') {
            flyStatus = true
            const hiddenList = ['btn1', 'btn2', 'btn5']
            const hiddenDiffList = []
            hiddenList.forEach(item => {
                const dom = $(`#control .${item} .icon`)
                if (dom.hasClass('active')) {
                    dom.removeClass('active')
                    hiddenDiffList.push(item)
                }
            })
            localStorage.setItem(FLY_HIDDEN_LIST_KEY, JSON.stringify(hiddenDiffList))
        }
    }
    if (name == 'dark') {
        $('html').toggleClass('night');
        if ($('html').hasClass('night')) {
            setTimeout(() => {
                alert('别看屏幕了，去休息眼睛吧~');
            }, 200);
        }
    }
}
// 控制面板 亮度调整
function dragBrightness(e) {
    const container = $('#control>.cont>.bottom>.brightness>.range-container')[0];
    const after = $('#control>.cont>.bottom>.brightness>.range-container>.after')[0];
    const slider = $('#control>.cont>.bottom>.brightness>.range-container>.slider-btn')[0];
    const viewport = container.getBoundingClientRect().left;
    const width = Number(window.getComputedStyle(container, null).width.split('px')[0]);
    move(e);
    page.onmousemove = move;
    page.ontouchmove = move;
    container.classList.add('active');
    function move(e) {
        let clientX;
        if (e.type.match('mouse')) {
            clientX = e.clientX;
        }
        else if (e.type.match('touch')) {
            clientX = e.touches[0].clientX;
        }
        var _offset = clientX - viewport;

        const limit = 2; // 亮度条件限制

        if (_offset < 0) {
            _offset = 0;
        }
        else if (_offset > limit * width) {
            _offset = limit * width;
        }
        slider.style.marginLeft = _offset + 'px';
        after.style.left = _offset + 'px';
        after.style.width = width - _offset + 'px';
        if (_offset / width > 0.3 && _offset / width < limit) {
            page.style.filter = `brightness(${_offset / width})`;
        }
        else if (_offset / width < limit) {
            page.style.filter = 'brightness(0.3)';
        } else {
            page.style.filter = `brightness(${limit})`;
        }
    }
    function up() {
        container.classList.remove('active');
        page.onmouseup = null;
        page.ontouchend = null;
        page.ontouchcancel = null;
        page.onmousemove = null;
        page.ontouchmove = null;
    }
    page.onmouseup = up;
    page.ontouchend = up;
    page.ontouchcancel = up;
}

// 控制面板 电量监测
function setBatteryTooltip(title) {
    const el = $('.a.dock.control')[0];
    if (el) {
        el.setAttribute('win12_title', title);
        el.setAttribute('title', title);
    }
}

function getBatteryTooltip(level, charging) {
    const percent = Math.round(level * 100);
    const chargingText = charging ? lang(', charging', 'battery.charging') : '';
    return `${lang('Battery: ', 'battery.level')}${percent}%${chargingText}`;
}

function setBatteryUnavailableTooltip() {
    setBatteryTooltip(lang('Unable to get battery level', 'battery.unavailable'));
}

if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
        // 检查 battery 对象和 level 属性是否存在且有效
        if (battery && typeof battery.level === 'number' && !isNaN(battery.level)) {
            const batteryLevel = Math.max(0, Math.min(1, battery.level)); // 确保在 0-1 范围内
            const batteryWidth = 18 * batteryLevel + 5;

            setBatteryTooltip(getBatteryTooltip(batteryLevel, battery.charging));

            const pathElement = $('.a.dock.control>svg>path')[0];
            if (pathElement) {
                pathElement.outerHTML = `<path
                    d="M 4 7 C 2.3550302 7 1 8.3550302 1 10 L 1 19 C 1 20.64497 2.3550302 22 4 22 L 24 22 C 25.64497 22 27 20.64497 27 19 L 27 10 C 27 8.3550302 25.64497 7 24 7 L 4 7 z M 4 9 L 24 9 C 24.56503 9 25 9.4349698 25 10 L 25 19 C 25 19.56503 24.56503 20 24 20 L 4 20 C 3.4349698 20 3 19.56503 3 19 L 3 10 C 3 9.4349698 3.4349698 9 4 9 z M 5 11 L 5 18 L ${batteryWidth} 18 L ${batteryWidth} 11 L 5 11 z M 28 12 L 28 17 L 29 17 C 29.552 17 30 16.552 30 16 L 30 13 C 30 12.448 29.552 12 29 12 L 28 12 z"
            id="path2" fill="#000000"
        />`;

                // 检查 addEventListener 是否存在
                if (battery.addEventListener && typeof battery.addEventListener === 'function') {
                    battery.addEventListener('levelchange', () => {
                        if (battery && typeof battery.level === 'number' && !isNaN(battery.level)) {
                            const updatedLevel = Math.max(0, Math.min(1, battery.level));
                            const updatedWidth = 18 * updatedLevel + 5;

                            setBatteryTooltip(getBatteryTooltip(updatedLevel, battery.charging));

                            const updatedPathElement = $('.a.dock.control>svg>path')[0];
                            if (updatedPathElement) {
                                updatedPathElement.outerHTML = `<path
                                    d="M 4 7 C 2.3550302 7 1 8.3550302 1 10 L 1 19 C 1 20.64497 2.3550302 22 4 22 L 24 22 C 25.64497 22 27 20.64497 27 19 L 27 10 C 27 8.3550302 25.64497 7 24 7 L 4 7 z M 4 9 L 24 9 C 24.56503 9 25 9.4349698 25 10 L 25 19 C 25 19.56503 24.56503 20 24 20 L 4 20 C 3.4349698 20 3 19.56503 3 19 L 3 10 C 3 9.4349698 3.4349698 9 4 9 z M 5 11 L 5 18 L ${updatedWidth} 18 L ${updatedWidth} 11 L 5 11 z M 28 12 L 28 17 L 29 17 C 29.552 17 30 16.552 30 16 L 30 13 C 30 12.448 29.552 12 29 12 L 28 12 z"
                id="path2" fill="#000000"
            />`;
                            }
                        }
                    });
                }
            }
        } else {
            setBatteryUnavailableTooltip();
        }
    }).catch((error) => {
        // 静默处理错误，电池 API 在某些浏览器中不可用是正常的
        console.log('电池 API 不可用：', error);
        setBatteryUnavailableTooltip();
    });
} else {
    setBatteryUnavailableTooltip();
}

// 任务管理器 记录硬件运行时间
if (localStorage.getItem('cpuRunningTime')) {
    apps.taskmgr.cpuRunningTime = localStorage.getItem('cpuRunningTime');
}
window.setInterval(() => {
    apps.taskmgr.cpuRunningTime++;
    localStorage.setItem('cpuRunningTime', apps.taskmgr.cpuRunningTime);
}, 1000);

var wifiStatus = true;
// 飞行模式
var flyStatus = false;

// 选择框
let chstX, chstY;
function ch(e) {
    $('#desktop>.selection').css('left', Math.min(chstX, e.clientX));
    $('#desktop>.selection').css('width', Math.abs(e.clientX - chstX));
    $('#desktop>.selection').css('display', 'block');
    $('#desktop>.selection').css('top', Math.min(chstY, e.clientY));
    $('#desktop>.selection').css('height', Math.abs(e.clientY - chstY));
}
$('#desktop')[0].addEventListener('mousedown', e => {
    chstX = e.clientX;
    chstY = e.clientY;
    this.onmousemove = ch;
});
window.addEventListener('mouseup', e => {
    this.onmousemove = null;
    $('#desktop>.selection').css('left', 0);
    $('#desktop>.selection').css('top', 0);
    $('#desktop>.selection').css('display', 'none');
    $('#desktop>.selection').css('width', 0);
    $('#desktop>.selection').css('height', 0);
});
let isDark = false;

// Personalization主题
function toggletheme() {
    $('.dock.theme').toggleClass('dk');
    // var darkControl = $(`#control .btn4 .icon`)
    $(':root').toggleClass('dark');
    if ($(':root').hasClass('dark')) {
        $('.window.whiteboard>.titbar>p').text('Blackboard');
        setData('theme', 'dark');
        isDark = true;
        // darkControl.addClass('active')
    } else {
        $('.window.whiteboard>.titbar>p').text('Whiteboard');
        setData('theme', 'light');
        isDark = false;
        // darkControl.removeClass('active')
    }
}

// Only set theme based on system preference if no user preference is stored
if (localStorage.getItem('theme') === null) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) { //是深色
        $('.dock.theme').toggleClass('dk');
        $(':root').toggleClass('dark');
        $('.window.whiteboard>.titbar>p').text('Blackboard');
        localStorage.setItem('theme', 'dark');
        isDark = true;
    } else { // 不是深色
        $('.window.whiteboard>.titbar>p').text('Whiteboard');
        localStorage.setItem('theme', 'light');
    }
}

// 桌面图标的初始化
let desktopItem = [];

function saveDesktop() {
    const data = {
        desktop: JSON.stringify(desktopItem),
        topmost: JSON.stringify(topmost),
        sys_setting: JSON.stringify(sys_setting),
        root_class: $(':root').attr('class')
    };

    Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });
}

function setIcon() {
    // return;
    if (!Array.isArray(JSON.parse(localStorage.getItem('desktop')))) {
        setData('desktop', '[]')
    }
    if (Array.isArray(JSON.parse(localStorage.getItem('desktop')))) {
        $('#desktop')[0].innerHTML = `<div ondblclick="openapp('explorer');" ontouchstart="openapp('explorer');" oncontextmenu="return showcm(event,'desktop.icon',['explorer',-1]);" appname="explorer">
        <img src="apps/icons/explorer/thispc.svg">
        <p>${lang('This PC', 'explorer.thispc')}</p>
    </div>
    <div class="b" ondblclick="openapp('setting');" ontouchstart="openapp('setting');" oncontextmenu="return showcm(event,'desktop.icon',['setting',-1]);" appname="setting">
        <img src="icon/setting.svg">
        <p>${lang('Settings', 'setting.name')}</p>
    </div>
    <div class="b" ondblclick="openapp('about');" ontouchstart="openapp('about');" oncontextmenu="return showcm(event,'desktop.icon',['about',-1]);" appname="about">
        <img src="icon/about.svg">
        <p>${lang('About Win12 Online', 'about.name')}</p>
    </div>
    <div class="b" ondblclick="openapp('edge');" ontouchstart="openapp('edge');" oncontextmenu="return showcm(event,'desktop.icon',['edge',-1]);" appname="edge">
        <img src="icon/edge.svg">
        <p>Microsoft Edge</p>
    </div>
    <div class="b" ondblclick="shownotice('feedback');" ontouchstart="shownotice('feedback');">
        <img src="icon/feedback.svg">
        <p>${lang('Feedback Hub', 'feedback.name')}</p>
    </div>
    <span class="selection">
    </span>
    <p style="background-color: rgba(11,45,14,0);z-index:1;position: absolute;top:0px;left:0px;height:100%;width:100%" oncontextmenu="return showcm(event,'desktop');"></p>`;
        desktopItem = JSON.parse(localStorage.getItem('desktop'));
        desktopItem.forEach((item) => {
            $('#desktop')[0].innerHTML += item;
        });
        addMenu();
    }
    if (Array.isArray(JSON.parse(localStorage.getItem('topmost')))) {
        topmost = JSON.parse(localStorage.getItem('topmost'));
        if (topmost.includes('taskmgr')) {
            $('#tsk-setting-topmost')[0].checked = true;
        }
    }
    if (Array.isArray(JSON.parse(localStorage.getItem('sys_setting')))) {
        var sys_setting_back = JSON.parse(localStorage.getItem('sys_setting'));
        if (/^(1|0)+$/.test(sys_setting_back.join(''))/* 只含有 0 和 1 */) {
            sys_setting = sys_setting_back;
            for (var i = 0; i < sys_setting.length; i++) {
                document.getElementById('sys_setting_' + (i + 1))?.setAttribute("class", 'a checkbox' + (sys_setting[i] ? ' checked' : '')); //设置class属性
                if (i == 5) {
                    use_music = sys_setting[i] ? true : false;
                }
                if (i == 6) {
                    use_mic_voice = sys_setting[i] ? true : false;
                }
            }
        }
    }
    if (localStorage.getItem('root_class')) {
        $(':root')[0].className = localStorage.getItem('root_class') + ' ' + (isDark ? 'dark' : '');
    }

    const root = $(':root');
    const cornerSupported = CSS.supports('corner-shape', 'squircle');
    const $cornerToggle = $('#sys_setting_1');
    const $cornerHint = $('#toggle-corner-squ>.corner-disabled-hint');
    if (!cornerSupported) {
        sys_setting[0] = 0;
        $cornerToggle.removeClass('checked').addClass('disabled');
        $cornerToggle.removeAttr('onclick');
        root.removeClass('corner_squ');
        const message = lang('Browser not supported', 'setting.psnl.round-unav');
        if ($cornerHint.length) {
            $cornerHint.text(message);
        }
        else {
            $('#toggle-corner-squ').append(`<span class="corner-disabled-hint">${message}</span>`);
        }
        saveDesktop();
    }
    else {
        $cornerHint.remove();
        if (sys_setting[0]) {
            root.addClass('corner_squ');
        }
        else {
            root.removeClass('corner_squ');
        }
    }
}

// 原神，启动！
document.getElementsByTagName('body')[0].onload = () => {
    setTimeout(() => {
        $('#loadback').addClass('hide');
    }, 500);
    setTimeout(() => {
        $('#loadback').css('display', 'none');
    }, 1000);
    apps.webapps.init();
    initLoginPassword();
    //getdata
    if (localStorage.getItem('theme') == 'dark') {
        $(':root').addClass('dark');
        $('.dock.theme').addClass('dk');
        $('.window.whiteboard>.titbar>p').text('Blackboard');
        isDark = true;
    } else {
        $(':root').removeClass('dark');
        $('.dock.theme').removeClass('dk');
        $('.window.whiteboard>.titbar>p').text('Whiteboard');
        isDark = false;
    }
    if (localStorage.getItem('color1')) {
        $(':root').css('--theme-1', localStorage.getItem('color1'));
        $(':root').css('--theme-2', localStorage.getItem('color2'));
    }
    setIcon();//加载桌面图标

    // 所以这个东西为啥要在开机的时候加载？
    // 不应该在 python.init 里面吗？
    //     (async function () {
    //         apps.python.pyodide = await loadPyodide();
    //         apps.python.pyodide.runPython(`
    // import sys
    // import io
    // `);
    //     })();
    // apps.pythonEditor.load();
    // apps.notepadFonts.load();
    // apps.whiteboard.load();
    document.querySelectorAll('.window').forEach(w => {
        let qw = $(w), wc = w.classList[1];
        // window: onmousedown="focwin('explorer')" ontouchstart="focwin('explorer')"
        qw.attr('onmousedown', `focwin('${wc}')`);
        qw.attr('ontouchstart', `focwin('${wc}')`);
        // titbar: oncontextmenu="return showcm(event,'titbar','edge')" ondblclick="maxwin('edge')"
        qw = $(`.window.${wc}>.titbar`);
        qw.attr('oncontextmenu', `return showcm(event,'titbar','${wc}')`);
        if (!(wc in nomax)) {
            qw.attr('ondblclick', `maxwin('${wc}')`);
        }
        // icon: onclick="return showcm(event,'titbar','explorer')"
        qw = $(`.window.${wc}>.titbar>.icon`);
        qw.attr('onclick', `let os=$(this).offset();stop(event);return showcm({clientX:os.left-5,clientY:os.top+this.offsetHeight+3},'titbar','${wc}')`);
        qw.mousedown(stop);
        $(`.window.${wc}>.titbar>div>.wbtg`).mousedown(stop);
    });
    document.querySelectorAll('.window>div.resize-bar').forEach(w => {
        for (const n of ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left']) {
            w.insertAdjacentHTML('afterbegin', `<div class="resize-knob ${n}" onmousedown="resizewin(this.parentElement.parentElement, '${n}', this)"></div>`);
        }
    });
    $.getJSON('https://tjy-gitnub.github.io/win12-theme/def.json').then(j => {
        if (j.sp) {
            $(':root').css('--bgul', j.bg);
            if (j.spth) {
                $(':root').css('--theme-1', j.th1);
                $(':root').css('--theme-2', j.th2);
                $(':root').css('--href', j.href);
            }
            if (j.death) {
                $('html').css('filter', 'saturate(0)');
            }
        }
    });
    updateVoiceBallStatus();
    // loadlang();
    checkOrientation();
};

let autoUpdate = true;
function checkUpdate() {
    const sha = localStorage.getItem('sha');
    api('repos/win12-online/win12/commits').then(res => {
        res.json().then(json => {
            if (sha != json[0].sha && sha) {
                localStorage.setItem('update', true);
                sendToSw({
                    head: 'update'
                });
            }
            localStorage.setItem('sha', json[0].sha);
        });
    });
}

if (localStorage.getItem('autoUpdate') == undefined) {
    localStorage.setItem('autoUpdate', true);
}
else {
    autoUpdate = (autoUpdate == 'true');
}

const urlParams = new URL(location.href).searchParams;
if (urlParams.get('skip_login') !== '1') {
    $('#loginback').css('opacity', '1');
    $('#loginback').css('display', 'flex');
}

// PWA 应用
if (!location.href.match(/((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))/) && !location.href.match('localhost') && !urlParams.get('develop')) {
    // shownotice('about'); // Disabled: do not show notification on startup
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none', scope: './' }).then(reg => {

        reg.update();

        reg.addEventListener('updatefound', () => {
            // 正在安装的新的 SW
            const newWorker = reg.installing;
            console.log('dsk-发现更新');
            // newWorker.state;
            // // "installing" - 安装事件被触发，但还没完成
            // // "installed"  - 安装完成
            // // "activating" - 激活事件被触发，但还没完成
            // // "activated"  - 激活成功
            // // "redundant"  - 废弃，可能是因为安装失败，或者是被一个新版本覆盖
        });
    });
    // navigator.serviceWorker.controller.postMessage({
    //     head: 'is_update'
    // });
    // navigator.serviceWorker.addEventListener('message', function (e) {
    // checkUpdate();

    if (localStorage.getItem('autoUpdate') == 'true') {
        checkUpdate();
    }
    if (localStorage.getItem('update') == 'true') {
        $('.msg.update>.main>.tit').html('<i class="bi bi-stars" style="background-image: linear-gradient(100deg, var(--theme-1), var(--theme-2));-webkit-background-clip: text;-webkit-text-fill-color: transparent;text-shadow:3px 3px 5px var(--shadow);filter:saturate(200%) brightness(0.9);"></i> ' + $('#win-about>.cnt.update>div>details:first-child>summary').text());
        $('.msg.update>.main>.cont').html($('#win-about>.cnt.update>div>details:first-child>p').html());
        $('#loadbackupdate').css('display', 'block');
        localStorage.setItem('update', false);
        $('.msg.update').addClass('show');
    }
}
function sendToSw(msg) {
    navigator.serviceWorker.controller.postMessage(msg);
}

// 使用说明见 desktop.html 开头
const setData = (k, v) => {
    localStorage.setItem(k, v);
};

/**
 * 将秒数换算为可读的时间格式
 * @param {number} second 秒数
 * @returns 将秒数格式化为  1 天 8 小时 43 分钟 26 秒类似的格式
 */
function calcTimeString(second) {
    let timeStr = '';
    const days = Math.floor(second / (24 * 60 * 60));
    const hours = Math.floor(second % (24 * 60 * 60) / 3600);
    const minutes = Math.floor(second % 3600 / 60);
    const seconds = second % 60;
    if (days > 0) {
        timeStr += ' ' + days + ' 天';
    }
    if (hours > 0) {
        timeStr += ' ' + hours + ' 小时';
    }
    if (minutes > 0) {
        timeStr += ' ' + minutes + ' 分钟';
    }
    if (seconds > 0) {
        timeStr += ' ' + seconds + ' 秒';
    }
    return timeStr === '' ? ' 0 秒' : timeStr;
}

//监听全局按键
function setupGlobalKey() {
    $(document).keydown(function (event) {
        if (event.keyCode == 116/*F5 被按下 (Refresh)*/) {
            event.preventDefault();/*取消默认Refresh行为*/
            $('#desktop').css('opacity', '0'); setTimeout(() => { $('#desktop').css('opacity', '1'); }, 100); setIcon();
            return;
        }

        // 激活键：Meta / Meta + Ctrl / Alt
        if ((event.metaKey && !event.altKey) || (!event.metaKey && event.altKey)) {
        //按下激活键 + E，Open文件资源管理器（此电脑）
            if ((event.key || '').toLowerCase() == 'e') {
                event.preventDefault();
                if (!event.repeat) {
                    openapp('explorer');
                    apps.explorer.reset();
                }
                return;
            }
            //按下激活键 + I，Open设置
            if ((event.key || '').toLowerCase() == 'i') {
                event.preventDefault();
                if (!event.repeat) {
                    openapp('setting');
                }
                return;
            }
        }

        //按下徽标键
        if (event.metaKey && event.ctrlKey) {
            //Open或Close Start Menu
            openDockWidget("start-menu");
        }
    });
}

setupGlobalKey();


function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

let orientationDismissed = false;

function checkOrientation() {
    if (orientationDismissed) return;
    const container = document.getElementById('orientation-warning');
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    if (isMobileDevice() && isPortrait) {
        container.style.display = "flex";
    } else {
        container.style.display = "none";
    }
}

function dismissOrientation() {
    orientationDismissed = true;
    document.getElementById('orientation-warning').style.display = 'none';
}

// 监听屏幕方向变化
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);


// 任务栏悬停预览窗口 by @fzlzjerry 

let previewTimeout;

function showTaskbarPreview(name, event) {
    clearTimeout(previewTimeout);

    const preview = document.getElementById('taskbar-preview');
    if (!preview) {
        const previewEl = document.createElement('div');
        previewEl.id = 'taskbar-preview';
        previewEl.innerHTML = `
            <div class="preview-title">
                <img src="" alt="">
                <span></span>
            </div>
            <div class="preview-content">
                <div class="preview-window"></div>
            </div>
        `;
        document.body.appendChild(previewEl);
    }

    const win = $(`.window.${name}`);
    if (win.length && !win.hasClass('min')) {
        const preview = $('#taskbar-preview');
        const taskbarItem = $(event.currentTarget);
        const itemRect = taskbarItem[0].getBoundingClientRect();



        // Set window title and icon
        const titleImg = win.find('.titbar img.icon').attr('src');
        const title = win.find('.titbar p').text() || win.find('.titbar span').text();

        preview.find('.preview-title img').attr('src', titleImg);
        preview.find('.preview-title span').text(title);

        // Create simplified window preview
        const previewWindow = preview.find('.preview-content .preview-window');
        previewWindow.empty();

        // Clone important window elements for preview
        const content = win.find('.content').clone();
        content.find('script').remove(); // Remove any scripts
        content.find('iframe').remove(); // Remove iframes

        // Scale down the content
        content.css({
            transform: 'scale(0.2)',
            transformOrigin: 'top left',
            width: '500%', // 1/0.2 = 5
            height: '500%'
        });

        previewWindow.append(content);
        preview.addClass('show');

        // Set preview position
        console.log(content[0].offsetWidth * 0.2);
        preview.css({
            left: itemRect.left - (content[0].offsetWidth * 0.2 / 2),
            bottom: '60px'
        });
    }
}

function hideTaskbarPreview() {
    previewTimeout = setTimeout(() => {
        $('#taskbar-preview').removeClass('show');
    }, 200);
}

// Add hover events to taskbar items
$(document).on('mouseenter', '#taskbar>a', function (e) {
    const name = this.className.split(' ')[0];
    showTaskbarPreview(name, e);
});

$(document).on('mouseleave', '#taskbar>a', function () {
    hideTaskbarPreview();
});

// Add hover events to preview
$(document).on('mouseenter', '#taskbar-preview', function () {
    clearTimeout(previewTimeout);
});

$(document).on('mouseleave', '#taskbar-preview', function () {
    hideTaskbarPreview();
});
