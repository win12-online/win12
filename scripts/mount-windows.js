/* 把 data/window-templates.js 里的窗口标记注入回 desktop.html 原来的位置。
 *
 * 必须早于 module/window.js —— 后者在解析期就把 .window 与 .window>.titbar
 * 两个 NodeList 按下标配对来绑定拖拽，窗口必须在那之前已经在 DOM 里。
 *
 * 用 beforebegin 插到占位元素之前再把占位元素删掉，这样窗口仍是 <body> 的直接子元素，
 * 位置与顺序和原来完全一致（虽然目前没有 CSS 依赖 body>.window，但没必要冒这个险）。
 */
'use strict';
(function mountWindows() {
    const host = document.getElementById('window-mount');
    if (!host) {
        console.error('mount-windows: 找不到 #window-mount 占位元素');
        return;
    }
    host.insertAdjacentHTML('beforebegin', windowMarkup);
    host.remove();
})();
