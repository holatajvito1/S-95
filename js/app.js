/* S-95 Study Coach — app shell, router and views. No dependencies; works from file:// too. */
(function () {
  "use strict";
  const $ = (s, el) => (el || document).querySelector(s);
  const app = $("#app");
  const LETTERS = ["A", "B", "C", "D"];

  /* ---------------- Storage (fails safe) ---------------- */
  const KEY = "s95.v1";
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  let DB = Object.assign({ q: {}, exams: [], lessons: {}, sims: {}, game: {}, cards: {} }, load());
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }

  S95.recordAnswer = function (id, ok) {
    const r = DB.q[id] || { seen: 0, right: 0, streak: 0 };
    r.seen++; if (ok) { r.right++; r.streak++; } else r.streak = 0;
    r.last = ok ? 1 : 0; r.t = Date.now();
    DB.q[id] = r; save();
  };
  S95.topicTitle = id => (S95.topics.find(t => t.id === id) || { title: id }).title;

  /* ---------------- Utils ---------------- */
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const byTopic = t => S95.questions.filter(q => q.t === t);
  function topicMastery(t) {
    const qs = byTopic(t); if (!qs.length) return 0;
    let s = 0; qs.forEach(q => { const r = DB.q[q.id]; if (r && r.last) s += r.streak >= 2 ? 1 : 0.6; });
    return Math.round(100 * s / qs.length);
  }
  function weakQuestions() { return S95.questions.filter(q => DB.q[q.id] && DB.q[q.id].last === 0); }
  function prepQ(q) { return Object.assign({}, q, { choices: shuffle([q.a].concat(q.w)) }); }

  /* ---------------- Nav ---------------- */
  const toggle = $(".nav-toggle"), nav = $(".nav");
  toggle.addEventListener("click", () => { const o = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", o); });
  nav.addEventListener("click", () => nav.classList.remove("open"));
  $("#content-version").textContent = S95.CONTENT_VERSION;

  let cleanup = null;
  function route() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    S95.sound.buzzer(false);
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const view = parts[0] || "home";
    document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("active", a.dataset.nav === view));
    const fn = Views[view] || Views.home;
    app.innerHTML = "";
    fn.apply(null, parts.slice(1));
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  window.addEventListener("hashchange", route);

  /* ---------------- Views ---------------- */
  const Views = {};

  Views.home = function () {
    const seen = Object.keys(DB.q).length, total = S95.questions.length;
    const lastExam = DB.exams[DB.exams.length - 1];
    const floors = Object.values(DB.game).filter(g => g.stars).length;
    app.innerHTML = `
      <section class="card hero stack">
        <div>
          <span class="tag">FDNY Certificate of Fitness</span>
          <h1>Pass the S-95: Supervision of Fire Alarm Systems</h1>
          <p class="muted">Learn the booklet, play through it, practice the panel, then take a full timed simulation of the real exam:
          <b>35 questions · 53 minutes · 70% to pass</b>.</p>
        </div>
        <div class="row">
          <a class="btn primary" href="#/play">🎮 Play Alarm Run</a>
          <a class="btn" href="#/learn">Start learning</a>
          <a class="btn" href="#/exam">Take the exam simulation</a>
        </div>
      </section>
      <div class="grid grid-3" style="margin-top:16px">
        <div class="card"><div class="muted small">Questions practiced</div><div class="stat">${seen}<span class="muted small"> / ${total}</span></div></div>
        <div class="card"><div class="muted small">Floors cleared in Alarm Run</div><div class="stat">${floors}<span class="muted small"> / ${S95.gameLevels().length}</span></div></div>
        <div class="card"><div class="muted small">Last exam simulation</div><div class="stat">${lastExam ? lastExam.pct + "%" : "—"}</div>${lastExam ? `<span class="tag ${lastExam.pct >= 70 ? "good" : "bad"}">${lastExam.pct >= 70 ? "PASS" : "NOT YET"}</span>` : ""}</div>
      </div>
      <h2 style="margin-top:28px">Study modes</h2>
      <div class="grid grid-3">
        ${[
          ["play", "🎮", "Alarm Run (game)", "A side-scrolling platformer. Bump alarm blocks to answer questions, one building floor per topic."],
          ["learn", "📚", "Learn", `${S95.topics.length} lessons that follow the October 2026 FDNY booklet section by section.`],
          ["flashcards", "🃏", "Flashcards", "Flip through key facts. Mark the ones you know and keep drilling the rest."],
          ["practice", "✅", "Practice", "Choose topics and get instant feedback with booklet references."],
          ["exam", "⏱️", "Exam Simulation", "35 random questions, a 53-minute timer, flagging, and a full review at the end."],
          ["sim", "🎛️", "Panel Simulator", "Work real scenarios on a simulated control panel, or try anything in free-play mode."]
        ].map(([h, i, t, d]) => `<a class="card feature" href="#/${h}"><span class="icon">${i}</span><h3>${t}</h3><span class="muted small">${d}</span></a>`).join("")}
      </div>
      <div class="callout warn" style="margin-top:24px"><b>Always check for the latest booklet.</b> This app follows the FDNY S-95 Study Material <b>revised October 2026</b>. Before you test, check the FDNY website for a newer revision.</div>`;
  };

  /* ----- Learn ----- */
  Views.learn = function (topic) {
    topic = topic && S95.lessons[topic] ? topic : null;
    if (!topic) {
      app.innerHTML = `<h1>Learn</h1><p class="muted">Each lesson follows a section of the FDNY booklet. Finish a lesson, then quiz yourself on it.</p>
        <div class="grid grid-2">${S95.topics.map((t, i) => `
          <a class="card feature" href="#/learn/${t.id}">
            <div class="row"><span class="icon">${t.icon}</span><span class="spacer"></span>${DB.lessons[t.id] ? '<span class="tag good">Read ✓</span>' : ""}<span class="tag">${byTopic(t.id).length} Qs</span></div>
            <h3>${i + 1}. ${t.title}</h3>
            <div class="progress-bar"><span style="width:${topicMastery(t.id)}%"></span></div>
            <span class="small muted">Mastery ${topicMastery(t.id)}%</span>
          </a>`).join("")}</div>`;
      return;
    }
    const idx = S95.topics.findIndex(t => t.id === topic);
    const prev = S95.topics[idx - 1], next = S95.topics[idx + 1];
    app.innerHTML = `<div class="lesson-layout">
      <nav class="card toc" aria-label="Lessons">${S95.topics.map(t => `<a href="#/learn/${t.id}" class="${t.id === topic ? "active" : ""}"><span class="check">${DB.lessons[t.id] ? "✓" : ""}</span>${t.icon} ${t.title}</a>`).join("")}</nav>
      <article class="card lesson">${S95.lessons[topic]}
        <hr style="border:none;border-top:1px solid var(--border);margin:24px 0">
        <div class="row">
          ${prev ? `<a class="btn" href="#/learn/${prev.id}">← ${prev.title}</a>` : ""}
          <span class="spacer"></span>
          <button class="btn" id="mark">${DB.lessons[topic] ? "Read ✓" : "Mark as read"}</button>
          <a class="btn primary" href="#/practice/${topic}">Quiz this topic (${byTopic(topic).length})</a>
          ${next ? `<a class="btn" href="#/learn/${next.id}">${next.title} →</a>` : ""}
        </div>
      </article></div>`;
    $("#mark").onclick = () => { DB.lessons[topic] = Date.now(); save(); $("#mark").textContent = "Read ✓"; };
  };

  /* ----- Flashcards ----- */
  Views.flashcards = function (topic) {
    let deck = S95.questions.filter(q => !topic || q.t === topic);
    let onlyUnknown = false, i = 0;
    const pick = () => shuffle(onlyUnknown ? deck.filter(q => !DB.cards[q.id]) : deck);
    let cards = pick();
    function render() {
      if (!cards.length) { app.innerHTML = `<h1>Flashcards</h1><div class="card"><p>🎉 You've marked every card in this deck as known.</p><button class="btn" id="resetk">Reset known cards</button> <a class="btn primary" href="#/practice">Go practice</a></div>`;
        $("#resetk").onclick = () => { deck.forEach(q => delete DB.cards[q.id]); save(); cards = pick(); i = 0; render(); }; return; }
      const q = cards[i % cards.length];
      const known = deck.filter(x => DB.cards[x.id]).length;
      app.innerHTML = `<div class="row"><h1 style="margin:0">Flashcards</h1><span class="spacer"></span>
        <select id="ftopic" class="btn sm"><option value="">All topics</option>${S95.topics.map(t => `<option value="${t.id}" ${t.id === topic ? "selected" : ""}>${t.title}</option>`).join("")}</select>
        <label class="small"><input type="checkbox" id="unk" ${onlyUnknown ? "checked" : ""}> Hide known</label></div>
        <p class="muted small">Card ${(i % cards.length) + 1} of ${cards.length} · Known ${known}/${deck.length} · Click the card or press Space to flip</p>
        <div class="flash-wrap"><div class="flash" id="card" tabindex="0" role="button" aria-label="Flip card">
          <div class="face front"><span class="tag">${S95.topicTitle(q.t)}</span>${esc(q.q)}</div>
          <div class="face back"><span class="tag">Booklet ${esc(q.ref || "")}</span><b>${esc(q.a)}</b><p class="small" style="margin-top:12px">${esc(q.e)}</p></div>
        </div>
        <div class="row" style="justify-content:center;margin-top:16px">
          <button class="btn" id="prev">← Prev</button><button class="btn" id="again">Still learning</button><button class="btn primary" id="know">I know it ✓</button><button class="btn" id="nextc">Next →</button>
        </div></div>`;
      const card = $("#card"), flip = () => card.classList.toggle("flipped");
      card.onclick = flip;
      $("#prev").onclick = () => { i = (i - 1 + cards.length) % cards.length; render(); };
      $("#nextc").onclick = () => { i++; render(); };
      $("#again").onclick = () => { delete DB.cards[q.id]; save(); i++; render(); };
      $("#know").onclick = () => { DB.cards[q.id] = 1; save(); if (onlyUnknown) { cards = pick(); } else i++; render(); };
      $("#ftopic").onchange = e => { location.hash = "#/flashcards" + (e.target.value ? "/" + e.target.value : ""); };
      $("#unk").onchange = e => { onlyUnknown = e.target.checked; cards = pick(); i = 0; render(); };
    }
    const keyh = e => {
      if (e.target.tagName === "SELECT" || e.target.tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); const c = $("#card"); if (c) c.classList.toggle("flipped"); }
      if (e.code === "ArrowRight") { i++; render(); }
      if (e.code === "ArrowLeft") { i = (i - 1 + cards.length) % cards.length; render(); }
    };
    window.addEventListener("keydown", keyh); cleanup = () => window.removeEventListener("keydown", keyh);
    render();
  };

  /* ----- Practice ----- */
  Views.practice = function (topic) {
    if (topic === "weak" || topic) return runQuiz(topic === "weak" ? shuffle(weakQuestions()) : shuffle(byTopic(topic)), topic === "weak" ? "Review missed questions" : S95.topicTitle(topic));
    const weak = weakQuestions().length;
    app.innerHTML = `<h1>Practice</h1><p class="muted">Instant feedback on every question, with the booklet section it comes from.</p>
      <div class="card stack">
        <h3>Choose topics</h3>
        <div class="topic-pick">${S95.topics.map(t => `<label><input type="checkbox" value="${t.id}" checked> ${t.icon} ${t.title} <span class="spacer"></span><span class="tag">${byTopic(t.id).length}</span></label>`).join("")}</div>
        <div class="row"><button class="btn sm" id="all">Select all</button><button class="btn sm" id="none">Select none</button>
          <span class="spacer"></span>
          <label>Questions: <select id="n" class="btn sm"><option>10</option><option selected>20</option><option>35</option><option value="999">All</option></select></label>
          <button class="btn primary" id="go">Start practice</button></div>
      </div>
      <div class="card" style="margin-top:16px"><div class="row"><div><h3 style="margin:0">Missed questions</h3><span class="muted small">Questions you got wrong most recently (${weak})</span></div><span class="spacer"></span>
        <a class="btn ${weak ? "primary" : ""}" ${weak ? 'href="#/practice/weak"' : 'aria-disabled="true"'}>Review missed</a></div></div>`;
    const boxes = () => [...app.querySelectorAll(".topic-pick input")];
    $("#all").onclick = () => boxes().forEach(b => b.checked = true);
    $("#none").onclick = () => boxes().forEach(b => b.checked = false);
    $("#go").onclick = () => {
      const ts = boxes().filter(b => b.checked).map(b => b.value);
      if (!ts.length) return alert("Pick at least one topic.");
      runQuiz(shuffle(S95.questions.filter(q => ts.includes(q.t))).slice(0, +$("#n").value), "Practice");
    };
  };

  function runQuiz(list, title) {
    if (!list.length) { app.innerHTML = `<h1>${esc(title)}</h1><div class="card"><p>No questions here yet. Nice work!</p><a class="btn" href="#/practice">Back to practice</a></div>`; return; }
    const qs = list.map(prepQ); let i = 0, right = 0; const missed = [];
    function show() {
      const q = qs[i];
      app.innerHTML = `<div class="row"><h1 style="margin:0">${esc(title)}</h1><span class="spacer"></span><span class="muted">${i + 1} / ${qs.length} · ✓ ${right}</span></div>
        <div class="progress-bar" style="margin:12px 0 18px"><span style="width:${100 * i / qs.length}%"></span></div>
        <div class="card"><span class="tag">${S95.topicTitle(q.t)}</span><div class="question">${esc(q.q)}</div>
          <div class="choices">${q.choices.map((c, k) => `<button class="choice" data-k="${k}"><span class="letter">${LETTERS[k]}</span><span>${esc(c)}</span></button>`).join("")}</div>
          <div id="exp"></div></div>`;
      app.querySelectorAll(".choice").forEach(b => b.onclick = () => answer(+b.dataset.k));
    }
    function answer(k) {
      const q = qs[i], ok = q.choices[k] === q.a;
      if (app.querySelector(".choice:disabled")) return;
      app.querySelectorAll(".choice").forEach((b, j) => { b.disabled = true; if (q.choices[j] === q.a) b.classList.add("correct"); });
      if (!ok) { app.querySelectorAll(".choice")[k].classList.add("wrong"); missed.push(q); } else right++;
      S95.recordAnswer(q.id, ok);
      $("#exp").innerHTML = `<div class="explain"><b>${ok ? "✅ Correct" : "❌ Incorrect"}</b>: ${esc(q.e)} <span class="muted small">Booklet ${esc(q.ref || "")}</span></div>
        <div class="row" style="margin-top:12px"><span class="spacer"></span><button class="btn primary" id="nx">${i + 1 < qs.length ? "Next →" : "See results"}</button></div>`;
      $("#nx").focus(); $("#nx").onclick = () => { i++; i < qs.length ? show() : done(); };
    }
    function done() {
      const pct = Math.round(100 * right / qs.length);
      app.innerHTML = `<h1>${esc(title)}: results</h1><div class="card stack"><div class="score-big">${pct}%</div><p>${right} of ${qs.length} correct.</p>
        <div class="row"><button class="btn primary" id="again">Retry these</button>${missed.length ? '<button class="btn" id="miss">Retry only missed</button>' : ""}<a class="btn" href="#/practice">Back</a></div></div>`;
      $("#again").onclick = () => runQuiz(shuffle(list), title);
      if (missed.length) $("#miss").onclick = () => runQuiz(missed, "Missed questions");
    }
    const keyh = e => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) { const b = app.querySelector(`.choice[data-k="${n - 1}"]`); if (b && !b.disabled) b.click(); }
      if (e.key === "Enter") { const b = $("#nx"); if (b) b.click(); }
    };
    window.addEventListener("keydown", keyh); cleanup = () => window.removeEventListener("keydown", keyh);
    show();
  }

  /* ----- Exam simulation ----- */
  Views.exam = function () {
    const best = DB.exams.length ? Math.max(...DB.exams.map(e => e.pct)) : null;
    app.innerHTML = `<h1>Exam Simulation</h1>
      <div class="card stack">
        <p>This mirrors the real S-95 exam: <b>35 multiple-choice questions</b>, <b>4 choices each</b>, a <b>53-minute</b> limit, and <b>70%</b> (25 correct) to pass.
        Unanswered questions count as wrong, and there's no penalty for guessing. You can flag questions and move between them before you submit.</p>
        <p class="muted small">Questions are drawn from every topic, weighted toward the core fire alarm sections the way the booklet is.</p>
        <div class="row"><button class="btn primary" id="start">Start exam</button>
        <label class="small"><input type="checkbox" id="untimed"> Untimed (study mode)</label>
        <span class="spacer"></span>${best !== null ? `<span class="muted">Best: ${best}% · Attempts: ${DB.exams.length}</span>` : ""}</div>
      </div>
      ${DB.exams.length ? `<h2 style="margin-top:24px">History</h2><div class="card">${DB.exams.slice(-10).reverse().map(e => `<div class="row small" style="padding:4px 0"><span>${new Date(e.date).toLocaleString()}</span><span class="spacer"></span><b>${e.pct}%</b> <span class="tag ${e.pct >= 70 ? "good" : "bad"}">${e.pct >= 70 ? "PASS" : "FAIL"}</span></div>`).join("")}</div>` : ""}`;
    $("#start").onclick = () => startExam(!$("#untimed").checked);
  };
  function buildExam() {
    // Weighted draw: core fire alarm topics weigh more than extinguishers, li-ion and exam logistics.
    const weights = { exam: 2, defs: 4, signals: 5, facp: 4, devices: 5, related: 3, itm: 4, records: 3, oos: 3, unnecessary: 1, pfe: 0.5, liion: 0.5 };
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const picked = [], used = new Set();
    Object.keys(weights).forEach(t => {
      const n = Math.round(35 * weights[t] / total);
      shuffle(byTopic(t)).slice(0, n).forEach(q => { picked.push(q); used.add(q.id); });
    });
    const rest = shuffle(S95.questions.filter(q => !used.has(q.id)));
    while (picked.length < 35 && rest.length) picked.push(rest.pop());
    return shuffle(picked.slice(0, 35)).map(prepQ);
  }
  function startExam(timed) {
    const qs = buildExam(), ans = new Array(qs.length).fill(null), flag = new Array(qs.length).fill(false);
    let i = 0, left = 53 * 60, timer = null, finished = false;
    function tick() { left--; const t = $("#timer"); if (t) { t.textContent = fmt(left); t.classList.toggle("low", left < 300); } if (left <= 0) submit(true); }
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    if (timed) timer = setInterval(tick, 1000);
    function show() {
      const q = qs[i];
      app.innerHTML = `<div class="row"><h2 style="margin:0">Question ${i + 1} of ${qs.length}</h2><span class="spacer"></span>
          ${timed ? `<span class="timer" id="timer">${fmt(left)}</span>` : '<span class="muted">Untimed</span>'}</div>
        <div class="card" style="margin-top:12px"><div class="question">${esc(q.q)}</div>
          <div class="choices">${q.choices.map((c, k) => `<button class="choice ${ans[i] === k ? "selected" : ""}" data-k="${k}"><span class="letter">${LETTERS[k]}</span><span>${esc(c)}</span></button>`).join("")}</div>
          <div class="row" style="margin-top:16px"><button class="btn" id="pv" ${i === 0 ? "disabled" : ""}>← Previous</button>
            <button class="btn" id="fl">${flag[i] ? "🚩 Flagged" : "Flag for review"}</button><span class="spacer"></span>
            ${i + 1 < qs.length ? '<button class="btn primary" id="nx">Next →</button>' : '<button class="btn primary" id="sub">Submit exam</button>'}</div></div>
        <div class="card" style="margin-top:16px"><div class="row small muted" style="margin-bottom:8px"><span>Answered ${ans.filter(a => a !== null).length}/${qs.length}</span><span class="spacer"></span><button class="btn sm" id="sub2">Submit now</button></div>
          <div class="qnav">${qs.map((_, k) => `<button class="${ans[k] !== null ? "answered" : ""} ${flag[k] ? "flagged" : ""} ${k === i ? "current" : ""}" data-k="${k}">${k + 1}</button>`).join("")}</div></div>`;
      app.querySelectorAll(".choice").forEach(b => b.onclick = () => { ans[i] = +b.dataset.k; show(); });
      app.querySelectorAll(".qnav button").forEach(b => b.onclick = () => { i = +b.dataset.k; show(); });
      if ($("#pv")) $("#pv").onclick = () => { i--; show(); };
      if ($("#nx")) $("#nx").onclick = () => { i++; show(); };
      $("#fl").onclick = () => { flag[i] = !flag[i]; show(); };
      [$("#sub"), $("#sub2")].forEach(b => b && (b.onclick = () => {
        const un = ans.filter(a => a === null).length;
        if (un && !confirm(`${un} question(s) unanswered. Unanswered questions are scored as incorrect. Submit anyway?`)) return;
        submit(false);
      }));
    }
    function submit(timeUp) {
      if (finished) return; finished = true; clearInterval(timer);
      let right = 0; const byT = {};
      qs.forEach((q, k) => { const ok = ans[k] !== null && q.choices[ans[k]] === q.a; if (ok) right++; S95.recordAnswer(q.id, ok);
        byT[q.t] = byT[q.t] || [0, 0]; byT[q.t][1]++; if (ok) byT[q.t][0]++; });
      const pct = Math.round(100 * right / qs.length), pass = pct >= 70;
      DB.exams.push({ date: Date.now(), pct, right, total: qs.length }); save();
      let filter = "all";
      function review() {
        const items = qs.map((q, k) => ({ q, k, ok: ans[k] !== null && q.choices[ans[k]] === q.a })).filter(x => filter === "all" || !x.ok);
        $("#rev").innerHTML = items.map(({ q, k, ok }) => `<div class="card" style="margin-top:10px"><div class="row"><b>${k + 1}.</b><span class="tag ${ok ? "good" : "bad"}">${ok ? "Correct" : ans[k] === null ? "Unanswered" : "Incorrect"}</span><span class="tag">${S95.topicTitle(q.t)}</span></div>
          <div class="question" style="font-size:1rem">${esc(q.q)}</div>
          ${ans[k] !== null && !ok ? `<div class="small">Your answer: <span style="color:var(--bad)">${esc(q.choices[ans[k]])}</span></div>` : ""}
          <div class="small">Correct: <b style="color:var(--good)">${esc(q.a)}</b></div><div class="explain small">${esc(q.e)} <span class="muted">Booklet ${esc(q.ref || "")}</span></div></div>`).join("") || '<p class="muted">Nothing to show.</p>';
      }
      app.innerHTML = `<h1>${timeUp ? "⏰ Time's up! " : ""}Exam results</h1>
        <div class="card stack"><div class="row"><div class="score-big" style="color:var(${pass ? "--good" : "--bad"})">${pct}%</div><div><span class="tag ${pass ? "good" : "bad"}" style="font-size:1rem">${pass ? "PASS" : "NOT YET (70% needed)"}</span><p class="muted" style="margin:6px 0 0">${right} of ${qs.length} correct · ${timed ? "Time used " + fmt(53 * 60 - left) : "Untimed"}</p></div></div>
          <h3>By topic</h3>${Object.keys(byT).map(t => { const [r, n] = byT[t]; return `<div class="bar-row"><span>${S95.topicTitle(t)}</span><div class="progress-bar"><span style="width:${100 * r / n}%"></span></div><span class="small">${r}/${n}</span></div>`; }).join("")}
          <div class="row"><button class="btn primary" id="again">New exam</button><a class="btn" href="#/practice/weak">Practice missed questions</a><span class="spacer"></span>
            <label class="small"><input type="checkbox" id="onlyw"> Show only missed</label></div></div>
        <div id="rev"></div>`;
      $("#again").onclick = () => startExam(timed);
      $("#onlyw").onchange = e => { filter = e.target.checked ? "wrong" : "all"; review(); };
      review(); window.scrollTo(0, 0);
    }
    const keyh = e => {
      if (finished) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) { ans[i] = n - 1; show(); }
      if (e.code === "ArrowRight" && i + 1 < qs.length) { i++; show(); }
      if (e.code === "ArrowLeft" && i > 0) { i--; show(); }
    };
    window.addEventListener("keydown", keyh);
    cleanup = () => { clearInterval(timer); window.removeEventListener("keydown", keyh); };
    show();
  }

  /* ----- Panel simulator ----- */
  Views.sim = function (id) {
    if (id === "free") return freePlay();
    const sc = S95.scenarios.find(s => s.id === id);
    if (!sc) {
      app.innerHTML = `<h1>Panel Simulator</h1><p class="muted">Practice the real decisions an S-95 makes at the fire alarm control panel. Use the panel buttons or pick answers from the list.</p>
        <div class="grid grid-2">
          <a class="card feature scenario-card" href="#/sim/free"><span class="icon">🧪</span><h3>Free-play panel</h3><span class="muted small">Trigger any alarm, supervisory or trouble condition, then see what ACK, SILENCE and RESET really do.</span></a>
          ${S95.scenarios.map(s => `<a class="card feature scenario-card" href="#/sim/${s.id}"><div class="row"><span class="tag ${s.tag === "Fire alarm" ? "bad" : s.tag === "Trouble" || s.tag === "Supervisory" ? "warn" : ""}">${s.tag}</span><span class="spacer"></span>${DB.sims[s.id] ? `<span class="tag good">Best ${DB.sims[s.id]}%</span>` : ""}</div><h3>${s.title}</h3><span class="muted small">${s.brief}</span></a>`).join("")}
        </div>`;
      return;
    }
    let step = 0, firstTry = 0, tried = false;
    const logLines = [];
    app.innerHTML = `<div class="row"><a href="#/sim" class="btn sm">← Scenarios</a><h1 style="margin:0 0 0 8px">${sc.title}</h1><span class="spacer"></span><button class="btn sm" id="snd"></button></div>
      <div class="sim-layout" style="margin-top:16px"><div><div id="panel"></div><h3 style="margin-top:16px">Log book (draft)</h3><div class="sim-log" id="slog"><div class="muted">No entries yet.</div></div></div>
      <div class="card stack"><div class="callout">${sc.brief}</div><div id="stepbox"></div></div></div>`;
    sndBtn();
    const panel = new S95.Panel($("#panel"), key => {
      const s = sc.steps[step]; if (!s) return;
      const k = s.options.findIndex(o => o.panel === key);
      if (k >= 0) choose(k); else feedback(false, `Pressing ${key.toUpperCase()} isn't the right move at this point. Read the question and decide what the S-95 should do.`);
    });
    panel.set(sc.initial);
    function addLog(t) { logLines.push(t); $("#slog").innerHTML = logLines.map(l => `<div>${esc(l)}</div>`).join(""); }
    function renderStep() {
      const s = sc.steps[step];
      if (!s) return finish();
      if (s.before) panel.set(s.before);
      tried = false;
      $("#stepbox").innerHTML = `<div class="muted small">Step ${step + 1} of ${sc.steps.length}</div><h3>${s.prompt}</h3>
        <div class="step-opts">${shuffle(s.options.map((o, k) => ({ o, k }))).map(({ o, k }) => `<button class="choice" data-k="${k}"><span>${esc(o.text)}${o.panel ? ` <span class="kbd">${o.panel.toUpperCase()}</span>` : ""}</span></button>`).join("")}</div><div id="sfb"></div>`;
      $("#stepbox").querySelectorAll(".choice").forEach(b => b.onclick = () => choose(+b.dataset.k));
    }
    function feedback(ok, text) { $("#sfb").innerHTML = `<div class="fb ${ok ? "good" : "bad"}">${esc(text)}</div>`; }
    function choose(k) {
      const s = sc.steps[step], o = s.options[k];
      const btn = $(`#stepbox .choice[data-k="${k}"]`);
      if (!o.ok) { if (!tried) tried = true; if (btn) { btn.classList.add("wrong"); btn.disabled = true; } feedback(false, o.fb); S95.sound.wrong(); return; }
      if (!tried) firstTry++;
      if (btn) btn.classList.add("correct");
      $("#stepbox").querySelectorAll(".choice").forEach(b => b.disabled = true);
      S95.sound.right();
      if (s.after) { panel.set(s.after); if (s.after.log) addLog(s.after.log); }
      $("#sfb").innerHTML = `<div class="fb good">${esc(o.fb)}</div><div class="row" style="margin-top:10px"><span class="spacer"></span><button class="btn primary" id="snext">${step + 1 < sc.steps.length ? "Next step →" : "Finish"}</button></div>`;
      $("#snext").focus(); $("#snext").onclick = () => { step++; renderStep(); };
    }
    function finish() {
      const pct = Math.round(100 * firstTry / sc.steps.length);
      DB.sims[sc.id] = Math.max(DB.sims[sc.id] || 0, pct); save();
      S95.sound.buzzer(false);
      const nextSc = S95.scenarios[S95.scenarios.indexOf(sc) + 1];
      $("#stepbox").innerHTML = `<h2>Scenario complete</h2><div class="score-big">${pct}%</div><p>Correct on the first try: ${firstTry} of ${sc.steps.length} steps.</p>
        <div class="row"><a class="btn" href="#/sim">All scenarios</a>${nextSc ? `<a class="btn primary" href="#/sim/${nextSc.id}">Next: ${nextSc.title}</a>` : ""}</div>`;
    }
    cleanup = () => S95.sound.buzzer(false);
    renderStep();
  };
  function sndBtn() {
    const b = $("#snd"); if (!b) return;
    const lbl = () => b.textContent = S95.sound.muted ? "🔇 Sound off" : "🔊 Sound on";
    lbl(); b.onclick = () => { S95.sound.toggle(); lbl(); };
  }
  function freePlay() {
    app.innerHTML = `<div class="row"><a href="#/sim" class="btn sm">← Scenarios</a><h1 style="margin:0 0 0 8px">Free-play panel</h1><span class="spacer"></span><button class="btn sm" id="snd"></button></div>
      <div class="sim-layout" style="margin-top:16px"><div id="panel"></div>
        <div class="card stack"><div><h3>1. Trigger a condition</h3><div class="row">${Object.entries(S95.SandboxEvents).map(([k, v]) => `<button class="btn sm" data-ev="${k}">${v.type === "alarm" ? "🔴" : "🟡"} ${v.label}</button>`).join("")}</div></div>
        <div><h3>2. Use the panel keys, or fix the cause</h3><button class="btn" id="clear">🧹 Clear the cause (smoke gone, water stopped, wiring fixed…)</button></div>
        <div><h3>What happened</h3><div class="sim-log" id="slog" style="max-height:320px"><div class="muted">Trigger something to begin.</div></div></div></div></div>`;
    sndBtn();
    const lines = [];
    const log = t => { lines.unshift(t); $("#slog").innerHTML = lines.slice(0, 30).map(l => `<div>${l}</div>`).join(""); };
    let sb;
    const panel = new S95.Panel($("#panel"), k => sb.key(k));
    sb = new S95.Sandbox(panel, log); sb.update();
    app.querySelectorAll("[data-ev]").forEach(b => b.onclick = () => sb.trigger(b.dataset.ev));
    $("#clear").onclick = () => sb.clearCause();
    cleanup = () => S95.sound.buzzer(false);
  }

  /* ----- Game ----- */
  Views.play = function (lvl) {
    const levels = S95.gameLevels();
    const unlocked = k => k === 0 || (DB.game[k - 1] && DB.game[k - 1].stars) || DB.game.unlockAll;
    if (lvl === undefined || !levels[+lvl] || !unlocked(+lvl)) {
      const totalStars = levels.reduce((s, l) => s + ((DB.game[l.idx] || {}).stars || 0), 0);
      app.innerHTML = `<div class="row"><h1 style="margin:0">🎮 Alarm Run</h1><span class="spacer"></span><span class="tag">★ ${totalStars} / ${levels.length * 3}</span><button class="btn sm" id="snd"></button></div>
        <p class="muted">Climb the building one floor at a time. Each floor is a topic from the S-95 booklet. Bump the red <b>🔔 alarm blocks</b> from below to answer questions, stomp smoke puffs, and reach the EXIT. Clear a floor to unlock the next one.</p>
        <div class="grid grid-3">${levels.map(l => { const r = DB.game[l.idx] || {}; const u = unlocked(l.idx); return `
          <${u ? `a href="#/play/${l.idx}"` : "div"} class="card feature level-card ${u ? "" : "locked"}">
            <div class="row"><span class="icon">${u ? l.icon : "🔒"}</span><span class="spacer"></span><span class="stars-sm">${"★".repeat(r.stars || 0)}${"☆".repeat(3 - (r.stars || 0))}</span></div>
            <h3>${l.name}: ${l.title}</h3><span class="muted small">${l.blocks} alarm blocks${r.best ? ` · Best ${r.best}` : ""}</span>
          </${u ? "a" : "div"}>`; }).join("")}</div>
        <p class="small muted" style="margin-top:16px">Want to skip ahead? <button class="btn sm" id="unlock">${DB.game.unlockAll ? "Re-lock floors" : "Unlock all floors"}</button></p>`;
      sndBtn();
      $("#unlock").onclick = () => { DB.game.unlockAll = !DB.game.unlockAll; save(); route(); };
      return;
    }
    const level = levels[+lvl];
    app.innerHTML = `<div class="row" style="margin-bottom:10px"><a class="btn sm" href="#/play">← Floors</a><b>${level.name}: ${level.title}</b><span class="spacer"></span><button class="btn sm" id="snd"></button></div><div id="game"></div>`;
    sndBtn();
    const inst = S95.Game.mount($("#game"), level, {
      onComplete(res) {
        const r = DB.game[level.idx] || {};
        DB.game[level.idx] = { stars: Math.max(r.stars || 0, res.stars), best: Math.max(r.best || 0, res.score) }; save();
      },
      onNext() { location.hash = levels[level.idx + 1] ? `#/play/${level.idx + 1}` : "#/exam"; },
      onRestart() { route(); },
      onQuit() { location.hash = "#/play"; }
    });
    cleanup = () => inst.destroy();
  };

  /* ----- Progress ----- */
  Views.progress = function () {
    const seen = Object.keys(DB.q).length, total = S95.questions.length;
    const right = Object.values(DB.q).reduce((s, r) => s + r.right, 0), att = Object.values(DB.q).reduce((s, r) => s + r.seen, 0);
    const ready = Math.round(S95.topics.reduce((s, t) => s + topicMastery(t.id), 0) / S95.topics.length);
    app.innerHTML = `<h1>Your progress</h1>
      <div class="grid grid-3">
        <div class="card"><div class="muted small">Exam readiness (avg. mastery)</div><div class="stat">${ready}%</div><div class="progress-bar"><span style="width:${ready}%"></span></div></div>
        <div class="card"><div class="muted small">Questions seen</div><div class="stat">${seen}<span class="muted small"> / ${total}</span></div></div>
        <div class="card"><div class="muted small">Accuracy (all attempts)</div><div class="stat">${att ? Math.round(100 * right / att) : 0}%</div><span class="muted small">${att} answers</span></div>
      </div>
      <div class="card" style="margin-top:16px"><h3>Mastery by topic</h3>
        ${S95.topics.map(t => `<div class="bar-row"><a href="#/learn/${t.id}">${t.icon} ${t.title}</a><div class="progress-bar"><span style="width:${topicMastery(t.id)}%"></span></div><span class="small">${topicMastery(t.id)}%</span></div>`).join("")}
        <p class="small muted">A question counts fully once you've answered it right twice in a row, and partly after one correct answer. Your most recent answer counts.</p></div>
      <div class="row" style="margin-top:16px"><a class="btn primary" href="#/practice/weak">Review missed (${weakQuestions().length})</a><span class="spacer"></span>
        <button class="btn" id="export">Export progress</button><label class="btn">Import<input type="file" id="import" accept="application/json" hidden></label><button class="btn" id="wipe">Reset all progress</button></div>
      <p class="small muted">Progress is saved in this browser only. Export it to move it to another device.</p>`;
    $("#wipe").onclick = () => { if (confirm("Erase all progress, exam history and game stars?")) { DB = { q: {}, exams: [], lessons: {}, sims: {}, game: {}, cards: {} }; save(); route(); } };
    $("#export").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(DB)], { type: "application/json" }));
      a.download = "s95-progress.json"; a.click();
    };
    $("#import").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { try { const d = JSON.parse(t); if (typeof d !== "object" || !d.q) throw 0; DB = Object.assign({ q: {}, exams: [], lessons: {}, sims: {}, game: {}, cards: {} }, d); save(); route(); } catch (x) { alert("That file isn't an S-95 progress export."); } });
    };
  };

  route();
})();
