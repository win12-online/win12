// 注入到页面最前面，冻结所有非确定性来源。
// 基线与重构版注入完全相同的代码，所以任何 diff 都是真实差异，而不是时钟/随机数抖动。
export const FROZEN_EPOCH = 1735689600000; // 2025-01-01T00:00:00Z

export function determinismScript(epoch = FROZEN_EPOCH) {
    return `(() => {
        const EPOCH = ${epoch};
        // ---- 冻结 Date ----
        const RealDate = Date;
        function FakeDate(...args) {
            if (!(this instanceof FakeDate)) return new RealDate(EPOCH).toString();
            return args.length === 0 ? new RealDate(EPOCH) : new RealDate(...args);
        }
        FakeDate.prototype = RealDate.prototype;
        FakeDate.now = () => EPOCH;
        FakeDate.parse = RealDate.parse;
        FakeDate.UTC = RealDate.UTC;
        window.Date = FakeDate;

        // ---- 冻结 Math.random（xorshift32，种子固定）----
        let seed = 0x2f6e2b1;
        Math.random = () => {
            seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
            return ((seed >>> 0) % 1000000) / 1000000;
        };

        // ---- 冻结 performance.now ----
        const perfNow = performance.now.bind(performance);
        let perfCounter = 0;
        performance.now = () => (perfCounter += 16);

        // ---- 收集控制台错误与未捕获异常 ----
        window.__errors = [];
        const realError = console.error.bind(console);
        console.error = (...a) => { window.__errors.push('console.error: ' + a.map(String).join(' ')); realError(...a); };
        window.addEventListener('error', e => window.__errors.push('uncaught: ' + (e.message || String(e.error))));
        window.addEventListener('unhandledrejection', e => window.__errors.push('unhandledrejection: ' + String(e.reason)));

        // ---- 读取全局的统一入口 ----
        // 注意：classic script 里顶层的 const/let 只进全局词法环境，**不会**成为 window 的属性
        // （cms / nts / dps / icon / page / nomax … 都是 const）。间接 eval 在全局作用域求值，两种都能拿到。
        window.__g = n => { try { return (0, eval)(n); } catch (e) { return undefined; } };
        window.__hasGlobal = n => {
            if (n in window) return true;
            try { (0, eval)(n); return true; } catch (e) { return false; }
        };

        // ---- 记录 localStorage 写入顺序（用于验证 setData 契约）----
        window.__lsWrites = [];
        const realSet = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) { window.__lsWrites.push(k); return realSet.call(this, k, v); };
    })();`;
}

// 非确定性的外部 API —— 一律拦截，返回稳定的空响应。
// CDN 脚本（Ace/Chart.js/marked/dompurify/big.js）不拦截：应用初始化需要它们，且版本固定、内容不变。
export const BLOCKED_HOSTS = [
    'api.github.com',
    'tjy-gitnub.github.io',
    'win12server.freehk.svipss.top',
    'yunzhiapi.cn',
    'api.msn.cn',
    'assets.msn.cn',
    'tools.mgtv100.com',
    'v.api.aa1.cn',
    'api.xcboke.cn',
    'android11react.osrc.com',
    'github1s.com',
    'bilibili.com',
    'unpkg.com',            // Pyodide：数 MB 且只有 python 应用用得到，拦掉以保证跑得快且稳定
];

export function shouldBlock(url) {
    try {
        const h = new URL(url).hostname;
        return BLOCKED_HOSTS.some(b => h === b || h.endsWith('.' + b));
    } catch { return false; }
}
