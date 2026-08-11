#!/usr/bin/env node
// jquery.i18n.properties 的分隔符与续行解析回归测试。
//   node tools/regress/i18n-properties.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = readFileSync(resolve(HERE, '../../scripts/jquery.i18n.properties.js'), 'utf8');
const ENGLISH = readFileSync(resolve(HERE, '../../lang/lang/lang_en.properties'), 'utf8');

function loadProperties(data) {
    function jQuery() {}
    jQuery.extend = (target, source) => Object.assign(target, source);
    jQuery.isArray = Array.isArray;
    jQuery.ajax = options => {
        const body = options.url.endsWith('_en.properties') ? data : '';
        options.success(body, 'success');
    };

    const context = vm.createContext({
        jQuery,
        $: jQuery,
        navigator: { language: 'en' },
        console: { log() {} },
        window: { console: { log() {} } },
    });
    vm.runInContext(PLUGIN, context, { filename: 'jquery.i18n.properties.js' });
    jQuery.i18n.properties({
        name: 'lang',
        language: 'en',
        path: '/lang/',
        mode: 'map',
        async: false,
    });
    return jQuery.i18n;
}

const synthetic = [
    '# 注释=不会成为属性',
    '! comment:ignored',
    'embedded=alpha\\=beta:gamma',
    'colon.key:colon\\=value',
    'continued=first\\',
    '    second\\=part\\',
    '\tthird',
    'even=two\\\\',
    'next=separate',
].join('\n');
const parsed = loadProperties(synthetic);

assert.equal(parsed.map.embedded, 'alpha\\=beta:gamma', '值中的转义等号不应被当作分隔符');
assert.equal(parsed.prop('embedded'), 'alpha=beta:gamma', '读取时应正常解开转义等号');
assert.equal(parsed.map['colon.key'], 'colon\\=value', '首个未转义冒号也应作为分隔符');
assert.equal(parsed.map.continued, 'firstsecond\\=partthird', '奇数尾反斜杠应连接后续物理行');
assert.equal(parsed.prop('continued'), 'firstsecond=partthird');
assert.equal(parsed.map.even, 'two\\\\', '偶数尾反斜杠不应触发续行');
assert.equal(parsed.map.next, 'separate', '偶数尾反斜杠后的属性应保持独立');
assert.equal(Object.hasOwn(parsed.map, '# 注释'), false);

// 直接加载仓库真实英文包，确保 HTML 属性里的 \= 不再吞掉下一条翻译。
const english = loadProperties(ENGLISH);
const expectedKeys = ENGLISH.split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && line.charAt(0) !== '#' && line.charAt(0) !== '!')
    .map(line => line.substring(0, line.indexOf('=')).trim())
    .sort();
assert.deepEqual(Object.keys(english.map).sort(), expectedKeys,
    'lang_en.properties 的每条物理属性都应生成独立 map 键');

for (const key of [
    'nts.fs-mount-error',
    'nts.file-read-error',
    'setting.psnl.round',
    'about.intro.intro.p3',
    'about.intro.others',
]) {
    assert.equal(Object.hasOwn(english.map, key), true, `${key} 不应被上一条含 \\= 的值吞并`);
}
assert.match(english.map['setting.psnl.theme-dt'], /class\\="a jump"/);
assert.doesNotMatch(english.map['setting.psnl.theme-dt'], /setting\.psnl\.round=/);
assert.match(english.prop('nts.fs-mount-error'), /<p class="tit">Mount Failed<\/p>/);

console.log(`✓ 分隔符/续行样例与真实 lang_en.properties 的 ${expectedKeys.length} 个键均通过`);
