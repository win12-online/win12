#!/usr/bin/env node
// Edge 地址栏输入分类回归测试。
//   node tools/regress/edge-address.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(resolve(HERE, '../../scripts/edge-address.js'), 'utf8');
const context = vm.createContext({ URL, encodeURIComponent });
vm.runInContext(SOURCE, context, { filename: 'scripts/edge-address.js' });
const parse = vm.runInContext('resolveEdgeAddressInput', context);

const NAVIGATE_CASES = [
    ['', 'empty', ''],
    ['   ', 'empty', ''],
    ['mainpage.html', 'navigate', 'mainpage.html'],
    ['localhost', 'navigate', 'http://localhost'],
    ['localhost:3000/a?b=1', 'navigate', 'http://localhost:3000/a?b=1'],
    ['127.0.0.1', 'navigate', 'http://127.0.0.1'],
    ['192.168.1.42:8080/a', 'navigate', 'http://192.168.1.42:8080/a'],
    ['[::1]', 'navigate', 'http://[::1]'],
    ['[2001:db8::1]:8443/x', 'navigate', 'http://[2001:db8::1]:8443/x'],
    ['example.com', 'navigate', 'http://example.com'],
    ['sub.example.travel/path', 'navigate', 'http://sub.example.travel/path'],
    ['例子.测试', 'navigate', 'http://例子.测试'],
    ['http://example.com/a', 'navigate', 'http://example.com/a'],
    ['HTTPS://EXAMPLE.COM/a', 'navigate', 'HTTPS://EXAMPLE.COM/a'],
    ['http://intranet', 'navigate', 'http://intranet'],
    ['https://localhost:3443', 'navigate', 'https://localhost:3443'],
];

for (const [input, type, url] of NAVIGATE_CASES) {
    const result = parse(input);
    assert.equal(result.type, type, `${input}: ${JSON.stringify(result)}`);
    assert.equal(result.url, url, input);
}

const SEARCH_CASES = [
    'hello world',
    'singleword',
    'user@example.com',
    'ftp://example.com/file',
    'javascript:alert(1)',
    'data:text/html,<h1>x</h1>',
    'file:///tmp/file.txt',
    'vbscript:msgbox(1)',
    'custom://example.com',
    'http:example.com',
    '256.1.1.1',
    '1.2.3',
    '::1',
    '[gg::1]',
    'localhost:65536',
    'example.com:99999',
    'http://user:pass@example.com',
    'https://user@example.com',
    '//example.com',
    '-bad.example',
];

for (const input of SEARCH_CASES) {
    const result = parse(input);
    assert.equal(result.type, 'search', `${input}: ${JSON.stringify(result)}`);
    assert.equal(result.url, 'https://bing.com/search?q=' + encodeURIComponent(input), input);
}

console.log(`✓ Edge 地址栏 ${NAVIGATE_CASES.length + SEARCH_CASES.length} 项输入矩阵通过`);
