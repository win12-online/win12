# 重构工程笔记

本文件记录**实测得出**的结论。凡是标了「实测」的，都跑过真实浏览器验证，不是从规范推断的。
重构过程中若与这些结论冲突，以本文件为准并重新实测。

---

## 1. 加载顺序：ES module 与 classic `defer` 的相对次序【实测】

`desktop.html` 的脚本区（`:3278-3300`）是手工排的 `defer` 链，且 `tauri/tauri_api.js:82-83`
在**解析期**就调用 `updateAboutAppEntrypoints()` —— 这只在 `desktop.js` 排在它前面时才成立。
转 ES 模块后这个保证还成不成立，实测结果：

| 场景 | 结果 |
|---|---|
| `<script type="module">` 在前（模块图 5 层深）、classic `defer` 在后 | **模块图全部求值完毕**后才轮到 classic defer ✅ |
| 同上，但 module 里有**顶层 await** | **classic defer 抢先执行**，全局尚未装上 ❌ |
| classic `defer` 排在 module 标签之前 | classic 抢先执行 ❌ |

**由此得出的三条硬规则：**
1. `<script type="module" src="src/main.js">` 必须排在 `tauri/*.js` **之前**
2. **模块图里绝对不能出现顶层 `await`** —— 它会静默破坏顺序保证，且只在桌面版(Tauri)才看得出后果
3. 仍然要把 `tauri_api.js:82-83` 的解析期调用移进 `boot.js`，让正确性不依赖于第 1 条

复现用例保存在 `tools/regress/` 的开发记录中（`ordertest`），可随时重跑。

---

## 2. 哪些全局真的在 `window` 上【实测 + 静态分析】

**classic script 里顶层的 `const`/`let` 只进全局词法环境，不会成为 `window` 的属性**，
只有 `function` 和 `var` 会。这一点直接影响 `globals.js` 的写法，也影响任何测试代码。

在 71 个「必须保持全局」的名字里：

- **47 个已经在 `window` 上**（`function` / `var`）：
  `openapp` `showcm` `shownotice` `showwin` `hidewin` `maxwin` `minwin` `focwin` `stop`
  `toggletheme` `saveDesktop` `setIcon` `runcmd` `resizewin` `taskbarclick` `sys_setting`
  `topmost` `run_cmd` `wifiStatus` `voiceBall` `news` … 等

- **25 个只在词法环境、不在 `window` 上**（`const` / `let`）：
  `apps` `page` `nts` `cms` `dps` `icon` `setData` `widgets` `m_tab` `taskmgrTasks` `langc`
  `date` `server` `pages` `nomax` `copilot` `isDark` `autoUpdate` `font_window` `edit_mode`
  `deltaLeft` `start` `wait` `padding` `cell` `cols` `rows`

内联 handler 两种都能访问（bare 标识符在没有词法绑定时会落到 `window` 属性上），
所以 barrel 统一用 `window.X = X` 是安全的。
但**测试代码不能写 `window.cms`**，必须走间接 eval（见 `tools/regress/determinism.mjs` 的 `__g()`）。

---

## 3. `globals.js` 需要 accessor 的只有 4 个【静态分析，已人工核对】

模块的 `window.X = X` 是**值拷贝**。如果这个绑定之后会被重新赋值，就会 split-brain：
模块内改了，`window.X` 还是旧值；内联 handler 改了 `window.X`，模块内的绑定还是旧值。

扫描「在属主文件之外被赋值」的全局，初筛出 6 个，人工核对后 **3 个是误报**：

| 名字 | 判定 |
|---|---|
| `icon` | ❌ 误报 —— `apps.js:1482` 是**默认参数** `icon = ''` |
| `date` | ❌ 误报 —— `apps.js:1814` 是**局部 `const` 声明** |
| `deltaLeft`(desktop.js) | ❌ 误报 —— `desktop.js:2587` 是**局部 `let`**，遮蔽了同名全局 |
| **`run_cmd`** | ✅ 真外部写 —— `module/apps.js:163` |
| **`autoUpdate`** | ✅ 真外部写 —— `desktop.html:1656` 内联 handler |
| **`font_window`** | ✅ 真外部写 —— `desktop.html:2139`、`:2217` 内联 handler |
| **`deltaLeft`**(真) | ✅ 真外部写 —— `module/tab.js:22,25`、`module/widget.js:210` |

**结论：`globals.js` 里只有 `run_cmd`、`autoUpdate`、`font_window`、`deltaLeft` 需要
`Object.defineProperty` 的 get/set 转发；其余 67 个直接值赋值即可。**

---

## 4. 回归套件【已自测】

`tools/regress/` —— 用 DOM / `page.evaluate` 断言，**不用截图**（本机截图不可靠）。

