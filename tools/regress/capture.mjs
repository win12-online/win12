// 采集一棵工作树的完整行为快照。
// 原则：一律用 DOM / page.evaluate 断言，不用截图（本机截图不可靠）。
import { determinismScript, shouldBlock } from './determinism.mjs';

const BOOT_TIMEOUT = 45000;

/** 计算样式快照要比对的选择器 —— 覆盖 shell 各区域 + 窗口各状态 + 共享组件 */
const STYLE_SELECTORS = [
    ':root', 'body', '#dock-box', '#taskbar', '#toolbar', '#start-btn', '#search-btn',
    '#start-menu', '#startmenu-l', '#startmenu-r', '#search-win', '#widgets', '#control',
    '#datebox', '#copilot', '#desktop', '#cm', '#dp', '#descp', '#notice-back', '#notice',
    '#window-fill', '#open-dock', '#loadback', '#voiceBall', '#desktop-widgets',
    '.window.calc', '.window.calc>.titbar', '.window.calc>.content',
    '.window.explorer', '.window.explorer>.titbar', '.window.setting', '.window.taskmgr',
    '.window.about', '.window.notepad', '.window.terminal', '.window.edge', '.window.word',
    '.window.defender', '.window.msstore', '.window.whiteboard', '.window.vscode',
    '.window.calc>.titbar>div>.wbtg', '.window.calc>.loadback',
];

const STYLE_PROPS = [
    'display', 'position', 'width', 'height', 'top', 'left', 'right', 'bottom',
    'color', 'background-color', 'background-image', 'border-radius', 'border',
    'box-shadow', 'opacity', 'transform', 'transition', 'z-index', 'overflow',
    'font-family', 'font-size', 'font-weight', 'line-height', 'padding', 'margin',
    'flex-direction', 'align-items', 'justify-content', 'gap', 'backdrop-filter',
];

export async function preparePage(browser, { locale, onlyOrigin = null }) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on('request', req => {
        const outsideProbeOrigin = onlyOrigin
            && /^https?:/i.test(req.url())
            && !req.url().startsWith(onlyOrigin.replace(/\/$/, '') + '/');
        if (outsideProbeOrigin || shouldBlock(req.url())) req.abort('blockedbyclient').catch(() => {});
        else req.continue().catch(() => {});
    });
    await page.evaluateOnNewDocument(determinismScript());
    await page.evaluateOnNewDocument(`try { localStorage.setItem('lang', ${JSON.stringify(locale)}); } catch (e) {}`);
    return page;
}

async function bootDesktop(page, origin) {
    // ?develop 跳过 service worker 注册，避免缓存干扰
    await page.goto(`${origin}/desktop.html?develop`, { waitUntil: 'load', timeout: BOOT_TIMEOUT });
    await page.waitForFunction(
        () => typeof window.openapp === 'function'
            && document.querySelectorAll('.window').length > 0
            && document.querySelector('#desktop')
            && getComputedStyle(document.querySelector('#loadback')).display === 'none',
        { timeout: BOOT_TIMEOUT, polling: 100 }
    );
    await settle(page, 400);
}

const settle = (page, ms) => page.evaluate(d => new Promise(r => setTimeout(r, d)), ms);

/** 关掉过渡动画，让几何测量稳定；两侧注入完全一致 */
const freezeTransitions = page => page.evaluate(() => document.documentElement.classList.add('notrans'));
const thawTransitions = page => page.evaluate(() => document.documentElement.classList.remove('notrans'));

// ---------------------------------------------------------------- 采集步骤

/** 启动结构：窗口数量、id、class 顺序、拖拽下标配对对齐（C2 / C3） */
const captureBootStructure = page => page.evaluate(() => {
    const wins = [...document.querySelectorAll('.window')];
    const titbars = [...document.querySelectorAll('.window>.titbar')];
    return {
        windowCount: wins.length,
        // classList[1] 就是 app id —— 这是承重墙，顺序错一个全盘皆错
        windowIds: wins.map(w => w.classList[1]),
        windowClassLists: wins.map(w => [...w.classList].join(' ')),
        titbarCount: titbars.length,
        // 下标配对是否对齐：titbars[i] 必须是 wins[i] 的直接子元素
        titbarPairingAligned: wins.every((w, i) => titbars[i] && titbars[i].parentElement === w),
        titbarPairingMismatches: wins.map((w, i) =>
            (titbars[i] && titbars[i].parentElement === w) ? null : `#${i} ${w.classList[1]}`
        ).filter(Boolean),
        // 只记真正的 shell 区域；<script>/<style> 不是区域，否则拆分脚本就会造成假差异
        shellRegionIds: [...document.body.children]
            .filter(e => !['SCRIPT', 'STYLE', 'LINK'].includes(e.tagName))
            .map(e => e.id || `.${e.className}`).filter(Boolean),
        htmlClass: document.documentElement.className,
        i18nApplied: (() => {
            const el = document.querySelector('[data-i18n="setting.name"]');
            return el ? el.textContent.trim() : null;
        })(),
        i18nUntranslatedKeys: [...document.querySelectorAll('[data-i18n]')]
            .filter(e => /^\[[\w.\-]+\]$/.test(e.textContent.trim())).length,
    };
});

