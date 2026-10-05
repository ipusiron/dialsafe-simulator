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

  const lock = C.makeLock();
  const app = { s: C.createState(lock), guide: C.createGuide(), open: false, result: null, demo: null, log: [], toastTimer: null };

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
    app.result = null;
    render();
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
    if (C.isOpen(lock, app.s)) {
      app.open = true;
      app.result = { ok: true };
    } else {
      app.result = { ok: false, offsets: C.offsets(lock, app.s) };
    }
    render();
  }

  function resetModel() {
    app.s = C.createState(lock);
    app.guide = C.createGuide();
    app.open = false;
    app.result = null;
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

  // ===== 結果（鍵を回したとき） =====
  function renderResult() {
    const box = $('result');
    const r = app.result;
    box.hidden = !r;
    if (!r) return;
    box.textContent = r.ok ? t('sim.open') : t('sim.notOpen', { list: misalignedText(r.offsets) });
    box.classList.toggle('ok', r.ok);
  }

  function render() {
    renderDial();
    renderGuide();
    renderWheels();
    renderResult();
  }

  // ===== 自動実演（模型を1目盛りずつ回す） =====
  function demoHead(id) {
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

  function setDemoRunning(id) {
    const running = id !== null;
    for (const b of document.querySelectorAll('.demo-btn')) b.classList.toggle('running', Number(b.dataset.demo) === id);
    for (const id2 of ['turn-left', 'turn-right', 'turn-key']) $(id2).disabled = running;
    $('demo-stop').disabled = !running;
  }

  function runDemo(id) {
    stopDemo();
    resetModel();
    const demo = C.demoPlans(lock).find((d) => d.id === id);
    const segs = C.runPlan(lock, app.s, demo.plan).segments;
    app.log = [demoHead(id)];
    app.demo = { id, segs, seg: 0, done: 0, timer: null };
    setDemoRunning(id);
    render();
    renderLog();
    app.demo.timer = setTimeout(tick, PAUSE);
  }

  function tick() {
    const d = app.demo;
    if (!d) return;
    const speed = SPEEDS[$('demo-speed').value] || SPEEDS.normal;
    const seg = d.segs[d.seg];
    const n = Math.min(seg.moves - d.done, speed.per);
    for (let i = 0; i < n; i++) {
      app.guide = C.updateGuide(lock, app.guide, C.reading(app.s), seg.dir);
      app.s = C.step(lock, app.s, seg.dir);
    }
    d.done += n;
    render();
    if (d.done < seg.moves) {
      d.timer = setTimeout(tick, speed.delay);
      return;
    }
    app.log.push({ key: 'demo.segment', vars: { moves: seg.moves, n: pad2(seg.number), k: seg.arrivals }, dir: seg.dir });
    renderLog();
    d.seg++;
    d.done = 0;
    d.timer = setTimeout(d.seg < d.segs.length ? tick : finishDemo, PAUSE);
  }

  function finishDemo() {
    const d = app.demo;
    if (!d) return;
    const open = C.isOpen(lock, app.s);
    const offsets = C.offsets(lock, app.s);
    turnKey();
    app.log.push(open ? { key: 'demo.keyOpen', cls: 'ok' } : { key: 'demo.keyFail', cls: 'fail', offsets });
    const explain = { key: `demo.explain${d.id}`, cls: 'explain', vars: {} };
    if (d.id === 3) explain.vars = { need: C.pickupDistances(lock)[2], moves: d.segs[0].moves };
    if (d.id === 5) explain.vars = { d: Math.abs(offsets[1]) };
    app.log.push(explain);
    renderLog();
    app.demo = null;
    setDemoRunning(null);
  }

  function stopDemo(announce) {
    if (!app.demo) return;
    clearTimeout(app.demo.timer);
    app.demo = null;
    setDemoRunning(null);
    if (announce) {
      app.log.push({ key: 'demo.stopped', cls: 'explain' });
      renderLog();
    }
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
    initHold($('turn-left'), 'L');
    initHold($('turn-right'), 'R');
    initDrag();
    $('turn-key').addEventListener('click', turnKey);
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
