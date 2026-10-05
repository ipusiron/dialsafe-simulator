import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { read, load, core } from './load.js';

const html = read('index.html');
const { MESSAGES, t } = load('js/messages.js').DialMessages;
const { parseVars } = load('js/i18n.js').DialI18n;
const C = core();
const SCRIPTS = ['js/script.js', 'js/dial-core.js', 'js/messages.js', 'js/i18n.js', 'js/theme.js', 'js/theme-init.js'];

test('CSP はスクリプト・スタイルを同じ場所のファイルだけに限り、unsafe-inline と外部の通信を許さない', () => {
  const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)[1];
  assert.equal(csp, "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
    + "connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'");
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
});

test('HTML に style 属性・インラインのスクリプト・イベントハンドラーがない。外部リンクは noopener noreferrer', () => {
  assert.doesNotMatch(html, /\sstyle=/);
  assert.doesNotMatch(html, /\son[a-z]+=/i);
  for (const tag of html.match(/<script[^>]*>/g)) assert.match(tag, /src="js\/[a-z0-9-]+\.js"/, tag);
  assert.equal((html.match(/<script[^>]*>\s*[^\s<]/g) || []).length, 0);
  for (const a of html.match(/<a [^>]*target="_blank"[^>]*>/g)) assert.match(a, /rel="noopener noreferrer"/, a);
});

test('タブは WAI-ARIA の形（tablist・tab・tabpanel、aria-controls の先が実在）', () => {
  assert.match(html, /role="tablist"/);
  const tabs = [...html.matchAll(/role="tab" id="(tab-[a-z]+)" data-tab="([a-z]+)" aria-controls="([a-z]+)" aria-selected="(true|false)"/g)];
  assert.deepEqual(tabs.map((m) => [m[2], m[4]]), [['learn', 'true'], ['sim', 'false']]);
  for (const [, id, , panel] of tabs) assert.match(html, new RegExp(`id="${panel}" class="tab-content[^"]*" role="tabpanel" aria-labelledby="${id}"`), id);
});

test('画像はすべて alt があり、ファイルが実在する。ボタンは type="button"', () => {
  for (const img of html.match(/<img [^>]*>/g)) {
    assert.match(img, /alt="[^"]+"/, img);
    assert.ok(fs.existsSync(new URL(`../${img.match(/src="([^"]+)"/)[1]}`, import.meta.url)), img);
  }
  for (const b of html.match(/<button[^>]*>/g)) assert.match(b, /type="button"/, b);
});

// 文言の太字（**）と改行（\n）は HTML の strong と br に当たる。HTML 側のタグを外して比べる
// ソース上の改行と字下げは、本文に含めない
const plain = (s) => s.replace(/\n\s*/g, '').replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').trim();
const fromDict = (s) => s.replace(/\*\*/g, '');

test('data-i18n のキーは辞書にあり、HTML に書いた日本語は辞書の日本語と同じ（太字・改行・差し込む値も）', () => {
  let n = 0;
  for (const m of html.matchAll(/<([a-z0-9]+)([^>]*?)data-i18n="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const attrs = m[2] + m[4];
    const key = m[3];
    assert.ok(MESSAGES.ja[key] !== undefined, key);
    const vars = parseVars((attrs.match(/data-i18n-vars="([^"]*)"/) || [])[1]);
    assert.equal(plain(m[5]), fromDict(t(key, vars, 'ja')), key);
    n++;
  }
  assert.ok(n >= 60, String(n));
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const pair of m[1].split(';')) assert.ok(MESSAGES.ja[pair.split(':')[1]] !== undefined, pair);
  }
});

test('学習タブに差し込む値（ツクの厚み・拾い上げまでの目盛り数）は、計算部の値と同じ', () => {
  const vars = parseVars(html.match(/data-i18n="learn.why.desc2" data-i18n-vars="([^"]+)"/)[1]);
  const [d3, d2, d1] = C.pickupDistances(C.makeLock());
  assert.deepEqual(vars, { pin: String(C.PIN_WIDTH), d3: String(d3), d2: String(d2), d1: String(d1) });
});

test('JS は innerHTML・eval を使わず、style を書き換えない（図は SVG の属性で描く）', () => {
  for (const f of SCRIPTS) {
    const src = read(f);
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|\beval\(|new Function|document\.write/, f);
    assert.doesNotMatch(src, /\.style\b|setAttribute\('style'|cssText/, f);
    assert.doesNotMatch(src, /console\.(log|debug|info)/, f);
  }
});

test('キー操作はダイヤルにフォーカスがあるときだけ受け付ける（document 全体の keydown を拾わない）', () => {
  const src = read('js/script.js');
  assert.doesNotMatch(src, /document\.addEventListener\('keydown'/);
  assert.match(src, /dial\.addEventListener\('keydown'/);
});