/** 逐个应用：开 → 断言 → 最大化 → 还原 → 最小化 → 还原 → 关闭 */
async function captureApps(page) {
    const ids = await page.evaluate(() =>
        [...document.querySelectorAll('.window')].map(w => w.classList[1])
    );
    const result = {};
    for (const id of ids) {
        result[id] = await page.evaluate(async (appId) => {
            const errBefore = window.__errors.length;
            const q = () => document.querySelector('.window.' + CSS.escape(appId));
            const snap = el => {
                if (!el) return null;
                const r = el.getBoundingClientRect();
                return {
                    classes: [...el.classList].join(' '),
                    display: getComputedStyle(el).display,
                    rect: { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) },
                };
            };
            const wait = ms => new Promise(r => setTimeout(r, ms));
            const out = { camel: appId.replace(/-(\w)/g, (_, c) => c.toUpperCase()) };
            const APPS = window.__g('apps');           // apps 是 let，不在 window 上
            out.hasAppObject = !!(APPS && APPS[out.camel]);
            out.hasInit = !!(APPS && APPS[out.camel] && APPS[out.camel].init);
            // hidewin 用的是原名而非 camel —— 这正是已知 bug 的来源，一并记录
            out.hasAppObjectByRawName = !!(APPS && APPS[appId]);

            try { window.openapp(appId); } catch (e) { out.openThrew = String(e); }
            await wait(250);
            out.afterOpen = snap(q());
            out.taskbarButton = !!document.querySelector('#taskbar>.' + CSS.escape(appId));
            out.focused = !!(q() && q().classList.contains('foc'));

            try { window.maxwin(appId); } catch (e) { out.maxThrew = String(e); }
            await wait(250);
            out.afterMax = snap(q());
            try { window.maxwin(appId); } catch (e) { out.unmaxThrew = String(e); }
            await wait(250);
            out.afterUnmax = snap(q());

            try { window.minwin(appId); } catch (e) { out.minThrew = String(e); }
            await wait(250);
            out.afterMin = snap(q());
            try { window.minwin(appId); } catch (e) { out.unminThrew = String(e); }
            await wait(250);
            out.afterUnmin = snap(q());

            try { window.hidewin(appId); } catch (e) { out.closeThrew = String(e); }
            await wait(250);
            out.afterClose = snap(q());
            out.taskbarButtonAfterClose = !!document.querySelector('#taskbar>.' + CSS.escape(appId));
            out.errors = window.__errors.slice(errBefore);
            return out;
        }, id);
    }
    return result;
}

/** 右键菜单：逐个渲染 + 逐个触发 handler。
 *  cms 的 payload 是「存成字符串的 JS」，只比对 HTML 抓不到全局被私有化的回归。 */
// 有 4 个 cms 项是 arg => … 的函数，传 null 会抛异常、渲染为空——
// 那正是内容最动态的 4 个，必须给出与真实调用点一致的实参。
const CMS_ARGS = {
    'desktop.icon': ['calc', 0],                       // [appname, iconIndex]
    'smapp': ['calc', '计算器'],                        // [id, name]
    'smlapp': ['calc', '计算器'],                       // [id, name]
    'explorer.file': 'C:/Program Files/about.exe',      // 必须是虚拟文件系统里真实存在的路径
};

const captureContextMenus = page => page.evaluate(async (cmsArgs) => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = {};
    for (const id of Object.keys(window.__g('cms') || {})) {
        const errBefore = window.__errors.length;
        const rec = { rendered: null, itemCount: 0, handlerErrors: [] };
        try {
            const fakeEvent = { clientX: 400, clientY: 300, preventDefault() {}, stopPropagation() {}, target: document.body };
            window.showcm(fakeEvent, id, Object.prototype.hasOwnProperty.call(cmsArgs, id) ? cmsArgs[id] : null);
            await wait(80);
            const cm = document.querySelector('#cm');
            rec.rendered = cm ? cm.innerHTML : null;
            const items = cm ? [...cm.querySelectorAll('a[onmousedown], a[onclick]')] : [];
            rec.itemCount = items.length;
            // 逐个执行 handler 源码，断言不抛异常（不真正点击，避免打开一堆窗口）
            for (const it of items) {
                const src = it.getAttribute('onmousedown') || it.getAttribute('onclick') || '';
                if (!src.trim()) continue;
                // 只做「引用的标识符是否可解析」检查：把函数体编译一次并静态取顶层调用名
                for (const name of new Set([...src.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]))) {
                    if (['if', 'for', 'while', 'switch', 'return', 'function', 'catch', 'typeof'].includes(name)) continue;
                    if (typeof window[name] === 'undefined') {
                        rec.handlerErrors.push(`${id}: 未定义的全局 ${name}() —— 来自 ${src.slice(0, 60)}`);
                    }
                }
            }
        } catch (e) { rec.handlerErrors.push('showcm threw: ' + String(e)); }
        try { document.querySelector('#cm').classList.remove('show', 'show-begin'); } catch {}
        rec.consoleErrors = window.__errors.slice(errBefore);
        // 守卫：菜单渲染为空说明这一项根本没被测到，别让它冒充「无差异」
        if (!rec.rendered || rec.itemCount === 0) rec.HARNESS_EMPTY = true;
        out[id] = rec;
    }
    return out;
}, CMS_ARGS);

