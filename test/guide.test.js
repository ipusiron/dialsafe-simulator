import test from 'node:test';
import assert from 'node:assert/strict';
import { core } from './load.js';

const C = core();
const lock = C.makeLock();
const [n1, n2, n3, n4] = C.COMBINATION;

// 模型とガイドを1目盛りずつ一緒に進める。plan: [[dir, number, arrivals], …]（number が指標に来た回数で止める）
function drive(plan, start = C.createState(lock), guide = C.createGuide()) {
  let s = start;
  let g = guide;
  const statuses = [];
  for (const [dir, number, arrivals] of plan) {
    let count = 0;
    while (count < arrivals) {
      g = C.updateGuide(lock, g, C.reading(s), dir);
      s = C.step(lock, s, dir);
      if (C.reading(s) === number) count++;
    }
    statuses.push([g.step, g.status, g.arrivals]);
  }
  return { s, g, statuses };
}

// 1目盛りだけ回す
const nudge = (r, dir) => {
  const g = C.updateGuide(lock, r.g, C.reading(r.s), dir);
  return { s: C.step(lock, r.s, dir), g };
};

test('正規の手順: 各段で番号に合わせると ready、向きを変えると次の段へ進む。最後は STEP4 で ready（鍵を回す）', () => {
  const r = drive([['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]]);
  assert.deepEqual(r.statuses, [[0, 'ready', 4], [1, 'ready', 3], [2, 'ready', 2], [3, 'ready', 1]]);
  assert.deepEqual(r.g.done.map((d) => [d.step, d.number, d.arrivals]), [[0, 94, 4], [1, 30, 3], [2, 84, 2]]);
  assert.equal(C.isOpen(lock, r.s), true);
});

test('STEP1は4回以上。4回目を過ぎたら past（もう一度右へ回して合わせる）、5回目でも ready', () => {
  const r = drive([['R', n1, 4]]);
  const past = nudge(r, 'R');
  assert.equal(past.g.status, 'past');
  const r5 = drive([['R', n1, 5]]);
  assert.deepEqual(r5.statuses, [[0, 'ready', 5]]);
});

test('STEP2〜4で番号を通り過ぎたら over（回し過ぎ）。その後に右へ回すと、STEP1からやり直しになる', () => {
  const r = drive([['R', n1, 4], ['L', n2, 3]]);
  const over = nudge(r, 'L');
  assert.equal(over.g.status, 'over');
  assert.equal(nudge(over, 'L').g.status, 'over');
  const again = nudge(over, 'R');
  assert.deepEqual([again.g.step, again.g.status], [0, 'turning']);
  const last = drive([['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]]);
  assert.equal(nudge(last, 'L').g.status, 'over');
  const moved = nudge(last, 'R');
  assert.deepEqual([moved.g.step, moved.g.status, moved.g.last], [0, 'turning', 'movedAfterLast']);
});

test('番号に合っていない所や回数が違う所で向きを変えると、やり直し（restart）', () => {
  const r3 = drive([['R', n1, 3]]);
  const rev = nudge(r3, 'L');
  assert.deepEqual([rev.g.step, rev.g.status, rev.g.last], [0, 'restart', 'wrongReverse']);
  const step2 = drive([['R', n1, 4], ['L', n2, 2]]);
  const rev2 = nudge(step2, 'R');
  assert.deepEqual([rev2.g.step, rev2.g.status, rev2.g.last], [0, 'turning', 'wrongReverse']);
});

test('左から始めると wrongStart。右へ回せば STEP1 を数え始める', () => {
  const g = C.updateGuide(lock, C.createGuide(), 0, 'L');
  assert.equal(g.status, 'wrongStart');
  const g2 = C.updateGuide(lock, g, 1, 'R');
  assert.deepEqual([g2.step, g2.status, g2.arrivals], [0, 'turning', 0]);
});

test('ガイドの数え方は取扱説明書と同じ: 番号が指標に来た回数を数え、0の通過は数えない', () => {
  // 93 から右へ 0 まで回す: 0 は指標に来るが、1番目の番号 94 は来ない
  const r = drive([['R', 0, 1]], C.createState(lock, 93));
  assert.equal(r.g.arrivals, 0);
  const r2 = drive([['R', n1, 2]]);
  assert.deepEqual([r2.g.status, r2.g.arrivals], ['turning', 2]);
});
