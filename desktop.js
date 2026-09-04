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
    }, 100);
}
// 悬停提示
document.querySelectorAll('*[win12_title]:not(.notip)').forEach(a => {
    a.addEventListener('mouseenter', showdescp);
    a.addEventListener('mouseleave', hidedescp);
});
function showdescp(e) {
    if ($('#notice-back').hasClass('show')) return;
    $(e.target).attr('data-descp', 'waiting');
    setTimeout(() => {
        if ($('#notice-back').hasClass('show') || $(e.target).attr('data-descp') == 'hide') {
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

let noticePreviousFocus = null;
let noticeOpenTimer = null;
let noticeCloseTimer = null;
let noticeInertElements = [];

function dismissTransientOverlaysForModal() {
    // These layers normally close via blur/mouseleave, but making their parent
    // inert can suppress that event.  Leaving a higher-z-index inert overlay
    // visible would recreate a "visible but unclickable" surface above modal.
    $('#cm, #dp, #descp').removeClass('show show-begin');
    $('#taskbar-preview').removeClass('show');
    $('[data-descp]').attr('data-descp', 'hide');
}

function getNoticeFocusable() {
    return [...document.querySelectorAll(
        '#notice button:not([disabled]), #notice a[href], #notice input:not([disabled]), ' +
        '#notice textarea:not([disabled]), #notice select:not([disabled]), #notice [tabindex]:not([tabindex="-1"])'
    )].filter(element => getComputedStyle(element).display !== 'none');
}

function handleNoticeKeydown(event) {
    if (!$('#notice-back').hasClass('show')) return;
    if ((event.key === 'Enter' || event.key === ' ')
        && event.target.matches('#notice a[role="button"]')) {
        event.preventDefault();
        event.target.click();
        return;
    }
    if (event.key !== 'Tab') return;
    const focusable = getNoticeFocusable();
    if (!focusable.length) {
        event.preventDefault();
        document.getElementById('notice').focus();
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!document.getElementById('notice').contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
    }
    else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}
document.addEventListener('keydown', handleNoticeKeydown);

function shownotice(name) {
    clearTimeout(noticeOpenTimer);
    clearTimeout(noticeCloseTimer);
    dismissTransientOverlaysForModal();
    const noticeBack = document.getElementById('notice-back');
    noticeBack.inert = false;
    const wasOpen = $('#notice-back').hasClass('show');
    if (!wasOpen) {
        noticePreviousFocus = document.activeElement;
        noticeInertElements = [...document.body.children]
            .filter(element => element !== noticeBack && !element.inert);
        noticeInertElements.forEach(element => { element.inert = true; });
    }
    $('#notice>.cnt').html(nts[name].cnt);
    let tmp = '';
    nts[name].btn.forEach(btn => {
        tmp += `<button type="button" class="a btn ${btn.type}" onclick="${btn.js}">${btn.text}</button>`;
    });
    $('#notice>.btns').html(tmp);
    const notice = document.getElementById('notice');
    const title = notice.querySelector('.cnt>.tit');
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-modal', 'true');
    notice.setAttribute('tabindex', '-1');
    if (title) {
        title.id = 'notice-title';
        notice.setAttribute('aria-labelledby', title.id);
    }
    else {
        notice.removeAttribute('aria-labelledby');
    }
    $('#notice a:not([href])').attr({ role: 'button', tabindex: '0' });
    $('#notice-back').attr('aria-hidden', 'false').addClass('show');
    noticeOpenTimer = setTimeout(() => {
        noticeOpenTimer = null;
        $('#notice').addClass('show');
        const focusable = getNoticeFocusable();
        (focusable[0] || notice).focus();
    }, 200);
}
function closenotice() {
    clearTimeout(noticeOpenTimer);
    noticeOpenTimer = null;
    $('#notice').removeClass('show');
    clearTimeout(noticeCloseTimer);
    noticeCloseTimer = setTimeout(() => {
        noticeCloseTimer = null;
        $('#notice-back').removeClass('show');
        const noticeBack = document.getElementById('notice-back');
        const notice = document.getElementById('notice');
        if (notice.contains(document.activeElement)) document.activeElement.blur();
        noticeBack.inert = true;
        noticeInertElements.forEach(element => { element.inert = false; });
        noticeInertElements = [];
        if (noticePreviousFocus && noticePreviousFocus.isConnected) noticePreviousFocus.focus();
        noticePreviousFocus = null;
        $('#notice-back').attr('aria-hidden', 'true');
        focusHighestBlockingLayer();
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
1.指令"{openapp appid}";用来打开某个应用，用在下文"应用的功能介绍"中匹配的 id 代替其中的"appid"
2.指令"{openurl url}";用来在 Microsoft Edge 浏览器中打开某个 URL，其中用 URL 地址代替"url"。当用户想要搜索某内容，请用 bing 搜索
3.指令"{feedback copilot}";打开 ai 助手反馈界面，用于用户想对 ai 助手的功能提出反馈时帮助他打开
4.指令"{feedback win12}";打开反馈中心，当用户希望对除 ai 助手外的其他系统功能发送反馈时，帮他打开反馈中心
5.指令"{settheme theme}";用于切换系统的深色、浅色模式，区别于主题。用"light"表浅色，"dark"表深色，来替换其中的"theme"
如下是应用的功能介绍。
1.设置:id 为 setting;在个性化页面中可以设置系统的主题，主题色，是否启用动画、阴影、圆角、云母 mica 效果和为所有窗口开启亚克力透明效果。
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
当用户询问更多项目信息时，帮助他打开"关于 win12 网页版"应用。
比如这时用户说"请打开计算器"，你会回答什么？`
    }, {
        role: 'assistant',
        content: '好的呢，现在我就帮您打开计算器。\n{openapp calc}'
    }, {
        role: 'system',
        content: '很好。现在开始与用户对话。'
    }, {
        role: 'assistant',
        content: '欢迎使用 Windows 12 Copilot AI 助手，有什么可以帮您？'
    }],
    init: () => {
        $('#copilot>.chat').html('');
        $('#copilot>.chat').append(`<div class="line system"><p class="text">本 AI 助手基于 Deepseek v4 pro 模型，目前支持以下操作：<br>
        1.打开除 webapp 外大多应用<br>
        2.在浏览器中打开链接、搜索<br>
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

        // 敏感词过滤
        $.ajax({
            url: `https://yunzhiapi.cn/vip/win12/mgwbgl.php?msg=${encodeURIComponent(t)}`,
            method: 'GET',
            success: function (filteredText) {
                if (filteredText !== t) {
                    triggerBlockAction();
                    return;
                }
                proceedSend();
            },
            error: function () {
                proceedSend();
            }
        });


        /*  ollama/llama-guard safety check - commented out to prevent unavailability issues
        function proceedToSecondLayer() {
            $.ajax({
                url: 'llama-guard-api.freedom-323.workers.dev',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    model: 'llama-guard3:1b',
                    messages: [{ role: 'user', content: t }],
                    stream: false
                }),
                success: function (response) {
                    if (response && response.message && response.message.content.includes('unsafe')) {
                        triggerBlockAction();
                        return; 
                    }
                    proceedSend();
                },
                error: function () {
                    $('#copilot>.chat').append(`<div class="line system"><p class="text">安全检查服务暂时不可用，请稍后再试。</p></div>`);
                    $('#copilot>.chat').scrollTop($('#copilot>.chat').scrollHeight);
                    msgDoneOperate();
                }
            });
        }
        */

        function triggerBlockAction() {
            $('#copilot>.chat').append(`<div class="line system"><p class="text">针对这个问题我无法为你提供相应解答。你可以尝试提供其他话题，我会尽力为你提供支持和解答。</p></div>`);
            $('#copilot>.chat').scrollTop($('#copilot>.chat').scrollHeight);
            msgDoneOperate();
        }

        function proceedSend() {
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
                                rt = rt.replace(i, `<div class="action"><p class="tit">打开应用</p><p class="detail">${$(`.window.${t}>.titbar>p`).text()}</p></div>`);
                            } else {
                                rt = rt.replace(i, `<div class="action"><p class="tit">打开应用</p><p class="detail">${t} <span style="color:red">(AI 理解力较差，见谅)</span></p></div>`);
                            }
                        } else if (/{openurl .+?}/.test(i)) {
                            const t = i.match(/(?<={openurl ).+(?=})/)[0];
                            openapp('edge');
                            apps.edge.newtab();
                            apps.edge.goto(t);
                            rt = rt.replace(i, `<div class="action"><p class="tit">打开 URL</p><p class="detail">${decodeHtml(t)}</p></div>`);
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
        }
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
    // 注意：command 本身已经带了 hide_startmenu()（见 cms 的 smapp 项），
    // 原写法在属性外多写了一段 ;hide_startmenu();' —— 是无效的多余标记，渲染结果不变。
    $('#startmenu-r>.pinned>.apps').append(`<a class='a sm-app enable ${id}' onclick='${command}' oncontextmenu='return showcm(event,\"smapp\",[\"${id}\",\"${name}\"])'><img src='icon/${geticon(id)}'><p>${name}</p></a>`);
}

// 应用方法

// png 格式的图标在此备注，否则以 标识+.svg 的名称自动检索
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

function openapp(name, bypassPreOpenNotice = false) {
    if (name == 'macos' && !bypassPreOpenNotice) {
        shownotice('macos-web');
        return;
    }
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



//打开任务栏按钮对应的 widget

// 为啥管这个东西叫 widget?? from stsc
function openDockWidget(name) {
    if (name == "start-menu") { //打开开始菜单
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
    } else if (name == "search-win") {   //打开搜索框
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
    } else if (name == "widgets") {  //打开小组件
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
    } else if (name == "control") {  //打开控制
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
    } else if (name == "datebox") {  //打开时间框
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
        console.error("openDockWidget() 传递的 name 不正确！");
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
        el.setAttribute('aria-label', title);
    }
}

function getBatteryTooltip(level, charging) {
    const percent = Math.round(level * 100);
    const chargingText = charging ? lang('，正在充电', 'battery.charging') : '';
    return `${lang('电量：', 'battery.level')}${percent}%${chargingText}`;
}

function setBatteryUnavailableTooltip() {
    setBatteryTooltip(lang('无法获取电量', 'battery.unavailable'));
}

if (!isTauriApp() && navigator.getBattery) {
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
} else if (!isTauriApp()) {
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

// 个性化主题
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
//global
const parentEl = $('#desktop')[0];
const cell = 83; // 单位尺寸
const gap = 10; // 单位间隔
const padding = 20; // 偏移
// 原本这三个是 const，只在脚本执行期算一次，窗口 resize 后吸附网格就失效了。
// 改成每次拖拽开始时重算（不放在 mousemove 里，避免逐帧触发 layout）。
let parentRect, cols, rows;
function refreshDesktopGrid() {
    parentRect = parentEl.getBoundingClientRect();
    cols = Math.max(1, Math.floor((parentRect.width - padding * 2 + gap) / (cell + gap)));
    rows = Math.max(1, Math.floor((parentRect.height - padding * 2 + gap) / (cell + gap)));
}
refreshDesktopGrid();

function desktopMove(elt, e) {
    if (!edit_mode) return;// 编辑模式有效
    refreshDesktopGrid();// 桌面尺寸可能已变，重算吸附网格
    e = e || window.event;
    // 阻止桌面响应
    try { e.stopPropagation(); } catch (err) { }
    try { e.preventDefault(); } catch (err) { }
    let rect = elt.getBoundingClientRect();
    let deltaLeft = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let deltaTop = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    elt.style.position = 'fixed';
    elt.style.width = `${rect.width}px`;
    elt.style.height = `${rect.height}px`;
    elt.classList.add('moving');
    elt.classList.add('notrans');

    function moving(ev) {
        let clientX = ev.type.match('touch') ? ev.touches[0].clientX : ev.clientX;
        let clientY = ev.type.match('touch') ? ev.touches[0].clientY : ev.clientY;

        let leftPx = clientX - deltaLeft;
        let topPx = clientY - deltaTop;
        // 与网格对齐
        //const parentRect = $('#desktop')[0].getBoundingClientRect();
        //const cell = 83; // 单位尺寸
        //const gap = 10; // 单位间隔
        //const padding = 20; // 偏移
        let relLeft = leftPx - parentRect.left - padding;
        let relTop = topPx - parentRect.top - padding;
        //const cols = Math.max(1, Math.floor((parentRect.width - padding * 2 + gap) / (cell + gap)));
        //const rows = Math.max(1, Math.floor((parentRect.height - padding * 2 + gap) / (cell + gap)));
        let col = Math.round(relLeft / (cell + gap));
        let row = Math.round(relTop / (cell + gap));//近似是第几格
        if (col < 0) col = 0;
        if (col >= cols) col = cols - 1;
        if (row < 0) row = 0;
        if (row >= rows) row = rows - 1;
        const snapLeft = parentRect.left + padding + col * (cell + gap);
        const snapTop = parentRect.top + padding + row * (cell + gap);
        elt.style.left = `${snapLeft}px`;
        elt.style.top = `${snapTop}px`;
    }

    function up() {
        elt.classList.remove('notrans');
        elt.classList.remove('moving');
        document.body.style.userSelect = '';
        // 将固定坐标转换为相对于桌面的绝对位置
        //const parentRect = $('#desktop')[0].getBoundingClientRect();
        const left = parseFloat(elt.style.left || 0) - parentRect.left;
        const top = parseFloat(elt.style.top || 0) - parentRect.top;
        elt.style.position = 'absolute';
        elt.style.left = `${left}px`;
        // 存储网格坐标
        elt.setAttribute('data-grid-left', elt.style.left);
        elt.setAttribute('data-grid-top', elt.style.top);
        elt.style.top = `${top}px`;
        page.onmousemove = null;
        page.ontouchmove = null;
        page.onmouseup = null;
        page.ontouchend = null;
        page.ontouchcancel = null;
    }

    moving(e);
    // 不要出现选择框
    document.body.style.userSelect = 'none';
    page.onmousemove = moving;
    page.ontouchmove = moving;
    page.onmouseup = up;
    page.ontouchend = up;
    page.ontouchcancel = up;
}

function attachDesktopDrag() {
    const parent = $('#desktop')[0];
    if (!parent) return;
    const children = Array.from(parent.children).filter(n => n.tagName.toLowerCase() === 'div' || n.tagName.toLowerCase() === 'a');
    children.forEach(ch => {
        if (ch.dataset.desktopDragBound === 'true') return;
        ch.dataset.desktopDragBound = 'true';
        ch.ondragstart = () => false;
        const originalMouseDown = ch.onmousedown;
        const originalTouchStart = ch.ontouchstart;
        const touchFallback = ch.onclick || ch.ondblclick;
        ch.onmousedown = (e) => {
            if (!edit_mode) {
                return originalMouseDown ? originalMouseDown.call(ch, e) : undefined;
            }
            //防止桌面响应
            try { e.stopPropagation(); } catch (err) { }
            try { e.preventDefault(); } catch (err) { }
            desktopMove(ch, e);
            return false;
        };
        ch.ontouchstart = (e) => {
            if (!edit_mode) {
                if (originalTouchStart) return originalTouchStart.call(ch, e);
                // Some desktop Chromium builds do not expose ontouchstart as a
                // compiled DOM property even when the inline attribute exists.
                // Reuse the icon's normal click/double-click action in that case.
                if (touchFallback) {
                    try { e.preventDefault(); } catch (err) { }
                    return touchFallback.call(ch, e);
                }
                return undefined;
            }
            try { e.stopPropagation(); } catch (err) { }
            try { e.preventDefault(); } catch (err) { }
            desktopMove(ch, e);
            return false;
        };
    });
}
function readStoredArray(key) {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
    }
    catch (e) { }
    localStorage.removeItem(key);
    return null;
}
function setIcon() {
    // return;
    let storedDesktop = readStoredArray('desktop');
    if (storedDesktop === null) {
        storedDesktop = [];
        setData('desktop', '[]');
    }
    if (storedDesktop !== null) {
        $('#desktop')[0].innerHTML = `<div ondblclick="openapp('explorer');" ontouchstart="openapp('explorer');" oncontextmenu="return showcm(event,'desktop.icon',['explorer',-1]);" appname="explorer">
        <img src="apps/icons/explorer/thispc.svg">
        <p>${lang('此电脑', 'explorer.thispc')}</p>
    </div>
    <div class="b" ondblclick="openapp('setting');" ontouchstart="openapp('setting');" oncontextmenu="return showcm(event,'desktop.icon',['setting',-1]);" appname="setting">
        <img src="icon/setting.svg">
        <p>${lang('设置', 'setting.name')}</p>
    </div>
    <div class="b" ondblclick="openapp('about');" ontouchstart="openapp('about');" oncontextmenu="return showcm(event,'desktop.icon',['about',-1]);" appname="about">
        <img src="icon/about.svg">
        <p>${getAboutAppTitle()}</p>
    </div>
    <div class="b" ondblclick="openapp('edge');" ontouchstart="openapp('edge');" oncontextmenu="return showcm(event,'desktop.icon',['edge',-1]);" appname="edge">
        <img src="icon/edge.svg">
        <p>Microsoft Edge</p>
    </div>
    <div class="b" ondblclick="shownotice('feedback');" ontouchstart="shownotice('feedback');">
        <img src="icon/feedback.svg">
        <p>${lang('反馈中心', 'feedback.name')}</p>
    </div>
    <span class="selection">
    </span>
    <p style="background-color: rgba(11,45,14,0);z-index:1;position: absolute;top:0px;left:0px;height:100%;width:100%" oncontextmenu="return showcm(event,'desktop');"></p>`;
        desktopItem = storedDesktop;
        desktopItem.forEach((item) => {
            $('#desktop')[0].innerHTML += item;
        });
        addMenu();
    }
    const storedTopmost = readStoredArray('topmost');
    if (storedTopmost !== null) {
        topmost = storedTopmost;
        if (topmost.includes('taskmgr')) {
            $('#tsk-setting-topmost')[0].checked = true;
        }
    }
    const storedSystemSettings = readStoredArray('sys_setting');
    if (storedSystemSettings !== null) {
        var sys_setting_back = storedSystemSettings;
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
        const message = lang('浏览器不支持', 'setting.psnl.round-unav');
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
    attachDesktopDrag();
}

// Core shell startup must not wait for optional CDN scripts.  desktop.html
// calls this after the local deferred modules have executed; load remains a
// fallback for older/custom entry pages.
let win12Started = false;
function win12Start() {
    if (win12Started) return;
    win12Started = true;
    setTimeout(() => {
        $('#loadback').addClass('hide');
    }, 500);
    setTimeout(() => {
        $('#loadback').css('display', 'none');
        if ((new URL(location.href)).searchParams.get('skip_login') === '1') {
            showStartupNoticeOnce();
        }
        else {
            focusHighestBlockingLayer();
        }
    }, 750);
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
    // 桌面版：从 Tauri settings.json 同步 panic-color 到 localStorage
    if (window.win12Native && window.win12Native.isTauri && window.win12Native.isTauri()) {
        (async function() {
            try {
                var json = await window.win12Native.readSettings();
                if (json) {
                    var settings = JSON.parse(json);
                    if (settings['panic-color']) {
                        localStorage.setItem('panic-color', settings['panic-color']);
                    }
                }
            } catch (e) {
                console.error('Failed to load settings from Tauri:', e);
            }
        })();
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
}
window.addEventListener('load', win12Start, { once: true });

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
    // 原写法是 autoUpdate == 'true'，拿布尔变量去比字符串，恒为 false。
    // 后果：desktop.html 的「自动更新」开关基于错误的初值取反，第一次点击取消勾选无效。
    autoUpdate = (localStorage.getItem('autoUpdate') == 'true');
}

const urlParams = new URL(location.href).searchParams;
if (urlParams.get('skip_login') !== '1') {
    $('#loginback').css('opacity', '1');
    $('#loginback').css('display', 'flex');
}

// About 是模态框，会把背景设为 inert。正常路径在 win12FinishLogin() 隐藏
// 登录层后打开；skip_login 路径由 win12Start() 在启动遮罩隐藏后打开。
// PWA 应用
if (!location.href.match(/((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))/) && !location.href.match('localhost') && !urlParams.get('develop')) {
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
    // 首次加载时 controller 可能尚未就绪（checkUpdate 会在注册完成前调用本函数）
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage(msg);
}

// 使用说明见 desktop.html 开头
const setData = (k, v) => {
    localStorage.setItem(k, v);
};

/**
 * 获取蓝屏颜色 (panic-color)
 * 优先级：Tauri settings.json > localStorage > 默认值 #136fca
 */
function getPanicColor() {
    // 先尝试从 localStorage 读取 (网页版使用)
    var color = localStorage.getItem('panic-color');
    if (color) return color;
    return '#136fca';
}

/**
 * 设置蓝屏颜色 (panic-color)
 * 网页版 -> localStorage
 * 桌面版 -> Tauri settings.json
 */
async function setPanicColor(color) {
    if (window.win12Native && window.win12Native.isTauri && window.win12Native.isTauri()) {
    // 桌面版：写入 Tauri settings.json
        try {
            var json = await window.win12Native.readSettings();
            var settings = json ? JSON.parse(json) : {};
            settings['panic-color'] = color;
            await window.win12Native.writeSettings(settings);
        } catch (e) {
            console.error('Failed to save panic color to Tauri settings:', e);
        }
    }
    // 网页版：写入 localStorage
    localStorage.setItem('panic-color', color);
}

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
function isVisibleBlockingLayer(element) {
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden'
        && element.getClientRects().length > 0;
}

function getHighestBlockingLayer() {
    const noticeBack = document.getElementById('notice-back');
    if (noticeBack && noticeBack.classList.contains('show')) return noticeBack;
    for (const id of ['loadback', 'orientation-warning', 'loginback']) {
        const element = document.getElementById(id);
        if (isVisibleBlockingLayer(element)) return element;
    }
    return null;
}

function getBlockingLayerFocusable(layer) {
    if (!layer) return [];
    return [...layer.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href], select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(element => isVisibleBlockingLayer(element));
}

function focusHighestBlockingLayer() {
    const layer = getHighestBlockingLayer();
    if (!layer || layer.id === 'notice-back' || layer.id === 'loadback') return;
    const focusable = getBlockingLayerFocusable(layer);
    (focusable[0] || layer).focus({ preventScroll: true });
}

function handleBlockingLayerKeydown(event) {
    if (event.key !== 'Tab') return;
    const layer = getHighestBlockingLayer();
    if (!layer || layer.id === 'notice-back') return;
    if (layer.id === 'loadback') {
        event.preventDefault();
        return;
    }
    const focusable = getBlockingLayerFocusable(layer);
    if (!focusable.length) {
        event.preventDefault();
        layer.focus({ preventScroll: true });
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!layer.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
    }
    else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
    }
}

function handleBlockingLayerFocus(event) {
    const layer = getHighestBlockingLayer();
    if (!layer || layer.id === 'notice-back' || layer.id === 'loadback') return;
    if (!layer.contains(event.target)) focusHighestBlockingLayer();
}

document.addEventListener('keydown', handleBlockingLayerKeydown, true);
document.addEventListener('focusin', handleBlockingLayerFocus, true);

function setupGlobalKey() {
    $(document).keydown(function (event) {
        if (getHighestBlockingLayer()) {
            if (event.keyCode == 116) event.preventDefault();
            return;
        }
        if (event.keyCode == 116/*F5 被按下 (刷新)*/) {
            event.preventDefault();/*取消默认刷新行为*/
            $('#desktop').css('opacity', '0'); setTimeout(() => { $('#desktop').css('opacity', '1'); }, 100); setIcon();
            return;
        }

        // 激活键：Meta / Meta + Ctrl / Alt
        if ((event.metaKey && !event.altKey) || (!event.metaKey && event.altKey)) {
        //按下激活键 + E，打开文件资源管理器（此电脑）
            if ((event.key || '').toLowerCase() == 'e') {
                event.preventDefault();
                if (!event.repeat) {
                    openapp('explorer');
                    apps.explorer.reset();
                }
                return;
            }
            //按下激活键 + I，打开设置
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
            //打开或关闭开始菜单
            openDockWidget("start-menu");
        }
    });
}

setupGlobalKey();


function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

let orientationDismissed = false;
let orientationPreviousFocus = null;

function checkOrientation() {
    if (orientationDismissed) return;
    const container = document.getElementById('orientation-warning');
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    if (isMobileDevice() && isPortrait) {
        const wasVisible = isVisibleBlockingLayer(container);
        if (!wasVisible && document.activeElement && document.activeElement !== document.body) {
            orientationPreviousFocus = document.activeElement;
        }
        container.style.display = "flex";
        if (!wasVisible && getHighestBlockingLayer() === container) {
            focusHighestBlockingLayer();
        }
    } else {
        container.style.display = "none";
    }
}

function dismissOrientation() {
    orientationDismissed = true;
    document.getElementById('orientation-warning').style.display = 'none';
    if (orientationPreviousFocus && orientationPreviousFocus.isConnected
        && isVisibleBlockingLayer(orientationPreviousFocus)
        && !orientationPreviousFocus.closest('#notice-back[inert]')) {
        orientationPreviousFocus.focus({ preventScroll: true });
    }
    orientationPreviousFocus = null;
    focusHighestBlockingLayer();
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
    const previewBox = $('#taskbar-preview');
    if (!win.length || win.hasClass('min')) {
        previewBox.removeClass('show');
        previewBox.find('.preview-title img').attr('src', '');
        previewBox.find('.preview-title span').text('');
        previewBox.find('.preview-content .preview-window').empty();
        return;
    }
    if (win.length) {
        const preview = previewBox;
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