/** 通知/对话框：同上，逐个渲染 + 校验按钮 handler 引用的全局都还在 */
const captureNotices = page => page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = {};
    for (const id of Object.keys(window.__g('nts') || {})) {
        const errBefore = window.__errors.length;
        const rec = { rendered: null, buttons: 0, handlerErrors: [] };
        try {
            window.shownotice(id);
            await wait(80);
            const n = document.querySelector('#notice');
            rec.rendered = n ? n.innerHTML : null;
            const btns = n ? [...n.querySelectorAll('[onclick]')] : [];
            rec.buttons = btns.length;
            for (const b of btns) {
                const src = b.getAttribute('onclick') || '';
                for (const name of new Set([...src.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]))) {
                    if (['if', 'for', 'while', 'switch', 'return', 'function', 'catch', 'typeof'].includes(name)) continue;
                    if (typeof window[name] === 'undefined') {
                        rec.handlerErrors.push(`${id}: 未定义的全局 ${name}() —— 来自 ${src.slice(0, 60)}`);
                    }
                }
            }
            window.closenotice();
            await wait(60);
        } catch (e) { rec.handlerErrors.push('shownotice threw: ' + String(e)); }
        rec.consoleErrors = window.__errors.slice(errBefore);
        out[id] = rec;
    }
    return out;
});

/** shell 交互：开始菜单 / 搜索 / 小组件 / 控制中心 / 日期面板 / 主题 / 任务栏预览 */
const captureShellInteractions = page => page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const st = sel => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const cs = getComputedStyle(e);
        return { classes: e.className, display: cs.display, opacity: cs.opacity, transform: cs.transform };
    };
    const out = {};
    // 实参必须与 openDockWidget 的分支完全一致（是 'search-win' 不是 'search'）。
    // 传错名字会落到 else 分支，看起来「跑过了」其实什么都没测到。
    for (const [name, sel] of [['start-menu', '#start-menu'], ['search-win', '#search-win'],
                               ['widgets', '#widgets'], ['control', '#control'], ['datebox', '#datebox']]) {
        const errBefore = window.__errors.length;
        out[name] = { before: st(sel) };
        try { window.openDockWidget(name); } catch (e) { out[name].openThrew = String(e); }
        await wait(300);
        out[name].after = st(sel);
        try { window.openDockWidget(name); } catch (e) { out[name].closeThrew = String(e); }
        await wait(300);
        out[name].afterToggleBack = st(sel);
        out[name].errors = window.__errors.slice(errBefore);
        // 守卫：一旦实参不被 openDockWidget 认识，立刻显式记录，别让它悄悄溜过
        if (out[name].errors.some(e => e.includes('传递的 name 不正确'))) {
            out[name].HARNESS_BUG = `openDockWidget 不认识实参 '${name}'`;
        }
    }
    // 主题切换来回一次，必须回到原状
    const themeBefore = document.documentElement.className;
    try { window.toggletheme(); } catch (e) { out.themeThrew = String(e); }
    await wait(300);
    const themeMid = document.documentElement.className;
    try { window.toggletheme(); } catch {}
    await wait(300);
    out.theme = { before: themeBefore, mid: themeMid, after: document.documentElement.className };
    return out;
});

const captureComputedStyles = (page, selectors, props) => page.evaluate((sels, ps) => {
    const out = {};
    for (const sel of sels) {
        const el = document.querySelector(sel);
        if (!el) { out[sel] = null; continue; }
        const cs = getComputedStyle(el);
        const rec = {};
        for (const p of ps) rec[p] = cs.getPropertyValue(p);
        out[sel] = rec;
    }
    // 另外单独抓 :root 上的全部自定义属性（设计变量层的验收依据）
    const rootCS = getComputedStyle(document.documentElement);
    const vars = {};
    for (const name of ['--theme-1', '--theme-2', '--href', '--shadow', '--s3d', '--bgul', '--text', '--bg',
                        '--unfoc', '--foc', '--line', '--acrylic', '--icon', '--hover', '--active']) {
        const v = rootCS.getPropertyValue(name);
        if (v) vars[name] = v.trim();
    }
    out['__customProps'] = vars;
    return out;
}, selectors, props);

// cpuRunningTime 是 setInterval(…,1000) 的墙钟计数器，值取决于采集耗时，天生不可比
const VOLATILE_KEYS = new Set(['cpuRunningTime']);

/** 阶段 2 的真正验收依据：遍历 29 个窗口内的**每一个元素**，逐个记计算样式摘要。
 *  只看 ~30 个根选择器的话，像 defender.css 那 843 行、26 个硬编码色值，
 *  全部改成变量也照样报「无差异」。窗口在 DOM 里始终存在（靠 display:none 隐藏），
 *  颜色/圆角/阴影这些不依赖布局的属性照常可解析，所以无需先打开窗口。 */
