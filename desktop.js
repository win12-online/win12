'use strict';

/*

Win12 网页版
    codenerg.org/win12-online/win12

*/

/********** 禁止格式化此文档！ **********/

console.log('%cWindows 12 网页版 (GitHub: win12-online/win12)', 'background-image: linear-gradient(to right,rgb(174, 115, 229),rgb(21, 105, 223)); border-radius: 8px; font-size: 1.3em; padding: 10px 15px; color: #fff; ');
// 好高级，还能这样？？



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
let loginPasswordStatus = 'pending';
let loginFinishing = false;
let startupNoticeShown = false;
const LOGIN_BRIDGE_TIMEOUT_MS = 8000;

function showStartupNoticeOnce() {
    if (startupNoticeShown) return;
    startupNoticeShown = true;
    shownotice('about');
}

async function withLoginBridgeTimeout(promise, message) {
    let timeoutId;
    try {
        return await Promise.race([
            Promise.resolve(promise),
            new Promise((resolve, reject) => {
                timeoutId = setTimeout(() => reject(new Error(message)), LOGIN_BRIDGE_TIMEOUT_MS);
            })
        ]);
    }
    finally {
        clearTimeout(timeoutId);
    }
}

function isNativeLoginEnvironment() {
    try {
        if (window.win12Native && typeof window.win12Native.isTauri == 'function'
            && window.win12Native.isTauri()) return true;
    }
    catch (e) { }
    return !!(window.__TAURI__ && window.__TAURI__.core);
}

function requireLoginBridge(method) {
    if (!window.win12Native || typeof window.win12Native[method] != 'function') {
        throw new Error('本地密码服务尚未就绪');
    }
    return window.win12Native;
}

function win12FinishLogin() {
    if (loginFinishing) return;
    loginFinishing = true;
    setLoginError('');
    $('#login').prop('disabled', true);
    $('#login-password').prop('disabled', true);
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
            showStartupNoticeOnce();
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
    const isNative = isNativeLoginEnvironment();
    if (isNative && (new URL(location.href)).searchParams.get('skip_login') !== '1') {
        loginPasswordStatus = 'pending';
        $('#loginback').addClass('tauri-password');
        $('#login-password').prop('disabled', true);
        setLoginError('正在读取本地密码状态');
        try {
            const status = await withLoginBridgeTimeout(
                requireLoginBridge('getLoginPasswordStatus').getLoginPasswordStatus(),
                '读取本地密码状态超时'
            );
            if (!status || typeof status.has_password != 'boolean') {
                throw new Error('本地密码状态响应无效');
            }
            loginPasswordHasPassword = status.has_password;
            loginPasswordStatus = loginPasswordHasPassword ? 'has-password' : 'no-password';
            if (loginPasswordHasPassword) {
                $('#loginback').addClass('tauri-password');
                $('#login-password').prop('disabled', false).attr('placeholder', '密码');
                setLoginError('');
                $('#login-password').focus();
            }
            else {
                $('#loginback').removeClass('tauri-password');
            }
        }
        catch (e) {
            loginPasswordStatus = 'error';
            setLoginError('无法读取本地密码状态');
        }
        finally {
            $('#login').css('pointer-events', 'auto');
        }
    }
    else {
        loginPasswordStatus = 'not-required';
    }
}

