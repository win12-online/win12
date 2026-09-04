#!/usr/bin/env node
// win12 行为回归对比。
//   node tools/regress/run.mjs                      # 对比 ../win12-baseline 与当前工作树
//   node tools/regress/run.mjs --save baseline-v2   # 只采集当前树，存为命名基线
//   node tools/regress/run.mjs --against baseline-v2
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from '/Users/moraxcheng/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import { capture } from './capture.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');
const OUT = resolve(HERE, 'snapshots');
const LOCALES = ['zh-CN', 'en'];

function arg(name, def) {
    const i = process.argv.indexOf('--' + name);
    return i === -1 ? def : (process.argv[i + 1] ?? true);
}

// puppeteer 自带的版本探测经常和本机实际装的对不上（升级 puppeteer 会清掉旧的
// ~/.cache/puppeteer/chrome，导致它去找一个根本不存在的版本）。这里按多个来源依次回退，
// 任何一个能用就行——套件只需要一个 Chromium 内核，不挑版本。
function findChrome() {
    if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;

    const cands = [];
    // ① puppeteer 自己的缓存
    const pupBase = resolve(process.env.HOME, '.cache/puppeteer/chrome');
    if (existsSync(pupBase)) {
        for (const dir of readdirSync(pupBase).sort().reverse()) {
            for (const rel of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
                               'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
                               'chrome-linux64/chrome']) {
                cands.push(resolve(pupBase, dir, rel));
            }
        }
    }
    // ② playwright 的缓存
    const pwBase = resolve(process.env.HOME, 'Library/Caches/ms-playwright');
    if (existsSync(pwBase)) {
        for (const dir of readdirSync(pwBase).filter(d => d.startsWith('chromium')).sort().reverse()) {
            cands.push(resolve(pwBase, dir, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'));
            cands.push(resolve(pwBase, dir, 'chrome-linux/chrome'));
        }
    }
    // ③ 系统安装的浏览器
    cands.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
               '/Applications/Chromium.app/Contents/MacOS/Chromium',
               '/usr/bin/google-chrome', '/usr/bin/chromium');

    return cands.filter(existsSync);
}

const LAUNCH_ARGS = ['--no-sandbox', '--disable-gpu', '--use-fake-ui-for-media-stream',
                     '--use-fake-device-for-media-stream', '--disable-features=MediaFoundationVideoCapture'];

/** 光判断文件存在不够——本机就有一份 Framework 残缺的 playwright chromium，
 *  文件在但一启动就 dlopen 失败。所以逐个真的试启动，成功了才用。 */
async function launchBrowser() {
    const cands = findChrome();
    if (!cands.length) {
        console.error('找不到任何 Chromium。请设 CHROME_BIN，或跑 npx puppeteer browsers install chrome');
        process.exit(1);
    }
    const errs = [];
    for (const exe of cands) {
        try {
            const br = await puppeteer.launch({ headless: true, executablePath: exe, args: LAUNCH_ARGS });
            console.log(`浏览器: ${exe}`);
            return br;
        } catch (e) {
            errs.push(`  ${exe}\n    → ${String(e.message).split('\n')[0]}`);
        }
    }
    console.error('所有候选浏览器都启动失败：\n' + errs.join('\n'));
    process.exit(1);
}

function serve(dir, port) {
    const p = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
        { cwd: dir, stdio: 'ignore', detached: false });
    return { proc: p, origin: `http://127.0.0.1:${port}` };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function captureTree(browser, dir, port, label) {
    const srv = serve(dir, port);
    await sleep(700);
    try {
        const byLocale = {};
        for (const locale of LOCALES) {
            process.stdout.write(`  [${label}] ${locale} … `);
            const t = Date.now();
            byLocale[locale] = await capture(browser, { origin: srv.origin, locale, label });
            console.log(`${((Date.now() - t) / 1000).toFixed(1)}s`);
        }
        return byLocale;
    } finally {
        srv.proc.kill('SIGKILL');
    }
}

// ---------------------------------------------------------------- diff

