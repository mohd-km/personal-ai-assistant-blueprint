/**
 * Digital Brain Architecture — Client-Side Sandbox Data
 * 100% synthetic examples. Zero PII, zero emojis, zero runtime tokens.
 */

export const COMMAND_SCENARIOS = [
  {
    id: 'travel',
    label: 'Remember my travel preference',
    category: 'Save a note',
    prompt: '"From now on, book window seats on morning flights and aisle seats on flights over four hours."',
    preferredHarness: 'Antigravity',
    needsApproval: false,
    steps: {
      router: {
        title: 'Context Router',
        badge: '1 FILE MATCHED',
        summary: 'Finds your existing travel card instead of starting a blank chat or creating a duplicate note.',
        detail: 'Opens memory-cards/travel.md (18 lines)'
      },
      harness: {
        title: 'Assistant Selection',
        badge: 'FAST LANE',
        summary: 'Picks the first available assistant in your waterfall to make a clean, one-line update.',
        detail: 'Uses active flat-rate assistant — zero extra API cost'
      },
      gate: {
        title: 'Safety Approval Gate',
        badge: 'AUTO-PASSED',
        summary: 'This only updates your private notes and sends nothing to anyone outside. No pause needed.',
        detail: 'Private write allowed automatically'
      },
      outcome: {
        title: 'Outcome',
        badge: 'SAVED EVERYWHERE',
        summary: 'Your travel preference is saved in plain Markdown. Every AI assistant you open tomorrow already knows it.',
        detail: 'Updated memory-cards/travel.md and logged 1 line to execution-trail/'
      }
    }
  },
  {
    id: 'schedule',
    label: "Check today's schedule",
    category: 'Quick lookup',
    prompt: '"What is on my calendar today, and do I have a free two-hour block for deep work?"',
    preferredHarness: 'Antigravity',
    needsApproval: false,
    steps: {
      router: {
        title: 'Context Router',
        badge: 'READ-ONLY',
        summary: 'Pulls today’s calendar events and your focus-hours rule, ignoring unrelated folders.',
        detail: 'Reads calendar + rules/focus-hours.md'
      },
      harness: {
        title: 'Assistant Selection',
        badge: 'INSTANT ANSWER',
        summary: 'Routes to your active assistant for a fast, plain-English summary with open slots highlighted.',
        detail: 'Uses active flat-rate assistant — zero extra API cost'
      },
      gate: {
        title: 'Safety Approval Gate',
        badge: 'AUTO-PASSED',
        summary: 'Reading your own schedule cannot change anything or message anyone. Runs immediately.',
        detail: 'Read-only action pre-approved'
      },
      outcome: {
        title: 'Outcome',
        badge: 'CLEAR BRIEF',
        summary: 'Returns your three meetings today and flags 2:00 PM to 4:30 PM as your cleanest uninterrupted work block.',
        detail: 'Delivered in 2 seconds with zero clutter'
      }
    }
  },
  {
    id: 'email',
    label: 'Send a client email',
    category: 'Outward action',
    prompt: '"Email Alex at Studio North with the revised project timeline and ask to confirm Thursday at 3 PM."',
    preferredHarness: 'Claude',
    needsApproval: true,
    draftPreview: {
      to: 'Alex — Studio North (synthetic contact)',
      subject: 'Updated timeline + Thursday 3 PM check-in',
      body: 'Hi Alex, sharing the updated two-week milestones below. Does Thursday at 3 PM still work to walk through them?'
    },
    steps: {
      router: {
        title: 'Context Router',
        badge: '2 FILES MATCHED',
        summary: 'Loads your writing tone rule and the Studio North project note so the draft sounds like you.',
        detail: 'Reads rules/writing-tone.md + memory-cards/studio-north.md'
      },
      harness: {
        title: 'Assistant Selection',
        badge: 'WRITING LANE',
        summary: 'Assigns the draft to your active assistant, keeping the tone calm, concise, and free of filler.',
        detail: 'Drafted locally — nothing sent yet'
      },
      gate: {
        title: 'Safety Approval Gate',
        badge: 'PAUSED FOR YOU',
        summary: 'Sending an email reaches someone outside your brain. The system stops and waits for your explicit tap.',
        detail: 'Outward actions never fire unattended'
      },
      outcome: {
        title: 'Outcome',
        badge: 'SENT AFTER APPROVAL',
        summary: 'Only after you approve does the email go out, with a one-line receipt saved to your execution trail.',
        detail: 'Delivered to Alex and recorded in execution-trail/'
      },
      cancelledOutcome: {
        title: 'Outcome',
        badge: 'SAFELY CANCELLED',
        summary: 'Nothing was sent. The draft was discarded cleanly and your inbox stayed untouched.',
        detail: 'Blocked by owner at Safety Approval Gate'
      }
    }
  },
  {
    id: 'research',
    label: 'Run overnight research',
    category: 'Background work',
    prompt: '"Compare three lightweight static hosting options for a personal showcase and leave a short table by morning."',
    preferredHarness: 'Codex',
    needsApproval: false,
    steps: {
      router: {
        title: 'Context Router',
        badge: 'PLAYBOOK LOADED',
        summary: 'Matches your saved research checklist so the output arrives as a crisp table, not a wall of text.',
        detail: 'Reads playbooks/comparison-brief.md + lessons-learned/hosting.md'
      },
      harness: {
        title: 'Assistant Selection',
        badge: 'DEEP WORK LANE',
        summary: 'Hands the long-running job to your always-on background assistant while your laptop sleeps.',
        detail: 'Runs on flat-rate plan — zero surprise bills'
      },
      gate: {
        title: 'Safety Approval Gate',
        badge: 'AUTO-PASSED',
        summary: 'Web reading and writing a local summary note stay strictly inside your workspace. Safe to run overnight.',
        detail: 'No external sends or purchases'
      },
      outcome: {
        title: 'Outcome',
        badge: 'READY BY MORNING',
        summary: 'A clean one-page comparison waits in your notes at 7:00 AM, already formatted the way you like to read.',
        detail: 'Saved to memory-cards/hosting-comparison.md'
      }
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
    strength: 'Steps in automatically for writing, planning, and careful reasoning.'
  },
  {
    id: 'codex',
    priority: 3,
    name: 'Codex',
    role: 'Second automatic backup',
    plan: 'Flat-rate plan',
    strength: 'Handles background builds, code checks, and overnight tasks.'
  }
];

export const BRAIN_FOLDERS = [
  {
    id: 'rules',
    name: 'rules',
    path: 'brain/rules/',
    tag: 'How every assistant behaves',
    headline: 'One rulebook read by every AI you use.',
    sentences: [
      'Instead of repeating your preferences inside every new chat window, you write your standards once in a plain Markdown file that every assistant reads before starting.',
      'If you switch tools next month, your habits and safety boundaries come with you untouched instead of staying trapped in one vendor’s settings.'
    ],
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
    headline: 'Small, tidy cards instead of buried chat threads.',
    sentences: [
      'Locked-in chat histories bury important facts under hundreds of old messages where you can never inspect or edit them cleanly.',
      'Short Markdown cards keep one clear topic per file so you can read, fix, or delete any fact in seconds with any text editor.'
    ],
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
    headline: 'Every correction makes every assistant smarter.',
    sentences: [
      'In a normal chat app, correcting a mistake only fixes that single conversation, so the same error returns next week in another tool.',
      'Saving each lesson as a plain Markdown note means Antigravity, Claude, and Codex all inherit the fix automatically from that day forward.'
    ],
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
    tag: 'Repeatable step-by-step recipes',
    headline: 'Turn recurring work into one-click checklists.',
    sentences: [
      'Chat silos force you to re-explain multi-step workflows from scratch every time you need a weekly review or research brief.',
      'A Markdown playbook stores the exact steps and output format once, so any assistant can run the same reliable process on demand.'
    ],
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
    tag: 'Clear history of what happened',
    headline: 'A simple receipt for every action taken.',
    sentences: [
      'When work happens across scattered chat apps, you lose track of which assistant changed what and why.',
      'One readable Markdown trail records every update in plain text, giving you full visibility and an easy undo path with zero vendor lock-in.'
    ],
    sampleFile: 'execution-trail/recent.md',
    sampleContent: `# Execution Trail

- 09:10 | Antigravity | Updated memory-cards/travel.md
- 11:30 | Claude      | Drafted Studio North email (approved)
- 23:00 | Codex       | Saved hosting comparison brief`
  }
];
