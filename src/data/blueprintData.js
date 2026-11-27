/**
 * Digital Brain Architecture — Client-Side Sandbox & Blueprint Data
 * 100% synthetic examples. Zero PII, zero emojis, zero runtime tokens.
 */

export const PIPELINE_NODES = [
  {
    id: 'laptop',
    index: 0,
    shortLabel: 'Laptop',
    subLabel: 'Your computer',
    x: 92,
    y: 112,
    latencyMs: 12,
    role: 'where you type the request',
    summary: 'Finds the notes that matter for this request, in plain text files on your own machine, not locked inside any one company\'s app.',
    deepNote:
      'If your laptop breaks, nothing is lost: it is just one window onto the folder. Any text editor or AI app can open the same folder and save small, clear changes straight into it.'
  },
  {
    id: 'drive-bus',
    index: 1,
    shortLabel: 'Shared folder',
    subLabel: 'Copied everywhere',
    x: 274,
    y: 112,
    latencyMs: 140,
    role: 'keeps every device in step',
    summary: 'Copies the notes between your laptop and the cloud computer through one shared folder (for example Google Drive), so both always see the same thing.',
    deepNote:
      'One shared folder means no stray copies drifting apart. Within seconds every machine has the same rules, notes and log.'
  },
  {
    id: 'cloud',
    index: 2,
    shortLabel: 'Cloud',
    subLabel: 'Always switched on',
    x: 456,
    y: 112,
    latencyMs: 280,
    role: 'where the AI does the work',
    summary: 'A computer in a data centre runs the AI app (Antigravity, Claude or Codex), so work carries on even while your laptop sleeps.',
    deepNote:
      'The cloud computer opens the same shared folder and tries the AI apps in order. If the first one reaches its usage limit or goes down, the next one picks up with the same notes, so nothing is forgotten.'
  },
  {
    id: 'telegram',
    index: 3,
    shortLabel: 'Telegram',
    subLabel: 'Your phone',
    x: 638,
    y: 112,
    latencyMs: 95,
    role: 'sends you the result',
    summary: 'Sends a short update to your phone through the Telegram chat app, and carries your one-tap answer back.',
    deepNote:
      'Your phone becomes a simple remote control: short plain messages, progress pings and yes or no buttons, instead of a busy dashboard.'
  },
  {
    id: 'approval-gate',
    index: 4,
    shortLabel: 'Approval Gate',
    subLabel: 'Waits for your OK',
    x: 820,
    y: 112,
    latencyMs: 0,
    role: 'the final safety check',
    summary: 'Lets private notes and lookups through, but holds every email, message or payment to other people until you tap OK.',
    deepNote:
      'Work that runs while you are away is limited to private tasks. Anything that would reach another person is stopped here and cannot happen until you say yes.'
  }
];

