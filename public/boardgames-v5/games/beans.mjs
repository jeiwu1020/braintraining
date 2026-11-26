export const meta = {
  title: "豆豆分碗",
  tagline: "選碗分豆、空碗搶對面，各 8 手拼最多豆。",
  rules: [
    "青隊在下方（青色碗）、橘隊在上方（橘色碗），各有 4 碗；一般每碗 4 顆，進階 2／6／3／5 顆，共 32 顆。",
    "點選自己非空的碗再按「確認分豆」。沿箭頭每碗放 1 顆，經過自己的收集碗也放，跳過對方收集碗。",
    "【空碗搶對面】最後一顆若剛好落在「自己原本空的號碗」且對面有豆，會把該顆與對面整碗一起搶進自己收集碗！",
    "與傳統播棋不同：本款每隊固定 8 次行動、不連走；16 次結束後只比收集碗豆數（剩豆不計分），同分平手。",
    "點選時會即時預覽落點與搶豆結果；一般電腦看當手收穫，進階電腦會多算對方下一手反擊。"
  ]
};

export function newGame(difficulty = "normal") {
  const a = difficulty === "advanced" ? [2, 6, 3, 5] : [4, 4, 4, 4];
  return { difficulty, board: [...a, 0, ...a, 0], turn: 0, ply: 0, done: false, path: [], captured: 0 };
}

export function legalMoves(s) {
  if (s.done || s.ply >= 16) return [];
  const a = (s.turn === 0 ? [0, 1, 2, 3] : [5, 6, 7, 8]).filter((i) => s.board[i] > 0);
  return a.length ? a : [-1];
}

export function play(s, move) {
  if (!legalMoves(s).includes(move)) throw new Error("不能選擇這一碗");
  const board = s.board.slice();
  const path = [];
  let captured = 0;
  if (move !== -1) {
    let n = board[move], i = move;
    board[move] = 0;
    while (n > 0) {
      i = (i + 1) % 10;
      if (i === (s.turn === 0 ? 9 : 4)) continue;
      board[i]++;
      path.push(i);
      n--;
    }
    const ownSmall = s.turn === 0 ? (i >= 0 && i <= 3) : (i >= 5 && i <= 8);
    const opposite = 8 - i;
    if (ownSmall && board[i] === 1 && board[opposite] > 0) {
      const store = s.turn === 0 ? 4 : 9;
      captured = board[opposite];
      board[store] += 1 + captured;
      board[i] = 0;
      board[opposite] = 0;
    }
  }
  const ply = s.ply + 1;
  return { ...s, board, turn: 1 - s.turn, ply, done: ply === 16, path, captured };
}

export function chooseAI(s, difficulty = s.difficulty || "normal") {
  const moves = legalMoves(s);
  if (!moves.length) return null;
  const store = s.turn === 0 ? 4 : 9, other = s.turn === 0 ? 9 : 4;
  let best = moves[0], score = -Infinity;
  for (const m of moves) {
    const n = play(s, m);
    let reply = 0;
    for (const r of difficulty === "advanced" ? legalMoves(n) : []) {
      const p = play(n, r);
      reply = Math.max(reply, p.board[other] - n.board[other]);
    }
    const v = (n.board[store] - s.board[store]) * 10 - reply * 5 + (n.board[store] - n.board[other]) * 0.1;
    if (v > score) { score = v; best = m; }
  }
  return best;
}

export function beginResolution(s, move) {
  const final = play(s, move), board = s.board.slice();
  const held = move === -1 ? 0 : board[move];
  if (move !== -1) board[move] = 0;
  return { board, held, path: final.path.slice(), source: move, index: 0, elapsed: 0, duration: 400, done: held === 0, final };
}

export function advanceResolution(r, ms, { paused = false, skip = false } = {}) {
  if (r.done || paused) return r;
  if (skip) return { ...r, board: r.final.board.slice(), held: 0, index: r.path.length, elapsed: 0, done: true };
  let n = { ...r, board: r.board.slice(), elapsed: r.elapsed + Math.max(0, ms) };
  while (n.elapsed >= n.duration && !n.done) {
    n.elapsed -= n.duration;
    n.board[n.path[n.index]]++;
    n.index++;
    n.held--;
    n.done = n.held === 0;
  }
  if (n.done) {
    n.elapsed = 0;
    n.board = r.final.board.slice();
  }
  return n;
}

