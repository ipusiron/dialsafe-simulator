// ====== DialSafe Simulator (4-disk fixed conversion) with i18n ======
// 教育目的：正規の開錠手順と内部連動の可視化のみ（攻撃手法は扱わない）

/* -------------------- i18n -------------------- */
const I18N = {
  ja: {
    "app.title": "DialSafe Simulator",
    "app.subtitle": "金庫ダイヤルシミュレーター（4枚座の固定ダイヤル錠・正規解錠を可視化）",
    "ui.language": "言語",
    "tab.learn": "学習",
    "tab.sim": "シミュレーター",

    "learn.whatIs.title": "固定ダイヤル錠とは",
    "learn.whatIs.desc1": "固定ダイヤル錠（固定変換ダイヤル錠）は、日本の家庭用耐火金庫で広く使用される機械式の錠前です。0〜99の目盛りが刻まれたダイヤルを、決められた番号と手順で回転させることで開錠します。",
    "learn.whatIs.desc2": "電子錠と異なり電源不要で、適切にメンテナンスすれば数十年以上使用可能です。番号の組み合わせは工場出荷時に設定され、通常は変更できません（固定式）。4枚座の場合、理論上の組み合わせは100万通り（100⁴）となります。",
    "learn.whatIs.desc3": "正しい操作手順（右回転→左回転の交互）と、各番号での正確な通過回数が両方揃って初めて開錠する仕組みです。",
    "learn.whatIs.desc4": "固定ダイヤル錠はダイヤル錠の中でもっともシンプルな構造を持ち、それほど高い安全性は持ちません。",

    "learn.structure.title": "固定ダイヤル錠の構造",
    "learn.structure.components": "主要部品",
    "learn.structure.mechanism":
      "芯棒を介して<strong>ドライビングディスクのみ</strong>が目盛盤と直結し、最初にドライブされます。他ディスクは<strong>テンションスプリングで密着</strong>し、各ディスクの<strong>ツク（突起）</strong>同士が当たりながら順次回転を伝達。バネが弱くなるとツクが空回りして故障の原因となります。4つの<strong>ゲート（切り欠き）</strong>が一直線に揃うと閂を引き込んで開錠します。",
    "learn.mechanism.title": "開錠メカニズム",
    "learn.mechanism.desc1": "固定ダイヤル錠が開錠する理由は、<strong>4つのゲート（切り欠き）が一直線に揃う</strong>ことで<strong>フェンス</strong>という部品が落ち、<strong>閂（かんぬき）</strong>を引き込めるようになるからです。",
    "learn.mechanism.note": "💡 重要：<strong>正確な手順</strong>で操作することで、4つのディスクのゲートを順次正しい位置に配置し、最終的に一直線に揃えることができます。これが「正規の開錠」の原理です。",
    "learn.operation.title": "操作法",
    "learn.desc":
      "固定ダイヤル錠（4枚座）は、<strong>第1〜第3ディスク＋ドライビングディスク</strong>の4つのゲートを一直線に揃えると<strong>フェンス</strong>が落ち、閂を引き込めます。",
    "learn.step1": "① 右（R）に<strong>4回以上</strong>まわして、<strong>1番目</strong>の数値で停止",
    "learn.step2": "② 左（L）に<strong>3回</strong>まわして、<strong>2番目</strong>の数値で停止",
    "learn.step3": "③ 右（R）に<strong>2回</strong>まわして、<strong>3番目</strong>の数値で停止",
    "learn.step4": "④ 左（L）に<strong>1回</strong>まわして、<strong>4番目</strong>の数値で停止",
    "learn.note":
      "⚠️ 重要：「○回まわす」は<strong>その番号が指標を○回通過する</strong>という意味です。<strong>「0」を○回通過させるのではありません！</strong><br>例：「右に4回まわして10で停止」= 10が指標を4回通過してから停止（3回通り過ぎて、4回目はピッタリ止める）。回し過ぎたらやり直し。",
    "learn.demo.title": "自動実演パターン",
    "learn.demo.combo": "実演用正解番号:",
    "learn.demo.pattern1": "① 正確な操作（初回R4回）",
    "learn.demo.pattern2": "② 多めに回転（初回R5回）", 
    "learn.demo.pattern3": "③ 不足（初回R3回のみ）",
    "learn.demo.pattern4": "④ 最終ステップ誤操作",
    "learn.demo.pattern5": "⑤ 中間ステップで間違った数値",
    "btn.learnDemo": "手順を自動実演",
    "btn.reset": "リセット",

    "sim.dialTitle": "ダイヤル操作",
    "sim.rotm1": "-1",
    "sim.rotp1": "+1",
    "sim.hint": "← → / A D / 増減ボタン で回転。数字は 0–99。",
    "sim.innerTitle": "内部可視化",
    "sim.legend.gate": "切り欠き（ゲート）",
    "sim.legend.tsuku": "突起（ツク）",
    "sim.combination": "正解番号:",
    "sim.internal": "内部ディスクの番号:",
    "sim.dir": "方向",
    "sim.passes": "通過回数",
    "sim.current": "現在値",
    "fence.open": "閂：開錠",
    "fence.locked": "閂：施錠",


    "footer.repo": "GitHubリポジトリはこちら",

    "log.demoStart": "デモ：R(4) → L(3) → R(2) → L(1) の順で番号を合わせます。",
    "log.learnReset": "学習モードをリセットしました。",
    "log.finalOpen": "4つの番号をセットしました。実機では鍵を回して解錠します（本ツールはOPENで表現）。",
    "log.stepMsg": (idx, needDir, actualPass, needNum, dirOK, passOK, atNumber, statusOverride) => {
      const stepNames = ['', '第1ディスク', '第2ディスク', '第3ディスク', 'ドライビングディスク'];
      const dirName = needDir === 'R' ? '右' : '左';
      const result = statusOverride || ((dirOK && passOK && atNumber) ? '✓ 完了' : '✗ 未完了');
      return `STEP${idx}: ${dirName}に${actualPass}回転で${needNum}番 → ${result} (${stepNames[idx]}配置)`;
    },
    
    // Main Components
    "learn.components.dial": "<strong>目盛盤（つまみ）</strong>：0-99の目盛りが印字された操作部、直径が大きいほど高級",
    "learn.components.base": "<strong>表座（指標つき台座）</strong>：赤い指標または切り込み線付きの台座、基準位置を示す",
    "learn.components.discs": "<strong>第1〜第3ディスク</strong>：各ディスクにゲート1個とツク2個を配置（第2・第3ディスク）",
    "learn.components.driving": "<strong>ドライビングディスク（駆動座）</strong>：目盛盤と芯棒で直結、他より大きく、ツク1個",
    "learn.components.spindle": "<strong>芯棒</strong>：ドライビングディスクのみと接続、パイプ内を通る中心軸",
    "learn.components.spring": "<strong>テンションスプリング</strong>：各ディスクを密着させ、ツク同士の接触を保つ",
    "learn.components.dimension": "<strong>L寸法</strong>：表座からドライビングディスクまでの距離、扉厚より大きく必要",
    
    // Mechanism Figures
    "learn.mechanism.fig1": "<strong>図1：施錠状態</strong><br>ゲートが揃っていないため、フェンスが上がったまま。閂が出て扉は開かない。",
    "learn.mechanism.fig2": "<strong>図2：一部のゲートが揃った状態</strong><br>一部のゲートは合っているが、全てが揃っていないためフェンスは落ちない。",
    "learn.mechanism.fig3": "<strong>図3：完全解錠状態</strong><br>4つ全てのゲートが一直線に揃い、フェンスが落ちて閂を引き込める。",
    
    // Demo Patterns
    "demo.pattern1.title": "パターン1: 正確な操作（右に4回まわす）",
    "demo.pattern1.sequence": "手順: R(4) → L(3) → R(2) → L(1)",
    "demo.pattern1.result": "✅ 成功: 正確な回数で全てのステップが完了",
    
    "demo.pattern2.title": "パターン2: 最初に多めに回転（右に5回まわす）",
    "demo.pattern2.sequence": "手順: R(5) → L(3) → R(2) → L(1)",
    "demo.pattern2.result": "✅ 成功: 4回以上であれば問題なし",
    
    "demo.pattern3.title": "パターン3: 最初の回転が不足（右に3回のみ）",
    "demo.pattern3.sequence": "手順: R(3) → L(3) → R(2) → L(1)",
    "demo.pattern3.result": "❌ 失敗: 最初のR回転が3回では不足（4回以上必要）",
    "demo.pattern3.explanation": "→ 第1ディスクが正しく配置されないと同時に、それ以降（第2ディスク、第3ディスク、ドライビングディスク）も正しく配置されない可能性があり、最終的に開錠できない",
    
    "demo.pattern4.title": "パターン4: 最終ステップで誤操作（左に2回まわす）",
    "demo.pattern4.sequence": "手順: R(4) → L(3) → R(2) → L(2) ← 間違い",
    "demo.pattern4.result": "❌ 失敗: 最終ステップは1回のみ（2回では回し過ぎ）",
    "demo.pattern4.explanation": "→ 最初からやり直しが必要",
    
    "demo.pattern5.title": "パターン5: 中間ステップで間違った数値（STEP2で誤った番号）",
    "demo.pattern5.sequence": "手順: R(4) → L(3) → R(2) → L(1) ※STEP2で間違った数値",
    "demo.pattern5.result": "❌ 失敗: STEP2で間違った数値（50番）に合わせた",
    "demo.pattern5.explanation": "→ 第2ディスクが正しく配置されないと同時に、それ以降（第3ディスク、ドライビングディスク）も正しく配置されない可能性があり、最終的に開錠できない",
  },
  en: {
    "app.title": "DialSafe Simulator",
    "app.subtitle": "4-disk fixed-conversion dial lock — visualize legitimate opening.",
    "ui.language": "Language",
    "tab.learn": "LEARN",
    "tab.sim": "SIMULATOR",

    "learn.whatIs.title": "What is a Fixed Dial Lock?",
    "learn.whatIs.desc1": "A fixed dial lock (fixed conversion dial lock) is a mechanical lock widely used in home fire-resistant safes in Japan. It unlocks by rotating a dial with markings from 0 to 99 according to a predetermined combination and sequence.",
    "learn.whatIs.desc2": "Unlike electronic locks, it requires no power and can last for decades with proper maintenance. The combination is set at the factory and typically cannot be changed (fixed type). For a 4-disk lock, there are theoretically 1 million possible combinations (100⁴).",
    "learn.whatIs.desc3": "The mechanism requires both the correct operating sequence (alternating right and left rotations) and the exact number of passes at each number to unlock.",
    "learn.whatIs.desc4": "Fixed dial locks have the simplest structure among dial locks and do not provide particularly high security.",
    "learn.structure.title": "Fixed Dial Lock Structure",
    "learn.structure.components": "Main Components",
    "learn.structure.mechanism":
      "Only the <strong>driving disc</strong> connects directly to the dial via the spindle and is driven first. Other discs are pressed together by <strong>tension springs</strong>, and <strong>pins (tsuku)</strong> on each disc contact each other to transmit rotation sequentially. If springs weaken, pins may slip causing malfunction. When all four <strong>gates (notches)</strong> align in a straight line, the bolt can be retracted for opening.",
    "learn.mechanism.title": "Unlocking Mechanism",
    "learn.mechanism.desc1": "The fixed dial lock opens because when <strong>all four gates (notches) align in a straight line</strong>, a component called the <strong>fence</strong> drops, allowing the <strong>bolt</strong> to be retracted.",
    "learn.mechanism.note": "💡 Important: By following the <strong>correct procedure</strong>, you can position the gates of all four disks sequentially to the correct positions, ultimately aligning them in a straight line. This is the principle of 'legitimate unlocking'.",
    "learn.operation.title": "Operation Method",
    "learn.desc":
      "A fixed dial lock (4 disks) opens when gates of <strong>Discs 1–3 plus the Driving Disc</strong> align so the <strong>Fence</strong> drops.",
    "learn.step1": "① Turn <strong>Right (R)</strong> ≥4 passes to the <strong>1st</strong> number.",
    "learn.step2": "② Turn <strong>Left (L)</strong> 3 passes to the <strong>2nd</strong> number.",
    "learn.step3": "③ Turn <strong>Right (R)</strong> 2 passes to the <strong>3rd</strong> number.",
    "learn.step4": "④ Turn <strong>Left (L)</strong> 1 pass to the <strong>4th</strong> number.",
    "learn.note":
      "⚠️ Important: \"○ passes\" means <strong>the target number must pass the index ○ times</strong>. <strong>NOT \"0\" passing ○ times!</strong><br>Example: \"Turn right 4 passes to 10\" = Turn until 10 passes the index 4 times, then stop (pass by 3 times, stop exactly on the 4th time). If you overshoot, restart.",
    "learn.demo.title": "Auto Demonstration Patterns",
    "learn.demo.combo": "Demo Combination:",
    "learn.demo.pattern1": "① Correct Operation (Initial R4 turns)",
    "learn.demo.pattern2": "② Extra Rotation (Initial R5 turns)", 
    "learn.demo.pattern3": "③ Insufficient (Initial R3 turns only)",
    "learn.demo.pattern4": "④ Final Step Error",
    "learn.demo.pattern5": "⑤ Wrong Number in Middle Step",
    "btn.learnDemo": "Auto Demonstration",
    "btn.reset": "Reset",

    "sim.dialTitle": "Dial Control",
    "sim.rotm1": "-1",
    "sim.rotp1": "+1",
    "sim.hint": "← → / A D / Buttons. Range 0–99.",
    "sim.innerTitle": "Internal Visualization",
    "sim.legend.gate": "Notch (Gate)",
    "sim.legend.tsuku": "Pin (Tsuku)",
    "sim.combination": "Correct Combination:",
    "sim.internal": "Internal Disc Numbers:",
    "sim.dir": "Direction",
    "sim.passes": "Passes",
    "sim.current": "Value",
    "fence.open": "FENCE: OPEN",
    "fence.locked": "FENCE: LOCKED",


    "footer.repo": "Open the GitHub repository",

    "log.demoStart": "Demo: R(4) → L(3) → R(2) → L(1).",
    "log.learnReset": "Learn mode has been reset.",
    "log.finalOpen": "All four numbers have been set. Real safes then turn the key; here we show OPEN.",
    "log.stepMsg": (idx, needDir, actualPass, needNum, dirOK, passOK, atNumber, statusOverride) => {
      const stepNames = ['', 'Disc 1', 'Disc 2', 'Disc 3', 'Driving Disc'];
      const dirName = needDir === 'R' ? 'Right' : 'Left';
      const result = statusOverride || ((dirOK && passOK && atNumber) ? '✓ Complete' : '✗ Incomplete');
      return `STEP${idx}: ${dirName} ${actualPass} turns to ${needNum} → ${result} (${stepNames[idx]} positioned)`;
    },
    
    // Main Components
    "learn.components.dial": "<strong>Dial Face (Knob)</strong>: Operating part with 0-99 scale markings; larger diameter indicates higher grade",
    "learn.components.base": "<strong>Base Plate (with Index)</strong>: Base with red indicator or cut line showing reference position",
    "learn.components.discs": "<strong>Discs 1-3</strong>: Each disc has 1 gate and 2 pins (for Discs 2 & 3)",
    "learn.components.driving": "<strong>Driving Disc</strong>: Directly connected to dial face via spindle; larger than others with 1 pin",
    "learn.components.spindle": "<strong>Spindle</strong>: Central axis passing through pipe, connected only to driving disc",
    "learn.components.spring": "<strong>Tension Springs</strong>: Keep discs in contact and maintain pin engagement",
    "learn.components.dimension": "<strong>L Dimension</strong>: Distance from base plate to driving disc; must exceed door thickness",
    
    // Mechanism Figures
    "learn.mechanism.fig1": "<strong>Figure 1: Locked State</strong><br>Gates are not aligned, so fence stays up. Bolt extends and door cannot open.",
    "learn.mechanism.fig2": "<strong>Figure 2: Partially Aligned Gates</strong><br>Some gates are aligned but not all, so fence does not drop.",
    "learn.mechanism.fig3": "<strong>Figure 3: Fully Unlocked State</strong><br>All four gates align in a straight line, fence drops and bolt can be retracted.",
    
    // Demo Patterns
    "demo.pattern1.title": "Pattern 1: Correct Operation (Right 4 turns)",
    "demo.pattern1.sequence": "Sequence: R(4) → L(3) → R(2) → L(1)",
    "demo.pattern1.result": "✅ Success: All steps completed with correct turn counts",
    
    "demo.pattern2.title": "Pattern 2: Extra initial rotation (Right 5 turns)",
    "demo.pattern2.sequence": "Sequence: R(5) → L(3) → R(2) → L(1)",
    "demo.pattern2.result": "✅ Success: 4 or more turns is acceptable",
    
    "demo.pattern3.title": "Pattern 3: Insufficient initial rotation (Right 3 turns only)",
    "demo.pattern3.sequence": "Sequence: R(3) → L(3) → R(2) → L(1)",
    "demo.pattern3.result": "❌ Failure: 3 R turns insufficient (4+ required)",
    "demo.pattern3.explanation": "→ If Disc 1 is not positioned correctly, subsequent discs (Disc 2, Disc 3, Driving Disc) may also fail to position properly, ultimately preventing unlock",
    
    "demo.pattern4.title": "Pattern 4: Final step error (Left 2 turns)",
    "demo.pattern4.sequence": "Sequence: R(4) → L(3) → R(2) → L(2) ← Error",
    "demo.pattern4.result": "❌ Failure: Final step should be 1 turn only (2 turns is excessive)",
    "demo.pattern4.explanation": "→ Must start over from beginning",
    
    "demo.pattern5.title": "Pattern 5: Wrong number in middle step (STEP2 error)",
    "demo.pattern5.sequence": "Sequence: R(4) → L(3) → R(2) → L(1) ※Wrong number in STEP2",
    "demo.pattern5.result": "❌ Failure: STEP2 set to wrong number (50)",
    "demo.pattern5.explanation": "→ If Disc 2 is not positioned correctly, subsequent discs (Disc 3, Driving Disc) may also fail to position properly, ultimately preventing unlock",
  }
};

