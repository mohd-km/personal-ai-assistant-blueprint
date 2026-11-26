/**
 * Digital Brain Architecture — Client-Side Sandbox & Blueprint Data
 * 100% synthetic examples. Zero PII, zero emojis, zero runtime tokens.
 */

export const PIPELINE_NODES = [
  {
    id: 'laptop',
    index: 0,
    shortLabel: 'Laptop',
    subLabel: 'Local Workspace',
    x: 92,
    y: 112,
    latencyMs: 12,
    role: 'Capture & local edits',
    summary: 'Reads plain Markdown cards locally and stages every command with zero vendor lock-in.',
    deepNote:
      'Your desktop or laptop is a replaceable client, not the single point of failure. Any editor or AI harness opens the same local folder and writes clean diffs directly to disk.'
  },
  {
    id: 'drive-bus',
    index: 1,
    shortLabel: 'Drive Bus',
    subLabel: 'One Sync Bus',
    x: 274,
    y: 112,
    latencyMs: 140,
    role: 'Single file transport',
    summary: 'Syncs Markdown notes and state between laptop and cloud on one deterministic file bus.',
    deepNote:
      'Using one shared sync bus eliminates fragile ad-hoc copies. Every machine converges on the same rules, memory cards, and execution trail within seconds.'
  },
  {
    id: 'cloud',
    index: 2,
    shortLabel: 'Cloud',
    subLabel: 'Always-On Node',
    x: 456,
    y: 112,
    latencyMs: 280,
    role: 'Failover AI runtime',
    summary: 'Runs the active flat-rate assistant (Antigravity, Claude, or Codex) even while your laptop sleeps.',
    deepNote:
      'The cloud worker mounts the same synced folder and follows the priority waterfall. If the primary model hits quota or goes offline, the next model resumes with zero lost context.'
  },
  {
    id: 'telegram',
    index: 3,
    shortLabel: 'Telegram',
    subLabel: 'Mobile Control',
    x: 638,
    y: 112,
    latencyMs: 95,
    role: 'Remote prompt & receipt',
    summary: 'Delivers crisp mobile updates and carries your one-tap confirmation back to the cloud worker.',
    deepNote:
      'Telegram acts as a lightweight control plane from your phone: short plain-text briefs, status pings, and explicit approval tokens—never noisy dashboards.'
  },
  {
    id: 'approval-gate',
    index: 4,
    shortLabel: 'Approval Gate',
    subLabel: 'Human Safety Lock',
    x: 820,
    y: 112,
    latencyMs: 0,
    role: 'Outward action firewall',
    summary: 'Auto-passes private notes and lookups; pauses every external email, message, or payment for your tap.',
    deepNote:
      'Background tasks run under a restricted unattended flag. Any outward-facing tool is intercepted by the approval gate and cannot execute until you explicitly approve it.'
  }
];

