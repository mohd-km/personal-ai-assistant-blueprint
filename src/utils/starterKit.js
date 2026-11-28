/**
 * Custom Blueprint Generator & Zero-Dependency Client-Side ZIP Exporter
 * Generates customized AGENTS.md + config.json + memory/main.md starter kits.
 */

const CHANNEL_META = {
  telegram: {
    name: 'Telegram',
    role: 'text chat, short cards with the detail one tap away, and approval buttons',
    config: {
      enabled: true,
      mode: 'bot_polling',
      format: 'heading_plus_bullets_under_80_words',
      expandable_detail: true,
      approval_reply_prefix: 'approve'
    }
  },
  voice: {
    name: 'Phone line',
    role: 'calls from your own number open the private lane, and every other caller gets a receptionist with no tools',
    config: {
      enabled: true,
      owner_lane: 'trusted_number_plus_spoken_password',
      guest_lane_tools: [],
      max_call_minutes: 30,
      quiet_mode_during_calls: true
    }
  },
  email: {
    name: 'Email',
    role: 'mail from your own verified addresses runs as a task, and the answer comes back on Telegram',
    config: {
      enabled: true,
      accept_from: 'owner_verified_addresses_only',
      public_port: false
    }
  },
  webapps: {
    name: 'Private web apps',
    role: 'small personal apps that open only after a Google sign-in with your own account',
    config: {
      enabled: true,
      sign_in: 'google_owner_accounts_only',
      session_days: 30
    }
  }
};

const STORAGE_META = {
  drive: {
    name: 'Google Drive',
    busRule: 'Google Drive is the single file transport bus between laptop and cloud nodes.',
    config: {
      primary_bus: 'google_drive',
      root_folder: 'digital-brain',
      sync_interval_seconds: 60,
      conflict_policy: 'in_place_canonical_edit'
    }
  },
  git: {
    name: 'Git Repository',
    busRule: 'Git is the single versioned transport bus. Commit every material memory update as its own clean commit.',
    config: {
      primary_bus: 'git',
      branch: 'main',
      auto_pull_before_run: true,
      conflict_policy: 'rebase_and_verify'
    }
  },
  hybrid: {
    name: 'Google Drive + Git',
    busRule: 'Google Drive handles live cross-device sync while Git records daily auditable snapshots.',
    config: {
      primary_bus: 'google_drive',
      snapshot_mirror: 'git',
      sync_interval_seconds: 60,
      daily_commit_snapshot: true
    }
  }
};

const MODEL_META = {
  gemini: {
    name: 'Gemini',
    provider: 'google',
    runs_through: 'antigravity',
    billing: 'flat_rate_subscription',
    strengths: ['fast_answers', 'research', 'everyday_tasks']
  },
  codex: {
    name: 'Codex',
    provider: 'openai',
    billing: 'flat_rate_subscription',
    strengths: ['builds', 'checks', 'long_background_jobs']
  },
  claude: {
    name: 'Claude',
    provider: 'anthropic',
    billing: 'flat_rate_subscription',
    strengths: ['writing', 'planning', 'careful_reasoning']
  }
};

export function normalizeBlueprintConfig(raw) {
  const channels = (raw.channels || []).filter((id) => CHANNEL_META[id]);
  const models = (raw.models || []).filter((id) => MODEL_META[id]);
  const storage = STORAGE_META[raw.storage] ? raw.storage : 'drive';

  return {
    ownerName: (raw.ownerName || 'Owner').trim() || 'Owner',
    channels: channels.length > 0 ? channels : ['telegram'],
    storage,
    models: models.length > 0 ? models : ['gemini'],
    approvalGate: raw.approvalGate !== false
  };
}

