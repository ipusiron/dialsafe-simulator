import test from 'node:test';
import assert from 'node:assert/strict';
import { core } from './load.js';

const C = core();
const lock = C.makeLock();

// 参照実装（別に書いた ref_model.mjs）と同じ種・同じ作り方で、ランダムな初期状態を2,000通り作る
function randomStarts(count = 2000, seed = 20261005) {
  const rnd = C.xorshift32(seed);
  return Array.from({ length: count }, () => {
    const reading = Math.floor(rnd() * 100);
    const [r3, r2, r1] = [0, 1, 2].map(() => Math.floor(rnd() * (lock.play + 1)));
    return C.createState(lock, reading, [r1, r2, r3]);
  });
}
const STARTS = randomStarts();
const opened = (plan, starts = STARTS) => starts.filter((s) => C.isOpen(lock, C.runPlan(lock, s, plan).state)).length;
const [n1, n2, n3, n4] = C.COMBINATION;
const R4 = ['R', n1, 4];
const L3 = ['L', n2, 3];
const R2 = ['R', n3, 2];
const L1 = ['L', n4, 1];

test('ゲートの位置は番号から逆算する（第2ディスクだけ左で押して止めるので 2×遊び ずれる）', () => {
  assert.deepEqual([lock.play, lock.pinWidth, lock.tolerance], [96, 4, 1]);
  assert.deepEqual(lock.gates, [94, 38, 84, 13]);
  assert.deepEqual(lock.numbers, [94, 30, 84, 13]);
});

test('1目盛りずつ回しても、遊び（駆動側との差）はいつも 0〜96 に収まり、ドライビングディスクは指標の数字と同じ', () => {
  const rnd = C.xorshift32(7);
  let s = C.createState(lock, 0);
  for (let i = 0; i < 20000; i++) {
    s = C.step(lock, s, rnd() < 0.5 ? 'R' : 'L');
    for (const r of C.slack(s)) assert.ok(r >= 0 && r <= lock.play, String(r));
    assert.equal(C.offsets(lock, s)[3], C.signed(C.reading(s) - n4));
  }
});

test('右（時計回り）に回すと指標の下の数字は減り、左に回すと増える（実機の目盛りは時計回りに増える）', () => {
  const s = C.createState(lock, 0);
  assert.equal(C.reading(C.step(lock, s, 'R')), 99);
  assert.equal(C.reading(C.step(lock, s, 'L')), 1);
});

// 期待値は参照実装 ref/day050/ref_check_output.txt（2,000通り、種 20261005）
test('正規の手順（右4・左3・右2・左1）は、どの初期状態からでも開く。右に多く回しても開く', () => {
  assert.equal(opened([R4, L3, R2, L1]), 2000);
  assert.equal(opened([['R', n1, 5], L3, R2, L1]), 2000);
  assert.equal(opened([['R', n1, 10], L3, R2, L1]), 2000);
});

test('右3回で始めると開かないことがある（2,000通りのうち60通り）。直前に右へ回していれば、右1回でも開く', () => {
  assert.equal(opened([['R', n1, 3], L3, R2, L1]), 1940);
  const scrambled = STARTS.map((s) => C.runPlan(lock, s, [['R', C.reading(s), 5]]).state);
  assert.equal(opened([['R', n1, 3], L3, R2, L1], scrambled), 2000);
  assert.equal(opened([['R', n1, 1], L3, R2, L1], scrambled), 2000);
});

test('回し過ぎ・回し不足・番号違い（2目盛り以上）は開かない。1目盛りのずれは許容幅の内', () => {
  for (const plan of [
    [R4, ['L', n2, 4], R2, L1], [R4, ['L', n2, 2], R2, L1], [R4, L3, ['R', n3, 3], L1], [R4, L3, ['R', n3, 1], L1],
    [R4, L3, R2, ['L', n4, 2]], [R4, ['L', 50, 3], R2, L1], [R4, ['L', n2 + 2, 3], R2, L1]
  ]) assert.equal(opened(plan), 0, JSON.stringify(plan));
  assert.equal(opened([R4, ['L', n2 + 1, 3], R2, L1]), 2000);
});

test('左始動は同じ番号では開かず、ツクの厚みのぶんずらした番号（82-38-80-13）なら開く', () => {
  assert.equal(opened([['L', n1, 4], ['R', n2, 3], ['L', n3, 2], ['R', n4, 1]]), 0);
  const left = C.leftStartNumbers(lock);
  assert.deepEqual(left, [82, 38, 80, 13]);
  assert.equal(opened([['L', left[0], 4], ['R', left[1], 3], ['L', left[2], 2], ['R', left[3], 1]]), 2000);
});

test('左で止めた状態から右へ回すと、第3・第2・第1ディスクは97・193・289目盛りで動き出す', () => {
  assert.deepEqual(C.pickupDistances(lock), [97, 193, 289]);
  let s = C.createState(lock, 50);
  const start = s.a.slice();
  const moved = [null, null, null];
  for (let t = 1; t <= 400; t++) {
    s = C.step(lock, s, 'R');
    s.a.forEach((a, k) => {
      if (moved[k] === null && a !== start[k]) moved[k] = t;
    });
  }
  assert.deepEqual(moved.reverse(), [97, 193, 289]);
});

test('開くかどうかは許容幅（±1）で決まり、ずれは −50〜49 で返す', () => {
  const s = C.runPlan(lock, C.createState(lock), [R4, L3, R2, L1]).state;
  assert.deepEqual(C.offsets(lock, s), [0, 0, 0, 0]);
  assert.equal(C.isOpen(lock, s), true);
  const off = C.offsets(lock, C.step(lock, C.step(lock, s, 'L'), 'L'));
  assert.equal(off[3], 2);
  assert.deepEqual([C.signed(50), C.signed(49), C.signed(-51)], [-50, 49, 49]);
});

test('初期状態は「左に回して止めた状態」（3枚とも左側でツクが当たる）。ゲートは揃っていない', () => {
  const s = C.createState(lock);
  assert.deepEqual(C.slack(s), [96, 96, 96]);
  assert.deepEqual(C.offsets(lock, s), [18, -30, 20, -13]);
  assert.equal(C.isOpen(lock, s), false);
});

test('内部の表示: 押されているディスクでは、駆動側の後ろのツクが自分の前のツクから2目盛り（ツクの厚みの半分）の所に並ぶ', () => {
  const right = C.runPlan(lock, C.createState(lock), [['R', 50, 4]]).state;
  const v = C.view(lock, right);
  for (const k of [0, 1, 2]) {
    assert.equal(v[k].contact, 'R');
    assert.equal(C.signed(v[k + 1].backPin - v[k].frontPin), 2);
  }
  const left = C.view(lock, C.createState(lock));
  for (const k of [0, 1, 2]) {
    assert.equal(left[k].contact, 'L');
    assert.equal(C.signed(left[k + 1].backPin - left[k].frontPin), -2);
  }
  assert.deepEqual([v[0].backPin, v[3].frontPin, v[3].contact], [null, null, null]);
});