const LANGS = ["ja", "en"];
const DEFAULT_LANG = (() => {
  const fromNav = (navigator.language || "ja").toLowerCase();
  return fromNav.startsWith("ja") ? "ja" : "en";
})();
let currentLang = (() => {
  try {
    const stored = localStorage.getItem("lang");
    return LANGS.includes(stored) ? stored : DEFAULT_LANG;
  } catch(e) {
    return DEFAULT_LANG;
  }
})();

// デモパターン関連の変数（applyI18n で参照するため早期宣言）
let currentDemoPattern = 0; // 現在実行中のデモパターン番号
let learnLog; // 学習ログ要素（後で初期化）
let isDemoRunning = false; // デモパターンの実行状態

function t(key){const p=I18N[currentLang]||I18N[DEFAULT_LANG];const v=p[key];return typeof v==="string"?v:key;}
function tr(key,...args){const p=I18N[currentLang]||I18N[DEFAULT_LANG];const v=p[key];if(typeof v==="function")return v(...args);return t(key)??key;}
function applyI18n(){
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if(text!=null) {
      if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = text;
      } else {
        el.textContent = text;
        if(text.includes('<strong>') || text.includes('<code>')) {
          el.innerHTML = text;
        }
      }
    }
  });
  updateLangToggle();
  
  // 学習ログが表示されている場合、最後に実行されたデモパターンを再描画
  if(currentDemoPattern && learnLog && learnLog.children.length > 0) {
    redrawCurrentDemoPattern();
  }
}

