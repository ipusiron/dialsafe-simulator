// ====== DialSafe Simulator (4-disk fixed conversion) with i18n ======
// 教育目的：正規の開錠手順と内部連動の可視化のみ（攻撃手法は扱わない）

/* -------------------- i18n -------------------- */
const I18N = {
  ja: {
    "app.title": "DialSafe Simulator",
    "app.subtitle": "金庫ダイヤルシミュレーター（4枚座の固定ダイヤル錠・正規解錠を可視化）",
    "ui.language": "言語",
    "tab.learn": "LEARN",
    "tab.sim": "SIMULATOR",
    "tab.challenge": "CHALLENGE",

    "learn.title": "学習モード",
    "learn.desc":
      "固定ダイヤル錠（4枚座）は、<strong>第1〜第3ディスク＋ドライビングディスク</strong>の4つのゲートを一直線に揃えると<strong>フェンス</strong>が落ち、閂を引き込めます。",
    "learn.step1": "① 右（R）に<strong>4回以上</strong>まわして、<strong>1番目</strong>の数値で停止",
    "learn.step2": "② 左（L）に<strong>3回</strong>まわして、<strong>2番目</strong>の数値で停止",
    "learn.step3": "③ 右（R）に<strong>2回</strong>まわして、<strong>3番目</strong>の数値で停止",
    "learn.step4": "④ 左（L）に<strong>1回</strong>まわして、<strong>4番目</strong>の数値で停止",
    "learn.note":
      "「○回まわす」は<strong>そのステップの解錠数値</strong>が指標を通過する回数。回し過ぎたらやり直し。※教育用の簡易モデルです。",
    "btn.learnDemo": "手順を自動実演",
    "btn.reset": "リセット",

    "sim.dialTitle": "ダイヤル操作",
    "sim.rotm10": "⟲ -10",
    "sim.rotm1": "-1",
    "sim.rotp1": "+1",
    "sim.rotp10": "+10 ⟳",
    "sim.targetLabel": "ターゲット番号：",
    "sim.snap": "ターゲットへ合わせる",
    "sim.hint": "ドラッグ／ホイール／← → / A D で回転。数字は 0–99。",
    "sim.innerTitle": "内部可視化",
    "sim.dir": "方向",
    "sim.passes": "通過回数",
    "sim.current": "現在値",

    "ch.title": "チャレンジモード",
    "ch.desc": "ランダムに設定された<strong>4番号</strong>を、正しい通過回数 <code>R(4) → L(3) → R(2) → L(1)</code> で合わせて開錠してください。",
    "ch.new": "新しい暗証を作成",
    "ch.reveal": "答えを表示",
    "ch.step": "手順ステップ確定（Enter）",

    "footer.repo": "GitHubリポジトリはこちら",

    "log.demoStart": "デモ：R(4) → L(3) → R(2) → L(1) の順で番号を合わせます。",
    "log.learnReset": "学習モードをリセットしました。",
    "log.finalOpen": "4番号が揃いました。実機では鍵を回して解錠します（本ツールはOPENで表現）。",
    "log.stepMsg": (idx, needDir, needPass, needNum, dirOK, passOK, atNumber) =>
      `STEP${idx}: dir=${needDir}, passes>=${needPass}, number=${needNum} → ${dirOK?'OK':'NG'} / ${passOK?'OK':'NG'} / ${atNumber?'OK':'NG'}`,
    "ch.progress.open": "OPEN成功！おめでとうございます。",
    "ch.progress.notYet": "まだゲートが揃っていません。",
    "ch.progress.stepDone": (step) => `STEP ${step} 完了`,
    "ch.progress.reset": "リセットしました。"
  },
  en: {
    "app.title": "DialSafe Simulator",
    "app.subtitle": "4-disk fixed-conversion dial lock — visualize legitimate opening.",
    "ui.language": "Language",
    "tab.learn": "LEARN",
    "tab.sim": "SIMULATOR",
    "tab.challenge": "CHALLENGE",

    "learn.title": "Learn Mode",
    "learn.desc":
      "A fixed dial lock (4 disks) opens when gates of <strong>Discs 1–3 plus the Driving Disc</strong> align so the <strong>Fence</strong> drops.",
    "learn.step1": "① Turn <strong>Right (R)</strong> ≥4 passes to the <strong>1st</strong> number.",
    "learn.step2": "② Turn <strong>Left (L)</strong> 3 passes to the <strong>2nd</strong> number.",
    "learn.step3": "③ Turn <strong>Right (R)</strong> 2 passes to the <strong>3rd</strong> number.",
    "learn.step4": "④ Turn <strong>Left (L)</strong> 1 pass to the <strong>4th</strong> number.",
    "learn.note":
      "“Passes” = the target number crossing the index that many times. If you overshoot, restart. *Educational simplified model.*",
    "btn.learnDemo": "Auto Demonstration",
    "btn.reset": "Reset",

    "sim.dialTitle": "Dial Control",
    "sim.rotm10": "⟲ -10",
    "sim.rotm1": "-1",
    "sim.rotp1": "+1",
    "sim.rotp10": "+10 ⟳",
    "sim.targetLabel": "Target:",
    "sim.snap": "Snap to Target",
    "sim.hint": "Drag / Wheel / ← → / A D. Range 0–99.",
    "sim.innerTitle": "Internal Visualization",
    "sim.dir": "Direction",
    "sim.passes": "Passes",
    "sim.current": "Value",

    "ch.title": "Challenge Mode",
    "ch.desc": "A random <strong>4-number</strong> combo is set. Use <code>R(4) → L(3) → R(2) → L(1)</code> to open.",
    "ch.new": "Generate New Combo",
    "ch.reveal": "Reveal Answer",
    "ch.step": "Confirm Step (Enter)",

    "footer.repo": "Open the GitHub repository",

    "log.demoStart": "Demo: R(4) → L(3) → R(2) → L(1).",
    "log.learnReset": "Learn mode has been reset.",
    "log.finalOpen": "All four gates aligned. Real safes then turn the key; here we show OPEN.",
    "log.stepMsg": (idx, needDir, needPass, needNum, dirOK, passOK, atNumber) =>
      `STEP${idx}: dir=${needDir}, passes>=${needPass}, number=${needNum} → ${dirOK?'OK':'NG'} / ${passOK?'OK':'NG'} / ${atNumber?'OK':'NG'}`,
    "ch.progress.open": "OPEN success! Congratulations.",
    "ch.progress.notYet": "Gates are not aligned yet.",
    "ch.progress.stepDone": (step) => `STEP ${step} completed`,
    "ch.progress.reset": "Reset completed."
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

function t(key){const p=I18N[currentLang]||I18N[DEFAULT_LANG];const v=p[key];return typeof v==="string"?v:null;}
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
}
const langSelect=document.getElementById("lang-select");
if(langSelect){
  langSelect.value=currentLang;
  langSelect.addEventListener("change",e=>{
    const val=e.target.value;
    if(LANGS.includes(val)){
      currentLang=val;
      try {
        localStorage.setItem("lang",currentLang);
      } catch(e) {
        console.error('Failed to save language preference');
      }
      applyI18n(); render();
    }
  });
}
applyI18n();

/* -------------------- 本体ロジック -------------------- */
const MOD = 100;                // 0-99
const GATE_WIDTH = 14;
const FENCE_TOL = 8;

// 内部状態
const state = {
  value: 0,
  dir: null,            // 'L' or 'R'
  passes: 0,
  lastValue: 0,
  wheels: [
    { name: 'W1', gate: 10 }, // 第1ディスク
    { name: 'W2', gate: 40 }, // 第2ディスク
    { name: 'W3', gate: 70 }, // 第3ディスク
    { name: 'DW', gate: 20 }, // ドライビングディスク
  ],
  combo: [10,40,70,20],       // 4番号
  stepIndex: 0,               // 0..3
  targetPasses: [4,3,2,1],    // R4 → L3 → R2 → L1
  challenge: null,
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
const elFenceBar = document.getElementById('fence-bar');
const elFenceStatus = document.getElementById('fence-status');

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

const simButtons = document.querySelectorAll('.controls button[data-rot]');
const targetInput = document.getElementById('target-number');
targetInput.addEventListener('input', (e) => {
  let val = e.target.value;
  val = val.replace(/[^0-9]/g, '');
  if(val !== '') {
    let num = parseInt(val, 10);
    if(num > 99) {
      e.target.value = '99';
    } else if(num < 0) {
      e.target.value = '0';
    } else {
      e.target.value = num.toString();
    }
  }
});
const snapButton = document.getElementById('snap-target');
const simReset = document.getElementById('sim-reset');

const learnDemoBtn = document.getElementById('learn-demo');
const learnResetBtn = document.getElementById('learn-reset');
const learnLog = document.getElementById('learn-log');

const chNew = document.getElementById('challenge-new');
const chReveal = document.getElementById('challenge-reveal');
const chStep = document.getElementById('challenge-step');
const chReset = document.getElementById('challenge-reset');
const chMask = document.getElementById('challenge-mask');
const chProg = document.getElementById('challenge-progress');
const openBanner = document.getElementById('open-banner');

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
function valueToPx(n){const lane=260;return Math.round((n%MOD)/99*(lane-GATE_WIDTH));}

function updateGates(){
  elGateW1.style.left = valueToPx(state.wheels[0].gate)+'px';
  elGateW2.style.left = valueToPx(state.wheels[1].gate)+'px';
  elGateW3.style.left = valueToPx(state.wheels[2].gate)+'px';
  elGateDW.style.left = valueToPx(state.wheels[3].gate)+'px';
}
function updateDialFace(){
  elDial.style.transform = `rotate(${-(state.value*3.6)}deg)`;
  elDialValue.textContent = pad2(state.value);
  if(elValue) elValue.textContent = pad2(state.value);
  if(elDir) elDir.textContent = state.dir ?? '—';
  if(elPasses) elPasses.textContent = state.passes;
}
function checkFence(){
  const g = state.wheels.map(w=>w.gate%MOD);
  const avg = (g[0]+g[1]+g[2]+g[3])/4;
  const ok = g.every(v=>Math.abs(v-avg)<=FENCE_TOL);
  if(ok){
    elFenceBar.style.top='18px';
    elFenceStatus.textContent='FENCE: DOWN';
    elFenceStatus.style.color='var(--ok)';
  }else{
    elFenceBar.style.top='8px';
    elFenceStatus.textContent='FENCE: UP';
    elFenceStatus.style.color='var(--muted)';
  }
  return ok;
}
function render(){ updateDialFace(); updateGates(); checkFence(); }

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

// ディスク連動（簡易表現）
// R中は W1→W2→W3→DW へ強く影響、L中は逆順（DW→W3→W2→W1）へ強く影響
function driveDisks(){
  const k=0.15;
  if(state.dir==='R'){
    state.wheels[0].gate = (state.wheels[0].gate - 2*k + MOD)%MOD;
    state.wheels[1].gate = (state.wheels[1].gate - 1.2*k + MOD)%MOD;
    state.wheels[2].gate = (state.wheels[2].gate - 0.8*k + MOD)%MOD;
    state.wheels[3].gate = (state.wheels[3].gate - 0.5*k + MOD)%MOD;
  }else if(state.dir==='L'){
    state.wheels[3].gate = (state.wheels[3].gate + 2*k + MOD)%MOD;
    state.wheels[2].gate = (state.wheels[2].gate + 1.2*k + MOD)%MOD;
    state.wheels[1].gate = (state.wheels[1].gate + 0.8*k + MOD)%MOD;
    state.wheels[0].gate = (state.wheels[0].gate + 0.5*k + MOD)%MOD;
  }
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
    // 成功：該当ディスクのゲートを確定（学習上の分かりやすさのため）
    if(state.stepIndex===0) state.wheels[0].gate = state.combo[0]; // Disc1
    if(state.stepIndex===1) state.wheels[1].gate = state.combo[1]; // Disc2
    if(state.stepIndex===2) state.wheels[2].gate = state.combo[2]; // Disc3
    if(state.stepIndex===3) state.wheels[3].gate = state.combo[3]; // Driving

    state.stepIndex++;
    state.passes=0;

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
    openBanner.hidden=false;
    chProg.textContent=tr("ch.progress.open");
  }else{
    chProg.textContent=tr("ch.progress.notYet");
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
  const tick=()=>{ if(i>=tasks.length) return; tasks[i++](); setTimeout(tick,delay); };
  tick();
}
function rotateTo(dir,target,passes){
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
      }
    }
  },16);
}
function stepConfirm(){ tryStepConfirm(); }

