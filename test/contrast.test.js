import test from 'node:test';
import assert from 'node:assert/strict';
import { read } from './load.js';

const css = read('css/style.css');

function tokens(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, selector);
  const block = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]));
}

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// 文字の色と背景の色の組（画面で実際に重なるもの）。4.5:1 以上
const TEXT = [
  ['text', 'bg'], ['text', 'card'], ['muted', 'card'], ['muted', 'bg'], ['muted', 'accent-weak'], ['accent-text', 'card'], ['accent-text', 'accent-weak'],
  ['on-accent', 'accent'], ['ok-text', 'ok-bg'], ['ok-text', 'card'], ['warn-text', 'warn-bg'], ['text', 'warn-bg'], ['text', 'accent-weak'],
  ['contact', 'card'], ['dial-text', 'dial-face'], ['bg', 'text']
];
// 図（ゲート・ツク・フェンス・指標）と、その下地の組。3:1 以上（WCAG 1.4.11）。文字盤の外周は飾りなので除く
const GRAPHICS = [
  ['gate', 'strip'], ['gate-ok', 'strip'], ['pin-front', 'strip'], ['pin-back', 'strip'], ['contact', 'strip'], ['fence', 'strip'], ['index', 'card']
];

test('ライトとダークの配色は、文字と背景が4.5:1以上、図と下地が3:1以上', () => {
  for (const [name, set] of [['light', tokens(':root')], ['dark', tokens(':root[data-theme="dark"]')]]) {
    for (const [fg, bg] of TEXT) assert.ok(ratio(set[fg], set[bg]) >= 4.5, `${name} ${fg} on ${bg}: ${ratio(set[fg], set[bg]).toFixed(2)}`);
    for (const [fg, bg] of GRAPHICS) assert.ok(ratio(set[fg], set[bg]) >= 3, `${name} ${fg} on ${bg}: ${ratio(set[fg], set[bg]).toFixed(2)}`);
  }
});

test('OS の設定によるダークと、手動のダークは同じ値', () => {
  const start = css.indexOf(':root:not([data-theme="light"]) {');
  const block = css.slice(start, css.indexOf('}', start));
  const os = Object.fromEntries([...block.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const s2 = css.indexOf(':root[data-theme="dark"] {');
  const manual = Object.fromEntries([...css.slice(s2, css.indexOf('}', s2)).matchAll(/--([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  assert.deepEqual(os, manual);
});

test('操作するボタンと選択欄は高さ44px以上', () => {
  for (const sel of ['.icon-btn, .secondary, .turn-btn, .demo-btn {', '.primary {', '.tab-button {', 'select {']) {
    const start = css.indexOf(sel);
    assert.ok(start >= 0, sel);
    assert.match(css.slice(start, css.indexOf('}', start)), /min-height: 44px/, sel);
  }
});
