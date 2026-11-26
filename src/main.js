import {
  ARCHITECTURE_NODES,
  CALLER_SCENARIOS,
  COST_ROWS,
  STARTER_FILES,
  SETUP_STEPS
} from './data/blueprintData.js';

const state = {
  selectedNodeId: 'router',
  activeTrace: 'all',
  selectedCallerId: 'owner',
  selectedLang: 'en',
  monthlyCalls: 60,
  avgMinutes: 2.0,
  selectedFilePath: '  lanes/router.js'
};

const LANG_LABELS = [
  { code: 'en', label: 'EN' },
  { code: 'ml', label: 'ML' },
  { code: 'hi', label: 'HI' },
  { code: 'kn', label: 'KN' },
  { code: 'ta', label: 'TA' }
];

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatClock(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/* -------------------------------------------
   Reading Progress Indicator
------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    bar.style.width = `${pct.toFixed(1)}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* -------------------------------------------
   Section 1B: Cloned Voice Desk Audio Player
------------------------------------------- */
function initVoicePlayer() {
  const audio = document.getElementById('voice-demo-audio');
  const card = document.getElementById('voice-player-card');
  const playBtn = document.getElementById('voice-play-btn');
  const track = document.getElementById('voice-progress-track');
  const fill = document.getElementById('voice-progress-fill');
  const currentEl = document.getElementById('voice-time-current');
  const durationEl = document.getElementById('voice-time-duration');
  const statusEl = document.getElementById('voice-status-badge');

  if (!audio || !card || !playBtn || !track || !fill || !currentEl || !durationEl || !statusEl) {
    return;
  }

  let rafId = null;

  const syncProgress = () => {
    const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const cur = audio.currentTime || 0;
    const pct = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;

    fill.style.width = `${pct.toFixed(2)}%`;
    track.setAttribute('aria-valuenow', String(Math.round(pct)));
    currentEl.textContent = formatClock(cur);
    if (dur > 0) {
      durationEl.textContent = formatClock(dur);
    }
  };

  const tick = () => {
    syncProgress();
    if (!audio.paused && !audio.ended) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  };

  const setPlayingUI = (playing, label) => {
    card.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-pressed', String(playing));
    playBtn.setAttribute(
      'aria-label',
      playing ? 'Pause cloned voice desk greeting' : 'Play cloned voice desk greeting'
    );
    statusEl.textContent = label || (playing ? 'PLAYING' : 'READY');
  };

  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      durationEl.textContent = formatClock(audio.duration);
    }
    syncProgress();
  });

  audio.addEventListener('play', () => {
    setPlayingUI(true, 'PLAYING');
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  });

  audio.addEventListener('pause', () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    const isAtStart = audio.currentTime <= 0.05;
    setPlayingUI(false, isAtStart ? 'READY' : 'PAUSED');
    syncProgress();
  });

  audio.addEventListener('ended', () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    fill.style.width = '100%';
    track.setAttribute('aria-valuenow', '100');
    setPlayingUI(false, 'REPLAY');
    setTimeout(() => {
      if (audio.paused && audio.ended) {
        audio.currentTime = 0;
        syncProgress();
        statusEl.textContent = 'READY';
      }
    }, 900);
  });

  audio.addEventListener('error', () => {
    setPlayingUI(false, 'UNAVAILABLE');
  });

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      audio.play().catch(() => {
        setPlayingUI(false, 'READY');
      });
    } else {
      audio.pause();
    }
  });

  const seekByFraction = (fraction) => {
    const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    if (!dur) return;
    const clamped = Math.min(1, Math.max(0, fraction));
    audio.currentTime = clamped * dur;
    syncProgress();
  };

  track.addEventListener('click', (e) => {
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    seekByFraction((e.clientX - rect.left) / rect.width);
  });

  track.addEventListener('keydown', (e) => {
    const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    if (!dur) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekByFraction((audio.currentTime + 1) / dur);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekByFraction((audio.currentTime - 1) / dur);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      playBtn.click();
    }
  });
}