function updateLangToggle() {
  const langToggleText = document.getElementById("lang-toggle-text");
  if(langToggleText) {
    if(currentLang === "ja") {
      langToggleText.textContent = "🇺🇸 English";
    } else {
      langToggleText.textContent = "🇯🇵 日本語";
    }
  }
}

const langToggle = document.getElementById("lang-toggle");
if(langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "ja" ? "en" : "ja";
    try {
      localStorage.setItem("lang", currentLang);
    } catch(e) {
      console.error('Failed to save language preference');
    }
    applyI18n();
    render();
  });
}

applyI18n();

// Theme toggle
const THEME_KEY = 'theme';
let currentTheme = (() => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch(e) {
    return 'dark';
  }
})();

function applyTheme() {
  if(currentTheme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
  updateThemeToggle();
}

function updateThemeToggle() {
  const themeIcon = document.getElementById("theme-toggle-icon");
  if(themeIcon) {
    themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
  }
}

const themeToggle = document.getElementById("theme-toggle");
if(themeToggle) {
  themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_KEY, currentTheme);
    } catch(e) {
      console.error('Failed to save theme preference');
    }
    applyTheme();
  });
}

applyTheme();

/* -------------------- 本体ロジック -------------------- */
const MOD = 100;                // 0-99
const GATE_WIDTH = 40;
const FENCE_TOL = 8;

// 内部状態
const state = {
  value: 0,
  dir: null,            // 'L' or 'R'
  passes: 0,
  lastValue: 0,
  wheels: [
    { name: 'W1', gate: 37, tsuku: 77, position: 0 }, // 第1ディスク
    { name: 'W2', gate: 17, tsuku: 68, position: 0 }, // 第2ディスク
    { name: 'W3', gate: 83, tsuku: 3, position: 0 }, // 第3ディスク
    { name: 'DW', gate: 37, tsuku: 75, position: 0 }, // ドライビングディスク
  ],
  combo: [94,30,84,13],       // 正解番号（ダイヤル表示）
  stepIndex: 0,               // 0..3
  targetPasses: [4,3,2,1]    // R4 → L3 → R2 → L1
};

// DOM
const elDial = document.getElementById('dial');
const elDialValue = document.getElementById('dial-value');
const elValue = document.getElementById('value');
const elDir = document.getElementById('dir');
const elPasses = document.getElementById('passes');

