export const ARCHITECTURE_NODES = [
  {
    id: 'plivo',
    step: '01 / INGRESS',
    title: 'Phone Call (Plivo ulaw_8000)',
    shortSub: 'Inbound PSTN DID streams raw 8 kHz mu-law audio frames over WebSocket with caller metadata.',
    badge: 'ulaw_8000',
    badgeTone: 'emerald',
    lane: 'shared',
    protocol: 'PSTN -> Plivo XML -> Bidirectional WebSocket (8 kHz mu-law, 20ms frames)',
    tradeoffs: [
      'Stays in native 8 kHz mu-law end-to-end instead of upsampling to 16/24 kHz PCM, eliminating CPU resampling overhead and jitter buffer drift.',
      'Uses a standard local DID ($2.50/mo) rather than a proprietary VoIP app so any caller on any mobile network reaches the assistant without installing software.',
      'Rejects SIP trunk complexity in favor of Plivo managed WebSocket media streams with automatic TLS termination.'
    ],
    latencyBudget: {
      total: '140 ms',
      segments: [
        { label: 'PSTN carrier handoff', ms: 65, pct: 46, color: '#3fa67b' },
        { label: 'Plivo XML webhook & WS open', ms: 55, pct: 39, color: '#d99b43' },
        { label: 'First 20ms ulaw frame', ms: 20, pct: 15, color: '#8f96a3' }
      ]
    },
    invariantTone: 'emerald',
    invariant:
      'Plivo webhook signatures are verified via HMAC before upgrading the media socket. Raw caller E.164 headers are treated as immutable ingress metadata.'
  },
  {
    id: 'bridge',
    step: '02 / AUDIO RUNTIME',
    title: 'Voice Bridge',
    shortSub: 'Manages turn-taking VAD, barge-in cancellation, STT streaming, and ElevenLabs ulaw_8000 synthesis.',
    badge: 'Barge-In + VAD',
    badgeTone: 'amber',
    lane: 'shared',
    protocol: 'Local Node.js WebSocket Server -> Streaming STT + ElevenLabs ulaw_8000 TTS',
    tradeoffs: [
      'Requests ElevenLabs output directly in ulaw_8000 format so synthesized chunks pipe straight back to Plivo without FFmpeg transcoding.',
      'Enforces a 45-word voice response ceiling and pre-caches standard greetings, cutting ElevenLabs character consumption by more than 60%.',
      'Supports instant barge-in: if the caller speaks mid-sentence, the outbound audio queue clears within 50ms.'
    ],
    latencyBudget: {
      total: '620 ms',
      segments: [
        { label: 'Endpointing / VAD silence detect', ms: 260, pct: 42, color: '#d99b43' },
        { label: 'Streaming STT finalize', ms: 160, pct: 26, color: '#8f96a3' },
        { label: 'ElevenLabs ulaw_8000 first byte', ms: 200, pct: 32, color: '#3fa67b' }
      ]
    },
    invariantTone: 'emerald',
    invariant:
      'Audio buffers remain strictly in volatile memory during the active call and are discarded on hangup. No raw call recordings are persisted to disk.'
  },
  {
    id: 'router',
    step: '03 / HARD GATE',
    title: 'Caller-ID Lane Router',
    shortSub: 'Deterministic E.164 allowlist gate executed in code before any prompt, memory file, or tool is loaded.',
    badge: 'Deterministic Gate',
    badgeTone: 'emerald',
    lane: 'shared',
    protocol: 'In-Process E.164 Exact-Match Check -> Process Context Isolation',
    tradeoffs: [
      'Identity routing is an explicit code branch, never a prompt instruction, eliminating prompt-injection escalation from untrusted callers.',
      'Loads two physically separate system prompts and tool registries: an allowlist miss never mounts personal memory paths.',
      'Adds sub-millisecond overhead while allowing one phone number to serve both personal command execution and public receptionist duties.'
    ],
    latencyBudget: {
      total: '< 2 ms',
      segments: [
        { label: 'E.164 normalization', ms: 0.5, pct: 25, color: '#3fa67b' },
        { label: 'Allowlist set lookup', ms: 0.5, pct: 25, color: '#d99b43' },
        { label: 'Lane profile bind', ms: 1, pct: 50, color: '#8f96a3' }
      ]
    },
    invariantTone: 'emerald',
    invariant:
      'Fail-closed by construction: any missing, malformed, withheld, or unrecognized Caller-ID routes unconditionally to the zero-tool Public Desk Lane.'
  },
  {
    id: 'owner',
    step: '04A / PRIVATE EXECUTION',
    title: 'Owner Lane',
    shortSub: '2s fast-path Markdown recall, multi-harness CLI waterfall, and 16s background-to-Telegram handoff.',
    badge: 'Full Brain + Handoff',
    badgeTone: 'amber',
    lane: 'owner',
    subItems: [
      '2.0s fast-path local Markdown memory recall',
      'Multi-harness CLI waterfall (flat-rate subscriptions)',
      '16s voice cutoff -> async Telegram completion'
    ],
    protocol: 'Local Markdown Index -> CLI Harness Waterfall -> Telegram Bot Async Dispatch',
    tradeoffs: [
      'Answers routine factual lookups (schedules, notes, tasks) in ~2.0s from plain Markdown files without waiting on heavy agentic loops.',
      'Uses a multi-harness CLI waterfall over existing flat-rate subscriptions so zero per-token API charges accumulate and single-vendor limits never stall a call.',
      'Enforces a 16-second voice wall-clock budget: complex research or multi-file tasks acknowledge verbally, detach to background, and deliver full results to Telegram.'
    ],
    latencyBudget: {
      total: '2.0s fast / 16s handoff',
      segments: [
        { label: 'Local Markdown recall', ms: 420, pct: 21, color: '#3fa67b' },
        { label: 'Fast-path synthesis', ms: 1580, pct: 79, color: '#d99b43' }
      ]
    },
    invariantTone: 'amber',
    invariant:
      'Destructive, financial, or outbound third-party actions still require explicit confirmation via the Telegram approval gate; voice alone cannot trigger irreversible side effects.'
  },
  {
    id: 'public',
    step: '04B / SANDBOXED RECEPTION',
    title: 'Public Desk Lane',
    shortSub: 'Zero execution tools, curated read-only public profile, multilingual ml/hi/kn/ta/en message capture.',
    badge: '0 Execution Tools',
    badgeTone: 'emerald',
    lane: 'public',
    subItems: [
      'Zero shell, file, calendar, or messaging tools mounted',
      'Curated public bio & availability status only',
      'Native multilingual flow: ml / hi / kn / ta / en'
    ],
    protocol: 'Sandboxed Prompt + Read-Only Public Profile -> Structured Summary Queue',
    tradeoffs: [
      'Mounts an empty tool list at runtime: even under adversarial social engineering, there are no functions available to invoke.',
      'Handles Indian multilingual callers seamlessly across Malayalam, Hindi, Kannada, Tamil, and English by matching the caller language on turn one.',
      'Captures caller intent, callback window, and urgency into a single structured note delivered privately to the owner after hangup.'
    ],
    latencyBudget: {
      total: '1.1s per turn',
      segments: [
        { label: 'Language detect & profile load', ms: 90, pct: 8, color: '#3fa67b' },
        { label: 'Concise reply generation', ms: 810, pct: 74, color: '#d99b43' },
        { label: 'Audio frame queue', ms: 200, pct: 18, color: '#8f96a3' }
      ]
    },
    invariantTone: 'emerald',
    invariant:
      'Zero private memory files are readable in this process scope. Home address, private calendar details, contacts, financial data, and IDs do not exist in the context window.'
  }
];

