import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { read, core } from './load.js';

const C = core();
const lock = C.makeLock();
const ROOT = fileURLToPath(new URL('..', import.meta.url));

const DOCS = {
  ja: {
    file: 'README.md', switcher: '[English](README.en.md) · 日本語', day: '**Day050 - 生成AIで作るセキュリティツール100**',
    shots: /^assets\/screenshot\d*\.png$/,
    sec: { model: '🔬 模型の仕組みと検算', tree: '📁 ディレクトリー構造', about: '🛠️ このツールについて' },
    head: '操作',
    claims: ['97・193・289目盛り', '82-38-80-13', '2,000通り', '0〜96目盛り', '±1目盛り', '94-30-84-13', '3.0%', 'ツクの厚み4',
      'STEP2は88（3×96−200）、STEP3は92（2×96−100）、STEP4は96', '100×88×92×96＝77,721,600通り', '約78%', '（89・93・97）',
      '3目盛り以上の余裕', '目盛り数は36・46・29', '1,900組'],
    forbidden: /チャレンジ|ドラッグ操作は無効|AUTO_UNLOCK|自動開錠|100万通り（100⁴）|ブラウザ(?!ー)|内部ディスクの番号|10 - 40 - 70 - 20|将来の改善/
  },
  en: {
    file: 'README.en.md', switcher: 'English · [日本語](README.md)', day: '**Day050 - 100 Security Tools with Generative AI**',
    shots: /^assets\/en\/screenshot\d*\.png$/,
    sec: { model: '🔬 How the model works and how it was checked', tree: '📁 Directory structure', about: '🛠️ About this tool' },
    head: 'Dialing',
    claims: ['97, 193 and 289 graduations', '82-38-80-13', '2,000 random initial states', '0–96 graduations', '±1 graduation', '94-30-84-13', '3.0%',
      'pin thickness 4', '88 in STEP2 (3×96−200), 92 in STEP3 (2×96−100) and 96 in STEP4', '100×88×92×96 = 77,721,600 combinations', 'about 78%',
      '(89, 93, 97)', 'at least 3 graduations of margin', 'has 36, 46 and 29 graduations', '1,900 combinations'],
    forbidden: /Challenge|CHALLENGE|AUTO_UNLOCK|Auto Unlock|1 million|Future Improvements|Drive Cam/
  }
};
for (const d of Object.values(DOCS)) d.text = read(d.file);

function section(text, heading) {
  const i = text.indexOf(`\n## ${heading}`);
  assert.ok(i >= 0, heading);
  const rest = text.slice(i + 1);
  const end = rest.indexOf('\n## ', 3);
  return end < 0 ? rest : rest.slice(0, end);
}

function table(text, firstHeader) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith(`| ${firstHeader} |`));
  assert.ok(start >= 0, firstHeader);
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].startsWith('|'); i++) rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
  return rows;
}

