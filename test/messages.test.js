import test from 'node:test';
import assert from 'node:assert/strict';
import { read, load } from './load.js';

const { MESSAGES, t } = load('js/messages.js').DialMessages;
// かな・カタカナ・漢字・全角の記号
const JAPANESE = new RegExp('[' + [[0x3000, 0x303f], [0x3040, 0x30ff], [0x3400, 0x9fff], [0xff00, 0xffef]]
  .map(([a, b]) => String.fromCharCode(a) + '-' + String.fromCharCode(b)).join('') + ']');
const placeholders = (s) => [...s.matchAll(/\{([a-z0-9]+)\}/g)].map((m) => m[1]).sort();

test('日本語と英語の辞書は同じキーを持ち、置き場所 {name} と太字の数もそろう', () => {
  assert.deepEqual(Object.keys(MESSAGES.en).sort(), Object.keys(MESSAGES.ja).sort());
  for (const k of Object.keys(MESSAGES.ja)) {
    assert.deepEqual(placeholders(MESSAGES.en[k]), placeholders(MESSAGES.ja[k]), k);
    for (const lang of ['ja', 'en']) assert.equal((MESSAGES[lang][k].match(/\*\*/g) || []).length % 2, 0, `${lang} ${k}`);
  }
});

test('英語の辞書に日本語の文字がない（言語の切り替えボタンの「日本語」を除く）', () => {
  for (const [k, v] of Object.entries(MESSAGES.en)) {
    if (k === 'ui.langButton' || k === 'ui.langLabel') continue;
    assert.doesNotMatch(v, JAPANESE, k);
  }
});

test('日本語の文言は、日本語と英数字のあいだに半角空白を入れない。「ブラウザ」でなく「ブラウザー」', () => {
  const bad = new RegExp(`(${JAPANESE.source} [A-Za-z0-9])|([A-Za-z0-9] ${JAPANESE.source})`);
  for (const [k, v] of Object.entries(MESSAGES.ja)) {
    assert.doesNotMatch(v, bad, k);
    assert.doesNotMatch(v, /ブラウザ(?!ー)/, k);
  }
});

test('画面のスクリプトが使うキーは、すべて辞書にある（組み立てるキーも含む）', () => {
  const src = ['js/script.js', 'js/theme.js'].map(read).join('\n');
  for (const m of src.matchAll(/\bt\('([a-z]+\.[A-Za-z0-9.]+)'/g)) assert.ok(MESSAGES.ja[m[1]] !== undefined, m[1]);
  for (const i of [1, 2, 3, 4]) assert.ok(MESSAGES.ja[`guide.step${i}`], i);
  for (const i of [1, 2, 3, 4, 5]) for (const p of ['demo.head', 'demo.explain', 'demo.btn']) assert.ok(MESSAGES.ja[`${p}${i}`], `${p}${i}`);
  for (const i of [0, 1, 2, 3]) for (const p of ['wheel.name.', 'inner.wheel.']) assert.ok(MESSAGES.ja[`${p}${i}`], `${p}${i}`);
});

test('t は置き場所を値で埋め、未知のキーはキーのまま返す', () => {
  assert.equal(t('guide.step1', { n: '94' }, 'ja'), '右に回し、94を4回目で止める（4回以上）');
  assert.equal(t('guide.step1', { n: '94' }, 'en'), 'Turn right and stop at 94 the 4th time (4 or more)');
  assert.equal(t('no.such.key', {}, 'ja'), 'no.such.key');
});

test('「100⁴」は1億通りと書く（100万通りではない）', () => {
  assert.equal(100 ** 4, 100000000);
  assert.match(MESSAGES.ja['learn.whatIs.desc2'], /100⁴＝1億通り/);
  assert.match(MESSAGES.en['learn.whatIs.desc2'], /100⁴ = 100 million/);
});
