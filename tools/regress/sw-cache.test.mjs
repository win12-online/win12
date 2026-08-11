#!/usr/bin/env node
// sw.js 缓存策略、更新生命周期与 activate 接线回归测试。
//   node tools/regress/sw-cache.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const SW = readFileSync(resolve(HERE, '../../sw.js'), 'utf8');

function response(url, status) {
    return {
        url,
        status,
        ok: status >= 200 && status < 300,
        clone() { return response(url, status); },
    };
}

function createHarness({ initialUrls = [], fetchResponses = [], deleteDelay = 0 } = {}) {
    const listeners = {};
    const entries = new Map(initialUrls.map(url => [url, response(url, 200)]));
    const state = {
        deleteCalls: [],
        deleteCompleted: [],
        fetchCalls: [],
        putCalls: [],
    };

    const cache = {
        keys() {
            return Promise.resolve([...entries.keys()].map(url => ({ url, method: 'GET' })));
        },
        put(request, cachedResponse) {
            state.putCalls.push({ request, response: cachedResponse });
            entries.set(request.url, cachedResponse);
            return Promise.resolve();
        },
        delete(request) {
            state.deleteCalls.push(request.url);
            return new Promise(resolveDelete => {
                setTimeout(() => {
                    entries.delete(request.url);
                    state.deleteCompleted.push(request.url);
                    resolveDelete(true);
                }, deleteDelay);
            });
        },
    };

    const queue = [...fetchResponses];
    const scope = {
        URL,
        Promise,
        Boolean,
        setTimeout,
        console: { log() {} },
        caches: {
            keys: () => Promise.resolve(['def']),
            open: () => Promise.resolve(cache),
            match: request => Promise.resolve(entries.get(request.url)),
        },
        fetch(request) {
            state.fetchCalls.push(request.url);
            const next = queue.shift();
            if (next instanceof Error) return Promise.reject(next);
            return Promise.resolve(next || response(request.url, 200));
        },
        addEventListener(type, listener) {
            listeners[type] = listener;
        },
    };
    const context = vm.createContext(scope);
    vm.runInContext(SW, context, { filename: 'sw.js' });

    return { cache, context, entries, listeners, state };
}

async function dispatchFetch(harness, { url, method = 'GET' }) {
    let responsePromise;
    harness.listeners.fetch({
        request: { url, method },
        respondWith(promise) { responsePromise = Promise.resolve(promise); },
    });
    return responsePromise;
}

// 资源保护规则同时覆盖 GitHub Pages 子路径与根路径部署。
const protectionHarness = createHarness();
const isProtected = vm.runInContext('isProtected', protectionHarness.context);
const CASES = [
    ['Pages 字体',        'https://win12-online.github.io/win12/fonts/dos.ttf', true],
    ['Pages jQuery',      'https://win12-online.github.io/win12/scripts/jq.min.js', true],
    ['Pages 图标 CSS',    'https://win12-online.github.io/win12/bootstrap-icons.css', true],
    ['Pages 应用图标',    'https://win12-online.github.io/win12/apps/icons/setting/home.png', true],
    ['Pages 壁纸',        'https://win12-online.github.io/win12/img/bg.svg', true],
    ['根部署 字体',       'https://win12.tech/fonts/dos.ttf', true],
    ['根部署 jQuery',     'https://win12.tech/scripts/jq.min.js', true],
    ['根部署 图标 CSS',   'https://win12.tech/bootstrap-icons.css', true],
    ['根部署 壁纸',       'https://win12.tech/img/bg.svg', true],
    ['desktop.js',        'https://win12.tech/desktop.js', false],
    ['desktop.html',      'https://win12.tech/desktop.html', false],
    ['desktop.css',       'https://win12.tech/desktop.css', false],
    ['数据表',            'https://win12.tech/data/notices.js', false],
    ['Pages desktop.js',  'https://win12-online.github.io/win12/desktop.js', false],
    ['非法 URL',          'not-a-url', false],
];
for (const [name, url, want] of CASES) {
    assert.equal(isProtected(url), want, name);
}

