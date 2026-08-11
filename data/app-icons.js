/* 由 desktop.js 抽出的纯数据表。
 * 窗口策略与图标映射：run_cmd / nomax / nomin。无外部依赖，在 desktop.js 之前加载。
 */
var run_cmd = '';
const nomax = { 'calc': 0, 'notepad-fonts': 0, 'camera-notice': 0, 'winver': 0, 'run': 0, 'wsa': 0 };
const nomin = { 'notepad-fonts': 0, 'camera-notice': 0, 'run': 0 };

// png 格式的图标在此备注，否则以 标识+.svg 的名称自动检索
const icon = {
    bilibili: 'bilibili.png',
    vscode: 'vscode.png',
    // python: 'python.png',
    winver: 'about.svg',
    // run: 'run.png',
    // whiteboard: 'whiteboard.png',
    taskmgr: 'taskmgr.png',
    imgviewer: 'files/picture.png',
    'code-editor': 'vscode.png',
    mediaplayer: 'files/vidio.png',
    pdfviewer: 'files/pdf.svg'
};