export const COMMAND_SCENARIOS = [
  {
    id: 'email',
    label: 'Send a client email',
    category: 'Sends to someone',
    prompt: '"Email Alex at Studio North with the revised timeline and confirm Thursday at 3 PM."',
    preferredHarness: 'Claude',
    needsApproval: true,
    packetTag: 'EMAIL TO SOMEONE',
    draftPreview: {
      to: 'Alex, Studio North (made-up example)',
      subject: 'Updated timeline + Thursday 3 PM check-in',
      body: 'Hi Alex, sharing the updated two-week milestones below. Does Thursday at 3 PM still work to walk through them?'
    },
    hopDetails: {
      laptop: 'Matched rules/writing-tone.md + memory-cards/studio-north.md',
      'drive-bus': 'Copied 2 relevant notes (4.2 KB, about a page of text) to the cloud computer',
      cloud: 'The AI app on duty wrote a short draft reply',
      telegram: 'Sent the draft to your phone with approve and cancel buttons',
      'approval-gate': 'ON HOLD: the email waits until you tap approve'
    },
    outcomeApproved: {
      badge: 'SENT AFTER APPROVAL',
      summary: 'The email went out only after your tap, and a one-line receipt was added to the log folder (execution-trail).',
      detail: 'Delivered to Alex · logged to execution-trail/recent.md'
    },
    outcomeCancelled: {
      badge: 'SAFELY CANCELLED',
      summary: 'Nothing was sent. Draft discarded cleanly and inbox stayed untouched.',
      detail: 'Blocked by owner at Approval Gate'
    }
  },
  {
    id: 'travel',
    label: 'Remember travel preference',
    category: 'Save a note',
    prompt: '"Book window seats on morning flights and aisle seats on flights over four hours."',
    preferredHarness: 'Antigravity',
    needsApproval: false,
    packetTag: 'PRIVATE NOTE',
    hopDetails: {
      laptop: 'Routed to existing memory-cards/travel.md (18 lines)',
      'drive-bus': 'Copied the one changed line (142 bytes) to the cloud computer',
      cloud: 'Checked the note is tidy and updated the notes index',
      telegram: 'Finished quietly: no need to disturb your phone',
      'approval-gate': 'PASSED: a private note, nothing sent to anyone'
    },
    outcomeApproved: {
      badge: 'SAVED EVERYWHERE',
      summary: 'Saved in plain Markdown; every assistant you open tomorrow already knows it.',
      detail: 'Updated memory-cards/travel.md · 1 line logged'
    }
  },
  {
    id: 'schedule',
    label: "Check today's schedule",
    category: 'Quick lookup',
    prompt: '"What is on my calendar today, and where is my cleanest 2-hour deep-work block?"',
    preferredHarness: 'Antigravity',
    needsApproval: false,
    packetTag: 'LOOKUP ONLY',
    hopDetails: {
      laptop: 'Loaded rules/focus-hours.md + read-only calendar query',
      'drive-bus': 'Confirmed the focus-hours note is the latest version',
      cloud: 'Computed open slots and ranked 2:00–4:30 PM top block',
      telegram: 'Returned 3-line plain-text brief in 2 seconds',
      'approval-gate': 'PASSED: only reading, nothing can be changed'
    },
    outcomeApproved: {
      badge: 'CLEAR BRIEF',
      summary: 'Returns 3 meetings and flags 2:00 PM – 4:30 PM as your cleanest focus window.',
      detail: 'Only reading · answered in 2.0 s · $0 pay-per-use cost'
    }
  },
  {
    id: 'research',
    label: 'Run overnight research',
    category: 'Background work',
    prompt: '"Compare three lightweight static hosts and leave a 1-page table by 7 AM."',
    preferredHarness: 'Codex',
    needsApproval: false,
    packetTag: 'OVERNIGHT JOB',
    hopDetails: {
      laptop: 'Picked the comparison recipe (playbooks/comparison-brief.md) before bed',
      'drive-bus': 'Copied the task to the always-on cloud computer',
      cloud: 'Did the comparison overnight on a fixed monthly plan',
      telegram: 'Sent 7:00 AM digest link to memory-cards/hosting-comparison.md',
      'approval-gate': 'PASSED: a private research note, nothing sent to anyone'
    },
    outcomeApproved: {
      badge: 'READY BY MORNING',
      summary: 'One-page table waiting in memory-cards/ at 7:00 AM in your exact format.',
      detail: 'Saved to memory-cards/hosting-comparison.md'
    }
  }
];

export const FAILOVER_PROVIDERS = [
  {
    id: 'antigravity',
    priority: 1,
    name: 'Antigravity',
    role: 'Primary everyday driver',
    plan: 'Fixed monthly plan',
    strength: 'Fast routing, daily notes, and interactive workspace work.'
  },
  {
    id: 'claude',
    priority: 2,
    name: 'Claude',
    role: 'First automatic backup',
    plan: 'Fixed monthly plan',
    strength: 'Writing, structured planning, and careful reasoning.'
  },
  {
    id: 'codex',
    priority: 3,
    name: 'Codex',
    role: 'Second automatic backup',
    plan: 'Fixed monthly plan',
    strength: 'Background builds, verification checks, and overnight runs.'
  }
];

