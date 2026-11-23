/*
 * S-95 lesson content, organized around the FDNY "Study Material for the Certificate of Fitness
 * Supervision of Fire Alarm Systems S-95", Revised October 2026.
 * Section references (e.g. "Booklet §10.2") point to that booklet.
 */
window.S95 = window.S95 || {};
S95.CONTENT_VERSION = "Based on FDNY S-95 booklet rev. October 2026";

S95.topics = [
  { id: "exam",        title: "Exam & Certificate Rules",        icon: "📝" },
  { id: "defs",        title: "Key Definitions",                 icon: "📖" },
  { id: "signals",     title: "The Three Signal Types",          icon: "🚨" },
  { id: "facp",        title: "FACP Controls & Alarm Response",  icon: "🎛️" },
  { id: "devices",     title: "Initiating Devices",              icon: "🔥" },
  { id: "related",     title: "Related Devices & Systems",       icon: "📢" },
  { id: "itm",         title: "Inspections, Tests & Who Does What", icon: "🛠️" },
  { id: "records",     title: "The Alarm Log Book",              icon: "📒" },
  { id: "oos",         title: "Off-Line & Out-of-Service",       icon: "⛔" },
  { id: "unnecessary", title: "Unnecessary & Unwarranted Alarms", icon: "⚠️" },
  { id: "pfe",         title: "Portable Fire Extinguishers",     icon: "🧯" },
  { id: "liion",       title: "Lithium-Ion Battery Safety",      icon: "🔋" }
];