// activate 必须显式传 force=false，并把完整异步删除链交给 waitUntil。
const protectedUrl = 'https://win12.tech/fonts/dos.ttf';
const mutableUrl = 'https://win12.tech/desktop.js';
const activateHarness = createHarness({
    initialUrls: [protectedUrl, mutableUrl],
    deleteDelay: 25,
});
let activateWork;
activateHarness.listeners.activate({
    waitUntil(promise) { activateWork = promise; },
});
assert.equal(typeof activateWork?.then, 'function', 'activate 应把 update Promise 传给 waitUntil');
await new Promise(resolveDelay => setTimeout(resolveDelay, 0));
assert.deepEqual(activateHarness.state.deleteCompleted, [], 'waitUntil Promise 不应在异步删除完成前解决');
await activateWork;
assert.deepEqual(activateHarness.state.deleteCalls, [mutableUrl], 'ActivateEvent 不能被当作 force=true');
assert.equal(activateHarness.entries.has(protectedUrl), true, 'activate 应保留受保护资源');
assert.equal(activateHarness.entries.has(mutableUrl), false, 'activate 应清理可变资源');

const directUpdate = vm.runInContext('update(false)', activateHarness.context);
assert.equal(typeof directUpdate?.then, 'function', 'update() 应返回 Promise');
await directUpdate;

// 显式 force 消息仍应强制清除，并同样绑定事件生命周期。
let messageWork;
activateHarness.listeners.message({
    data: { head: 'update', force: true },
    waitUntil(promise) { messageWork = promise; },
});
await messageWork;
assert.equal(activateHarness.entries.has(protectedUrl), false, 'force=true 应清除受保护资源');

// 404/503 不进入 CacheStorage；后续成功 GET 才缓存并供 cache-first 命中。
const resourceUrl = 'https://win12.tech/versioned.js';
const unavailableUrl = 'https://win12.tech/unavailable.js';
const staleErrorUrl = 'https://win12.tech/previously-cached-error.js';
const fetchHarness = createHarness({
    fetchResponses: [
        response(resourceUrl, 404),
        response(resourceUrl, 200),
        response(unavailableUrl, 503),
        response(staleErrorUrl, 200),
    ],
});
assert.equal((await dispatchFetch(fetchHarness, { url: resourceUrl })).status, 404);
assert.equal(fetchHarness.entries.has(resourceUrl), false, '404 不应被缓存');
assert.equal((await dispatchFetch(fetchHarness, { url: resourceUrl })).status, 200);
assert.equal(fetchHarness.entries.has(resourceUrl), true, '成功 GET 应被缓存');
assert.equal((await dispatchFetch(fetchHarness, { url: resourceUrl })).status, 200);
assert.equal(fetchHarness.state.fetchCalls.filter(url => url === resourceUrl).length, 2,
    '成功响应写入后应由 cache-first 命中');
assert.equal((await dispatchFetch(fetchHarness, { url: unavailableUrl })).status, 503);
assert.equal(fetchHarness.entries.has(unavailableUrl), false, '503 不应被缓存');

fetchHarness.entries.set(staleErrorUrl, response(staleErrorUrl, 404));
assert.equal((await dispatchFetch(fetchHarness, { url: staleErrorUrl })).status, 200,
    '已有错误缓存也必须绕过并重新请求');
assert.equal(fetchHarness.entries.get(staleErrorUrl).status, 200,
    '重新请求成功后应替换旧错误缓存');

const putsBeforePost = fetchHarness.state.putCalls.length;
const postResult = await dispatchFetch(fetchHarness, { url: 'https://win12.tech/api', method: 'POST' });
assert.equal(postResult, undefined, '非 GET 请求应交给浏览器网络栈，不调用 respondWith');
assert.equal(fetchHarness.state.putCalls.length, putsBeforePost, '非 GET 响应不应缓存');

console.log(`✓ ${CASES.length} 项保护规则、activate 生命周期与成功 GET 缓存策略均通过`);
