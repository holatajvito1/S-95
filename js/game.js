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

  function mount(container, level, cb) {
    const seed = level.idx + 1;
    const L = buildLevel(level, seed);
    const qr = rng(Date.now() & 0xffff);
    let pool = S95.questions.filter(q => !level.topic || q.t === level.topic);
    pool = shuffle(pool.slice(), qr);
    let qi = 0;
    const factPool = shuffle(S95.questions.filter(q => !level.topic || q.t === level.topic).map(q => q.e), qr);
    let fi = 0;

    container.innerHTML = `
      <div class="game-wrap">
        <canvas width="${VW}" height="${VH}" class="game-canvas" aria-label="Alarm Run game. Use arrow keys to move and space to jump."></canvas>
        <div class="game-toast" hidden></div>
        <div class="game-overlay" hidden></div>
        <div class="touch-ctrl" aria-hidden="true">
          <button data-k="left">◀</button><button data-k="right">▶</button><span class="spacer"></span><button data-k="jump" class="tj">JUMP</button>
        </div>
      </div>`;
    const cv = container.querySelector("canvas"), g = cv.getContext("2d");
    const overlay = container.querySelector(".game-overlay"), toastEl = container.querySelector(".game-toast");

    const P = { x: 3 * T, y: 14 * T - 40, w: 22, h: 40, vx: 0, vy: 0, on: false, face: 1, inv: 0, coy: 0, buf: 0, anim: 0 };
    const st = { hearts: 3, coins: 0, score: 0, qRight: 0, qDone: 0, lost: 0, cam: 0, paused: false, over: false, t: 0, checkpoint: { x: P.x, y: P.y } };
    const parts = []; // popups / particles
    const keys = { left: false, right: false, jump: false };
    let raf = 0, last = 0, toastTimer = 0;

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

    /* ---- helpers ---- */
    const tile = (c, r) => (r < 0 || r >= ROWS || c < 0 || c >= L.W) ? (c < 0 ? "#" : ".") : L.grid[r][c];
    const solid = (c, r) => !!SOLID[tile(c, r)];
    function toast(html, ms) {
      toastEl.innerHTML = html; toastEl.hidden = false;
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.hidden = true, ms || 4200);
    }
    function pop(x, y, text, color) { parts.push({ x, y, text, color: color || "#fff", life: 1 }); }

    function hurt(fell) {
      if (!fell && P.inv > 0) return;
      st.hearts--; st.lost++; S95.sound.hurt();
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

      P.coy = P.on ? 0.1 : P.coy - dt; P.buf -= dt;
      if (P.buf > 0 && P.coy > 0) { P.vy = -800; P.on = false; P.coy = 0; P.buf = 0; S95.sound.jump(); }
      if (!keys.jump && P.vy < -320) P.vy = -320;           // variable jump height
      P.vy = Math.min(P.vy + 2100 * dt, 900);

      // X
      P.x += P.vx * dt;
      if (P.x < 0) { P.x = 0; P.vx = 0; }
      let r0 = Math.floor(P.y / T), r1 = Math.floor((P.y + P.h - 1) / T);
      if (P.vx > 0) { const c = Math.floor((P.x + P.w) / T); for (let r = r0; r <= r1; r++) if (solid(c, r)) { P.x = c * T - P.w; P.vx = 0; break; } }
      else if (P.vx < 0) { const c = Math.floor(P.x / T); for (let r = r0; r <= r1; r++) if (solid(c, r)) { P.x = (c + 1) * T; P.vx = 0; break; } }
      // Y
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
          if (tile(hit, r) === "A") { L.grid[r][hit] = "U"; openQuestion(hit, r); }
          else S95.sound.bump();
        }
      }
      // checkpoint: standing on wide ground
      if (P.on) { const c = Math.floor((P.x + P.w / 2) / T), rr = Math.floor((P.y + P.h) / T); if (solid(c - 1, rr) && solid(c + 1, rr)) st.checkpoint = { x: c * T + 5, y: P.y }; }
      if (P.y > VH + 80) hurt(true);
      if (P.inv > 0) P.inv -= dt;

      // enemies
      L.enemies.forEach(e => {
        if (!e.alive) { e.dead -= dt; return; }
        if (Math.abs(e.x - P.x) > VW * 1.2) return;
        e.x += e.vx * dt;
        const ahead = e.vx > 0 ? Math.floor((e.x + e.w) / T) : Math.floor(e.x / T);
        const footR = Math.floor((e.y + e.h + 2) / T), bodyR = Math.floor((e.y + e.h / 2) / T);
        if (solid(ahead, bodyR) || !solid(ahead, footR)) { e.vx = -e.vx; e.x += e.vx * dt * 2; }
        if (P.x < e.x + e.w && P.x + P.w > e.x && P.y < e.y + e.h && P.y + P.h > e.y) {
          if (P.vy > 0 && P.y + P.h - e.y < 18) {
            e.alive = false; e.dead = 0.4; P.vy = -460; st.score += 100; S95.sound.stomp(); pop(e.x, e.y, "+100");
          } else hurt(false);
        }
      });
      // coins
      L.coins.forEach(o => {
        if (o.got) return;
        if (Math.abs(P.x + P.w / 2 - o.x) < 20 && Math.abs(P.y + P.h / 2 - o.y) < 28) {
          o.got = true; st.coins++; st.score += 10; S95.sound.coin();
          if (st.coins % 50 === 0 && st.hearts < 5) { st.hearts++; pop(P.x, P.y - 10, "+1 ♥", "#ff6b6b"); }
        }
      });
      // pages = facts
      L.pages.forEach(p => {
        if (p.got) return;
        if (Math.abs(P.x + P.w / 2 - p.x) < 22 && Math.abs(P.y + P.h / 2 - p.y) < 30) {
          p.got = true; st.score += 50; S95.sound.page();
          toast(`<b>📒 Log Book Page:</b> ${factPool[fi++ % factPool.length]}`, 6500);
        }
      });
      // exit
      if (P.x + P.w > L.exitX + 8 && P.x < L.exitX + 40 && P.y + P.h > L.exitY - 70) finish();
      parts.forEach(p => { p.life -= dt; p.y -= 40 * dt; });
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);

      st.cam = Math.max(0, Math.min(L.W * T - VW, P.x - VW * 0.4));
    }

    /* ---- drawing ---- */
    const hue = 205 + (level.idx * 23) % 140;
    function draw() {
      const cam = st.cam;
      // background
      const bg = g.createLinearGradient(0, 0, 0, VH);
      bg.addColorStop(0, `hsl(${hue},45%,22%)`); bg.addColorStop(1, `hsl(${hue},35%,12%)`);
      g.fillStyle = bg; g.fillRect(0, 0, VW, VH);
      // far windows (parallax)
      g.fillStyle = `hsla(${hue},60%,70%,0.10)`;
      const off = -(cam * 0.3) % 160;
      for (let x = off - 160; x < VW + 160; x += 160) for (let y = 40; y < 380; y += 110) g.fillRect(x + 30, y, 70, 60);
      // pipes near ceiling (parallax)
      g.fillStyle = `hsla(${hue},20%,50%,0.18)`;
      const off2 = -(cam * 0.6) % 400;
      for (let x = off2 - 400; x < VW + 400; x += 400) { g.fillRect(x, 18, 300, 10); g.fillRect(x + 280, 18, 10, 70); }

      const c0 = Math.floor(cam / T), c1 = Math.min(L.W - 1, c0 + Math.ceil(VW / T) + 1);
      for (let r = 0; r < ROWS; r++) for (let c = c0; c <= c1; c++) {
        const t = L.grid[r][c]; if (t === ".") continue;
        const x = c * T - cam, y = r * T;
        if (t === "#") {
          const top = r === 0 || L.grid[r - 1][c] !== "#";
          g.fillStyle = top ? "#8d949b" : "#5d636a"; g.fillRect(x, y, T, T);
          g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x, y + T - 2, T, 2); g.fillRect(x + T - 2, y, 2, T);
          if (top) { g.fillStyle = "#f2c230"; g.fillRect(x, y, T, 5); g.fillStyle = "#222"; for (let k = 0; k < 4; k++) g.fillRect(x + k * 8 + 2, y, 3, 5); }
        } else if (t === "=") {
          g.fillStyle = "#c2452d"; g.fillRect(x, y + 4, T, T - 8);
          g.fillStyle = "#8f2b1b"; g.fillRect(x, y, T, 5); g.fillRect(x, y + T - 5, T, 5);
          g.fillStyle = "#f6c3b8"; g.fillRect(x + 6, y + 13, 4, 4); g.fillRect(x + 22, y + 13, 4, 4);
        } else if (t === "A") {
          const bob = Math.sin(st.t * 4 + c) * 1.5;
          g.fillStyle = "#e0241b"; g.fillRect(x + 1, y + 1 + bob, T - 2, T - 2);
          g.strokeStyle = "#7a0d08"; g.lineWidth = 2; g.strokeRect(x + 2, y + 2 + bob, T - 4, T - 4);
          // bell glyph
          g.fillStyle = "#fff"; g.beginPath(); g.arc(x + 16, y + 15 + bob, 7, Math.PI, 0); g.lineTo(x + 24, y + 22 + bob); g.lineTo(x + 8, y + 22 + bob); g.closePath(); g.fill();
          g.beginPath(); g.arc(x + 16, y + 25 + bob, 2.5, 0, Math.PI * 2); g.fill();
        } else if (t === "U") {
          g.fillStyle = "#4b4f55"; g.fillRect(x + 1, y + 1, T - 2, T - 2);
          g.fillStyle = "#6c7178"; g.fillRect(x + 6, y + 6, 4, 4); g.fillRect(x + 22, y + 6, 4, 4); g.fillRect(x + 6, y + 22, 4, 4); g.fillRect(x + 22, y + 22, 4, 4);
        }
      }
      // exit door
      const ex = L.exitX - cam, ey = L.exitY;
      g.fillStyle = "#2a1d14"; g.fillRect(ex, ey - 72, 44, 72);
      g.fillStyle = "#6b4a33"; g.fillRect(ex + 4, ey - 68, 36, 68);
      g.fillStyle = "#e9c46a"; g.fillRect(ex + 32, ey - 36, 4, 4);
      g.fillStyle = "#0d6b2e"; g.fillRect(ex - 4, ey - 98, 52, 20);
      g.fillStyle = "#7dff9f"; g.font = "bold 15px system-ui, sans-serif"; g.textAlign = "center"; g.fillText("EXIT", ex + 22, ey - 83);
      // coins (badges)
      L.coins.forEach(o => {
        if (o.got) return; const x = o.x - cam; if (x < -20 || x > VW + 20) return;
        const s = Math.abs(Math.cos(st.t * 3 + o.x * 0.05));
        g.fillStyle = "#f4c430"; g.beginPath(); g.ellipse(x, o.y, 9 * s + 1, 10, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#b8860b"; g.beginPath(); g.ellipse(x, o.y, 5 * s + 0.5, 6, 0, 0, Math.PI * 2); g.fill();
      });
      // pages
      L.pages.forEach(p => {
        if (p.got) return; const x = p.x - cam; if (x < -20 || x > VW + 20) return;
        const y = p.y + Math.sin(st.t * 3 + p.x) * 4;
        g.fillStyle = "#fffdf4"; g.fillRect(x - 10, y - 13, 20, 26);
        g.fillStyle = "#c0392b"; g.fillRect(x - 10, y - 13, 20, 5);
        g.fillStyle = "#9aa"; for (let k = 0; k < 3; k++) g.fillRect(x - 6, y - 2 + k * 5, 12, 1.5);
      });
      // enemies (smoke puffs)
      L.enemies.forEach(e => {
        const x = e.x - cam; if (x < -40 || x > VW + 40) return;
        if (!e.alive) { if (e.dead > 0) { g.globalAlpha = e.dead / 0.4; g.fillStyle = "#cfd3d6"; g.fillRect(x - 2, e.y + 18, e.w + 4, 8); g.globalAlpha = 1; } return; }
        const w = Math.sin(st.t * 8 + e.x) * 1.5;
        g.fillStyle = "#b8bec4";
        [[7, 15, 9], [19, 13, 10], [13, 7, 9]].forEach(([cx, cy, rr]) => { g.beginPath(); g.arc(x + cx, e.y + cy + w, rr, 0, Math.PI * 2); g.fill(); });
        g.fillStyle = "#fff"; g.fillRect(x + 7, e.y + 10, 5, 6); g.fillRect(x + 15, e.y + 10, 5, 6);
        g.fillStyle = "#111"; const lk = e.vx > 0 ? 2 : 0; g.fillRect(x + 8 + lk, e.y + 12, 2.5, 3); g.fillRect(x + 16 + lk, e.y + 12, 2.5, 3);
        g.fillStyle = "#333"; g.fillRect(x + 6, e.y + 8, 6, 2); g.fillRect(x + 15, e.y + 8, 6, 2);
      });
      // player (firefighter)
      if (!(P.inv > 0 && Math.floor(P.inv * 12) % 2)) drawPlayer(P.x - cam, P.y);
      // popups
      g.textAlign = "center"; g.font = "bold 16px system-ui, sans-serif";
      parts.forEach(p => { g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.color; g.fillText(p.text, p.x - cam, p.y); }); g.globalAlpha = 1;
      drawHUD();
    }
    function drawPlayer(x, y) {
      const f = P.face, run = P.on && Math.abs(P.vx) > 20, leg = run ? Math.sin(P.anim * 18) * 5 : 0;
      g.save(); g.translate(x + P.w / 2, y); g.scale(f, 1); g.translate(-P.w / 2, 0);
      // legs/boots
      g.fillStyle = "#3a3a3a"; g.fillRect(3, 30 + Math.max(0, leg) * 0.2, 7, 10 - Math.max(0, leg) * 0.2); g.fillRect(12, 30 + Math.max(0, -leg) * 0.2, 7, 10 - Math.max(0, -leg) * 0.2);
      g.fillStyle = "#111"; g.fillRect(2 + (P.on ? leg * 0.3 : -2), 37, 9, 3); g.fillRect(11 - (P.on ? leg * 0.3 : -2), 37, 9, 3);
      // coat
      g.fillStyle = "#d9a520"; g.fillRect(1, 15, 20, 17);
      g.fillStyle = "#e8f0f2"; g.fillRect(1, 24, 20, 3); g.fillStyle = "#c9cdd0"; g.fillRect(1, 25, 20, 1);
      // arm
      g.fillStyle = "#c18f12"; const arm = run ? Math.sin(P.anim * 18 + Math.PI) * 4 : 0; g.fillRect(14 + arm * 0.3, 17, 6, 11);
      // face
      g.fillStyle = "#f1c27d"; g.fillRect(5, 6, 13, 10);
      g.fillStyle = "#222"; g.fillRect(14, 9, 2, 3);
      // helmet
      g.fillStyle = "#d62828"; g.fillRect(3, 0, 16, 7); g.fillRect(1, 5, 22, 3);
      g.fillStyle = "#ffd166"; g.fillRect(8, 1, 5, 5);
      g.restore();
    }
    function heart(x, y, full) {
      g.fillStyle = full ? "#ff4d4d" : "rgba(255,255,255,.25)";
      g.beginPath(); g.moveTo(x + 9, y + 16); g.bezierCurveTo(x - 4, y + 7, x + 2, y - 2, x + 9, y + 4); g.bezierCurveTo(x + 16, y - 2, x + 22, y + 7, x + 9, y + 16); g.fill();
    }
    function drawHUD() {
      g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(0, 0, VW, 40);
      for (let i = 0; i < 5; i++) heart(12 + i * 24, 12, i < st.hearts);
      g.textAlign = "left"; g.fillStyle = "#fff"; g.font = "bold 17px system-ui, sans-serif";
      g.fillStyle = "#f4c430"; g.beginPath(); g.arc(150, 20, 8, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff"; g.fillText("× " + st.coins, 164, 26);
      g.fillStyle = "#e0241b"; g.fillRect(232, 11, 18, 18); g.fillStyle = "#fff"; g.fillText(`${st.qRight}/${L.blocks.length}`, 258, 26);
      g.fillText("SCORE " + String(st.score).padStart(6, "0"), 340, 26);
      g.textAlign = "right"; g.fillText(`${level.name}: ${level.title}`, VW - 12, 26);
    }

    /* ---- overlays ---- */
    let overlayKeys = null;
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
          for (let k = 0; k < 5; k++) pop(c * T + 16 + (k - 2) * 12, r * T - 10 - k * 6, "✦", "#f4c430");
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
      if (st.over) return;
      st.paused = true;
      showOverlay(`<h2>Paused</h2><p class="muted">Arrow keys or A/D to move · Space/W/↑ to jump · P to pause</p>
        <div class="row"><button class="btn primary" data-a="resume">Resume</button><button class="btn" data-a="restart">Restart floor</button><button class="btn" data-a="quit">Level select</button></div>`,
        e => { if (e.code === "Escape" || e.code === "KeyP") resume(); });
      overlay.querySelector('[data-a="resume"]').onclick = resume;
      overlay.querySelector('[data-a="restart"]').onclick = () => { destroy(); cb.onRestart(); };
      overlay.querySelector('[data-a="quit"]').onclick = () => { destroy(); cb.onQuit(); };
    }
    function resume() { hideOverlay(); st.paused = false; last = performance.now(); }
    function gameOver() {
      st.over = true; st.paused = true; S95.sound.wrong();
      showOverlay(`<h2>💨 Out of hearts!</h2><p>Score ${st.score} · Questions ${st.qRight}/${st.qDone}</p>
        <p class="muted small">Tip: read the "${level.topic ? S95.topicTitle(level.topic) : "full"}" lesson in Learn, then try again.</p>
        <div class="row"><button class="btn primary" data-a="restart">Try again</button><button class="btn" data-a="quit">Level select</button>${level.topic ? `<a class="btn" href="#/learn/${level.topic}">Study this topic</a>` : ""}</div>`);
      overlay.querySelector('[data-a="restart"]').onclick = () => { destroy(); cb.onRestart(); };
      overlay.querySelector('[data-a="quit"]').onclick = () => { destroy(); cb.onQuit(); };
    }
    function finish() {
      if (st.over) return;
      st.over = true; st.paused = true; S95.sound.win();
      const total = L.blocks.length;
      const unanswered = total - st.qDone;
      const pct = total ? st.qRight / total : 1;
      const stars = 1 + (pct >= 0.8 ? 1 : 0) + (st.qRight === total && st.lost === 0 ? 1 : 0);
      const res = { stars, score: st.score + st.hearts * 200, right: st.qRight, total };
      cb.onComplete(res);
      showOverlay(`<h2>🚪 Floor cleared!</h2>
        <div class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
        <p>Alarm blocks answered correctly: <b>${st.qRight}/${total}</b>${unanswered ? ` <span class="muted">(${unanswered} missed, so go back and bump them all next time!)</span>` : ""}<br>
        Badges: <b>${st.coins}</b> · Heart bonus: <b>${st.hearts * 200}</b> · Final score: <b>${res.score}</b></p>
        <p class="small muted">★ finish · ★★ ≥80% correct · ★★★ all correct and no hearts lost</p>
        <div class="row"><button class="btn primary" data-a="next">Next floor ▶</button><button class="btn" data-a="restart">Replay</button><button class="btn" data-a="quit">Level select</button></div>`);
      overlay.querySelector('[data-a="next"]').onclick = () => { destroy(); cb.onNext(); };
      overlay.querySelector('[data-a="restart"]').onclick = () => { destroy(); cb.onRestart(); };
      overlay.querySelector('[data-a="quit"]').onclick = () => { destroy(); cb.onQuit(); };
    }

    /* ---- loop ---- */
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - last) / 1000 || 0); last = now;
      if (!st.paused) step(dt);
      draw();
    }
    function destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      clearTimeout(toastTimer);
    }
    if (window.S95_TEST) window.S95_TEST.game = { P, st, L, keys, T };  // automated-test hook only
    cv.tabIndex = 0; cv.focus();
    showOverlay(`<div class="go-tag">${level.icon} ${level.name}</div><h2>${level.title}</h2>
      <p>Run to the <b style="color:#0d6b2e">EXIT</b>. Jump up and <b>bump the red 🔔 alarm blocks</b> from below to answer ${L.blocks.length} exam questions.
      Stomp the <b>smoke puffs</b>, collect badges, and grab <b>📒 log book pages</b> for quick facts.</p>
      <p class="small muted">Keyboard: ← → / A D to move · Space / W / ↑ to jump · P to pause. On a phone, use the on-screen buttons.</p>
      <div class="row"><button class="btn primary" data-a="go">Start ▶</button></div>`, e => { if (e.key === "Enter" || e.code === "Space") { e.preventDefault(); start(); } });
    function start() { hideOverlay(); st.paused = false; last = performance.now(); }
    overlay.querySelector('[data-a="go"]').onclick = start;
    st.paused = true; last = performance.now(); raf = requestAnimationFrame(frame);
    return { destroy };
  }

  return { mount, buildLevel };
})();
