'use strict';

// Browser Manager deliberately contains no tab, history, or UI state.
// It only decides where a URL should be rendered and performs the handoff.
window.browser = {
    mode: 'hybrid',

    configure(mode) {
        this.mode = ['hybrid', 'embedded', 'external'].includes(mode) ? mode : 'hybrid';
    },

    classify(url) {
        if (url === 'mainpage.html' || /^data\//.test(url) || /^\.\/?data\//.test(url)) {
            return 'internal';
        }
        try {
            const parsed = new URL(url, window.location.href);
            return parsed.origin === window.location.origin ? 'internal' :
                ['http:', 'https:'].includes(parsed.protocol) ? 'external' : 'invalid';
        } catch (_) {
            return 'invalid';
        }
    },

    openInternal(url, handlers = {}) {
        if (typeof handlers.open === 'function') return handlers.open(url);
        window.location.href = url;
    },

    async openExternal(url, { label, title = 'Microsoft Edge', parent = 'main', bounds, onDestroyed, onTitle, onUrl } = {}) {
        const parsed = new URL(url, window.location.href);
        if (!['http:', 'https:'].includes(parsed.protocol) || /[\u0000-\u001f\u007f]/.test(parsed.href)) {
            throw new Error('不允许打开此类型的链接');
        }

        const Webview = window.__TAURI__?.webview?.Webview;
        if (window.win12Native?.isTauri?.() && Webview) {
            if (!label) throw new Error('外部浏览器窗口缺少标签标识');
            const host = document.querySelector('#win-edge>iframe.show');
            const rect = bounds || host?.getBoundingClientRect() || { left: 0, top: 0, width: 1100, height: 760 };
            const left = bounds ? bounds.x : rect.left;
            const top = bounds ? bounds.y : rect.top;
            const width = bounds ? bounds.width : rect.width;
            const height = bounds ? bounds.height : rect.height;
            const parentWindow = window.__TAURI__.window?.getCurrentWindow?.();
            if (!parentWindow) throw new Error('无法获取 Win12 主窗口');
            const existing = await Webview.getByLabel(label);
            if (existing) {
                await existing.close().catch(() => {});
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            return new Promise((resolve, reject) => {
                const webview = new Webview(parentWindow, label, {
                    url: parsed.href,
                    x: Math.max(0, Math.round(left)),
                    y: Math.max(0, Math.round(top)),
                    width: Math.max(720, Math.round(width)),
                    height: Math.max(520, Math.round(height))
                });
                webview.once('tauri://destroyed', () => {
                    if (typeof onDestroyed === 'function') onDestroyed(label);
                });
                webview.listen('tauri://page-load', (event) => {
                    const payload = event.payload || {};
                    if (payload.url && typeof onUrl === 'function') onUrl(payload.url);
                    if (typeof onTitle === 'function') {
                        webview.title().then(onTitle).catch(() => {});
                    }
                }).catch(() => {});
                webview.once('tauri://created', () => resolve(webview));
                webview.setPosition({ x: Math.max(0, Math.round(left)), y: Math.max(0, Math.round(top)) }).catch(() => {});
                webview.setSize({ width: Math.max(720, Math.round(width)), height: Math.max(520, Math.round(height)) }).catch(() => {});
                webview.once('tauri://error', event => reject(new Error(String(event.payload || '无法创建 WebView 窗口'))));
            });
        }

        return this.fallback(parsed.href);
    },

    fallback(url, originalError) {
        if (window.__TAURI__?.opener?.openUrl) {
            return window.__TAURI__.opener.openUrl(url);
        }
        if (!window.win12Native?.isTauri?.()) {
            return window.open(url, '_blank');
        }
        throw originalError || new Error('无法启动系统浏览器');
    }
};
