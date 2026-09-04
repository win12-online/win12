#!/usr/bin/env node
// Shell startup、notice 生命周期与任务栏预览的无依赖回归测试。
//   node tools/regress/shell-ui-lifecycle.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const DESKTOP_JS = readFileSync(resolve(HERE, '../../desktop.js'), 'utf8');
const DESKTOP_HTML = readFileSync(resolve(HERE, '../../desktop.html'), 'utf8');
const DESKTOP_CSS = readFileSync(resolve(HERE, '../../desktop.css'), 'utf8');
const LOGIN_CSS = readFileSync(resolve(HERE, '../../apps/style/login.css'), 'utf8');
const STARTUP_JS = readFileSync(resolve(HERE, '../../scripts/startup.js'), 'utf8');

function extractFunction(source, name) {
    const start = source.indexOf(`function ${name}(`);
    assert.notEqual(start, -1, `找不到 ${name}()`);
    const open = source.indexOf('{', start);
    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let i = open; i < source.length; i++) {
        const ch = source[i];
        const next = source[i + 1];
        if (lineComment) {
            if (ch === '\n') lineComment = false;
            continue;
        }
        if (blockComment) {
            if (ch === '*' && next === '/') { blockComment = false; i++; }
            continue;
        }
        if (quote) {
            if (escaped) escaped = false;
            else if (ch === '\\') escaped = true;
            else if (ch === quote) quote = null;
            continue;
        }
        if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
        if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
        if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
        if (ch === '{') depth++;
        else if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
    }
    throw new Error(`${name}() 花括号不完整`);
}

// ---------------------------------------------------------------- startup

