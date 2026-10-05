// DialSafe Simulator の画面の処理。計算は js/dial-core.js、文言は js/messages.js、言語は js/i18n.js
// 画面に入れる文字列はすべて textContent で入れる（HTML として解釈しない）。図は SVG の属性で描く（style は書き換えない）
(() => {
  'use strict';

  const C = globalThis.DialCore;
  const I18n = globalThis.DialI18n;
  const t = (key, vars) => globalThis.DialMessages.t(key, vars);
  const $ = (id) => document.getElementById(id);
  const SVG_NS = 'http://www.w3.org/2000/svg';
  // 内部の動きは、上からドライビングディスク・第3・第2・第1ディスク（offsets・view の添え字）
  const WHEEL_ORDER = [3, 2, 1, 0];
  // 自動実演の速さ（1回に回す目盛り数と間隔 ms）。区切りのあいだは PAUSE ms 止める
  const SPEEDS = { slow: { per: 1, delay: 30 }, normal: { per: 3, delay: 16 }, fast: { per: Infinity, delay: 0 } };
  const PAUSE = 600;

  // 練習モードでは番号を入れ替える（既定は 94-30-84-13）
  let lock = C.makeLock();
  // closed: 開けたあと「閉める」を押した状態（right＝閉めてから続けて右へ回した目盛り数）
  // history: リセット（または練習・自動実演）のあとの操作の記録。recordStart・recordGuide は記録を始めたときの状態と手順ガイド
  const app = {
    s: C.createState(lock), guide: C.createGuide(), open: false, result: null, demo: null, log: [], toastTimer: null,
    practice: false, seed: null, hidden: false, closed: null, history: [], recordStart: null, recordGuide: null, historyFull: false,
    lockTry: null, lockTimer: null
  };
  app.recordStart = app.s;
  app.recordGuide = app.guide;
  // 番号を崩すのに必要な右回し（4回転）
  const SCRAMBLE = 4 * C.N;
  // 記録する操作の数の上限（振り返りは記録の初めから模型で回し直すので、長くしすぎない）
  const HISTORY_MAX = 300;

  // 練習用の乱数（0以上1未満）
  function rand() {
    try {
      return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    } catch {
      return Math.random();
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svg(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    return node;
  }

  const pad2 = (n) => String(n).padStart(2, '0');
  // ずれの表示（＋は付け、−は数学の記号で）
  const signedText = (o) => (o > 0 ? `+${o}` : o < 0 ? `−${-o}` : '0');
  const dirName = (dir) => t(dir === 'R' ? 'guide.dirR' : 'guide.dirL');

  // ===== 操作の記録 =====
  function record(entry) {
    if (app.demo) return;
    const next = entry.type === 'turn' ? C.appendMove(app.history, entry.dir, entry.moves) : [...app.history, entry];
    if (next.length > HISTORY_MAX) {
      app.historyFull = true;
      return;
    }
    app.history = next;
  }

  function startRecording() {
    app.history = [];
    app.historyFull = false;
    app.recordStart = app.s;
    app.recordGuide = app.guide;
  }

  // ===== タブ（WAI-ARIA のタブ。矢印・Home・End で移る） =====
  function initTabs() {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      for (const b of tabs) {
        const on = b === tab;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        const panel = $(b.getAttribute('aria-controls'));
        panel.hidden = !on;
        panel.classList.toggle('active', on);
      }
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const next = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        select(tabs[next], true);
      });
    });
    return { select: (id) => select($(`tab-${id}`)) };
  }

  // ===== ダイヤル（目盛りは時計回りに増える。右に回すと文字盤が時計回りに回り、指標の数字が減る） =====
  function buildDial() {
    const face = $('dial-face');
    face.append(svg('circle', { r: 104, class: 'dial-ring' }), svg('circle', { r: 98, class: 'dial-plate' }));
    for (let i = 0; i < C.N; i++) {
      const major = i % 10 === 0;
      const len = major ? 14 : i % 5 === 0 ? 10 : 6;
      face.append(svg('line', { x1: 0, y1: -96, x2: 0, y2: -96 + len, class: major ? 'dial-tick major' : 'dial-tick', transform: `rotate(${i * 3.6})` }));
      if (major) {
        const label = svg('text', { x: 0, y: -71, class: 'dial-label', transform: `rotate(${i * 3.6})` });
        label.textContent = String(i);
        face.append(label);
      }
    }
    face.append(svg('circle', { r: 52, class: 'dial-knob' }));
  }

  function renderDial() {
    $('dial-face').setAttribute('transform', `rotate(${-app.s.p * 3.6})`);
    const text = pad2(C.reading(app.s));
    if ($('reading').textContent !== text) $('reading').textContent = text;
  }

  // ===== 回す・鍵を回す・リセット =====
  function turn(dir, count = 1) {
    if (app.open) {
      toast(t('sim.locked'));
      return;
    }
    for (let i = 0; i < count; i++) {
      app.guide = C.updateGuide(lock, app.guide, C.reading(app.s), dir);
      app.s = C.step(lock, app.s, dir);
    }
    record({ type: 'turn', dir, moves: count });
    afterTurn(dir, count);
    render();
  }

  // 回したあとの共通の処理（手で回すときと再生）。閉めたあと、続けて右へ4回転以上回したら番号を崩したことにする（左へ回したら数え直す）
  function afterTurn(dir, count) {
    app.lockTry = null;
    if (app.closed) {
      app.closed.right = dir === 'R' ? app.closed.right + count : 0;
      if (app.closed.right >= SCRAMBLE) app.closed.scrambled = true;
      app.result = { kind: app.closed.scrambled ? 'scrambled' : 'closed' };
    } else {
      app.result = null;
    }
  }

  // ずれているディスクの一覧（許容幅の外のもの）
  function misalignedText(offsets) {
    return offsets
      .map((o, k) => ({ o, k }))
      .filter((x) => Math.abs(x.o) > lock.tolerance)
      .map((x) => t('wheel.offset', { name: t(`wheel.name.${x.k}`), o: signedText(x.o) }))
      .join(t('ui.sep'));
  }

  function turnKey() {
    if (app.open) return;
    record({ type: 'key' });
    if (C.isOpen(lock, app.s)) {
      app.open = true;
      app.result = { kind: app.closed && !app.closed.scrambled ? 'unscrambled' : 'open' };
    } else {
      app.result = { kind: 'fail', offsets: C.offsets(lock, app.s) };
      tryLock();
    }
    app.closed = null;
    render();
  }

  // 開けたあと扉を閉める。ダイヤルは動かさないので、ゲートは揃ったまま
  function closeDoor() {
    if (!app.open) return;
    record({ type: 'close' });
    app.open = false;
    app.closed = { right: 0, scrambled: false };
    app.guide = C.createGuide();
    app.result = { kind: 'closed' };
    render();
  }

  // 初期状態に戻す。既定の番号では「左に回して止めた状態」、練習では問題番号で決まる状態
  function resetModel() {
    app.s = app.practice ? C.practiceFromSeed(app.seed).state : C.createState(lock);
    app.guide = C.createGuide();
    app.open = false;
    app.result = null;
    app.closed = null;
    app.lockTry = null;
    startRecording();
  }

  // 問題番号で練習する（同じ番号なら同じ番号カードと初期状態）
  function loadPractice(raw) {
    const text = String(raw ?? '').trim();
    const seed = /^[0-9]+$/.test(text) ? Number(text) : NaN;
    const ok = seed >= 1 && seed <= C.PRACTICE_MAX_SEED;
    $('practice-seed').setAttribute('aria-invalid', String(!ok));
    $('practice-alert').hidden = ok;
    $('practice-alert').textContent = ok ? '' : t('practice.badSeed');
    if (!ok) return;
    stopDemo(true);
    lock = C.makeLock(C.practiceFromSeed(seed).numbers);
    app.practice = true;
    app.seed = seed;
    $('practice-seed').value = String(seed);
    resetModel();
    render();
    toast(t('practice.started', { n: seed }));
  }

  const startPractice = () => loadPractice(Math.floor(rand() * C.PRACTICE_MAX_SEED) + 1);

  function backToDefault() {
    stopDemo(true);
    lock = C.makeLock();
    app.practice = false;
    app.seed = null;
    $('practice-seed').value = '';
    resetModel();
    render();
    toast(t('practice.back'));
  }

  // ===== 手順ガイド =====
  function guideMessage(g) {
    const n = (i) => pad2(lock.numbers[i]);
    const s = g.step + 1;
    const need = C.PROCEDURE[g.step];
    switch (g.status) {
      case 'start':
        return { text: t('guide.start', { n: n(0) }), warn: false };
      case 'turning': {
        const again = g.step === 0 && ['wrongReverse', 'movedAfterLast', 'wrongStart', 'over'].includes(g.last) ? t('guide.again') : '';
        return { text: again + t('guide.turning', { s, dir: dirName(need.dir), n: n(g.step), k: g.arrivals, need: need.arrivals }), warn: false };
      }
      case 'ready':
        return { text: g.step === 3 ? t('guide.readyLast') : t('guide.ready', { s, n: n(g.step), next: dirName(C.PROCEDURE[g.step + 1].dir) }), warn: false };
      case 'past':
        return { text: t('guide.past', { n: n(0) }), warn: true };
      case 'over':
        return { text: t('guide.over', { s, n: n(g.step) }), warn: true };
      case 'restart': {
        const at = g.at === null || g.at === undefined ? 0 : g.at;
        return { text: t('guide.restart', { n: n(at), need: C.PROCEDURE[at].arrivals }), warn: true };
      }
      default:
        return { text: t('guide.wrongStart'), warn: true };
    }
  }

  function renderGuide() {
    const g = app.guide;
    $('guide-card-title').textContent = app.practice ? t('guide.cardPractice', { n: app.seed }) : t('guide.card');
    $('practice-default').disabled = !app.practice;
    const list = $('guide-steps');
    list.replaceChildren();
    const active = !['start', 'wrongStart', 'restart'].includes(g.status);
    C.PROCEDURE.forEach((p, i) => {
      const done = i < g.step;
      const current = active && i === g.step;
      const li = el('li', done ? 'done' : current ? 'current' : '');
      li.append(el('span', 'mark', done ? '✓' : current ? '▶' : String(i + 1)), el('span', 'num', pad2(lock.numbers[i])),
        el('span', '', t(`guide.step${i + 1}`, { n: pad2(lock.numbers[i]) })));
      if (current) li.setAttribute('aria-current', 'step');
      list.append(li);
    });
    const m = guideMessage(g);
    const box = $('guide-status');
    if (box.textContent !== m.text) box.textContent = m.text;
    box.classList.toggle('warn', m.warn);
  }

  // ===== 内部の動き（横の帯。中央がフェンス、幅100が1周） =====
  const wheelNodes = {};

  // 帯の端をまたぐ図形は、反対側にも描く（端で切れる）
  const wrapped = (x) => [x, x + (x < 0 ? C.N : -C.N)];

  function buildWheels() {
    const box = $('wheels');
    for (const k of WHEEL_ORDER) {
      const row = el('div', 'wheel-row');
      const head = el('div', 'wheel-head');
      const name = el('span', 'wheel-name');
      const state = el('span', 'wheel-state');
      const offset = el('span', 'wheel-offset');
      head.append(name, state, offset);
      const strip = svg('svg', { viewBox: '-50 -6 100 12', class: 'strip', 'aria-hidden': 'true', focusable: 'false' });
      strip.append(svg('rect', { x: -50, y: -5, width: 100, height: 10, rx: 2, class: 'strip-bg' }));
      const gates = wrapped(0).map(() => svg('rect', { y: -5, width: 3, height: 10, class: 'strip-gate' }));
      strip.append(...gates);
      strip.append(svg('line', { x1: 0, y1: -6, x2: 0, y2: 6, class: 'strip-fence' }));
      const fronts = k < 3 ? wrapped(0).map(() => svg('circle', { cy: -2.6, r: 1.7, class: 'strip-pin-front' })) : [];
      const backs = k > 0 ? wrapped(0).map(() => svg('rect', { width: 2.4, height: 2.4, class: 'strip-pin-back' })) : [];
      strip.append(...fronts, ...backs);
      row.append(head, strip);
      box.append(row);
      wheelNodes[k] = { name, state, offset, gates, fronts, backs };
    }
  }

  function renderWheels() {
    $('inner-body').hidden = app.hidden;
    $('inner-hidden').hidden = !app.hidden;
    $('hide-inner').checked = app.hidden;
    const v = C.view(lock, app.s);
    for (const k of WHEEL_ORDER) {
      const n = wheelNodes[k];
      const w = v[k];
      n.name.textContent = t(`inner.wheel.${k}`);
      const contact = k < 3 && w.contact;
      n.state.textContent = k === 3 ? t('inner.direct') : contact ? t(contact === 'R' ? 'inner.contactR' : 'inner.contactL') : t('inner.free');
      n.state.classList.toggle('contact', Boolean(contact));
      n.offset.textContent = w.aligned ? t('inner.aligned') : t('inner.offset', { o: signedText(w.gate) });
      n.offset.classList.toggle('aligned', w.aligned);
      wrapped(w.gate).forEach((x, i) => {
        n.gates[i].setAttribute('x', String(x - 1.5));
        n.gates[i].classList.toggle('aligned', w.aligned);
      });
      if (n.fronts.length) {
        wrapped(w.frontPin).forEach((x, i) => {
          n.fronts[i].setAttribute('cx', String(x));
          n.fronts[i].classList.toggle('contact', Boolean(contact));
        });
      }
      if (n.backs.length) {
        // 押す側のツクは、自分が押している（下の行の）ディスクと接していれば強調する
        const pushing = Boolean(v[k - 1].contact);
        wrapped(w.backPin).forEach((x, i) => {
          n.backs[i].setAttribute('x', String(x - 1.2));
          n.backs[i].setAttribute('y', '1.4');
          n.backs[i].setAttribute('transform', `rotate(45 ${x} 2.6)`);
          n.backs[i].classList.toggle('contact', pushing);
        });
      }
    }
    const fence = $('fence-status');
    const ready = C.isOpen(lock, app.s);
    fence.textContent = t(app.open ? 'inner.fenceDown' : ready ? 'inner.fenceReady' : 'inner.fenceUp');
    fence.classList.toggle('ready', ready);
  }

  // ===== 錠前の動き（フェンスの真下±12目盛りの窓。上からドライビングディスク・第3・第2・第1） =====
  const lockNodes = { notches: {}, labels: {} };
  const LOCK_SCALE = 3;

  function buildLockView() {
    const view = $('lockview');
    WHEEL_ORDER.forEach((k, i) => {
      const y = 2 + 8 * i;
      const label = svg('text', { x: -40, y: y + 2.5, class: 'lock-label', 'text-anchor': 'end' });
      lockNodes.labels[k] = label;
      view.append(label, svg('rect', { x: -36, y, width: 72, height: 5, rx: 1, class: 'lock-band' }));
      const notch = svg('rect', { y, width: 3 * LOCK_SCALE, height: 5, class: 'lock-notch' });
      lockNodes.notches[k] = notch;
      view.append(notch);
    });
    // フェンスの爪（先は y=0。下りると帯を貫く）・閂（右の枠に刺さっている）・鍵
    view.append(svg('rect', { x: -3.5, y: -16, width: 7, height: 16, rx: 1, class: 'lock-fence' }));
    view.append(svg('rect', { x: 3.5, y: -15, width: 66, height: 6, rx: 1, class: 'lock-bolt' }));
    view.append(svg('rect', { x: 58, y: -20, width: 8, height: 16, class: 'lock-frame' }));
    const keyBody = svg('circle', { cx: -56, cy: -22, r: 7, class: 'lock-key' });
    const slot = svg('rect', { x: -57, y: -27, width: 2, height: 10, rx: 1, class: 'lock-slot' });
    view.append(keyBody, slot);
    for (const [key, x, y, anchor] of [['lock.fence', -6, -24, 'end'], ['lock.bolt', 36, -20, 'middle'], ['lock.key', -56, -33, 'middle']]) {
      const label = svg('text', { x, y, class: 'lock-label', 'text-anchor': anchor });
      lockNodes.labels[key] = label;
      view.append(label);
    }
  }

  // 鍵を回して開かなかったとき、爪が止まるところまで下ろし、少しして戻す
  function tryLock() {
    clearTimeout(app.lockTimer);
    app.lockTry = { stop: C.fenceStop(lock, app.s) };
    app.lockTimer = setTimeout(() => {
      app.lockTry = null;
      renderLockView();
    }, 1400);
  }

  function renderLockView() {
    const view = $('lockview');
    const win = C.fenceWindow(lock, app.s);
    for (const k of WHEEL_ORDER) {
      lockNodes.labels[k].textContent = t(`inner.wheel.${k}`);
      const w = win[k];
      const notch = lockNodes.notches[k];
      notch.setAttribute('visibility', w.offset === null ? 'hidden' : 'visible');
      notch.setAttribute('x', String((w.offset === null ? 0 : w.offset) * LOCK_SCALE - 1.5 * LOCK_SCALE));
      notch.classList.toggle('aligned', w.aligned);
    }
    for (const key of ['lock.fence', 'lock.bolt', 'lock.key']) lockNodes.labels[key].textContent = t(key);
    const stopBand = app.lockTry ? WHEEL_ORDER.indexOf(app.lockTry.stop) : -1;
    view.classList.toggle('open', app.open);
    view.classList.toggle('turned', app.open);
    view.classList.toggle('trying', Boolean(app.lockTry));
    for (let i = 0; i < 4; i++) view.classList.toggle(`stop-${i}`, stopBand === i);
    const status = $('lock-status');
    const text = app.open ? t('lock.open') : app.lockTry ? t('lock.blocked', { name: t(`wheel.name.${app.lockTry.stop}`) }) : t('lock.note');
    if (status.textContent !== text) status.textContent = text;
    status.classList.toggle('ok', app.open);
    status.classList.toggle('warn', Boolean(app.lockTry));
  }

  // ===== 振り返り（記録を模型で回し直す） =====
  function judgeText(item) {
    const s = item.step + 1;
    const n = pad2(lock.numbers[item.step]);
    const key = {
      ready: 'review.judge.ready', turning: 'review.judge.turning', past: 'review.judge.past', over: 'review.judge.over',
      restart: 'review.judge.restart', wrongStart: 'review.judge.wrongStart', start: 'review.judge.start'
    }[item.status];
    return { text: t(key, { s, n, k: item.arrivals }), warn: ['past', 'over', 'restart', 'wrongStart'].includes(item.status) };
  }

  function renderReview() {
    const list = $('review-list');
    list.replaceChildren();
    const a = C.analyzeHistory(lock, app.recordStart, app.history, app.recordGuide);
    $('review-empty').hidden = a.items.length > 0;
    $('review-replay').disabled = Boolean(app.demo) || !app.history.some((h) => h.type === 'turn');
    const turnText = (i) => {
      const h = a.items[i];
      return { i: i + 1, dir: dirName(h.dir), moves: h.moves };
    };
    a.items.forEach((item) => {
      const li = el('li');
      if (item.type === 'turn') {
        li.append(el('span', '', `${t('review.turn', { dir: dirName(item.dir), moves: item.moves, from: pad2(item.from), to: pad2(item.to) })} — `));
        const j = judgeText(item);
        li.append(el('span', j.warn ? 'judge warn' : 'judge', j.text));
        if (!app.hidden) {
          const moved = item.moved.map((m, k) => ({ m, k })).filter((x) => x.m > 0).reverse()
            .map((x) => t('review.movedItem', { name: t(`wheel.name.${x.k}`), m: x.m }));
          li.append(el('span', 'detail', moved.length ? t('review.moved', { list: moved.join(t('ui.sep')) }) : t('review.movedNone')));
        }
      } else if (item.type === 'close') {
        li.append(el('span', '', t('review.close')));
      } else if (item.open) {
        li.append(el('span', 'ok', t('review.keyOpen')));
      } else if (app.hidden) {
        li.append(el('span', 'fail', t('review.keyFailHidden')));
      } else {
        li.append(el('span', 'fail', t('review.keyFail', { list: misalignedText(item.offsets) })));
        item.blame.forEach((b, k) => {
          if (Math.abs(item.offsets[k]) <= lock.tolerance) return;
          const name = t(`wheel.name.${k}`);
          let text;
          if (k === 3) text = t('review.blameDriving', { i: b === null ? '—' : b + 1 });
          else if (b === null) text = t('review.blameNone', { name });
          else text = t('review.blame', { name, ...turnText(b) });
          li.append(el('span', 'detail', text));
        });
      }
      list.append(li);
    });
    if (app.historyFull) list.append(el('li', 'detail', t('review.full', { n: HISTORY_MAX })));
    list.scrollTop = list.scrollHeight;
  }

  // ===== 結果（鍵を回したとき） =====
  function renderResult() {
    const box = $('result');
    const r = app.result;
    box.hidden = !r;
    $('close-door').hidden = !app.open;
    if (!r) return;
    const text = {
      open: () => t('sim.open'),
      unscrambled: () => t('sim.openUnscrambled'),
      closed: () => t('sim.closed'),
      scrambled: () => t('sim.scrambled'),
      fail: () => (app.hidden ? t('sim.notOpenHidden') : t('sim.notOpen', { list: misalignedText(r.offsets) }))
    }[r.kind];
    box.textContent = text();
    box.classList.toggle('ok', r.kind === 'open' || r.kind === 'unscrambled');
    box.classList.toggle('info', r.kind === 'closed' || r.kind === 'scrambled');
  }

  function render() {
    renderDial();
    renderGuide();
    renderWheels();
    renderLockView();
    renderResult();
    renderReview();
  }

  // ===== 自動実演（模型を1目盛りずつ回す） =====
  function demoHead(id) {
    if (id === 6) return { key: 'demo.head6', vars: {}, cls: 'head' };
    if (id === 5) {
      const wrong = C.demoPlans(lock).find((d) => d.id === 5).plan[1][1];
      return { key: 'demo.head5', vars: { n: pad2(wrong), c: pad2(lock.numbers[1]) }, cls: 'head' };
    }
    return { key: `demo.head${id}`, vars: {}, cls: 'head' };
  }

  function renderLog() {
    const list = $('demo-log');
    list.replaceChildren();
    for (const e of app.log) {
      const vars = { ...e.vars };
      if (e.dir) vars.dir = dirName(e.dir);
      if (e.offsets) vars.list = misalignedText(e.offsets);
      list.append(el('li', e.cls || '', t(e.key, vars)));
    }
    list.scrollTop = list.scrollHeight;
  }

  function setDemoRunning(running) {
    const id = running ? app.demo.id : null;
    for (const b of document.querySelectorAll('.demo-btn')) b.classList.toggle('running', Number(b.dataset.demo) === id);
    for (const id2 of ['turn-left', 'turn-right', 'turn-key', 'close-door', 'practice-new', 'practice-load', 'review-replay']) $(id2).disabled = running;
    $('practice-default').disabled = running || !app.practice;
    $('demo-stop').disabled = !running;
  }

  // 自動実演と再生: steps は { type: 'turn', dir, moves, log }・{ type: 'key' }・{ type: 'close' } の並び。1つずつ、間を置いて動かす
  function runSequence(id, steps, onFinish) {
    app.demo = { id, steps, i: 0, done: 0, timer: null, onFinish };
    setDemoRunning(true);
    render();
    renderLog();
    app.demo.timer = setTimeout(tick, PAUSE);
  }

  function tick() {
    const d = app.demo;
    if (!d) return;
    if (d.i >= d.steps.length) {
      const finish = d.onFinish;
      if (finish) finish();
      app.demo = null;
      setDemoRunning(false);
      render();
      renderLog();
      return;
    }
    const st = d.steps[d.i];
    if (st.type === 'turn') {
      const speed = SPEEDS[$('demo-speed').value] || SPEEDS.normal;
      const n = Math.min(st.moves - d.done, speed.per);
      for (let i = 0; i < n; i++) {
        app.guide = C.updateGuide(lock, app.guide, C.reading(app.s), st.dir);
        app.s = C.step(lock, app.s, st.dir);
      }
      d.done += n;
      afterTurn(st.dir, n);
      render();
      if (d.done < st.moves) {
        d.timer = setTimeout(tick, speed.delay);
        return;
      }
      if (st.log) app.log.push(st.log);
    } else if (st.type === 'key') {
      const open = C.isOpen(lock, app.s);
      const offsets = C.offsets(lock, app.s);
      turnKey();
      app.log.push(open ? { key: 'demo.keyOpen', cls: 'ok' } : { key: 'demo.keyFail', cls: 'fail', offsets });
    } else if (st.type === 'close') {
      closeDoor();
      app.log.push({ key: 'review.close' });
    }
    renderLog();
    d.i++;
    d.done = 0;
    d.timer = setTimeout(tick, PAUSE);
  }

  function runDemo(id) {
    stopDemo();
    resetModel();
    app.s = C.demoStart(lock);
    const demo = C.demoPlans(lock).find((d) => d.id === id);
    const segs = C.runPlan(lock, app.s, demo.plan).segments;
    app.log = [demoHead(id)];
    const steps = segs.map((seg, i) => ({
      type: 'turn', dir: seg.dir, moves: seg.moves,
      log: { key: 'demo.segment', vars: { s: i + 1, moves: seg.moves, n: pad2(seg.number), k: seg.arrivals }, dir: seg.dir }
    }));
    runSequence(id, [...steps, { type: 'key' }], () => {
      const offsets = C.offsets(lock, app.s);
      const explain = { key: `demo.explain${id}`, cls: 'explain', vars: {} };
      if (id === 3) explain.vars = { need: C.pickupDistances(lock)[2], moves: segs[0].moves };
      if (id === 5) explain.vars = { d: Math.abs(offsets[1]) };
      if (id === 6) explain.vars = { left: C.leftStartNumbers(lock).map(pad2).join('-') };
      app.log.push(explain);
      // 実演のあとの操作は、実演の終わりの状態から記録する
      startRecording();
    });
  }

  // 記録した操作を、記録を始めた状態から動かして見せる（終わると、再生前と同じ状態になる）
  function runReplay() {
    if (app.demo || !app.history.some((h) => h.type === 'turn')) return;
    const history = app.history;
    const a = C.analyzeHistory(lock, app.recordStart, history, app.recordGuide);
    app.s = app.recordStart;
    app.guide = app.recordGuide;
    app.open = false;
    app.closed = null;
    app.result = null;
    app.lockTry = null;
    app.log = [{ key: 'review.replayHead', vars: { n: history.length }, cls: 'head' }];
    const steps = history.map((h, i) => {
      if (h.type !== 'turn') return { type: h.type };
      const vars = { moves: h.moves, from: pad2(a.items[i].from), to: pad2(a.items[i].to) };
      return { type: 'turn', dir: h.dir, moves: h.moves, log: { key: 'review.replayTurn', vars, dir: h.dir } };
    });
    runSequence('replay', steps, () => {
      app.history = history;
    });
    $('demo-card').scrollIntoView({ block: 'nearest' });
  }

  function stopDemo(announce) {
    const d = app.demo;
    if (!d) return;
    clearTimeout(d.timer);
    // 再生を途中で止めたときは、ここまで動かした分を記録として残す
    if (d.id === 'replay') {
      const done = d.steps.slice(0, d.i).map((st) => (st.type === 'turn' ? { type: 'turn', dir: st.dir, moves: st.moves } : { type: st.type }));
      if (d.done > 0) done.push({ type: 'turn', dir: d.steps[d.i].dir, moves: d.done });
      app.history = done;
    }
    app.demo = null;
    setDemoRunning(false);
    if (announce) {
      app.log.push({ key: 'demo.stopped', cls: 'explain' });
      renderLog();
    }
    render();
  }

  // ===== 操作（ボタンの押し続け・ドラッグ・キー） =====
  function initHold(button, dir) {
    let timer = null;
    let repeat = null;
    const stop = () => {
      clearTimeout(timer);
      clearInterval(repeat);
      timer = null;
      repeat = null;
    };
    button.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || button.disabled) return;
      stop();
      turn(dir);
      timer = setTimeout(() => {
        repeat = setInterval(() => (button.disabled ? stop() : turn(dir)), 40);
      }, 350);
    });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) button.addEventListener(ev, stop);
    window.addEventListener('blur', stop);
    // キーボード（Enter・Space）の押下は click だけが届く（detail が 0）
    button.addEventListener('click', (e) => {
      if (e.detail === 0) turn(dir);
    });
    button.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  function initDrag() {
    const dial = $('dial');
    let last = null;
    let acc = 0;
    // 文字盤の中心は viewBox（-110 -120 220 230）の原点
    const angleOf = (e) => {
      const r = dial.getBoundingClientRect();
      const cx = r.left + r.width * (110 / 220);
      const cy = r.top + r.height * (120 / 230);
      return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    };
    dial.addEventListener('pointerdown', (e) => {
      if (app.demo) return;
      dial.setPointerCapture(e.pointerId);
      last = angleOf(e);
      acc = 0;
    });
    dial.addEventListener('pointermove', (e) => {
      if (last === null) return;
      const a = angleOf(e);
      let d = a - last;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      last = a;
      acc += d;
      // 画面の角度は時計回りに増える＝右回し
      const steps = Math.trunc(acc / 3.6);
      if (steps) {
        acc -= steps * 3.6;
        turn(steps > 0 ? 'R' : 'L', Math.abs(steps));
      }
    });
    for (const ev of ['pointerup', 'pointercancel']) dial.addEventListener(ev, () => {
      last = null;
    });
    // キー操作はダイヤルにフォーカスがあるときだけ（ページ全体のキーを奪わない）
    dial.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 'R', ArrowLeft: 'L' }[e.key];
      if (!dir || app.demo) return;
      e.preventDefault();
      turn(dir, e.shiftKey ? 10 : 1);
    });
  }

  // ===== 知らせ =====
  function toast(message) {
    const box = $('toast');
    box.textContent = message;
    box.hidden = false;
    clearTimeout(app.toastTimer);
    app.toastTimer = setTimeout(() => {
      box.hidden = true;
      box.textContent = '';
    }, 3000);
  }

  // ===== 言語を切り替えたあとの描き直し =====
  function renderAll() {
    I18n.applyStaticText();
    $('toast').hidden = true;
    $('toast').textContent = '';
    globalThis.DialTheme.refresh($('btn-theme'));
    render();
    renderLog();
  }

  document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
    I18n.applyStaticText();
    globalThis.DialTheme.refresh($('btn-theme'));
    const tabs = initTabs();
    $('btn-theme').addEventListener('click', () => globalThis.DialTheme.toggle($('btn-theme')));
    $('btn-lang').addEventListener('click', () => {
      I18n.set(I18n.lang === 'ja' ? 'en' : 'ja');
      renderAll();
    });
    buildDial();
    buildWheels();
    buildLockView();
    initHold($('turn-left'), 'L');
    initHold($('turn-right'), 'R');
    initDrag();
    $('turn-key').addEventListener('click', turnKey);
    $('close-door').addEventListener('click', closeDoor);
    $('practice-new').addEventListener('click', startPractice);
    $('practice-load').addEventListener('click', () => loadPractice($('practice-seed').value));
    $('practice-seed').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loadPractice($('practice-seed').value);
    });
    $('review-replay').addEventListener('click', runReplay);
    $('practice-default').addEventListener('click', backToDefault);
    $('hide-inner').addEventListener('change', () => {
      app.hidden = $('hide-inner').checked;
      render();
    });
    $('show-inner').addEventListener('click', () => {
      app.hidden = false;
      render();
      $('hide-inner').focus();
    });
    $('reset').addEventListener('click', () => {
      stopDemo(true);
      resetModel();
      render();
      toast(t('sim.resetDone'));
    });
    for (const b of document.querySelectorAll('.demo-btn')) b.addEventListener('click', () => runDemo(Number(b.dataset.demo)));
    $('demo-stop').addEventListener('click', () => stopDemo(true));
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) $('demo-speed').value = 'fast';
    $('go-demo').addEventListener('click', () => {
      tabs.select('sim');
      $('demo-card').scrollIntoView({ block: 'start' });
      document.querySelector('.demo-btn').focus({ preventScroll: true });
    });
    render();
    globalThis.DialApp = { renderAll };
    document.documentElement.dataset.ready = 'true';
  });
})();
