#!/usr/bin/env node
// Tauri 登录桥超时、fail-closed 状态与点击重试的无依赖回归测试。
//   node tools/regress/login-bridge.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const DESKTOP_JS = readFileSync(resolve(HERE, '../../desktop.js'), 'utf8');

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

const loginStart = DESKTOP_JS.indexOf('let loginPasswordHasPassword');
const loginEndFunction = extractFunction(DESKTOP_JS, 'win12SetLoginPassword');
const loginEnd = DESKTOP_JS.indexOf(loginEndFunction) + loginEndFunction.length;
assert.notEqual(loginStart, -1, '找不到登录状态定义');
const LOGIN_SOURCE = DESKTOP_JS.slice(loginStart, loginEnd);

// 除状态读取外，密码验证和设置页 IPC 也必须受同一个超时边界保护。
for (const name of [
    'initLoginPassword',
    'win12LoginSubmit',
    'win12RefreshPasswordSettingStatus',
    'win12SetLoginPassword',
]) {
    assert.match(extractFunction(DESKTOP_JS, name), /withLoginBridgeTimeout\(/,
        `${name} 的 Tauri IPC 缺少超时保护`);
}

function createHarness() {
    let nextTimer = 1;
    const timers = new Map();
    const state = {
        classes: new Map(),
        focused: null,
        notices: [],
        setCalls: [],
        getStatus: () => new Promise(() => {}),
        verify: () => new Promise(() => {}),
        setPassword: () => new Promise(() => {}),
        nodes: new Map(),
    };

    function node(selector) {
        if (!state.nodes.has(selector)) {
            state.nodes.set(selector, {
                attrs: {}, props: {}, styles: {}, text: '', value: '',
            });
        }
        return state.nodes.get(selector);
    }

    function selection(selector) {
        const current = node(selector);
        return {
            addClass(name) {
                const classes = state.classes.get(selector) || new Set();
                classes.add(name);
                state.classes.set(selector, classes);
                return this;
            },
            removeClass(name) {
                state.classes.get(selector)?.delete(name);
                return this;
            },
            hasClass(name) { return state.classes.get(selector)?.has(name) || false; },
            css(name, value) {
                if (arguments.length === 1) return current.styles[name];
                current.styles[name] = value;
                return this;
            },
            prop(name, value) {
                if (arguments.length === 1) return current.props[name];
                current.props[name] = value;
                return this;
            },
            attr(name, value) {
                if (arguments.length === 1) return current.attrs[name];
                current.attrs[name] = value;
                return this;
            },
            text(value) {
                if (!arguments.length) return current.text;
                current.text = value;
                return this;
            },
            val(value) {
                if (!arguments.length) return current.value;
                current.value = value;
                return this;
            },
            focus() { state.focused = selector; return this; },
            show() { current.styles.display = ''; return this; },
            hide() { current.styles.display = 'none'; return this; },
        };
    }

    const win12Native = {
        isTauri: () => true,
        getLoginPasswordStatus: () => state.getStatus(),
        verifyLoginPassword: password => state.verify(password),
        setLoginPassword: (currentPassword, newPassword) => {
            state.setCalls.push({ currentPassword, newPassword });
            return state.setPassword(currentPassword, newPassword);
        },
    };
    const windowObject = {
        win12Native,
        __TAURI__: { core: {} },
    };
    const context = vm.createContext({
        $: selection,
        URL,
        Promise,
        window: windowObject,
        location: { href: 'https://local.test/desktop.html' },
        use_music: false,
        shownotice(name) { state.notices.push(name); },
        document: { querySelector: () => ({ play() {} }) },
        setTimeout(callback, delay) {
            const id = nextTimer++;
            timers.set(id, { callback, delay });
            return id;
        },
        clearTimeout(id) { timers.delete(id); },
    });
    vm.runInContext(`${LOGIN_SOURCE}\n` + `
        globalThis.__login = {
            init: initLoginPassword,
            submit: win12LoginSubmit,
            refreshSetting: win12RefreshPasswordSettingStatus,
            setPassword: win12SetLoginPassword,
            get status() { return loginPasswordStatus; },
            get hasPassword() { return loginPasswordHasPassword; }
        };
    `, context, { filename: 'desktop.js#login' });

    function runTimer(delay) {
        const entry = [...timers.entries()].find(([, timer]) => timer.delay === delay);
        assert.ok(entry, `找不到 ${delay}ms timer`);
        const [id, timer] = entry;
        timers.delete(id);
        timer.callback();
    }
    function runAllTimers() {
        while (timers.size) {
            const [id, timer] = timers.entries().next().value;
            timers.delete(id);
            timer.callback();
        }
    }
    return { context, state, timers, node, runTimer, runAllTimers };
}

// 首次 IPC 永久 pending：8s 边界后必须进入 error，而不是放行或永远 pending。
const statusHarness = createHarness();
const firstInit = statusHarness.context.__login.init();
assert.equal(statusHarness.context.__login.status, 'pending');
assert.equal(statusHarness.node('#login-password').props.disabled, true);
statusHarness.runTimer(8000);
await firstInit;
assert.equal(statusHarness.context.__login.status, 'error');
assert.equal(statusHarness.node('#login-error').text, '无法读取本地密码状态');
assert.equal(statusHarness.node('#login').styles['pointer-events'], 'auto');
assert.equal(statusHarness.state.notices.length, 0, '状态超时不得绕过登录并显示 About');

// error 状态下点击登录会重新读取；第二次返回 no-password 后才允许完成登录。
statusHarness.state.getStatus = async () => ({ has_password: false });
await statusHarness.context.__login.submit();
assert.equal(statusHarness.context.__login.status, 'no-password');
assert.equal(statusHarness.timers.size, 1, '成功重试后应进入登录退出动画');
statusHarness.runAllTimers();
assert.equal(statusHarness.node('#loginback').styles.display, 'none');
assert.deepEqual(statusHarness.state.notices, ['about'], 'About 只能在登录层隐藏后显示一次');

// 密码验证自身也可能永久 pending；超时后必须恢复按钮，并允许下一次点击重试。
const verifyHarness = createHarness();
verifyHarness.state.getStatus = async () => ({ has_password: true });
await verifyHarness.context.__login.init();
assert.equal(verifyHarness.timers.size, 0, '快速 IPC 完成后必须取消超时 timer');
assert.equal(verifyHarness.context.__login.status, 'has-password');
assert.equal(verifyHarness.node('#login-password').props.disabled, false);
verifyHarness.node('#login-password').value = 'secret';
const firstSubmit = verifyHarness.context.__login.submit();
assert.equal(verifyHarness.node('#login').styles['pointer-events'], 'none');
verifyHarness.runTimer(8000);
await firstSubmit;
assert.equal(verifyHarness.context.__login.status, 'has-password');
assert.match(verifyHarness.node('#login-error').text, /验证密码超时/);
assert.equal(verifyHarness.node('#login').styles['pointer-events'], 'auto');
assert.equal(verifyHarness.state.notices.length, 0);

verifyHarness.state.verify = async password => ({ ok: password === 'secret' });
await verifyHarness.context.__login.submit();
assert.equal(verifyHarness.node('#login-password').value, '');
verifyHarness.runAllTimers();
assert.deepEqual(verifyHarness.state.notices, ['about'], '验证超时后的下一次成功点击应正常完成登录');

// 设置页使用相同 IPC：刷新/保存超时后控件必须恢复到可重试状态。
const settingsHarness = createHarness();
const firstRefresh = settingsHarness.context.__login.refreshSetting();
settingsHarness.runTimer(8000);
await firstRefresh;
assert.equal(settingsHarness.context.__login.status, 'error');
assert.match(settingsHarness.node('#setting-password-status').text, /读取本地密码状态超时/);
assert.equal(settingsHarness.node('#setting-password-new').props.disabled, true);
assert.equal(settingsHarness.state.classes.get('#setting-password-submit')?.has('disabled'), true);

settingsHarness.state.getStatus = async () => ({ has_password: false });
await settingsHarness.context.__login.refreshSetting();
assert.equal(settingsHarness.context.__login.status, 'no-password');
assert.equal(settingsHarness.node('#setting-password-new').props.disabled, false);
assert.equal(settingsHarness.state.classes.get('#setting-password-submit')?.has('disabled'), false);

settingsHarness.node('#setting-password-new').value = 'new-secret';
const firstSave = settingsHarness.context.__login.setPassword();
settingsHarness.runTimer(8000);
await firstSave;
assert.match(settingsHarness.node('#setting-password-status').text, /保存本地密码超时/);
assert.equal(settingsHarness.state.classes.get('#setting-password-submit')?.has('disabled'), false,
    '保存超时后提交控件必须重新启用');

settingsHarness.state.setPassword = async () => true;
settingsHarness.state.getStatus = async () => ({ has_password: true });
await settingsHarness.context.__login.setPassword();
assert.deepEqual(settingsHarness.state.setCalls.at(-1), {
    currentPassword: null,
    newPassword: 'new-secret',
});
assert.equal(settingsHarness.context.__login.status, 'has-password');
assert.equal(settingsHarness.node('#setting-password-status').text, '密码已保存');
assert.equal(settingsHarness.timers.size, 0, '设置页成功重试后不得残留超时 timer');

console.log('✓ Tauri 登录/验证/设置 IPC 超时均 fail-closed，控件可恢复并重试，About 仅在登录退出后显示');