const TOKEN_PROPS = ['color', 'background-color', 'background-image', 'border-radius',
    'box-shadow', 'border-top-color', 'border-top-width', 'border-top-style', 'opacity',
    'font-size', 'font-weight', 'padding-top', 'padding-left', 'margin-top', 'outline-color',
    'fill', 'stroke', 'backdrop-filter', 'transition-duration', 'transition-timing-function'];

const captureDeepStyles = (page, props) => page.evaluate((ps) => {
    const out = {};
    const digest = el => {
        const cs = getComputedStyle(el);
        return ps.map(p => cs.getPropertyValue(p)).join('|');
    };
    // 生成稳定的元素路径（父链上的 tag + 同名兄弟序号），与 DOM 顺序无关地可读
    const pathOf = (el, root) => {
        const parts = [];
        for (let n = el; n && n !== root; n = n.parentElement) {
            const same = [...n.parentElement.children].filter(c => c.tagName === n.tagName);
            parts.unshift(n.tagName.toLowerCase() + (same.length > 1 ? `[${same.indexOf(n)}]` : ''));
        }
        return parts.join('>');
    };
    for (const win of document.querySelectorAll('.window')) {
        const id = win.classList[1];
        const rec = {};
        rec['(self)'] = digest(win);
        for (const el of win.querySelectorAll('*')) rec[pathOf(el, win)] = digest(el);
        out[id] = rec;
    }
    // shell 区域同样深走一遍
    for (const sel of ['#dock-box', '#start-menu', '#search-win', '#widgets', '#control',
                       '#datebox', '#cm', '#notice', '#desktop']) {
        const root = document.querySelector(sel);
        if (!root) continue;
        const rec = { '(self)': digest(root) };
        for (const el of root.querySelectorAll('*')) rec[pathOf(el, root)] = digest(el);
        out[sel] = rec;
    }
    return out;
}, props);

const captureStorage = page => page.evaluate(volatile => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        out[k] = volatile.includes(k) ? '<volatile>' : localStorage.getItem(k);
    }
    return {
        keys: Object.keys(out).sort(),
        values: out,
        // 写入顺序里去掉墙钟计数器的重复写入，只保留首次出现
        writeOrder: window.__lsWrites.filter((k, i, a) => !volatile.includes(k) || a.indexOf(k) === i),
    };
}, [...VOLATILE_KEYS]);

/** 快照里可能混进 http://127.0.0.1:<port>（两棵树端口不同），统一抹平 */
function normalizeOrigins(obj) {
    const re = /https?:\/\/127\.0\.0\.1:\d+/g;
    const walk = v => {
        if (typeof v === 'string') return v.replace(re, 'ORIGIN');
        if (Array.isArray(v)) return v.map(walk);
        if (v && typeof v === 'object') {
            const o = {};
            for (const k of Object.keys(v)) o[k] = walk(v[k]);
            return o;
        }
        return v;
    };
    return walk(obj);
}

/** 终端命令：runcmd 是 599 行的分支链，主快照完全没覆盖到。
 *  逐条执行并记录终端输出摘要 + 是否抛异常。彩蛋会往页面里塞 DOM 与定时器，
 *  所以每条命令后都清理，避免相互污染。 */
const captureTerminalCommands = page => page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const CMDS = ['help', 'dir', 'ls', 'cls', 'systeminfo', 'hello', 'matrix', 'snow',
                  'dance', 'starwars', 'calc', 'calc.exe', 'del a.txt', 'cd C:', 'ping',
                  'notacommand'];
    const out = {};
    window.openapp('terminal');
    await wait(400);
    for (const cmd of CMDS) {
        const errBefore = window.__errors.length;
        const rec = {};
        try {
            $('#win-terminal>.text-cmd').html('');
            rec.ret = window.runcmd(cmd, true);
            await wait(120);
            const t = $('#win-terminal>.text-cmd').text();
            // 输出内容随时间/随机数变化，只记结构特征
            rec.outLen = t.length;
            rec.outHead = t.trim().slice(0, 60);
        } catch (e) { rec.threw = String(e); }
        rec.errors = window.__errors.slice(errBefore);
        out[cmd] = rec;
        // 清理彩蛋残留的容器
        $('.matrix-container, #snow-container, #starwars-container').remove();
        $('.window').removeClass('dancing');
    }
    window.hidewin('terminal');
    await wait(200);
    return out;
});

