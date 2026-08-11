#!/usr/bin/env node
// lang() 的缺键回退单元测试：动态文案不应把 [key] 占位串暴露给用户。
//   node tools/regress/i18n-fallback.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const I18N_BOOT = readFileSync(resolve(HERE, '../../scripts/i18n-boot.js'), 'utf8');

function createLang({ locale = 'en', translations = {} } = {}) {
    const selection = {
        addClass() { return this; },
        attr() { return this; },
        data() { return undefined; },
        each() { return this; },
        html() { return this; },
        text() { return this; },
    };
    const $ = () => selection;
    $.i18n = {
        properties() {},
        prop(key) {
            return Object.hasOwn(translations, key) ? translations[key] : `[${key}]`;
        },
    };

    const context = vm.createContext({
        $,
        console: { log() {} },
        document: {
            documentElement: { lang: '' },
            querySelectorAll: () => ({ length: 0 }),
        },
        langc: {},
        localStorage: {
            getItem: key => key === 'lang' ? locale : null,
            setItem() {},
        },
        navigator: { language: locale },
        window: {},
    });
    vm.runInContext(`${I18N_BOOT}\nglobalThis.__langForTest = lang;`, context);
    context.__langForTest.documentLanguage = context.document.documentElement.lang;
    return context.__langForTest;
}

const translated = createLang({ translations: { known: 'Translated', empty: '' } });
assert.equal(translated.documentLanguage, 'en', '根节点语言应与当前语言同步');
assert.equal(translated('默认文案', 'known'), 'Translated', '已有翻译应优先使用');
assert.equal(translated('默认文案', 'missing'), '默认文案', '缺失翻译应保留默认文案');
assert.equal(translated('默认文案'), '默认文案', '缺失 key 应保留默认文案');
assert.equal(translated('默认文案', 'empty'), '', '有效的空字符串翻译不应被回退覆盖');

const simplifiedChinese = createLang({ locale: 'zh-CN', translations: { known: 'Translated' } });
assert.equal(simplifiedChinese.documentLanguage, 'zh-CN');
assert.equal(simplifiedChinese('默认文案', 'known'), '默认文案', '简体中文继续使用内联默认文案');

console.log('✓ lang() 已覆盖已有翻译、缺失翻译、空字符串与 zh-CN 路径');
