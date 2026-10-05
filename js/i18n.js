// 言語の選択と、HTML に書いた静的な文言（data-i18n・data-i18n-attr）の差し替え。globalThis.DialI18n に置く
(() => {
  'use strict';

  const STORAGE_KEY = 'dialsafe-simulator-lang';
  const LANGS = ['ja', 'en'];

  // ?lang= → 保存した選択 → ブラウザーの言語（ja で始まれば日本語、ほかは英語）
  function detectLanguage(search, stored, navigatorLanguage) {
    const q = new URLSearchParams(search || '').get('lang');
    if (LANGS.includes(q)) return q;
    if (LANGS.includes(stored)) return stored;
    return String(navigatorLanguage || '').toLowerCase().startsWith('ja') ? 'ja' : 'en';
  }

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function store(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // 保存できない環境では、そのページの間だけ切り替える
    }
  }

  // 文言の **…** を strong、改行を br にして要素へ入れる（HTML として解釈しない）
  function renderRich(el, text) {
    el.replaceChildren();
    String(text).split('\n').forEach((line, i) => {
      if (i) el.append(document.createElement('br'));
      line.split('**').forEach((part, j) => {
        if (!part) return;
        if (j % 2) {
          const strong = document.createElement('strong');
          strong.textContent = part;
          el.append(strong);
        } else {
          el.append(document.createTextNode(part));
        }
      });
    });
  }

  // data-i18n-vars="name:値;name:値" を { name: 値 } に
  function parseVars(raw) {
    const vars = {};
    for (const pair of String(raw || '').split(';')) {
      const i = pair.indexOf(':');
      if (i > 0) vars[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
    }
    return vars;
  }

  // data-i18n="key" は文言（太字・改行つき）、data-i18n-attr="attr:key;attr:key" は属性
  function applyStaticText(root = document) {
    const t = globalThis.DialMessages.t;
    for (const el of root.querySelectorAll('[data-i18n]')) renderRich(el, t(el.dataset.i18n, parseVars(el.dataset.i18nVars)));
    for (const el of root.querySelectorAll('[data-i18n-attr]')) {
      for (const pair of el.dataset.i18nAttr.split(';')) {
        const [attr, key] = pair.split(':');
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
      }
    }
    document.documentElement.lang = api.lang;
  }

  const api = {
    lang: 'ja',
    LANGS,
    detectLanguage,
    parseVars,
    renderRich,
    init() {
      const wanted = detectLanguage(location.search, readStored(), navigator.language);
      api.lang = globalThis.DialMessages.MESSAGES[wanted] ? wanted : 'ja';
      return api.lang;
    },
    set(lang) {
      if (!LANGS.includes(lang) || !globalThis.DialMessages.MESSAGES[lang]) return;
      api.lang = lang;
      store(lang);
    },
    applyStaticText
  };

  globalThis.DialI18n = api;
})();