S95.lessons = {
exam: `
<h1>Exam &amp; Certificate Rules</h1>

<h2>The exam (Booklet p. 5, 8)</h2>
<ul>
  <li><strong>35 multiple-choice questions</strong>, with <strong>4 answer choices</strong> each and only one correct answer.</li>
  <li>The exam is taken on a <strong>"touch screen" computer</strong> and has a <strong>53-minute</strong> time limit.</li>
  <li>The passing score is <strong>at least 70%</strong> (25 of 35 correct).</li>
  <li>A question left <strong>unanswered is scored as incorrect</strong>. There is <strong>no penalty for guessing</strong>, so answer every question.</li>
  <li>Only <strong>reference material provided by the FDNY</strong> may be used during the exam. Phones, your own booklet and music players are not allowed.</li>
  <li>For computer problems, ask the <strong>examiner in the testing room</strong>. FDNY staff <strong>cannot</strong> help with exam questions.</li>
  <li>Exam site: <strong>FDNY Headquarters, 9 MetroTech Center, Brooklyn</strong>. Enter through the Flatbush Avenue entrance.</li>
</ul>

<h2>Applying (Booklet p. 4–5)</h2>
<ul>
  <li>You must <strong>apply and pay online before arriving</strong> at the FDNY. The application takes about 30 minutes.</li>
  <li>Accepted payment: credit or debit card (with a <strong>2% convenience fee</strong>), or a personal or company check or money order payable to the New York City Fire Department.</li>
  <li><strong>Each testing opportunity needs a separate application and payment.</strong> You <strong>cannot retest on the same calendar day</strong>.</li>
  <li>Fee waivers are only for <strong>government employees</strong> who will use the certificate for their job. They need a letter on agency letterhead and a copy of their agency ID.</li>
  <li>An <strong>Alternative Issuance Procedure (AIP)</strong> is available to qualified applicants.</li>
  <li>Renewal: the FDNY strongly recommends renewing online. There are <strong>no special renewal requirements</strong> for the S-95.</li>
</ul>

<h2>Who needs an S-95? (Booklet §1)</h2>
<div class="table-wrap"><table>
<tr><th>Fire alarm system / occupancy</th><th>Certificate required</th></tr>
<tr><td>Two-way voice communication with warden phones</td><td>FLSD (F-89/T-89)</td></tr>
<tr><td>Commercial or mixed-use high-rise building</td><td>FLSD</td></tr>
<tr><td>Hotel with 50 or more sleeping rooms above the ground floor, with one- or two-way communication</td><td>FLSD</td></tr>
<tr><td>Homeless shelter not requiring an FLSD</td><td>F-80</td></tr>
<tr><td>One-way communication (public announcement) not requiring an FLSD or F-80</td><td>F-53</td></tr>
<tr><td><strong>No voice communication system</strong>, and no FLSD, F-80 or F-53 required</td><td><strong>S-95</strong></td></tr>
</table></div>
<ul>
  <li>Holders of the <strong>F-89, T-89, F-80 or F-53</strong> are <strong>exempt</strong> from getting a separate S-95 for the <em>same</em> premises.</li>
  <li>They can get an S-95 for a <em>different</em> premises <strong>without the exam</strong>, but they still need an <strong>employer recommendation letter and the $25 payment</strong>.</li>
  <li>Every premises should have a fire alarm system approved by an <strong>FDNY Letter of Approval</strong>. Ask the building owner or property manager about it.</li>
</ul>

<div class="callout key"><strong>Numbers to know:</strong> 35 questions · 53 minutes · 70% to pass · 4 choices · $25 · no retest on the same day.</div>
`,

defs: `
<h1>Key Definitions (Booklet §1.1)</h1>
<p>Definition questions are easy points. Learn the exact distinctions.</p>
<div class="table-wrap"><table>
<tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Accessibility</td><td>"Admitting close approach: not guarded by locked doors, elevation, and other effective means" (NFPA).</td></tr>
<tr><td>Alarm notification appliance</td><td>A bell, horn, speaker, light, text display or vibration device that gives an audible, tactile or visual alert.</td></tr>
<tr><td>Alarm signal</td><td>A signal indicating an <strong>emergency requiring immediate action</strong>, such as a fire.</td></tr>
<tr><td>Annunciator</td><td>A unit with indicator lamps or displays, each giving status information about a circuit, condition or location.</td></tr>
<tr><td>Approved central station company</td><td>A central station company with a valid <strong>certificate of operation from the FDNY</strong>.</td></tr>
<tr><td>ARCS</td><td>Auxiliary Radio Communication System: an in-building wireless two-way radio system for <strong>Fire Department use only</strong>.</td></tr>
<tr><td>Central station</td><td>A facility that receives alarm signals from protected premises and <strong>retransmits them to the Fire Department</strong>.</td></tr>
<tr><td>Defined fire alarm system</td><td>A fire alarm system (or sub-system) that automatically transmits signals to the FDNY or a central station, in premises <strong>required</strong> to have a fire alarm system.</td></tr>
<tr><td>Designated representative</td><td>The person the subscriber designates to receive central station notifications about the system's status, and who is authorized to act on the system.</td></tr>
<tr><td>Fire alarm control panel (FACP, FCS)</td><td>Receives inputs from automatic and manual devices, powers detection devices and transmitters, and transfers power to notification appliances and relays.</td></tr>
<tr><td>Fire protection system</td><td>Devices and systems that detect fire, activate an alarm, extinguish or control fire, or control smoke. This includes fire alarm, sprinkler and standpipe systems.</td></tr>
<tr><td>Impairment coordinator</td><td>The person the <strong>owner</strong> designates to make sure safety precautions are taken when a fire protection system is out of service.</td></tr>
<tr><td>Initiating device</td><td>A component that starts transmission of a change-of-state condition, such as a smoke detector, manual fire alarm box or supervisory switch.</td></tr>
<tr><td>Lamp test</td><td>A function on some FACPs to check the panel's LEDs.</td></tr>
<tr><td>Nuisance alarm</td><td>An alarm caused by mechanical failure, malfunction, improper installation or lack of maintenance, <strong>or any alarm whose cause cannot be determined</strong>.</td></tr>
<tr><td>Out-of-service system</td><td>A fire protection system that is <strong>not fully functional</strong>, or whose operation is impaired or not in good working order.</td></tr>
<tr><td>Plenum</td><td>The open space that carries air between the ceiling and the floor above.</td></tr>
<tr><td>Protected premises</td><td>A building with a fire alarm system that transmits to the FDNY or a central station, <strong>whether or not the system is required by law</strong>.</td></tr>
<tr><td>Remote annunciator panel</td><td>Gives <strong>visual notification only</strong> of alarm, supervisory or trouble conditions.</td></tr>
<tr><td>Shall / Should</td><td><strong>Shall</strong> = mandatory. <strong>Should</strong> = recommended, not required.</td></tr>
<tr><td>Single-station smoke alarm</td><td>The detector, controls and sounder are all in one unit.</td></tr>
<tr><td>Smoke alarm vs. smoke detector</td><td>A smoke <strong>alarm</strong> is <strong>not</strong> connected to a fire alarm system. A smoke <strong>detector</strong> <strong>is</strong> connected to a fire alarm system.</td></tr>
<tr><td>Smoke detector maintenance company certificate</td><td>An FDNY certificate for a business that cleans and tests smoke detectors, and supervises Certificate of Fitness holders doing that work.</td></tr>
<tr><td>Supervisory signal</td><td>A signal indicating the need for action in connection with guard tours, fire-extinguishing systems, fire alarm systems or maintenance features of related systems.</td></tr>
<tr><td>Trouble signal</td><td>A signal indicating a <strong>fault in a monitored circuit or component</strong>. It must be investigated and corrected by an <strong>approved company</strong>.</td></tr>
<tr><td>Unnecessary alarm</td><td>The system <strong>worked as designed</strong>, but no FDNY response was needed. Example: smoke from a lit cigarette in a non-smoking area.</td></tr>
<tr><td>Unwarranted alarm</td><td>The system <strong>failed to work as designed</strong> because of improper installation, improper maintenance or a malfunction. Examples: bad detector placement, wrong detector setting, no maintenance, panel malfunction. <strong>Alarm verification</strong> reduces unwarranted alarms.</td></tr>
</table></div>
<div class="callout key"><strong>Unnecessary</strong> = the system worked right, but there was no need for the FDNY. <strong>Unwarranted</strong> = the system did not work right.</div>
`,

signals: `
<h1>The Three Signal Types (Booklet §3.2)</h1>
<p><em>"The primary purpose of fire alarm systems within protected premises is to warn building occupants and transmit signals indicating a fire condition to the Fire Department via a FDNY approved central station company."</em></p>

<h2>1. Fire alarm signal</h2>
<ul>
  <li>Started by a <strong>manual pull station, smoke detector, heat detector, waterflow switch</strong>, or another device that indicates fire.</li>
  <li>The FACP turns on the building's <strong>audible and visual devices</strong> (horns and strobes), <strong>sends a signal to the FDNY-approved central station</strong>, and runs certain <strong>building functions</strong>.</li>
  <li>Central station operators must process <strong>fire alarm signals before any other signals</strong>, no matter what order they arrive in.</li>
  <li>Alarm signals are retransmitted to the FDNY <strong>immediately</strong>. A signal counts as received when the central station's <strong>automation software processes it</strong>. The operator notifies the premises <strong>after</strong> retransmitting to the FDNY.</li>
  <li>The retransmission must say the <strong>type of alarm</strong>: automatic, valve, manual or carbon monoxide.</li>
  <li><strong>Every</strong> fire alarm signal is retransmitted to the FDNY, <strong>even if it automatically restores</strong>. There are <strong>no exceptions</strong>.</li>
</ul>

<h2>2. Supervisory signal</h2>
<ul>
  <li>A monitored system or device has been <strong>compromised or is in an abnormal state</strong>. It sounds and lights at the FACP and is <strong>sent to the central station</strong>.</li>
  <li>Sources: a <strong>valve supervisory (tamper) switch</strong> on a sprinkler system, a <strong>high or low water level</strong> switch on a gravity tank, <strong>low air pressure</strong> on a dry-pipe sprinkler system, and <strong>fire pump running, pump failure or phase reversal</strong>.</li>
  <li>Also: pressure tanks (high and low pressure), water tanks (low temperature), the <strong>emergency generator running or failing to start</strong>, <strong>carbon monoxide detectors</strong>, and <strong>flammable gas detectors</strong> connected to the FACP.</li>
  <li><strong>The FDNY does not respond to supervisory signals.</strong> Supervisory signals may not flag a fire condition. (CO and gas activations are the exception: the central station notifies the owner and the FDNY, because they may be life-threatening.)</li>
</ul>

<h2>3. Trouble signal</h2>
<ul>
  <li>The alarm system, transmitter, or communications path is <strong>wholly or partially out of service</strong>.</li>
  <li>Common causes: <strong>battery condition, AC failure, ground fault, an open or short circuit on a wire, phone line failure</strong>, and internal component failure.</li>
  <li>The central station must contact the subscriber's designated persons immediately. Routine handling should take <strong>no more than 4 minutes</strong> from receiving the trouble signal to starting the investigation by telephone.</li>
  <li>A trouble must be investigated and corrected by an <strong>approved company</strong>.</li>
</ul>

<div class="callout key">Pull station, smoke, heat, waterflow → <strong>FIRE ALARM</strong>. Tamper, tank level, low air, fire pump, generator, CO, gas → <strong>SUPERVISORY</strong>. Battery, AC failure, ground fault, open or short, phone line → <strong>TROUBLE</strong>.</div>
`,

facp: `
<h1>FACP Controls &amp; Alarm Response (Booklet §3.1, §4)</h1>

<h2>Know your panel</h2>
<ul>
  <li>The FACP monitors inputs and controls outputs. Its primary purpose is to <strong>process signals from initiating devices and activate the right signals and outputs</strong>.</li>
  <li>The S-95 must be familiar with the panel(s) at their location. <strong>Get the operations manual and panel instructions</strong>. Instructions should be <strong>posted next to the FACP</strong>.</li>
  <li>When an alarm activates, the certificate holder should <strong>report to the FACP</strong> when present and practical.</li>
</ul>

<h2>Alarm log book entry (§4.1)</h2>
<p>For an alarm, record the <strong>date and time</strong>, the <strong>location</strong>, <strong>which device</strong> activated, and the <strong>probable cause</strong>.</p>

<h2>The controls</h2>
<div class="table-wrap"><table>
<tr><th>Control</th><th>What it does</th><th>Key facts</th></tr>
<tr><td><strong>Acknowledge (ACK)</strong></td><td>Acknowledges alarm, trouble or supervisory conditions.</td><td>The sequence differs between systems.</td></tr>
<tr><td><strong>Alarm Silence</strong></td><td>Silences building audible devices. Depending on the system, the strobes may keep flashing.</td><td>It <strong>does not stop the signal going to the central station</strong>. It is meant to make communication easier for responders after evacuation, while the alarm is investigated.</td></tr>
<tr><td><strong>System Reset</strong></td><td>Resets the system <strong>after the alarm condition has cleared</strong>.</td><td>If a device is still in alarm (smoke still present, pull station still pulled), <strong>another alarm is generated</strong>. Most trouble and supervisory conditions clear automatically when conditions return to normal.</td></tr>
<tr><td><strong>Fan Restart</strong></td><td>A separate button or key switch.</td><td>After a fire alarm is reset, fans usually need to be <strong>restarted separately</strong>.</td></tr>
<tr><td><strong>Lamp Test</strong></td><td>Checks the panel LEDs.</td><td>Only on some panels.</td></tr>
</table></div>

<div class="callout warn"><strong>DO NOT SILENCE BUILDING AUDIBLE/VISUAL DEVICES OR RESET THE FIRE ALARM PANEL UNTIL THE FIRE ALARM CONDITION IS VERIFIED BY FDNY PERSONNEL.</strong><br>
The FACP must only be reset <strong>at the direction of a Fire Department representative</strong>, after the FDNY has deemed the area safe.</div>

<h2>Resetting rules</h2>
<ul>
  <li>A FACP in alarm <strong>cannot be reset to normal</strong> until the device that signaled the alarm has returned to normal.</li>
  <li>A <strong>manual pull station must be reset at the station first</strong>, then at the FACP. The system <strong>cannot</strong> be reset at the pull station. A key or special tool may be needed.</li>
  <li>An alarm may be turned off <strong>only by a Certificate of Fitness holder or a Fire Department representative</strong>.</li>
  <li>A <strong>waterflow</strong> alarm cannot be reset or silenced until the water stops flowing.</li>
  <li>For a <strong>carbon monoxide</strong> alarm, the <strong>FDNY must determine</strong> that CO is at safe levels before the panel can be reset.</li>
</ul>

<h2>How each device returns to normal (§4.5)</h2>
<div class="table-wrap"><table>
<tr><th>Device</th><th>Signal</th><th>Return to normal</th></tr>
<tr><td>Manual pull station</td><td>Fire alarm</td><td>Return the handle to normal. A key or tool may be needed.</td></tr>
<tr><td>Smoke detector</td><td>Fire alarm</td><td>Resets when RESET is pressed at the FACP, <em>if</em> the condition has cleared.</td></tr>
<tr><td>Heat detector</td><td>Fire alarm</td><td>Most fixed-temperature types <strong>do not self-restore</strong> and must be <strong>replaced</strong> by a qualified technician. Rate-of-rise types normally <strong>self-restore</strong>.</td></tr>
<tr><td>Waterflow device</td><td>Fire alarm</td><td>Returns to normal when the water stops flowing.</td></tr>
<tr><td>Carbon monoxide detector</td><td><strong>Supervisory</strong></td><td>The FDNY must determine CO is at safe levels before the reset.</td></tr>
</table></div>
<p><strong>All abnormal conditions must be investigated and noted in the log book.</strong></p>
`,

devices: `
<h1>Initiating Devices (Booklet §6)</h1>
<p>An <strong>automatic fire detector</strong> detects smoke and/or heat and starts an action. "Initiating device" also covers devices that monitor other fire-safety conditions.
Devices must be installed with <strong>accessibility</strong> for cleaning and testing. If special equipment such as a man-lift is needed, the installer must make sure the owner knows it will be needed for future service.</p>

<h2>Smoke detectors (§6.1)</h2>
<ul>
  <li>Detect <strong>visible or invisible</strong> particles of combustion. They detect most fires <strong>much faster than heat detectors</strong>.</li>
  <li>Two benefits: <strong>early warning</strong>, so occupants can <strong>evacuate immediately</strong>.</li>
  <li>Types: <strong>photoelectric</strong> (optical detection), <strong>ionization</strong> (a physical process), and <strong>multi-sensor</strong> (both methods, for more sensitivity). Many also have a built-in heat sensor.</li>
  <li>They are fragile. Where they could be damaged, protect them with a guard <strong>listed for use with that detector</strong>.</li>
  <li>When a detector reports that it needs maintenance, it must be cleaned <strong>within 1 week</strong>.</li>
  <li>Never paint or alter a detector. If you find a painted detector, <strong>make a log entry and arrange replacement</strong> by a qualified technician.</li>
</ul>

<h3>Protecting detectors during construction</h3>
<ul>
  <li>Use <strong>listed (manufacturer-approved or UL-listed) detector covers</strong>. They block dust while allowing limited airflow, and are usually <strong>bright red</strong>.</li>
  <li>Cover detectors <strong>only during active dust-generating work</strong>: drywall sanding, saw cutting, concrete grinding, spraying paint or texture.</li>
  <li><strong>Remove covers at the end of each shift or when work stops.</strong></li>
</ul>

<h2>Heat detectors (§6.2)</h2>
<ul>
  <li><strong>Rate-of-rise</strong>: activates when room temperature rises rapidly. It is <strong>more sensitive</strong> than fixed-temperature, and <strong>does not need replacing</strong> after activation.</li>
  <li><strong>Fixed-temperature</strong>: the <strong>most used</strong> type. Two contacts are separated by a <strong>fusible element</strong> that <strong>melts</strong> at a preset temperature, so the contacts touch and start the alarm. It normally <strong>requires replacement</strong> after an alarm, although intelligent heat detectors usually reset themselves.</li>
  <li>Heat detectors can only be <strong>tested by authorized fire alarm technicians</strong>. The S-95 makes sure working detectors are in place and calls the maintenance company for repairs.</li>
  <li>Where they could be damaged, protect them with an approved <strong>UL/FM mechanical guard</strong>.</li>
</ul>

<h2>Sprinkler waterflow devices (§6.3)</h2>
<ul>
  <li>A <strong>vane or paddle</strong> in the pipe triggers a switch when water flows. This signals the FACP and rings a bell.</li>
  <li>It <strong>does not turn the water on or off</strong>.</li>
  <li>Activation sounds the fire alarm, <strong>recalls the elevators</strong>, and sends a <strong>fire alarm signal</strong> to the central station (if monitored).</li>
  <li>The system <strong>cannot be reset or silenced until the waterflow stops</strong>.</li>
</ul>

<h2>Carbon monoxide detectors (§6.4)</h2>
<ul>
  <li>Required in <strong>any building with fossil-fuel (gas or oil) burning equipment</strong>.</li>
  <li>Installed, tested and maintained by <strong>qualified personnel</strong> following the manufacturer's instructions.</li>
  <li>If a CO detector is in alarm and <strong>cannot be reset</strong>, CO may still be present. <strong>Assume CO is present</strong> and take life-safety precautions until it is ruled out.</li>
</ul>

<h2>Manual pull stations (§6.5–6.6)</h2>
<ul>
  <li>Located <strong>near the exits</strong>, and <strong>conspicuous, unobstructed and accessible</strong>. They must be on <strong>each floor</strong>. Under the Fire Code they must be <strong>red</strong>.</li>
  <li><strong>Single action</strong>: one step, such as pulling down a lever. The cover itself acts as the lever. Common in office buildings.</li>
  <li><strong>Double action</strong>: two steps. First break a glass, open a door or <strong>lift a cover</strong>, then pull the lever. A <strong>break-glass station</strong> uses a small metal mallet.</li>
  <li>The certificate holder must know how to operate <strong>every</strong> station on the premises.</li>
  <li>The FDNY may require <strong>protective covers</strong> to prevent malicious false alarms or physical damage.</li>
</ul>

<h2>Flammable/combustible gas detectors (§6.7)</h2>
<ul>
  <li>Know whether your gas detectors connect to a <strong>stand-alone monitor panel</strong> or to the <strong>FACP</strong>.</li>
  <li>If connected to the FACP, an activation is a <strong>supervisory signal</strong> sent to the central station. <strong>No alarm tone sounds</strong> on the premises.</li>
  <li>The central station still notifies the <strong>owner and the FDNY</strong>, because a gas leak can cause a fire or explosion.</li>
  <li>Treat it as a <strong>non-fire emergency</strong>: follow your building's non-fire emergency plan before the FDNY arrives, then <strong>comply with FDNY orders</strong>.</li>
</ul>

<h2>Look-alike devices (§3)</h2>
<p>A device that <strong>looks like</strong> fire protection equipment but does not perform the fire protection function, such as a <strong>security camera disguised as a smoke detector</strong> or a camera in an exit sign, is <strong>never permitted</strong>. Installing or keeping one is unlawful.</p>
`,

related: `
<h1>Related Devices &amp; Systems (Booklet §1, §3.3, §7–9)</h1>

<h2>Systems that may be interconnected</h2>
<p>Standpipe and sprinkler booster fire pumps, limited service fire pumps, emergency voice/alarm communication, the Fire Department communication system, CO alarms and detectors, automatic sprinklers, <strong>alternative extinguishing systems</strong> (range hood, halon, FM200), manual and automatic fire alarms, gas detection, smoke control, post-fire smoke purge, and ARCS.</p>

<h2>Sub-systems (§3.3)</h2>
<ul>
  <li>A sub-system is a voluntary or required activating system in a <strong>specific area or floor</strong> of a building that has a required base building fire alarm system.</li>
  <li>Examples: <strong>Halon, FM200, Water Mist, Pre-Action, Range Hood, Carbon Dioxide, Foam, Dry Chemical, Smoke Detection, Clean Air Agents, Thermostatic</strong>.</li>
  <li>Each needs FDNY inspection and testing for a <strong>Letter of Approval</strong>.</li>
  <li>A certificate holder must oversee its supervision and maintenance.</li>
  <li>It must be <strong>interconnected to the base building fire alarm system</strong> for alarm and trouble supervision, and must show its <strong>specific type and location</strong>.</li>
  <li>When it activates, it must turn on the <strong>base building audible and visual appliances</strong> and <strong>notify the FDNY through the base building central station</strong>.</li>
</ul>

<h2>Supervised conditions (§8)</h2>
<ol>
  <li>Control valves (sprinkler <strong>tamper switches</strong>), supervised for off-normal position</li>
  <li>Pressure tanks: high and low pressure</li>
  <li>Water tanks: <strong>low temperature</strong></li>
  <li>Water tanks: high and low water level</li>
  <li>Electric fire pumps: <strong>pump running, pump failure, phase reversal</strong></li>
  <li><strong>Emergency generator</strong> running, and failure to start</li>
</ol>
<p>When a supervisory condition shows, the certificate holder should check the system, identify the part that caused it, and deal with it. Some panels show the exact location. Others only show a general supervisory signal, so <strong>each supervised device must be inspected</strong>. Supervisory signals must also be sent to the central station.</p>

<h2>Notification appliances (§8.1)</h2>
<p>These are bells, horns, speakers, strobes, text displays, or combinations. They alert occupants to take action, usually to evacuate.</p>

<h2>Remote annunciator panel (§8.2)</h2>
<p>A remote annunciator is located where <strong>firefighters can reach it</strong> and shows the zone or location of the activated device. In large buildings it may be combined with a <strong>smoke purge control panel</strong> and emergency communications.</p>

<h2>Evacuation signals (§8.3)</h2>
<ul>
  <li><strong>Total/general</strong>: turns on all audible and visual devices throughout the building.</li>
  <li><strong>Partial/staged</strong>: turns them on only on the <strong>floor of alarm, the floor above, and the floor below</strong>.</li>
  <li>After activation, the system must be <strong>reset manually</strong> at the control panel <strong>after FDNY personnel deem the area safe</strong>. When on the premises, the S-95 must investigate. The system must stay in operating condition at all times.</li>
</ul>

<h2>Building fire protection features activated by the fire alarm</h2>
<ul>
  <li><strong>Smoke dampers</strong> open and close as needed to provide fresh air or stop the passage of smoke.</li>
  <li><strong>Fire dampers</strong> close when the temperature rises, and stay shut to stop fire passing through a barrier.</li>
  <li><strong>Elevator recall</strong> sends cars to a designated landing floor.</li>
  <li><strong>Door release</strong> uses a relay to release door holders, so doors close and form a smoke barrier.</li>
</ul>

<h2>Communication systems (§9)</h2>
<ul>
  <li><strong>One-way</strong> (public announcement): a <strong>microphone at the FACP</strong> and speakers in occupied areas.</li>
  <li><strong>Two-way</strong>: <strong>warden phones</strong> at several locations, usually <strong>near exit stairways</strong>, plus one <strong>at the FACP</strong>. Portable two-way radios may also be used.</li>
  <li>The certificate holder must make sure all communication units work.</li>
</ul>

<h2>Central station transmitter (§9)</h2>
<ul>
  <li>Sends alarm signals through the FDNY-approved central station to the FDNY's <strong>Bureau of Fire Communications</strong>.</li>
  <li>Must have a <strong>primary and a secondary means of communication</strong>.</li>
  <li>The certificate holder makes sure it is operable at all times. Report any malfunction <strong>to the central station company</strong> and <strong>record it in the log book</strong>. The <strong>central station company arranges repairs</strong> as soon as possible.</li>
  <li>The central station's <strong>phone number and the account number</strong> must be posted on the <strong>FACP and the central station transmitter</strong> (§10.5).</li>
</ul>

<h2>Sprinkler system work (§7)</h2>
<p>Installation, alteration, testing, repair and maintenance of sprinklers needs a person with <strong>two licenses</strong>: a <strong>Master Fire Suppression Piping Contractor</strong> license (NYC Department of Buildings) and a <strong>Certificate of Fitness for Citywide Sprinkler System (S-12/S-15)</strong> (FDNY).</p>
`,

itm: `
<h1>Inspections, Tests &amp; Who Does What (Booklet §2, §10)</h1>

<h2>Who may do what</h2>
<div class="table-wrap"><table>
<tr><th>Duty</th><th>S-95</th><th>S-78/F-78</th><th>S-97/S-98</th></tr>
<tr><td>Visual inspection of smoke detectors</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Visual inspection of other fire alarm components</td><td>Yes</td><td><strong>No</strong></td><td>Yes</td></tr>
<tr><td>Smoke detector inspection, testing and cleaning</td><td><strong>No</strong></td><td>Yes</td><td>Yes</td></tr>
<tr><td>Smoke detector maintenance</td><td><strong>No</strong></td><td><strong>No</strong></td><td>Yes</td></tr>
<tr><td>Program, service, clean, test, repair or replace low-voltage fire alarm components</td><td><strong>No</strong></td><td><strong>No</strong></td><td>Yes</td></tr>
</table></div>
<ul>
  <li>S-97 and S-98 holders may do S-78/F-78 work, but <strong>not the reverse</strong>.</li>
  <li><strong>Only S-97 or S-98 holders</strong> may service and test fire alarm systems.</li>
  <li>The S-95 <strong>may not clean smoke detectors</strong>.</li>
  <li>The FDNY publishes a monthly list of approved smoke detector maintenance companies.</li>
</ul>

<h2>Visual inspection frequencies (§10, §10.1)</h2>
<div class="table-wrap"><table>
<tr><th>What</th><th>How often</th></tr>
<tr><td>Visual inspection of fire alarm devices for abnormal conditions (FDNY recommendation)</td><td><strong>Daily</strong></td></tr>
<tr><td>Visual inspection of an <strong>UNMONITORED</strong> fire alarm system (by S-95, F-89, F-80, F-53 or S-98)</td><td><strong>Weekly</strong> at a minimum</td></tr>
<tr><td>Visual inspection of a <strong>MONITORED</strong> fire alarm system (by S-95, F-89, F-80, F-53 or S-98)</td><td><strong>Annually</strong></td></tr>
<tr><td>System not connected to a central station (NFPA 72 Table 14.4.3.2): visual inspection of initiating devices</td><td><strong>Semi-annually</strong> (minimum)</td></tr>
<tr><td>…and testing of those devices</td><td><strong>Annually</strong></td></tr>
<tr><td>Manual pull stations: visual inspection (FDNY recommendation)</td><td><strong>Monthly</strong>, where practical</td></tr>
</table></div>
<p>The purpose of visual inspection is to <strong>find defective components</strong>. If an impairment is found, fire guard coverage may be required (see F-01).</p>

<h2>Smoke detector cleaning and testing (§10.4)</h2>
<div class="table-wrap"><table>
<tr><th>Requirement</th><th>Conventional detectors</th><th>Analog (intelligent) detectors</th></tr>
<tr><td>Cleaning</td><td>At least once every <strong>6 months</strong></td><td>Within <strong>1 week</strong> of an indication that cleaning is needed</td></tr>
<tr><td>Smoke entry test</td><td colspan="2">At least <strong>once a year</strong></td></tr>
<tr><td>Sensitivity test</td><td>At least <strong>once a year</strong></td><td>Within <strong>1 week</strong> of an indication that testing is needed</td></tr>
<tr><td>Performed by</td><td colspan="2"><strong>S-78, S-97 or S-98</strong> holder</td></tr>
</table></div>
<p>A detector that doesn't meet the manufacturer's specifications or NFPA 72 must be <strong>re-calibrated, repaired or replaced</strong>.</p>

<h2>Recording</h2>
<ul>
  <li>Every test needs a log book entry. The entry must be made by <strong>the person who physically did the test or visual inspection</strong>.</li>
  <li><strong>S-95, F-53, F-89/T-89 and F-80</strong> holders are authorized to maintain the log books.</li>
  <li>Defective pull stations must be <strong>replaced immediately</strong> by qualified personnel. Manual stations may also be used to <strong>conduct fire drills</strong>.</li>
</ul>
`,

records: `
<h1>The Alarm Log Book (Booklet §10.2)</h1>
<p>The S-95 is responsible for all log book entries required by <strong>Fire Rule 907-01</strong>. An S-97/S-98 may make entries when they service the system, but the <strong>S-95 supervises</strong> the entries and the upkeep of the book.
<strong>Every entry must include the name and certificate number</strong> of the person who made it.</p>

<h2>Location</h2>
<p>The log book stays <strong>on the premises, at the building's main FACP</strong>. If there is no secure place at the FACP, it may be locked up elsewhere <strong>during non-business hours</strong>, as long as it is available to FDNY representatives responding to an alarm.</p>

<h2>Format</h2>
<ul>
  <li>A <strong>bound book (not spiral bound)</strong> with <strong>consecutively numbered, lined pages</strong>.</li>
  <li>The cover says <strong>"ALARM LOG BOOK"</strong>, with the building's name and address.</li>
  <li>All entries are made <strong>in ink and dated</strong>, in <strong>chronological order</strong>.</li>
  <li>A <strong>separate log book for each calendar year</strong>.</li>
  <li>Log books are kept for <strong>3 years from the date of the last entry</strong>.</li>
  <li>The <strong>FSP (fire safety and evacuation plan) log book is different</strong>. It may be bound with the alarm log book, but must be labeled and divided.</li>
</ul>

<h2>Front of the book</h2>
<ul>
  <li>Building address</li>
  <li>FDNY approval date of the fire alarm system, and the system type and manufacturer</li>
  <li>Central station: <strong>account number, company name, telephone number, supervisor's name</strong></li>
  <li>Fire alarm maintenance contractor: company name, telephone number, supervisor's name</li>
</ul>

<h2>The 4 required sections</h2>
<p>Each section needs enough pages for at least <strong>one year</strong>.</p>
<div class="table-wrap"><table>
<tr><th>Section</th><th>What is recorded</th></tr>
<tr><td><strong>(A) Daily entries</strong></td><td>Certificate holder's name, certificate number (and the FLSD on duty, if any), <strong>time started and time relieved</strong> for each tour of duty, plus any action taken on defective equipment or abnormal conditions.</td></tr>
<tr><td><strong>(B) System off-line entries</strong></td><td>Date and time off-line, <strong>reason</strong>, central station name and phone number (and the name and certificate number of the person notified there, or other proof of notification acceptable to the FDNY), and the <strong>date and time restored</strong>.</td></tr>
<tr><td><strong>(C) Activated alarm entries</strong></td><td>Date and time activated, <strong>location and detector type</strong> (e.g. "smoke detector, 27th floor, elevator lobby"), <strong>probable cause</strong>, and the <strong>FDNY unit and officer</strong> who responded. Also manual station testing done by an S-97/S-98.</td></tr>
<tr><td><strong>(D) Notification entries</strong></td><td>Date and time of any notification to <strong>occupants</strong> about a non-functioning or improperly functioning alarm system.</td></tr>
</table></div>

<div class="callout key"><strong>Remember the 4 sections:</strong> Daily · Off-line · Activated alarms · Notifications. <strong>Retention:</strong> 3 years from the last entry. <strong>Format:</strong> bound (not spiral), numbered pages, ink, one book per calendar year.</div>
`,

oos: `
<h1>Off-Line &amp; Out-of-Service (Booklet §10.6–10.7)</h1>

<h2>Taking the system off-line</h2>
<ul>
  <li>Any time the system will be activated during a <strong>test, inspection or fire drill</strong>, you <strong>must</strong> take it <strong>off-line by notifying the FDNY-approved central station beforehand</strong>. This prevents an unnecessary FDNY dispatch.</li>
  <li>Taking the system off-line is <strong>not necessary for speaker audibility tests</strong>.</li>
  <li>Log it in section (B): date and time off-line, reason, central station name and phone number (or other proof of notification), and date and time restored.</li>
</ul>

<h2>Out-of-service protocols</h2>
<ul>
  <li>An out-of-service system is <strong>not fully functional</strong>, or is impaired or not in good working order.</li>
  <li>The <strong>owner or owner's representative must be notified</strong> when the system or part of it is impaired, and again when the impairment ends.</li>
  <li>If a defect is <strong>not corrected at the end of an inspection, test or maintenance visit</strong>, the owner must be told about the impairment <strong>immediately</strong>.</li>
  <li>The certificate holder or the impairment coordinator must report an out-of-service fire alarm system to the FDNY <strong>promptly</strong>.</li>
</ul>

<h2>Requirements while out of service</h2>
<ul>
  <li>The <strong>FDNY must be notified immediately</strong>.</li>
  <li>Unless the FDNY directs otherwise, <strong>either the building is evacuated or a fire watch is kept</strong> by one or more people with a <strong>Certificate of Fitness for Fire Guard</strong> (F-01). Any other actions the FDNY directs must also be taken until the system is back in service.</li>
  <li>Fire guards must have <strong>at least one approved way to notify the FDNY</strong>. Their <strong>only duty</strong> is <strong>constant patrols</strong> of the premises to watch for fire.</li>
</ul>

<h2>Out-of-service signage</h2>
<p>For a defective device, the certificate holder must <strong>notify their supervisor</strong> and <strong>put a placard over the defective box</strong> saying it is out of service. (The sample log shows this as a section (D) notification entry.)</p>

<h2>Impairment coordinator</h2>
<ul>
  <li>The person responsible for making sure <strong>proper notification and safety precautions</strong> are taken when a fire protection system is out of service.</li>
  <li>The <strong>owner, managing agent or tenant</strong> designates them. The role naturally goes to the certificate holder (F-89/T-89, S-95, etc.) when present. When no certificate holder is on site, the owner names someone else.</li>
  <li><strong>If no one has been designated, the owner is the impairment coordinator.</strong></li>
  <li>Responsibilities: <strong>notify the FDNY immediately</strong>, post the fire guard, notify tenants, and post "out-of-service" signs.</li>
</ul>

<h2>FDNY borough notification numbers (non-emergency)</h2>
<div class="table-wrap"><table>
<tr><th>Borough</th><th>Number</th></tr>
<tr><td>Manhattan</td><td>(212) 570-4300</td></tr>
<tr><td>Brooklyn</td><td>(718) 965-8300</td></tr>
<tr><td>Queens</td><td>(718) 476-6200</td></tr>
<tr><td>Bronx</td><td>(718) 430-0200</td></tr>
<tr><td>Staten Island</td><td>(718) 494-4296</td></tr>
</table></div>

<h2>The notification must include</h2>
<ol>
  <li>The name and phone number of the owner or impairment coordinator making the call</li>
  <li>The building address and type of occupancy</li>
  <li>The type of fire protection system that is out of service</li>
  <li>A brief description of the condition (planned or unplanned)</li>
  <li>The floors or areas affected</li>
  <li>The <strong>estimated time until the system is operational</strong></li>
  <li>Whether the other fire protection systems are in good working order</li>
  <li>The <strong>name and certificate number</strong> of the holder responsible for the system</li>
</ol>
`,

unnecessary: `
<h1>Unnecessary &amp; Unwarranted Alarms (Booklet §6.8)</h1>

<h2>Prevention</h2>
<ul>
  <li>Dust from cutting wood, sheetrock or sanding can trigger false alarms. So can detectors that haven't been cleaned and maintained.</li>
  <li>Protect detectors from airborne particles at all times, using <strong>listed covers</strong> during dusty work only, and remove them when work stops.</li>
  <li>Take the system <strong>off-line with the central station</strong> before tests, inspections and drills.</li>
  <li><strong>Alarm verification</strong> reduces unwarranted alarms.</li>
</ul>

<h2>The rules (Fire Rule 907-01)</h2>
<ol>
  <li>In any building with a fire alarm system or smoke detector that transmits automatically to the FDNY or a central station, the <strong>owner (including any lessee)</strong> is responsible for preventing unnecessary or unwarranted alarms and is <strong>liable for any violation</strong>.</li>
  <li>It is <strong>unlawful to transmit 2 or more</strong> unnecessary or unwarranted alarms in <strong>any 3-month period</strong>.</li>
  <li>When the <strong>second</strong> such alarm in a 3-month period is transmitted, the owner gets a <strong>violation</strong>. The owner can then fix the cause and <strong>certify correction</strong> (Fire Rule 109-01(c)) <strong>without an OATH hearing and without a penalty</strong>.</li>
  <li>After a violation, the owner is liable for <strong>any further</strong> unnecessary or unwarranted alarm within <strong>6 months</strong>. Each further violation is a <strong>repeat offense</strong> (Admin. Code §15-229(a)). It is <strong>not eligible for certification of correction</strong>, so it means a hearing and a penalty, and it <strong>extends liability another 6 months</strong>.</li>
  <li>An owner with <strong>no</strong> unnecessary or unwarranted alarm for <strong>6 months</strong> after the last violation returns to <strong>compliant status</strong> (back to the 2-in-3-months threshold).</li>
  <li>The FDNY may use other enforcement for alarms that meet or exceed the threshold.</li>
  <li>A <strong>malicious false alarm from a manual pull station is NOT counted</strong> as an unnecessary alarm.</li>
</ol>

<div class="callout key"><strong>2 in 3 months → violation (correctable, no penalty). Then any one within 6 months → repeat offense (hearing + penalty, +6 months). 6 clean months → compliant again. Malicious pulls don't count.</strong></div>
`,

pfe: `
<h1>Portable Fire Extinguishers (Booklet §11)</h1>

<h2>Where they are required</h2>
<ul>
  <li>In all Group <strong>A, B, E, F, H, I, M, R-1, R-2</strong> (adult homes and enriched housing), and <strong>S</strong> occupancies.</li>
  <li><strong>Within 30 feet of commercial cooking equipment.</strong></li>
  <li>Where flammable or combustible liquids are made, stored, handled or used in quantities that need a permit.</li>
  <li>On <strong>each floor</strong> of structures under construction, alteration or demolition (except detached Group R-3).</li>
</ul>

<h2>Classes of fire (NFPA 10)</h2>
<div class="table-wrap"><table>
<tr><th>Class</th><th>Fuel</th></tr>
<tr><td><strong>A</strong></td><td>Ordinary combustibles: wood, cloth, paper, rubber, many plastics</td></tr>
<tr><td><strong>B</strong></td><td>Flammable and combustible liquids, greases, tars, oils, oil-based paints, solvents, lacquers, alcohols, <strong>flammable gases</strong></td></tr>
<tr><td><strong>C</strong></td><td><strong>Energized electrical</strong> equipment</td></tr>
<tr><td><strong>D</strong></td><td>Combustible <strong>metals</strong>: magnesium, titanium, zirconium, sodium, potassium</td></tr>
<tr><td><strong>K</strong></td><td><strong>Cooking</strong> media: vegetable or animal oils and fats</td></tr>
</table></div>

<h2>PFE tags (§11.1)</h2>
<ul>
  <li>Every installed extinguisher must have an <strong>FDNY standard PFE tag</strong>. Tag colors change every few years. The FDNY only recognizes the new tags and issues violations for improper ones.</li>
  <li>To verify a tag: <strong>(1) Hologram</strong>: a real silver hologram strip is <strong>3 inches long by ¼ inch wide</strong> and <strong>changes color</strong> as it moves in the light. <strong>(2) QR code</strong>: links to the current list of FDNY-approved extinguisher companies.</li>
  <li>If a tag can't be verified, contact your supervisor. If you suspect a counterfeit, email the FDNY at <strong>Tags.Decal@fdny.nyc.gov</strong>.</li>
</ul>

<h2>Inspections (§11.2)</h2>
<ul>
  <li><strong>Monthly "quick check"</strong> by a person the business owner selects. Check that the extinguisher is (1) <strong>fully charged</strong>; (2) in its <strong>designated place</strong>; (3) <strong>not actuated or tampered with</strong>; and (4) has <strong>no obvious damage</strong> that would prevent it from working.</li>
  <li>Record the <strong>date and the inspector's name or initials</strong> on the <strong>back of the PFE tag</strong> (or by an approved permanent electronic method).</li>
  <li><strong>Annually</strong>: inspected by a <strong>W-96</strong> holder from an FDNY-approved company, who <strong>replaces the PFE tag</strong> and records the inspection on the new tag.</li>
</ul>
`,

liion: `
<h1>Lithium-Ion Battery Safety (Booklet §12)</h1>
<p>Lithium-ion batteries power e-bikes, scooters, cars, laptops, phones and many other devices. Their fires have caused deaths and serious damage across the city.</p>

<h2>Stop using or charging the battery and call 911 if you notice</h2>
<p>Fire or smoke · overheating · a change in color or shape · odd noises · leaking · a strange smell</p>

<div class="grid grid-2">
<div><h3>ALWAYS</h3><ul>
  <li>Use devices certified by a <strong>Nationally Recognized Testing Laboratory (NRTL)</strong>.</li>
  <li>Follow the manufacturer's instructions for charging, storage, and the correct battery, cord and adapter.</li>
  <li><strong>Plug directly into a wall outlet</strong> for charging.</li>
  <li>Keep batteries at room temperature, away from heat and anything flammable.</li>
  <li>Keep exit paths clear.</li>
  <li>Bring batteries to a <strong>NYC battery recycling center</strong> (nyc.gov/batteries).</li>
</ul></div>
<div><h3>NEVER</h3><ul>
  <li>Use aftermarket batteries or chargers, or damaged or altered batteries.</li>
  <li>Plug into a <strong>power strip</strong> or overload an outlet.</li>
  <li>Overcharge, or leave a battery <strong>charging overnight</strong>.</li>
  <li>Charge under a pillow, on a bed, or near a couch.</li>
  <li>Leave e-bikes or e-scooters <strong>unattended while charging</strong>.</li>
  <li>Block your way in or out of a room with e-bikes, scooters or wheelchairs.</li>
  <li>Put batteries in the <strong>trash or recycling bin</strong>. This is <strong>illegal</strong>.</li>
</ul></div>
</div>

<h2>Charging rules</h2>
<ul>
  <li>Batteries don't need a full charge. A <strong>partial charge</strong> is best.</li>
  <li>Charging <strong>more than 5</strong> personal mobility devices (or their removable batteries) must be done in a <strong>dedicated room with ventilation and a self-closing door</strong>.</li>
  <li>Separation between charging batteries: total capacity of <strong>20 kWh → 2 feet</strong>; total capacity <strong>up to 50 kWh → 3 feet</strong>.</li>
  <li>Use only a <strong>compatible (OEM) charger</strong>. It works with the battery management system (BMS). A wrong combination may defeat the 100% cutoff that prevents overcharging.</li>
  <li>Check with the manufacturer, an authorized repair shop, or a testing lab such as UL before using replacement parts.</li>
</ul>

<h2>Fires</h2>
<ul>
  <li><strong>In a fire: leave and CLOSE THE DOOR. Call 911 once you are safe.</strong></li>
  <li><strong>Fire extinguishers do not work</strong> on lithium-ion battery fires. Water may not stop a battery from burning and spreading. Cells can explode and spread to other batteries and devices.</li>
  <li><strong>Re-ignition is common</strong>, minutes, hours or even days after the visible fire is out. Batteries can enter an uncontrollable <strong>self-heating state</strong> (thermal runaway).</li>
</ul>
`
};