export const COMMAND_SCENARIOS = [
  {
    id: 'email',
    label: 'Send a client email',
    category: 'Outward action',
    prompt: '"Email Alex at Studio North with the revised timeline and confirm Thursday at 3 PM."',
    preferredHarness: 'Claude',
    needsApproval: true,
    packetTag: 'OUTWARD DRAFT',
    draftPreview: {
      to: 'Alex — Studio North (synthetic contact)',
      subject: 'Updated timeline + Thursday 3 PM check-in',
      body: 'Hi Alex, sharing the updated two-week milestones below. Does Thursday at 3 PM still work to walk through them?'
    },
    hopDetails: {
      laptop: 'Matched rules/writing-tone.md + memory-cards/studio-north.md',
      'drive-bus': 'Synced 2 context files (4.2 KB) across the bus',
      cloud: 'Drafted concise reply using active flat-rate assistant',
      telegram: 'Pushed draft preview + approve/cancel prompt to phone',
      'approval-gate': 'PAUSED — outward email waits for explicit owner tap'
    },
    outcomeApproved: {
      badge: 'SENT AFTER APPROVAL',
      summary: 'Email dispatched only after your tap, with a one-line receipt appended to execution-trail/.',
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
    packetTag: 'PRIVATE WRITE',
    hopDetails: {
      laptop: 'Routed to existing memory-cards/travel.md (18 lines)',
      'drive-bus': 'Mirrored 1-line diff (142 B) to cloud workspace',
      cloud: 'Verified card format and updated shared index',
      telegram: 'Silent completion — no mobile interruption needed',
      'approval-gate': 'AUTO-PASSED — private note update, zero external sends'
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
    packetTag: 'READ-ONLY',
    hopDetails: {
      laptop: 'Loaded rules/focus-hours.md + read-only calendar query',
      'drive-bus': 'Checked latest focus rule checksum (in sync)',
      cloud: 'Computed open slots and ranked 2:00–4:30 PM top block',
      telegram: 'Returned 3-line plain-text brief in 2 seconds',
      'approval-gate': 'AUTO-PASSED — read-only lookup cannot mutate state'
    },
    outcomeApproved: {
      badge: 'CLEAR BRIEF',
      summary: 'Returns 3 meetings and flags 2:00 PM – 4:30 PM as your cleanest focus window.',
      detail: 'Read-only · delivered in 2.0 s · $0 extra API cost'
    }
  },
  {
    id: 'research',
    label: 'Run overnight research',
    category: 'Background work',
    prompt: '"Compare three lightweight static hosts and leave a 1-page table by 7 AM."',
    preferredHarness: 'Codex',
    needsApproval: false,
    packetTag: 'BACKGROUND JOB',
    hopDetails: {
      laptop: 'Queued playbook playbooks/comparison-brief.md before sleep',
      'drive-bus': 'Synced task brief to always-on cloud workspace',
      cloud: 'Executed overnight comparison on flat-rate plan',
      telegram: 'Sent 7:00 AM digest link to memory-cards/hosting-comparison.md',
      'approval-gate': 'AUTO-PASSED — local research note, no outward side effects'
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
    plan: 'Flat-rate plan',
    strength: 'Fast routing, daily notes, and interactive workspace work.'
  },
  {
    id: 'claude',
    priority: 2,
    name: 'Claude',
    role: 'First automatic backup',
    plan: 'Flat-rate plan',
    strength: 'Writing, structured planning, and careful reasoning.'
  },
  {
    id: 'codex',
    priority: 3,
    name: 'Codex',
    role: 'Second automatic backup',
    plan: 'Flat-rate plan',
    strength: 'Background builds, verification checks, and overnight runs.'
  }
];

export const BRAIN_FOLDERS = [
  {
    id: 'rules',
    name: 'rules',
    path: 'brain/rules/',
    tag: 'Shared behavior contract',
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
    tag: 'Durable personal facts',
    headline: 'One tidy card per topic, never buried.',
    shortSummary: 'Editable plain-text cards replace unsearchable vendor chat histories.',
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
    tag: 'Mistakes never repeated',
    headline: 'Correct once, upgrade every model.',
    shortSummary: 'Every fix saved here is automatically inherited by all connected assistants.',
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
    tag: 'Repeatable recipes',
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
    tag: 'Append-only receipts',
    headline: 'One plain-text receipt per action.',
    shortSummary: 'Know which assistant changed what, when, and why—with zero vendor lock-in.',
    deepNote:
      'When work happens across scattered chat apps, you lose visibility into changes. One append-only trail records every update in plain text for instant auditability and easy rollback.',
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
      detail: 'Single sync bus across laptop and cloud'
    },
    {
      id: 'git',
      label: 'Git Repository',
      detail: 'Versioned Markdown with full diff history'
    },
    {
      id: 'hybrid',
      label: 'Drive + Git',
      detail: 'Live Drive sync backed by Git snapshots'
    }
  ],
  models: [
    {
      id: 'antigravity',
      label: 'Antigravity',
      detail: 'Primary interactive workspace driver'
    },
    {
      id: 'claude',
      label: 'Claude',
      detail: 'Writing, planning & careful reasoning'
    },
    {
      id: 'codex',
      label: 'Codex',
      detail: 'Background builds & overnight verification'
    }
  ]
};
