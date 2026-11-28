/**
 * Digital Brain Architecture: client-side sandbox and blueprint data
 * 100% synthetic examples. Zero PII, zero emojis, zero runtime tokens.
 */

export const PIPELINE_NODES = [
  {
    id: 'door',
    index: 0,
    shortLabel: 'Front door',
    subLabel: 'Chat, call, email, app',
    x: 92,
    y: 112,
    latencyMs: 40,
    role: 'where the request comes in',
    summary: 'You can ask from Telegram, by calling a phone line, by emailing the assistant, or from one of three private web apps. Every door leads to the same brain.',
    deepNote:
      'The doors only carry words in and answers out. None of them keeps its own memory, so a task started on a call can be continued in Telegram, and the private web apps open only after a Google sign-in with your own account.'
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
    summary: 'One shared folder (for example Google Drive) holds the notes. The cloud computer and your laptop each keep a synced copy, so both always see the same thing.',
    deepNote:
      'One folder means no stray copies drifting apart. Changes reach every machine within minutes, and a short note is attached to each request with only the rules and facts that matter for it.'
  },
  {
    id: 'cloud',
    index: 2,
    shortLabel: 'Cloud',
    subLabel: 'On 24/7',
    x: 456,
    y: 112,
    latencyMs: 280,
    role: 'where the work is done',
    summary: 'An always-on computer in a data centre runs the AI engines (Gemini, Codex and Claude), so work carries on while your laptop is closed.',
    deepNote:
      'Engines are tried in order. If the first is near its usage limit you get one warning, and once it hits the limit the next one picks up with the same notes. Long jobs run as their own background process, so they survive restarts.'
  },
  {
    id: 'telegram',
    index: 3,
    shortLabel: 'Your phone',
    subLabel: 'Short card',
    x: 638,
    y: 112,
    latencyMs: 95,
    role: 'brings the answer back',
    summary: 'The answer arrives on Telegram as a short card: a heading and two or three lines, with the full detail one tap away.',
    deepNote:
      'Unprompted messages are capped at a few a day and stay quiet at night. Approvals arrive as one-tap buttons instead of a busy dashboard.'
  },
  {
    id: 'approval-gate',
    index: 4,
    shortLabel: 'Approval Gate',
    subLabel: 'Only for big steps',
    x: 820,
    y: 112,
    latencyMs: 0,
    role: 'the final safety check',
    summary: 'Money, publishing and messages to other people wait here for your tap. Notes, lookups and research go straight through.',
    deepNote:
      'The gate is narrow on purpose. If it asked about everything, you would stop reading it. It only stops actions that are hard to undo or that reach someone else.'
  }
];