/* -------------------------------------------
   Section 2: Interactive Architecture Diagram
------------------------------------------- */
function isNodeActiveInTrace(node) {
  if (state.activeTrace === 'all') return true;
  if (node.lane === 'shared') return true;
  return node.lane === state.activeTrace;
}

function renderNodeCard(node) {
  const isSelected = state.selectedNodeId === node.id;
  const isDimmed = !isNodeActiveInTrace(node);
  const laneClass = node.lane === 'public' ? 'lane-public' : '';

  const subListHtml = node.subItems
    ? `<ul class="node-sublist">${node.subItems.map((item) => `<li>&mdash; ${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';

  return `
    <button
      type="button"
      class="arch-node ${laneClass} ${isSelected ? 'is-selected' : ''} ${isDimmed ? 'is-dimmed' : ''}"
      data-node-id="${node.id}"
      aria-pressed="${isSelected}"
    >
      <div class="node-top">
        <span class="node-step">${escapeHtml(node.step)}</span>
        <span class="node-badge ${node.badgeTone}">${escapeHtml(node.badge)}</span>
      </div>
      <h3 class="node-title">${escapeHtml(node.title)}</h3>
      <p class="node-sub">${escapeHtml(node.shortSub)}</p>
      ${subListHtml}
    </button>
  `;
}

function renderArchitecture() {
  const canvas = document.getElementById('arch-canvas');
  if (!canvas) return;

  const plivo = ARCHITECTURE_NODES.find((n) => n.id === 'plivo');
  const bridge = ARCHITECTURE_NODES.find((n) => n.id === 'bridge');
  const router = ARCHITECTURE_NODES.find((n) => n.id === 'router');
  const owner = ARCHITECTURE_NODES.find((n) => n.id === 'owner');
  const pub = ARCHITECTURE_NODES.find((n) => n.id === 'public');

  const ownerStroke = state.activeTrace === 'public' ? 'rgba(244,242,237,0.12)' : '#d99b43';
  const publicStroke = state.activeTrace === 'owner' ? 'rgba(244,242,237,0.12)' : '#3fa67b';
  const spineStroke = state.activeTrace === 'public' ? '#3fa67b' : '#d99b43';

  canvas.innerHTML = `
    <div class="arch-spine">
      ${renderNodeCard(plivo)}
      <svg class="arch-connector-svg" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true">
        <line x1="100" y1="0" x2="100" y2="28" stroke="${spineStroke}" stroke-width="1.5" stroke-opacity="0.7" />
        <polygon points="96,26 104,26 100,33" fill="${spineStroke}" fill-opacity="0.85" />
      </svg>

      ${renderNodeCard(bridge)}
      <svg class="arch-connector-svg" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true">
        <line x1="100" y1="0" x2="100" y2="28" stroke="${spineStroke}" stroke-width="1.5" stroke-opacity="0.7" />
        <polygon points="96,26 104,26 100,33" fill="${spineStroke}" fill-opacity="0.85" />
      </svg>

      ${renderNodeCard(router)}
      <svg class="arch-split-svg" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 200 0 L 200 20 L 100 20 L 100 42" fill="none" stroke="${ownerStroke}" stroke-width="1.5" />
        <polygon points="96,40 104,40 100,47" fill="${ownerStroke}" />
        <path d="M 200 0 L 200 20 L 300 20 L 300 42" fill="none" stroke="${publicStroke}" stroke-width="1.5" />
        <polygon points="296,40 304,40 300,47" fill="${publicStroke}" />
      </svg>

      <div class="arch-branches">
        ${renderNodeCard(owner)}
        ${renderNodeCard(pub)}
      </div>
    </div>
  `;

  canvas.querySelectorAll('[data-node-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedNodeId = btn.dataset.nodeId;
      renderArchitecture();
      renderInspector();
    });
  });
}