```bash
node tools/regress/run.mjs --save baseline-v1   # 采集当前树为命名基线
node tools/regress/run.mjs --against baseline-v1 # 与命名基线对比
node tools/regress/run.mjs                       # 与 ../win12-baseline 工作树对比
```

单次采集约 55s/locale，跑 zh-CN 与 en 两个 locale。

**已完成的两项自测：**
1. **确定性**：两棵内容等价的工作树、两个 locale → **0 处差异**。
   （靠 `determinism.mjs` 冻结 `Date`/`Math.random`/`performance.now`，并拦截 12 个非确定性外部 API 主机）
2. **灵敏度**：故意注入两个回归 → 全部捕获，共 20 处差异：
   - 改 `--href` 设计变量 → `computedStyles.__customProps.--href` 命中
   - 把 `toggletheme` 改名 → 三路独立命中：
     - `shell.themeThrew: TypeError`
     - `shell.theme.mid`（dark 类没加上）
     - **`contextMenus.desktop.handlerErrors[0]: 未定义的全局 toggletheme()`**

第三条尤其关键：右键菜单的 HTML **渲染得一模一样**，只有 handler 里引用的名字没了。
只比对渲染结果的话会漏掉——这正是 C1（内联 handler 只认全局）的典型失败模式。

---

## 4b. 两处「报告有 bug，实测没有」的更正【实测】

探索阶段列出的 bug 清单里有两条经不起实测，记录在此以免日后又被「修」一遍：

**① `pinapp` 的引号错位 —— 不是 bug。**
`desktop.js:2117` 的模板确实写成了 `onclick='${command}';hide_startmenu();'`，读起来像是属性提前闭合。
但实测渲染结果是：

```
onclick="openapp('calc');hide_startmenu();"
oncontextmenu="return showcm(event,'smapp',['calc','计算器'])"
```

只有 3 个属性，全部正确。原因是 `command` 实参本身就已经带了 `hide_startmenu();`
（见 `desktop.js:508` 的 cms `smapp` 项），而多出来的那段被 HTML 解析器吸收掉了。
所以「固定到开始菜单的应用点开后菜单不关闭」这个说法**不成立**。
本次只把多余标记删掉（渲染结果逐字节不变），不算行为修复。

**② `openDockWidget` 的实参是 `'search-win'` 不是 `'search'`。**
这条是**回归套件自己的 bug**，由套件在阶段 1 的 diff 中暴露出来：
传 `'search'` 会落进 `else` 分支，看起来「跑过了」，其实搜索面板一次都没被测到。
基线上表现为抛 `TypeError: console.err is not a function`（因为 `console.err` 不存在），
修好 `console.err` 之后才显形为一条明确的错误日志。
已修正实参，并加了守卫：一旦实参不被 `openDockWidget` 认识就记 `HARNESS_BUG`。

> 教训：**套件报「无差异」不等于「测到了」**。任何走 `else`/兜底分支的调用都要显式报错。

## 4c. 套件的覆盖边界（务必知道哪里没测到）

「套件报无差异」只有在确实测到的范围内才有意义。当前实际覆盖：

| 项 | 覆盖 |
|---|---|
| 窗口 | 29/29，逐个 开→最大化→还原→最小化→还原→关闭 |
| 右键菜单 | **15/16**。`explorer.file` 需要先初始化 explorer 应用才能渲染，目前测不到，已用 `HARNESS_EMPTY` 显式标记 |
| 通知对话框 | 26/26 |
| 计算样式 | **3319 条逐元素记录**，覆盖 29 个窗口 + 9 个 shell 区域的**每一个后代元素** |
| locale | zh-CN + en |

**为什么必须逐元素走一遍**：最初只比对约 30 个根选择器，那样的话
`apps/style/defender.css`（843 行、26 个硬编码色值）整体改写也照样报「无差异」——
它的内部元素一个都不在列表里。阶段 2 的验收标准依赖这一层覆盖。

**两条守卫**（防止「跑过了但什么都没测到」再次发生）：
- `HARNESS_BUG`：`openDockWidget` 收到不认识的实参时标记
- `HARNESS_EMPTY`：右键菜单渲染为空时标记

有 4 个 `cms` 项是 `arg => …` 函数，传 `null` 会直接抛异常、渲染为空——
恰恰是内容最动态的 4 个。实参必须与真实调用点一致，见 `capture.mjs` 的 `CMS_ARGS`。

## 4d. 遗留提醒

- **`module/tab.js` 的隐式全局 `app` 已改为 `let`**。这条在当前套件里测不到（无断言），
  但阶段 6 给所有模块加上 `'use strict'` 之后它会变成承重的——届时不要以为「没测到＝可以回退」。