export function mount(root, { mode = "ai", difficulty = "normal", onFinish = () => {}, isPaused = () => false } = {}) {
  let state = newGame(difficulty), selected = null, notice = "點自己顏色的一碗，預覽落點後再確認分豆。", alive = true, wait = 0, resolution = null, announced = false;
  const names = ["青隊", mode === "ai" ? "橘隊電腦" : "橘隊"];
  const human = () => mode !== "ai" || state.turn === 0;
  const blocked = () => !alive || state.done || resolution !== null || isPaused() || !human();

  function bowl(i) {
    const owner = i < 5 ? 0 : 1, store = i === 4 || i === 9, board = resolution?.board || state.board, n = board[i];
    const legal = !resolution && legalMoves(state).includes(i) && human() && !state.done;
    const preview = selected !== null && !resolution ? play(state, selected) : null;
    const delta = preview ? preview.board[i] - n : 0;
    const last = preview?.path.at(-1) === i;
    const bead = Array.from({ length: Math.min(n, 16) }, (_, j) => `<i style="--r:${(j * 31) % 45 - 22}deg"></i>`).join("");
    return `<${store ? "div" : "button"} data-position="${i}" ${store ? "" : `type="button" data-bowl="${i}" ${legal ? "" : "disabled"}`} class="beans-bowl ${store ? "beans-store" : ""} beans-owner-${owner} ${selected === i ? "beans-selected" : ""} ${last ? "beans-last" : ""} ${resolution?.path[resolution.index] === i ? "beans-receiving" : ""}" ${store ? "" : `aria-pressed="${selected === i}" aria-label="${names[owner]}第 ${owner === 0 ? i + 1 : i - 4} 碗，${n} 顆豆子"`}><span class="beans-bowl-label">${store ? names[owner] + "收集碗" : (owner === 0 ? i + 1 : i - 4) + " 號碗"}</span><span class="beans-beads" aria-hidden="true">${bead}</span><strong>${n}</strong>${delta !== 0 ? `<span class="beans-delta ${delta < 0 ? "is-steal" : ""}">${delta > 0 ? "+" : ""}${delta}</span>` : ""}</${store ? "div" : "button"}>`;
  }

  function render() {
    if (!alive) return;
    const left = [8 - Math.ceil(state.ply / 2), 8 - Math.floor(state.ply / 2)];
    const board = resolution?.board || state.board;
    const preview = selected !== null && !resolution ? play(state, selected) : null;
    const gain = preview ? preview.board[state.turn === 0 ? 4 : 9] - state.board[state.turn === 0 ? 4 : 9] : 0;
    const captureHit = preview?.captured || 0;
    root.innerHTML = `<section class="beans-game">
      <div class="beans-status" role="status" aria-live="polite">
        <strong class="beans-turn-team team-${state.turn}">${state.done ? "本局完成" : resolution ? `${names[state.turn]}正在分豆` : `${names[state.turn]}${human() ? "的回合" : "思考中…"}`}</strong>
        <span class="beans-score-pair"><em class="beans-score-0">青 ${board[4]}</em>：<em class="beans-score-1">橘 ${board[9]}</em></span>
        <small>剩餘：青 ${left[0]} 次／橘 ${left[1]} 次</small>
      </div>
      <div class="beans-table" aria-label="豆豆分碗棋盤">
        <div class="beans-lane-label beans-top-label beans-lane-1">▲ 橘隊 ←</div>
        <div class="beans-top">${[8, 7, 6, 5].map(bowl).join("")}</div>
        <div class="beans-stores">
          ${bowl(9)}
          <div class="beans-center">
            <b>${resolution ? `手中 ${resolution.held} 顆` : "共 32 顆 · 各 8 手"}</b>
            <small>${resolution ? "沿箭頭逐顆放下" : "最後落自己空碗＝搶對面！"}</small>
          </div>
          ${bowl(4)}
        </div>
        <div class="beans-bottom">${[0, 1, 2, 3].map(bowl).join("")}</div>
        <div class="beans-lane-label beans-lane-0">● 青隊 →</div>
        ${resolution && !resolution.done ? `<span class="beans-flying" aria-hidden="true"></span>` : ""}
      </div>
      <aside class="beans-action paper">
        <div class="beans-rule-tag">${difficulty === "advanced" ? "進階 · 2／6／3／5 開局" : "一般 · 每碗 4 顆"}</div>
        <h3>${resolution ? "看豆子落在哪裡" : selected !== null ? "確認這碗分豆？" : "選一碗、算落點"}</h3>
        <p aria-live="polite">${notice}</p>
        ${preview ? `<p class="beans-preview">這次可收集 <strong>+${gain} 顆</strong>${captureHit > 0 ? `<br><span class="beans-capture-hit">觸發空碗搶對面：多搶 ${captureHit} 顆！</span>` : ""}<br>亮框＝最後落點</p>` : ""}
        <div class="row">
          ${resolution ? `<button type="button" data-skip>略過動畫</button>` : !state.done && legalMoves(state)[0] === -1 && human() ? `<button type="button" data-pass>空碗略過</button>` : `<button type="button" class="primary" data-confirm ${selected === null || !human() || state.done ? "disabled" : ""}>確認分豆</button>`}
          ${selected !== null && !resolution ? `<button type="button" data-cancel>取消</button>` : ""}
        </div>
        <p class="beans-footnote">各 8 次行動、不連走；落己方空碗可搶對面整碗。最後只比收集碗。</p>
      </aside>
    </section>`;
    root.querySelectorAll("[data-bowl]").forEach((b) => b.addEventListener("click", () => {
      if (blocked()) return;
      selected = Number(b.dataset.bowl);
      notice = `已選 ${names[state.turn]} ${state.turn === 0 ? selected + 1 : selected - 4} 號碗。`;
      render();
    }));
    root.querySelector("[data-confirm]")?.addEventListener("click", () => { if (!blocked() && selected !== null) act(selected); });
    root.querySelector("[data-cancel]")?.addEventListener("click", () => { if (blocked()) return; selected = null; notice = "重新選一碗。"; render(); });
    root.querySelector("[data-pass]")?.addEventListener("click", () => { if (!blocked()) act(-1); });
    root.querySelector("[data-skip]")?.addEventListener("click", () => {
      if (!alive || isPaused() || !resolution) return;
      resolution = advanceResolution(resolution, 0, { skip: true });
      complete();
    });
    positionFlight();
  }

  function positionFlight() {
    if (!resolution || resolution.done) return;
    const fly = root.querySelector(".beans-flying"), table = root.querySelector(".beans-table"), from = root.querySelector(`[data-position="${resolution.source}"]`), to = root.querySelector(`[data-position="${resolution.path[resolution.index]}"]`);
    if (!fly || !table || !from || !to) return;
    const t = table.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), p = resolution.elapsed / resolution.duration;
    const x = (a.left + a.width / 2) * (1 - p) + (b.left + b.width / 2) * p - t.left - table.clientLeft;
    const y = (a.top + a.height / 2) * (1 - p) + (b.top + b.height / 2) * p - t.top - table.clientTop - Math.sin(Math.PI * p) * 35;
    fly.style.transform = `translate(${x}px,${y}px) rotate(${p * 100}deg)`;
  }

  function complete() {
    if (!resolution?.done) return;
    const who = state.turn, old = state.board[who === 0 ? 4 : 9], wasPass = resolution.source === -1;
    const captured = resolution.final.captured || 0;
    state = resolution.final; resolution = null; wait = 0;
    const gained = state.board[who === 0 ? 4 : 9] - old;
    notice = wasPass
      ? `${names[who]}空碗，略過 1 次。`
      : captured > 0
        ? `${names[who]}觸發空碗搶對面，一口氣收進 ${gained} 顆（含搶來 ${captured} 顆）！`
        : `${names[who]}收集 ${gained} 顆。`;
    render();
    if (state.done && !announced) {
      announced = true;
      const a = state.board[4], b = state.board[9];
      onFinish({
        title: a === b ? "平手！一起分享豆子" : `${names[a > b ? 0 : 1]}獲勝！`,
        summary: `青隊 ${a} 分，橘隊 ${b} 分。雙方各完成 8 次行動；桌上剩餘 ${32 - a - b} 顆不計分。`
      });
    }
  }

  function act(move) {
    resolution = beginResolution(state, move);
    selected = null; wait = 0;
    notice = "拿起整碗，沿箭頭逐顆放下；跳過對方收集碗。";
    if (resolution.done) complete(); else render();
  }

  const timer = setInterval(() => {
    if (!alive || state.done || isPaused()) return;
    if (resolution) {
      const index = resolution.index;
      resolution = advanceResolution(resolution, 40);
      if (resolution.done) complete();
      else if (resolution.index !== index) render();
      else positionFlight();
      return;
    }
    if (human()) return;
    wait += 40;
    if (wait >= 800) act(chooseAI(state, difficulty));
  }, 40);

  const resize = () => positionFlight();
  globalThis.window?.addEventListener("resize", resize);
  render();
  return {
    destroy() { alive = false; resolution = null; clearInterval(timer); globalThis.window?.removeEventListener("resize", resize); root.innerHTML = ""; },
    restart() { state = newGame(difficulty); resolution = null; selected = null; wait = 0; announced = false; notice = "新的一局，青隊先選一碗。"; render(); }
  };
}