function renderInspector() {
  const panel = document.getElementById('node-inspector');
  if (!panel) return;

  const node = ARCHITECTURE_NODES.find((n) => n.id === state.selectedNodeId) || ARCHITECTURE_NODES[0];

  const barSegments = node.latencyBudget.segments
    .map(
      (seg) =>
        `<div class="latency-seg" style="width:${seg.pct}%;background:${seg.color}" title="${escapeHtml(seg.label)}: ${seg.ms}ms"></div>`
    )
    .join('');

  const legendRows = node.latencyBudget.segments
    .map(
      (seg) =>
        `<div class="latency-row"><span>${escapeHtml(seg.label)}</span><span>${seg.ms} ms</span></div>`
    )
    .join('');

  panel.innerHTML = `
    <div class="inspector-header">
      <div class="mono-label">${escapeHtml(node.step)} &middot; NODE SPECIFICATION</div>
      <h3 class="inspector-title">${escapeHtml(node.title)}</h3>
      <div class="inspector-proto">${escapeHtml(node.protocol)}</div>
    </div>

    <div class="inspector-block">
      <h4>Engineering Trade-Offs</h4>
      <ul class="inspector-list">
        ${node.tradeoffs.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>

    <div class="inspector-block">
      <h4>Latency Budget &mdash; ${escapeHtml(node.latencyBudget.total)}</h4>
      <div class="latency-bar-wrap">
        <div class="latency-track">${barSegments}</div>
        <div class="latency-legend">${legendRows}</div>
      </div>
    </div>

    <div class="inspector-block">
      <h4>Security Invariant</h4>
      <div class="invariant-box ${node.invariantTone}">${escapeHtml(node.invariant)}</div>
    </div>
  `;
}

function initTraceChips() {
  document.querySelectorAll('[data-trace]').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.activeTrace = chip.dataset.trace;
      document.querySelectorAll('[data-trace]').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');

      if (state.activeTrace === 'owner' && state.selectedNodeId === 'public') {
        state.selectedNodeId = 'owner';
      } else if (state.activeTrace === 'public' && state.selectedNodeId === 'owner') {
        state.selectedNodeId = 'public';
      }

      renderArchitecture();
      renderInspector();
    });
  });
}

