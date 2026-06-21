# 本地化工程指南

## 目的

Win12 是一个多语言的桌面式网页应用。所有可见界面文案在设计和开发时，都必须默认支持英文和中文环境。

这份指南的背景是：Settings 页面曾经在英文环境下仍然显示大量中文。根本原因不是用户电脑系统语言，而是很多界面内容直接写死在 `desktop.html` 或 JavaScript 中，没有对应的翻译 key，所以运行时翻译器无法替换这些文本。

从现在开始，所有贡献者都必须把翻译支持视为功能开发的一部分，而不是功能完成后的补丁工作。

## 强制规则

不要在 HTML 或 JavaScript 中直接新增面向用户的可见文本，除非它有明确的翻译路径。

可以接受的方式：

- 静态 HTML 文本：添加 `data-i18n="translation.key"`，并在所有支持的语言文件中添加同名 key。
- 属性文本：添加 `data-i18n-attr="placeholder"` 或对应属性，并添加 `data-i18n-key="translation.key"`。
- JavaScript 动态生成文本：使用 `lang("English fallback", "translation.key")`。
- 包含动态变量的文本：翻译完整句子模板，再替换变量。

不可接受的方式：

- 在可见控件中直接写中文或英文，却没有 `data-i18n` key。
- 只更新 `lang_en.properties`，却不更新 `lang_en-US.properties`。
- `lang()` 的英文 fallback 实际上是中文。
- 在翻译数据可用之前创建菜单、通知或应用内容，并让 fallback 文本永久停留在界面上。
- 把永久功能界面的翻译依赖交给后续清理逻辑。

## 为什么重要

如果不正确使用翻译文件，会造成直接影响：

- 英文用户会在 Settings、菜单、弹窗、应用标题和通知里看到中文。
- `en` 和 `en-US` 会逐渐不一致，导致不同浏览器或系统区域设置下显示不同结果。
- 运行时切换语言会不可靠，因为硬编码文本绕过了翻译器。
- Tauri 桌面版和 Web 版可能出现文案差异。
- 开发者会反复修补漏翻文本，而不是专注于功能质量。
- 自动检查无法发现没有 key 的硬编码文本。

## 支持的语言文件

当前语言目录位于嵌套的 locales 仓库：

- `lang/lang/lang_zh_CN.properties`
- `lang/lang/lang_zh_TW.properties`
- `lang/lang/lang_en.properties`
- `lang/lang/lang_en-US.properties`

英文环境中，`lang_en.properties` 和 `lang_en-US.properties` 必须保持 key 对齐，除非确实需要地区化差异。

## Key 命名规范

使用稳定、有作用域的 key。

```properties
setting.system=System
setting.network=Network & internet
setting.update=Windows Update
taskmgr.processes.reset-filter=Reset Filter
camera.notice.agree=Agree and continue
```

推荐结构：

- `app.section.item`
- `setting.page.control`
- `notice.reason.action`
- `taskmgr.tab.metric`

避免单字母 key、临时文本 key，以及同一个 key 表示不同语义。

## 静态 HTML 写法

可见文本使用 `data-i18n`：

```html
<span data-i18n="setting.network">Network & internet</span>
```

placeholder、tooltip、title 等属性文本使用 `data-i18n-attr`：

```html
<input
  placeholder="Find a setting"
  data-i18n-attr="placeholder"
  data-i18n-key="setting.sch"
>
```

## JavaScript 写法

JavaScript 生成的 UI 文本必须使用 `lang()`：

```js
const label = lang('Check for updates', 'setting.update.check');
```

有动态变量时，先翻译模板，再替换变量：

```js
const template = lang('Line %line, Column %column', 'code-editor.status');
status.textContent = template
  .replace('%line', line)
  .replace('%column', column);
```

不要随意拼接多个翻译片段，因为不同语言的语序可能不同。

## 启动阶段和异步加载

部分 UI 会在脚本执行早期创建。如果翻译文件异步加载完成得太晚，这些 UI 可能会永久保留 fallback 文本。

规则：

- 启动菜单和通知必须使用已经可用的翻译数据。
- 如果功能在异步 fetch 完成前创建 UI，必须使用同步预加载路径，或在翻译应用后重新渲染。
- 动态插入的节点仍然应该使用 `lang()` 或带 key 的 HTML。

## Settings 应用要求

Settings 页面最容易出现漏翻，因为它包含大量静态行、描述和子页面。

每一个 Settings 行都必须满足：

- 标题可翻译。
- 描述可翻译。
- 页面标题可翻译。
- 禁用或占位行也必须可翻译。
- Home 页面中的跳转卡片必须和目标页面保持同等翻译质量。

不要把 Settings 页面正文写成硬编码中文或硬编码英文。

## Tauri 和 Web 一致性

Tauri 相关 JavaScript 不应该直接引入面向用户的本地化文本，除非这些文本走同一套翻译路径。

如果 Tauri 返回的错误或状态要显示给用户：

- 尽量返回代码或结构化状态。
- 在前端根据状态翻译成对应语言。
- 保持浏览器版和桌面版行为一致。

## 验证清单

提交 PR 或 commit 前：

```powershell
node --check desktop.js
node --check module/apps.js
```

还需要确认：

- 所有 `data-i18n` 和 `data-i18n-key` 在英文语言文件中存在。
- `lang_en.properties` 和 `lang_en-US.properties` 的 key 保持一致。
- 使用 Laravel Herd 测试 `https://win12.test/desktop.html`。
- 切换到英文后检查 Settings、Start、Search、通知和应用窗口。
- 切换到中文后确认中文仍然正常显示。

## Review 标准

如果一个 PR 新增了面向用户的 UI，却没有更新翻译文件，应视为未完成。

Review 时需要问：

- 这个字符串在哪里翻译？
- 它在 `en`、`en-US`、`zh_CN`、`zh_TW` 下是否可用？
- 它是静态 HTML、属性文本，还是 JavaScript 动态生成文本？
- 动态渲染后是否仍然能翻译？

## 当前兼容层

应用中存在一个英文清理层，用来保护用户不再看到历史遗留硬编码中文。

这个兼容层不是新功能开发的默认方案。新功能必须直接使用翻译 key。
