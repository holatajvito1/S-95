/* Data + level-generator checks. Run: node tests/validate.js */
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");
const ctx = { window: {}, console, localStorage: { getItem: () => null, setItem: () => {} } };
ctx.window = ctx; vm.createContext(ctx);
["js/data/lessons.js", "js/data/questions.js", "js/data/scenarios.js", "js/game.js"].forEach(f =>
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f }));
const S = ctx.S95; let errors = 0;
const fail = m => { errors++; console.error("✗ " + m); };
const topics = new Set(S.topics.map(t => t.id)), ids = new Set();
S.topics.forEach(t => { if (!S.lessons[t.id]) fail(`lesson missing for ${t.id}`); });
S.questions.forEach(q => {
  if (ids.has(q.id)) fail(`duplicate id ${q.id}`); ids.add(q.id);
  if (!topics.has(q.t)) fail(`${q.id}: unknown topic ${q.t}`);
  if (!q.q || !q.a || !q.e) fail(`${q.id}: missing field`);
  if (!Array.isArray(q.w) || q.w.length !== 3) fail(`${q.id}: needs exactly 3 wrong answers`);
  const all = [q.a].concat(q.w || []);
  if (new Set(all).size !== all.length) fail(`${q.id}: duplicate choices`);
  if (/all of the above|both a and b/i.test(all.join("|"))) fail(`${q.id}: position-dependent choice`);
});
S.topics.forEach(t => { const n = S.questions.filter(q => q.t === t.id).length; if (n < 8) fail(`topic ${t.id} has only ${n} questions`); });
S.scenarios.forEach(s => s.steps.forEach((st, i) => {
  if (st.options.filter(o => o.ok).length !== 1) fail(`${s.id} step ${i}: needs exactly one correct option`);
}));
// Level generator: always beatable
S.gameLevels().forEach(lv => {
  const L = S.Game.buildLevel(lv, lv.idx + 1), W = L.W;
  const top = c => { for (let r = 0; r < 17; r++) if (L.grid[r][c] === "#") return r; return -1; };
  let gap = 0;
  for (let c = 0; c < W; c++) {
    const t = top(c);
    if (t < 0) { gap++; if (gap > 3) fail(`${lv.name}: gap > 3 at col ${c}`); } else gap = 0;
    if (c > 0 && t > 0 && top(c - 1) > 0 && top(c - 1) - t > 2) fail(`${lv.name}: step > 2 at col ${c}`);
  }
  if (L.blocks.length !== lv.blocks) fail(`${lv.name}: ${L.blocks.length}/${lv.blocks} alarm blocks placed`);
  if (top(Math.floor(L.exitX / 32)) !== 14) fail(`${lv.name}: exit not on ground`);
});
console.log(`${S.questions.length} questions · ${S.topics.length} topics · ${S.scenarios.length} scenarios · ${S.gameLevels().length} game levels`);
if (errors) { console.error(`${errors} problem(s)`); process.exit(1); } else console.log("✓ all checks passed");
// No gap may sit under a beam or within 3 columns of an alarm block (a head bump would shorten the jump).
S.gameLevels().forEach(lv => {
  const L = S.Game.buildLevel(lv, lv.idx + 1);
  const isGap = c => L.grid[16][c] !== "#";
  for (let c = 0; c < L.W; c++) if (isGap(c)) for (let r = 0; r < 16; r++) if (L.grid[r][c] === "=" ) { fail(`${lv.name}: beam over gap at col ${c}`); break; }
  L.blocks.forEach(b => { for (let k = -3; k <= 3; k++) if (isGap(b.c + k)) fail(`${lv.name}: gap near alarm block col ${b.c}`); });
});
if (errors) process.exit(1);
