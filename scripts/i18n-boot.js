/* i18n 与桌面版探测的引导层。
 * 从 desktop.js 抽出，必须早于 data/context-menus.js 与 data/notices.js —— 
 * 那两张表的值里有 ${lang(...)} / ${isTauriApp()}，在对象字面量求值时就会执行。
 * 也必须早于 tauri/tauri_api.js：后者在解析期直接调用 updateAboutAppEntrypoints()。
 * 依赖：langc（data/languages.js）、jQuery + jquery.i18n.properties（head 内同步加载）。
 */
'use strict';

/** 取翻译；键不存在时返回 null，而不是 jquery.i18n.properties 那个占位串 "[key]"。
 *
 * 修的问题：原实现无条件用 $.i18n.prop(key) 覆盖元素内容，而该函数对缺失键
 * 返回 "[key]"，于是把 HTML 里本来写好的兜底文本冲掉，界面上直接显示 [edge.name]。
 * 实测（en）有 31 个键属于这种情况——它们归 win12-locales 那个仓库维护，
 * 本仓库补不了；但至少不该把兜底文本毁掉。
 */
function i18nOrNull(key) {
    if (!key) return null;
    const v = $.i18n.prop(key);
    if (v === undefined || v === null) return null;
    if (v === '[' + key + ']') return null;   // 缺失键的占位串
    return v;
}

function loadlang(code) {
    $.i18n.properties({
        name: 'lang',
        path: 'lang/lang/', // 目录
        language: code,
        mode: 'map',
        callback: function () {
            $('[data-i18n]').each(function () {
                // 标签的内容
                const v = i18nOrNull($(this).data('i18n'));
                if (v !== null) $(this).html(v);
            });
            $('[data-i18n-attr]').each(function () {
                // 标签的属性
                const v = i18nOrNull($(this).data('i18n-key'));
                if (v !== null) $(this).attr($(this).data('i18n-attr'), v);
            });
            updateAboutAppEntrypoints();
        }
    });
}

let nl = 'zh-TW';

let langcode, lang = (txt, id) => {
    const translated = i18nOrNull(id);
    return translated === null ? txt : translated;
};

if (localStorage.getItem('lang') != null) {
    if (localStorage.getItem('lang') == 'hans' || localStorage.getItem('lang') == 'zh_cn' || localStorage.getItem('lang') == 'zh-cn') {
        localStorage.setItem('lang', 'zh-CN');
    }
} else {
    if (navigator.language in langc)
        localStorage.setItem('lang', langc[navigator.language]);
    else
        localStorage.setItem('lang', 'en');
}
langcode = localStorage.getItem('lang');
document.documentElement.lang = langcode;


if (document.querySelectorAll('#loginback>.langselect>.' + langcode).length != 0) {
    $('#loginback>.langselect>.' + langcode).addClass('selected')
} else {
    $('#loginback>.langselect>.en').addClass('selected')
}


if (langcode != 'zh-CN')
    loadlang(langcode);

if (langcode == 'zh-CN') {
    lang = (txt, id) => {
        // if(txt!=$.i18n.prop(id))console.log(id,txt);
        return txt;
    };
}
console.log('?')


// 函数 lang(txt,id)
/// langcode==zh_cn 下返回 txt,
/// 否则优先返回语言 properties 文件中键 id 对应的值，缺失时保留 txt 兜底。
/// 用例：lang('设置','setting.name')
// 
// 为开发方便，故不将简体中文纳入语言考虑

function isTauriApp() {
    return !!((window.win12Native && window.win12Native.isTauri && window.win12Native.isTauri()) || (window.__TAURI__ && window.__TAURI__.core));
}

function getAboutAppTitle() {
    if (!isTauriApp()) return lang('关于 Win12 网页版', 'about.name');
    if (langcode == 'en') return 'About Win12-desktop';
    if (langcode == 'zh-TW') return '關於 Win12-desktop';
    return '关于 Win12-desktop';
}

function updateAboutAppEntrypoints() {
    $('.about-app-title').text(getAboutAppTitle());
}

updateAboutAppEntrypoints();

