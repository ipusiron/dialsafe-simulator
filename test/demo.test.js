import test from 'node:test';
import assert from 'node:assert/strict';
import { core } from './load.js';

const C = core();
const lock = C.makeLock();

// 自動実演は、左に回して止めた状態（既定の番号ではシミュレーターの初期状態と同じ）から模型を実際に回す
const results = Object.fromEntries(C.demoPlans(lock).map((d) => {
  const r = C.runPlan(lock, C.demoStart(lock), d.plan);
  return [d.id, { open: C.isOpen(lock, r.state), offsets: C.offsets(lock, r.state), segments: r.segments }];
}));

test('実演①正確・②右5回は開き、③右3回・④最終ステップの回し過ぎ・⑤番号違い・⑥左始動は開かない', () => {
  assert.deepEqual(Object.values(results).map((r) => r.open), [true, true, false, false, false, false]);
  assert.deepEqual(C.demoStart(lock), C.createState(lock));
});

test('開かない実演では、ずれるディスクが手順の説明どおり', () => {
  // ③右3回では第1ディスクを拾い切れない（右へ289目盛り回す前に止めた）
  assert.deepEqual(results[3].offsets, [48, 0, 0, 0]);
  assert.ok(results[3].segments[0].moves < C.pickupDistances(lock)[2]);
  // ④最後に左へ2回まわすと、ドライビングディスクが第3ディスクを拾って動かす
  assert.deepEqual(results[4].offsets, [0, 0, 33, 0]);
  // ⑤STEP2を20ずらすと、第2ディスクのゲートが20ずれる
  assert.deepEqual(results[5].offsets, [0, 20, 0, 0]);
  // ⑥左から始めると、押す側が逆になり、ツクの厚み（4）のぶんずれる（第1＋12・第2−8・第3＋4）
  assert.deepEqual(results[6].offsets, [12, -8, 4, 0]);
});

test('実演①の各段の目盛り数（右306・左236・右146・左29）。正規の手順では STEP4 は1回転以内', () => {
  assert.deepEqual(results[1].segments.map((x) => [x.dir, x.number, x.arrivals, x.moves]),
    [['R', 94, 4, 306], ['L', 30, 3, 236], ['R', 84, 2, 146], ['L', 13, 1, 29]]);
  assert.ok(results[1].segments[3].moves < 100);
});