// チャレンジ
function challengeNew(){
  const getRandom = () => Math.floor(Math.random()*100);
  const a=getRandom();
  const b=getRandom();
  const c=getRandom();
  const d=getRandom();
  state.combo=[a,b,c,d];
  state.challenge={combo:[a,b,c,d], solved:false};
  chMask.textContent='??? - ??? - ??? - ???';
  chProg.textContent='R(4) → L(3) → R(2) → L(1)';
  openBanner.hidden=true;
  resetAll(false);
}
function challengeReveal(){
  if(!state.combo || state.combo.length !== 4) return;
  const [a,b,c,d]=state.combo;
  chMask.textContent=`${pad2(a)} - ${pad2(b)} - ${pad2(c)} - ${pad2(d)}`;
}
function challengeReset(){
  resetAll();
  chProg.textContent=tr("ch.progress.reset");
  openBanner.hidden=true;
}

// リセット
function resetAll(full=true){
  state.value=0; state.lastValue=0; state.dir=null; state.passes=0;
  state.stepIndex=0;
  if(full) state.combo=[10,40,70,20];
  // ゲートを現在のコンボに合わせて初期化
  state.wheels[0].gate=state.combo[0];
  state.wheels[1].gate=state.combo[1];
  state.wheels[2].gate=state.combo[2];
  state.wheels[3].gate=state.combo[3];
  render();
}

