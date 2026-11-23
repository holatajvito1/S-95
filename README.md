# S-95 Study Coach

A free, offline-friendly web app for passing the **FDNY Certificate of Fitness S-95: Supervision of Fire Alarm Systems** exam.

Content follows the official **FDNY S-95 Study Material, revised October 2026** (35 questions · 53 minutes · 70% to pass).

## Study modes

| Mode | What it does |
|---|---|
| 🎮 **Alarm Run** | An original side-scrolling platformer. Each building floor is a booklet topic. Jump up and bump the red 🔔 **alarm blocks** to answer exam questions, stomp smoke puffs, grab 📒 log-book pages for quick facts, and reach the EXIT. The Rooftop floor is a mixed-topic final. Earn up to 3 stars per floor. |
| 📚 **Learn** | 12 lessons that follow the booklet section by section, covering signal types, FACP controls, initiating devices, inspections, the alarm log book, out-of-service rules, unnecessary/unwarranted alarms, extinguishers and lithium-ion safety. |
| 🃏 **Flashcards** | Flip cards for every question, with a "known" tracker. |
| ✅ **Practice** | Choose topics and get instant feedback. Each explanation cites its booklet section. Includes a "review missed questions" mode. |
| ⏱️ **Exam Simulation** | 35 weighted-random questions, a 53-minute timer, flagging, a question navigator, a 70% pass line, results by topic, and full review. |
| 🎛️ **Panel Simulator** | A simulated fire alarm control panel. Six guided scenarios (smoke alarm, valve tamper, ground fault, planned test, waterflow, CO) plus a free-play mode that shows what ACK, SILENCE and RESET really do. |
| 📈 **Progress** | Mastery by topic, accuracy, exam history, and export/import. Progress is saved in the browser. |

## Running it

There is no build step and there are no dependencies. Either:

- open `index.html` in a browser, or
- serve the folder: `python3 -m http.server 8000`, then visit http://localhost:8000.

It also works on phones. The game shows touch controls on touch screens.

To publish it free with **GitHub Pages**, go to *Settings → Pages* and deploy from the branch root.

## Updating content when the FDNY revises the booklet

All content is plain data:

- `js/data/lessons.js`: topic list and lesson HTML
- `js/data/questions.js`: question bank (`{ id, t, q, a, w:[3 wrong], e, ref }`)
- `js/data/scenarios.js`: panel simulator scenarios

After editing, run the checks:

```bash
node tests/validate.js
```

This checks for duplicate IDs, exactly 4 choices per question, a minimum number of questions per topic, one correct option per scenario step, and that every procedurally generated game floor can be beaten.

## Disclaimer

This is an independent study aid. It is not affiliated with or endorsed by the FDNY. Always read the latest FDNY Notice of Exam and Study Material before your test.