async function win12LoginSubmit() {
    if (!isNativeLoginEnvironment()) {
        win12FinishLogin();
        return;
    }

    if (loginPasswordStatus == 'pending') {
        setLoginError('正在读取本地密码状态');
        return;
    }
    if (loginPasswordStatus == 'error') {
        await initLoginPassword();
        if (loginPasswordStatus == 'error' || loginPasswordStatus == 'pending') return;
    }
    if (loginPasswordStatus == 'no-password' || loginPasswordStatus == 'not-required') {
        win12FinishLogin();
        return;
    }
    if (loginPasswordStatus != 'has-password') return;

    const password = $('#login-password').val();
    if (!password) {
        setLoginError('请输入密码');
        $('#login-password').focus();
        return;
    }

    $('#login').css('pointer-events', 'none');
    setLoginError('正在验证');

    try {
        const result = await withLoginBridgeTimeout(
            requireLoginBridge('verifyLoginPassword').verifyLoginPassword(password),
            '验证密码超时'
        );
        if (result && !Array.isArray(result) && typeof result == 'object' && result.ok === true) {
            $('#login-password').val('');
            win12FinishLogin();
            return;
        }
        setLoginError('密码错误');
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
    if (!isNativeLoginEnvironment()) {
        $('#setting-password-status').text('仅 Tauri App 可用');
        $('#setting-password-current').hide();
        $('#setting-password-new').prop('disabled', true);
        $('#setting-password-submit').addClass('disabled');
        return;
    }

    try {
        const status = await withLoginBridgeTimeout(
            requireLoginBridge('getLoginPasswordStatus').getLoginPasswordStatus(),
            '读取本地密码状态超时'
        );
        if (!status || typeof status.has_password != 'boolean') {
            throw new Error('本地密码状态响应无效');
        }
        loginPasswordHasPassword = status.has_password;
        loginPasswordStatus = loginPasswordHasPassword ? 'has-password' : 'no-password';
        $('#setting-password-status').text(loginPasswordHasPassword ? '已设置密码' : '未设置密码');
        $('#setting-password-current')[loginPasswordHasPassword ? 'show' : 'hide']();
        $('#setting-password-current').val('');
        $('#setting-password-new').val('').prop('disabled', false);
        $('#setting-password-new').attr('placeholder', loginPasswordHasPassword ? '新密码（留空清除密码）' : '新密码');
        $('#setting-password-submit').removeClass('disabled');
    }
    catch (e) {
        loginPasswordStatus = 'error';
        $('#setting-password-status').text(String(e));
        $('#setting-password-new').prop('disabled', true);
        $('#setting-password-submit').addClass('disabled');
    }
}

async function win12SetLoginPassword() {
    if (!isNativeLoginEnvironment()) {
        $('#setting-password-status').text('仅 Tauri App 可用');
        return;
    }
    if (loginPasswordStatus != 'has-password' && loginPasswordStatus != 'no-password') {
        $('#setting-password-status').text('请先重新读取密码状态');
        await win12RefreshPasswordSettingStatus();
        return;
    }

    const currentPassword = $('#setting-password-current').val();
    const newPassword = $('#setting-password-new').val();
    if (!loginPasswordHasPassword && !newPassword) {
        $('#setting-password-status').text('请输入新密码');
        $('#setting-password-new').focus();
        return;
    }
    if (loginPasswordHasPassword && !currentPassword) {
        $('#setting-password-status').text('请输入当前密码');
        $('#setting-password-current').focus();
        return;
    }

    $('#setting-password-submit').addClass('disabled');
    const clearingPassword = loginPasswordHasPassword && !newPassword;
    $('#setting-password-status').text(clearingPassword ? '正在清除' : '正在保存');

    try {
        await withLoginBridgeTimeout(
            requireLoginBridge('setLoginPassword').setLoginPassword(
                loginPasswordHasPassword ? currentPassword : null,
                newPassword
            ),
            '保存本地密码超时'
        );
        await win12RefreshPasswordSettingStatus();
        $('#setting-password-status').text(clearingPassword ? '密码已清空' : '密码已保存');
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
    // 必须是直接子 div：与 CSS 的 #desktop>div 一致，且用户自建项本身就是顶层 <div class="b">。
    // 原写法是 '#div'（id 选择器），永远匹配 0 个元素，整个循环从不执行。
    var childDivs = parentDiv.$$(':scope>div');

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
        }, true);
    }
}
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

// 渲染右键菜单。原先这段逻辑在 showcm 里被完整复制了两遍（「已有菜单打开」与
// 「直接打开」两条路径），除缩进外只有一处差别，而那处差别是个 bug：
// 已打开路径写的是 `ret = item(arg)`（未声明），desktop.js 是 'use strict'，
// 于是「在已有菜单打开时再右键一个函数型菜单项」必抛 ReferenceError。
// 受影响的是 cms 里四个函数型条目：desktop.icon / smapp / smlapp / explorer.file。
// 同路径还有一句 `arg.event = e`，全仓库无人读取，且 arg 可能为 null，一并移除。
function renderContextMenu(e, cl, arg) {
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
}

function showcm(e, cl, arg) {
    // 已有菜单打开时，等它收起再重绘（原逻辑的 200ms 延时保持不变）
    if ($('#cm').hasClass('show-begin')) {
        setTimeout(() => {
            renderContextMenu(e, cl, arg);
        }, 200);
        return;
    }
    renderContextMenu(e, cl, arg);
}
$('#cm>.foc').blur((event) => {
    let x = event.currentTarget.parentNode;
    $(x).removeClass('show');
    setTimeout(() => {
        $(x).removeClass('show-begin');
    }, 200);
});
let font_window = false;

// 下拉菜单

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
    }, 200);
}