const elGateW1 = document.getElementById('w1-gate');
const elGateW2 = document.getElementById('w2-gate');
const elGateW3 = document.getElementById('w3-gate');
const elGateDW = document.getElementById('dw-gate');
const elTsukuW1 = document.getElementById('w1-tsuku');
const elTsukuW2 = document.getElementById('w2-tsuku');
const elTsukuW3 = document.getElementById('w3-tsuku');
const elTsukuDW = document.getElementById('dw-tsuku');

const elValueW1 = document.getElementById('w1-value');
const elValueW2 = document.getElementById('w2-value');
const elValueW3 = document.getElementById('w3-value');
const elValueDW = document.getElementById('dw-value');
const elFenceBar = document.getElementById('fence-bar');
const elFenceStatus = document.getElementById('fence-status');

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

const simButtons = document.querySelectorAll('.controls button[data-rot]');
const simReset = document.getElementById('sim-reset');

const learnDemoBtn = document.getElementById('learn-demo');
const learnResetBtn = document.getElementById('learn-reset');
learnLog = document.getElementById('learn-log');

const simOpenBanner = document.getElementById('sim-open-banner');

// タブ切替
tabButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    tabButtons.forEach(b=>b.classList.remove('active'));
    tabContents.forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ユーティリティ
function pad2(n){
  const num = parseInt(n, 10);
  if(isNaN(num) || num < 0 || num > 99) return '00';
  return String(num).padStart(2,'0');
}
function valueToPx(n){
  // ホイールコンテナの実際の使用可能幅
  // グリッドレイアウトから推定：カード幅約500px - stack padding 40px = 約460px
  const containerWidth = 460;
  
  // ゲートとツクが端で見切れないように、要素の半分の幅を考慮
  const gateHalfWidth = GATE_WIDTH / 2;  // 20px
  const tsukuHalfWidth = 9;  // ツク幅18px / 2
  
  // 最大のマージンを使用（ゲートの方が大きい）
  const edgeMargin = gateHalfWidth;
  
  // 実際に動ける範囲：左端マージン〜右端マージン
  const usableWidth = containerWidth - (edgeMargin * 2);
  
  // 0〜99の値を、左端から右端までの位置に変換
  // 値0 = 左端（edgeMargin）、値99 = 右端（containerWidth - edgeMargin）
  return Math.round(edgeMargin + ((n%MOD)/(MOD-1)) * usableWidth);
}

function updateGates(){
  // ゲート（切り欠き）の位置更新
  if(elGateW1) elGateW1.style.left = valueToPx((state.wheels[0].position + state.wheels[0].gate) % MOD)+'px';
  if(elGateW2) elGateW2.style.left = valueToPx((state.wheels[1].position + state.wheels[1].gate) % MOD)+'px';
  if(elGateW3) elGateW3.style.left = valueToPx((state.wheels[2].position + state.wheels[2].gate) % MOD)+'px';
  if(elGateDW) elGateDW.style.left = valueToPx((state.wheels[3].position + state.wheels[3].gate) % MOD)+'px';
  
  // ツク（突起）の位置更新
  if(elTsukuW1) elTsukuW1.style.left = valueToPx((state.wheels[0].position + state.wheels[0].tsuku) % MOD)+'px';
  if(elTsukuW2) elTsukuW2.style.left = valueToPx((state.wheels[1].position + state.wheels[1].tsuku) % MOD)+'px';
  if(elTsukuW3) elTsukuW3.style.left = valueToPx((state.wheels[2].position + state.wheels[2].tsuku) % MOD)+'px';
  if(elTsukuDW) elTsukuDW.style.left = valueToPx((state.wheels[3].position + state.wheels[3].tsuku) % MOD)+'px';

  // 各ディスクの現在値表示
  if(elValueW1) elValueW1.textContent = pad2(state.wheels[0].position);
  if(elValueW2) elValueW2.textContent = pad2(state.wheels[1].position);
  if(elValueW3) elValueW3.textContent = pad2(state.wheels[2].position);
  if(elValueDW) elValueDW.textContent = pad2(state.wheels[3].position);
}
function updateDialFace(){
  elDial.style.transform = `rotate(${state.value*3.6}deg)`;
  elDialValue.textContent = pad2(state.value);
  if(elValue) elValue.textContent = pad2(state.value);
  if(elDir) elDir.textContent = state.dir ?? '—';
  if(elPasses) elPasses.textContent = state.passes;
}
function checkFence(){
  // ゲートの実際の位置を計算（ディスク回転 + ゲート相対位置）
  const gatePositions = state.wheels.map(w => (w.position + w.gate) % MOD);
  
  // フェンス位置を表示番号と内部番号の差分(7)を考慮して調整
  // 表示「3-33-63-13」+ 7 = 内部「10-40-70-20」
  // ゲート中央を基準とした正確な位置
  const centerPos = 50; // 元の50を基準とし、ゲート配置側で調整
  
  console.log('ゲート位置:', gatePositions, 'フェンス中央:', centerPos);
  
  // 全てのゲートがフェンス中央付近に揃っているかチェック
  const ok = gatePositions.every(pos => {
    const diff = Math.min(Math.abs(pos - centerPos), 100 - Math.abs(pos - centerPos));
    const isAligned = diff <= FENCE_TOL;
    console.log(`位置${pos}: 中央からの距離${diff}, 揃い${isAligned}`);
    return isAligned;
  });
  
  console.log('フェンス開錠判定:', ok);
  
  if(elFenceBar && elFenceStatus) {
    if(ok){
      elFenceBar.style.top='18px';
      elFenceStatus.textContent=tr('fence.open');
      elFenceStatus.style.color='var(--accent)'; // 青色
      // シミュレータータブでの開錠通知
      if(simOpenBanner) simOpenBanner.hidden = false;
    }else{
      elFenceBar.style.top='8px';
      elFenceStatus.textContent=tr('fence.locked');
      elFenceStatus.style.color='var(--danger)'; // 赤色
      // 開錠バナーを隠す
      if(simOpenBanner) simOpenBanner.hidden = true;
    }
  }
  return ok;
}
function render(){ updateDialFace(); updateGates(); checkFence(); updateCombinationDisplay(); }

function updateCombinationDisplay() {
  const simCombo = document.getElementById('sim-combination');
  const simInternal = document.getElementById('sim-internal');
  
  if(simCombo) {
    // 表示用の正解番号（手動確認済み）
    simCombo.textContent = '94 - 30 - 84 - 13';
  }
  
  if(simInternal) {
    // 内部ディスクの番号（手動確認済み）
    simInternal.textContent = '7 - 27 - 61 - 6';
  }
}

// 回転
function rotate(delta){
  const prev=state.value;
  let next=(prev+delta)%MOD; if(next<0) next+=MOD;
  if(delta>0) state.dir='R'; else if(delta<0) state.dir='L';

  const target=currentTargetNumber();
  if(target!=null){
    const passed=didPass(prev,next,target,state.dir);
    if(passed) state.passes++;
  }

  state.value=next;

  // 見た目の連動（簡易）：方向により各ディスクの動き方に差をつける
  driveDisks();

  render();
}

function didPass(prev,next,target,dir){
  if(dir==='L'){
    if(next>=prev) return (target>prev && target<=next);
    return (target>prev && target<=99) || (target>=0 && target<=next);
  }else if(dir==='R'){
    if(next<=prev) return (target<prev && target>=next);
    return (target<prev && target>=0) || (target<=99 && target>=next);
  }
  return false;
}