const noCode = (md) => md.replace(/```[\s\S]*?```/g, '');
const h2 = (md) => noCode(md).split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3));
const headings = (md) => noCode(md).split('\n').filter((l) => /^#{1,4} /.test(l));

// README の表の行と同じ順の手順（模型で計算し直す）
const [n1, n2, n3, n4] = lock.numbers;
const R4 = ['R', n1, 4];
const L3 = ['L', n2, 3];
const R2 = ['R', n3, 2];
const L1 = ['L', n4, 1];
const left = C.leftStartNumbers(lock);
const PLANS = [
  [R4, L3, R2, L1], [['R', n1, 5], L3, R2, L1], [['R', n1, 3], L3, R2, L1],
  [R4, ['L', n2, 4], R2, L1], [R4, L3, ['R', n3, 3], L1], [R4, L3, R2, ['L', n4, 2]],
  [R4, ['L', n2 + 1, 3], R2, L1], [R4, ['L', n2 + 2, 3], R2, L1],
  [['L', n1, 4], ['R', n2, 3], ['L', n3, 2], ['R', n4, 1]],
  [['L', left[0], 4], ['R', left[1], 3], ['L', left[2], 2], ['R', left[3], 1]]
];
const rates = (() => {
  const rnd = C.xorshift32(20261005);
  const starts = Array.from({ length: 2000 }, () => {
    const reading = Math.floor(rnd() * 100);
    const [r3, r2, r1] = [0, 1, 2].map(() => Math.floor(rnd() * (lock.play + 1)));
    return C.createState(lock, reading, [r1, r2, r3]);
  });
  return PLANS.map((plan) => `${(100 * starts.filter((s) => C.isOpen(lock, C.runPlan(lock, s, plan).state)).length / starts.length).toFixed(1)}%`);
})();

test('YAML メタデータの構造（キーの順、ブロック形式のリスト、固定の値）。YAML は README.md だけに置く', () => {
  const m = DOCS.ja.text.match(/^<!--\n---\n([\s\S]*?)\n---\n-->\n/);
  assert.ok(m, 'YAML block');
  const keys = [...m[1].matchAll(/^([a-z_]+):/gm)].map((x) => x[1]);
  assert.deepEqual(keys, ['id', 'slug', 'title', 'subtitle_ja', 'subtitle_en', 'description_ja', 'description_en', 'category_ja', 'category_en',
    'difficulty', 'tags', 'repo_url', 'demo_url', 'hub']);
  for (const k of ['category_ja', 'category_en', 'tags']) assert.match(m[1], new RegExp(`^${k}:\\n  - `, 'm'), k);
  assert.match(m[1], /^id: day050$/m);
  assert.match(m[1], /^slug: dialsafe-simulator$/m);
  assert.match(m[1], /^hub: true$/m);
  assert.doesNotMatch(DOCS.en.text, /^<!--/);
});

test('日英の README は同じ見出しを同じ順に持つ（階層と絵文字がそろう）', () => {
  const ja = headings(DOCS.ja.text);
  const en = headings(DOCS.en.text);
  assert.equal(en.length, ja.length);
  ja.forEach((h, i) => {
    assert.equal(en[i].match(/^#+/)[0], h.match(/^#+/)[0], `${h} / ${en[i]}`);
    const first = [...h.replace(/^#+ /, '')][0];
    if (/^#{2,3} /.test(h) && /\p{Extended_Pictographic}/u.test(first)) assert.equal([...en[i].replace(/^#+ /, '')][0], first, `${h} / ${en[i]}`);
  });
});

for (const [lang, d] of Object.entries(DOCS)) {
  test(`${d.file}: シリーズ標準の構成（前半と後半の見出しの順、Day の表記、言語の切り替え、プロジェクトのリンク）と、古い記述がないこと`, () => {
    const heads = h2(d.text);
    assert.ok(d.text.includes(d.switcher));
    assert.match(d.text, /\n# DialSafe Simulator - .+\n/);
    assert.ok(d.text.includes(d.day));
    assert.ok(heads[0].startsWith('🌐'));
    assert.ok(heads[1].startsWith('📸'));
    assert.deepEqual(heads.slice(-4).map((h) => [...h][0]), ['📁', '💻', '📄', '🛠']);
    for (const icon of ['✨', '📖', '🎯', '🔒', '⚠', '🧪', '🔬']) assert.ok(heads.some((h) => h.startsWith(icon)), icon);
    assert.match(section(d.text, d.sec.about), /https:\/\/akademeia\.info\/\?page_id=42163/);
    for (const b of ['stars', 'forks', 'last-commit', 'license']) assert.ok(d.text.includes(`img.shields.io/github/${b}/ipusiron/dialsafe-simulator`), b);
    assert.doesNotMatch(d.text, d.forbidden);
  });

  test(`${d.file}: 強調は1節に2か所まで、箇条書きの項目名を太字にしない、文末にコロンを置かない`, () => {
    for (const h of h2(d.text)) {
      const n = (section(d.text, h).match(/\*\*[^*\n]+\*\*/g) || []).length;
      assert.ok(n <= 2, `${h}: ${n}`);
    }
    assert.doesNotMatch(d.text, /^\s*- \*\*/m);
    if (lang === 'ja') assert.doesNotMatch(noCode(d.text).replace(/<!--[\s\S]*?-->/, ''), /[：:]$/m);
  });

  test(`${d.file}: 模型の節の表（2,000通りの開いた割合）と本文の数値は、模型で計算し直した値と同じ`, () => {
    const sec = section(d.text, d.sec.model);
    const rows = table(sec, d.head);
    assert.equal(rows.length, PLANS.length);
    assert.deepEqual(rows.map((r) => r[1]), rates);
    for (const c of d.claims) assert.ok(sec.includes(c), c);
    assert.deepEqual(C.pickupDistances(lock), [97, 193, 289]);
    assert.deepEqual(left, [82, 38, 80, 13]);
    assert.equal(rates[2], '97.0%');
    // 開けられる番号の条件（差の上限・組の数・許容幅で開く上限・練習の余裕・既定の番号の差）
    assert.deepEqual(C.gapLimits(), [88, 92, 96]);
    assert.deepEqual(C.gapLimits().map((g, i) => [3 * lock.play - 200, 2 * lock.play - 100, lock.play][i] === g), [true, true, true]);
    assert.equal(C.exactCount(), 77721600);
    assert.equal(Math.round((100 * C.exactCount()) / 1e8), 78);
    assert.deepEqual(C.gapLimits().map((g) => g + C.TOLERANCE), [89, 93, 97]);
    assert.equal(C.PRACTICE_MARGIN, 3);
    assert.deepEqual(C.combinationGaps(C.COMBINATION), [36, 46, 29]);
  });

  test(`${d.file}: ディレクトリー構造にすべてのファイルとディレクトリーが載り、全行に説明がある`, () => {
    const block = section(d.text, d.sec.tree).match(/```\n([\s\S]*?)```/)[1];
    const lines = block.split('\n').filter((l) => l.trim()).slice(1);
    const listed = new Set();
    for (const line of lines) {
      const m = line.match(/[├└]── ([^\s#]+)\s+# \S/);
      assert.ok(m, `説明のない行: ${line}`);
      listed.add(m[1].replace(/\/$/, ''));
    }
    const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })
      .filter((x) => !['.git', 'node_modules', '.claude'].includes(x.name))
      .flatMap((x) => (x.isDirectory() ? [x.name, ...walk(path.join(dir, x.name))] : [x.name]));
    const all = walk('.');
    for (const name of all) assert.ok(listed.has(name), `ツリーにない: ${name}`);
    for (const name of listed) assert.ok(all.includes(name), `実在しない: ${name}`);
  });
}

const WORLD = { ja: '🌏 世界のダイヤル錠（仕組み・規格・歴史・雑学）', en: '🌏 Dial locks around the world (mechanisms, standards, history, trivia)' };
const WORLD_HEAD = { ja: ['項目', '年'], en: ['Item', 'Year'] };
const WORLD_NUMBERS = ['1,000,000', '100,000,000', '51,200', '242,406', '80,000', '282,807', '111,139', '98,536', '165,878', '114,510', '153,744',
  '927', '177', '1968-704'];

test('世界のダイヤル錠の節: 日英で出典の URL・参考文献の番号・表の行がそろい、本文の出典番号はすべて参考文献にある。工場出荷時の番号の値は書かない', () => {
  const sec = Object.fromEntries(Object.entries(DOCS).map(([lang, d]) => [lang, section(d.text, WORLD[lang])]));
  const urls = (s) => [...s.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
  assert.deepEqual(urls(sec.en), urls(sec.ja));
  for (const u of urls(sec.ja)) assert.match(u, /^https:\/\//, u);
  const years = {};
  for (const [lang, s] of Object.entries(sec)) {
    const refs = [...s.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    assert.deepEqual(refs, Array.from({ length: 20 }, (_, i) => i + 1), lang);
    const cited = new Set([...s.matchAll(/\[(\d+(?:, \d+)*)\]/g)].flatMap((m) => m[1].split(', ').map(Number)));
    for (const n of refs) assert.ok(cited.has(n), `${lang}: 本文で引用していない [${n}]`);
    for (const n of cited) assert.ok(refs.includes(n), `${lang}: 参考文献にない [${n}]`);
    for (const n of WORLD_NUMBERS) assert.ok(s.includes(n), `${lang}: ${n}`);
    const [diff, timeline] = WORLD_HEAD[lang].map((h) => table(s, h));
    assert.equal(diff.length, 5, lang);
    years[lang] = timeline;
  }
  // 年表: 行の数・年・出典が日英でそろい、年は古い順
  assert.equal(years.ja.length, years.en.length);
  assert.deepEqual(years.ja.map((r) => r[2]), years.en.map((r) => r[2]));
  const numeric = years.ja.map((r) => r[0]).filter((y) => /^\d{4}$/.test(y)).map(Number);
  assert.deepEqual(numeric, years.en.map((r) => r[0]).filter((y) => /^\d{4}$/.test(y)).map(Number));
  assert.deepEqual(numeric, [...numeric].sort((a, b) => a - b));
  // 名目の数（100目盛り・3番号と4番号）と許容幅の比較は本ツールの値と矛盾しない
  assert.equal(100 ** 3, 1000000);
  assert.equal(100 ** 4, 100000000);
  assert.equal(C.TOLERANCE, 1);
  for (const d of Object.values(DOCS)) assert.doesNotMatch(d.text, /25-0-25|50-25-50/);
});

test('画像: 参照はすべて実在する。スクリーンショットは日本語版が assets/、英語版が assets/en/ の9枚。どこからも参照しない画像は置かない', () => {
  const refs = {};
  for (const [lang, d] of Object.entries(DOCS)) {
    refs[lang] = [...d.text.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)].map((m) => m[1]);
    for (const r of refs[lang]) assert.ok(fs.existsSync(path.join(ROOT, r)), r);
    const shots = refs[lang].filter((r) => /screenshot/.test(r));
    assert.equal(shots.length, 9, lang);
    for (const r of shots) {
      assert.match(r, d.shots, r);
      assert.ok(fs.statSync(path.join(ROOT, r)).size <= 300 * 1024, r);
    }
  }
  const html = [...read('index.html').matchAll(/src="(assets\/[^"]+)"/g)].map((m) => m[1]);
  const used = new Set([...refs.ja, ...refs.en, ...html]);
  const files = (dir) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => /\.(png|jpg)$/.test(f)).map((f) => `${dir}/${f}`);
  for (const f of [...files('assets'), ...files('assets/en')]) assert.ok(used.has(f), `参照していない画像: ${f}`);
});