// イベント
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
  const deg=diff*(180/Math.PI); const ticks=Math.round(deg/3.6);
  rotate(ticks-((state.value-startValue+MOD)%MOD));
});
elDial.addEventListener('pointerup',e=>{ dragging=false; elDial.releasePointerCapture(e.pointerId); });

simButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{ const delta=parseInt(btn.dataset.rot,10); rotate(delta); });
});
snapButton.addEventListener('click',()=>{
  let t=parseInt(targetInput.value||'0',10);
  if(isNaN(t) || t<0 || t>99) {
    targetInput.value = '0';
    t = 0;
  }
  t=Math.max(0,Math.min(99,t));
  targetInput.value = t;
  const cw=((state.value-t)+MOD)%MOD, ccw=((t-state.value)+MOD)%MOD;
  if(cw<=ccw){ for(let i=0;i<cw;i++) rotate(-1); } else { for(let i=0;i<ccw;i++) rotate(+1); }
});
simReset.addEventListener('click',()=>resetAll());

// 学習
learnResetBtn.addEventListener('click',learnReset);
learnDemoBtn.addEventListener('click',learnDemo);

// チャレンジ
chNew.addEventListener('click',challengeNew);
chReveal.addEventListener('click',challengeReveal);
chReset.addEventListener('click',challengeReset);
chStep.addEventListener('click',()=>{
  if(state.stepIndex<4){
    if(tryStepConfirm()) chProg.textContent = tr("ch.progress.stepDone", state.stepIndex);
  }else{
    tryOpen();
  }
});

// キーボード
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft') rotate(-1);
  if(e.key==='ArrowRight') rotate(+1);
  if(e.key.toLowerCase()==='a') rotate(-1);
  if(e.key.toLowerCase()==='d') rotate(+1);
  if(e.key==='Enter'){
    if(document.getElementById('challenge').classList.contains('active')) chStep.click();
    else stepConfirm();
  }
  if(e.key.toLowerCase()==='r') resetAll();
});

// 初期描画
render();
