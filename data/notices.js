/* 由 desktop.js 抽出的纯数据表。
 * 通知/对话框注册表 nts。
 * 注意：值里用了 ${lang(...)} 与 ${isTauriApp()}，在对象字面量求值时就会执行，
 * 因此本文件必须在 desktop.js **之后**加载（lang / isTauriApp 在那里定义）。
 */
const nts = {
    'macos-web': {
        cnt: `<p class="tit">MacOS-Web</p>
            <p>MacOS-Web 是由 puruvj 开发的开源项目，遵循 MIT 许可证。</p>
            <p>此本项目与 win12-online、Apple Inc. 无任何关联，亦非云电脑服务。</p>`,
        btn: [
            { type: 'main', text: lang('打开', 'open'), js: "closenotice();openapp('macos', true);" },
            { type: 'detail', text: lang('取消', 'cancel'), js: 'closenotice();' }
        ]
    },
    'about': {
        cnt: lang(`<p class="tit">${isTauriApp() ? '关于 Win12-desktop' : 'Win12 网页版'}</p>
            <p>${isTauriApp() ? 'Win12-desktop 是 Win12 网页版的桌面应用版本，' : 'Win12 网页版是一个开放源项目，'}<br />
            希望让用户在网络上预先体验 Windows 12,<br />
            内容可能与 Windows 12 正式版本不一致。<br />
            使用标准网络技术，例如 HTML, CSS 和 JS<br />
            此项目绝不附属于微软，且不应与微软操作系统或产品混淆，<br />
            这也不是 Windows365 cloud PC<br />
            本项目中微软、Windows 和其他示范产品是微软公司的商标<br />
            本项目中 Android 是谷歌公司的商标。</p>`, 'nts.about'),
        btn: [
            { type: 'main', text: lang(lang('关闭', 'close'), 'close'), js: 'closenotice();' },
            { type: 'detail', text: lang('更多', 'more'), js: 'closenotice();openapp(\'about\');if($(\'.window.about\').hasClass(\'min\'))minwin(\'about\');$(\'.dock.about\').removeClass(\'show\')' },
        ]
    },
    'feedback': {
        cnt: `<p class="tit">${lang('反馈', 'nts.feedback.name')}</p>
            <p>${lang('我们非常注重用户的体验与反馈', 'nts.feedback.txt')}</p>
            <p><a class="a" onclick="window.open('https://nerimity.com/i/w2lvf','_blank');" win12_title="在浏览器新窗口打开链接" onmouseenter="showdescp(event)" onmouseleave="hidedescp(event)">${lang('欢迎通过 Nerimity 向我们寻求帮助或提交反馈', 'nts.feedback.txt1')}</a></p>
            <list class="new">
                <a class="a" onclick="window.open('https://github.com/win12-online/win12/issues','_blank');" win12_title="在浏览器新窗口打开链接" onmouseenter="showdescp(event)" onmouseleave="hidedescp(event)">${lang('在 github 上提交 issue (需要 github 账户)', 'nts.feedback.github')}</a>
            </list>`,
        btn: [
            { type: 'main', text: lang(lang('关闭', 'close'), 'close'), js: 'closenotice();' },
        ]
    },
    'widgets': {
        cnt: `
            <p class="tit">${lang('添加小组件', 'nts.addwg')}</p>
            <list class="new">
                <a class="a" onclick="closenotice(); widgets.widgets.add('calc');">${lang('计算器', 'calc.name')}</a>
                <a class="a" onclick="closenotice(); widgets.widgets.add('weather');">${lang('天气', 'nts.addwg.weather')}</a>
                <a class="a" onclick="closenotice(); widgets.widgets.add('monitor');">${lang('系统性能监视器', 'nts.addwg.monitor')}</a>
                <a class="a" onclick="closenotice(); widgets.widgets.add('nowplaying');">${lang('正在播放', 'nts.addwg.nowplaying')}</a>
            </list>`,
        btn: [
            { type: 'cancel', text: lang('取消', 'cancel'), js: 'closenotice();' }
        ]
    },
    'ZeroDivision': {//计算器报错窗口
        // 甚至还报错我真的哭死，直接输入框显示 error 啥的不就完了。。
        cnt: lang(`<p class="tit">错误</p>
            <p>除数不得等于 0</p>`, 'calc.error.zero'),
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' },
        ]
    },
    'Can-not-open-file': {
        cnt: '<p class="tit">' + run_cmd + `</p>
        <p>Windows 找不到文件 '` + run_cmd + '\'。请确定文件名是否正确后，再试一次。</p> ',
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' },
            { type: 'detail', text: '在 Micrsoft Edge 中搜索', js: 'closenotice();openapp(\'edge\');window.setTimeout(() => {apps.edge.newtab();apps.edge.goto(' + run_cmd + ');}, 300);' }
        ]
    },
    'widgets.monitor': {
        cnt: `
        <p class="tit">切换监视器类型</p>
        <list class="new">
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'cpu';">CPU 利用率</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'memory';">内存使用率</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'disk';">磁盘活动时间</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'wifi-receive';">网络吞吐量 - 接收</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'wifi-send';">网络吞吐量 - 发送</a>
            <a class="a" onclick="closenotice(); widgets.monitor.type = 'gpu';">GPU 利用率</a>
        </list>`,
        btn: [
            { type: 'cancel', text: lang('取消', 'cancel'), js: 'closenotice();' }
        ]
    },
    'widgets.desktop': {
        cnt: `
            <p class="tit">添加桌面小组件</p>
            <list class="new">
                <a class="a" onclick="closenotice(); widgets.widgets.addToDesktop('calc');">计算器</a>
                <a class="a" onclick="closenotice(); widgets.widgets.addToDesktop('weather');">天气</a>
                <a class="a" onclick="closenotice(); widgets.widgets.addToDesktop('monitor');">系统性能监视器</a>
                <a class="a" onclick="closenotice(); widgets.widgets.addToDesktop('nowplaying');">${lang('正在播放', 'nts.addwg.nowplaying')}</a>
            </list>`,
        btn: [
            { type: 'cancel', text: lang('取消', 'cancel'), js: 'closenotice();' }
        ]
    },
    'widgets.news.source': {
        cnt: `
            <p class="tit">切换新闻源</p>
            <list class="new">
                新闻源未加载，请检查网络连接
            </list>`,
        btn: [{ type: 'cancel', text: lang('取消', 'cancel'), js: 'closenotice();' }],
    },
    'duplication file name': {
        cnt: `
            <p class="tit">错误</p>
            <p>文件名重复</p>`,
        btn: [
            { type: 'cancel', text: lang('取消', 'cancel'), js: 'closenotice();' }
        ]
    },
    'about-copilot': {
        cnt: `
            <p class="tit">关于 Windows 12 Copilot</p>
             <p>你可以使用此 AI 助手帮助你更快地完成工作，此 AI 助手基于 Deepseek v4 pro 模型 (有人用 Win12 工作？)<br>
            也请适当使用，不要谈论敏感、违规话题，<br>请有身为一个人类最基本的道德底线。<br>根据相关法律法规，我们不向欧盟用户提供服务。<br>
            在此特别感谢云智 API(yunzhiapi.cn) 为本项目提供赞助！</p>
            <a class="a" onclick="window.open('https://win12-online.github.io/win12/readme/legal/privacy-policy-copliot','_blank');" win12_title="在浏览器新窗口打开链接">《隐私政策》</a><br>
            <a class="a" onclick="window.open('https://win12-online.github.io/win12/readme/legal/user-agreement-copliot','_blank');" win12_title="在浏览器新窗口打开链接">《用户协议》</a><br>
            <a class="a" onclick="window.open('https://status.win12.tech/status/win12/','_blank');" win12_title="在浏览器新窗口打开链接">状态监测</a><br>
            <a class="a" onclick="window.open('https://www.yunzhiapi.cn/','_blank');" win12_title="在浏览器新窗口打开链接">云智 API 官网</a>
        `,
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' },
        ]
    },
    'shutdown': {
        cnt: `
        <p class="tit">即将注销你的登录</p>
        <p>Windows 将在 114514 分钟后关闭。</p>`,
        btn: [
            { type: 'main', text: lang('关闭', 'close'), js: 'closenotice();' }
        ]
    },
    'setting.update': {
        cnt: `
            <p class="tit">更新已就绪</p>
            <p>请重启电脑以应用更新</p>
        `,
        btn: [
            { type: 'main', text: '立即重启', js: 'location.href = `./reload.html`;' },
            { type: 'detail', text: '稍后重启', js: 'closenotice();' }
        ]
    },
    'recognition': {
        cnt: `
        <p class="tit">语音输入法使用须知</p>
        <p>本语音输入法由@nb-group开发<br>
        使用的语音识别api 仅可在使用 Chromium 内核的浏览器上使用，<br>
        包括Microsoft Edge，Google Chrome等，<br>
        api（理论上）完全离线.<br>
        我们绝不会窃取您的输入信息，请放心使用。<br><br>
        每次语音识别都会重新申请一下麦克风，这是浏览器的问题，<br>
        可以在浏览器设置里选择始终允许。<br><br>
        哦对了，关掉提示窗口之后再点一次语音球才能开始识别。
        </p>
         `,
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' },
        ]
    },
    'setting.down': {
        cnt: `
        <p class="tit">下载完毕</p>
        <p>请立即重新启动以应用更改</p>
        `,
        btn: [
            { type: 'main', text: '重新启动', js: 'closenotice(); setTimeout(() => {window.location=`reload.html`;},200);' }
        ]
    },
    'whiteboard-saveas': {
        cnt: `
        <p class="tit">${lang('另存为', 'whiteboard.saveas.title')}</p>
        <p>${lang('请输入文件名:', 'whiteboard.saveas.prompt')}</p>
        <input type="text" id="whiteboard-filename" placeholder="Whiteboard_${new Date().toISOString().slice(0, 10)}" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;">
        `,
        btn: [
            { type: 'main', text: lang('保存', 'whiteboard.saveas.save'), js: 'apps.whiteboard.doSaveAs();' },
            { type: 'detail', text: lang('取消', 'whiteboard.saveas.cancel'), js: 'closenotice();' }
        ]
    },
    'no-files-permission': {
        cnt: lang(`<p class="tit">文件资源管理器</p>
            <p>你没有权限打开该文件，请向文件的所有者或管理员申请权限<br /></p>`),
        btn: [
            { type: 'main', text: lang(lang('关闭', 'close'), 'close'), js: 'closenotice();' }
        ]
    },
    'rename-pc': {
        cnt: `
        <p class="tit">重命名你的电脑</p>
        <p>你可以使用字母、连字符和数字的组合</p>
        <input type="text" id="rename-name" placeholder="Desktop-${Math.floor(Math.random() * 1000000)}">
        `,
        btn: [
            { type: 'main', text: lang('保存', 'pc.saveas.save'), js: '' },
            { type: 'detail', text: lang('取消', 'pc.saveas.cancel'), js: 'closenotice();' }
        ]
    },
    'no-files-permission': {
        cnt: lang(`<p class="tit">文件资源管理器</p>
            <p>你没有权限打开该文件，请向文件的所有者或管理员申请权限<br /></p>`),
        btn: [
            { type: 'main', text: lang(lang('关闭', 'close'), 'close'), js: 'closenotice();' }
        ]
    },
    'rename-pc': {
        cnt: `
        <p class="tit">重命名你的电脑</p>
        <p>你可以使用字母、连字符和数字的组合</p>
        <input type="text" id="rename-name" placeholder="Desktop-${Math.floor(Math.random() * 1000000)}" style="width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px;">
        `,
        btn: [
            { type: 'main', text: lang('保存', 'pc.saveas.save'), js: 'closenotice();' },
            { type: 'detail', text: lang('取消', 'pc.saveas.cancel'), js: 'closenotice();' }
        ]
    },
    'word-open-files-fail': {
        cnt: lang(`<p class="tit">打开失败</p>
            <p>Word在试图打开文件时遇到错误<br /></p>`),
        btn: [
            { type: 'main', text: lang(lang('关闭', 'close'), 'close'), js: 'closenotice();' }
        ]
    },
    'fs-api-unsupported': {
        cnt: lang(`<p class="tit">不支持的功能</p>
            <p>您的浏览器不支持文件系统访问 API。请使用 Chrome 或 Edge 浏览器。</p>`, 'nts.fs-api-unsupported'),
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' }
        ]
    },
    'fs-mount-error': {
        cnt: lang(`<p class="tit">挂载失败</p>
            <p>无法挂载本地文件夹，权限可能被拒绝。</p>`, 'nts.fs-mount-error'),
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' }
        ]
    },
    'unsupported-file-type': {
        cnt: lang(`<p class="tit">无法打开文件</p>
            <p>没有找到可以打开此类型文件的应用程序。</p>`, 'nts.unsupported-file-type'),
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' }
        ]
    },
    'file-read-error': {
        cnt: lang(`<p class="tit">读取失败</p>
            <p>无法读取文件内容，权限可能已过期。</p>`, 'nts.file-read-error'),
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' }
        ]
    },
    'file-write-error': {
        cnt: lang(`<p class="tit">保存失败</p>
            <p>无法写入文件，权限可能已过期。</p>`, 'nts.file-write-error'),
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' }
        ]
    },
    'unsaved-notepad': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('保存','save'), js: 'closenotice();apps.notepad.saveMounted().then(()=>{apps.notepad._forceClose();})' },
            { type: '', text: lang('不保存','discard'), js: 'closenotice();apps.notepad._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'unsaved-code-editor': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('保存','save'), js: 'closenotice();apps.codeEditor.save().then(()=>{apps.codeEditor._forceClose();})' },
            { type: '', text: lang('不保存','discard'), js: 'closenotice();apps.codeEditor._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'unsaved-notepad': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('保存','save'), js: 'closenotice();apps.notepad.saveMounted().then(()=>{apps.notepad._forceClose();})' },
            { type: '', text: lang('不保存','discard'), js: 'closenotice();apps.notepad._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'unsaved-code-editor': {
        cnt: lang(`<p class="tit">是否保存更改？</p>
            <p>文件有未保存的修改，关闭前是否保存？</p>`, 'nts.unsaved-changes'),
        btn: [
            { type: 'main', text: lang('保存','save'), js: 'closenotice();apps.codeEditor.save().then(()=>{apps.codeEditor._forceClose();})' },
            { type: '', text: lang('不保存','discard'), js: 'closenotice();apps.codeEditor._forceClose();' },
            { type: '', text: lang('取消','cancel'), js: 'closenotice();' }
        ]
    },
    'error_aichat': {
        cnt: lang(`<p class="tit">AI Chat 无法使用</p>
            <p>暂时无法使用此功能，请转用语音输入球</p>`),
        btn: [
            { type: 'main', text: lang('确定', 'ok'), js: 'closenotice();' }
        ]
    },
};