const scripts = [...DESKTOP_HTML.matchAll(/<script\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)')[^>]*>/gi)]
    .map(match => match[1] || match[2]);
const indexOfScript = src => {
    const index = scripts.indexOf(src);
    assert.notEqual(index, -1, `desktop.html 缺少 ${src}`);
    return index;
};
assert.ok(indexOfScript('tauri/tauri_api.js') < indexOfScript('desktop.js'),
    'Tauri bridge 必须早于 desktop.js');
assert.ok(indexOfScript('desktop.js') < indexOfScript('scripts/startup.js'),
    'startup 必须晚于 win12Start 的定义');
assert.ok(indexOfScript('module/tab.js') < indexOfScript('scripts/startup.js'),
    'startup 必须等待本地 shell 模块');
assert.ok(indexOfScript('scripts/startup.js') < scripts.findIndex(src => /^https?:/.test(src)),
    'startup 必须早于可选 CDN 脚本，避免 CDN 阻塞开机');

const startFunction = extractFunction(DESKTOP_JS, 'win12Start');
assert.match(DESKTOP_JS, /let\s+win12Started\s*=\s*false\s*;/,
    'win12Start 必须有一次性状态');
assert.match(startFunction, /^function win12Start\(\)\s*\{\s*if \(win12Started\) return;\s*win12Started = true;/,
    '一次性 guard 必须位于所有启动副作用之前');
assert.match(DESKTOP_JS, /window\.addEventListener\(\s*['"]load['"]\s*,\s*win12Start\s*,\s*\{\s*once:\s*true\s*\}\s*\)/,
    'load fallback 必须保留且只注册一次');
assert.doesNotMatch(DESKTOP_JS, /\.onload\s*=\s*(?:win12Start|\(\)\s*=>)/,
    'startup 不应覆盖其他 load handler');

for (const available of [true, false]) {
    let calls = 0;
    const context = vm.createContext(available ? { win12Start() { calls++; } } : {});
    vm.runInContext(STARTUP_JS, context, { filename: 'scripts/startup.js' });
    assert.equal(calls, available ? 1 : 0,
        available ? 'startup.js 应立即启动 shell' : '缺少入口时 startup.js 不应抛错');
}
console.log('✓ startup：本地依赖顺序、CDN 前启动、一次性 guard 与 load fallback 均通过');

// About notice is modal and makes every background layer inert.  It must not
// open underneath the higher-z-index login screen, otherwise the visible login
// control receives no pointer or keyboard input.
const finishLoginFunction = extractFunction(DESKTOP_JS, 'win12FinishLogin');
const initLoginFunction = extractFunction(DESKTOP_JS, 'initLoginPassword');
assert.equal((DESKTOP_JS.match(/shownotice\(\s*['"]about['"]\s*\)/g) || []).length, 1,
    'About 只能由一次性入口打开，不得在登录页显示时另行打开');
assert.match(finishLoginFunction,
    /css\(\s*['"]display['"]\s*,\s*['"]none['"]\s*\);\s*showStartupNoticeOnce\(\)/,
    'About 必须等登录层真正隐藏后再打开');
assert.match(startFunction,
    /css\(\s*['"]display['"]\s*,\s*['"]none['"]\s*\);[\s\S]*?skip_login[\s\S]*?showStartupNoticeOnce\(\)/,
    'skip_login 的 About 也必须等启动遮罩隐藏后再打开');
assert.doesNotMatch(initLoginFunction, /pointer-events['"]?\s*,\s*['"]none['"]/,
    '读取 Tauri 密码状态期间登录控件仍应响应点击并显示 pending 状态');
assert.match(initLoginFunction, /withLoginBridgeTimeout\(/,
    'Tauri 密码状态读取必须有超时，不能永久卡在 pending');
assert.match(DESKTOP_HTML, /<button\s+id="login"\s+type="button"[^>]*onclick="win12LoginSubmit\(\);"/,
    '登录主操作必须是可聚焦、支持 Enter/Space 的原生 button');
assert.match(DESKTOP_HTML, /id="loginback"[^>]*role="dialog"[^>]*aria-modal="true"/,
    '登录层必须声明 modal 语义');
assert.match(DESKTOP_HTML, /id="orientation-warning"[^>]*role="dialog"[^>]*aria-modal="true"/,
    '竖屏提示必须声明 modal 语义');
assert.match(DESKTOP_HTML, /<div\s+id="notice-back"\s+aria-hidden="true"\s+inert>/,
    '关闭状态的 modal 背板必须 inert，不能把隐藏按钮留在 Tab 顺序中');
assert.match(LOGIN_CSS, /#login:focus-visible\s*\{/,
    '登录按钮必须有可见键盘焦点');

const readZIndex = (source, selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = source.match(new RegExp(`${escaped}\\s*\\{[\\s\\S]*?z-index\\s*:\\s*(\\d+)`));
    assert.ok(match, `找不到 ${selector} 的 z-index`);
    return Number(match[1]);
};
const noticeZ = readZIndex(DESKTOP_CSS, '#notice-back');
const competingLayers = [
    readZIndex(DESKTOP_CSS, '#cm'),
    readZIndex(DESKTOP_CSS, '#dp'),
    readZIndex(DESKTOP_CSS, 'body>.container'),
    readZIndex(DESKTOP_CSS, '#taskbar-preview'),
    readZIndex(LOGIN_CSS, '#loginback'),
];
assert.ok(noticeZ > Math.max(...competingLayers),
    'modal 必须绘制在所有会被它设为 inert 的可见浮层之上');
console.log('✓ login gate：物理按钮可交互，About 延后且位于全部 inert 浮层之上');

// Highest-visible-layer focus guard: loadback blocks focus entirely; then
// orientation and login each own a bounded Tab cycle. Notice has its own trap.
{
    let document;
    const focusable = (id) => ({
        id, visible: true,
        getClientRects: () => [{ width: 1, height: 1 }],
        focus() { document.activeElement = this; },
    });
    const layer = (id, items = []) => ({
        id, visible: true, shown: false, items,
        classList: { contains(name) { return name === 'show' && this.owner.shown; }, owner: null },
        getClientRects() { return this.visible ? [{ width: 1, height: 1 }] : []; },
        querySelectorAll() { return this.items; },
        contains(target) { return target === this || this.items.includes(target); },
        focus() { document.activeElement = this; },
    });
    const orientationButton = focusable('orientation-close');
    const password = focusable('login-password');
    const loginButton = focusable('login');
    const noticeBack = layer('notice-back');
    const loadback = layer('loadback');
    const orientation = layer('orientation-warning', [orientationButton]);
    const loginback = layer('loginback', [password, loginButton]);
    for (const item of [noticeBack, loadback, orientation, loginback]) item.classList.owner = item;
    const background = focusable('background');
    document = {
        activeElement: background,
        getElementById(id) { return { noticeBack, loadback, orientation, loginback }[
            id === 'notice-back' ? 'noticeBack' : id
        ]; },
    };
    // getElementById lookup without relying on camel-case conversion.
    const byId = { 'notice-back': noticeBack, loadback, 'orientation-warning': orientation, loginback };
    document.getElementById = id => byId[id] || null;
    const context = vm.createContext({
        document,
        getComputedStyle(element) {
            return { display: element.visible ? 'block' : 'none', visibility: 'visible' };
        },
    });
    vm.runInContext([
        extractFunction(DESKTOP_JS, 'isVisibleBlockingLayer'),
        extractFunction(DESKTOP_JS, 'getHighestBlockingLayer'),
        extractFunction(DESKTOP_JS, 'getBlockingLayerFocusable'),
        extractFunction(DESKTOP_JS, 'focusHighestBlockingLayer'),
        extractFunction(DESKTOP_JS, 'handleBlockingLayerKeydown'),
        extractFunction(DESKTOP_JS, 'handleBlockingLayerFocus'),
        'globalThis.__gate = { key: handleBlockingLayerKeydown, focus: handleBlockingLayerFocus };',
    ].join('\n'), context, { filename: 'desktop.js#blocking-focus' });

    let prevented = false;
    context.__gate.key({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
    assert.equal(prevented, true, 'loadback 可见时 Tab 必须被拦截');
    assert.equal(document.activeElement, background);

    loadback.visible = false;
    prevented = false;
    context.__gate.key({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(document.activeElement, orientationButton, '竖屏提示必须接管背景焦点');
    context.__gate.key({ key: 'Tab', shiftKey: false, preventDefault() {} });
    assert.equal(document.activeElement, orientationButton, '单按钮竖屏提示必须循环焦点');

    orientation.visible = false;
    document.activeElement = background;
    context.__gate.focus({ target: background });
    assert.equal(document.activeElement, password, '登录层必须拦回程序化背景焦点');
    document.activeElement = loginButton;
    context.__gate.key({ key: 'Tab', shiftKey: false, preventDefault() {} });
    assert.equal(document.activeElement, password, '登录层末项 Tab 必须回到首项');

    noticeBack.shown = true;
    document.activeElement = background;
    context.__gate.focus({ target: background });
    assert.equal(document.activeElement, background, 'notice 显示时必须交给其独立 focus trap');
}
console.log('✓ startup focus：loadback、竖屏提示和登录层按最高可见层隔离焦点');

// ---------------------------------------------------------------- taskbar preview

function createPreviewHarness() {
    const state = {
        previewExists: false,
        previewShown: false,
        titleImage: '',
        titleText: '',
        previewContents: [],
        clearTimeoutCalls: [],
    };
    const windows = {
        live: { min: false, icon: 'apps/icons/live.svg', title: 'Live window', width: 640 },
        minimized: { min: true, icon: 'apps/icons/min.svg', title: 'Minimized window', width: 640 },
    };

    function emptySelection() {
        return {
            0: undefined, length: 0,
            addClass() { return this; }, removeClass() { return this; },
            attr() { return arguments.length > 1 ? this : undefined; },
            text() { return arguments.length ? this : ''; }, empty() { return this; },
            append() { return this; }, css() { return this; }, clone() { return this; },
            find() { return this; }, hasClass() { return false; }, remove() { return this; },
        };
    }

    const previewWindow = {
        empty() { state.previewContents = []; return this; },
        append(content) { state.previewContents.push(content); return this; },
    };
    const previewSelection = {
        length: 1,
        addClass(name) { if (name === 'show') state.previewShown = true; return this; },
        removeClass(name) { if (name === 'show') state.previewShown = false; return this; },
        css() { return this; },
        find(selector) {
            if (selector === '.preview-title img') return {
                attr(name, value) {
                    if (arguments.length === 1) return state.titleImage;
                    state.titleImage = value;
                    return this;
                },
            };
            if (selector === '.preview-title span') return {
                text(value) {
                    if (!arguments.length) return state.titleText;
                    state.titleText = value;
                    return this;
                },
            };
            if (selector === '.preview-content .preview-window') return previewWindow;
            return emptySelection();
        },
    };

    function contentSelection(definition) {
        const content = {
            0: { offsetWidth: definition.width }, length: 1,
            clone() { return contentSelection(definition); },
            find() { return { remove() { return this; } }; },
            css() { return this; },
        };
        return content;
    }

    function windowSelection(definition) {
        if (!definition) return emptySelection();
        return {
            length: 1,
            hasClass(name) { return name === 'min' && definition.min; },
            find(selector) {
                if (selector === '.titbar img.icon') return { attr: () => definition.icon };
                if (selector === '.titbar p') return { text: () => definition.title };
                if (selector === '.titbar span') return { text: () => '' };
                if (selector === '.content') return contentSelection(definition);
                return emptySelection();
            },
        };
    }

    function $(selector) {
        if (typeof selector === 'string' && selector.startsWith('.window.')) {
            return windowSelection(windows[selector.slice('.window.'.length)]);
        }
        if (selector === '#taskbar-preview') return previewSelection;
        if (typeof selector === 'object') return { 0: selector, length: 1 };
        return emptySelection();
    }

    const context = vm.createContext({
        $,
        console: { log() {} },
        clearTimeout(id) { state.clearTimeoutCalls.push(id); },
        document: {
            getElementById(id) {
                return id === 'taskbar-preview' && state.previewExists ? {} : null;
            },
            createElement() { return { id: '', innerHTML: '' }; },
            body: { appendChild() { state.previewExists = true; } },
        },
    });
    vm.runInContext(`
        let previewTimeout;
        ${extractFunction(DESKTOP_JS, 'showTaskbarPreview')}
        globalThis.__preview = {
            show: showTaskbarPreview,
            setTimer(value) { previewTimeout = value; }
        };
    `, context, { filename: 'desktop.js#showTaskbarPreview' });
    return { context, state };
}

const previewHarness = createPreviewHarness();
const taskbarItem = { getBoundingClientRect: () => ({ left: 400 }) };
previewHarness.context.__preview.show('live', { currentTarget: taskbarItem });
assert.equal(previewHarness.state.previewShown, true, '正常窗口应展示预览');
assert.equal(previewHarness.state.titleText, 'Live window');
assert.equal(previewHarness.state.titleImage, 'apps/icons/live.svg');
assert.equal(previewHarness.state.previewContents.length, 1);

previewHarness.context.__preview.setTimer(73);
previewHarness.context.__preview.show('minimized', { currentTarget: taskbarItem });
assert.deepEqual(previewHarness.state.clearTimeoutCalls, [undefined, 73],
    '进入新任务时应取消旧任务的延时隐藏');
assert.equal(previewHarness.state.previewShown, false,
    '从正常任务移到最小化任务后必须立即隐藏旧预览');
assert.equal(previewHarness.state.titleText, '', '最小化任务不得保留旧标题');
assert.equal(previewHarness.state.titleImage, '', '最小化任务不得保留旧图标');
assert.equal(previewHarness.state.previewContents.length, 0, '最小化任务不得保留旧预览 DOM');

previewHarness.context.__preview.show('missing', { currentTarget: taskbarItem });
assert.equal(previewHarness.state.titleText, '', '缺失窗口也不得恢复旧预览');
console.log('✓ taskbar preview：正常任务 → 最小化/缺失任务会同步清空 show、title、icon 与内容');

// ---------------------------------------------------------------- notice modal

function createModalHarness() {
    const timers = new Map();
    let nextTimer = 1;
    const listeners = {};
    const state = {
        backShown: false, noticeShown: false, backAttrs: {}, content: '', buttons: '',
        transientDismissals: [],
    };
    let document;

    function element(name, options = {}) {
        return {
            name,
            inert: !!options.inert,
            isConnected: true,
            attrs: {},
            clicked: 0,
            roleButton: !!options.roleButton,
            focus() { document.activeElement = this; },
            blur() { if (document.activeElement === this) document.activeElement = null; },
            click() { this.clicked++; },
            matches(selector) { return selector === '#notice a[role="button"]' && this.roleButton; },
            setAttribute(name, value) { this.attrs[name] = String(value); },
            removeAttribute(name) { delete this.attrs[name]; },
        };
    }

    const opener = element('opener');
    const background = element('background');
    const alreadyInert = element('already-inert', { inert: true });
    const noticeBack = element('notice-back', { inert: true });
    const title = element('notice-title');
    const first = element('first-button');
    const last = element('last-link', { roleButton: true });
    const focusables = [first, last];
    const notice = element('notice');
    notice.querySelector = selector => selector === '.cnt>.tit' ? title : null;
    notice.contains = target => target === notice || focusables.includes(target);

    document = {
        activeElement: opener,
        body: { children: [background, alreadyInert, noticeBack] },
        getElementById(id) { return id === 'notice' ? notice : id === 'notice-back' ? noticeBack : null; },
        querySelectorAll() { return focusables; },
        addEventListener(type, listener) { listeners[type] = listener; },
    };

    function selection(selector) {
        return {
            hasClass(name) { return selector === '#notice-back' && name === 'show' && state.backShown; },
            addClass(name) {
                if (selector === '#notice-back' && name === 'show') state.backShown = true;
                if (selector === '#notice' && name === 'show') state.noticeShown = true;
                return this;
            },
            removeClass(name) {
                if (selector === '#notice-back' && name === 'show') state.backShown = false;
                if (selector === '#notice' && name === 'show') state.noticeShown = false;
                if (selector === '#cm, #dp, #descp' || selector === '#taskbar-preview') {
                    state.transientDismissals.push([selector, name]);
                }
                return this;
            },
            html(value) {
                if (selector === '#notice>.cnt') state.content = value;
                if (selector === '#notice>.btns') state.buttons = value;
                return this;
            },
            attr(name, value) {
                if (selector === '#notice-back' && typeof name === 'string' && arguments.length > 1) {
                    state.backAttrs[name] = String(value);
                }
                if (selector === '#notice a:not([href])' && typeof name === 'object') {
                    last.roleButton = name.role === 'button';
                    last.attrs.tabindex = name.tabindex;
                }
                return this;
            },
        };
    }

    const context = vm.createContext({
        $: selection,
        document,
        getComputedStyle: () => ({ display: 'block' }),
        nts: {
            first: { cnt: '<p class="tit">First</p>', btn: [{ type: 'main', text: 'OK', js: 'closenotice()' }] },
            second: { cnt: '<p class="tit">Second</p>', btn: [{ type: 'cancel', text: 'Cancel', js: 'closenotice()' }] },
        },
        setTimeout(callback, delay) {
            const id = nextTimer++;
            timers.set(id, { callback, delay });
            return id;
        },
        clearTimeout(id) { timers.delete(id); },
        focusHighestBlockingLayer() {},
    });

    const modalStart = DESKTOP_JS.indexOf('let noticePreviousFocus');
    const modalEnd = DESKTOP_JS.indexOf(extractFunction(DESKTOP_JS, 'closenotice'))
        + extractFunction(DESKTOP_JS, 'closenotice').length;
    assert.notEqual(modalStart, -1, '找不到 notice 状态');
    vm.runInContext(`${DESKTOP_JS.slice(modalStart, modalEnd)}\n` +
        'globalThis.__modal = { show: shownotice, close: closenotice, keydown: handleNoticeKeydown };',
        context, { filename: 'desktop.js#notice' });

    function runNextTimer() {
        const entry = timers.entries().next();
        if (entry.done) return false;
        const [id, timer] = entry.value;
        timers.delete(id);
        timer.callback();
        return true;
    }
    function runAllTimers() { while (runNextTimer()) {} }
    return {
        context, state, document, timers, listeners,
        elements: { opener, background, alreadyInert, notice, noticeBack, title, first, last },
        runNextTimer, runAllTimers,
    };
}

const modal = createModalHarness();
modal.context.__modal.show('first');
assert.equal(modal.state.backShown, true);
assert.equal(modal.elements.noticeBack.inert, false, '打开 modal 前必须解除自身 inert');
assert.deepEqual(modal.state.transientDismissals, [
    ['#cm, #dp, #descp', 'show show-begin'],
    ['#taskbar-preview', 'show'],
], 'modal 入场必须同步清理可能覆盖它的瞬态浮层');
assert.equal(modal.state.backAttrs['aria-hidden'], 'false');
assert.equal(modal.elements.background.inert, true, '打开 modal 后背景必须 inert');
assert.equal(modal.elements.alreadyInert.inert, true);
assert.equal(modal.elements.notice.attrs.role, 'dialog');
assert.equal(modal.elements.notice.attrs['aria-modal'], 'true');
assert.equal(modal.elements.notice.attrs['aria-labelledby'], 'notice-title');
modal.runAllTimers();
assert.equal(modal.state.noticeShown, true);
assert.equal(modal.document.activeElement, modal.elements.first, '打开动画后应聚焦第一个控件');

let prevented = false;
modal.elements.last.focus();
modal.context.__modal.keydown({ key: 'Tab', shiftKey: false, target: modal.elements.last,
    preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(modal.document.activeElement, modal.elements.first, 'Tab 应从末项循环到首项');
modal.elements.first.focus();
modal.context.__modal.keydown({ key: 'Tab', shiftKey: true, target: modal.elements.first,
    preventDefault() {} });
assert.equal(modal.document.activeElement, modal.elements.last, 'Shift+Tab 应从首项循环到末项');

modal.context.__modal.close();
modal.context.__modal.show('second');
modal.runAllTimers();
assert.equal(modal.state.backShown, true, '关闭动画中重开不得被旧 close timer 关闭');
assert.equal(modal.elements.background.inert, true);
modal.context.__modal.close();
modal.runAllTimers();
assert.equal(modal.state.backShown, false);
assert.equal(modal.state.backAttrs['aria-hidden'], 'true');
assert.equal(modal.elements.noticeBack.inert, true, '关闭 modal 后隐藏按钮必须退出 Tab 顺序');
assert.equal(modal.elements.background.inert, false, '最终关闭应恢复本次设置的 inert');
assert.equal(modal.elements.alreadyInert.inert, true, '不得清除页面原本的 inert');
assert.equal(modal.document.activeElement, modal.elements.opener, '最终关闭应恢复原焦点');
console.log('✓ notice：ARIA、focus trap、inert 所有权、关闭中重开与焦点恢复均通过');

// 在入场延迟结束前关闭时，旧的入场 timer 也必须失效；否则 notice 会在关闭过程中
// 重新加回 .show 并抢走焦点，最长持续约 200ms。
const earlyClose = createModalHarness();
earlyClose.context.__modal.show('first');
earlyClose.context.__modal.close();
assert.equal(earlyClose.timers.size, 1,
    '关闭 modal 时应取消未完成的入场 timer，只保留关闭 timer');
earlyClose.runAllTimers();
assert.equal(earlyClose.state.noticeShown, false, '提前关闭后旧入场 timer 不得重新显示 notice');
assert.equal(earlyClose.document.activeElement, earlyClose.elements.opener,
    '提前关闭后旧入场 timer 不得抢走焦点');
console.log('✓ notice：入场未完成时关闭不会被旧 timer 重新打开');