/* -------------------------------------------
   Section 3: Public vs Private Permission Simulator
------------------------------------------- */
function renderSimulator() {
  const tabsEl = document.getElementById('caller-tabs');
  const langWrap = document.getElementById('lang-selector-wrap');
  const outEl = document.getElementById('simulator-output');
  if (!tabsEl || !langWrap || !outEl) return;

  const active = CALLER_SCENARIOS.find((c) => c.id === state.selectedCallerId) || CALLER_SCENARIOS[0];
  if (!active.multilingual) {
    state.selectedLang = 'en';
  }

  tabsEl.innerHTML = CALLER_SCENARIOS.map(
    (scenario) => `
      <button
        type="button"
        role="tab"
        aria-selected="${scenario.id === active.id}"
        class="sim-tab ${scenario.id === active.id ? 'is-active' : ''}"
        data-caller-id="${scenario.id}"
      >
        <span class="dot ${scenario.tone}" aria-hidden="true"></span>
        <span>${escapeHtml(scenario.label)}</span>
      </button>
    `
  ).join('');

  tabsEl.querySelectorAll('[data-caller-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedCallerId = btn.dataset.callerId;
      renderSimulator();
    });
  });

  if (active.multilingual) {
    langWrap.innerHTML = `
      <span class="mono-label">PUBLIC DESK LANG</span>
      ${LANG_LABELS.map(
        (l) => `
          <button
            type="button"
            class="lang-pill ${state.selectedLang === l.code ? 'is-active' : ''}"
            data-lang="${l.code}"
          >${l.label}</button>
        `
      ).join('')}
    `;

    langWrap.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedLang = btn.dataset.lang;
        renderSimulator();
      });
    });
  } else {
    langWrap.innerHTML = `<span class="mono-label">LANGUAGE: ENGLISH (DEFAULT)</span>`;
  }

  const transcript = active.transcripts[state.selectedLang] || active.transcripts.en;

  outEl.innerHTML = `
    <div class="sim-card">
      <div class="lane-banner ${active.tone}">
        <span class="lane-name">${escapeHtml(active.lane)}</span>
        <span class="lane-caller-id">${escapeHtml(active.callerId)}</span>
      </div>

      <div class="sim-meta-grid">
        <div class="sim-meta-box">
          <div class="mono-label">EXECUTION POLICY</div>
          <div class="sim-meta-val">${escapeHtml(active.executionPolicy)}</div>
        </div>
        <div class="sim-meta-box">
          <div class="mono-label">VOICE TIME BUDGET</div>
          <div class="sim-meta-val">${escapeHtml(active.maxVoiceBudget)}</div>
        </div>
      </div>

      <div class="perm-columns">
        <div class="perm-list-box allowed">
          <div class="mono-label">ALLOWED DATA &amp; SCOPE</div>
          <ul class="perm-list">
            ${active.allowedData
              .map(
                (item) =>
                  `<li><span class="perm-marker allow" aria-hidden="true">+</span><span>${escapeHtml(item)}</span></li>`
              )
              .join('')}
          </ul>
        </div>
        <div class="perm-list-box blocked">
          <div class="mono-label">HARD-BLOCKED FIELDS</div>
          <ul class="perm-list">
            ${active.blockedFields
              .map(
                (item) =>
                  `<li><span class="perm-marker block" aria-hidden="true">x</span><span>${escapeHtml(item)}</span></li>`
              )
              .join('')}
          </ul>
        </div>
      </div>
    </div>

    <div class="sim-card">
      <div class="transcript-head">
        <div>
          <div class="mono-label">SIMULATED CALL TRANSCRIPT</div>
        </div>
        <div class="mono-label">${active.id === 'owner' ? 'OWNER CONTEXT' : 'ZERO-TOOL SANDBOX'}</div>
      </div>

      <div class="transcript-feed">
        ${transcript
          .map((turn) => {
            const roleClass =
              turn.type === 'system'
                ? 'system'
                : turn.type === 'assistant'
                ? `assistant ${active.id === 'owner' ? 'owner' : ''}`
                : 'caller';
            return `
              <div class="t-turn">
                <div class="t-time">${escapeHtml(turn.time)}</div>
                <div class="t-body ${roleClass}">
                  <div class="t-speaker">${escapeHtml(turn.speaker)}</div>
                  <div class="t-text">${escapeHtml(turn.text)}</div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

/* -------------------------------------------
   Section 4: Cost & Token Discipline
------------------------------------------- */
function renderCostTable() {
  const tbody = document.getElementById('cost-table-body');
  if (!tbody) return;

  tbody.innerHTML = COST_ROWS.map(
    (row) => `
      <tr>
        <td class="cost-layer">${escapeHtml(row.layer)}</td>
        <td>${escapeHtml(row.implementation)}</td>
        <td><span class="cost-tag ${row.costTone}">${escapeHtml(row.costTag)}</span></td>
        <td>${escapeHtml(row.discipline)}</td>
      </tr>
    `
  ).join('');
}

function updateEstimator() {
  const callsVal = document.getElementById('calls-val');
  const minsVal = document.getElementById('minutes-val');
  const summaryEl = document.getElementById('estimator-summary');
  if (!callsVal || !minsVal || !summaryEl) return;

  const totalMins = state.monthlyCalls * state.avgMinutes;

  const plivoFixed = 2.5;
  const plivoUsage = totalMins * 0.0085;
  const guardedTts = totalMins * 0.015;
  const blueprintMonthly = plivoFixed + plivoUsage + guardedTts;

  const meteredStack = 15.0 + totalMins * 0.14;
  const savingsPct = Math.round(((meteredStack - blueprintMonthly) / meteredStack) * 100);

  callsVal.textContent = `${state.monthlyCalls} calls`;
  minsVal.textContent = `${state.avgMinutes.toFixed(1)} min`;

  summaryEl.innerHTML = `
    <div class="est-stat">
      <span class="mono-label">DIGITAL BRAIN EST.</span>
      <span class="est-num accent-emerald">$${blueprintMonthly.toFixed(2)}<span style="font-size:14px;color:var(--ink-muted)">/mo</span></span>
    </div>
    <div class="est-stat">
      <span class="mono-label">METERED API STACK</span>
      <span class="est-num accent-amber">$${meteredStack.toFixed(2)}<span style="font-size:14px;color:var(--ink-muted)">/mo</span></span>
    </div>
    <div class="est-stat">
      <span class="mono-label">AVOIDED DRIFT</span>
      <span class="est-num">${savingsPct}%</span>
    </div>
  `;
}