export const CALLER_SCENARIOS = [
  {
    id: 'owner',
    label: 'Verified Owner',
    tone: 'amber',
    callerId: '+91 90000 00001 (E.164 Allowlist Match)',
    lane: 'OWNER LANE',
    executionPolicy: '2s Fast-Path + Multi-Harness CLI Waterfall + Telegram Handoff',
    maxVoiceBudget: '16.0s before async Telegram handoff',
    multilingual: false,
    allowedData: [
      'Personal Markdown memory cards & project notes',
      'Active task list and timed calendar reminders',
      'Multi-harness CLI execution on synced workspace',
      'Async background job dispatch to Telegram'
    ],
    blockedFields: [
      'Unapproved financial transfers or billing changes',
      'Bulk outbound messages without explicit confirmation',
      'Raw secret dumps spoken aloud over PSTN audio'
    ],
    transcripts: {
      en: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00001 matched OWNER_ALLOWLIST. Binding Owner Lane (fast-path + CLI waterfall).' },
        { time: '00:00.9', speaker: 'ASSISTANT', type: 'assistant', text: 'Ready. What do you need?' },
        { time: '00:03.4', speaker: 'OWNER', type: 'caller', text: 'Check what is pending on the voice bridge sprint, and also draft a short summary of last week benchmarks to Telegram.' },
        { time: '00:05.3', speaker: 'FAST-PATH', type: 'system', text: 'Local Markdown index hit in 1.9s (projects/voice-bridge/current.md). Deep summary queued to background worker (est. >16s).' },
        { time: '00:05.6', speaker: 'ASSISTANT', type: 'assistant', text: 'Two items are open on the voice bridge sprint: Plivo fallback timeout tuning and the ElevenLabs greeting cache. I am compiling the benchmark summary in the background and will drop it in Telegram shortly.' },
        { time: '00:14.2', speaker: 'HANDOFF', type: 'system', text: 'Voice turn complete under 16s ceiling. Background CLI harness continues asynchronously -> Telegram delivery confirmed.' }
      ]
    }
  },
  {
    id: 'delivery',
    label: 'Delivery Rider',
    tone: 'emerald',
    callerId: '+91 90000 00042 (Unrecognized Local Mobile)',
    lane: 'PUBLIC DESK LANE',
    executionPolicy: 'NONE (0 Execution Tools Mounted)',
    maxVoiceBudget: 'Concise 2-turn resolution (< 45s total)',
    multilingual: true,
    allowedData: [
      'Public reception drop-off instructions (building security desk)',
      'General availability status ("currently unavailable to take calls")',
      'Structured delivery message intake (courier name, ETA, callback)'
    ],
    blockedFields: [
      'Exact apartment number or private home address',
      'Personal calendar, travel dates, or live location',
      'Private phone numbers, family contacts, or OTP codes',
      'All file system, shell, email, and WhatsApp tools'
    ],
    transcripts: {
      en: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00042 not in allowlist. Binding Public Desk Lane (0 tools, public profile only).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Hello, this is Mohammed KM assistant desk. He is currently unavailable. How can I help?' },
        { time: '00:04.2', speaker: 'CALLER', type: 'caller', text: 'Hi, Aarav here from courier logistics. I have a parcel for Mohammed. Can you share the flat number or OTP?' },
        { time: '00:05.1', speaker: 'GUARD', type: 'system', text: 'Detected sensitive field request (unit address / OTP). Policy: refuse politely, provide public security-desk drop rule.' },
        { time: '00:05.4', speaker: 'ASSISTANT', type: 'assistant', text: 'I cannot share flat details or OTPs on this line. Please leave standard parcels at the main gate security desk, or tell me if an OTP is mandatory and I will notify Mohammed to call you back.' },
        { time: '00:13.8', speaker: 'SUMMARY', type: 'system', text: 'Call ended cleanly. Structured intake note queued to owner Telegram: "Courier (Aarav) at main gate, requested drop confirmation."' }
      ],
      ml: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00042 -> Public Desk Lane (0 tools). Language mode: Malayalam (ml).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Namaskaram, ithu Mohammed KM-inte assistant desk aanu. Addeham ippol call edukkan pattilla. Engane sahayikkam?' },
        { time: '00:04.6', speaker: 'CALLER', type: 'caller', text: 'Courier delivery aanu. Parcel undu, flat numberum OTP-yum parayamo?' },
        { time: '00:05.5', speaker: 'GUARD', type: 'system', text: 'Blocked private address & OTP request. Responding in Malayalam with public gate-desk rule.' },
        { time: '00:05.8', speaker: 'ASSISTANT', type: 'assistant', text: 'Flat details-um OTP-yum ee line-il nalkan pattilla. Dayavayi parcel main gate security desk-il vekkuka. OTP nirbandham aanengil Mohammed-ine ariyikkam.' }
      ],
      hi: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00042 -> Public Desk Lane (0 tools). Language mode: Hindi (hi).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Namaste, main Mohammed KM ka assistant desk bol raha hoon. Woh abhi call nahi le sakte. Main kaise madad kar sakta hoon?' },
        { time: '00:04.5', speaker: 'CALLER', type: 'caller', text: 'Courier se bol raha hoon, parcel deliver karna hai. Flat number aur OTP mil sakta hai?' },
        { time: '00:05.4', speaker: 'GUARD', type: 'system', text: 'Blocked private address & OTP request. Responding in Hindi with public gate-desk rule.' },
        { time: '00:05.7', speaker: 'ASSISTANT', type: 'assistant', text: 'Main is line par flat number ya OTP share nahi kar sakta. Kripya parcel main gate security desk par de dijiye. Zaroorat ho toh main Mohammed ko message bhej dunga.' }
      ],
      kn: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00042 -> Public Desk Lane (0 tools). Language mode: Kannada (kn).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Namaskara, idu Mohammed KM avara assistant desk. Avaru eega call tegedukollalu aguvudilla. Hege sahaya madali?' },
        { time: '00:04.4', speaker: 'CALLER', type: 'caller', text: 'Delivery parcel ide. Flat number mattu OTP kodtira?' },
        { time: '00:05.3', speaker: 'GUARD', type: 'system', text: 'Blocked private address & OTP request. Responding in Kannada with public gate-desk rule.' },
        { time: '00:05.6', speaker: 'ASSISTANT', type: 'assistant', text: 'Flat details athava OTP ee line-alli share madalu aguvudilla. Dayavittu parcel-annu main gate security desk-alli kodi. OTP bekiddare Mohammed avarige tilisuttene.' }
      ],
      ta: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00042 -> Public Desk Lane (0 tools). Language mode: Tamil (ta).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Vanakkam, idhu Mohammed KM-in assistant desk. Avar ippozhudhu call edukka mudiyadhu. Eppadi udhavalam?' },
        { time: '00:04.4', speaker: 'CALLER', type: 'caller', text: 'Courier parcel vandhirukku. Flat number-um OTP-yum solla mudiyuma?' },
        { time: '00:05.3', speaker: 'GUARD', type: 'system', text: 'Blocked private address & OTP request. Responding in Tamil with public gate-desk rule.' },
        { time: '00:05.6', speaker: 'ASSISTANT', type: 'assistant', text: 'Indha line-il flat vivarangal alladhu OTP pagira mudiyadhu. Dayavuseidhu parcel-ai main gate security desk-il kodungal. OTP avasiyam endral Mohammed-ku thagaval anuppugiren.' }
      ]
    }
  },
  {
    id: 'networking',
    label: 'Networking Caller',
    tone: 'emerald',
    callerId: '+91 90000 00088 (Unrecognized Caller)',
    lane: 'PUBLIC DESK LANE',
    executionPolicy: 'NONE (0 Execution Tools Mounted)',
    maxVoiceBudget: 'Structured message intake (< 60s)',
    multilingual: true,
    allowedData: [
      'Curated public bio (product & AI systems focus)',
      'Public contact preference (email / LinkedIn follow-up)',
      'Structured note capture: caller name, topic, preferred callback window'
    ],
    blockedFields: [
      'Live calendar slots or meeting commitments',
      'Private project roadmaps, client names, or internal notes',
      'Personal email, residential details, or financial records',
      'Outbound calendar invite or email sending tools'
    ],
    transcripts: {
      en: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00088 not in allowlist. Binding Public Desk Lane (0 tools).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Hello, you have reached Mohammed KM assistant desk. He is currently unavailable. May I take a message?' },
        { time: '00:04.8', speaker: 'CALLER', type: 'caller', text: 'Hi, this is Priya from the Systems Builders Forum. We wanted to check if Mohammed is free next Thursday afternoon for a panel.' },
        { time: '00:05.7', speaker: 'GUARD', type: 'system', text: 'Calendar read/write is unmounted in Public Desk Lane. Capturing structured inquiry without confirming availability.' },
        { time: '00:06.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Thanks Priya. I do not have access to his live calendar on this line, but I will pass along the Systems Builders Forum panel invite for next Thursday afternoon. What is the best email or time for him to follow up?' },
        { time: '00:15.4', speaker: 'SUMMARY', type: 'system', text: 'Structured note delivered to owner inbox: "Priya (Systems Builders Forum) — panel invite next Thu PM, follow-up requested."' }
      ],
      ml: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00088 -> Public Desk Lane (0 tools). Language mode: Malayalam (ml).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Namaskaram, ithu Mohammed KM-inte assistant desk aanu. Addeham ippol available alla. Oru message edukkamo?' },
        { time: '00:05.2', speaker: 'CALLER', type: 'caller', text: 'Systems Builders Forum-il ninnu Priya aanu. Adutha vyazhazhcha oru panel talk-inu samayam undo?' },
        { time: '00:06.1', speaker: 'ASSISTANT', type: 'assistant', text: 'Nanni Priya. Ee line-il live calendar check cheyyan kazhiyilla. Njan ee panel invitation Mohammed-inu kaiyaram. Thirichu contact cheyyanulla email parayamo?' }
      ],
      hi: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00088 -> Public Desk Lane (0 tools). Language mode: Hindi (hi).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Namaste, yeh Mohammed KM ka assistant desk hai. Woh abhi uplabdh nahi hain. Kya main aapka sandesh note kar loon?' },
        { time: '00:05.1', speaker: 'CALLER', type: 'caller', text: 'Main Systems Builders Forum se Priya bol rahi hoon. Agle guruvar panel ke liye unki availability jaanni thi.' },
        { time: '00:06.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Dhanyavaad Priya. Is line par live calendar uplabdh nahi hai, par main agle guruvar ke panel ka sandesh Mohammed tak pahuncha dunga. Follow-up ke liye aapka email kya hai?' }
      ],
      kn: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00088 -> Public Desk Lane (0 tools). Language mode: Kannada (kn).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Namaskara, idu Mohammed KM avara assistant desk. Avaru eega labhyavilla. Sandesha tegedukollale?' },
        { time: '00:05.0', speaker: 'CALLER', type: 'caller', text: 'Systems Builders Forum-ninda Priya. Mundina guruvara panel session-ge avaru free iddara?' },
        { time: '00:05.9', speaker: 'ASSISTANT', type: 'assistant', text: 'Dhanyavadagalu Priya. Ee line-alli live calendar nodalu aguvudilla, aadare ee panel ahvanavannu Mohammed avarige talupisuttene. Nimma email tilisuvira?' }
      ],
      ta: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 90000 00088 -> Public Desk Lane (0 tools). Language mode: Tamil (ta).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Vanakkam, idhu Mohammed KM-in assistant desk. Avar ippozhudhu kidaikkavillai. Oru seidhi edukkattuma?' },
        { time: '00:05.0', speaker: 'CALLER', type: 'caller', text: 'Systems Builders Forum-il irundhu Priya pesugiren. Adutha viyazhan panel-ku avar free-a?' },
        { time: '00:05.9', speaker: 'ASSISTANT', type: 'assistant', text: 'Nandri Priya. Indha line-il live calendar parka mudiyadhu, aanal indha panel azhaippai Mohammed-ku anuppugiren. Thodarbu kolla ungal email sollungal.' }
      ]
    }
  },
  {
    id: 'spam',
    label: 'Spam / Telemarketer',
    tone: 'crimson',
    callerId: '+91 14000 00099 (Telemarketing Prefix / Unrecognized)',
    lane: 'PUBLIC DESK -> FAST TERMINATE',
    executionPolicy: 'NONE (Zero Tools + Early Hangup Guard)',
    maxVoiceBudget: 'Hard 1-turn decline (< 12s to save TTS & minutes)',
    multilingual: false,
    allowedData: [
      'Single pre-cached decline phrase (0 ElevenLabs synthesis cost)',
      'Silent log entry (caller ID + classification only, no owner ping)'
    ],
    blockedFields: [
      'Zero personal information or confirmation of owner identity',
      'No conversational loop or open-ended LLM turns',
      'No Telegram notification noise sent to owner',
      'All execution tools and memory files physically absent'
    ],
    transcripts: {
      en: [
        { time: '00:00.2', speaker: 'ROUTER', type: 'system', text: 'Caller-ID +91 14000 00099 not in allowlist. Binding Public Desk Lane (0 tools).' },
        { time: '00:01.0', speaker: 'ASSISTANT', type: 'assistant', text: 'Hello, this is the assistant desk. How can I help?' },
        { time: '00:03.9', speaker: 'CALLER', type: 'caller', text: 'Congratulations! You have been pre-approved for a zero-fee credit card upgrade and personal loan offer...' },
        { time: '00:04.4', speaker: 'GUARD', type: 'system', text: 'Classified as promotional solicitation. Triggering cached ulaw_8000 decline clip (0 TTS tokens) and immediate hangup.' },
        { time: '00:04.6', speaker: 'ASSISTANT', type: 'assistant', text: 'Thank you, we are not interested in promotional offers. Goodbye.' },
        { time: '00:07.8', speaker: 'BRIDGE', type: 'system', text: 'Plivo WebSocket closed cleanly at 7.8s. Owner notification suppressed; total incremental cost < $0.002.' }
      ]
    }
  }
];

