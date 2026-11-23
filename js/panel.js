/* Simulated Fire Alarm Control Panel (FACP) component + free-play sandbox logic. */
window.S95 = window.S95 || {};

S95.Panel = function (container, onKey) {
  this.state = { lcd: ["SYSTEM NORMAL", "", "", ""], leds: { ac: "on" }, buzzer: false };
  this.onKey = onKey || function () {};
  container.innerHTML = `
    <div class="facp" role="group" aria-label="Simulated fire alarm control panel">
      <div class="facp-head"><span>FIRE ALARM CONTROL PANEL</span><span>S95-SIM</span></div>
      <div class="facp-inner">
        <div class="lcd" aria-live="polite"></div>
        <div class="leds">
          <div class="led green" data-led="ac"><i></i>AC POWER</div>
          <div class="led red" data-led="alarm"><i></i>ALARM</div>
          <div class="led amber" data-led="sup"><i></i>SUPERVISORY</div>
          <div class="led amber" data-led="trouble"><i></i>TROUBLE</div>
          <div class="led amber" data-led="silenced"><i></i>SILENCED</div>
          <div class="led amber" data-led="buzzer"><i></i>PANEL SOUNDER</div>
        </div>
        <div class="facp-keys">
          <button class="fkey k-ack" data-key="ack">ACKNOWLEDGE</button>
          <button class="fkey k-sil" data-key="silence">ALARM SILENCE</button>
          <button class="fkey k-reset" data-key="reset">SYSTEM RESET</button>
          <button class="fkey k-drill" data-key="drill">DRILL</button>
          <button class="fkey" data-key="fan">FAN RESTART</button>
          <button class="fkey" data-key="lamp">LAMP TEST</button>
        </div>
      </div>
      <div class="facp-foot"><span>Central Station: OKK 718-999-9999</span><span>Acct #40217</span></div>
    </div>`;
  this.el = container;
  container.querySelectorAll(".fkey").forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.key;
    if (k === "lamp") return this.lampTest();
    this.onKey(k);
  }));
  this.render();
};

S95.Panel.prototype.set = function (patch) {
  if (!patch) return;
  if (patch.lcd) this.state.lcd = patch.lcd;
  if (patch.leds) Object.assign(this.state.leds, patch.leds);
  if ("buzzer" in patch) this.state.buzzer = patch.buzzer;
  this.render();
};

S95.Panel.prototype.render = function () {
  const s = this.state;
  this.el.querySelector(".lcd").textContent = s.lcd.join("\n");
  const leds = Object.assign({}, s.leds, { buzzer: s.buzzer ? "flash" : "off" });
  this.el.querySelectorAll(".led").forEach(l => {
    const v = leds[l.dataset.led] || "off";
    l.classList.toggle("on", v !== "off");
    l.classList.toggle("blink", v === "flash");
  });
  if (S95.sound) S95.sound.buzzer(!!s.buzzer);
};

S95.Panel.prototype.lampTest = function () {
  const leds = this.el.querySelectorAll(".led");
  leds.forEach(l => l.classList.add("on"));
  setTimeout(() => this.render(), 900);
};

/* ---------------- Sandbox: realistic panel logic you can poke at ---------------- */
S95.SandboxEvents = {
  smoke:    { label: "Smoke detector (3rd fl)",  type: "alarm",   lcd: ["FIRE ALARM", "SMOKE DET L1D014", "3RD FL CORRIDOR"], latch: true,
              note: "Smoke detector → FIRE ALARM. Horns and strobes sound, the central station retransmits to the FDNY, and building functions (elevator recall, fans, doors) activate." },
  pull:     { label: "Pull station (lobby)",     type: "alarm",   lcd: ["FIRE ALARM", "PULL STA L1M001", "LOBBY EXIT"], latch: true,
              note: "Manual pull station → FIRE ALARM. The station must be reset (often with a key) before the FACP can be reset." },
  water:    { label: "Waterflow (riser 2)",      type: "alarm",   lcd: ["FIRE ALARM", "WATERFLOW L2M006", "6TH FL RISER"], latch: false,
              note: "Waterflow → FIRE ALARM. The system can't be silenced or reset until water stops flowing." },
  tamper:   { label: "Valve tamper",             type: "sup",     lcd: ["SUPERVISORY", "VALVE TAMPER L2M031", "CELLAR CV"], latch: false,
              note: "Valve tamper → SUPERVISORY. The FDNY does not respond to supervisory signals. Investigate and correct." },
  co:       { label: "CO detector",              type: "sup",     lcd: ["SUPERVISORY", "CO DETECTOR L1D088", "BOILER ROOM"], latch: true,
              note: "CO detector → SUPERVISORY (per the booklet). The FDNY must determine CO is at safe levels before reset." },
  pump:     { label: "Fire pump running",        type: "sup",     lcd: ["SUPERVISORY", "FIRE PUMP RUN", "PUMP ROOM"], latch: false,
              note: "Fire pump running, failure, or phase reversal → SUPERVISORY." },
  ac:       { label: "AC power failure",         type: "trouble", lcd: ["TROUBLE", "AC POWER FAIL", "PANEL ON BATTERY"], latch: false, acOff: true,
              note: "AC failure → TROUBLE. The panel runs on secondary power. Correction is by an approved company." },
  ground:   { label: "Ground fault",             type: "trouble", lcd: ["TROUBLE", "GROUND FAULT", "LOOP 2"], latch: false,
              note: "Ground fault → TROUBLE. A fault in a monitored circuit, investigated and corrected by an approved company." },
  phone:    { label: "Phone line failure",       type: "trouble", lcd: ["TROUBLE", "DACT LINE 1 FAIL", "CS COMMUNICATION"], latch: false,
              note: "Phone line failure → TROUBLE. Report transmitter problems to the central station and log them." }
};