// ディスク連動（実機の物理的挙動を再現）
// ツク（突起）が他のディスクのツクを押すことで連動
function driveDisks(){
  const delta = state.value - state.lastValue;
  if(delta === 0) return;
  
  // 円形の動きを正規化（-50 < delta <= 50）
  let normalizedDelta = delta;
  if (delta > 50) normalizedDelta = delta - 100;  // 99→0の場合
  if (delta < -50) normalizedDelta = delta + 100; // 0→99の場合
  
  // ドライビングディスク（DW）は常にダイヤルと直結
  state.wheels[3].position = state.value;
  
  // ツクによる連動：各ディスクのツクが次のディスクのツクを押す
  // DW → Disk3 → Disk2 → Disk1 の順で連動
  
  // DWのツクがDisk3のツクにぶつかるかチェック
  const dwTsuku = (state.wheels[3].position + state.wheels[3].tsuku) % MOD;
  const d3Tsuku = (state.wheels[2].position + state.wheels[2].tsuku) % MOD;
  
  // ツク同士の距離を計算
  const distDW_D3 = Math.min(
    Math.abs(dwTsuku - d3Tsuku),
    100 - Math.abs(dwTsuku - d3Tsuku)
  );
  
  // ツクが接触範囲内（5度以内）かつ正しい方向に動いている場合
  if (distDW_D3 < 5) {
    // Disk3を動かす
    state.wheels[2].position = (state.wheels[2].position + normalizedDelta + MOD) % MOD;
    
    // Disk3のツクがDisk2のツクにぶつかるかチェック
    const d3TsukuNew = (state.wheels[2].position + state.wheels[2].tsuku) % MOD;
    const d2Tsuku = (state.wheels[1].position + state.wheels[1].tsuku) % MOD;
    const distD3_D2 = Math.min(
      Math.abs(d3TsukuNew - d2Tsuku),
      100 - Math.abs(d3TsukuNew - d2Tsuku)
    );
    
    if (distD3_D2 < 5) {
      // Disk2を動かす
      state.wheels[1].position = (state.wheels[1].position + normalizedDelta + MOD) % MOD;
      
      // Disk2のツクがDisk1のツクにぶつかるかチェック
      const d2TsukuNew = (state.wheels[1].position + state.wheels[1].tsuku) % MOD;
      const d1Tsuku = (state.wheels[0].position + state.wheels[0].tsuku) % MOD;
      const distD2_D1 = Math.min(
        Math.abs(d2TsukuNew - d1Tsuku),
        100 - Math.abs(d2TsukuNew - d1Tsuku)
      );
      
      if (distD2_D1 < 5) {
        // Disk1を動かす
        state.wheels[0].position = (state.wheels[0].position + normalizedDelta + MOD) % MOD;
      }
    }
  }
  
  state.lastValue = state.value;
}


// ツク同士の物理的連動を判定（押す方向のみ）
function isTsukuContact(pusherPos, targetPos, delta){
  const tolerance = 3; // ツクの接触判定範囲
  
  // 現在の距離を計算（円形なので最短距離）
  const currentDistance = Math.min(
    Math.abs(pusherPos - targetPos),
    100 - Math.abs(pusherPos - targetPos)
  );
  
  // 既に接触している場合（めり込み状態）は連動しない
  if(currentDistance <= tolerance) {
    return false; // 既に接触しているので、さらなる押し込みはない
  }
  
  // 移動後の位置を計算
  const nextPusherPos = (pusherPos + delta + MOD) % MOD;
  
  // 移動により初めて接触範囲に入る場合のみ連動
  const nextDistance = Math.min(
    Math.abs(nextPusherPos - targetPos),
    100 - Math.abs(nextPusherPos - targetPos)
  );
  
  // 移動により接触範囲に入った場合のみtrue
  return nextDistance <= tolerance && currentDistance > tolerance;
}

// 手順ターゲット
function currentTargetNumber(){
  if(state.stepIndex<4) return state.combo[state.stepIndex];
  return null;
}
function neededDirForStep(i){ return (i===0||i===2)?'R':'L'; }

// 正規手順評価（成功時は該当ディスクのゲートを「固定」して再設定）
function tryStepConfirm(){
  const needDir = neededDirForStep(state.stepIndex);
  const needPass = state.targetPasses[state.stepIndex];
  const needNumber = state.combo[state.stepIndex];

  const atNumber = state.value === needNumber;
  const dirOK = state.dir === needDir;
  const passOK = state.passes >= needPass; // ①は「以上」、他は簡易的に≥扱い

  logLearn(tr("log.stepMsg",
    state.stepIndex+1, needDir, needPass, pad2(needNumber), dirOK, passOK, atNumber
  ));

  if(dirOK && passOK && atNumber){
    // 成功：該当ディスクを正しい位置に設定
    // 実際は、正しい手順で回すとディスクのゲートが解錠位置に来る
    if(state.stepIndex===0) {
      // Disc1のゲートが解錠位置(50)になるようにディスク位置を調整
      state.wheels[0].position = (50 - state.wheels[0].gate + MOD) % MOD;
    }
    if(state.stepIndex===1) {
      // Disc2のゲートが解錠位置(50)になるようにディスク位置を調整
      state.wheels[1].position = (50 - state.wheels[1].gate + MOD) % MOD;
    }
    if(state.stepIndex===2) {
      // Disc3のゲートが解錠位置(50)になるようにディスク位置を調整
      state.wheels[2].position = (50 - state.wheels[2].gate + MOD) % MOD;
    }
    if(state.stepIndex===3) {
      // DrivingDiscのゲートが解錠位置(50)になるようにディスク位置を調整
      state.wheels[3].position = (50 - state.wheels[3].gate + MOD) % MOD;
    }

    state.stepIndex++;
    state.passes=0;
    state.dir = null; // 方向をリセット

    if(state.stepIndex===4){
      logLearn(tr("log.finalOpen"));
    }
    render();
    return true;
  }
  return false;
}

function tryOpen(){
  const ok=checkFence();
  if(ok){
    // 開錠成功時の処理（必要に応じて）
  }
}

// 学習モード
function logLearn(s){
  if(!learnLog) return;
  const line=document.createElement('div');
  line.textContent=s;
  if(s.includes('<strong>') || s.includes('OK') || s.includes('NG')) {
    line.innerHTML=s;
  }
  learnLog.appendChild(line);
  learnLog.scrollTop=learnLog.scrollHeight;
}
function learnReset(){
  learnLog.innerHTML='';
  resetAll();
  logLearn(tr("log.learnReset"));
}
function learnDemo(){
  learnReset();
  logLearn(tr("log.demoStart"));
  const seq=[
    ()=>rotateTo('R', state.combo[0], 4), ()=>stepConfirm(),
    ()=>rotateTo('L', state.combo[1], 3), ()=>stepConfirm(),
    ()=>rotateTo('R', state.combo[2], 2), ()=>stepConfirm(),
    ()=>rotateTo('L', state.combo[3], 1), ()=>stepConfirm(),
    ()=>tryOpen(),
  ];
  runSeries(seq, 300);
}