export const COMMAND_SCENARIOS = [
  {
    id: 'email',
    label: 'Send a client email',
    category: 'Reaches someone else',
    door: 'APP',
    doorName: 'a private web app',
    prompt: '"Email Alex at Studio North with the revised timeline and confirm Thursday at 3 PM."',
    needsApproval: true,
    holdLabel: 'EMAIL ON HOLD',
    packetTag: 'EMAIL TO SOMEONE',
    draftPreview: {
      to: 'Alex, Studio North (made-up example)',
      subject: 'Updated timeline + Thursday 3 PM check-in',
      body: 'Hi Alex, sharing the updated two-week milestones below. Does Thursday at 3 PM still work to walk through them?'
    },
    hopDetails: {
      door: 'Typed into the private web app after a Google sign-in',
      'drive-bus': 'Attached 2 relevant notes (4.2 KB, about a page of text): writing tone and the Studio North card',
      cloud: 'The engine on duty wrote a short draft reply',
      telegram: 'Sent the draft to your phone with approve and cancel buttons',
      'approval-gate': 'ON HOLD: the email waits until you tap approve'
    },
    outcomeApproved: {
      badge: 'SENT AFTER APPROVAL',
      summary: 'The email went out only after your tap, and one line was added to the log folder (execution-trail).',
      detail: 'Delivered to Alex · logged to execution-trail/recent.md'
    },
    outcomeCancelled: {
      badge: 'SAFELY CANCELLED',
      summary: 'Nothing was sent. The draft was discarded and your inbox is untouched.',
      detail: 'Blocked by owner at Approval Gate'
    }
  },
  {
    id: 'pay',
    label: 'Pay a bill',
    category: 'Money',
    door: 'CHAT',
    doorName: 'Telegram',
    prompt: '"Pay this month\'s electricity bill from the usual account."',
    needsApproval: true,
    holdLabel: 'PAYMENT ON HOLD',
    packetTag: 'MONEY',
    draftPreview: {
      to: 'City Power (made-up example)',
      subject: 'Electricity bill, November: 1,240 rupees',
      body: 'Ready to pay from the usual account. Nothing moves until you approve.'
    },
    hopDetails: {
      door: 'Typed into Telegram',
      'drive-bus': 'Attached the bills card and the rule that money always needs a tap',
      cloud: 'Read the bill and filled in the payment up to the last step',
      telegram: 'Sent a card with the amount and approve and cancel buttons',
      'approval-gate': 'ON HOLD: money never moves without your tap'
    },
    outcomeApproved: {
      badge: 'PAID AFTER APPROVAL',
      summary: 'Paid only after your tap. The receipt was saved and one line added to the log.',
      detail: 'Paid 1,240 rupees · receipt saved · logged'
    },
    outcomeCancelled: {
      badge: 'SAFELY CANCELLED',
      summary: 'Nothing was paid. The bill stays on your list.',
      detail: 'Blocked by owner at Approval Gate'
    }
  },
  {
    id: 'travel',
    label: 'Remember travel preference',
    category: 'Save a note',
    door: 'CALL',
    doorName: 'the phone line',
    prompt: '"Book window seats on morning flights and aisle seats on flights over four hours."',
    needsApproval: false,
    packetTag: 'PRIVATE NOTE',
    hopDetails: {
      door: 'Said on a call to the phone line',
      'drive-bus': 'Found the existing travel card (18 lines) and changed one line (142 bytes)',
      cloud: 'Checked the note is tidy and updated the notes index',
      telegram: 'Finished quietly: no need to disturb your phone',
      'approval-gate': 'PASSED: a private note, nothing sent to anyone'
    },
    outcomeApproved: {
      badge: 'SAVED EVERYWHERE',
      summary: 'Saved in plain Markdown, so every assistant you open tomorrow already knows it.',
      detail: 'Updated memory-cards/travel.md · 1 line logged'
    }
  },
  {
    id: 'schedule',
    label: "Check today's schedule",
    category: 'Quick lookup',
    door: 'CHAT',
    doorName: 'Telegram',
    prompt: '"What is on my calendar today, and where is my cleanest 2-hour deep-work block?"',
    needsApproval: false,
    packetTag: 'LOOKUP ONLY',
    hopDetails: {
      door: 'Typed into Telegram',
      'drive-bus': 'Attached the focus-hours note',
      cloud: 'Found the open slots and ranked 2:00 to 4:30 PM as the best block',
      telegram: 'Returned a 3-line answer in about 2 seconds',
      'approval-gate': 'PASSED: only reading, nothing can be changed'
    },
    outcomeApproved: {
      badge: 'CLEAR BRIEF',
      summary: 'Returns 3 meetings and flags 2:00 PM to 4:30 PM as your cleanest focus window.',
      detail: 'Only reading · answered in 2.0 s · $0 pay-per-use cost'
    }
  },
  {
    id: 'research',
    label: 'Hand over an overnight build',
    category: 'Background work',
    door: 'EMAIL',
    doorName: 'email',
    prompt: '"Compare three lightweight static hosts and leave a 1-page table by 7 AM. I am closing my laptop."',
    needsApproval: false,
    packetTag: 'CLOUD JOB',
    hopDetails: {
      door: 'Sent by email to the assistant\'s own address (only mail from your addresses runs)',
      'drive-bus': 'Copied the request and the comparison recipe to the cloud computer',
      cloud: 'Ran overnight as its own background job, laptop closed the whole time',
      telegram: 'Sent a 7:00 AM card: heading, two lines, tap for the full table',
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
    id: 'gemini',
    priority: 1,
    name: 'Gemini',
    role: 'First choice (runs through Antigravity)',
    plan: 'Fixed monthly plan',
    strength: 'Fast answers, research and everyday tasks.'
  },
  {
    id: 'codex',
    priority: 2,
    name: 'Codex',
    role: 'First automatic backup',
    plan: 'Fixed monthly plan',
    strength: 'Builds, checks and long background jobs.'
  },
  {
    id: 'claude',
    priority: 3,
    name: 'Claude',
    role: 'Second automatic backup',
    plan: 'Fixed monthly plan',
    strength: 'Writing, planning and careful reasoning.'
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
      'Every assistant reads the same rulebook before it starts, so you stop repeating your preferences in each new chat. If you switch tools next month, the habits come with you.',
    sampleFile: 'rules/core-rules.md',
    sampleContent: `# Core Rules

- Write in plain English with zero filler.
- Never send emails or messages without approval.
- Update the existing note. Never make duplicates.
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
      'In a chat history, a key fact sits under hundreds of old messages. A short Markdown card can be checked, edited or deleted in seconds with any text editor.',
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
      'In a normal chat app, a correction only fixes that one thread. Written here once, it is read by Gemini, Codex and Claude, so none of them repeats the error.',
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
    shortSummary: 'Write a multi-step task down once and any assistant follows the same steps.',
    deepNote:
      'Without a written recipe, you explain the same weekly task again and again. A playbook stores the steps and the output table once, so any assistant returns the same format every time.',
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
      'When work is spread over several chat apps, you lose track of what changed. This log only ever gets new lines (old ones are never edited), so you can check what happened and undo it.',
    sampleFile: 'execution-trail/recent.md',
    sampleContent: `# Execution Trail

- 09:10 | Gemini      | Updated memory-cards/travel.md
- 11:30 | Claude      | Drafted Studio North email (approved)
- 23:00 | Codex       | Saved hosting comparison brief`
  }
];

export const BLUEPRINT_OPTIONS = {
  channels: [
    {
      id: 'telegram',
      label: 'Telegram',
      detail: 'Text chat, short cards and one-tap approvals'
    },
    {
      id: 'voice',
      label: 'Phone line',
      detail: 'Call it and talk, in a copy of your voice'
    },
    {
      id: 'email',
      label: 'Email',
      detail: 'Mail from your own addresses runs as a task'
    },
    {
      id: 'webapps',
      label: 'Private web apps',
      detail: 'Open only after a Google sign-in as you'
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
      id: 'gemini',
      label: 'Gemini',
      detail: 'First choice for everyday work'
    },
    {
      id: 'codex',
      label: 'Codex',
      detail: 'Builds and long background jobs'
    },
    {
      id: 'claude',
      label: 'Claude',
      detail: 'Writing, planning and careful reasoning'
    }
  ]
};