S95.Sandbox = function (panel, logFn) {
  this.panel = panel; this.log = logFn;
  this.active = {};   // id -> { cleared:boolean, acked:boolean }
  this.silenced = false;
};
S95.Sandbox.prototype.trigger = function (id) {
  if (this.active[id]) return;
  this.active[id] = { cleared: false, acked: false };
  this.silenced = false;
  const ev = S95.SandboxEvents[id];
  this.log(`<b>${ev.type === "alarm" ? "🔴 FIRE ALARM" : ev.type === "sup" ? "🟡 SUPERVISORY" : "🟡 TROUBLE"}</b>: ${ev.note}`);
  this.update();
};
S95.Sandbox.prototype.clearCause = function () {
  let any = false;
  for (const id in this.active) {
    const ev = S95.SandboxEvents[id];
    if (this.active[id].cleared) continue;
    this.active[id].cleared = true; any = true;
    if (!ev.latch) delete this.active[id]; // non-latching restores automatically
  }
  this.log(any ? "🧹 Cause removed (smoke cleared, water stopped, valve reopened, wiring repaired…). Non-latching conditions clear by themselves. Latched alarms still need a RESET at FDNY direction." : "Nothing to clear.");
  this.update();
};
S95.Sandbox.prototype.key = function (k) {
  const ids = Object.keys(this.active);
  if (k === "ack") {
    ids.forEach(id => this.active[id].acked = true);
    this.log(ids.length ? "ACK: the panel sounder stops and LEDs go steady. The condition still exists." : "ACK: nothing to acknowledge.");
  } else if (k === "silence") {
    const alarms = ids.filter(id => S95.SandboxEvents[id].type === "alarm");
    if (!alarms.length) { this.log("SILENCE: no active alarm to silence."); }
    else if (alarms.some(id => id === "water" && !this.active[id].cleared)) {
      this.log("⛔ SILENCE refused: water is still flowing. It can't be silenced until waterflow stops (§6.3).");
    } else {
      this.silenced = true;
      this.log("SILENCE: the horns stop (strobes may keep flashing). The central station signal is NOT stopped. Remember: don't silence until the FDNY verifies the condition.");
    }
  } else if (k === "reset") {
    if (!ids.length) { this.log("RESET: system already normal."); }
    else {
      const still = ids.filter(id => !this.active[id].cleared);
      ids.filter(id => this.active[id].cleared).forEach(id => delete this.active[id]);
      if (still.length) this.log(`⚠️ RESET: ${still.map(id => S95.SandboxEvents[id].label).join(", ")} still active, so the condition comes right back (§4.4). Clear the cause first, and only reset at FDNY direction.`);
      else this.log("✅ RESET: all devices are normal, so the system returns to normal. Restart fans with FAN RESTART if needed.");
      this.silenced = false;
    }
  } else if (k === "drill") {
    this.log("DRILL: manually turns on notification appliances. Take the system off-line with the central station first (§10.6).");
  } else if (k === "fan") {
    this.log("FAN RESTART: restarts air handlers shut down by the fire alarm. This is a separate step after a reset (§4.4).");
  }
  this.update();
};
S95.Sandbox.prototype.update = function () {
  const ids = Object.keys(this.active);
  const evs = ids.map(id => S95.SandboxEvents[id]);
  const led = type => {
    const of = ids.filter(id => S95.SandboxEvents[id].type === type);
    if (!of.length) return "off";
    return of.every(id => this.active[id].acked) ? "on" : "flash";
  };
  const top = evs.find(e => e.type === "alarm") || evs.find(e => e.type === "sup") || evs[0];
  const lcd = top ? [top.lcd[0] + `  ${ids.length > 1 ? "001/" + String(ids.length).padStart(3, "0") : "001/001"}`, top.lcd[1], top.lcd[2], new Date().toLocaleTimeString()] : ["SYSTEM NORMAL", "", "", new Date().toLocaleTimeString()];
  this.panel.set({
    lcd,
    leds: { ac: evs.some(e => e.acOff) ? "off" : "on", alarm: led("alarm"), sup: led("sup"), trouble: led("trouble"), silenced: this.silenced ? "on" : "off" },
    buzzer: ids.some(id => !this.active[id].acked)
  });
};