function runSeries(tasks,delay){
  let i=0;
  const tick=()=>{ 
    if(i>=tasks.length) return; 
    tasks[i++](); 
    const timeoutId = setTimeout(tick,delay);
    activeAnimationTimeouts.push(timeoutId);
  };
  tick();
}
function rotateTo(dir,target,passes,callback){
  state.dir=dir; state.passes=0;
  const step=(dir==='R')?+7:-7;
  let timer=setInterval(()=>{
    rotate(step);
    if(passes>0 && state.passes>=passes){
      if(Math.abs(((state.value-target)+MOD)%MOD)<=2){
        clearInterval(timer);
        const diff=((target-state.value)+MOD)%MOD;
        const adjust=dir==='R'?diff:(MOD-diff);
        const unit=dir==='R'?+1:-1;
        for(let i=0;i<adjust;i++) rotate(unit);
        // コールバックを遅延実行
        if(callback) setTimeout(callback, 100);
      }
    }
  },16);
}
function stepConfirm(){ tryStepConfirm(); }



function demoStep(dir, target, passes) {
  return () => {
    // デモ用：通過回数を正確に設定
    state.dir = dir;
    state.passes = passes; // 指定された回数に直接設定
    state.value = target;  // ターゲット位置に直接設定
    
    // ディスク連動を実行
    driveDisks();
    render();
    
    // デモ用ステップ確認（成功/失敗に関係なく次に進む）
    setTimeout(() => demoStepConfirm(), 200);
  };
}

function demoStepConfirm() {
  const needDir = neededDirForStep(state.stepIndex);
  const needPass = state.targetPasses[state.stepIndex];
  let needNumber = state.combo[state.stepIndex];
  
  // パターン5の特別処理
  if (currentDemoPattern === 5 && state.stepIndex === 1) {
    needNumber = 50; // STEP2で間違った番号50を表示
  }

  const atNumber = state.value === needNumber;
  const dirOK = state.dir === needDir;
  // STEP1は4回以上、それ以外は正確な回数が必要
  const passOK = (state.stepIndex === 0) ? (state.passes >= needPass) : (state.passes === needPass);

  // パターン3とパターン5の特別な状態表示
  let statusOverride = null;
  if (currentDemoPattern === 3) {
    // パターン3: STEP1が不足なので、STEP2以降は未完了濃厚
    if (state.stepIndex >= 1) {
      statusOverride = '✗ 未完了濃厚';
    }
  } else if (currentDemoPattern === 5) {
    if (state.stepIndex === 1) {
      statusOverride = '✗ 未完了';  // STEP2は間違った番号なので未完了
    } else if (state.stepIndex >= 2) {
      statusOverride = '✗ 未完了濃厚';  // STEP3, STEP4は未完了濃厚
    }
  }

  // デモでは実際の回転数（state.passes）を表示
  logLearn(tr("log.stepMsg",
    state.stepIndex+1, needDir, state.passes, pad2(needNumber), dirOK, passOK, atNumber, statusOverride
  ));

  // 詳細なディスク動作解説を追加（現在のステップに対して）
  logDiskMovementDetails(state.stepIndex);

  if(dirOK && passOK && atNumber){
    // 成功時のディスク配置
    if(state.stepIndex===0) {
      state.wheels[0].position = (50 - state.wheels[0].gate + MOD) % MOD;
      console.log("→ 第1ディスクのゲートが解錠位置（中央50番）に正確に配置されました");
    }
    if(state.stepIndex===1) {
      state.wheels[1].position = (50 - state.wheels[1].gate + MOD) % MOD;
      console.log("→ 第2ディスクのゲートが解錠位置（中央50番）に正確に配置されました");
    }
    if(state.stepIndex===2) {
      state.wheels[2].position = (50 - state.wheels[2].gate + MOD) % MOD;
      console.log("→ 第3ディスクのゲートが解錠位置（中央50番）に正確に配置されました");
    }
    if(state.stepIndex===3) {
      state.wheels[3].position = (50 - state.wheels[3].gate + MOD) % MOD;
      console.log("→ ドライビングディスクのゲートが解錠位置（中央50番）に正確に配置されました");
    }
  } else {
    // 失敗時の詳細説明（コンソール出力のみ）
    if(!dirOK) {
      const expectedDir = needDir === 'R' ? '右' : '左';
      const actualDir = state.dir === 'R' ? '右' : (state.dir === 'L' ? '左' : '不明');
      console.log(`→ 方向エラー: ${expectedDir}回転が必要でしたが、${actualDir}回転でした`);
    }
    if(!passOK) {
      console.log(`→ 通過回数エラー: ${needPass}回必要でしたが、${state.passes}回でした`);
    }
    if(!atNumber) {
      console.log(`→ 位置エラー: ${pad2(needNumber)}番で停止が必要でしたが、${pad2(state.value)}番で停止しました`);
    }
  }

  // デモでは成功/失敗に関係なく次のステップに進む
  state.stepIndex++;
  state.passes = 0;
  state.dir = null;

  // 全ステップが正常に完了した場合のみ開錠メッセージを表示
  if(state.stepIndex === 4){
    // 全ディスクが正しく配置されているかチェック
    const allPositioned = (
      state.wheels[0].position === (50 - state.wheels[0].gate + MOD) % MOD &&
      state.wheels[1].position === (50 - state.wheels[1].gate + MOD) % MOD &&
      state.wheels[2].position === (50 - state.wheels[2].gate + MOD) % MOD &&
      state.wheels[3].position === (50 - state.wheels[3].gate + MOD) % MOD
    );
    
    if(allPositioned) {
      logLearn(tr("log.finalOpen"));
    }
  }
  
  render();
}

// ディスク動作の詳細解説（現在実行中のステップに対する解説）
function logDiskMovementDetails(currentStepIndex) {
  // 引数で渡されたステップインデックスを使用（state.stepIndex はまだ更新前）
  const stepIndex = currentStepIndex !== undefined ? currentStepIndex : state.stepIndex;
  
  const diskNames = ['第1ディスク', '第2ディスク', '第3ディスク', 'ドライビングディスク'];
  
  if (stepIndex >= 0 && stepIndex < 4) {
    const currentDisk = diskNames[stepIndex];
    const direction = state.dir === 'R' ? '右回転（時計回り）' : '左回転（反時計回り）';
    
    // 内部的に詳細情報を保持（デバッグ用コンソール出力のみ）
    console.log(`→ ${currentDisk}を${direction}で調整完了`);
    
    // ツクの連動状況を説明（ドライビングディスク以外の場合）
    if (stepIndex < 3) {
      console.log(`→ ドライビングディスクのツク（突起）が${currentDisk}のツクを押し、連動回転`);
    } else {
      console.log(`→ ドライビングディスクが目盛盤と直結して直接回転`);
    }
    
    // 現在のゲート位置を確認
    const currentGatePos = (state.wheels[stepIndex].position + state.wheels[stepIndex].gate) % MOD;
    console.log(`→ ${currentDisk}の現在ゲート位置: ${currentGatePos}番`);
    
    // 全体のゲート状況をチェック
    const alignedCount = countAlignedGates();
    if (alignedCount > 0) {
      console.log(`→ 解錠位置に配置済み: ${alignedCount}/4 個のディスク`);
    }
    
    // フェンスの状態
    const allAligned = alignedCount === 4;
    if (allAligned) {
      console.log("→ 🎉 全ディスクのゲートが一直線に揃い、フェンスが下降！");
    } else if (alignedCount >= 2) {
      console.log(`→ あと ${4 - alignedCount} 個のディスクが正しい位置に来れば開錠します`);
    }
  }
}

// 揃ったゲートの数をカウント
function countAlignedGates() {
  return state.wheels.reduce((count, wheel) => {
    const gatePosition = (wheel.position + wheel.gate) % MOD;
    return Math.abs(gatePosition - 50) <= 2 ? count + 1 : count;
  }, 0);
}

