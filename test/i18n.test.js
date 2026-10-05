import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.js';

load('js/messages.js');
const { detectLanguage, parseVars } = load('js/i18n.js').DialI18n;

test('言語は ?lang= → 保存した選択 → ブラウザーの言語の順に決まる', () => {
  assert.equal(detectLanguage('?lang=en', 'ja', 'ja-JP'), 'en');
  assert.equal(detectLanguage('?lang=ja', 'en', 'en-US'), 'ja');
  assert.equal(detectLanguage('?lang=fr', 'en', 'ja-JP'), 'en');
  assert.equal(detectLanguage('', null, 'ja-JP'), 'ja');
  assert.equal(detectLanguage('', null, 'en-GB'), 'en');
  assert.equal(detectLanguage('', null, undefined), 'en');
});

test('data-i18n-vars は「名前:値;名前:値」を読む', () => {
  assert.deepEqual(parseVars('pin:4;d3:97'), { pin: '4', d3: '97' });
  assert.deepEqual(parseVars(''), {});
  assert.deepEqual(parseVars(undefined), {});
});