function deepDiff(a, b, path = '', out = []) {
    if (a === b) return out;
    const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a;
    const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b;
    if (ta !== tb) { out.push({ path, base: a, cur: b }); return out; }
    if (ta === 'object') {
        for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
            deepDiff(a?.[k], b?.[k], path ? `${path}.${k}` : k, out);
        }
    } else if (ta === 'array') {
        if (a.length !== b.length) out.push({ path: path + '.length', base: a.length, cur: b.length });
        for (let i = 0; i < Math.max(a.length, b.length); i++) deepDiff(a[i], b[i], `${path}[${i}]`, out);
    } else if (a !== b) {
        out.push({ path, base: a, cur: b });
    }
    return out;
}

// 阶段 1 之前，这三条关闭路径在基线上确定会抛 TypeError
// （openapp 用 camelCase 而 hidewin 用原名，apps['code-editor'] / apps['camera-notice'] 是 undefined）。
// 修好之后要求它们干净 —— 届时把 EXPECTED_BASELINE_THROWS 清空。
const EXPECTED_BASELINE_THROWS = [
    /apps\.(code-editor|camera-notice)/,
    /Cannot read properties of undefined \(reading 'remove'\)/,
];

function summarize(diffs) {
    const buckets = {};
    for (const d of diffs) {
        const top = d.path.split(/[.\[]/)[0];
        (buckets[top] ||= []).push(d);
    }
    return buckets;
}

// ---------------------------------------------------------------- main

const browser = await launchBrowser();

mkdirSync(OUT, { recursive: true });

try {
    const saveAs = arg('save', null);
    const against = arg('against', null);

    if (saveAs) {
        console.log(`采集当前工作树 → ${saveAs}`);
        const cur = await captureTree(browser, REPO, 8811, saveAs);
        writeFileSync(resolve(OUT, `${saveAs}.json`), JSON.stringify(cur, null, 1));
        console.log(`已写入 tools/regress/snapshots/${saveAs}.json`);
        const errs = LOCALES.flatMap(l => cur[l].allErrors);
        console.log(`控制台错误 ${errs.length} 条${errs.length ? '：\n  - ' + [...new Set(errs)].join('\n  - ') : ''}`);
        process.exit(0);
    }

    let base;
    if (against) {
        base = JSON.parse(readFileSync(resolve(OUT, `${against}.json`), 'utf8'));
        console.log(`基线：快照 ${against}`);
    } else {
        const dir = resolve(REPO, '..', 'win12-baseline');
        if (!existsSync(dir)) { console.error(`找不到基线工作树 ${dir}`); process.exit(1); }
        console.log(`基线：工作树 ${dir}`);
        base = await captureTree(browser, dir, 8810, 'baseline');
    }
    const cur = await captureTree(browser, REPO, 8811, 'current');
    writeFileSync(resolve(OUT, 'current.json'), JSON.stringify(cur, null, 1));

    let total = 0;
    for (const locale of LOCALES) {
        const diffs = deepDiff(base[locale], cur[locale]).filter(d => !d.path.startsWith('meta'));
        total += diffs.length;
        console.log(`\n================ ${locale}：${diffs.length} 处差异 ================`);
        if (!diffs.length) { console.log('  ✅ 完全一致'); continue; }
        const buckets = summarize(diffs);
        for (const [k, ds] of Object.entries(buckets).sort((a, b) => b[1].length - a[1].length)) {
            console.log(`\n── ${k} (${ds.length}) ──`);
            for (const d of ds.slice(0, 25)) {
                const f = v => { const s = JSON.stringify(v); return s && s.length > 110 ? s.slice(0, 110) + '…' : s; };
                console.log(`  ${d.path}\n      基线: ${f(d.base)}\n      当前: ${f(d.cur)}`);
            }
            if (ds.length > 25) console.log(`  … 另有 ${ds.length - 25} 处`);
        }
    }
    console.log(`\n总计 ${total} 处差异。`);
    process.exit(total === 0 ? 0 : 2);
} finally {
    await browser.close();
}