export const COST_ROWS = [
  {
    layer: 'Reasoning & Coding Harnesses',
    implementation: 'Multi-harness CLI waterfall over existing flat-rate subscriptions',
    costTag: '$0 incremental',
    costTone: 'emerald',
    discipline:
      'Zero per-token API metering. Routine lookups resolve in 2.0s via local Markdown search; deeper work cascades across flat-rate CLIs without runaway token bills.'
  },
  {
    layer: 'Telephony DID & PSTN Minutes',
    implementation: 'Plivo Indian/Global DID + native ulaw_8000 WebSocket stream',
    costTag: '$2.50/mo + ~$0.0085/min',
    costTone: 'amber',
    discipline:
      'Single DID serves both Owner and Public Desk. Spam calls terminate in <12s and complex owner tasks detach to Telegram at 16s so PSTN minutes stay minimal.'
  },
  {
    layer: 'Voice Synthesis (TTS)',
    implementation: 'ElevenLabs streaming in native ulaw_8000 format',
    costTag: 'Usage-capped',
    costTone: 'amber',
    discipline:
      'Three hard efficiency guards: 45-word per-turn response cap, pre-cached ulaw_8000 clips for greetings/declines, and instant barge-in cancellation on caller interruption.'
  },
  {
    layer: 'Cloud Hosting & Memory Store',
    implementation: 'Co-located on existing always-on Linux VPS + plain Markdown synced via Drive',
    costTag: '0 INR extra',
    costTone: 'emerald',
    discipline:
      'No managed vector database, no serverless cold-start fees, and no separate voice-platform SaaS subscription. Plain files stay portable across any machine.'
  },
  {
    layer: 'Async Overflow & Approval Gate',
    implementation: 'Telegram Bot API for >16s task completion & owner approvals',
    costTag: '$0 / mo',
    costTone: 'emerald',
    discipline:
      'Moves long-running research, code edits, and structured call summaries off metered voice minutes onto free, searchable text threads.'
  }
];