/** 针对阶段 1 那几个「主快照测不到」的修复，用独立的种子状态单独验证 */
async function captureTargetedFixes(browser, origin, locale) {
    const page = await preparePage(browser, { locale });
    // 种子：① 一个用户自建桌面图标（验证 addMenu）② autoUpdate=true（验证布尔比较）
    const userIcon = `<div class='b' ondblclick=openapp('calc') ontouchstart=openapp('calc') appname='calc'><img src='icon/calc.svg'><p>REGRESS</p></div>`;
    await page.evaluateOnNewDocument(`
        localStorage.setItem('desktop', JSON.stringify([${JSON.stringify(userIcon)}]));
        localStorage.setItem('autoUpdate', 'true');
    `);
    await bootDesktop(page, origin);
    const out = await page.evaluate(() => {
        const divs = [...document.querySelectorAll('#desktop>div')];
        const userDiv = divs[5];
        return {
            // addMenu：修好选择器后，第 6 个（下标 5）图标必须被打上 iconIndex
            desktopDirectDivCount: divs.length,
            userIconPresent: !!userDiv,
            userIconIndexAttr: userDiv ? userDiv.getAttribute('iconIndex') : null,
            // autoUpdate：存的是 'true'，变量就该是 true（原写法恒为 false）
            autoUpdateVar: window.__g('autoUpdate'),
            autoUpdateStored: localStorage.getItem('autoUpdate'),
            // 网格常量必须可重算
            hasRefreshDesktopGrid: typeof window.__g('refreshDesktopGrid') === 'function',
        };
    });
    // showcm 的「已有菜单打开时再开一个函数型菜单」路径：
    // 原实现在该路径用了未声明的 ret，'use strict' 下必抛 ReferenceError。
    out.reopenContextMenu = await page.evaluate(async () => {
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const ev = { clientX: 300, clientY: 200, preventDefault() {}, stopPropagation() {}, target: document.body };
        const errBefore = window.__errors.length;
        let threw = null;
        try {
            window.showcm(ev, 'desktop', null);          // 先开一个（字面量型）
            await wait(60);
            window.showcm(ev, 'smapp', ['calc', '计算器']); // 已打开状态下再开一个（函数型）
            await wait(400);                              // 等过 200ms 的重绘延时
        } catch (e) { threw = String(e); }
        const cm = document.querySelector('#cm');
        return {
            threw,
            errors: window.__errors.slice(errBefore),
            itemCount: cm ? cm.querySelectorAll('a[onmousedown]').length : 0,
        };
    });
    // explorer 与 edge 共享同一套标签页历史栈（原本各抄了一份，归一化后只差 4 行选择器）。
    // 脚本化跑一遍全部 13 个方法，记录状态机轨迹与按钮 disabled 状态。
    out.historyStack = await page.evaluate(() => {
        const APPS = window.__g('apps');
        const res = {};
        for (const [name, backSel, frontSel] of [
            ['explorer', '#win-explorer>.path>.back', '#win-explorer>.path>.front'],
            ['edge', '#win-edge>.tool>.back', '#win-edge>.tool>.front'],
        ]) {
            const a = APPS[name];
            if (!a || !a.initHistory) { res[name] = 'missing'; continue; }
            const trace = [];
            const snap = tag => trace.push(`${tag}: pt=${a.historypt[9]} h=[${a.history[9]}] ` +
                `back=${$(backSel).hasClass('disabled') ? 'off' : 'on'} ` +
                `front=${$(frontSel).hasClass('disabled') ? 'off' : 'on'}`);
            try {
                a.initHistory(9); snap('init');
                a.pushHistory(9, 'A'); snap('pushA');
                a.pushHistory(9, 'B'); snap('pushB');
                a.pushHistory(9, 'C'); snap('pushC');
                trace.push('top=' + a.topHistory(9));
                trace.push('isEmpty=' + a.historyIsEmpty(9) + ' isFull=' + a.historyIsFull(9));
                a.checkHistory(9); snap('check');
                trace.push('pop=' + a.popHistory(9)); snap('pop');
                a.checkHistory(9); snap('check2');
                trace.push('inc=' + a.incHistory(9)); snap('inc');
                a.popHistory(9); a.delHistory(9); snap('del');
                a.checkHistory(9); snap('check3');
            } catch (e) { trace.push('THREW: ' + String(e)); }
            res[name] = trace;
        }
        return res;
    });

    // 窗口标记搬进模板后的重建结果：位置、顺序、数量、占位元素是否清掉
    out.windowMount = await page.evaluate(() => {
        const wins = [...document.querySelectorAll('.window')];
        return {
            count: wins.length,
            placeholderGone: !document.getElementById('window-mount'),
            // 必须仍是 body 的直接子元素，且相对顺序不变
            allDirectChildrenOfBody: wins.every(w => w.parentElement === document.body),
            ids: wins.map(w => w.classList[1]),
            // window.js 的下标配对（拖拽绑定的前提）
            titbarAligned: wins.every((w, i) =>
                document.querySelectorAll('.window>.titbar')[i]?.parentElement === w),
            // Edge 收藏栏的 add_save 原本内联在窗口标记里，注入的 <script> 不会执行，
            // 必须已被搬到 scripts/edge-bookmarks.js
            addSaveIsFunction: typeof window.__g('add_save') === 'function',
            // 窗口标记里那段 <style> 注入后应当照常生效
            saveBarScrollbarHidden: (() => {
                const el = document.getElementById('save-bar');
                return el ? getComputedStyle(el).scrollbarWidth : null;
            })(),
        };
    });

    // explorer.file 右键菜单：需先初始化 explorer 才能渲染，主快照里一直是 HARNESS_EMPTY
    out.explorerFileMenu = await page.evaluate(async () => {
        const wait = ms => new Promise(r => setTimeout(r, ms));
        try {
            // 必须先把上一个探针（reopenContextMenu）留下的菜单彻底清掉，
            // 否则 showcm 会走「已有菜单打开」的延时分支，测到的是上一个菜单的残留内容。
            const cmEl = document.querySelector('#cm');
            cmEl.classList.remove('show', 'show-begin');
            cmEl.querySelector('list').innerHTML = '';
            await wait(400);
            window.openapp('explorer');
            await wait(800);
            const ev = { clientX: 400, clientY: 300, preventDefault() {}, stopPropagation() {}, target: document.body };
            const errBefore = window.__errors.length;
            window.showcm(ev, 'explorer.file', 'C:/Program Files/about.exe');
            await wait(400);
            const cm = document.querySelector('#cm');
            return {
                itemCount: cm ? cm.querySelectorAll('a[onmousedown],a[onclick]').length : 0,
                rendered: cm ? cm.innerHTML.replace(/\s+/g, ' ').slice(0, 160) : null,
                errors: window.__errors.slice(errBefore),
            };
        } catch (e) { return { threw: String(e) }; }
    });

    await page.close();
    return out;
}

