// 描画の前に、保存したテーマ（light・dark）を当てる。保存がなければ OS の設定に従う（data-theme を付けない）
(() => {
  try {
    const saved = localStorage.getItem('dialsafe-simulator-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  } catch {
    // 保存を読めない環境では OS の設定に従う
  }
})();