export function generateAgentsMd(rawConfig) {
  const cfg = normalizeBlueprintConfig(rawConfig);
  const storageInfo = STORAGE_META[cfg.storage];
  const channelLines = cfg.channels
    .map((id) => `- **${CHANNEL_META[id].name}**: ${CHANNEL_META[id].role}.`)
    .join('\n');
  const modelWaterfall = cfg.models
    .map((id, idx) => `${idx + 1}. **${MODEL_META[id].name}** (${MODEL_META[id].strengths.join(', ')})`)
    .join('\n');
  const gateRule = cfg.approvalGate
    ? 'Money, publishing and anything that reaches another person (email, message, outside request) MUST pause at the Approval Gate until the owner taps approve. Everything else runs without asking, so the gate stays fast and worth reading.'
    : 'Outward actions require explicit inline confirmation in the active session before firing.';

  return `# Digital Brain: Shared Agent Rules (AGENTS.md)

Owner: ${cfg.ownerName}
Storage Bus: ${storageInfo.name}
Approval Gate: ${cfg.approvalGate ? 'Enabled (strict outward lock)' : 'Session confirmation'}

## 1. Startup Sequence

1. Read \`memory/main.md\` and \`memory/handover/now.md\` before asking ${cfg.ownerName} to repeat context.
2. Edit the existing Markdown card in place. Never create duplicate or timestamped copies.
3. Log every material action as one line in \`execution-trail/recent.md\`.

## 2. Storage & Sync Bus

- ${storageInfo.busRule}
- Keep all durable facts inside the five plain-English folders: \`rules/\`, \`memory-cards/\`, \`lessons-learned/\`, \`playbooks/\`, and \`execution-trail/\`.

## 3. Model Failover Waterfall

Every assistant below reads the same folder and runs on a flat-rate plan, so switching adds $0 in pay-per-use (API) charges:

${modelWaterfall}

If the active assistant is offline or at its usage limit, route to the next available assistant in order. The notes are shared, so nothing is lost. Warn the owner once when an engine is close to its limit, and skip an engine at its limit until it resets.

## 4. Channels & Safety Gate

${channelLines}
- **Safety Gate:** ${gateRule}
- Private note updates and read-only lookups run automatically.

## 5. Where Work Runs

- Long or heavy jobs are handed to the always-on cloud computer as their own background process, so the laptop can be closed at any time.
- Hand over the conversation and any recently changed files with the job. A job never starts another job.
- After every script edit, run a syntax check and that script's self-test before doing anything else.
- Keep at most two AI workers warm; clear idle ones when memory runs low.

## 6. Formatting & Restraint

- Plain English, concise answers, zero filler, zero emojis.
- Verify every script or build by running it before reporting done.
`;
}

export function generateConfigJson(rawConfig) {
  const cfg = normalizeBlueprintConfig(rawConfig);
  const channelsObj = {};
  cfg.channels.forEach((id) => {
    channelsObj[id] = CHANNEL_META[id].config;
  });

  const payload = {
    schema_version: '1.0.0',
    brain_name: 'digital-brain',
    owner: cfg.ownerName,
    storage: STORAGE_META[cfg.storage].config,
    channels: channelsObj,
    failover_waterfall: cfg.models.map((id, idx) => ({
      priority: idx + 1,
      id,
      name: MODEL_META[id].name,
      provider: MODEL_META[id].provider,
      billing: MODEL_META[id].billing,
      strengths: MODEL_META[id].strengths
    })),
    safety: {
      approval_gate: cfg.approvalGate,
      gated_actions: ['payment', 'publish', 'send_email', 'send_external_message', 'outside_request'],
      auto_allowed_actions: ['read_memory', 'update_private_card', 'research', 'append_execution_trail']
    },
    cloud: {
      always_on: true,
      handover_long_jobs: true,
      jobs_survive_restarts: true,
      self_test_after_script_edit: true,
      max_warm_workers: 2,
      engine_limit_warning: true
    },
    folders: [
      'rules/',
      'memory-cards/',
      'lessons-learned/',
      'playbooks/',
      'execution-trail/'
    ]
  };

  return JSON.stringify(payload, null, 2) + '\n';
}

export function generateMainMemoryMd(rawConfig) {
  const cfg = normalizeBlueprintConfig(rawConfig);
  return `# ${cfg.ownerName}: Memory Index (memory/main.md)

## Quick Routes
- Core rules: \`AGENTS.md\`
- Runtime config: \`config.json\`
- Personal facts: \`memory-cards/\`
- Repeatable recipes: \`playbooks/\`
- Corrections: \`lessons-learned/\`
- Action receipts: \`execution-trail/recent.md\`

## Active Stack
- Storage bus: ${STORAGE_META[cfg.storage].name}
- Channels: ${cfg.channels.map((id) => CHANNEL_META[id].name).join(', ')}
- Failover order: ${cfg.models.map((id) => MODEL_META[id].name).join(' -> ')}
- Long jobs: handed to the cloud computer; the laptop can be closed
`;
}

/* ---------------- ZERO-DEPENDENCY UNCOMPRESSED ZIP BUILDER ---------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function createZipBlob(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(content);
    const checksum = crc32(dataBytes);
    const size = dataBytes.length;

    // Local file header (30 bytes + filename)
    const localHeader = new ArrayBuffer(30);
    const lv = new DataView(localHeader);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 flag
    lv.setUint16(8, 0, true); // compression: store
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0x5421, true); // mod date
    lv.setUint32(14, checksum, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length

    localParts.push(new Uint8Array(localHeader), nameBytes, dataBytes);

    // Central directory header (46 bytes + filename)
    const centralHeader = new ArrayBuffer(46);
    const cv = new DataView(centralHeader);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0x0800, true); // UTF-8 flag
    cv.setUint16(10, 0, true); // store
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x5421, true);
    cv.setUint32(16, checksum, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);

    centralParts.push(new Uint8Array(centralHeader), nameBytes);
    offset += 30 + nameBytes.length + size;
  });

  const centralSize = centralParts.reduce((acc, part) => acc + part.length, 0);
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, new Uint8Array(eocd)], {
    type: 'application/zip'
  });
}

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