function initEstimator() {
  const callsSlider = document.getElementById('calls-slider');
  const minsSlider = document.getElementById('minutes-slider');

  if (callsSlider) {
    callsSlider.addEventListener('input', (e) => {
      state.monthlyCalls = Number(e.target.value);
      updateEstimator();
    });
  }
  if (minsSlider) {
    minsSlider.addEventListener('input', (e) => {
      state.avgMinutes = Number(e.target.value);
      updateEstimator();
    });
  }

  updateEstimator();
}

/* -------------------------------------------
   Section 5: Open-Source Starter Blueprint
------------------------------------------- */
function renderStarterBlueprint() {
  const treeEl = document.getElementById('file-tree');
  const filenameEl = document.getElementById('preview-filename');
  const codeEl = document.getElementById('preview-code');
  const copyPreviewBtn = document.getElementById('copy-preview-btn');
  const stepsEl = document.getElementById('setup-steps');

  if (!treeEl || !filenameEl || !codeEl || !stepsEl) return;

  const selectedFile =
    STARTER_FILES.find((f) => f.path === state.selectedFilePath && !f.isFolder) ||
    STARTER_FILES.find((f) => !f.isFolder);

  treeEl.innerHTML = STARTER_FILES.map((item) => {
    if (item.isFolder) {
      return `
        <div class="tree-item is-folder" role="treeitem">
          <span>${escapeHtml(item.path)}</span>
          <span class="tree-note">${escapeHtml(item.note)}</span>
        </div>
      `;
    }
    const isSel = item.path === selectedFile.path;
    return `
      <button
        type="button"
        role="treeitem"
        aria-selected="${isSel}"
        class="tree-item ${isSel ? 'is-selected' : ''}"
        data-file-path="${escapeHtml(item.path)}"
      >
        <span>${escapeHtml(item.path)}</span>
        <span class="tree-note">${escapeHtml(item.note)}</span>
      </button>
    `;
  }).join('');

  treeEl.querySelectorAll('[data-file-path]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedFilePath = btn.dataset.filePath;
      renderStarterBlueprint();
    });
  });

  filenameEl.textContent = `digital-brain/${selectedFile.path.trim()}`;
  codeEl.textContent = selectedFile.content;

  if (copyPreviewBtn) {
    copyPreviewBtn.onclick = () => copyText(selectedFile.content, copyPreviewBtn);
  }

  stepsEl.innerHTML = SETUP_STEPS.map(
    (step, idx) => `
      <article class="step-card">
        <div class="step-top">
          <span class="step-num">${escapeHtml(step.num)}</span>
        </div>
        <h3 class="step-title">${escapeHtml(step.title)}</h3>
        <p class="step-desc">${escapeHtml(step.desc)}</p>
        <div class="step-cmd">
          <code>${escapeHtml(step.cmd)}</code>
          <button type="button" class="copy-btn" data-copy-step="${idx}">Copy</button>
        </div>
      </article>
    `
  ).join('');

  stepsEl.querySelectorAll('[data-copy-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.copyStep);
      copyText(SETUP_STEPS[idx].cmd, btn);
    });
  });
}

function copyText(text, button) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const original = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = original;
      }, 1400);
    });
  }
}

/* -------------------------------------------
   Bootstrap
------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initVoicePlayer();
  initTraceChips();
  renderArchitecture();
  renderInspector();
  renderSimulator();
  renderCostTable();
  initEstimator();
  renderStarterBlueprint();
});