export const STARTER_FILES = [
  {
    path: 'mkm-starter/',
    isFolder: true,
    note: 'portable workspace root'
  },
  {
    path: '  memory/main.md',
    isFolder: false,
    note: 'owner fast-path index',
    content: `# Owner Memory Index (Synthetic Template)
# Loaded ONLY inside the verified Owner Lane.

## Active Focus
- Voice Bridge: Plivo ulaw_8000 stream + 16s Telegram handoff
- Weekly cadence: review open tasks every Sunday evening

## Routing Map
- Projects: projects/<slug>/current.md
- Public profile (safe to expose): memory/public-profile.md`
  },
  {
    path: '  memory/public-profile.md',
    isFolder: false,
    note: 'read-only public desk bio',
    content: `# Public Desk Profile (Safe Read-Only Scope)
# The ONLY file mounted in the Public Desk Lane.

- Owner: Mohammed KM
- Availability: Currently unavailable to answer live calls
- Delivery policy: Standard parcels go to main gate security desk
- Never disclose: apartment unit, private email, live calendar, OTPs
- Languages supported: English, Malayalam, Hindi, Kannada, Tamil`
  },
  {
    path: '  lanes/router.js',
    isFolder: false,
    note: 'deterministic E.164 gate',
    content: `// Deterministic Caller-ID Lane Router
// Enforced in code before any prompt or tool registry is loaded.

const OWNER_ALLOWLIST = new Set(
  (process.env.OWNER_E164_ALLOWLIST || '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)
);

export function resolveLane(callerE164) {
  const normalized = String(callerE164 || '').replace(/[^+\\d]/g, '');
  if (normalized && OWNER_ALLOWLIST.has(normalized)) {
    return { lane: 'owner', toolsEnabled: true, voiceCutoffMs: 16000 };
  }
  return { lane: 'public-desk', toolsEnabled: false, voiceCutoffMs: 12000 };
}`
  },
  {
    path: '  voice-bridge/server.js',
    isFolder: false,
    note: 'Plivo ulaw_8000 WS server',
    content: `// Minimal Plivo ulaw_8000 WebSocket Voice Bridge
import { resolveLane } from '../lanes/router.js';

export function onStreamStart(meta) {
  const route = resolveLane(meta.fromE164);

  return {
    codec: 'audio/x-mulaw',
    sampleRate: 8000,
    lane: route.lane,
    maxWordsPerTurn: 45,
    handoffChannel: route.lane === 'owner' ? 'telegram' : 'summary-queue',
    tools: route.toolsEnabled ? ['markdown_recall', 'cli_waterfall'] : []
  };
}`
  },
  {
    path: '  config/.env.example',
    isFolder: false,
    note: 'sanitized env template',
    content: `# Copy to .env and fill with your own credentials
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_DID=+910000000000

# Comma-separated E.164 numbers allowed into Owner Lane
OWNER_E164_ALLOWLIST=+919000000001

# ElevenLabs (ulaw_8000 output mode)
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_voice_id

# Telegram async handoff target
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_OWNER_CHAT_ID=your_numeric_chat_id`
  }
];

