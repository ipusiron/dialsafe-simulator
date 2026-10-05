// 画面の文言（日本語・英語で同じキー）。t(key, vars, lang) で {name} を値に置き換える。globalThis.DialMessages に置く
// 文中の **…** は太字、改行（\n）は改行として i18n.js が要素で組み立てる（HTML として解釈しない）
(() => {
  'use strict';

  const ja = {
    'ui.subtitle': '金庫ダイヤルシミュレーター（4枚座の固定ダイヤル錠・正規の開け方を可視化）',
    'ui.tabsLabel': '表示の切り替え',
    'ui.langButton': 'English',
    'ui.langLabel': 'Switch to English',
    'ui.repo': '🔗 GitHubリポジトリ',
    'theme.toDark': 'ダークモードに切り替える',
    'theme.toLight': 'ライトモードに切り替える',
    'tab.learn': '学習',
    'tab.sim': 'シミュレーター',

    'learn.whatIs.title': '固定ダイヤル錠とは',
    'learn.whatIs.desc1': '固定ダイヤル錠（固定変換ダイヤル錠）は、日本の家庭用耐火金庫で広く使用される機械式の錠前です。0〜99の目盛りが刻まれたダイヤルを、決められた番号と手順で回転させることで開錠します。',
    'learn.whatIs.desc2': '電子錠と異なり電源不要で、適切にメンテナンスすれば数十年以上使用可能です。番号の組み合わせは工場出荷時に設定され、通常は変更できません（固定式）。4枚座の場合、理論上の組み合わせは100⁴＝1億通りとなります。',
    'learn.whatIs.desc3': '正しい操作手順（右回転→左回転の交互）と、各番号での正確な通過回数が両方揃って初めて開錠する仕組みです。',
    'learn.whatIs.desc4': '固定ダイヤル錠はダイヤル錠の中でもっともシンプルな構造を持ち、それほど高い安全性は持ちません。',
    'learn.whatIs.alt': '固定ダイヤル錠の外観',

    'learn.structure.title': '固定ダイヤル錠の構造',
    'learn.structure.components': '主要部品',
    'learn.components.dial': '**目盛盤（つまみ）**：0-99の目盛りが印字された操作部、直径が大きいほど高級',
    'learn.components.base': '**表座（指標つき台座）**：赤い指標または切り込み線付きの台座、基準位置を示す',
    'learn.components.discs': '**第1〜第3ディスク**：各ディスクにゲート1個とツク2個を配置（第2・第3ディスク）',
    'learn.components.driving': '**ドライビングディスク（駆動座）**：目盛盤と芯棒で直結、他より大きく、ツク1個',
    'learn.components.spindle': '**芯棒**：ドライビングディスクのみと接続、パイプ内を通る中心軸',
    'learn.components.spring': '**テンションスプリング**：各ディスクを密着させ、ツク同士の接触を保つ',
    'learn.components.dimension': '**L寸法**：表座からドライビングディスクまでの距離、扉厚より大きく必要',
    'learn.structure.mechanism': '芯棒を介して**ドライビングディスクのみ**が目盛盤と直結し、最初にドライブされます。'
      + '他ディスクは**テンションスプリング**で密着し、各ディスクの**ツク（突起）**同士が当たりながら順次回転を伝達。バネが弱くなるとツクが空回りして故障の原因となります。4つの**ゲート（切り欠き）**が一直線に揃うと閂を引き込んで開錠します。',
    'learn.structure.alt': '耐火金庫の固定ダイヤル錠の各要素名称',
    'learn.structure.altBottom': '固定ダイヤル錠と鍵の錠前の連動',

    'learn.mechanism.title': '開錠メカニズム',
    'learn.mechanism.desc1': '固定ダイヤル錠が開錠する理由は、**4つのゲート（切り欠き）が一直線に揃う**ことで**フェンス**という部品が落ち、**閂（かんぬき）**を引き込めるようになるからです。',
    'learn.mechanism.fig1': '**図1：施錠状態**\nゲートが揃っていないため、フェンスが上がったまま。閂が出て扉は開かない。',
    'learn.mechanism.fig2': '**図2：一部のゲートが揃った状態**\n一部のゲートは合っているが、すべてが揃っていないためフェンスは落ちない。',
    'learn.mechanism.fig3': '**図3：完全解錠状態**\n4つすべてのゲートが一直線に揃い、フェンスが落ちて閂を引き込める。',
    'learn.mechanism.alt1': '図1：施錠状態',
    'learn.mechanism.alt2': '図2：一部のゲートが揃った状態',
    'learn.mechanism.alt3': '図3：完全解錠状態',
    'learn.mechanism.note': '💡 重要：**正確な手順**で操作することで、4つのディスクのゲートを順次正しい位置に配置し、最終的に一直線に揃えることができます。これが「正規の開錠」の原理です。',

    'learn.operation.title': '操作法',
    'learn.desc': '固定ダイヤル錠（4枚座）は、**第1〜第3ディスク＋ドライビングディスク**の4つのゲートを一直線に揃えると**フェンス**が落ち、閂を引き込めます。',
    'learn.step1': '① 右（R）に**4回以上**まわして、**1番目**の数値で停止',
    'learn.step2': '② 左（L）に**3回**まわして、**2番目**の数値で停止',
    'learn.step3': '③ 右（R）に**2回**まわして、**3番目**の数値で停止',
    'learn.step4': '④ 左（L）に**1回**まわして、**4番目**の数値で停止',
    'learn.note': '⚠️ 重要：「○回まわす」は**その番号が指標を○回通過する**という意味です。**「0」を○回通過させるのではありません！**\n例：「右に4回まわして10で停止」= 10が指標を4回通過してから停止（3回通り過ぎて、4回目はピッタリ止める）。回し過ぎたらやり直し。',
    'learn.direction': '右は**時計回り**、左は反時計回りです。ダイヤルの目盛りは時計回りに増えるので、**右に回すと指標の下の数字は小さくなり**、左に回すと大きくなります。',
    'learn.key': '4つの番号を合わせたら、最後に鍵を挿して右（時計回り）に回し、扉を開けます。',

    'learn.operation.alt': '固定ダイヤル錠のダイヤル目盛り（0の右隣が10）',
    'learn.why.title': 'なぜこの回数なのか',
    'learn.why.desc1': 'ドライビングディスクのツクは、反対向きに回し始めてから**ほぼ1回転**して、ようやく第3ディスクのツクに反対側から当たります。第3ディスクが第2ディスクを、第2ディスクが第1ディスクを拾うときも同じです。',
    'learn.why.desc2': '本ツールの模型（ツクの厚み{pin}目盛り）では、左に回して止めた状態から右へ回すと、第3・第2・第1ディスクは**{d3}・{d2}・{d1}目盛り**で動き出します。',
    'learn.why.desc3': '右4回目で止めれば、どの状態から始めても3枚とも拾い切れます。'
      + '続く左3回目では第2ディスクまで、右2回目では第3ディスクまでを動かし、先に合わせたディスクには触れません。最後の左1回目はドライビングディスクだけを動かします。回し過ぎると、合わせたディスクを拾って動かしてしまうので、最初からやり直しです。',
    'learn.why.demo': '自動実演で動きを見る',

    'sim.dialTitle': 'ダイヤル',
    'sim.dialLabel': 'ダイヤル。→キーで右（時計回り）、←キーで左（反時計回り）に1目盛り。Shiftを押しながらで10目盛り',
    'sim.dialRole': 'ダイヤル',
    'sim.reading': '指標の数字',
    'btn.left': '↺ 左へ（反時計回り）',
    'btn.right': '右へ（時計回り）↻',
    'sim.hint': 'ダイヤルをドラッグするか、ボタンを押し続けて回します。ダイヤルを選んでから←→キーでも回せます（Shiftで10目盛り）。右に回すと数字は小さくなります。',
    'btn.key': '🔑 鍵を回す',
    'btn.reset': 'リセット',
    'sim.open': 'OPEN：フェンスが落ちて閂を引き込めました。扉を開けられます。',
    'sim.notOpen': '開きません。フェンスが落ちる位置に揃っていないゲート: {list}',
    'sim.locked': '開いている間はダイヤルを回せません。リセットで閉めます。',
    'sim.resetDone': '初期状態（左に回して止めた状態）に戻しました。',

    'guide.title': '手順ガイド',
    'guide.card': '番号カード',
    'guide.step1': '右に回し、{n}を4回目で止める（4回以上）',
    'guide.step2': '左に回し、{n}を3回目で止める',
    'guide.step3': '右に回し、{n}を2回目で止める',
    'guide.step4': '左に回し、{n}を1回目で止める',
    'guide.note': 'ガイドは取扱説明書の手順をなぞって回数を数えます。開くかどうかは、ガイドではなくゲートの位置で決まります。',
    'guide.start': '右に回して始めます。1番目の番号{n}を4回目で止めます。',
    'guide.turning': 'STEP{s}：{dir}へ。{n}が指標に来た回数は{k}回です（{need}回目で止める）。',
    'guide.ready': 'STEP{s}：{n}に合わせました。ここで向きを変え、{next}へ回します。',
    'guide.readyLast': '4つの番号を合わせました。鍵を回してください。',
    'guide.past': '{n}を通り過ぎました。もう一度右へ回して{n}に合わせます（4回以上なら何回目でもよい）。',
    'guide.over': 'STEP{s}：{n}を通り過ぎました（回し過ぎ）。右に回して最初からやり直します。',
    'guide.restart': '向きを変えた所が違いました（{n}の{need}回目で向きを変えます）。右に回して最初からやり直します。',
    'guide.wrongStart': '最初は右に回します。',
    'guide.again': 'やり直し中です。',
    'ui.sep': '、',
    'guide.dirR': '右',
    'guide.dirL': '左',

    'inner.title': '内部の動き',
    'inner.legend.gate': 'ゲート（切り欠き）',
    'inner.legend.front': 'ツク（押される側）',
    'inner.legend.back': 'ツク（押す側）',
    'inner.fence': 'フェンス',
    'inner.wheel.3': 'ドライビングディスク',
    'inner.wheel.2': '第3ディスク',
    'inner.wheel.1': '第2ディスク',
    'inner.wheel.0': '第1ディスク',
    'inner.offset': 'ずれ {o}',
    'inner.aligned': '揃った',
    'inner.contactR': '右回しの側でツクが当たっている',
    'inner.contactL': '左回しの側でツクが当たっている',
    'inner.free': 'ツクが離れている（遊びの中）',
    'inner.direct': '芯棒で直結',
    'inner.fenceUp': 'フェンス：上がったまま（ゲートが揃っていない）',
    'inner.fenceReady': 'フェンス：落ちる位置（鍵を回せば開く）',
    'inner.fenceDown': 'フェンス：落ちた（開錠）',
    'inner.note': '中央の線がフェンスの位置です。各ディスクの橙色のゲートが線の上に揃うと、フェンスが落ちます。上下に並ぶツクが触れると、上のディスクが下のディスクを押して一緒に回します。',

    'demo.title': '自動実演',
    'demo.lead': '左に回して止めた状態から、模型を実際に1目盛りずつ回します。',
    'demo.btn1': '① 正確な操作',
    'demo.btn2': '② 右に5回（多め）',
    'demo.btn3': '③ 右に3回（不足）',
    'demo.btn4': '④ 最後に左へ2回（回し過ぎ）',
    'demo.btn5': '⑤ STEP2で番号違い',
    'demo.speed': '速さ',
    'demo.speedSlow': 'ゆっくり',
    'demo.speedNormal': 'ふつう',
    'demo.speedFast': '速い',
    'demo.stop': '止める',
    'demo.stopped': '実演を止めました。',
    'demo.head1': '実演①：正確な操作（右4・左3・右2・左1）',
    'demo.head2': '実演②：最初に右へ多めに回す（右5・左3・右2・左1）',
    'demo.head3': '実演③：最初の右が3回だけ（右3・左3・右2・左1）',
    'demo.head4': '実演④：最後に左へ2回まわす（右4・左3・右2・左2）',
    'demo.head5': '実演⑤：STEP2で違う番号{n}に合わせる（正しくは{c}）',
    'demo.segment': 'STEP{s}：{dir}へ{moves}目盛り回し、{n}が{k}回目に来た所で止める',
    'demo.keyOpen': '→ 鍵を回すと開いた',
    'demo.keyFail': '→ 鍵を回しても開かない（{list}）',
    'demo.explain1': '4枚のゲートがすべてフェンスの位置に揃いました。',
    'demo.explain2': '右4回目までに3枚とも拾い切っているので、それ以上回しても結果は同じです。',
    'demo.explain3': '右に4回以上は、どの状態から始めても3枚を拾い切るための回数です。この実演は左に回して止めた状態から始めたので、第1ディスクを拾うまでに{need}目盛り必要なのに、{moves}目盛りで止めました。直前に右へ回していた場合などは、3回でも開くことがあります。',
    'demo.explain4': '最後に左へ1回転より多く回すと、ドライビングディスクのツクが第3ディスクを拾い、合わせた位置から動かしてしまいます。',
    'demo.explain5': '第2ディスクのゲートが、番号の差のぶん（{d}目盛り）ずれます。',
    'wheel.name.0': '第1ディスク',
    'wheel.name.1': '第2ディスク',
    'wheel.name.2': '第3ディスク',
    'wheel.name.3': 'ドライビングディスク',
    'wheel.offset': '{name} {o}',
    'learn.lock.title': '施錠のときに右へ4回転以上回す理由',
    'learn.lock.desc1': '扉を閉めただけでは、4つのゲートは揃ったままです。番号を知らなくても、鍵だけで開いてしまいます。',
    'learn.lock.desc2': '金庫の取扱説明書には、施錠のあとダイヤルを右に4回転以上回すように書かれているものがあります（回さないと番号合わせが容易になり、開けられやすくなる）。'
      + 'シミュレーターでは、開けたあと「閉める」で確かめられます。',
    'learn.combo.title': '組み合わせの数',
    'learn.combo.desc1': '番号は4つで、名目の組み合わせは100⁴＝1億通りです。ただし、正規の手順で開けられる番号には条件があります。'
      + 'たとえば2番目の番号が1番目に近すぎると、左3回目で止める前に第1ディスクを拾ってしまいます。',
    'learn.combo.desc2': '本ツールの模型（ツクの厚み{pin}目盛り）では、前の番号から次の番号まで回す向きに数えた目盛り数の上限が、STEP2で{g2}、STEP3で{g3}、STEP4で{g4}です。'
      + 'ゲートがぴったり揃う組み合わせは**{count}通り（約{pct}%）**です。また、ゲートは±{tol}目盛りずれても開くので、隣の番号に合わせても開くことがあります。',
    'practice.new': '🎲 新しい番号で練習',
    'practice.default': '既定の番号に戻す',
    'practice.hide': '内部の動きを隠す',
    'practice.hidden': '内部の動きは隠しています。手順だけで開けてみましょう。',
    'practice.show': '内部を見る',
    'practice.started': '新しい番号で練習します。ダイヤルとディスクの初期状態もランダムです。',
    'practice.back': '既定の番号（94-30-84-13）に戻しました。',
    'guide.cardPractice': '番号カード（練習）',
    'sim.notOpenHidden': '開きません。右に4回以上回して、最初からやり直してください。',
    'btn.close': '🚪 閉める',
    'sim.closed': '扉を閉めて閂を出しました。施錠の手順では、ここでダイヤルを右に4回転以上回して番号を崩します。',
    'sim.scrambled': '右に4回転以上回して、番号を崩しました。',
    'sim.openUnscrambled': 'OPEN：閉めたあと番号を崩していないので、ゲートが揃ったままでした。番号を知らなくても鍵だけで開きます。',
    'demo.btn6': '⑥ 左から始める（同じ番号）',
    'demo.head6': '実演⑥：左から始める（左4・右3・左2・右1、同じ番号）',
    'demo.explain6': '押す側が逆になるので、ゲートがツクの厚みのぶんずれます。この模型で左から始めて開けるには、番号を{left}にずらす必要があります。'
  };

  const en = {
    'ui.subtitle': 'Safe dial simulator — visualize the legitimate opening of a 4-disc fixed dial lock',
    'ui.tabsLabel': 'Choose a view',
    'ui.langButton': '日本語',
    'ui.langLabel': '日本語に切り替える',
    'ui.repo': '🔗 GitHub repository',
    'theme.toDark': 'Switch to dark mode',
    'theme.toLight': 'Switch to light mode',
    'tab.learn': 'Learn',
    'tab.sim': 'Simulator',

    'learn.whatIs.title': 'What is a fixed dial lock?',
    'learn.whatIs.desc1': 'A fixed dial lock (fixed conversion dial lock) is a mechanical lock widely used in home fire-resistant safes in Japan. '
      + 'It opens when a dial marked 0 to 99 is turned to a predetermined combination in a set sequence.',
    'learn.whatIs.desc2': 'Unlike electronic locks, it needs no power and can last for decades with proper maintenance. '
      + 'The combination is set at the factory and usually cannot be changed (fixed type). '
      + 'With 4 discs, there are 100⁴ = 100 million combinations in theory.',
    'learn.whatIs.desc3': 'It opens only when both the correct sequence (alternating right and left) '
      + 'and the exact number of passes at each number are followed.',
    'learn.whatIs.desc4': 'The fixed dial lock has the simplest structure among dial locks and does not offer particularly high security.',
    'learn.whatIs.alt': 'A fixed dial lock',

    'learn.structure.title': 'Structure of a fixed dial lock',
    'learn.structure.components': 'Main components',
    'learn.components.dial': '**Dial (knob)**: the operating part printed with the 0–99 scale; a larger diameter means a higher grade',
    'learn.components.base': '**Base plate (with index)**: a base with a red index or a cut line that shows the reference position',
    'learn.components.discs': '**Discs 1–3**: each disc has 1 gate and 2 pins (Discs 2 and 3)',
    'learn.components.driving': '**Driving disc**: connected directly to the dial by the spindle; larger than the others, with 1 pin',
    'learn.components.spindle': '**Spindle**: the central shaft through the tube, connected only to the driving disc',
    'learn.components.spring': '**Tension spring**: presses the discs together and keeps the pins in contact',
    'learn.components.dimension': '**L dimension**: the distance from the base plate to the driving disc; must be larger than the door thickness',
    'learn.structure.mechanism': 'Only the **driving disc** is connected directly to the dial through the spindle, so it is driven first. '
      + 'The other discs are pressed together by the **tension spring**, and the **pins** of the discs pass the rotation on as they meet. '
      + 'If the spring weakens, the pins slip and the lock fails. When the four **gates (notches)** line up, the bolt can be retracted.',
    'learn.structure.alt': 'Names of the parts of a fixed dial lock in a fire-resistant safe',
    'learn.structure.altBottom': 'How the fixed dial lock works with the key lock',

    'learn.mechanism.title': 'How it opens',
    'learn.mechanism.desc1': 'The fixed dial lock opens because, when **the four gates (notches) line up**, a part called the **fence** drops '
      + 'and the **bolt** can be retracted.',
    'learn.mechanism.fig1': '**Figure 1: locked**\nThe gates are not lined up, so the fence stays up. The bolt is out and the door does not open.',
    'learn.mechanism.fig2': '**Figure 2: some gates lined up**\nSome gates are in place, but not all, so the fence does not drop.',
    'learn.mechanism.fig3': '**Figure 3: unlocked**\nAll four gates line up, the fence drops and the bolt can be retracted.',
    'learn.mechanism.alt1': 'Figure 1: locked',
    'learn.mechanism.alt2': 'Figure 2: some gates lined up',
    'learn.mechanism.alt3': 'Figure 3: unlocked',
    'learn.mechanism.note': '💡 Important: following the **correct sequence** places the gates of the four discs one by one and finally lines them up. '
      + 'This is the principle of legitimate opening.',

    'learn.operation.title': 'How to operate',
    'learn.desc': 'A fixed dial lock (4 discs) opens when the gates of **Discs 1–3 and the driving disc** line up, so that the **fence** drops '
      + 'and the bolt can be retracted.',
    'learn.step1': '① Turn **right (R)** **4 or more times** and stop at the **1st** number',
    'learn.step2': '② Turn **left (L)** **3 times** and stop at the **2nd** number',
    'learn.step3': '③ Turn **right (R)** **2 times** and stop at the **3rd** number',
    'learn.step4': '④ Turn **left (L)** **once** and stop at the **4th** number',
    'learn.note': '⚠️ Important: "turn ○ times" means **the number itself comes to the index ○ times**. **It is not "0" passing ○ times!**\n'
      + 'Example: "turn right 4 times and stop at 10" = let 10 pass the index 3 times and stop exactly when it comes the 4th time. '
      + 'If you overshoot, start over.',
    'learn.direction': 'Right is **clockwise** and left is counterclockwise. The dial scale increases clockwise, '
      + 'so **turning right makes the number under the index smaller**, and turning left makes it larger.',
    'learn.key': 'After the four numbers, insert the key, turn it right (clockwise) and open the door.',

    'learn.operation.alt': 'The scale of a fixed dial lock (10 is to the right of 0)',
    'learn.why.title': 'Why these counts?',
    'learn.why.desc1': 'After you reverse, the pin of the driving disc has to turn **almost a full revolution** before it meets the pin of Disc 3 '
      + 'from the other side. The same happens when Disc 3 picks up Disc 2 and Disc 2 picks up Disc 1.',
    'learn.why.desc2': 'In this tool\'s model (pins {pin} graduations thick), turning right from the state stopped after turning left '
      + 'starts Discs 3, 2 and 1 moving after **{d3}, {d2} and {d1} graduations**.',
    'learn.why.desc3': 'Stopping on the 4th time to the right picks up all three discs from any state. '
      + 'The 3rd time to the left then moves only up to Disc 2, and the 2nd time to the right only Disc 3, without touching the discs already set. '
      + 'The final once to the left moves only the driving disc. Overshooting picks up a disc you have already set, so you have to start over.',
    'learn.why.demo': 'See it in the demonstrations',

    'sim.dialTitle': 'Dial',
    'sim.dialLabel': 'Dial. The right arrow key turns it right (clockwise) and the left arrow key left (counterclockwise) by one graduation. '
      + 'Hold Shift for 10 graduations',
    'sim.dialRole': 'dial',
    'sim.reading': 'Number at the index',
    'btn.left': '↺ Left (counterclockwise)',
    'btn.right': 'Right (clockwise) ↻',
    'sim.hint': 'Drag the dial or hold a button to turn it. After selecting the dial, the ← → keys also turn it (Shift for 10). '
      + 'Turning right makes the number smaller.',
    'btn.key': '🔑 Turn the key',
    'btn.reset': 'Reset',
    'sim.open': 'OPEN: the fence dropped and the bolt can be retracted. The door can be opened.',
    'sim.notOpen': 'It does not open. Gates not lined up with the fence: {list}',
    'sim.locked': 'The dial cannot be turned while the lock is open. Reset to close it.',
    'sim.resetDone': 'Back to the initial state (stopped after turning left).',

    'guide.title': 'Step guide',
    'guide.card': 'Combination card',
    'guide.step1': 'Turn right and stop at {n} the 4th time (4 or more)',
    'guide.step2': 'Turn left and stop at {n} the 3rd time',
    'guide.step3': 'Turn right and stop at {n} the 2nd time',
    'guide.step4': 'Turn left and stop at {n} the 1st time',
    'guide.note': 'The guide follows the steps of the manual and counts. Whether the lock opens depends on the gates, not on the guide.',
    'guide.start': 'Start by turning right. Stop at the 1st number, {n}, the 4th time.',
    'guide.turning': 'STEP{s}: turn {dir}. {n} has come to the index {k} time(s) (stop on time {need}).',
    'guide.ready': 'STEP{s}: set to {n}. Now reverse and turn {next}.',
    'guide.readyLast': 'All four numbers are set. Turn the key.',
    'guide.past': 'You passed {n}. Keep turning right to {n} again (any time from the 4th is fine).',
    'guide.over': 'STEP{s}: you passed {n} (overshot). Turn right to start over.',
    'guide.restart': 'You reversed at the wrong place (reverse on time {need} at {n}). Turn right to start over.',
    'guide.wrongStart': 'Start by turning right.',
    'guide.again': 'Starting over. ',
    'ui.sep': ', ',
    'guide.dirR': 'right',
    'guide.dirL': 'left',

    'inner.title': 'Inside the lock',
    'inner.legend.gate': 'Gate (notch)',
    'inner.legend.front': 'Pin (pushed)',
    'inner.legend.back': 'Pin (pushing)',
    'inner.fence': 'Fence',
    'inner.wheel.3': 'Driving disc',
    'inner.wheel.2': 'Disc 3',
    'inner.wheel.1': 'Disc 2',
    'inner.wheel.0': 'Disc 1',
    'inner.offset': 'off by {o}',
    'inner.aligned': 'aligned',
    'inner.contactR': 'pins touching on the right-turn side',
    'inner.contactL': 'pins touching on the left-turn side',
    'inner.free': 'pins apart (in its play)',
    'inner.direct': 'fixed to the spindle',
    'inner.fenceUp': 'Fence: up (gates not lined up)',
    'inner.fenceReady': 'Fence: can drop (turn the key to open)',
    'inner.fenceDown': 'Fence: dropped (open)',
    'inner.note': 'The center line is the fence. When the orange gates of all discs are on the line, the fence drops. '
      + 'When pins in rows next to each other touch, the upper disc pushes the lower one and they turn together.',

    'demo.title': 'Demonstrations',
    'demo.lead': 'Turns the model one graduation at a time from the state stopped after turning left.',
    'demo.btn1': '① Correct',
    'demo.btn2': '② Right 5 times (extra)',
    'demo.btn3': '③ Right 3 times (too few)',
    'demo.btn4': '④ Left twice at the end (overshoot)',
    'demo.btn5': '⑤ Wrong number in STEP2',
    'demo.speed': 'Speed',
    'demo.speedSlow': 'Slow',
    'demo.speedNormal': 'Normal',
    'demo.speedFast': 'Fast',
    'demo.stop': 'Stop',
    'demo.stopped': 'Stopped the demonstration.',
    'demo.head1': 'Demo 1: correct (R4, L3, R2, L1)',
    'demo.head2': 'Demo 2: extra turns to the right first (R5, L3, R2, L1)',
    'demo.head3': 'Demo 3: only 3 turns to the right first (R3, L3, R2, L1)',
    'demo.head4': 'Demo 4: turning left twice at the end (R4, L3, R2, L2)',
    'demo.head5': 'Demo 5: setting the wrong number {n} in STEP2 (correct: {c})',
    'demo.segment': 'STEP{s}: turn {dir} {moves} graduations and stop at {n} on arrival {k}',
    'demo.keyOpen': '→ Turning the key opens the lock',
    'demo.keyFail': '→ Turning the key does not open the lock ({list})',
    'demo.explain1': 'All four gates lined up with the fence.',
    'demo.explain2': 'All three discs are picked up by the 4th time to the right, so turning more gives the same result.',
    'demo.explain3': 'Four or more turns to the right pick up all three discs from any state. '
      + 'This demonstration starts from the state stopped after turning left, so picking up Disc 1 needs {need} graduations, '
      + 'but it stopped after {moves}. If the dial was turned right just before, 3 turns can still open the lock.',
    'demo.explain4': 'Turning left more than a full revolution at the end makes the pin of the driving disc pick up Disc 3 '
      + 'and move it away from its set position.',
    'demo.explain5': 'The gate of Disc 2 is off by the difference between the numbers ({d} graduations).',
    'wheel.name.0': 'Disc 1',
    'wheel.name.1': 'Disc 2',
    'wheel.name.2': 'Disc 3',
    'wheel.name.3': 'Driving disc',
    'wheel.offset': '{name} {o}',
    'learn.lock.title': 'Why turn right 4 or more times when locking',
    'learn.lock.desc1': 'Just closing the door leaves the four gates lined up. The lock then opens with the key alone, without knowing the combination.',
    'learn.lock.desc2': 'Some safe manuals say to turn the dial right 4 or more times after locking '
      + '(otherwise setting the numbers becomes easy and the safe is easier to open). In the simulator, check it with "Close" after opening.',
    'learn.combo.title': 'How many combinations',
    'learn.combo.desc1': 'There are four numbers, so there are 100⁴ = 100 million combinations in name. '
      + 'However, a combination must meet conditions to be opened with the legitimate steps. '
      + 'For example, if the 2nd number is too close to the 1st, Disc 1 is picked up before you stop on the 3rd time to the left.',
    'learn.combo.desc2': 'In this tool\'s model (pins {pin} graduations thick), the graduations from one number to the next, counted in the turning direction, '
      + 'must be at most {g2} in STEP2, {g3} in STEP3 and {g4} in STEP4. **{count} combinations (about {pct}%)** line the gates up exactly. '
      + 'Also, a gate opens even when it is off by ±{tol} graduation, so a neighboring number can open the lock too.',
    'practice.new': '🎲 Practice with new numbers',
    'practice.default': 'Back to the default numbers',
    'practice.hide': 'Hide the inside of the lock',
    'practice.hidden': 'The inside of the lock is hidden. Try to open it with the steps alone.',
    'practice.show': 'Show the inside',
    'practice.started': 'Practicing with new numbers. The initial state of the dial and discs is random too.',
    'practice.back': 'Back to the default numbers (94-30-84-13).',
    'guide.cardPractice': 'Combination card (practice)',
    'sim.notOpenHidden': 'It does not open. Turn right 4 or more times and start over.',
    'btn.close': '🚪 Close',
    'sim.closed': 'Closed the door and the bolt is out. The locking steps now turn the dial right 4 or more times to scramble the numbers.',
    'sim.scrambled': 'Turned right 4 or more times and scrambled the numbers.',
    'sim.openUnscrambled': 'OPEN: the numbers were not scrambled after closing, so the gates stayed lined up. '
      + 'The key alone opens it without knowing the combination.',
    'demo.btn6': '⑥ Start to the left (same numbers)',
    'demo.head6': 'Demo 6: starting to the left (L4, R3, L2, R1, same numbers)',
    'demo.explain6': 'The pushing side is reversed, so the gates are off by the pin thickness. '
      + 'To open this model starting to the left, the numbers must be shifted to {left}.'
  };

  const MESSAGES = { ja, en };

  function t(key, vars = {}, lang) {
    const dict = MESSAGES[lang || (globalThis.DialI18n && globalThis.DialI18n.lang) || 'ja'] || ja;
    let text = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : key;
    for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
    return text;
  }

  globalThis.DialMessages = { MESSAGES, t };
})();
