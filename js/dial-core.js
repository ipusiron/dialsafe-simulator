// DialSafe Simulator の計算部（DOM に依存しない通常のスクリプト。file:// でも動く）。globalThis.DialCore に置く
// 4枚座の固定ダイヤル錠を「ツクの遊び」の連鎖で模型にする。単位は目盛り（1周＝100）
// - p: 指標の下の数字を、巻き戻さずに数えた値。右（時計回り）に1目盛り回すと p−1、左（反時計回り）は p＋1（実機の目盛りは時計回りに増える）
// - ドライビングディスクは芯棒で直結し、角度は p
// - 第3・第2・第1ディスクは、駆動側（ドライビングディスク→第3→第2の順）との差 r＝（駆動側の角度）−（自分の角度）が 0〜PLAY だけ遊ぶ。
//   範囲を出ると、ツクに押されて一緒に動く。PLAY＝100−PIN_WIDTH（ツク2つの厚みのぶん、1周より短い）
(() => {
  'use strict';

  const N = 100;
  // ツクの厚みの合計（目盛り）。左始動のずれや、拾い上げまでの目盛り数はこの値で決まる
  const PIN_WIDTH = 4;
  // フェンスが落ちる許容幅（ゲートのずれが±1目盛り以内）
  const TOLERANCE = 1;
  // 正解番号（ダイヤルの表示）。右4回目→左3回目→右2回目→左1回目
  const COMBINATION = [94, 30, 84, 13];
  // 正規の手順。STEP1だけは「4回以上」（3枚を拾い切ったあとなら、何回目に止めても同じ）
  const PROCEDURE = [
    { dir: 'R', arrivals: 4, atLeast: true },
    { dir: 'L', arrivals: 3, atLeast: false },
    { dir: 'R', arrivals: 2, atLeast: false },
    { dir: 'L', arrivals: 1, atLeast: false }
  ];
  // 内部の表示: 各ディスクの（駆動側から押される）ツクを、ゲートから何目盛りの所に描くか
  const PIN_FROM_GATE = 25;

  const mod = (x) => ((x % N) + N) % N;
  // −50〜49 にそろえる（フェンスからのずれ）
  const signed = (x) => {
    const v = mod(x);
    return v >= N / 2 ? v - N : v;
  };
  const opposite = (dir) => (dir === 'R' ? 'L' : 'R');

  // 番号から、各ディスクのゲートがフェンスの真下に来る角度を逆算する。
  // 第1・第3ディスクは右で押されて止まる（r＝0）ので番号どおり。第2ディスクは左で押されて止まる（第3・第2とも r＝PLAY）ので 2×PLAY ずれる
  function makeLock(numbers = COMBINATION, { pinWidth = PIN_WIDTH, tolerance = TOLERANCE } = {}) {
    const play = N - pinWidth;
    const n = numbers.map((x) => mod(Number(x)));
    return { numbers: n, pinWidth, play, tolerance, gates: [n[0], mod(n[1] - 2 * play), n[2], n[3]] };
  }

  // 状態 { p, a: [第1, 第2, 第3ディスクの角度] }。slack は駆動側との差 [第1, 第2, 第3]（0〜PLAY）
  function createState(lock, reading = 0, slack = [lock.play, lock.play, lock.play]) {
    const p = mod(reading);
    const a3 = p - slack[2];
    const a2 = a3 - slack[1];
    const a1 = a2 - slack[0];
    return { p, a: [a1, a2, a3] };
  }

  // 1目盛り回す。駆動側から順に、遊びの範囲を出たディスクを押して動かす
  function step(lock, s, dir) {
    const p = s.p + (dir === 'L' ? 1 : -1);
    const a = s.a.slice();
    let driver = p;
    for (let k = 2; k >= 0; k--) {
      const r = driver - a[k];
      if (r > lock.play) a[k] = driver - lock.play;
      else if (r < 0) a[k] = driver;
      driver = a[k];
    }
    return { p, a };
  }

  const reading = (s) => mod(s.p);

  // 駆動側との差 [第1, 第2, 第3]
  function slack(s) {
    return [s.a[1] - s.a[0], s.a[2] - s.a[1], s.p - s.a[2]];
  }

  // ゲートがフェンスの真下からどれだけずれているか [第1, 第2, 第3, ドライビング]（−50〜49、0で揃う）
  function offsets(lock, s) {
    return [signed(s.a[0] - lock.gates[0]), signed(s.a[1] - lock.gates[1]), signed(s.a[2] - lock.gates[2]), signed(s.p - lock.gates[3])];
  }

  const isOpen = (lock, s) => offsets(lock, s).every((o) => Math.abs(o) <= lock.tolerance);

  // 手順どおりに回す: dir に回し、number が指標に来た回数が arrivals になったところで止める。止めるまでの目盛り数も返す
  function dialTo(lock, s, dir, number, arrivals) {
    let count = 0;
    let moves = 0;
    while (moves < N * (arrivals + 2)) {
      s = step(lock, s, dir);
      moves++;
      if (reading(s) === mod(number) && ++count === arrivals) return { state: s, moves };
    }
    throw new Error('dialTo: not reached');
  }

  // plan: [[dir, number, arrivals], …]。区切りごとの { dir, moves } と最後の状態
  function runPlan(lock, s, plan) {
    const segments = [];
    for (const [dir, number, arrivals] of plan) {
      const r = dialTo(lock, s, dir, number, arrivals);
      segments.push({ dir, number: mod(number), arrivals, moves: r.moves });
      s = r.state;
    }
    return { state: s, segments };
  }

  const correctPlan = (lock) => PROCEDURE.map((p, i) => [p.dir, lock.numbers[i], p.arrivals]);

  // 左で押した状態（3枚とも左側でツクが当たっている）から右へ回すとき、第3・第2・第1ディスクが動き出すまでの目盛り数
  function pickupDistances(lock) {
    return [1, 2, 3].map((k) => k * lock.play + 1);
  }

  // 左始動（左4・右3・左2・右1）で開く番号。押す側が逆になるので、ツクの厚みのぶんずれる
  function leftStartNumbers(lock) {
    const g = lock.gates;
    return [mod(g[0] + 3 * lock.play), mod(g[1]), mod(g[2] + lock.play), mod(g[3])];
  }

  // ===== 手順ガイド（取扱説明書の手順をなぞり、回数を数える。開くかどうかは模型のゲートの位置だけで決まる） =====
  // status: start（右から始める）・turning（回している）・ready（この番号で向きを変える／STEP4なら鍵を回す）・
  //         past（STEP1で4回目を過ぎた。もう一度右へ回して合わせる）・over（回し過ぎ）・restart（向きを変えた所が違う）・wrongStart（左から始めた）
  function createGuide() {
    return { step: 0, arrivals: 0, status: 'start', done: [], last: null, at: null };
  }

  // from の数字から dir に1目盛り回したときに、ガイドを進める
  function updateGuide(lock, g, fromReading, dir) {
    const to = mod(fromReading + (dir === 'L' ? 1 : -1));
    // やり直し。at は誤りが起きたステップ（向きを変える所の誤りの知らせに使う）
    const restartWith = (status, last, at = g.step) => {
      const fresh = { step: 0, arrivals: 0, status, done: [], last, at };
      return dir === 'R' ? count({ ...fresh, status: 'turning' }) : fresh;
    };
    // 現在のステップの向きに1目盛り進めたとき
    function count(cur) {
      const need = PROCEDURE[cur.step];
      const target = lock.numbers[cur.step];
      const arrivals = cur.arrivals + (to === target ? 1 : 0);
      let status = 'turning';
      if (need.atLeast) {
        if (arrivals >= need.arrivals) status = to === target ? 'ready' : 'past';
      } else if (arrivals > need.arrivals || (arrivals === need.arrivals && to !== target)) {
        status = 'over';
      } else if (arrivals === need.arrivals) {
        status = 'ready';
      }
      return { ...cur, arrivals, status, last: status === 'over' ? 'over' : cur.last };
    }

    if (g.status === 'over' || g.status === 'restart' || g.status === 'wrongStart') {
      return dir === 'R' ? restartWith('turning', g.last) : g;
    }
    if (g.status === 'start') {
      return dir === 'R' ? count({ ...g, status: 'turning' }) : { ...g, status: 'wrongStart', last: 'wrongStart' };
    }
    const need = PROCEDURE[g.step];
    if (dir === need.dir) {
      // STEP4 で番号に合わせたあと、さらに回したら回し過ぎ
      return count(g);
    }
    // 向きを変えた
    if (g.status === 'ready' && g.step < 3) {
      const done = [...g.done, { step: g.step, number: lock.numbers[g.step], arrivals: g.arrivals }];
      return count({ step: g.step + 1, arrivals: 0, status: 'turning', done, last: 'advance' });
    }
    return restartWith('restart', g.step === 3 && g.status === 'ready' ? 'movedAfterLast' : 'wrongReverse');
  }

  // ===== 自動実演（模型を実際に1目盛りずつ回す） =====
  // start: 'left'＝左に回して止めた状態（3枚とも左側でツクが当たる。シミュレーターの初期状態と同じ）
  function demoPlans(lock) {
    const [n1, n2, n3, n4] = lock.numbers;
    return [
      { id: 1, plan: [['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]] },
      { id: 2, plan: [['R', n1, 5], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]] },
      { id: 3, plan: [['R', n1, 3], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]] },
      { id: 4, plan: [['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 2]] },
      { id: 5, plan: [['R', n1, 4], ['L', mod(n2 + 20), 3], ['R', n3, 2], ['L', n4, 1]] }
    ];
  }

  // ===== 内部の表示（フェンスを中央に置いた横の帯の上の位置。−50〜49） =====
  // 各ディスクの前のツク（駆動側に押される）はゲートから PIN_FROM_GATE の所。
  // 駆動側の後ろのツクは、差 r＝0 のとき前のツクの PIN_WIDTH/2 先、r＝PLAY のとき反対側の PIN_WIDTH/2 先に来る位置に置く
  function view(lock, s) {
    const off = offsets(lock, s);
    const sl = slack(s);
    const half = lock.pinWidth / 2;
    // [第1, 第2, 第3, ドライビング]
    const front = off.map((o) => signed(o + PIN_FROM_GATE));
    const back = [null, front[0] + half, front[1] + half, front[2] + half].map((x, k) => (x === null ? null : signed(x + sl[k - 1])));
    // 押されているディスク（r が 0＝右回しで押された、PLAY＝左回しで押された）
    const contact = sl.map((r) => (r === 0 ? 'R' : r === lock.play ? 'L' : null));
    return [0, 1, 2, 3].map((k) => ({
      gate: off[k],
      frontPin: k < 3 ? front[k] : null,
      backPin: back[k],
      contact: k < 3 ? contact[k] : null,
      aligned: Math.abs(off[k]) <= lock.tolerance
    }));
  }

  // 乱数（決まった種。テストと README の表で使う）
  function xorshift32(seed) {
    let x = seed >>> 0 || 1;
    return () => {
      x ^= x << 13;
      x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
      return x / 4294967296;
    };
  }

  globalThis.DialCore = {
    N, PIN_WIDTH, TOLERANCE, COMBINATION, PROCEDURE, PIN_FROM_GATE,
    mod, signed, opposite, makeLock, createState, step, reading, slack, offsets, isOpen, dialTo, runPlan, correctPlan,
    pickupDistances, leftStartNumbers, createGuide, updateGuide, demoPlans, view, xorshift32
  };
})();