/** 真实鼠标驱动的窗口交互：拖拽、缩放、贴边吸附、标签页。
 *
 *  这一段必须用真实鼠标事件而不是直接调 JS 函数 —— module/window.js 在解析期把
 *  .window 与 .window>.titbar 两个 NodeList **按下标配对**来绑定拖拽（见 C3）。
 *  阶段 7 把窗口标记改成运行时注入后，一旦配对错位，拖 A 窗口会动到 B 窗口，
 *  而任何直接调函数的测试都发现不了。
 */
async function captureWindowInteractions(page) {
    const out = {};
    const rect = sel => page.evaluate(s => {
        const e = document.querySelector(s);
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    }, sel);

    for (const app of ['calc', 'notepad', 'explorer']) {
        const rec = {};
        await page.evaluate(a => window.openapp(a), app);
        await settle(page, 400);
        const sel = `.window.${app}`;
        rec.opened = await rect(sel);

        // —— 拖拽：在标题栏按下、移动、松开。验证「拖谁动谁」——
        const bar = await page.evaluate(s => {
            const e = document.querySelector(s + '>.titbar');
            if (!e) return null;
            const r = e.getBoundingClientRect();
            return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
        }, sel);
        if (bar && rec.opened) {
            // 拖之前记下所有窗口的位置，拖完比对——只有目标窗口该动
            const before = await page.evaluate(() =>
                [...document.querySelectorAll('.window')].map(w => {
                    const r = w.getBoundingClientRect();
                    return w.classList[1] + ':' + Math.round(r.x) + ',' + Math.round(r.y);
                }));
            await page.mouse.move(bar.x, bar.y);
            await page.mouse.down();
            await page.mouse.move(bar.x + 120, bar.y + 60, { steps: 8 });
            await page.mouse.up();
            await settle(page, 400);
            const after = await page.evaluate(() =>
                [...document.querySelectorAll('.window')].map(w => {
                    const r = w.getBoundingClientRect();
                    return w.classList[1] + ':' + Math.round(r.x) + ',' + Math.round(r.y);
                }));
            const moved = before.map((b, i) => b === after[i] ? null : b.split(':')[0]).filter(Boolean);
            rec.dragMovedWindows = moved;              // 必须恰好是 [app]，多一个就说明配对错位
            rec.afterDrag = await rect(sel);
        }

        // —— 贴边吸附：拖到屏幕最上沿应出现 #window-fill 预览 ——
        if (bar) {
            await page.mouse.move(bar.x + 120, bar.y + 60);
            await page.mouse.down();
            await page.mouse.move(700, 0, { steps: 10 });
            rec.snapPreviewClasses = await page.evaluate(() => {
                const f = document.querySelector('#window-fill');
                return f ? [...f.classList].sort().join(' ') : null;
            });
            await page.mouse.up();
            await settle(page, 400);
            rec.afterSnap = await rect(sel);
        }

        await page.evaluate(a => window.hidewin(a), app);
        await settle(page, 300);
        out[app] = rec;
    }

    // —— 标签页：explorer 与 edge 走 m_tab ——
    out.tabs = await page.evaluate(async () => {
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const m = window.__g('m_tab'), APPS = window.__g('apps');
        const res = {};
        for (const app of ['explorer', 'edge']) {
            const t = [];
            try {
                window.openapp(app); await wait(400);
                const n0 = document.querySelectorAll(`.window.${app}>.titbar>.tabs>.tab`).length;
                // Use the app wrapper rather than m_tab.newtab directly: Explorer
                // adds its path slot/history here, and Edge also creates an iframe
                // plus history. Calling the generic renderer alone fabricates an
                // invalid tab shape and turns the harness itself into a page error.
                APPS[app].newtab(); await wait(300);
                const n1 = document.querySelectorAll(`.window.${app}>.titbar>.tabs>.tab`).length;
                APPS[app].newtab(); await wait(300);
                const n2 = document.querySelectorAll(`.window.${app}>.titbar>.tabs>.tab`).length;
                t.push(`tabs ${n0}→${n1}→${n2}`, 'now=' + APPS[app].now, 'len=' + APPS[app].len);
                m.close(app, APPS[app].tabs.length - 1); await wait(300);
                t.push('afterClose=' + document.querySelectorAll(`.window.${app}>.titbar>.tabs>.tab`).length);
                window.hidewin(app); await wait(200);
            } catch (e) { t.push('THREW: ' + String(e).slice(0, 70)); }
            res[app] = t;
        }
        return res;
    });
    return out;
}

