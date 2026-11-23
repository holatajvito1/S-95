/*
 * Panel simulator scenarios. Each step is a decision; options may be tied to a panel key
 * ("ack" | "silence" | "reset" | "drill" | "fan"), so pressing that key on the simulated FACP
 * picks that option. `after` updates the panel once the correct option is chosen.
 * All procedures follow the FDNY S-95 booklet (rev. Oct 2026).
 */
window.S95 = window.S95 || {};
S95.scenarios = [
{
  id: "sc-smoke", title: "Smoke Alarm, 3rd Floor Pantry", tag: "Fire alarm",
  brief: "2:47 PM. You are the on-duty S-95 in a monitored 8-story office building. The panel suddenly goes into alarm and horns sound throughout the building.",
  initial: { lcd: ["FIRE ALARM  001/001", "SMOKE DET  L1D014", "3RD FL PANTRY", "14:47:12"], leds: { ac: "on", alarm: "flash" }, buzzer: true },
  steps: [
    { prompt: "What should you do first?",
      options: [
        { text: "Report to the FACP, read the type and location of the alarm, and press ACKNOWLEDGE", ok: true, panel: "ack",
          fb: "Correct. The certificate holder should report to the FACP when an alarm activates (§4.2). ACK confirms the event has been seen." },
        { text: "Press SYSTEM RESET to stop the noise", ok: false, panel: "reset",
          fb: "Never reset before FDNY personnel verify the condition (§4.4). The detector may still be in alarm, and resetting destroys information the FDNY needs." },
        { text: "Run to the 3rd floor right away without looking at the panel", ok: false,
          fb: "Start at the FACP. It tells you exactly which device is in alarm and where." }
      ],
      after: { leds: { alarm: "on" }, buzzer: false, log: "14:47 ACK at FACP – smoke det. L1D014, 3rd fl pantry" } },
    { prompt: "The building is monitored by an FDNY-approved central station. What happens with the alarm signal?",
      options: [
        { text: "The central station retransmits it to the FDNY immediately, then notifies the premises", ok: true,
          fb: "Correct. Fire alarm signals are processed before all other signals and retransmitted immediately, with no exceptions (§3.2.1). You follow the building's fire safety plan while the FDNY responds." },
        { text: "The central station waits for you to call and confirm a fire", ok: false,
          fb: "No. Alarm signals go to the FDNY immediately on receipt. The premises are notified after." },
        { text: "Nothing is sent, because the alarm was acknowledged", ok: false,
          fb: "ACK and SILENCE do not stop transmission to the central station (§4.3)." }
      ] },
    { prompt: "A coworker says it's just someone burning popcorn and asks you to silence the horns. What do you do?",
      options: [
        { text: "Keep the audible/visual devices on until the fire alarm condition is verified by FDNY personnel", ok: true,
          fb: "Correct. DO NOT SILENCE BUILDING AUDIBLE/VISUAL DEVICES OR RESET THE PANEL UNTIL THE CONDITION IS VERIFIED BY FDNY PERSONNEL (§4.4)." },
        { text: "Press ALARM SILENCE, since it's probably the microwave", ok: false, panel: "silence",
          fb: "You can't assume. Every alarm is real until the FDNY verifies it." },
        { text: "Call the central station and cancel the FDNY response", ok: false,
          fb: "Every fire alarm signal is retransmitted to the FDNY. There is no cancel option for the building." }
      ] },
    { prompt: "Engine 211 arrives. The officer finds burned popcorn in the pantry microwave, verifies there is no fire, and tells you to reset the system. What now?",
      options: [
        { text: "Press SYSTEM RESET at the FACP (the smoke has cleared)", ok: true, panel: "reset",
          fb: "Correct. Reset at the FACP at the direction of the FDNY. The detector resets because the smoke has cleared (§4.5)." },
        { text: "Remove the smoke detector so it won't happen again", ok: false,
          fb: "Never remove or disable a detector. That would create an impairment." },
        { text: "Leave the system in alarm until tomorrow", ok: false,
          fb: "The FDNY has directed a reset. The system must be returned to operating condition (§8.3)." }
      ],
      after: { lcd: ["SYSTEM NORMAL", "", "", "14:58:40"], leds: { alarm: "off" }, buzzer: false, log: "14:58 System reset at FDNY direction" } },
    { prompt: "The panel is normal, but the air-handling units are still off. Why?",
      options: [
        { text: "After a fire alarm reset, fans usually must be restarted with a separate 'fan restart' button or key switch", ok: true, panel: "fan",
          fb: "Correct (§4.4). Press FAN RESTART to bring the HVAC back." },
        { text: "The system is broken, so call the FDNY again", ok: false, fb: "This is normal behavior after a reset." },
        { text: "Fans restart automatically after 24 hours", ok: false, fb: "They usually need a separate manual restart." }
      ],
      after: { log: "14:59 Fans restarted" } },
    { prompt: "Which log book section gets this entry, and what goes in it?",
      options: [
        { text: "(C) Activated alarm entries: date/time, location and detector type, probable cause, and the FDNY unit and officer", ok: true,
          fb: "Correct. Example: 14:47, smoke detector, 3rd floor pantry, burned popcorn in microwave, Engine 211 and the officer's name, plus your name and certificate number (§10.2)." },
        { text: "(A) Daily entries: just write 'false alarm'", ok: false, fb: "Activated alarms go in section (C), with the required details." },
        { text: "No entry is needed because it wasn't a real fire", ok: false, fb: "ALL abnormal conditions are investigated and logged." }
      ] }
  ]
},
{
  id: "sc-tamper", title: "Supervisory: Sprinkler Valve Tamper", tag: "Supervisory",
  brief: "Monday 9:10 AM. A plumbing contractor is working in the cellar. The panel beeps and the amber SUPERVISORY light turns on.",
  initial: { lcd: ["SUPERVISORY 001/001", "VALVE TAMPER L2M031", "CELLAR SPRINKLER CV", "09:10:02"], leds: { ac: "on", sup: "flash" }, buzzer: true },
  steps: [
    { prompt: "What does this signal tell you?",
      options: [
        { text: "A monitored system, here a sprinkler control valve, is compromised or in an abnormal state", ok: true, panel: "ack",
          fb: "Correct. Valve supervisory switches generate supervisory signals (§3.2.2). Press ACK and investigate." },
        { text: "There is a fire in the cellar", ok: false, fb: "That would be a fire alarm signal. A tamper switch is supervisory." },
        { text: "The panel battery is low", ok: false, fb: "That would be a trouble signal." }
      ],
      after: { leds: { sup: "on" }, buzzer: false, log: "09:10 Supervisory ACK – valve tamper cellar" } },
    { prompt: "Will the FDNY respond to this supervisory signal?",
      options: [
        { text: "No. The FDNY does not respond to supervisory signals; the signal still goes to the central station", ok: true,
          fb: "Correct (§3.1). It's your job to investigate and get it corrected." },
        { text: "Yes, with a full assignment", ok: false, fb: "The FDNY does not respond to supervisory signals." },
        { text: "Only if you press SILENCE", ok: false, fb: "Silence has nothing to do with it." }
      ] },
    { prompt: "In the cellar, you find the contractor has partly closed the sprinkler control valve. What is the situation?",
      options: [
        { text: "The sprinkler system is out of service. The FDNY must be notified immediately, and a fire guard or evacuation is needed unless the FDNY directs otherwise", ok: true,
          fb: "Correct (§10.7). A required fire protection system that isn't fully functional is out of service." },
        { text: "No problem, as long as the valve is reopened by tonight", ok: false, fb: "An impaired system needs immediate FDNY notification." },
        { text: "Tape over the tamper switch so the panel stops beeping", ok: false, fb: "Never defeat a supervisory device." }
      ] },
    { prompt: "You call the FDNY borough number. Which item is NOT required in the notification?",
      options: [
        { text: "The name of the plumbing company's accountant", ok: true,
          fb: "Correct. Required: caller name and phone; address and occupancy; system type; condition (planned or unplanned); affected floors or areas; estimated restore time; status of other systems; responsible certificate holder's name and number." },
        { text: "The estimated time until the system is operational", ok: false, fb: "That one is required." },
        { text: "Whether the other fire protection systems are in good working order", ok: false, fb: "That one is required." }
      ] },
    { prompt: "Who may work on the sprinkler valve and piping?",
      options: [
        { text: "A person with a DOB Master Fire Suppression Piping Contractor license AND an FDNY S-12/S-15 Certificate of Fitness", ok: true,
          fb: "Correct (§7)." },
        { text: "The S-95 holder", ok: false, fb: "The S-95 supervises the fire alarm system. It isn't a sprinkler license." },
        { text: "Any plumber", ok: false, fb: "Two specific credentials are required." }
      ] },
    { prompt: "The valve is fully reopened by the qualified contractor and the panel returns to normal by itself. What's left?",
      options: [
        { text: "Notify the FDNY and the owner that the impairment is over, release the fire guard, and log everything", ok: true,
          fb: "Correct. The owner must be told when an impairment ends, too. Most supervisory conditions clear automatically (§4.4)." },
        { text: "Nothing; the panel cleared itself", ok: false, fb: "Notifications and log entries are still required." },
        { text: "Press RESET five times to be sure", ok: false, fb: "Unneeded. Supervisory conditions clear when conditions return to normal." }
      ],
      after: { lcd: ["SYSTEM NORMAL", "", "", "11:32:15"], leds: { sup: "off" }, log: "11:32 Valve restored, FDNY + owner notified" } }
  ]
},
{
  id: "sc-trouble", title: "Trouble: Ground Fault", tag: "Trouble",
  brief: "During your daily visual inspection at 7:30 AM, you notice the panel shows a trouble condition.",
  initial: { lcd: ["TROUBLE  001/001", "GROUND FAULT", "LOOP 2", "07:30:44"], leds: { ac: "on", trouble: "flash" }, buzzer: true },
  steps: [
    { prompt: "What does a trouble signal indicate?",
      options: [
        { text: "The alarm system, transmitter or communications path is wholly or partially out of service", ok: true, panel: "ack",
          fb: "Correct (§3.2.3). Ground faults, open or short circuits, AC failure, battery and phone line failures are all troubles. Press ACK." },
        { text: "A fire is in progress on Loop 2", ok: false, fb: "That would be a fire alarm." },
        { text: "A sprinkler valve has closed", ok: false, fb: "That would be supervisory." }
      ],
      after: { leds: { trouble: "on" }, buzzer: false } },
    { prompt: "Who corrects the ground fault?",
      options: [
        { text: "An approved fire alarm company. Only S-97/S-98 holders may service and repair the system", ok: true,
          fb: "Correct (§1.1, §10). The S-95 calls the maintenance company. They don't repair it themselves." },
        { text: "The S-95, using a screwdriver", ok: false, fb: "S-95 holders may not service or repair fire alarm components." },
        { text: "The FDNY", ok: false, fb: "The FDNY does not repair building systems." }
      ] },
    { prompt: "The central station also received the trouble signal. What is its job?",
      options: [
        { text: "Contact the subscriber's designated persons immediately; routine handling should take no more than 4 minutes", ok: true,
          fb: "Correct (§3.2.3)." },
        { text: "Dispatch the FDNY", ok: false, fb: "Trouble signals go to the designated persons, not the FDNY." },
        { text: "Ignore troubles until the next business day", ok: false, fb: "Trouble signals are handled immediately." }
      ] },
    { prompt: "Where do you record what you found and what you did?",
      options: [
        { text: "(A) Daily entries: your name, certificate number, times, and the action taken on the abnormal condition", ok: true,
          fb: "Correct. Daily entries include the actions taken when defective equipment or abnormal conditions are found." },
        { text: "On a sticky note on the panel", ok: false, fb: "Entries go in the bound alarm log book, in ink." },
        { text: "Nowhere until it's fixed", ok: false, fb: "ALL abnormal conditions are noted in the log book." }
      ],
      after: { log: "07:35 Ground fault loop 2 – called ABC Fire Alarm (S-98)" } },
    { prompt: "The technician fixes the ground fault. The trouble light goes out by itself. Is that normal?",
      options: [
        { text: "Yes. Most trouble and supervisory conditions clear automatically when conditions return to normal", ok: true,
          fb: "Correct (§4.4)." },
        { text: "No. Only the FDNY can clear a trouble", ok: false, fb: "Troubles usually self-clear once repaired." },
        { text: "No. The panel must be replaced", ok: false, fb: "This is normal behavior." }
      ],
      after: { lcd: ["SYSTEM NORMAL", "", "", "10:05:00"], leds: { trouble: "off" } } }
  ]
},
{
  id: "sc-test", title: "Planned Pull Station Test", tag: "Off-line",
  brief: "ABC Fire Alarm Co. (an S-98 technician) is here at 7:30 AM to test all pull stations on the 5th floor.",
  initial: { lcd: ["SYSTEM NORMAL", "", "", "07:28:00"], leds: { ac: "on" }, buzzer: false },
  steps: [
    { prompt: "Before the technician pulls the first station, what must happen?",
      options: [
        { text: "Take the system off-line by notifying the FDNY-approved central station beforehand", ok: true,
          fb: "Correct. This is mandatory for any test, inspection or fire drill that activates the alarm, so the FDNY isn't dispatched unnecessarily (§10.6)." },
        { text: "Call 911 and tell them about the test", ok: false, fb: "The central station is the one you notify." },
        { text: "Disconnect the panel's AC power", ok: false, fb: "That causes a trouble condition and leaves the building unprotected." }
      ],
      after: { lcd: ["SYSTEM NORMAL", "CS: ON TEST", "", "07:30:00"], log: "07:30 Off-line w/ central station (OKK), operator Jane Smith #99991111" } },
    { prompt: "What must you write in log section (B), System off-line entries?",
      options: [
        { text: "Date and time off-line, the reason, central station name and phone number (and the person notified), and the date and time restored", ok: true,
          fb: "Correct (§10.2(3)(B))." },
        { text: "Only the technician's name", ok: false, fb: "Section (B) has specific required columns." },
        { text: "Nothing; the central station keeps the record", ok: false, fb: "The building log book is required." }
      ] },
    { prompt: "The technician pulls station 5-1. The panel goes into alarm. You may use DRILL/ACK while testing. What do you do?",
      options: [
        { text: "ACK the alarm; the technician resets the station, then the FACP is reset", ok: true, panel: "ack",
          fb: "Correct. The pull station is reset first, then the FACP. The system is on test, so no FDNY dispatch." },
        { text: "Reset only at the pull station", ok: false, fb: "The system can't be reset at the pull station. It's reset at the FACP after the station is returned to normal." },
        { text: "Call the FDNY to verify", ok: false, fb: "The system is on test with the central station." }
      ],
      before: { lcd: ["FIRE ALARM  001/001", "PULL STA  L1M051", "5TH FL STAIR A", "07:41:10"], leds: { alarm: "flash" }, buzzer: true },
      after: { lcd: ["SYSTEM NORMAL", "CS: ON TEST", "", "07:44:00"], leds: { alarm: "off" }, buzzer: false } },
    { prompt: "Station 5-3 in the elevator lobby fails the test. The technician can't replace it until tomorrow. What do you do?",
      options: [
        { text: "Notify your supervisor, put an 'out of service' placard over the box, notify the owner, and log a section (D) notification entry", ok: true,
          fb: "Correct (§10.7). Defective devices must be replaced by qualified personnel as soon as possible." },
        { text: "Remove the pull station from the wall", ok: false, fb: "Placard it. Never remove it." },
        { text: "Leave it. One pull station doesn't matter", ok: false, fb: "A non-functioning device is an impairment." }
      ],
      after: { log: "08:30 Pull sta 5-3 defective – placard posted, supervisor + owner notified" } },
    { prompt: "Testing is done. What's the final step with the central station?",
      options: [
        { text: "Call the central station to put the system back in service, and log the date and time restored", ok: true,
          fb: "Correct. A system left on test isn't being monitored." },
        { text: "Nothing; it goes back automatically", ok: false, fb: "You must restore it and record the time." },
        { text: "Leave it on test until the defective station is fixed", ok: false, fb: "The rest of the system must be monitored." }
      ],
      after: { lcd: ["SYSTEM NORMAL", "", "", "07:45:30"], log: "07:45 Restored with central station" } }
  ]
},
{
  id: "sc-waterflow", title: "Waterflow Alarm at Night", tag: "Fire alarm",
  brief: "11:20 PM. The panel shows a waterflow alarm on the 6th floor. Horns are sounding and the elevators have recalled.",
  initial: { lcd: ["FIRE ALARM  001/001", "WATERFLOW  L2M006", "6TH FL RISER", "23:20:05"], leds: { ac: "on", alarm: "flash" }, buzzer: true },
  steps: [
    { prompt: "What does a waterflow signal mean?",
      options: [
        { text: "Water is flowing in the sprinkler system, which is a fire alarm signal. A sprinkler may be operating over a fire", ok: true, panel: "ack",
          fb: "Correct (§6.3). Waterflow sounds the alarm, recalls elevators, and sends a fire alarm signal to the central station." },
        { text: "A supervisory signal that the FDNY ignores", ok: false, fb: "Waterflow is a fire alarm signal." },
        { text: "A trouble on the sprinkler wiring", ok: false, fb: "No. Water is actually flowing." }
      ],
      after: { leds: { alarm: "on" }, buzzer: false } },
    { prompt: "Can you silence or reset the system while water is still flowing?",
      options: [
        { text: "No. It can't be reset or silenced until the waterflow has stopped, and only after FDNY verification", ok: true,
          fb: "Correct (§6.3, §4.4)." },
        { text: "Yes. Press RESET right away", ok: false, panel: "reset", fb: "The waterflow device is still active. Another alarm would be generated, and the FDNY hasn't verified it." },
        { text: "Yes. Turn off the sprinkler water yourself to stop the alarm", ok: false, fb: "Never shut off sprinklers. Only the FDNY or a qualified sprinkler contractor operates valves." }
      ] },
    { prompt: "Does the waterflow switch turn the water on or off?",
      options: [
        { text: "No. It only senses flow with a vane or paddle and signals the FACP", ok: true, fb: "Correct (§6.3)." },
        { text: "Yes. It opens the sprinkler heads", ok: false, fb: "Sprinkler heads open from heat. The switch only detects flow." },
        { text: "Yes. It shuts water off when reset", ok: false, fb: "It doesn't control the water." }
      ] },
    { prompt: "The FDNY finds a sprinkler head broken by a mover's ladder. They shut down the zone and later direct a reset after the flow stops. The sprinkler zone stays off until repair. What else applies?",
      options: [
        { text: "That zone is out of service: FDNY notification, fire guard as required, a qualified sprinkler contractor for repairs, and log entries", ok: true,
          fb: "Correct. An impaired sprinkler system triggers the out-of-service protocols (§10.7)." },
        { text: "Nothing; the FDNY handled it", ok: false, fb: "The impairment continues after the FDNY leaves." },
        { text: "Turn the zone back on yourself", ok: false, fb: "Repairs must be done by properly licensed people." }
      ],
      after: { lcd: ["SYSTEM NORMAL", "", "", "00:40:10"], leds: { alarm: "off" }, log: "23:20 Waterflow 6th fl – broken head (ladder); Ladder 120 Lt. Ruiz; zone OOS, fire guard posted" } }
  ]
},
{
  id: "sc-co", title: "Carbon Monoxide Signal", tag: "Supervisory",
  brief: "6:05 AM in a residential building with gas-fired boilers. The panel shows a CO detector activation in the boiler room.",
  initial: { lcd: ["SUPERVISORY 001/001", "CO DETECTOR L1D088", "CELLAR BOILER RM", "06:05:31"], leds: { ac: "on", sup: "flash" }, buzzer: true },
  steps: [
    { prompt: "Why does this building have CO detectors?",
      options: [
        { text: "They are required in any building with fossil-fuel (gas or oil) burning equipment", ok: true, panel: "ack",
          fb: "Correct (§6.4). Press ACK." },
        { text: "They are optional decorations", ok: false, fb: "They are required here." },
        { text: "Only high-rises need them", ok: false, fb: "Any building with fossil-fuel burning equipment needs them." }
      ],
      after: { leds: { sup: "on" }, buzzer: false } },
    { prompt: "You try to reset and the CO signal comes right back. What should you assume?",
      options: [
        { text: "Carbon monoxide is still present. Take life-safety precautions until it is ruled out", ok: true,
          fb: "Correct (§6.4). Keep people out of the area and follow the building's emergency plan." },
        { text: "The detector is broken, so unplug it", ok: false, fb: "Never assume a fault. Assume CO is present." },
        { text: "It's a trouble signal and can wait", ok: false, fb: "CO is a life-safety hazard." }
      ] },
    { prompt: "Who decides when the panel can be reset?",
      options: [
        { text: "The FDNY, after determining CO is at safe levels in the space", ok: true, fb: "Correct (§4.5)." },
        { text: "The boiler technician", ok: false, fb: "The FDNY makes this determination." },
        { text: "The central station", ok: false, fb: "The central station cannot clear a CO condition." }
      ],
      after: { lcd: ["SYSTEM NORMAL", "", "", "07:15:00"], leds: { sup: "off" }, log: "06:05 CO det. boiler rm – FDNY Engine 45 cleared, reset at direction" } }
  ]
}
];