export const SETUP_STEPS = [
  {
    num: 'STEP 01',
    title: 'Initialize the Plain-Text Markdown Brain',
    desc: 'Create separate directories for private owner memory and the single read-only public profile. Keep everything in versionable Markdown with zero database dependencies.',
    cmd: 'mkdir -p mkm-starter/{memory,lanes,voice-bridge,config} && cp config/.env.example .env'
  },
  {
    num: 'STEP 02',
    title: 'Lock the Caller-ID Allowlist Boundary',
    desc: 'Populate OWNER_E164_ALLOWLIST in .env with your verified E.164 number. Confirm that unknown callers resolve to toolsEnabled: false before starting the bridge.',
    cmd: 'node -e "import(\'./lanes/router.js\').then(m => console.log(m.resolveLane(\'+919000000099\')))"'
  },
  {
    num: 'STEP 03',
    title: 'Point Plivo DID to Native ulaw_8000 Stream',
    desc: 'Configure your Plivo Answer URL to return a <Stream> XML directive with contentType="audio/x-mulaw;rate=8000" pointing to your HTTPS/WSS bridge endpoint.',
    cmd: 'curl -s https://your-domain.example/voice/answer | grep "audio/x-mulaw;rate=8000"'
  },
  {
    num: 'STEP 04',
    title: 'Wire CLI Waterfall & 16s Telegram Handoff',
    desc: 'Connect your local flat-rate CLI harnesses behind a 2.0s Markdown fast-path. Any owner request exceeding 16s acknowledges by voice and completes asynchronously in Telegram.',
    cmd: 'node voice-bridge/server.js --fast-path-ms=2000 --handoff-ms=16000'
  },
  {
    num: 'STEP 05',
    title: 'Verify Isolation & Cached TTS Guards',
    desc: 'Run a dry-run test across Owner, Delivery, Networking, and Spam profiles to assert zero tool leakage, 45-word turn caps, and pre-cached decline clips.',
    cmd: 'npm run verify:lanes && npm run verify:tts-cache'
  }
];
