/*
 * "Alarm Run" — an original side-scrolling platformer for S-95 study.
 * Run through each building floor, bump red ALARM BLOCKS from below to answer exam questions,
 * stomp smoke puffs, collect badges, and grab log-book pages for quick facts.
 */
window.S95 = window.S95 || {};

/* ---------------- Tiny sound engine (WebAudio, no files) ---------------- */
S95.sound = (function () {
  let ctx = null, muted = false, buzz = null;
  try { muted = localStorage.getItem("s95.muted") === "1"; } catch (e) {}
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, slide) {
    if (muted) return; const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(freq, c.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.06, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
  }
  return {
    get muted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem("s95.muted", muted ? "1" : "0"); } catch (e) {} if (muted) this.buzzer(false); return muted; },
    jump()   { tone(380, 0.15, "square", 0.05, 760); },
    coin()   { tone(988, 0.07, "square", 0.05); setTimeout(() => tone(1319, 0.12, "square", 0.05), 60); },
    stomp()  { tone(200, 0.12, "triangle", 0.09, 80); },
    hurt()   { tone(300, 0.3, "sawtooth", 0.06, 90); },
    bump()   { tone(150, 0.08, "square", 0.07); },
    right()  { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.12, "square", 0.05), i * 80)); },
    wrong()  { tone(220, 0.25, "sawtooth", 0.06); setTimeout(() => tone(165, 0.35, "sawtooth", 0.06), 180); },
    page()   { tone(660, 0.08, "triangle", 0.07); setTimeout(() => tone(880, 0.1, "triangle", 0.07), 70); },
    win()    { [523, 659, 784, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.16, "square", 0.05), i * 120)); },
    buzzer(on) {
      if (!on || muted) { if (buzz) { clearInterval(buzz); buzz = null; } return; }
      if (buzz) return;
      buzz = setInterval(() => tone(2900, 0.12, "square", 0.02), 500);
    }
  };
})();

/* ---------------- Level list ---------------- */
S95.gameLevels = function () {
  const lv = S95.topics.map((t, i) => ({ idx: i, topic: t.id, name: `Floor ${i + 1}`, title: t.title, icon: t.icon, blocks: 5 }));
  lv.push({ idx: lv.length, topic: null, name: "Rooftop", title: "Final Exam Tower (all topics)", icon: "🏆", blocks: 10 });
  return lv;
};