/** 暗色模式下的逐元素计算样式。
 *  套件原本只跑亮色，所以「某个元素在暗色下颜色不对」这类问题完全测不到。
 *  用独立页面 + 预置 localStorage.theme='dark' 采集，避免污染主快照。 */
async function captureDarkStyles(browser, origin, locale, props) {
    const page = await preparePage(browser, { locale });
    await page.evaluateOnNewDocument(`try { localStorage.setItem('theme', 'dark'); } catch (e) {}`);
    await bootDesktop(page, origin);
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const styles = await captureDeepStyles(page, props);
    await page.close();
    return { isDark, styles };
}

/** 登录门禁必须用真实鼠标验证。DOM 上存在 onclick 并不代表按钮能被命中：
 *  透明的欢迎层、较高 z-index 的 About 背板，或 inert 背景都可能让脚本级测试
 *  通过而用户实际点不到。这里让 Tauri 密码状态保持 pending，点击按钮中心，
 *  然后再释放 IPC 并确认 About 只在登录层真正隐藏后出现。 */
async function captureLoginGate(browser, origin, locale) {
    // This probe exercises only the local login shell. Blocking every external
    // script keeps it comfortably inside LOGIN_BRIDGE_TIMEOUT_MS on slow CI.
    const page = await preparePage(browser, { locale, onlyOrigin: origin });
    await page.evaluateOnNewDocument(`
        window.__loginStatusPending = new Promise(resolve => {
            window.__resolveLoginStatus = resolve;
        });
        window.__TAURI__ = {
            core: {
                invoke(name) {
                    if (name === 'get_login_password_status') return window.__loginStatusPending;
                    const values = {
                        get_battery_info: { percent: 0.55, charging: false },
                        verify_login_password: { ok: true },
                        set_login_password: true,
                        check_app_update: null,
                        read_settings: '{}',
                        write_settings: true,
                        ping_host: true,
                    };
                    return Promise.resolve(values[name]);
                },
            },
            event: { listen: async () => () => {} },
        };`);
    await bootDesktop(page, origin);
    await settle(page, 40);

    const before = await page.evaluate(() => {
        const login = document.getElementById('login');
        const rect = login.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(x, y);
        document.getElementById('login-error').textContent = '__not_clicked__';
        return {
            center: { x, y },
            hitId: hit?.id || hit?.closest?.('[id]')?.id || null,
            loginDisplay: getComputedStyle(document.getElementById('loginback')).display,
            loginPointerEvents: getComputedStyle(login).pointerEvents,
            loginInert: document.getElementById('loginback').inert,
            aboutShown: document.getElementById('notice-back').classList.contains('show'),
            aboutAriaHidden: document.getElementById('notice-back').getAttribute('aria-hidden'),
            status: window.__g('loginPasswordStatus'),
        };
    });

    await page.mouse.click(before.center.x, before.center.y);
    delete before.center; // coordinates are input to hit testing, not stable snapshot data
    await settle(page, 30);
    const afterPendingClick = await page.evaluate(() => ({
        error: document.getElementById('login-error').textContent,
        status: window.__g('loginPasswordStatus'),
        loginDisplay: getComputedStyle(document.getElementById('loginback')).display,
        aboutShown: document.getElementById('notice-back').classList.contains('show'),
    }));

    await page.evaluate(() => window.__resolveLoginStatus({ has_password: false }));
    await page.waitForFunction(() => {
        const status = window.__g('loginPasswordStatus');
        // Older comparison trees predate the explicit state machine; their
        // equivalent completion signal is removal of the password-mode class.
        return status === 'no-password'
            || (typeof status === 'undefined'
                && !document.getElementById('loginback').classList.contains('tauri-password'));
    },
        { timeout: 2000, polling: 20 });

    // Preserve real browser timers for layout/hit testing, but compress only the
    // two long login-exit delays so this probe adds milliseconds rather than 4s.
    const ready = await page.evaluate(() => {
        const nativeSetTimeout = window.setTimeout.bind(window);
        window.setTimeout = (callback, delay, ...args) =>
            nativeSetTimeout(callback, delay >= 500 ? Math.max(1, Math.round(delay / 20)) : delay, ...args);
        const login = document.getElementById('login');
        const rect = login.getBoundingClientRect();
        return {
            center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
            status: window.__g('loginPasswordStatus'),
            aboutShown: document.getElementById('notice-back').classList.contains('show'),
        };
    });
    await page.mouse.click(ready.center.x, ready.center.y);
    delete ready.center;
    const immediatelyAfterSuccess = await page.evaluate(() => ({
        loginDisplay: getComputedStyle(document.getElementById('loginback')).display,
        aboutShown: document.getElementById('notice-back').classList.contains('show'),
    }));
    await settle(page, 260);
    const afterLoginExit = await page.evaluate(() => ({
        loginDisplay: getComputedStyle(document.getElementById('loginback')).display,
        aboutShown: document.getElementById('notice-back').classList.contains('show'),
        aboutAriaHidden: document.getElementById('notice-back').getAttribute('aria-hidden'),
        startupNoticeShown: window.__g('startupNoticeShown'),
        errors: window.__errors.slice(),
    }));
    await page.close();
    return { before, afterPendingClick, ready, immediatelyAfterSuccess, afterLoginExit };
}