// デモパターン再描画（言語切り替え用）
function redrawCurrentDemoPattern() {
  if(!currentDemoPattern) return;
  
  // 現在の状態を保存
  const savedState = {
    stepIndex: state.stepIndex,
    value: state.value,
    dir: state.dir,
    passes: state.passes,
    wheels: JSON.parse(JSON.stringify(state.wheels))
  };
  
  // ログをクリアして再実行
  learnLog.innerHTML = '';
  
  // パターンに応じてログメッセージを再生成
  switch(currentDemoPattern) {
    case 1:
      logLearn(t('demo.pattern1.title'));
      logLearn(t('demo.pattern1.sequence'));
      break;
    case 2:
      logLearn(t('demo.pattern2.title'));
      logLearn(t('demo.pattern2.sequence'));
      break;
    case 3:
      logLearn(t('demo.pattern3.title'));
      logLearn(t('demo.pattern3.sequence'));
      break;
    case 4:
      logLearn(t('demo.pattern4.title'));
      logLearn(t('demo.pattern4.sequence'));
      break;
    case 5:
      logLearn(t('demo.pattern5.title'));
      logLearn(t('demo.pattern5.sequence'));
      break;
  }
  
  // 完了したステップのログを再生成
  for(let i = 0; i < savedState.stepIndex; i++) {
    const needDir = neededDirForStep(i);
    const needPass = state.targetPasses[i];
    let needNumber = state.combo[i];
    let actualPass = needPass;
    
    // パターン別の特別処理
    if(currentDemoPattern === 2 && i === 0) {
      actualPass = 5; // パターン2：R5回
    } else if(currentDemoPattern === 3 && i === 0) {
      actualPass = 3; // パターン3：R3回
    } else if(currentDemoPattern === 4 && i === 3) {
      actualPass = 2; // パターン4：L2回
    } else if(currentDemoPattern === 5 && i === 1) {
      needNumber = 50; // パターン5：間違った番号50
    }
    
    const atNumber = true; // デモなので常に正確な位置
    const dirOK = true;
    const passOK = (currentDemoPattern === 3 && i === 0) ? false : 
                   (currentDemoPattern === 4 && i === 3) ? false :
                   (currentDemoPattern === 5 && i === 1) ? false : true;
    
    // 状態オーバーライド
    let statusOverride = null;
    if(currentDemoPattern === 3) {
      if(i >= 1) statusOverride = '✗ 未完了濃厚';
    } else if(currentDemoPattern === 5) {
      if(i === 1) statusOverride = '✗ 未完了';
      else if(i >= 2) statusOverride = '✗ 未完了濃厚';
    }
    
    logLearn(tr("log.stepMsg",
      i+1, needDir, actualPass, pad2(needNumber), dirOK, passOK, atNumber, statusOverride
    ));
    
    // 詳細解説を内部的に保持（コンソール出力のみ）
    const diskNames = ['第1ディスク', '第2ディスク', '第3ディスク', 'ドライビングディスク'];
    const currentDisk = diskNames[i];
    const direction = needDir === 'R' ? '右回転（時計回り）' : '左回転（反時計回り）';
    
    console.log(`→ ${currentDisk}を${direction}で調整完了`);
    
    if(passOK && atNumber) {
      console.log(`→ ${currentDisk}のゲートが解錠位置（中央50番）に正確に配置されました`);
    } else {
      if(!passOK) {
        console.log(`→ 通過回数エラー: ${state.targetPasses[i]}回必要でしたが、${actualPass}回でした`);
      }
      if(!atNumber) {
        console.log(`→ 位置エラー: ${pad2(needNumber)}番で停止が必要でしたが、現在位置が異なります`);
      }
    }
  }
  
  // 結果メッセージを追加
  if(savedState.stepIndex >= 4) {
    switch(currentDemoPattern) {
      case 1:
        logLearn(t('demo.pattern1.result'));
        break;
      case 2:
        logLearn(t('demo.pattern2.result'));
        break;
      case 3:
        logLearn(t('demo.pattern3.result'));
        logLearn(t('demo.pattern3.explanation'));
        break;
      case 4:
        logLearn(t('demo.pattern4.result'));
        logLearn(t('demo.pattern4.explanation'));
        break;
      case 5:
        logLearn(t('demo.pattern5.result'));
        logLearn(t('demo.pattern5.explanation'));
        break;
    }
    
    if(currentDemoPattern === 1 || currentDemoPattern === 2) {
      logLearn(tr("log.finalOpen"));
    }
  }
  
  // 状態を復元
  Object.assign(state, savedState);
}

// デモパターン実行
function runDemoPattern(pattern) {
  learnReset();
  currentDemoPattern = pattern; // デモパターン番号を記録
  isDemoRunning = true; // デモ実行開始
  
  switch(pattern) {
    case 1: // 正確な操作（R4回）
      logLearn(t('demo.pattern1.title'));
      logLearn(t('demo.pattern1.sequence'));
      const seq1 = [
        demoStep('R', state.combo[0], 4),
        demoStep('L', state.combo[1], 3),
        demoStep('R', state.combo[2], 2),
        demoStep('L', state.combo[3], 1),
        () => { 
          logLearn(t('demo.pattern1.result')); 
          isDemoRunning = false; 
        },
      ];
      runSeries(seq1, 800);
      break;
      
    case 2: // 多めに回転（R5回）
      logLearn(t('demo.pattern2.title'));
      logLearn(t('demo.pattern2.sequence'));
      const seq2 = [
        demoStep('R', state.combo[0], 5),
        demoStep('L', state.combo[1], 3),
        demoStep('R', state.combo[2], 2),
        demoStep('L', state.combo[3], 1),
        () => { 
          logLearn(t('demo.pattern2.result')); 
          isDemoRunning = false; 
        },
      ];
      runSeries(seq2, 800);
      break;
      
    case 3: // 不足（R3回のみ）
      logLearn(t('demo.pattern3.title'));
      logLearn(t('demo.pattern3.sequence'));
      const seq3 = [
        demoStep('R', state.combo[0], 3),
        demoStep('L', state.combo[1], 3),
        demoStep('R', state.combo[2], 2),
        demoStep('L', state.combo[3], 1),
        () => { 
          logLearn(t('demo.pattern3.result')); 
          logLearn(t('demo.pattern3.explanation')); 
          isDemoRunning = false; 
        },
      ];
      runSeries(seq3, 800);
      break;
      
    case 4: // 最終ステップ誤操作
      logLearn(t('demo.pattern4.title'));
      logLearn(t('demo.pattern4.sequence'));
      const seq4 = [
        demoStep('R', state.combo[0], 4),
        demoStep('L', state.combo[1], 3),
        demoStep('R', state.combo[2], 2),
        demoStep('L', state.combo[3], 2),
        () => { 
          logLearn(t('demo.pattern4.result')); 
          logLearn(t('demo.pattern4.explanation')); 
          isDemoRunning = false; 
        },
      ];
      runSeries(seq4, 800);
      break;
      
    case 5: // 中間ステップで間違った数値
      logLearn(t('demo.pattern5.title'));
      logLearn(t('demo.pattern5.sequence'));
      // 正解: [10, 40, 70, 20] だが、STEP2で50に合わせる
      const seq5 = [
        demoStep('R', state.combo[0], 4),       // STEP1: 正しく10番
        demoStep('L', 50, 3),                   // STEP2: 間違って50番（正解は40番）
        demoStep('R', state.combo[2], 2),       // STEP3: 正しく70番
        demoStep('L', state.combo[3], 1),       // STEP4: 正しく20番
        () => { 
          logLearn(t('demo.pattern5.result')); 
          logLearn(t('demo.pattern5.explanation')); 
          isDemoRunning = false; 
        },
      ];
      runSeries(seq5, 800);
      break;
  }
}