S95.Game = (function () {
  const T = 32, VW = 960, VH = 544, ROWS = 17;
  const SOLID = { "#": 1, "=": 1, "A": 1, "U": 1 };

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- Procedural level: always beatable (gaps ≤ 3, steps ≤ 2) ---------- */
  function buildLevel(level, seed) {
    const r = rng(seed * 7919 + 17);
    const d = Math.min(level.idx, 12);
    const W = 150 + d * 12 + (level.topic ? 0 : 60);
    const h = new Array(W).fill(14);
    const plats = []; // {x, len, row}
    let x = 14, cur = 14;
    while (x < W - 22) {
      const roll = r();
      if (roll < 0.22 && x > 18) {                       // gap
        const gw = 2 + (r() < 0.2 + d * 0.02 ? 1 : 0);
        for (let i = 0; i < gw; i++) h[x + i] = -1;
        x += gw;
        for (let i = 0; i < 4; i++) h[x + i] = cur; x += 4;
      } else if (roll < 0.45) {                           // step up / down
        const delta = (r() < 0.5 ? -1 : 1) * (1 + (r() < 0.4 ? 1 : 0));
        cur = Math.max(10, Math.min(14, cur + delta));
        const len = 4 + Math.floor(r() * 4);
        for (let i = 0; i < len; i++) h[x + i] = cur; x += len;
      } else if (roll < 0.65) {                           // floating beam (sometimes over a gap)
        const len = 9 + Math.floor(r() * 3);
        for (let i = 0; i < len; i++) h[x + i] = cur;
        plats.push({ x: x + 2, len: 5, row: cur - 4 });
        x += len;
      } else {                                            // flat run
        const len = 5 + Math.floor(r() * 5);
        for (let i = 0; i < len; i++) h[x + i] = cur; x += len;
      }
    }
    for (; x < W; x++) h[x] = 14;
    // Smooth: never allow a rise > 2 rows between neighboring solid columns
    for (let i = 1; i < W; i++) if (h[i] > 0 && h[i - 1] > 0 && h[i - 1] - h[i] > 2) h[i] = h[i - 1] - 2;

    const grid = []; for (let y = 0; y < ROWS; y++) grid.push(new Array(W).fill("."));
    for (let c = 0; c < W; c++) if (h[c] > 0) for (let y = h[c]; y < ROWS; y++) grid[y][c] = "#";
    plats.forEach(p => { for (let i = 0; i < p.len; i++) if (p.row > 2) grid[p.row][p.x + i] = "="; });

    const coins = [], pages = [], enemies = [], blocks = [];
    plats.forEach(p => { for (let i = 0; i < p.len; i++) coins.push({ x: (p.x + i) * T + 16, y: (p.row - 1) * T + 16, got: false }); });

    // Alarm blocks: spread evenly along the course on safe flat ground
    const n = level.blocks;
    const okCol = c => c > 8 && c < W - 12 && h[c] > 0 && h[c - 1] === h[c] && h[c + 1] === h[c] && [-3, -2, -1, 1, 2, 3].every(k => h[c + k] === h[c]) && grid[h[c] - 4] && grid[h[c] - 4][c] === "." && grid[h[c] - 5][c] === "." && plats.every(p => !(c >= p.x - 1 && c <= p.x + p.len));
    for (let k = 0; k < n; k++) {
      const a = Math.floor(16 + (W - 34) * k / n), b = Math.floor(16 + (W - 34) * (k + 1) / n);
      const cand = []; for (let c = a; c < b; c++) if (okCol(c)) cand.push(c);
      if (!cand.length) continue;
      const c = cand[Math.floor(r() * cand.length)], row = h[c] - 4;
      grid[row][c] = "A"; blocks.push({ c, row });
      if (r() < 0.5 && grid[row][c - 1] === ".") grid[row][c - 1] = "=";
      if (r() < 0.5 && grid[row][c + 1] === ".") grid[row][c + 1] = "=";
    }
    // Coins over flat ground
    for (let c = 12; c < W - 10; c++) if (h[c] > 0 && r() < 0.12 && grid[h[c] - 2][c] === "." && grid[h[c] - 1][c] === ".") coins.push({ x: c * T + 16, y: (h[c] - 2) * T + 16, got: false });
    // Log-book pages (facts)
    for (let k = 0; k < 3; k++) {
      const c = Math.floor(20 + (W - 40) * (k + 0.5) / 3);
      for (let dc = 0; dc < 10; dc++) { const cc = c + dc; if (h[cc] > 0 && grid[h[cc] - 2][cc] === ".") { pages.push({ x: cc * T + 16, y: (h[cc] - 2) * T + 8, got: false }); break; } }
    }
    // Smoke puff enemies
    const ne = Math.min(4 + Math.floor(d / 2), 8) + (level.topic ? 0 : 3);
    for (let k = 0; k < ne; k++) {
      const c = Math.floor(22 + r() * (W - 40));
      if (h[c] > 0 && h[c - 1] === h[c] && h[c + 1] === h[c]) enemies.push({ x: c * T + 4, y: h[c] * T - 26, w: 26, h: 26, vx: -(45 + d * 2) * (r() < 0.5 ? 1 : -1), dead: 0, alive: true });
    }
    return { W, grid, coins, pages, enemies, blocks, exitX: (W - 6) * T, exitY: 14 * T };
  }

  /* ---------- small drawing helpers ---------- */
  function rr(g, x, y, w, h, r) {
    const R = typeof r === "number" ? [r, r, r, r] : r;
    g.beginPath();
    g.moveTo(x + R[0], y); g.lineTo(x + w - R[1], y); g.quadraticCurveTo(x + w, y, x + w, y + R[1]);
    g.lineTo(x + w, y + h - R[2]); g.quadraticCurveTo(x + w, y + h, x + w - R[2], y + h);
    g.lineTo(x + R[3], y + h); g.quadraticCurveTo(x, y + h, x, y + h - R[3]);
    g.lineTo(x, y + R[0]); g.quadraticCurveTo(x, y, x + R[0], y); g.closePath();
  }
  const ease = t => 1 - Math.pow(1 - t, 3);

  function mount(container, level, cb, saved) {
    const seed = level.idx + 1;
    const L = buildLevel(level, seed);
    const qr = rng(Date.now() & 0xffff);
    const topicQs = S95.questions.filter(q => !level.topic || q.t === level.topic);
    let pool = shuffle(topicQs.slice(), qr), qi = 0;
    let facts = shuffle(topicQs.slice(), qr), fi = 0;

    container.innerHTML = `
      <div class="game-wrap">
        <canvas width="${VW}" height="${VH}" class="game-canvas" aria-label="Alarm Run game. Use arrow keys to move and space to jump."></canvas>
        <div class="game-btns">
          <button class="gbtn" data-b="pause" title="Pause (P)" aria-label="Pause">❚❚</button>
          <button class="gbtn" data-b="save" title="Save your spot and quit">💾 Save &amp; Quit</button>
        </div>
        <div class="game-toast" hidden></div>
        <div class="game-overlay" hidden></div>
        <div class="touch-ctrl" aria-hidden="true">
          <button data-k="left">◀</button><button data-k="right">▶</button><span class="spacer"></span><button data-k="jump" class="tj">JUMP</button>
        </div>
      </div>`;
    const cv = container.querySelector("canvas"), g = cv.getContext("2d");
    const overlay = container.querySelector(".game-overlay"), toastEl = container.querySelector(".game-toast");

    const P = { x: 3 * T, y: 14 * T - 40, w: 22, h: 40, vx: 0, vy: 0, on: false, face: 1, inv: 0, coy: 0, buf: 0, anim: 0, sq: 0 };
    const st = { hearts: 3, coins: 0, score: 0, qRight: 0, qDone: 0, lost: 0, cam: 0, camY: 0, paused: false, over: false, t: 0, shake: 0, checkpoint: { x: P.x, y: P.y } };
    const parts = [];   // particles {x,y,vx,vy,life,max,size,color,kind}
    const texts = [];   // floating text popups
    const bumps = {};   // "r,c" -> time remaining for block bump animation
    const keys = { left: false, right: false, jump: false };
    let raf = 0, last = 0, toastTimer = 0;

    /* ---- save / restore ---- */
    function snapshot() {
      const used = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < L.W; c++) if (L.grid[r][c] === "U") used.push([r, c]);
      return {
        v: 1, level: level.idx, savedAt: Date.now(),
        P: { x: P.x, y: P.y, face: P.face },
        st: { hearts: st.hearts, coins: st.coins, score: st.score, qRight: st.qRight, qDone: st.qDone, lost: st.lost, checkpoint: st.checkpoint },
        used, coins: L.coins.map(o => o.got ? 1 : 0), pages: L.pages.map(p => p.got ? 1 : 0),
        enemies: L.enemies.map(e => e.alive ? [Math.round(e.x), e.vx] : 0),
        pool: pool.map(q => q.id), qi, facts: facts.map(q => q.id), fi
      };
    }
    function restore(s) {
      const byId = {}; S95.questions.forEach(q => byId[q.id] = q);
      Object.assign(P, s.P, { vx: 0, vy: 0 });
      Object.assign(st, s.st);
      s.used.forEach(([r, c]) => { if (L.grid[r] && L.grid[r][c] === "A") L.grid[r][c] = "U"; });
      s.coins.forEach((g1, i) => { if (L.coins[i]) L.coins[i].got = !!g1; });
      s.pages.forEach((g1, i) => { if (L.pages[i]) L.pages[i].got = !!g1; });
      s.enemies.forEach((e, i) => { const E = L.enemies[i]; if (!E) return; if (!e) { E.alive = false; E.dead = 0; } else { E.x = e[0]; E.vx = e[1]; } });
      const p2 = (s.pool || []).map(id => byId[id]).filter(Boolean); if (p2.length) pool = p2;
      const f2 = (s.facts || []).map(id => byId[id]).filter(Boolean); if (f2.length) facts = f2;
      qi = s.qi || 0; fi = s.fi || 0;
      P.inv = 1.2;
      st.cam = Math.max(0, Math.min(L.W * T - VW, P.x - VW * 0.4));
    }
    function saveAndQuit() {
      if (st.over) return;
      cb.onSave(snapshot());
      destroy(); cb.onQuit("saved");
    }
    const onHide = () => { if (!st.over && started) cb.onSave(snapshot()); };
    window.addEventListener("pagehide", onHide);

    /* ---- input ---- */
    const km = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "jump", ArrowUp: "jump", KeyW: "jump", KeyZ: "jump" };
    function kd(e) {
      if (!overlay.hidden) { handleOverlayKey(e); return; }
      if (e.code === "KeyP" || e.code === "Escape") { e.preventDefault(); pause(); return; }
      const k = km[e.code]; if (!k) return; e.preventDefault();
      if (k === "jump" && !keys.jump) P.buf = 0.12;
      keys[k] = true;
    }
    function ku(e) { const k = km[e.code]; if (k) keys[k] = false; }
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    container.querySelectorAll(".touch-ctrl button").forEach(b => {
      const k = b.dataset.k;
      const on = e => { e.preventDefault(); if (k === "jump" && !keys.jump) P.buf = 0.12; keys[k] = true; };
      const off = e => { e.preventDefault(); keys[k] = false; };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
    });
    container.querySelector('[data-b="pause"]').onclick = () => pause();
    container.querySelector('[data-b="save"]').onclick = () => saveAndQuit();

    /* ---- helpers ---- */
    const tile = (c, r) => (r < 0 || r >= ROWS || c < 0 || c >= L.W) ? (c < 0 ? "#" : ".") : L.grid[r][c];
    const solid = (c, r) => !!SOLID[tile(c, r)];
    function toast(html, ms) {
      toastEl.innerHTML = html; toastEl.hidden = false; toastEl.classList.remove("show"); void toastEl.offsetWidth; toastEl.classList.add("show");
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.hidden = true, ms || 4200);
    }
    function pop(x, y, text, color) { texts.push({ x, y, text, color: color || "#fff", life: 1 }); }
    function burst(x, y, n, color, kind, spread) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = (spread || 120) * (0.4 + Math.random());
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (kind === "dust" ? 40 : 60), life: 0.5 + Math.random() * 0.4, max: 0.9, size: kind === "spark" ? 2 + Math.random() * 2 : 3 + Math.random() * 4, color, kind });
      }
    }

    function hurt(fell) {
      if (!fell && P.inv > 0) return;
      st.hearts--; st.lost++; st.shake = 0.35; S95.sound.hurt();
      burst(P.x + P.w / 2, P.y + P.h / 2, 10, "rgba(255,90,90,.9)", "spark", 160);
      if (st.hearts <= 0) return gameOver();
      P.inv = 1.6;
      if (fell) { P.x = st.checkpoint.x; P.y = st.checkpoint.y - 4; P.vx = P.vy = 0; }
      else { P.vy = -420; P.vx = -P.face * 220; }
    }

    /* ---- physics ---- */
    function step(dt) {
      st.t += dt; P.anim += dt;
      const acc = P.on ? 1900 : 1300, max = 250;
      if (keys.left && !keys.right) { P.vx = Math.max(P.vx - acc * dt, -max); P.face = -1; }
      else if (keys.right && !keys.left) { P.vx = Math.min(P.vx + acc * dt, max); P.face = 1; }
      else { const f = (P.on ? 1700 : 500) * dt; P.vx = Math.abs(P.vx) <= f ? 0 : P.vx - Math.sign(P.vx) * f; }

      const wasOn = P.on, fallV = P.vy;
      P.coy = P.on ? 0.1 : P.coy - dt; P.buf -= dt;
      if (P.buf > 0 && P.coy > 0) { P.vy = -800; P.on = false; P.coy = 0; P.buf = 0; P.sq = -0.25; S95.sound.jump(); burst(P.x + P.w / 2, P.y + P.h, 5, "rgba(220,225,235,.7)", "dust", 60); }
      if (!keys.jump && P.vy < -320) P.vy = -320;
      P.vy = Math.min(P.vy + 2100 * dt, 900);

      P.x += P.vx * dt;
      if (P.x < 0) { P.x = 0; P.vx = 0; }
      const r0 = Math.floor(P.y / T), r1 = Math.floor((P.y + P.h - 1) / T);
      if (P.vx > 0) { const c = Math.floor((P.x + P.w) / T); for (let r = r0; r <= r1; r++) if (solid(c, r)) { P.x = c * T - P.w; P.vx = 0; break; } }
      else if (P.vx < 0) { const c = Math.floor(P.x / T); for (let r = r0; r <= r1; r++) if (solid(c, r)) { P.x = (c + 1) * T; P.vx = 0; break; } }
      P.y += P.vy * dt; P.on = false;
      const c0 = Math.floor((P.x + 2) / T), c1 = Math.floor((P.x + P.w - 3) / T);
      if (P.vy > 0) {
        const r = Math.floor((P.y + P.h) / T);
        for (let c = c0; c <= c1; c++) if (solid(c, r)) { P.y = r * T - P.h; P.vy = 0; P.on = true; break; }
      } else if (P.vy < 0) {
        const r = Math.floor(P.y / T);
        let hit = -1;
        for (let c = c0; c <= c1; c++) if (solid(c, r)) { if (hit < 0 || Math.abs((c + 0.5) * T - (P.x + P.w / 2)) < Math.abs((hit + 0.5) * T - (P.x + P.w / 2))) hit = c; }
        if (hit >= 0) {
          P.y = (r + 1) * T; P.vy = 60;
          bumps[r + "," + hit] = 0.25;
          if (tile(hit, r) === "A") { L.grid[r][hit] = "U"; burst((hit + 0.5) * T, r * T, 14, "#ffd166", "spark", 180); openQuestion(hit, r); }
          else S95.sound.bump();
        }
      }
      if (P.on && !wasOn && fallV > 350) { P.sq = Math.min(0.3, fallV / 2600); burst(P.x + P.w / 2, P.y + P.h, 6, "rgba(220,225,235,.65)", "dust", 70); }
      P.sq += (0 - P.sq) * Math.min(1, dt * 12);
      if (P.on) { const c = Math.floor((P.x + P.w / 2) / T), rr2 = Math.floor((P.y + P.h) / T); if (solid(c - 1, rr2) && solid(c + 1, rr2)) st.checkpoint = { x: c * T + 5, y: P.y }; }
      if (P.y > VH + 80) hurt(true);
      if (P.inv > 0) P.inv -= dt;
      if (st.shake > 0) st.shake -= dt;
      for (const k in bumps) { bumps[k] -= dt; if (bumps[k] <= 0) delete bumps[k]; }

      L.enemies.forEach(e => {
        if (!e.alive) { e.dead -= dt; return; }
        if (Math.abs(e.x - P.x) > VW * 1.2) return;
        e.x += e.vx * dt;
        const ahead = e.vx > 0 ? Math.floor((e.x + e.w) / T) : Math.floor(e.x / T);
        const footR = Math.floor((e.y + e.h + 2) / T), bodyR = Math.floor((e.y + e.h / 2) / T);
        if (solid(ahead, bodyR) || !solid(ahead, footR)) { e.vx = -e.vx; e.x += e.vx * dt * 2; }
        if (P.x < e.x + e.w && P.x + P.w > e.x && P.y < e.y + e.h && P.y + P.h > e.y) {
          if (P.vy > 0 && P.y + P.h - e.y < 18) {
            e.alive = false; e.dead = 0.5; P.vy = -460; st.score += 100; S95.sound.stomp(); pop(e.x + 13, e.y, "+100");
            burst(e.x + 13, e.y + 14, 12, "rgba(200,206,212,.8)", "smoke", 110);
          } else hurt(false);
        }
      });
      L.coins.forEach(o => {
        if (o.got) return;
        if (Math.abs(P.x + P.w / 2 - o.x) < 20 && Math.abs(P.y + P.h / 2 - o.y) < 28) {
          o.got = true; st.coins++; st.score += 10; S95.sound.coin(); burst(o.x, o.y, 6, "#ffe08a", "spark", 90);
          if (st.coins % 50 === 0 && st.hearts < 5) { st.hearts++; pop(P.x, P.y - 10, "+1 ♥", "#ff6b6b"); }
        }
      });
      L.pages.forEach(p => {
        if (p.got) return;
        if (Math.abs(P.x + P.w / 2 - p.x) < 22 && Math.abs(P.y + P.h / 2 - p.y) < 30) {
          p.got = true; st.score += 50; S95.sound.page(); burst(p.x, p.y, 10, "#ffffff", "spark", 100);
          const f = facts[fi++ % facts.length];
          toast(`<b>📒 Log Book Page</b><span>${f.e}</span>`, 6500);
        }
      });
      if (P.x + P.w > L.exitX + 8 && P.x < L.exitX + 40 && P.y + P.h > L.exitY - 70) finish();
      parts.forEach(p => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.kind === "smoke" ? -30 : 420) * dt; p.vx *= 0.97; });
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
      texts.forEach(p => { p.life -= dt; p.y -= 45 * dt; });
      for (let i = texts.length - 1; i >= 0; i--) if (texts[i].life <= 0) texts.splice(i, 1);

      // smooth camera with look-ahead
      const target = Math.max(0, Math.min(L.W * T - VW, P.x - VW * 0.38 + P.face * 60));
      st.cam += (target - st.cam) * Math.min(1, dt * 6);
    }

    /* ---- drawing ---- */
    const hue = 215 + (level.idx * 19) % 110;
    const sky = (() => { const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, `hsl(${hue},55%,16%)`); gr.addColorStop(0.55, `hsl(${hue + 25},45%,24%)`); gr.addColorStop(1, `hsl(${hue + 50},50%,30%)`); return gr; })();
    const groundGrad = (() => { const gr = g.createLinearGradient(0, 300, 0, VH); gr.addColorStop(0, "#4a5363"); gr.addColorStop(1, "#262b35"); return gr; })();
    const beamGrad = (() => { const gr = g.createLinearGradient(0, 0, 0, T); gr.addColorStop(0, "#9aa7b8"); gr.addColorStop(1, "#5b6676"); return gr; })();
    const vignette = (() => { const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VH * 0.95); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.45)"); return gr; })();
    // skyline layers (deterministic)
    const sr = rng(seed * 31 + 5);
    const skyline = [0, 1].map(layer => { const b = []; let x = 0; while (x < 2400) { const w = 60 + sr() * 90, h = 120 + sr() * (layer ? 220 : 160); b.push({ x, w, h, lit: Array.from({ length: 24 }, () => sr() < 0.35) }); x += w + 10 + sr() * 30; } return b; });
    const motes = Array.from({ length: 40 }, () => ({ x: sr() * VW, y: sr() * VH, s: 0.5 + sr() * 1.5, v: 6 + sr() * 14 }));

    function drawBackground(cam) {
      g.fillStyle = sky; g.fillRect(0, 0, VW, VH);
      // moon glow
      const mg = g.createRadialGradient(780, 90, 4, 780, 90, 120); mg.addColorStop(0, "rgba(255,240,210,.55)"); mg.addColorStop(0.15, "rgba(255,240,210,.25)"); mg.addColorStop(1, "rgba(255,240,210,0)");
      g.fillStyle = mg; g.fillRect(640, 0, 300, 240);
      skyline.forEach((layer, li) => {
        const par = li ? 0.35 : 0.15, base = VH - (li ? 90 : 150);
        const off = -(cam * par) % 2400;
        g.fillStyle = li ? `hsla(${hue + 10},35%,12%,.95)` : `hsla(${hue},40%,20%,.8)`;
        for (const rep of [0, 2400]) layer.forEach(bd => {
          const x = bd.x + off + rep; if (x > VW || x + bd.w < 0) return;
          rr(g, x, base - bd.h, bd.w, bd.h + 200, [4, 4, 0, 0]); g.fill();
          if (li) { g.fillStyle = "rgba(255,214,120,.35)"; let k = 0;
            for (let wy = base - bd.h + 14; wy < base - 10; wy += 22) for (let wx = x + 10; wx < x + bd.w - 12; wx += 18) { if (bd.lit[k++ % 24]) g.fillRect(wx, wy, 7, 9); }
            g.fillStyle = `hsla(${hue + 10},35%,12%,.95)`; }
        });
      });
      // floating embers / dust motes
      motes.forEach(m => { const y = (m.y - st.t * m.v) % VH; const yy = y < 0 ? y + VH : y; const x = (m.x - cam * 0.5 * m.s / 2) % VW; g.fillStyle = "rgba(255,200,140,.35)"; g.beginPath(); g.arc(x < 0 ? x + VW : x, yy, m.s, 0, Math.PI * 2); g.fill(); });
    }

    function drawTiles(cam) {
      const c0 = Math.max(0, Math.floor(cam / T) - 1), c1 = Math.min(L.W - 1, c0 + Math.ceil(VW / T) + 2);
      // ground: merge runs of equal height into rounded slabs
      const top = c => { for (let r = 0; r < ROWS; r++) if (L.grid[r][c] === "#") return r; return -1; };
      let c = c0;
      while (c <= c1) {
        const t = top(c); if (t < 0) { c++; continue; }
        let e = c; while (e + 1 <= c1 + 1 && e + 1 < L.W && top(e + 1) === t) e++;
        const x = c * T - cam, y = t * T, w = (e - c + 1) * T;
        const lExp = c === 0 || top(c - 1) < 0 || top(c - 1) > t, rExp = e === L.W - 1 || top(e + 1) < 0 || top(e + 1) > t;
        g.fillStyle = groundGrad; rr(g, x, y, w, VH - y + 10, [lExp ? 10 : 0, rExp ? 10 : 0, 0, 0]); g.fill();
        // surface
        const sg = g.createLinearGradient(0, y, 0, y + 12); sg.addColorStop(0, "#7ee0c3"); sg.addColorStop(1, "#2f9e86");
        g.fillStyle = sg; rr(g, x, y, w, 12, [lExp ? 10 : 0, rExp ? 10 : 0, 3, 3]); g.fill();
        g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x + (lExp ? 8 : 0), y + 2, w - (lExp ? 8 : 0) - (rExp ? 8 : 0), 2);
        // subtle panel seams
        g.fillStyle = "rgba(255,255,255,.04)"; for (let k = 1; k < (e - c + 1); k += 2) g.fillRect(x + k * T, y + 14, 1, VH - y);
        g.fillStyle = "rgba(0,0,0,.18)"; for (let yy = y + 44; yy < VH; yy += 32) g.fillRect(x, yy, w, 1);
        c = e + 1;
      }
      // beams: merge runs of "="
      for (let r = 0; r < ROWS; r++) {
        let k = c0;
        while (k <= c1) {
          if (L.grid[r][k] !== "=") { k++; continue; }
          let e = k; while (e + 1 <= c1 && L.grid[r][e + 1] === "=") e++;
          const x = k * T - cam, y = r * T + 4, w = (e - k + 1) * T;
          g.fillStyle = "rgba(0,0,0,.25)"; rr(g, x + 3, y + 6, w, T - 8, 8); g.fill();
          g.save(); g.translate(0, r * T); g.fillStyle = beamGrad; rr(g, x, 4, w, T - 8, 8); g.fill(); g.restore();
          g.fillStyle = "rgba(255,255,255,.45)"; rr(g, x + 6, y + 3, w - 12, 3, 2); g.fill();
          g.fillStyle = "rgba(20,30,45,.35)"; for (let bx = x + 10; bx < x + w - 6; bx += 16) { g.beginPath(); g.arc(bx, y + T / 2 - 2, 2, 0, Math.PI * 2); g.fill(); }
          k = e + 1;
        }
      }
      // alarm blocks & used blocks
      for (let r = 0; r < ROWS; r++) for (let k = c0; k <= c1; k++) {
        const t = L.grid[r][k]; if (t !== "A" && t !== "U") continue;
        const bt = bumps[r + "," + k] || 0, lift = bt > 0 ? -Math.sin((1 - bt / 0.25) * Math.PI) * 10 : 0;
        const x = k * T - cam, y = r * T + lift;
        if (t === "A") {
          const pulse = 0.5 + 0.5 * Math.sin(st.t * 4 + k);
          g.save(); g.shadowColor = "rgba(255,70,60,.9)"; g.shadowBlur = 10 + pulse * 14;
          const bg = g.createLinearGradient(0, y, 0, y + T); bg.addColorStop(0, "#ff5a4e"); bg.addColorStop(1, "#c4161c");
          g.fillStyle = bg; rr(g, x + 1, y + 1, T - 2, T - 2, 7); g.fill(); g.restore();
          g.fillStyle = "rgba(255,255,255,.35)"; rr(g, x + 4, y + 3, T - 8, 5, 3); g.fill();
          const sw = Math.sin(st.t * 6 + k) * 0.18;
          g.save(); g.translate(x + 16, y + 9); g.rotate(sw); g.fillStyle = "#fff";
          g.beginPath(); g.moveTo(-7, 11); g.quadraticCurveTo(-7, 0, 0, 0); g.quadraticCurveTo(7, 0, 7, 11); g.lineTo(9, 13); g.lineTo(-9, 13); g.closePath(); g.fill();
          g.beginPath(); g.arc(0, 16, 2.6, 0, Math.PI * 2); g.fill(); g.restore();
        } else {
          const bg = g.createLinearGradient(0, y, 0, y + T); bg.addColorStop(0, "#5c6675"); bg.addColorStop(1, "#3a414d");
          g.fillStyle = bg; rr(g, x + 1, y + 1, T - 2, T - 2, 7); g.fill();
          g.strokeStyle = "#8ee6b4"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(x + 10, y + 17); g.lineTo(x + 14, y + 21); g.lineTo(x + 22, y + 11); g.stroke();
        }
      }
    }

    function drawExit(cam) {
      const ex = L.exitX - cam, ey = L.exitY; if (ex < -100 || ex > VW + 100) return;
      const glow = g.createRadialGradient(ex + 22, ey - 40, 5, ex + 22, ey - 40, 110); glow.addColorStop(0, "rgba(90,255,150,.35)"); glow.addColorStop(1, "rgba(90,255,150,0)");
      g.fillStyle = glow; g.fillRect(ex - 90, ey - 150, 224, 160);
      g.fillStyle = "#1c2430"; rr(g, ex - 4, ey - 78, 52, 78, [8, 8, 0, 0]); g.fill();
      const dg = g.createLinearGradient(ex, 0, ex + 44, 0); dg.addColorStop(0, "#3d4a5c"); dg.addColorStop(1, "#56657a");
      g.fillStyle = dg; rr(g, ex + 2, ey - 72, 40, 72, [5, 5, 0, 0]); g.fill();
      g.fillStyle = "#c9d6e3"; rr(g, ex + 30, ey - 40, 8, 4, 2); g.fill();
      g.save(); g.shadowColor = "#5cff95"; g.shadowBlur = 16; g.fillStyle = "#0b3d22"; rr(g, ex - 6, ey - 104, 56, 22, 5); g.fill(); g.restore();
      g.fillStyle = "#7dffa8"; g.font = "800 14px system-ui, sans-serif"; g.textAlign = "center"; g.fillText("EXIT", ex + 22, ey - 88);
    }

    function drawItems(cam) {
      L.coins.forEach(o => {
        if (o.got) return; const x = o.x - cam; if (x < -20 || x > VW + 20) return;
        const s = Math.abs(Math.cos(st.t * 3 + o.x * 0.05)), y = o.y + Math.sin(st.t * 2 + o.x) * 2;
        g.save(); g.shadowColor = "rgba(255,210,80,.8)"; g.shadowBlur = 8;
        const cg = g.createLinearGradient(x - 9, y - 10, x + 9, y + 10); cg.addColorStop(0, "#fff1a8"); cg.addColorStop(0.5, "#f5c518"); cg.addColorStop(1, "#c98a00");
        g.fillStyle = cg; g.beginPath(); g.ellipse(x, y, 9 * s + 1.2, 10, 0, 0, Math.PI * 2); g.fill(); g.restore();
        g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.ellipse(x - 2 * s, y - 3, 2.5 * s + 0.3, 3, 0, 0, Math.PI * 2); g.fill();
      });
      L.pages.forEach(p => {
        if (p.got) return; const x = p.x - cam; if (x < -20 || x > VW + 20) return;
        const y = p.y + Math.sin(st.t * 3 + p.x) * 4, rot = Math.sin(st.t * 2 + p.x) * 0.12;
        g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = "rgba(255,255,255,.7)"; g.shadowBlur = 12;
        g.fillStyle = "#fffdf6"; rr(g, -11, -14, 22, 28, 4); g.fill(); g.shadowBlur = 0;
        g.fillStyle = "#e5483b"; rr(g, -11, -14, 22, 6, [4, 4, 0, 0]); g.fill();
        g.fillStyle = "#b4bcc6"; for (let k = 0; k < 3; k++) rr(g, -6, -2 + k * 5, 12, 2, 1), g.fill();
        g.restore();
      });
    }

    function drawEnemies(cam) {
      L.enemies.forEach(e => {
        const x = e.x - cam; if (x < -40 || x > VW + 40) return;
        if (!e.alive) return;
        const w = Math.sin(st.t * 8 + e.x) * 1.5;
        g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(x + 13, e.y + e.h + 1, 14, 3, 0, 0, Math.PI * 2); g.fill();
        const sg = g.createRadialGradient(x + 10, e.y + 6, 2, x + 13, e.y + 13, 20); sg.addColorStop(0, "#f2f4f7"); sg.addColorStop(1, "#8c96a3");
        g.fillStyle = sg;
        [[7, 16, 9], [19, 15, 10], [13, 8, 10]].forEach(([cx, cy, r2]) => { g.beginPath(); g.arc(x + cx, e.y + cy + w, r2, 0, Math.PI * 2); g.fill(); });
        const blink = (Math.sin(st.t * 1.7 + e.x) > 0.97);
        const lk = e.vx > 0 ? 1.5 : -1.5;
        g.fillStyle = "#fff"; g.beginPath(); g.ellipse(x + 9, e.y + 13 + w, 3.6, blink ? 0.6 : 4.2, 0, 0, Math.PI * 2); g.ellipse(x + 18, e.y + 13 + w, 3.6, blink ? 0.6 : 4.2, 0, 0, Math.PI * 2); g.fill();
        if (!blink) { g.fillStyle = "#1b1f27"; g.beginPath(); g.arc(x + 9 + lk, e.y + 14 + w, 1.8, 0, Math.PI * 2); g.arc(x + 18 + lk, e.y + 14 + w, 1.8, 0, Math.PI * 2); g.fill(); }
        g.strokeStyle = "#3a404b"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x + 5, e.y + 8 + w); g.lineTo(x + 12, e.y + 9.5 + w); g.moveTo(x + 22, e.y + 8 + w); g.lineTo(x + 15, e.y + 9.5 + w); g.stroke();
      });
    }

    function drawPlayer(x, y) {
      const f = P.face, run = P.on && Math.abs(P.vx) > 20, ph = P.anim * 16;
      const sx = 1 + P.sq * 0.6, sy = 1 - P.sq * 0.8;
      // shadow on ground
      g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.ellipse(x + P.w / 2, y + P.h + 1, 12, 3, 0, 0, Math.PI * 2); g.fill();
      g.save(); g.translate(x + P.w / 2, y + P.h); g.scale(f * sx, sy); g.translate(-P.w / 2, -P.h);
      const legA = run ? Math.sin(ph) * 6 : (P.on ? 0 : 4), legB = run ? -Math.sin(ph) * 6 : (P.on ? 0 : -3);
      // legs
      g.strokeStyle = "#2b2f38"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(7, 29); g.lineTo(7 + legA, 37); g.moveTo(15, 29); g.lineTo(15 + legB, 37); g.stroke();
      g.fillStyle = "#14161b"; rr(g, 3 + legA, 35, 9, 5, 2); g.fill(); rr(g, 11 + legB, 35, 9, 5, 2); g.fill();
      // coat
      const cg = g.createLinearGradient(0, 14, 0, 32); cg.addColorStop(0, "#f2b733"); cg.addColorStop(1, "#c98a12");
      g.fillStyle = cg; rr(g, 1, 14, 20, 18, 6); g.fill();
      g.fillStyle = "#dff7ff"; g.fillRect(1, 24, 20, 3); g.fillStyle = "rgba(160,255,255,.6)"; g.fillRect(1, 24, 20, 1);
      // arm
      const arm = run ? Math.sin(ph + Math.PI) * 0.6 : 0.2;
      g.save(); g.translate(13, 17); g.rotate(arm); g.fillStyle = "#d89a18"; rr(g, -3, 0, 6, 12, 3); g.fill(); g.fillStyle = "#2b2f38"; rr(g, -3, 10, 6, 4, 2); g.fill(); g.restore();
      // head
      g.fillStyle = "#f1c27d"; rr(g, 5, 5, 13, 11, 5); g.fill();
      g.fillStyle = "#1b1f27"; g.beginPath(); g.arc(14.5, 10, 1.6, 0, Math.PI * 2); g.fill();
      // helmet
      const hg = g.createLinearGradient(0, -2, 0, 8); hg.addColorStop(0, "#ff4d4d"); hg.addColorStop(1, "#b81d1d");
      g.fillStyle = hg; g.beginPath(); g.moveTo(3, 7); g.quadraticCurveTo(4, -2, 12, -2); g.quadraticCurveTo(20, -2, 20, 7); g.closePath(); g.fill();
      rr(g, 0, 5, 24, 3.5, 2); g.fill();
      g.fillStyle = "#ffd166"; g.beginPath(); g.arc(11, 2.5, 2.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,255,255,.45)"; rr(g, 6, 0, 6, 2, 1); g.fill();
      g.restore();
    }

    function heart(x, y, full) {
      g.fillStyle = full ? "#ff5a6a" : "rgba(255,255,255,.18)";
      g.beginPath(); g.moveTo(x + 9, y + 16); g.bezierCurveTo(x - 4, y + 7, x + 2, y - 2, x + 9, y + 4); g.bezierCurveTo(x + 16, y - 2, x + 22, y + 7, x + 9, y + 16); g.fill();
    }
    function pill(x, w) { g.fillStyle = "rgba(12,16,24,.55)"; rr(g, x, 10, w, 30, 15); g.fill(); g.strokeStyle = "rgba(255,255,255,.12)"; g.lineWidth = 1; g.stroke(); }
    function drawHUD() {
      pill(10, 134); for (let i = 0; i < 5; i++) heart(20 + i * 24, 17, i < st.hearts);
      pill(152, 78); g.fillStyle = "#f5c518"; g.beginPath(); g.arc(170, 25, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff"; g.font = "700 15px system-ui, sans-serif"; g.textAlign = "left"; g.fillText(st.coins, 184, 30);
      pill(238, 74); g.fillStyle = "#ff4b40"; rr(g, 250, 18, 15, 15, 4); g.fill(); g.fillStyle = "#fff"; g.fillText(`${st.qRight}/${L.blocks.length}`, 272, 30);
      pill(320, 132); g.fillStyle = "rgba(255,255,255,.6)"; g.font = "600 11px system-ui, sans-serif"; g.fillText("SCORE", 334, 29);
      g.fillStyle = "#fff"; g.font = "800 15px system-ui, sans-serif"; g.fillText(String(st.score).padStart(6, "0"), 378, 30);
      // progress bar to exit
      const pr = Math.min(1, P.x / L.exitX);
      g.fillStyle = "rgba(255,255,255,.15)"; rr(g, 10, VH - 10, VW - 20, 4, 2); g.fill();
      g.fillStyle = "#7ee0c3"; rr(g, 10, VH - 10, (VW - 20) * pr, 4, 2); g.fill();
    }

    function draw() {
      const sh = st.shake > 0 ? st.shake * 14 : 0;
      g.save();
      if (sh) g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
      const cam = st.cam;
      drawBackground(cam); drawTiles(cam); drawExit(cam); drawItems(cam); drawEnemies(cam);
      // particles
      parts.forEach(p => {
        const a = Math.max(0, p.life / p.max);
        g.globalAlpha = a; g.fillStyle = p.color;
        g.beginPath(); g.arc(p.x - cam, p.y, p.kind === "smoke" ? p.size * (1.6 - a) * 1.4 : p.size * (p.kind === "spark" ? a : 1), 0, Math.PI * 2); g.fill();
      });
      g.globalAlpha = 1;
      if (!(P.inv > 0 && Math.floor(P.inv * 12) % 2)) drawPlayer(P.x - cam, P.y);
      g.textAlign = "center"; g.font = "800 16px system-ui, sans-serif";
      texts.forEach(p => { g.globalAlpha = Math.max(0, p.life); g.fillStyle = "rgba(0,0,0,.4)"; g.fillText(p.text, p.x - cam + 1, p.y + 1); g.fillStyle = p.color; g.fillText(p.text, p.x - cam, p.y); });
      g.globalAlpha = 1;
      g.restore();
      g.fillStyle = vignette; g.fillRect(0, 0, VW, VH);
      drawHUD();
    }

    /* ---- overlays ---- */
    let overlayKeys = null, started = false;
    function showOverlay(html, keyHandler) {
      overlay.innerHTML = `<div class="go-card">${html}</div>`; overlay.hidden = false; overlayKeys = keyHandler || null;
      keys.left = keys.right = keys.jump = false;
      const b = overlay.querySelector("button"); if (b) b.focus();
    }
    function hideOverlay() { overlay.hidden = true; overlay.innerHTML = ""; overlayKeys = null; cv.focus(); }
    function handleOverlayKey(e) { if (overlayKeys) overlayKeys(e); }

    function openQuestion(c, r) {
      S95.sound.bump();
      const q = pool[qi++ % pool.length];
      const choices = shuffle([q.a].concat(q.w), qr);
      st.paused = true;
      const letters = ["A", "B", "C", "D"];
      showOverlay(`
        <div class="go-tag">🔔 ALARM BLOCK · ${S95.topicTitle(q.t)}</div>
        <div class="go-q">${q.q}</div>
        <div class="choices">${choices.map((ch, i) => `<button class="choice" data-i="${i}"><span class="letter">${letters[i]}</span><span>${ch}</span></button>`).join("")}</div>
        <div class="go-fb"></div>
        <p class="small muted go-hint">Press 1–4 or tap an answer.</p>`, e => {
          const n = parseInt(e.key, 10);
          if (n >= 1 && n <= 4) { const b = overlay.querySelector(`.choice[data-i="${n - 1}"]`); if (b && !b.disabled) b.click(); }
          else if ((e.key === "Enter" || e.code === "Space") && overlay.querySelector(".go-continue")) { e.preventDefault(); overlay.querySelector(".go-continue").click(); }
        });
      overlay.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => {
        const pick = choices[+b.dataset.i], ok = pick === q.a;
        overlay.querySelectorAll(".choice").forEach(x => { x.disabled = true; if (choices[+x.dataset.i] === q.a) x.classList.add("correct"); });
        if (!ok) b.classList.add("wrong");
        st.qDone++;
        S95.recordAnswer(q.id, ok);
        if (ok) {
          st.qRight++; st.score += 500; S95.sound.right();
          pop(c * T + 16, r * T - 14, "+500", "#ffd166");
          for (let k = 0; k < 5; k++) burst(c * T + 16, r * T, 3, "#f5c518", "spark", 140);
          st.coins += 5;
          if (st.hearts < 5) st.hearts++;
        } else {
          S95.sound.wrong();
          if (st.hearts > 1) { st.hearts--; st.lost++; }
        }
        overlay.querySelector(".go-fb").innerHTML = `<div class="fb ${ok ? "good" : "bad"}"><b>${ok ? "Correct! +500 and +1 ♥" : "Not quite. −1 ♥"}</b><br>${q.e} <span class="muted small">(Booklet ${q.ref})</span></div>
          <div class="row" style="margin-top:10px"><button class="btn primary go-continue">Continue ▶</button></div>`;
        overlay.querySelector(".go-hint").remove();
        overlay.querySelector(".go-continue").addEventListener("click", () => { hideOverlay(); st.paused = false; last = performance.now(); });
        overlay.querySelector(".go-continue").focus();
      }));
    }
    function pause() {
      if (st.over || !started || st.paused) return;
      st.paused = true;
      showOverlay(`<div class="go-tag">⏸ Paused</div><h2>Take a breather</h2><p class="muted">← → / A D to move · Space / W / ↑ to jump · P to pause</p>
        <div class="row"><button class="btn primary" data-a="resume">▶ Resume</button><button class="btn" data-a="save">💾 Save &amp; Quit</button><button class="btn" data-a="restart">↺ Restart floor</button><button class="btn" data-a="quit">Quit without saving</button></div>`,
        e => { if (e.code === "Escape" || e.code === "KeyP") resume(); });
      overlay.querySelector('[data-a="resume"]').onclick = resume;
      overlay.querySelector('[data-a="save"]').onclick = saveAndQuit;
      overlay.querySelector('[data-a="restart"]').onclick = () => { cb.onClearSave(); destroy(); cb.onRestart(); };
      overlay.querySelector('[data-a="quit"]').onclick = () => { destroy(); cb.onQuit(); };
    }
    function resume() { hideOverlay(); st.paused = false; last = performance.now(); }
    function gameOver() {
      st.over = true; st.paused = true; S95.sound.wrong(); cb.onClearSave();
      showOverlay(`<div class="go-tag">💨 Out of hearts</div><h2>The smoke got you this time</h2><p>Score ${st.score} · Questions ${st.qRight}/${st.qDone}</p>
        <p class="muted small">Tip: read the "${level.topic ? S95.topicTitle(level.topic) : "full"}" lesson in Learn, then try again.</p>
        <div class="row"><button class="btn primary" data-a="restart">↺ Try again</button><button class="btn" data-a="quit">Level select</button>${level.topic ? `<a class="btn" href="#/learn/${level.topic}">Study this topic</a>` : ""}</div>`);
      overlay.querySelector('[data-a="restart"]').onclick = () => { destroy(); cb.onRestart(); };
      overlay.querySelector('[data-a="quit"]').onclick = () => { destroy(); cb.onQuit(); };
    }
    function finish() {
      if (st.over) return;
      st.over = true; st.paused = true; S95.sound.win(); cb.onClearSave();
      const total = L.blocks.length, unanswered = total - st.qDone;
      const pct = total ? st.qRight / total : 1;
      const stars = 1 + (pct >= 0.8 ? 1 : 0) + (st.qRight === total && st.lost === 0 ? 1 : 0);
      const res = { stars, score: st.score + st.hearts * 200, right: st.qRight, total };
      cb.onComplete(res);
      showOverlay(`<div class="go-tag">🚪 Floor cleared</div><h2>Nice work!</h2>
        <div class="stars">${[0, 1, 2].map(i => `<span class="star ${i < stars ? "on" : ""}" style="animation-delay:${i * 0.18}s">★</span>`).join("")}</div>
        <p>Alarm blocks answered correctly: <b>${st.qRight}/${total}</b>${unanswered ? ` <span class="muted">(${unanswered} missed, so go back and bump them all next time!)</span>` : ""}<br>
        Badges: <b>${st.coins}</b> · Heart bonus: <b>${st.hearts * 200}</b> · Final score: <b>${res.score}</b></p>
        <p class="small muted">★ finish · ★★ ≥80% correct · ★★★ all correct and no hearts lost</p>
        <div class="row"><button class="btn primary" data-a="next">Next floor ▶</button><button class="btn" data-a="restart">↺ Replay</button><button class="btn" data-a="quit">Level select</button></div>`);
      overlay.querySelector('[data-a="next"]').onclick = () => { destroy(); cb.onNext(); };
      overlay.querySelector('[data-a="restart"]').onclick = () => { destroy(); cb.onRestart(); };
      overlay.querySelector('[data-a="quit"]').onclick = () => { destroy(); cb.onQuit(); };
    }

    /* ---- loop ---- */
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - last) / 1000 || 0); last = now;
      if (!st.paused) step(dt); else st.t += dt * 0.3;
      draw();
    }
    let destroyed = false;
    function destroy() {
      if (destroyed) return; destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      window.removeEventListener("pagehide", onHide);
      clearTimeout(toastTimer);
    }
    if (window.S95_TEST) window.S95_TEST.game = { P, st, L, keys, T };  // automated-test hook only
    cv.tabIndex = 0; cv.focus();
    function start() { hideOverlay(); started = true; st.paused = false; last = performance.now(); }
    const intro = `<div class="go-tag">${level.icon} ${level.name}</div><h2>${level.title}</h2>
      <p>Run to the <b style="color:#1e9e5a">EXIT</b>. Jump up and <b>bump the red 🔔 alarm blocks</b> from below to answer ${L.blocks.length} exam questions.
      Stomp the <b>smoke puffs</b>, collect badges, and grab <b>📒 log book pages</b> for quick facts.</p>
      <p class="small muted">← → / A D to move · Space / W / ↑ to jump · P to pause · 💾 saves your spot.</p>`;
    if (saved && saved.level === level.idx) {
      const when = new Date(saved.savedAt).toLocaleString();
      showOverlay(intro + `<div class="callout key small">💾 You have a saved run from <b>${when}</b>: ${saved.st.hearts} ♥ · ${saved.st.qRight}/${L.blocks.length} answered · score ${saved.st.score}.</div>
        <div class="row"><button class="btn primary" data-a="cont">▶ Continue saved run</button><button class="btn" data-a="fresh">Start over</button></div>`,
        e => { if (e.key === "Enter") { e.preventDefault(); overlay.querySelector('[data-a="cont"]').click(); } });
      overlay.querySelector('[data-a="cont"]').onclick = () => { restore(saved); start(); toast("<b>💾 Saved run restored</b><span>Pick up right where you left off.</span>", 2500); };
      overlay.querySelector('[data-a="fresh"]').onclick = () => { cb.onClearSave(); start(); };
    } else {
      showOverlay(intro + `<div class="row"><button class="btn primary" data-a="go">Start ▶</button></div>`, e => { if (e.key === "Enter" || e.code === "Space") { e.preventDefault(); start(); } });
      overlay.querySelector('[data-a="go"]').onclick = start;
    }
    st.paused = true; last = performance.now(); raf = requestAnimationFrame(frame);
    return { destroy, save: () => { if (!st.over && started) cb.onSave(snapshot()); } };
  }

  return { mount, buildLevel };
})();
