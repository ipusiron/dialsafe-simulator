import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { read } from './load.js';

const list = (dir, ext) => fs.readdirSync(new URL(`../${dir}`, import.meta.url)).filter((f) => f.endsWith(ext)).map((f) => `${dir}/${f}`);
const CODE = [...list('js', '.js'), ...list('test', '.js'), 'css/style.css'];

test('JS・CSS・テストの最長行は160文字以下、index.html は250文字以下', () => {
  for (const f of CODE) {
    const lines = read(f).split('\n');
    const i = lines.findIndex((l) => l.length > 160);
    assert.equal(i, -1, `${f}:${i + 1}`);
  }
  const lines = read('index.html').split('\n');
  const i = lines.findIndex((l) => l.length > 250);
  assert.equal(i, -1, `index.html:${i + 1}`);
});

test('改行は LF、制御文字なし、末尾に改行', () => {
  for (const f of [...CODE, 'index.html', 'README.md', 'README.en.md']) {
    const s = read(f);
    assert.ok(!s.includes('\r'), `${f}: CR`);
    assert.doesNotMatch(s, /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/, f);
    assert.ok(s.endsWith('\n'), `${f}: no final newline`);
  }
});
