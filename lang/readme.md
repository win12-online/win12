# 翻译贡献指南
开始翻译前，**务必[联系我们](https://teams.live.com/l/invite/FEA0yrNkE_bAn-ddwI)，并征得同意**，以了解是否还有其他人正在翻译，避免重复劳动和合并冲突。<br>
Before you start translating, **you must [contact](https://teams.live.com/l/invite/FEA0yrNkE_bAn-ddwI) us and get approval** to check if others are already working on the same translation, avoid duplicate work and merge conflicts.

## 条件 / Requirements
1. 有中文基础<br>Basic proficiency in Chinese
2. 有一定的目标语言的基础 / 愿意将自己的 Windows 11 系统调成目标语言<br>Basic proficiency in the target language / willing to set your Windows 11 system to the target language
3. 有代码基础<br>Basic coding knowledge

### 致繁體中文譯者
鑑於「兩岸四地」在中文語言使用上存在顯著差異，語言變體繁多，需注意在翻譯時請以繁體中文（中國臺灣）（zh‑TW）為基準標準，另請特別留意兩岸間在詞彙、表達方式及用語習慣上的差異。

## 方法 / Method
项目使用 i18n 库实现多语言，可上网查阅，或自行研究已有翻译的部分

The project uses an i18n library for multi-language support. You can refer to online resources or study existing translated sections.
### 已有成果 / Existing Resources
0. 务必理解 `desktop.js` 开头语言处理部分，熟悉原理<br>Make sure you understand the language handling logic at the beginning of desktop.js and are familiar with the mechanism.
1. 此目录下 `trans.py`的使用说明见[此](README_trans.md)<br>See [this](README_trans.md) for the usage instructions of trans.py in this directory.
2. `desktop.js` 中有 `lang(txt,id)`，详见注释<br>desktop.js includes the lang(txt, id) function — see the comments for details.

### 注意 / Notes
部分代码形如 Some code like:
```html
<a class="btn">
    <i class="bi"></i> 文本
</a>
```
可能不便于设置属性，可对纯文本部分添加 `<span>` 标签，例可改为 may not be suitable for direct attribute assignment:

```html
<a class="btn">
    <i class="bi"></i>
    <span data-i18n="sth">文本</span>
</a>
```

顺便把 `lang_zh_cn` 文件一同完善，感激不尽。<br>Please also help improve the lang_zh_cn file — we would greatly appreciate it.

### 加分项 / Bonus Points
1. 与 Windows 11 一致的部分，应符合(尽量)最新版的原生语言内容<br>For parts that match Windows 11, try to use the latest official native wording.
2. 不一致的，应避免机器翻译<br>For non‑matching parts, avoid machine translation.

## 酬劳 / Rewards
有且仅有 Only these:
1. Github 贡献点<br>GitHub contribution points
2. 来自开发者的由衷感谢 >u-)o<br>Sincere gratitude from the developer >u-)o