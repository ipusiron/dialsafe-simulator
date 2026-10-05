import test from 'node:test';
import assert from 'node:assert/strict';
import { core } from './load.js';

const C = core();
const lock = C.makeLock();
const [n1, n2, n3, n4] = lock.numbers;

// plan を1目盛りずつ記録する（画面と同じく appendMove でまとめる）
function record(plan, start = C.createState(lock), history = []) {
  let h = history;
  for (const seg of C.runPlan(lock, start, plan).segments) for (let i = 0; i < seg.moves; i++) h = C.appendMove(h, seg.dir);
  return h;
}

test('記録は同じ向きの目盛りを1つにまとめ、向きが変わるか鍵・閉めるが入ると区切る', () => {
  let h = [];
  for (const d of ['R', 'R', 'R', 'L', 'L', 'R']) h = C.appendMove(h, d);
  assert.deepEqual(h, [{ type: 'turn', dir: 'R', moves: 3 }, { type: 'turn', dir: 'L', moves: 2 }, { type: 'turn', dir: 'R', moves: 1 }]);
  h = C.appendMove([...h, { type: 'key' }], 'R', 10);
  assert.deepEqual(h.slice(-2), [{ type: 'key' }, { type: 'turn', dir: 'R', moves: 10 }]);
});

test('正規の手順の振り返り: 各区切りでガイドが ready。右4回目は3枚とも、左3回目は第3・第2だけ、右2回目は第3だけを動かす', () => {
  const start = C.createState(lock);
  const r = C.analyzeHistory(lock, start, [...record([['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]]), { type: 'key' }]);
  const turns = r.items.filter((x) => x.type === 'turn');
  assert.deepEqual(turns.map((x) => [x.dir, x.moves, x.from, x.to, x.step, x.status]),
    [['R', 306, 0, 94, 0, 'ready'], ['L', 236, 94, 30, 1, 'ready'], ['R', 146, 30, 84, 2, 'ready'], ['L', 29, 84, 13, 3, 'ready']]);
  assert.deepEqual(turns.map((x) => x.moved.map((m) => m > 0)),
    [[true, true, true], [false, true, true], [false, false, true], [false, false, false]]);
  assert.deepEqual(r.items[4], { type: 'key', open: true, offsets: [0, 0, 0, 0], blame: [null, null, null, null] });
});

test('開かなかったときは、ずれたディスクを最後に動かした区切りを返す（STEP2の回し過ぎ→第1ディスクは2番目の区切り）', () => {
  const start = C.createState(lock);
  const over = C.analyzeHistory(lock, start, [...record([['R', n1, 4], ['L', n2, 4], ['R', n3, 2], ['L', n4, 1]]), { type: 'key' }]);
  assert.deepEqual(over.items[1].status, 'over');
  assert.deepEqual(over.items[4], { type: 'key', open: false, offsets: [48, 0, 0, 0], blame: [1, null, null, null] });
  const last = C.analyzeHistory(lock, start, [...record([['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 2]]), { type: 'key' }]);
  assert.deepEqual([last.items[4].offsets, last.items[4].blame], [[0, 0, 33, 0], [null, null, 3, null]]);
  // 一度も動かしていないディスクがずれていれば null（初期の位置のまま）、ドライビングディスクは最後に回した区切り。
  // 初期状態は左回しの側でツクが当たっているので、右へ5目盛りは遊びの中（3枚とも動かない）
  const none = C.analyzeHistory(lock, start, [{ type: 'turn', dir: 'R', moves: 5 }, { type: 'key' }]);
  assert.deepEqual(none.items[1].blame, [null, null, null, 0]);
});

test('閉めたあとは手順ガイドを初めからにし、崩さずに鍵を回すと開く。振り返りの最後の状態は、1目盛りずつ回した状態と同じ', () => {
  const start = C.createState(lock);
  const h = [...record([['R', n1, 4], ['L', n2, 3], ['R', n3, 2], ['L', n4, 1]]), { type: 'key' }, { type: 'close' }, { type: 'key' }];
  const r = C.analyzeHistory(lock, start, h);
  assert.deepEqual([r.items[5].type, r.items[6].open], ['close', true]);
  const scrambled = C.analyzeHistory(lock, start, [...h, { type: 'close' }, { type: 'turn', dir: 'R', moves: 400 }, { type: 'key' }]);
  assert.deepEqual([scrambled.guide.step, scrambled.items[9].open], [0, false]);
  let s = start;
  for (const x of h) if (x.type === 'turn') for (let i = 0; i < x.moves; i++) s = C.step(lock, s, x.dir);
  assert.deepEqual(r.state, s);
});

test('フェンスの窓: ゲートが±12目盛りの内ならずれ、外なら null。爪は上（ドライビングディスク）から落ち、最初に止まるディスクを返す', () => {
  const ok = C.runPlan(lock, C.createState(lock), C.correctPlan(lock)).state;
  assert.equal(C.fenceStop(lock, ok), null);
  assert.ok(C.fenceWindow(lock, ok).every((w) => w.offset === 0 && w.aligned));
  const over = C.runPlan(lock, C.createState(lock), [['R', n1, 4], ['L', n2, 4], ['R', n3, 2], ['L', n4, 1]]).state;
  assert.equal(C.fenceStop(lock, over), 0);
  assert.deepEqual(C.fenceWindow(lock, over).map((w) => w.offset), [null, 0, 0, 0]);
  const start = C.createState(lock);
  assert.deepEqual(C.offsets(lock, start), [18, -30, 20, -13]);
  assert.deepEqual(C.fenceWindow(lock, start).map((w) => w.offset), [null, null, null, null]);
  assert.equal(C.fenceStop(lock, start), 3);
});

test('問題番号: 同じ番号なら同じ番号カードと初期状態。問題番号1は固定。どの番号でも練習の条件を満たし、正規の手順で開く', () => {
  assert.equal(C.PRACTICE_MAX_SEED, 999999);
  assert.deepEqual(C.practiceFromSeed(42), C.practiceFromSeed(42));
  assert.notDeepEqual(C.practiceFromSeed(1).numbers, C.practiceFromSeed(2).numbers);
  assert.deepEqual(C.practiceFromSeed(1).numbers, [6, 77, 58, 33]);
  for (let seed = 1; seed <= 300; seed++) {
    const p = C.practiceFromSeed(seed);
    assert.ok(C.isPracticeCombination(p.numbers), String(seed));
    const l = C.makeLock(p.numbers);
    assert.equal(C.isOpen(l, C.runPlan(l, p.state, C.correctPlan(l)).state), true, String(seed));
  }
});
