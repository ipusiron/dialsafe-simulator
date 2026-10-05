// ライト・ダークの切り替え。今の見た目（保存した選択、なければ OS の設定）の反対にする。globalThis.DialTheme に置く
(() => {
  'use strict';

  const KEY = 'dialsafe-simulator-theme';

  const current = () => document.documentElement.dataset.theme
    || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // ボタンの絵と読み上げの文言を、今のテーマに合わせて描き直す
  function refresh(button) {
    const t = globalThis.DialMessages.t;
    const dark = current() === 'dark';
    button.textContent = dark ? '☀️' : '🌙';
    const label = t(dark ? 'theme.toLight' : 'theme.toDark');
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  function toggle(button) {
    const next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // 保存できない環境では、そのページの間だけ切り替える
    }
    refresh(button);
  }

  globalThis.DialTheme = { current, refresh, toggle };
})();