export const BRAIN_FOLDERS = [
  {
    id: 'rules',
    name: 'rules',
    path: 'brain/rules/',
    tag: 'How to behave',
    headline: 'One rulebook read by every assistant.',
    shortSummary: 'Write your tone, formatting, and safety boundaries once in plain Markdown.',
    deepNote:
      'Instead of repeating preferences inside every new chat window, every assistant reads the same rulebook before starting. Switching tools next month preserves every habit untouched.',
    sampleFile: 'rules/core-rules.md',
    sampleContent: `# Core Rules

- Write in plain English with zero filler.
- Never send emails or messages without approval.
- Update the existing note; never make duplicates.
- Check memory cards before asking me to repeat myself.`
  },
  {
    id: 'memory-cards',
    name: 'memory cards',
    path: 'brain/memory-cards/',
    tag: 'Facts about you',
    headline: 'One tidy card per topic, never buried.',
    shortSummary: 'Short text cards you can edit, instead of facts lost in old chats.',
    deepNote:
      'Locked-in chat histories bury key facts under hundreds of old messages. Short Markdown cards let you inspect, edit, or delete any fact in seconds with any text editor.',
    sampleFile: 'memory-cards/travel.md',
    sampleContent: `# Travel Preferences

- Morning flights: window seat
- Flights over 4 hours: aisle seat
- Carry-on only for trips under 5 days
- Always leave a 2-hour buffer before international departures`
  },
  {
    id: 'lessons-learned',
    name: 'lessons learned',
    path: 'brain/lessons-learned/',
    tag: 'Mistakes not to repeat',
    headline: 'Correct it once, every AI app learns.',
    shortSummary: 'Every correction saved here is followed by all three AI apps.',
    deepNote:
      'In a normal chat app, correcting a mistake only fixes that single thread. Saving lessons in Markdown means Antigravity, Claude, and Codex all avoid the same error from that day forward.',
    sampleFile: 'lessons-learned/email-tone.md',
    sampleContent: `# Lessons Learned

- Keep client follow-ups under five sentences.
- Lead with the decision or next step in line one.
- Never schedule meetings during the 2 PM deep-work block.`
  },
  {
    id: 'playbooks',
    name: 'playbooks',
    path: 'brain/playbooks/',
    tag: 'Step-by-step recipes',
    headline: 'Turn recurring work into checklists.',
    shortSummary: 'Store multi-step workflows once so any assistant runs the exact same format.',
    deepNote:
      'Chat silos force you to re-explain recurring workflows from scratch. A Markdown playbook captures exact steps and output tables so any assistant produces consistent results on demand.',
    sampleFile: 'playbooks/comparison-brief.md',
    sampleContent: `# Comparison Brief Playbook

1. Compare at most 3 real options.
2. Put price, setup time, and trade-offs in one table.
3. End with a single plain-English recommendation.
4. Save to memory-cards/ and keep under one page.`
  },
  {
    id: 'execution-trail',
    name: 'execution trail',
    path: 'brain/execution-trail/',
    tag: 'A log of everything done',
    headline: 'One plain-text receipt per action.',
    shortSummary: 'See which assistant changed what, and when, in a plain list.',
    deepNote:
      'When work is spread over several chat apps you lose track of what changed. This log only ever gets new lines added, never edited, so you can always check what happened and undo it.',
    sampleFile: 'execution-trail/recent.md',
    sampleContent: `# Execution Trail

- 09:10 | Antigravity | Updated memory-cards/travel.md
- 11:30 | Claude      | Drafted Studio North email (approved)
- 23:00 | Codex       | Saved hosting comparison brief`
  }
];

export const BLUEPRINT_OPTIONS = {
  channels: [
    {
      id: 'telegram',
      label: 'Telegram',
      detail: 'Mobile commands, digests & one-tap approvals'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      detail: 'Personal notes, voice capture & family bridge'
    }
  ],
  storage: [
    {
      id: 'drive',
      label: 'Google Drive',
      detail: 'One shared folder for laptop and cloud'
    },
    {
      id: 'git',
      label: 'Git Repository',
      detail: 'Keeps every past version of every note'
    },
    {
      id: 'hybrid',
      label: 'Drive + Git',
      detail: 'Drive for live copying, Git for saved versions'
    }
  ],
  models: [
    {
      id: 'antigravity',
      label: 'Antigravity',
      detail: 'First choice for everyday work'
    },
    {
      id: 'claude',
      label: 'Claude',
      detail: 'Writing, planning & careful reasoning'
    },
    {
      id: 'codex',
      label: 'Codex',
      detail: 'Long jobs and overnight checks'
    }
  ]
};