/** Tauri 桌面版契约。Rust 侧在 win12-online/win12-desktop，本地跑不起来，
 *  但可以把 window.__TAURI__ IPC 桩掉，再由真实 tauri_api.js 建立 win12Native，
 *  让本仓库这半边的所有分支真实执行一遍：
 *  isTauriApp() 走 true 分支、关于页标题切换、panic-color 从 settings.json 同步、
 *  以及 tauri_api.js 解析期调用 updateAboutAppEntrypoints() 后的 DOM 状态。 */
async function captureTauriContract(browser, origin, locale) {
    const page = await preparePage(browser, { locale });
    await page.evaluateOnNewDocument(`
        window.__TAURI__ = {
            core: {
                invoke(name) {
                    const values = {
                        get_battery_info: { percent: 0.55, charging: true },
                        get_login_password_status: { has_password: false },
                        verify_login_password: { ok: true },
                        set_login_password: true,
                        check_app_update: null,
                        read_settings: JSON.stringify({ 'panic-color': '#123456' }),
                        write_settings: true,
                        ping_host: true,
                    };
                    return Promise.resolve(values[name]);
                },
            },
            event: { listen: async () => () => {} },
        };`);
    await bootDesktop(page, origin);
    await settle(page, 600);
    const out = await page.evaluate(() => ({
        isTauriApp: typeof window.__g('isTauriApp') === 'function' ? window.__g('isTauriApp')() : null,
        aboutTitle: typeof window.__g('getAboutAppTitle') === 'function' ? window.__g('getAboutAppTitle')() : null,
        aboutTitleEls: [...document.querySelectorAll('.about-app-title')].map(e => e.textContent.trim()),
        tauriClassesPresent: {
            aboutTauri: !!document.querySelector('.about-tauri'),
            updateTauri: !!document.querySelector('.update-tauri'),
        },
        domContracts: ['battery', 'setting-password-status', 'ReleaseShowDesktop',
                       'contri-desktop', 'StarShowDesktop'].map(id => id + '=' + !!document.getElementById(id)),
        batteryLabel: document.getElementById('battery')?.getAttribute('aria-label'),
        panicColorSynced: localStorage.getItem('panic-color'),
        loginStatus: window.__g('loginPasswordStatus'),
        errors: window.__errors.slice(),
    }));
    await page.close();
    return out;
}

// ---------------------------------------------------------------- 编排

export async function capture(browser, { origin, locale, label }) {
    const page = await preparePage(browser, { locale });
    const snap = { meta: { origin, locale, label } };

    await bootDesktop(page, origin);

    // Pass 1 —— 静止态计算样式（不冻结过渡，否则量不到 transition）
    snap.computedStyles = await captureComputedStyles(page, STYLE_SELECTORS, STYLE_PROPS);
    snap.deepStyles = await captureDeepStyles(page, TOKEN_PROPS);
    snap.bootErrors = await page.evaluate(() => window.__errors.slice());

    // Pass 2 —— 交互（冻结过渡让几何稳定）
    await freezeTransitions(page);
    snap.boot = await captureBootStructure(page);
    snap.shell = await captureShellInteractions(page);
    snap.contextMenus = await captureContextMenus(page);
    snap.notices = await captureNotices(page);
    snap.apps = await captureApps(page);
    snap.terminalCommands = await captureTerminalCommands(page);
    // 真实鼠标驱动的拖拽/吸附/标签页。
    // 必须在**冻结过渡**的状态下测：窗口开场动画会让几何在测量时仍在变化，
    // 实测同一棵树两次跑出来能差 1~10px。拖拽逻辑本身是 JS 驱动的，不依赖 CSS 过渡。
    snap.windowInteractions = await captureWindowInteractions(page);
    await thawTransitions(page);

    snap.storage = await captureStorage(page);
    snap.allErrors = await page.evaluate(() => window.__errors.slice());
    await page.close();

    // 独立种子状态的定向验证（主快照覆盖不到的路径）
    snap.targetedFixes = await captureTargetedFixes(browser, origin, locale);
    // 暗色模式的逐元素计算样式
    snap.darkStyles = await captureDarkStyles(browser, origin, locale, TOKEN_PROPS);
    // Tauri 桌面版契约（桩掉 win12Native，跑本仓库这半边的所有分支）
    snap.tauriContract = await captureTauriContract(browser, origin, locale);
    // Tauri 登录层必须由真实 hit testing 与鼠标事件验证，不能只调用函数。
    snap.loginGate = await captureLoginGate(browser, origin, locale);

    return normalizeOrigins(snap);
}

export { STYLE_SELECTORS, STYLE_PROPS, captureLoginGate };