- **死资源扫描必须过滤未跟踪文件**。仓库里有 41 个 `"* 2.*"` 未跟踪副本（约 390 KB，
  创建于 2026-05-08，早于本次 clone），其中 `apps/icons/setting/icons 2.ttf` 会混进扫描结果，
  与阶段 8 计划删除的 `icons.ttf` 撞名。再次运行扫描时加 `git ls-files --error-unmatch` 过滤。

## 4e. 阶段 2 的前提被推翻了：不能拿现有变量替换硬编码色值【实测】

原计划写的是「315 处颜色字面量 → 归并到 tokens.css，复用已有的 33 个变量」。
实测 `:root` 与 `:root.dark` 后发现这条**不成立**：

**25 个现有变量里有 22 个是主题相关的**（`:root.dark` 会覆盖）：

| 变量 | light | dark |
|---|---|---|
| `--text` | `#000` | `#eee` |
| `--bg` | `#ffffff` | `#000000` |
| `--bggrey` | `#eee` | `#444` |
| `--hr` | `#ccc` | `#333` |

所以把代码里的 `#000` 换成 `var(--text)`，暗色模式下会从黑变成 `#eee` ——
**这是行为变更，不是重构**，直接踩红线。

主题无关、可以安全引用的既有变量只有三个：`--theme-1`、`--theme-2`、`--href`。

**阶段 2 因此收窄为「只做可证明等价的部分」**，全部通过 0 差异验证：
- 新建 `styles/tokens.css`，只放明暗同值的量（10 级圆角尺度 + 时长/缓动）
- 155 处 `border-radius` 单值 → 圆角令牌
- 7 处 `#2983cc` → `var(--href)`（该变量明暗同值，已核实）
- 删 2 条语法错误的死声明（`desktop.css` 的 `--webkit-backdrop-filter`，
  双横线＝自定义属性，从不生效；同一规则里 `backdrop-filter` 已正确声明。
  注意：把它「修」成 `-webkit-backdrop-filter` 反而会**新增**模糊效果，属于视觉变更）
- 删 1 个永不匹配的选择器（`.window.webapp.content`，`.content` 是子元素不是类；
  同规则的 `.window.webapp.load` 是活的，保留）

### 「约 80 处色值不参与主题切换」—— 这个数字是误导性的【实测修正】

早先粗扫明/暗色字面量得出「约 80 处」，后来做了实证分析：
采集**明暗两套**逐元素计算样式（3319 个元素 × 38 个根），
逐属性比对，找出「颜色属性在两种主题下完全相同、且取值为明/暗极端色」的元素。

结论：那 80 处里绝大多数**不是 bug**：

| 类别 | 例子 | 判定 |
|---|---|---|
| 令牌定义本身 | `desktop.css` 的 `:root` / `:root.dark` | 正常 |
| 局部调色板覆盖 | `terminal.css` 的 `.window.terminal-apps { --text:#ddd; --bg:#000 }` | **有意为之**，终端两种主题下都该是黑的 |
| 渐变/图片上的白字 | `copilot`、`login`、`imgviewer`、开始菜单固定项 | 两种主题下白色都正确 |
| 自带配色的应用 | `defender`（深蓝）、`code-editor`（Ace 暗色主题） | 有意为之 |
| 独立页面 | `bios.css`（desktop.html 根本不加载它） | 无关 |
| 浏览器默认样式 | `setting` 里三个 `<input type="color">` 的黑边 | 非项目 CSS |
| 产品图标磁贴 | msstore `.card6>.left` 的白底（LibreOffice 图标） | 有意为之 |

**真正的主题 bug 只有一个**：计算器输入框的闪烁光标动画写死了 `border-color: #111`
（`apps/style/calc.css` 与 `module/widget.css` 各 4 处）。实测：

|  | 修复前 | 修复后 |
|---|---|---|
| 亮色 | 边框 `rgb(17,17,17)` / 底色 `rgb(234,234,234)` | 逐字节不变 |
| 暗色 | 边框 `rgb(17,17,17)` / 底色 `rgb(32,32,32)` —— 几乎不可见 | 边框 `rgb(238,238,238)` |

修法：新增主题相关令牌 `--caret`（亮色 `#111` 保持原值，暗色 `#eee`），
这样亮色模式逐字节不变，只修暗色。

> 注意：回归套件对这条改动报「0 差异」，**不代表验证通过**——
> `#calc-input:focus` 只在聚焦时生效，套件从不触发聚焦，所以根本没覆盖到。
> 上表的数据是单独写探针、在两种主题下聚焦该输入框实测得到的。
> 这也再次说明：「无差异」必须先确认「测到了」。

