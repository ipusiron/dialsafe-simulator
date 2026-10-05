import test from 'node:test';
import assert from 'node:assert/strict';
import { core } from './load.js';

const C = core();

// 模型で実際に回して確かめる（いくつかの初期状態すべてで、正規の手順のあとに開くか・ぴったり揃うか）
function simulate(numbers, rnd) {
  const lock = C.makeLock(numbers);
  const starts = [C.createState(lock, 0), C.createState(lock, 37, [0, 0, 0]), C.createState(lock, 71, [10, 50, 90]),
    ...Array.from({ length: 8 }, () => C.randomState(lock, rnd))];
  const ends = starts.map((s) => C.runPlan(lock, s, C.correctPlan(lock)).state);
  return { open: ends.every((e) => C.isOpen(lock, e)), exact: ends.every((e) => C.offsets(lock, e).every((o) => o === 0)) };
}

test('番号の差の上限は、遊び96から STEP2＝88・STEP3＝92・STEP4＝96。ぴったり揃う組は 100×88×92×96＝77,721,600通り', () => {
  assert.deepEqual(C.gapLimits(), [88, 92, 96]);
  assert.equal(C.exactCount(), 77721600);
  assert.deepEqual(C.combinationGaps(C.COMBINATION), [36, 46, 29]);
  assert.deepEqual(C.combinationGaps([10, 10, 10, 10]), [100, 100, 100]);
});

test('条件の式は、模型で回した結果と一致する（既定の番号から1つずつ動かした400組と、ランダムな1,500組）', () => {
  const rnd = C.xorshift32(42);
  const combos = [];
  for (let k = 0; k < 4; k++) {
    for (let v = 0; v < 100; v++) {
      const nums = C.COMBINATION.slice();
      nums[k] = v;
      combos.push(nums);
    }
  }
  for (let i = 0; i < 1500; i++) combos.push([0, 1, 2, 3].map(() => Math.floor(rnd() * 100)));
  for (const nums of combos) {
    const r = simulate(nums, rnd);
    assert.equal(C.isDialable(nums), r.open, `open ${nums}`);
    assert.equal(C.isExact(nums), r.exact, `exact ${nums}`);
  }
});

test('練習用の番号は、差が上限から3目盛り以上離れ、どの初期状態からでも正規の手順でぴったり開く', () => {
  const rnd = C.xorshift32(7);
  for (let i = 0; i < 300; i++) {
    const nums = C.randomCombination(rnd);
    assert.ok(C.isPracticeCombination(nums), String(nums));
    C.combinationGaps(nums).forEach((g, k) => assert.ok(g <= C.gapLimits()[k] - C.PRACTICE_MARGIN, String(nums)));
    const r = simulate(nums, rnd);
    assert.deepEqual([r.open, r.exact], [true, true], String(nums));
  }
});

test('練習用の初期状態: 指標の数字は0〜99、遊びは0〜96', () => {
  const rnd = C.xorshift32(11);
  const lock = C.makeLock();
  for (let i = 0; i < 500; i++) {
    const s = C.randomState(lock, rnd);
    assert.ok(C.reading(s) >= 0 && C.reading(s) < 100);
    for (const r of C.slack(s)) assert.ok(r >= 0 && r <= lock.play);
  }
});

test('練習用の番号でも、自動実演は①②が開き、③〜⑥は開かない（実演の始まりは、左に回して止めた1番目の番号＋6の所）', () => {
  const rnd = C.xorshift32(13);
  for (let i = 0; i < 300; i++) {
    const lock = C.makeLock(C.randomCombination(rnd));
    const start = C.demoStart(lock);
    assert.equal(C.reading(start), (lock.numbers[0] + 6) % 100);
    const opened = C.demoPlans(lock).map((d) => C.isOpen(lock, C.runPlan(lock, start, d.plan).state));
    assert.deepEqual(opened, [true, true, false, false, false, false], String(lock.numbers));
  }
});
