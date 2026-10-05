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

  // ===== 番号の条件（正規の手順で、先に合わせたディスクに触れずに開くか） =====
  // 差は1〜100で数える（同じ番号なら1周後の100）。STEP2〜4で回す量は差＋（必要な回数−1）周なので、
  // 先に合わせたディスクを拾う手前（遊び×枚数）に収まる差の上限が決まる: STEP2＝3×遊び−200、STEP3＝2×遊び−100、STEP4＝遊び
  const gap = (x) => mod(x) || N;
  function combinationGaps(numbers) {
    const [n1, n2, n3, n4] = numbers;
    return [gap(n2 - n1), gap(n2 - n3), gap(n4 - n3)];
  }
  function gapLimits(pinWidth = PIN_WIDTH) {
    const play = N - pinWidth;
    return [3 * play - 2 * N, 2 * play - N, play];
  }
  // ゲートがずれずに（ぴったり）揃う番号
  const isExact = (numbers, pinWidth = PIN_WIDTH) => combinationGaps(numbers).every((g, i) => g <= gapLimits(pinWidth)[i]);
  // 許容幅の内で開く番号（上限を許容幅だけ越えても、引きずりは許容幅に収まる）
  const isDialable = (numbers, { pinWidth = PIN_WIDTH, tolerance = TOLERANCE } = {}) =>
    combinationGaps(numbers).every((g, i) => g <= gapLimits(pinWidth)[i] + tolerance);
  // ぴったり揃う組み合わせの数（1番目は100通り、2〜4番目は上限の数だけ）
  const exactCount = (pinWidth = PIN_WIDTH) => gapLimits(pinWidth).reduce((n, limit) => n * limit, N);

  // 練習用の番号は、差が上限から PRACTICE_MARGIN 目盛り以上離れたものに限る。
  // 上限ぎりぎりの番号は、回す量のわずかな違いで先に合わせたディスクを拾う（例: 差が87〜89だと、右3回で拾い損ねた第1ディスクを
  // STEP2の左回しがたまたま揃う位置まで押してしまう）
  const PRACTICE_MARGIN = 3;
  const isPracticeCombination = (numbers, pinWidth = PIN_WIDTH) =>
    combinationGaps(numbers).every((g, i) => g <= gapLimits(pinWidth)[i] - PRACTICE_MARGIN);

  // 練習用の番号を、rnd（0以上1未満を返す関数）で選ぶ
  function randomCombination(rnd, pinWidth = PIN_WIDTH) {
    for (;;) {
      const numbers = [0, 1, 2, 3].map(() => Math.floor(rnd() * N));
      if (isPracticeCombination(numbers, pinWidth)) return numbers;
    }
  }

  // 練習用: 指標の数字と、3枚の遊び（0〜遊び）をランダムに選んだ初期状態
  function randomState(lock, rnd) {
    const reading = Math.floor(rnd() * N);
    return createState(lock, reading, [0, 1, 2].map(() => Math.floor(rnd() * (lock.play + 1))));
  }

  // ===== 練習の問題番号（同じ番号なら、同じ番号カードと同じ初期状態になる） =====
  const PRACTICE_MAX_SEED = 999999;

  // 問題番号から決まる乱数（番号をかき混ぜてから xorshift32）
  function seededRandom(seed) {
    const next = xorshift32((Math.imul(Number(seed) >>> 0, 2654435761) ^ 0x5bd1e995) >>> 0 || 1);
    for (let i = 0; i < 4; i++) next();
    return next;
  }

  function practiceFromSeed(seed) {
    const rnd = seededRandom(seed);
    const numbers = randomCombination(rnd);
    return { numbers, state: randomState(makeLock(numbers), rnd) };
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
  // 始まりは、左に回して止めた状態（3枚とも左側でツクが当たる）で、指標が1番目の番号＋6の所。
  // 既定の番号では指標0＝シミュレーターの初期状態と同じ。どの番号でも、③右3回は第1ディスクを拾い切れない（206目盛り＜289）
  const demoStart = (lock) => createState(lock, lock.numbers[0] + 6);

  function demoPlans(lock) {
    const [n1, n2, n3, n4] = lock.numbers;
    return [
      { id: 1, plan: [['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]] },
      { id: 2, plan: [['R', n1, 5], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]] },
      { id: 3, plan: [['R', n1, 3], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]] },
      { id: 4, plan: [['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 2]] },
      { id: 5, plan: [['R', n1, 4], ['L', mod(n2 + 20), 3], ['R', n3, 2], ['L', n4, 1]] },
      { id: 6, plan: [['L', n1, 4], ['R', n2, 3], ['L', n3, 2], ['R', n4, 1]] }
    ];
  }

  // ===== 操作の記録と振り返り =====
  // 記録は { type: 'turn', dir, moves }（同じ向きに続けて回した目盛りを1つにまとめる）・{ type: 'key' }・{ type: 'close' } の並び
  function appendMove(history, dir, count = 1) {
    const last = history[history.length - 1];
    if (last && last.type === 'turn' && last.dir === dir) return [...history.slice(0, -1), { ...last, moves: last.moves + count }];
    return [...history, { type: 'turn', dir, moves: count }];
  }

  // 記録を、記録を始めたときの状態から模型で回し直す。回した区切りごとに、指標の数字（前→後）・各ディスクが動いた目盛り数・
  // 区切りの終わりの手順ガイドを返す。鍵を回したときは、開いたか・ずれ・ずれたディスクを最後に動かした区切り（なければ null）を返す。
  // guide は記録を始めたときの手順ガイド（自動実演のあとなど、途中から記録するとき）
  function analyzeHistory(lock, start, history, guide = createGuide()) {
    let s = start;
    let g = guide;
    const lastMoved = [null, null, null];
    const items = history.map((h, index) => {
      if (h.type === 'close') {
        g = createGuide();
        return { type: 'close' };
      }
      if (h.type === 'key') {
        const off = offsets(lock, s);
        const blame = off.map((o, k) => (Math.abs(o) <= lock.tolerance ? null : k < 3 ? lastMoved[k] : lastTurn(index)));
        return { type: 'key', open: isOpen(lock, s), offsets: off, blame };
      }
      const before = s.a.slice();
      const from = reading(s);
      for (let i = 0; i < h.moves; i++) {
        g = updateGuide(lock, g, reading(s), h.dir);
        s = step(lock, s, h.dir);
      }
      const moved = s.a.map((a, k) => Math.abs(a - before[k]));
      moved.forEach((m, k) => {
        if (m) lastMoved[k] = index;
      });
      return { type: 'turn', dir: h.dir, moves: h.moves, from, to: reading(s), moved, step: g.step, status: g.status, arrivals: g.arrivals };
    });
    // ドライビングディスクは、最後に回した区切りで位置が決まる
    function lastTurn(before) {
      for (let i = before - 1; i >= 0; i--) if (history[i].type === 'turn') return i;
      return null;
    }
    return { items, state: s, guide: g };
  }

  // ===== フェンスの真下の窓（鍵を回したときに、フェンスの爪が4枚のゲートを通れるか） =====
  // 各ディスクのゲートが、フェンスから±half 目盛りの窓に入っていれば、その位置（ずれ）。窓の外なら null。並びは offsets と同じ
  function fenceWindow(lock, s, half = 12) {
    return offsets(lock, s).map((o) => ({ offset: Math.abs(o) <= half ? o : null, aligned: Math.abs(o) <= lock.tolerance }));
  }

  // フェンスの爪が上から順に（ドライビングディスク→第3→第2→第1）落ちるとき、最初に止まるディスク。すべて通れば null
  function fenceStop(lock, s) {
    const off = offsets(lock, s);
    const k = [3, 2, 1, 0].find((i) => Math.abs(off[i]) > lock.tolerance);
    return k === undefined ? null : k;
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
    pickupDistances, leftStartNumbers, createGuide, updateGuide, demoPlans, view, xorshift32,
    combinationGaps, gapLimits, isExact, isDialable, exactCount, PRACTICE_MARGIN, isPracticeCombination, randomCombination, randomState,
    demoStart, PRACTICE_MAX_SEED, seededRandom, practiceFromSeed, appendMove, analyzeHistory, fenceWindow, fenceStop
  };
})();