// リセット
function resetAll(full=true){
  // 実行中のアニメーションを停止
  stopAutoUnlockAnimation();
  
  state.value=0; state.lastValue=0; state.dir=null; state.passes=0;
  state.stepIndex=0;
  if(full) state.combo=[94,30,84,13]; // 正解番号
  
  // 各ディスクの位置を初期化（シミュレーター用固定値）
  state.wheels[0].position = 0;
  state.wheels[1].position = 0;
  state.wheels[2].position = 0;
  state.wheels[3].position = 0; // ドライビングディスクはダイヤル位置と同じ
  
  // ゲートとツクの相対位置は固定（各ディスクの設計による）
  // これらの値は正解の組み合わせに基づいて設定
  
  // アニメーション効果をリセット
  resetAnimationEffects();
  
  // 開錠バナーを隠す
  if(simOpenBanner) simOpenBanner.hidden = true;
  
  render();
}

// イベント（ドラッグ操作は無効化 - ツク連動問題回避のため）
/*
let dragging=false, startAngle=0, startValue=0;
elDial.addEventListener('pointerdown',e=>{
  dragging=true; elDial.setPointerCapture(e.pointerId);
  const r=elDial.getBoundingClientRect(); const cx=r.left+r.width/2; const cy=r.top+r.height/2;
  startAngle=Math.atan2(e.clientY-cy,e.clientX-cx); startValue=state.value;
});
elDial.addEventListener('pointermove',e=>{
  if(!dragging) return;
  const r=elDial.getBoundingClientRect(); const cx=r.left+r.width/2; const cy=r.top+r.height/2;
  const ang=Math.atan2(e.clientY-cy,e.clientX-cx); const diff=ang-startAngle;
  const deg=diff*(180/Math.PI); 
  // ドラッグ感度を極めて重くする（約1/60の感度）
  const ticks=Math.round(deg/216);
  rotate(-(ticks-((state.value-startValue+MOD)%MOD)));
});
elDial.addEventListener('pointerup',e=>{ dragging=false; elDial.releasePointerCapture(e.pointerId); });
*/

// 押しっぱなし対応の回転ボタン
let rotationInterval = null;
let isPressed = false;

// アニメーション状態管理
let activeAnimationTimeouts = [];
let isAutoUnlockRunning = false;

simButtons.forEach(btn=>{
  const delta = parseInt(btn.dataset.rot, 10);
  let timeoutId = null;
  
  // 押し下げ開始
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    clearInterval(rotationInterval);
    clearTimeout(timeoutId);
    isPressed = true;
    
    // 最初の回転（即座に）
    rotate(delta);
    
    // 連続回転開始（押し続けている場合のみ）
    timeoutId = setTimeout(() => {
      if (isPressed) {
        rotationInterval = setInterval(() => {
          rotate(delta);
        }, 30); // 30msごとに高速回転（ツクの衝突検出を維持）
      }
    }, 150); // 150ms後に連続回転開始（さらに早く開始）
  });
  
  // 押し下げ終了
  btn.addEventListener('pointerup', () => {
    clearInterval(rotationInterval);
    clearTimeout(timeoutId);
    isPressed = false;
  });
  
  // マウスがボタンから離れた場合
  btn.addEventListener('pointerleave', () => {
    clearInterval(rotationInterval);
    clearTimeout(timeoutId);
    isPressed = false;
  });
});
// アニメーション強制停止機能
function stopAutoUnlockAnimation() {
  isAutoUnlockRunning = false;
  
  // 全ての待機中のタイムアウトをクリア
  activeAnimationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  activeAnimationTimeouts = [];
}



// 開錠アニメーション
function showOpenAnimation() {
  // フェンスの輝きエフェクト
  if(elFenceBar) {
    elFenceBar.style.background = 'var(--ok)';
    elFenceBar.style.boxShadow = '0 0 20px var(--ok)';
    elFenceBar.style.transform = 'translateX(-50%) scale(1.2)';
    elFenceBar.style.transition = 'all 0.5s ease';
  }
  
  // ゲートの輝きエフェクト
  const gates = [elGateW1, elGateW2, elGateW3, elGateDW];
  gates.forEach((gate, index) => {
    if(gate) {
      setTimeout(() => {
        gate.style.background = 'var(--ok)';
        gate.style.boxShadow = '0 0 15px var(--ok)';
        gate.style.transform = 'translateY(-50%) scale(1.1)';
        gate.style.transition = 'all 0.3s ease';
      }, index * 100);
    }
  });
  
  // 成功メッセージとサウンド効果
  setTimeout(() => {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-notification';
    successMsg.innerHTML = '🎉 <strong>開錠成功！</strong><br>全てのゲートが整列しました';
    successMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--ok);
      color: white;
      padding: 20px 30px;
      border-radius: 15px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: successPulse 2s ease-out;
    `;
    
    document.body.appendChild(successMsg);
    
    // 3秒後に削除
    setTimeout(() => {
      if(successMsg.parentNode) {
        successMsg.remove();
      }
      // エフェクトをリセット
      resetAnimationEffects();
    }, 3000);
  }, 500);
}

// アニメーション効果をリセット
function resetAnimationEffects() {
  if(elFenceBar) {
    elFenceBar.style.background = 'var(--muted)';
    elFenceBar.style.boxShadow = '';
    elFenceBar.style.transform = 'translateX(-50%)';
    elFenceBar.style.transition = 'top .12s ease';
  }
  
  const gates = [elGateW1, elGateW2, elGateW3, elGateDW];
  gates.forEach(gate => {
    if(gate) {
      gate.style.background = 'var(--warn)';
      gate.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      gate.style.transform = 'translateY(-50%)';
      gate.style.transition = 'left .08s linear';
    }
  });
}
if(simReset) simReset.addEventListener('click',()=>resetAll());

// 学習
if(learnResetBtn) learnResetBtn.addEventListener('click',learnReset);
if(learnDemoBtn) learnDemoBtn.addEventListener('click',learnDemo);

// デモパターンボタン
const demoPattern1 = document.getElementById('demo-pattern1');
const demoPattern2 = document.getElementById('demo-pattern2'); 
const demoPattern3 = document.getElementById('demo-pattern3');
const demoPattern4 = document.getElementById('demo-pattern4');
const demoPattern5 = document.getElementById('demo-pattern5');

if(demoPattern1) demoPattern1.addEventListener('click', () => runDemoPattern(1));
if(demoPattern2) demoPattern2.addEventListener('click', () => runDemoPattern(2));
if(demoPattern3) demoPattern3.addEventListener('click', () => runDemoPattern(3));
if(demoPattern4) demoPattern4.addEventListener('click', () => runDemoPattern(4));
if(demoPattern5) demoPattern5.addEventListener('click', () => runDemoPattern(5));

// チャレンジ

// キーボード
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft') rotate(+1);
  if(e.key==='ArrowRight') rotate(-1);
  if(e.key.toLowerCase()==='a') rotate(+1);
  if(e.key.toLowerCase()==='d') rotate(-1);
  if(e.key==='Enter'){
    stepConfirm();
  }
  if(e.key.toLowerCase()==='r') resetAll();
});

// 初期描画
render();