## 4f. 累计修掉的真 bug（全部由回归套件实测确认）

重构过程中发现并修复的、在纯净 `main` 上真实存在的缺陷：

| bug | 原因 | 实测证据 |
|---|---|---|
| 桌面自建快捷方式没有右键菜单 | `addMenu` 的选择器写成 `'#div'`（id 选择器），恒匹配 0 个 | `userIconIndexAttr`: `null` → `"0"` |
| 关 code-editor / camera-notice 抛 TypeError | `hidewin` 用 `apps[name]`，`openapp` 用 camelCase | `closeThrew`: TypeError → `undefined` |
| 「自动更新」开关第一次取消勾选无效 | `autoUpdate == 'true'` 拿布尔比字符串，恒 false | `autoUpdateVar`: `false` → `true` |
| 窗口 resize 后桌面图标吸附网格失效 | `cols`/`rows` 是 const，只算一次 | `hasRefreshDesktopGrid`: `false` → `true` |
| **已有菜单打开时再右键函数型菜单项必崩** | `showcm` 复制的那份函数体里 `ret = item(arg)` 未声明，`'use strict'` 下抛 ReferenceError | `reopenContextMenu.errors`: `ReferenceError: ret is not defined` → 无；`itemCount` 6 → 3 |
| `console.err` 不是函数 | 应为 `console.error` | 由套件的 `openDockWidget` 守卫暴露 |
| `module/tab.js` 隐式全局 `app` | 仅因该文件无 `'use strict'` 才能跑 | 无断言（见 4d） |

最后一条的 `itemCount` 6 → 3 很能说明故障形态：异常中断了渲染，
`innerHTML` 从未被写入，屏幕上留着**上一个**菜单的 6 个条目。

## 4g. 决定：**不做 ES 模块化**（原计划的阶段 6）【实测推翻】

原计划要把所有脚本转成 `<script type="module">` + 一个 `globals.js` barrel。
阶段 0 的门禁测试确认了加载顺序可控（见 §1），但收尾阶段的实测推翻了这个方案：

**ES 模块在 `file://` 下被 CORS 拦截，而这个应用现在能从 file:// 正常运行。**

普通 Chrome（不加任何命令行参数）打开本地 HTML 文件：

| 脚本类型 | 结果 |
|---|---|
| classic `<script defer>` | 正常执行 |
| `<script type="module">` | `net::ERR_FAILED`，被 CORS 拦截 |

实测当前 `desktop.html` 直接双击打开：29 个窗口就位、`openapp` 可用、开机动画正常退出，
只有 Service Worker 注册失败（file:// 本就不支持，无影响）。
转成 ESM 会让整个应用在 file:// 下彻底打不开 —— 这是实打实的功能回退，踩红线。

（注：`tauri/battery_power.js` 早已是 `type="module"`，所以在 file:// 下它本来就静默失效，
只影响电量显示；那是既有的小瑕疵，和「整个应用打不开」不是一个量级。）

**替代方案：用 classic script 按关注点拆分。**
文件级的分离效果与 ESM 方案基本一致，而且：
- 不破坏 file://
- 不需要 barrel 间接层
- 不引入「模块图里永远不能出现顶层 await」这条隐形约束
- 那 47 个已写进贡献者文档的全局函数本来就必须留在全局

代价是内部标识符仍在全局作用域（71 个必须全局，另有 72 个本可私有化）。
这是明确的取舍，不是遗漏。

## 5. 已知的基线噪音

采集时有 4 条控制台错误，**基线与重构版完全相同**，属预期：
- `获取 star 数量时出错: TypeError: Failed to fetch` —— `api.github.com` 被拦截
- `ReferenceError: loadPyodide is not defined` —— `unpkg.com` 的 Pyodide 被拦截（数 MB，且只有 python 应用用得到）

阶段 1 之前，以下 3 条关闭路径在基线上**确定会抛 TypeError**（`openapp` 用 camelCase 而
`hidewin` 用原名，`apps['code-editor']` / `apps['camera-notice']` 是 `undefined`）：
`hidewin('code-editor')` @ `apps.js:2186`、`hidewin('camera-notice')` @ `desktop.html:2511,2532`。
阶段 1 修好后要求这三条干净，届时重采 `baseline-v2`。

---

## 6. 工作目录

- 基线工作树：`../win12-baseline`（`git worktree`，checkout 在 `main`）
- `~/Documents` 是本地目录，**不走 iCloud**，无同步抖动风险
- 仓库里有 41 个零字节的 `"* 2.*"` 文件，创建时间 2026-05-08，**早于本次 clone 三个月**，
  未被 git 跟踪，与本次重构无关
