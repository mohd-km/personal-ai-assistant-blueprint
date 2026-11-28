import {
  PIPELINE_NODES,
  COMMAND_SCENARIOS,
  FAILOVER_PROVIDERS,
  BRAIN_FOLDERS,
  BLUEPRINT_OPTIONS
} from './data/blueprintData.js';
import {
  generateAgentsMd,
  generateConfigJson,
  generateMainMemoryMd,
  createZipBlob,
  triggerDownload
} from './utils/starterKit.js';
import { initHandover } from './handover.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const state = {
  // Packet router state
  activeCommandId: COMMAND_SCENARIOS[0].id,
  selectedNodeId: PIPELINE_NODES[0].id,
  packetProgress: 0, // 0..4 (float along 5 nodes)
  currentHopIndex: 0, // 0..4
  approvalState: 'pending', // 'idle' | 'pending' | 'approved' | 'cancelled'
  speed: 1,
  rafId: null,
  lastFrameTs: 0,

  // Failover state
  providersOnline: {
    gemini: true,
    codex: true,
    claude: true
  },
  providersAtLimit: {
    gemini: false,
    codex: false,
    claude: false
  },

  // Blueprint generator state
  builder: {
    ownerName: 'Alex',
    channels: ['telegram', 'voice'],
    storage: 'drive',
    models: ['gemini', 'codex', 'claude'],
    approvalGate: true,
    activeTab: 'agents'
  },

  // 5-Folder explorer state
  activeFolderId: BRAIN_FOLDERS[0].id
};

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getActiveProvider() {
  return (
    FAILOVER_PROVIDERS.find((p) => state.providersOnline[p.id] && !state.providersAtLimit[p.id]) || null
  );
}

function getActiveScenario() {
  return COMMAND_SCENARIOS.find((c) => c.id === state.activeCommandId) || COMMAND_SCENARIOS[0];
}

/* ---------------- HEADER & PROGRESS ---------------- */

function initHeaderAndProgress() {
  const progressBar = document.getElementById('reading-progress');
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ---------------- SIMULATION 1: ANIMATED PACKET ROUTER ---------------- */

function stopPacketAnimation() {
  if (state.rafId !== null) {
    window.cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
}

function renderCommandButtons() {
  const container = document.getElementById('command-buttons');
  if (!container) return;

  container.innerHTML = COMMAND_SCENARIOS.map((item) => {
    const isActive = item.id === state.activeCommandId;
    return `
      <button
        type="button"
        class="command-btn ${isActive ? 'is-active' : ''}"
        data-command-id="${escapeHtml(item.id)}"
        aria-pressed="${isActive}"
      >
        <span class="command-cat">${escapeHtml(item.category)}</span>
        <span class="command-label">${escapeHtml(item.label)}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.command-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-command-id');
      if (id) runPacketSimulation(id);
    });
  });
}

function createSvgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  return el;
}

function getNodeStatus(nodeIndex) {
  const scenario = getActiveScenario();
  const reached = state.packetProgress >= nodeIndex - 0.02;
  const completed = state.packetProgress > nodeIndex + 0.05;

  if (nodeIndex === 4 && reached) {
    if (scenario.needsApproval && state.approvalState === 'pending') return 'is-paused';
    if (scenario.needsApproval && state.approvalState === 'cancelled') return 'is-blocked';
    return 'is-visited';
  }
  if (completed) return 'is-visited';
  if (reached) return 'is-current';
  return '';
}

function renderSvgPipeline() {
  const edgesGroup = document.getElementById('svg-edges');
  const nodesGroup = document.getElementById('svg-nodes');
  const packetGroup = document.getElementById('svg-packet');
  if (!edgesGroup || !nodesGroup || !packetGroup) return;

  const scenario = getActiveScenario();
  const activeProvider = getActiveProvider();

  // 1. Render connecting edges
  edgesGroup.innerHTML = '';
  for (let i = 0; i < PIPELINE_NODES.length - 1; i += 1) {
    const a = PIPELINE_NODES[i];
    const b = PIPELINE_NODES[i + 1];
    const x1 = a.x + 62;
    const x2 = b.x - 62;
    const y = a.y;

    edgesGroup.appendChild(
      createSvgEl('line', {
        x1,
        y1: y,
        x2,
        y2: y,
        class: 'svg-edge-bg'
      })
    );

    const edgeDone = state.packetProgress >= i + 1;
    const edgeActive = state.packetProgress > i && state.packetProgress < i + 1;
    const isCancelledFinal =
      i === 3 && scenario.needsApproval && state.approvalState === 'cancelled';

    if (edgeDone || edgeActive) {
      let cls = 'svg-edge-active';
      if (isCancelledFinal) cls = 'svg-edge-blocked';
      else if (edgeDone) cls = 'svg-edge-done';

      edgesGroup.appendChild(
        createSvgEl('line', {
          x1,
          y1: y,
          x2,
          y2: y,
          class: cls
        })
      );
    }

    // Small directional chevron at midpoint
    const midX = (x1 + x2) / 2;
    edgesGroup.appendChild(
      createSvgEl('path', {
        d: `M ${midX - 4} ${y - 4} L ${midX + 3} ${y} L ${midX - 4} ${y + 4}`,
        fill: 'none',
        stroke: edgeDone ? '#15803d' : edgeActive ? '#1e40af' : '#b8b8b2',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    );
  }

  // 2. Render clickable nodes
  nodesGroup.innerHTML = '';
  PIPELINE_NODES.forEach((node, idx) => {
    const statusClass = getNodeStatus(idx);
    const isSelected = node.id === state.selectedNodeId;
    const g = createSvgEl('g', {
      class: `svg-node-group ${statusClass} ${isSelected ? 'is-selected' : ''}`,
      tabindex: '0',
      role: 'button',
      'aria-label': `Inspect ${node.shortLabel} (${node.subLabel})`,
      'data-node-id': node.id
    });

    // Card rectangle
    g.appendChild(
      createSvgEl('rect', {
        x: node.x - 62,
        y: node.y - 42,
        width: 124,
        height: 84,
        rx: 10,
        class: 'svg-node-box'
      })
    );

    // Step index top-left
    const idxText = createSvgEl('text', {
      x: node.x - 50,
      y: node.y - 22,
      class: 'svg-node-badge'
    });
    idxText.textContent = `0${idx + 1}`;
    g.appendChild(idxText);

    // Dynamic badge top-right for Front door, Cloud & Approval Gate
    if (node.id === 'door') {
      const doorBadge = createSvgEl('text', {
        x: node.x + 50,
        y: node.y - 22,
        'text-anchor': 'end',
        class: 'svg-node-badge'
      });
      doorBadge.textContent = scenario.door || '';
      doorBadge.setAttribute('fill', '#1e40af');
      g.appendChild(doorBadge);
    } else if (node.id === 'cloud') {
      const modelBadge = createSvgEl('text', {
        x: node.x + 50,
        y: node.y - 22,
        'text-anchor': 'end',
        class: 'svg-node-badge'
      });
      modelBadge.textContent = activeProvider ? activeProvider.name : 'Paused';
      modelBadge.setAttribute('fill', activeProvider ? '#15803d' : '#b45309');
      g.appendChild(modelBadge);
    } else if (node.id === 'approval-gate') {
      const gateBadge = createSvgEl('text', {
        x: node.x + 50,
        y: node.y - 22,
        'text-anchor': 'end',
        class: 'svg-node-badge'
      });
      if (scenario.needsApproval && state.approvalState === 'pending') {
        gateBadge.textContent = 'PAUSE';
        gateBadge.setAttribute('fill', '#b45309');
      } else if (scenario.needsApproval && state.approvalState === 'cancelled') {
        gateBadge.textContent = 'BLOCKED';
        gateBadge.setAttribute('fill', '#b91c1c');
      } else if (state.packetProgress >= 4) {
        gateBadge.textContent = 'PASSED';
        gateBadge.setAttribute('fill', '#15803d');
      } else {
        gateBadge.textContent = 'LOCK';
        gateBadge.setAttribute('fill', '#666662');
      }
      g.appendChild(gateBadge);
    }

    // Node Title
    const titleEl = createSvgEl('text', {
      x: node.x,
      y: node.y + 4,
      'text-anchor': 'middle',
      class: 'svg-node-title'
    });
    titleEl.textContent = node.shortLabel;
    g.appendChild(titleEl);

    // Node Subtitle
    const subEl = createSvgEl('text', {
      x: node.x,
      y: node.y + 23,
      'text-anchor': 'middle',
      class: 'svg-node-sub'
    });
    subEl.textContent = node.subLabel;
    g.appendChild(subEl);

    // Click & keyboard handlers
    const selectNode = () => {
      state.selectedNodeId = node.id;
      renderSvgPipeline();
      renderNodeInspector();
    };
    g.addEventListener('click', selectNode);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectNode();
      }
    });

    nodesGroup.appendChild(g);
  });

  // 3. Render animated traveling packet pill
  packetGroup.innerHTML = '';
  const clamped = Math.min(4, Math.max(0, state.packetProgress));
  const segIndex = Math.min(3, Math.floor(clamped));
  const segFrac = clamped - segIndex;
  const fromNode = PIPELINE_NODES[segIndex];
  const toNode = PIPELINE_NODES[segIndex + 1];
  const px = fromNode.x + (toNode.x - fromNode.x) * segFrac;
  const py = fromNode.y - 58;

  let packetColor = '#1e40af';
  let packetLabel = scenario.packetTag;
  if (clamped >= 3.98) {
    if (scenario.needsApproval && state.approvalState === 'pending') {
      packetColor = '#b45309';
      packetLabel = 'AWAITING TAP';
    } else if (scenario.needsApproval && state.approvalState === 'cancelled') {
      packetColor = '#b91c1c';
      packetLabel = 'CANCELLED';
    } else {
      packetColor = '#15803d';
      packetLabel = 'COMPLETE';
    }
  }

  // Stem line from packet pill down to track
  packetGroup.appendChild(
    createSvgEl('line', {
      x1: px,
      y1: py + 12,
      x2: px,
      y2: fromNode.y - 42,
      stroke: packetColor,
      'stroke-width': '1.6',
      'stroke-dasharray': '3 3'
    })
  );

  // Packet pill
  packetGroup.appendChild(
    createSvgEl('rect', {
      x: px - 52,
      y: py - 12,
      width: 104,
      height: 24,
      rx: 12,
      fill: packetColor
    })
  );

  const pText = createSvgEl('text', {
    x: px,
    y: py + 4,
    'text-anchor': 'middle',
    fill: '#ffffff',
    'font-family': 'JetBrains Mono, monospace',
    'font-size': '10',
    'font-weight': '500'
  });
  pText.textContent = packetLabel;
  packetGroup.appendChild(pText);
}

function renderTelemetryAndGate() {
  const scenario = getActiveScenario();
  const activeProvider = getActiveProvider();
  const promptEl = document.getElementById('trace-prompt');
  const tagPill = document.getElementById('packet-tag-pill');
  const telemetryEl = document.getElementById('telemetry-strip');
  const drawerEl = document.getElementById('approval-drawer');

  if (promptEl) promptEl.textContent = scenario.prompt;
  if (tagPill) tagPill.textContent = scenario.packetTag;

  const reachedEnd = state.packetProgress >= 3.98;
  const totalMs = PIPELINE_NODES.slice(0, state.currentHopIndex + 1).reduce(
    (sum, n) => sum + n.latencyMs,
    0
  );

  let statusText = `STOP ${state.currentHopIndex + 1} OF 5`;
  let statusClass = 'is-accent';
  if (reachedEnd) {
    if (scenario.needsApproval && state.approvalState === 'pending') {
      statusText = 'WAITING FOR YOUR OK';
      statusClass = 'is-warn';
    } else if (scenario.needsApproval && state.approvalState === 'cancelled') {
      statusText = 'SAFELY CANCELLED';
      statusClass = 'is-block';
    } else {
      statusText = scenario.outcomeApproved.badge;
      statusClass = 'is-ok';
    }
  }

  if (telemetryEl) {
    telemetryEl.innerHTML = `
      <div class="telemetry-cell">
        <div class="telemetry-label">Engine on duty</div>
        <div class="telemetry-val ${activeProvider ? 'is-ok' : 'is-warn'}">
          ${activeProvider ? escapeHtml(activeProvider.name) : 'All Offline'}
        </div>
      </div>
      <div class="telemetry-cell">
        <div class="telemetry-label">Where the request is</div>
        <div class="telemetry-val ${statusClass}">${escapeHtml(statusText)}</div>
      </div>
      <div class="telemetry-cell">
        <div class="telemetry-label">Travel time so far (latency)</div>
        <div class="telemetry-val">${totalMs} ms</div>
        <div class="telemetry-note">ms = thousandths of a second; example timings</div>
      </div>
      <div class="telemetry-cell">
        <div class="telemetry-label">Pay-per-use cost</div>
        <div class="telemetry-val is-ok">$0.00</div>
      </div>
    `;
  }

  if (!drawerEl) return;

  if (reachedEnd && scenario.needsApproval && state.approvalState === 'pending') {
    drawerEl.hidden = false;
    drawerEl.innerHTML = `
      <div class="approval-head">
        <h3 class="approval-title">Approval gate: waiting for your decision</h3>
        <span class="step-pill pill-warn">${escapeHtml(scenario.holdLabel || 'ON HOLD')}</span>
      </div>
      <div class="approval-draft">
        <p><strong>To:</strong> ${escapeHtml(scenario.draftPreview.to)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(scenario.draftPreview.subject)}</p>
        <p>${escapeHtml(scenario.draftPreview.body)}</p>
      </div>
      <div class="approval-actions">
        <button type="button" class="btn btn-ok" id="approve-send-btn">Approve</button>
        <button type="button" class="btn-ghost" id="cancel-send-btn">Cancel</button>
      </div>
    `;

    const approveBtn = document.getElementById('approve-send-btn');
    const cancelBtn = document.getElementById('cancel-send-btn');
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        state.approvalState = 'approved';
        state.selectedNodeId = 'approval-gate';
        renderSvgPipeline();
        renderTelemetryAndGate();
        renderNodeInspector();
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        state.approvalState = 'cancelled';
        state.selectedNodeId = 'approval-gate';
        renderSvgPipeline();
        renderTelemetryAndGate();
        renderNodeInspector();
      });
    }
  } else {
    drawerEl.hidden = true;
    drawerEl.innerHTML = '';
  }
}

function renderNodeInspector() {
  const inspector = document.getElementById('node-inspector');
  if (!inspector) return;

  const node = PIPELINE_NODES.find((n) => n.id === state.selectedNodeId) || PIPELINE_NODES[0];
  const scenario = getActiveScenario();
  let hopPayload = scenario.hopDetails[node.id] || node.summary;

  if (node.id === 'approval-gate' && state.packetProgress >= 3.98) {
    if (scenario.needsApproval && state.approvalState === 'approved') {
      hopPayload = scenario.outcomeApproved.detail;
    } else if (scenario.needsApproval && state.approvalState === 'cancelled') {
      hopPayload = scenario.outcomeCancelled.detail;
    }
  }

  inspector.innerHTML = `
    <div class="inspector-top">
      <h3 class="inspector-title">Stop ${node.index + 1}: ${escapeHtml(node.shortLabel)}, ${escapeHtml(node.role)}</h3>
      <span class="step-pill pill-neutral">${node.latencyMs > 0 ? `about ${node.latencyMs} ms here` : 'Waits for you'}</span>
    </div>
    <p class="inspector-payload">${escapeHtml(hopPayload)}</p>
    <p class="inspector-summary">${escapeHtml(node.summary)}</p>
    <details class="editorial-drawer">
      <summary>Why this stop matters</summary>
      <div class="drawer-body"><p>${escapeHtml(node.deepNote)}</p></div>
    </details>
  `;
}

function runPacketSimulation(commandId) {
  stopPacketAnimation();
  state.activeCommandId = commandId;
  const scenario = getActiveScenario();
  state.approvalState = scenario.needsApproval ? 'pending' : 'idle';
  state.selectedNodeId = PIPELINE_NODES[0].id;
  renderCommandButtons();

  if (prefersReducedMotion()) {
    state.packetProgress = 4;
    state.currentHopIndex = 4;
    state.selectedNodeId = 'approval-gate';
    renderSvgPipeline();
    renderTelemetryAndGate();
    renderNodeInspector();
    return;
  }

  state.packetProgress = 0;
  state.currentHopIndex = 0;
  state.lastFrameTs = performance.now();
  renderSvgPipeline();
  renderTelemetryAndGate();
  renderNodeInspector();

  const stepFrame = (now) => {
    const dt = Math.max(0, Math.min(0.06, (now - state.lastFrameTs) / 1000));
    state.lastFrameTs = now;

    // 1.35 hops per second at 1x speed
    state.packetProgress = Math.min(4, state.packetProgress + dt * 1.35 * state.speed);
    const nextHop = Math.min(4, Math.floor(state.packetProgress + 0.05));

    if (nextHop !== state.currentHopIndex) {
      state.currentHopIndex = nextHop;
      state.selectedNodeId = PIPELINE_NODES[nextHop].id;
      renderTelemetryAndGate();
      renderNodeInspector();
    }

    renderSvgPipeline();

    if (state.packetProgress < 4) {
      state.rafId = window.requestAnimationFrame(stepFrame);
    } else {
      state.rafId = null;
      state.currentHopIndex = 4;
      state.selectedNodeId = 'approval-gate';
      renderSvgPipeline();
      renderTelemetryAndGate();
      renderNodeInspector();
    }
  };

  state.rafId = window.requestAnimationFrame(stepFrame);
}

/* ---------------- TOOL 2: CUSTOM BLUEPRINT GENERATOR & EXPORTER ---------------- */

function getPreviewContent() {
  const tab = state.builder.activeTab;
  if (tab === 'config') return generateConfigJson(state.builder);
  if (tab === 'memory') return generateMainMemoryMd(state.builder);
  return generateAgentsMd(state.builder);
}

function setExportFeedback(msg) {
  const el = document.getElementById('export-feedback');
  if (!el) return;
  el.textContent = msg;
  window.clearTimeout(el._timer);
  el._timer = window.setTimeout(() => {
    el.textContent = '';
  }, 3500);
}

function renderBlueprintBuilder() {
  const channelBox = document.getElementById('channel-options');
  const storageBox = document.getElementById('storage-options');
  const modelBox = document.getElementById('model-options');
  const gateBtn = document.getElementById('gate-toggle-btn');
  const gateLabel = document.getElementById('gate-toggle-label');
  const topologyEl = document.getElementById('builder-topology');
  const codeEl = document.getElementById('preview-code-content');
  const statsEl = document.getElementById('preview-stats');

  if (channelBox) {
    channelBox.innerHTML = BLUEPRINT_OPTIONS.channels
      .map((opt) => {
        const selected = state.builder.channels.includes(opt.id);
        return `
          <button
            type="button"
            class="option-chip ${selected ? 'is-selected' : ''}"
            data-channel="${escapeHtml(opt.id)}"
            aria-pressed="${selected}"
          >
            <span class="option-chip-head">
              <span class="option-chip-title">${escapeHtml(opt.label)}</span>
              <span class="option-chip-badge">${selected ? 'ON' : 'OFF'}</span>
            </span>
            <span class="option-chip-sub">${escapeHtml(opt.detail)}</span>
          </button>
        `;
      })
      .join('');

    channelBox.querySelectorAll('[data-channel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-channel');
        if (!id) return;
        const exists = state.builder.channels.includes(id);
        if (exists && state.builder.channels.length === 1) return; // keep at least 1
        state.builder.channels = exists
          ? state.builder.channels.filter((c) => c !== id)
          : [...state.builder.channels, id];
        renderBlueprintBuilder();
      });
    });
  }

  if (storageBox) {
    storageBox.innerHTML = BLUEPRINT_OPTIONS.storage
      .map((opt) => {
        const selected = state.builder.storage === opt.id;
        return `
          <button
            type="button"
            class="option-chip ${selected ? 'is-selected' : ''}"
            role="radio"
            aria-checked="${selected}"
            data-storage="${escapeHtml(opt.id)}"
          >
            <span class="option-chip-head">
              <span class="option-chip-title">${escapeHtml(opt.label)}</span>
              <span class="option-chip-badge">${selected ? 'BUS' : ''}</span>
            </span>
            <span class="option-chip-sub">${escapeHtml(opt.detail)}</span>
          </button>
        `;
      })
      .join('');

    storageBox.querySelectorAll('[data-storage]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-storage');
        if (!id) return;
        state.builder.storage = id;
        renderBlueprintBuilder();
      });
    });
  }

  if (modelBox) {
    modelBox.innerHTML = BLUEPRINT_OPTIONS.models
      .map((opt) => {
        const idx = state.builder.models.indexOf(opt.id);
        const selected = idx !== -1;
        return `
          <button
            type="button"
            class="option-chip ${selected ? 'is-selected' : ''}"
            data-model="${escapeHtml(opt.id)}"
            aria-pressed="${selected}"
          >
            <span class="option-chip-head">
              <span class="option-chip-title">${escapeHtml(opt.label)}</span>
              <span class="option-chip-badge">${selected ? `0${idx + 1}` : 'OFF'}</span>
            </span>
            <span class="option-chip-sub">${escapeHtml(opt.detail)}</span>
          </button>
        `;
      })
      .join('');

    modelBox.querySelectorAll('[data-model]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-model');
        if (!id) return;
        const exists = state.builder.models.includes(id);
        if (exists && state.builder.models.length === 1) return; // keep at least 1
        state.builder.models = exists
          ? state.builder.models.filter((m) => m !== id)
          : [...state.builder.models, id];
        renderBlueprintBuilder();
      });
    });
  }

  if (gateBtn && gateLabel) {
    gateBtn.setAttribute('aria-checked', String(state.builder.approvalGate));
    gateLabel.textContent = state.builder.approvalGate ? 'On' : 'Off';
  }

  if (topologyEl) {
    const storageLabel =
      BLUEPRINT_OPTIONS.storage.find((s) => s.id === state.builder.storage)?.label || 'Drive';
    const channelLabels = state.builder.channels
      .map((id) => BLUEPRINT_OPTIONS.channels.find((c) => c.id === id)?.label || id)
      .join(' + ');
    const modelLabels = state.builder.models
      .map((id) => BLUEPRINT_OPTIONS.models.find((m) => m.id === id)?.label || id)
      .join(' → ');

    topologyEl.innerHTML = `
      YOUR SETUP: <strong>Front door</strong> &rarr; <strong>${escapeHtml(storageLabel)}</strong> &rarr; <strong>${escapeHtml(modelLabels)}</strong> &rarr; <strong>${escapeHtml(channelLabels)}</strong> &rarr; <strong>${state.builder.approvalGate ? 'Approval gate' : 'Quick confirm in chat'}</strong>
    `;
  }

  // Update preview tabs & code
  document.querySelectorAll('[data-preview-tab]').forEach((tabBtn) => {
    const isActive = tabBtn.getAttribute('data-preview-tab') === state.builder.activeTab;
    tabBtn.classList.toggle('is-active', isActive);
    tabBtn.setAttribute('aria-selected', String(isActive));
  });

  const content = getPreviewContent();
  if (codeEl) codeEl.textContent = content;
  if (statsEl) {
    const lines = content.trimEnd().split('\n').length;
    const bytes = new TextEncoder().encode(content).length;
    statsEl.textContent = `${lines} lines · ${bytes} B`;
  }
}

function initBlueprintControls() {
  const ownerInput = document.getElementById('owner-name-input');
  if (ownerInput) {
    ownerInput.addEventListener('input', () => {
      state.builder.ownerName = ownerInput.value;
      renderBlueprintBuilder();
    });
  }

  const gateBtn = document.getElementById('gate-toggle-btn');
  if (gateBtn) {
    gateBtn.addEventListener('click', () => {
      state.builder.approvalGate = !state.builder.approvalGate;
      renderBlueprintBuilder();
    });
  }

  document.querySelectorAll('[data-preview-tab]').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      const tab = tabBtn.getAttribute('data-preview-tab');
      if (!tab) return;
      state.builder.activeTab = tab;
      renderBlueprintBuilder();
    });
  });

  const copyBtn = document.getElementById('copy-preview-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(getPreviewContent());
        copyBtn.textContent = 'Copied';
        window.setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 1600);
      } catch {
        setExportFeedback('Copy does not work in this browser. Use Download instead.');
      }
    });
  }

  const zipBtn = document.getElementById('download-zip-btn');
  if (zipBtn) {
    zipBtn.addEventListener('click', () => {
      const files = [
        { name: 'AGENTS.md', content: generateAgentsMd(state.builder) },
        { name: 'config.json', content: generateConfigJson(state.builder) },
        { name: 'memory/main.md', content: generateMainMemoryMd(state.builder) }
      ];
      const blob = createZipBlob(files);
      triggerDownload(blob, 'digital-brain-starter-kit.zip');
      setExportFeedback('Downloaded digital-brain-starter-kit.zip (AGENTS.md + config.json + memory/main.md).');
    });
  }

  const agentsBtn = document.getElementById('download-agents-btn');
  if (agentsBtn) {
    agentsBtn.addEventListener('click', () => {
      const blob = new Blob([generateAgentsMd(state.builder)], { type: 'text/markdown;charset=utf-8' });
      triggerDownload(blob, 'AGENTS.md');
      setExportFeedback('Downloaded AGENTS.md.');
    });
  }

  const configBtn = document.getElementById('download-config-btn');
  if (configBtn) {
    configBtn.addEventListener('click', () => {
      const blob = new Blob([generateConfigJson(state.builder)], { type: 'application/json;charset=utf-8' });
      triggerDownload(blob, 'config.json');
      setExportFeedback('Downloaded config.json.');
    });
  }
}

/* ---------------- SIMULATION 2: FAILOVER SWITCH ---------------- */

function renderFailover() {
  const statusBar = document.getElementById('failover-status-bar');
  const waterfall = document.getElementById('failover-waterfall');
  const emptyBanner = document.getElementById('failover-empty-banner');
  if (!statusBar || !waterfall || !emptyBanner) return;

  const active = getActiveProvider();
  const onlineCount = FAILOVER_PROVIDERS.filter(
    (p) => state.providersOnline[p.id] && !state.providersAtLimit[p.id]
  ).length;
  const atLimit = FAILOVER_PROVIDERS.filter((p) => state.providersOnline[p.id] && state.providersAtLimit[p.id]);

  statusBar.innerHTML = `
    <div class="status-tile">
      <div class="status-tile-label">Engine on duty</div>
      <div class="status-tile-value ${active ? 'is-ok' : 'is-warn'}">
        ${active ? escapeHtml(active.name) : 'Paused'}
      </div>
      <p class="status-tile-note">
        ${active ? (active.priority === 1 ? 'First choice is handling requests.' : `Backup in use: ${active.name} took over.`) : 'None of the three is available.'}
      </p>
    </div>
    <div class="status-tile">
      <div class="status-tile-label">Limit warnings</div>
      <div class="status-tile-value ${atLimit.length ? 'is-warn' : 'is-ok'}">${atLimit.length ? `${atLimit.length} sent` : 'None'}</div>
      <p class="status-tile-note">${atLimit.length ? `${escapeHtml(atLimit.map((p) => p.name).join(' and '))} hit the usage limit. You got one short warning, and it is skipped until it resets.` : 'You hear about a limit once, before it gets in the way.'}</p>
    </div>
    <div class="status-tile">
      <div class="status-tile-label">Shared notes</div>
      <div class="status-tile-value is-ok">All there</div>
      <p class="status-tile-note">${onlineCount} available engine${onlineCount === 1 ? '' : 's'} reading the same folder.</p>
    </div>
    <div class="status-tile">
      <div class="status-tile-label">Pay-per-use cost</div>
      <div class="status-tile-value is-ok">$0</div>
      <p class="status-tile-note">Fixed monthly plans only, so switching costs nothing extra.</p>
    </div>
  `;

  waterfall.innerHTML = FAILOVER_PROVIDERS.map((provider) => {
    const isOnline = Boolean(state.providersOnline[provider.id]);
    const isLimited = isOnline && Boolean(state.providersAtLimit[provider.id]);
    const isServing = active && active.id === provider.id;

    const cardClass = isServing ? 'is-serving' : !isOnline || isLimited ? 'is-offline' : '';
    const pillClass = isServing ? 'pill-ok' : isLimited ? 'pill-warn' : isOnline ? 'pill-neutral' : 'pill-block';
    const badgeLabel = isServing ? 'ACTIVE NOW' : isLimited ? 'AT USAGE LIMIT' : isOnline ? 'READY AS BACKUP' : 'OFFLINE';

    return `
      <article class="provider-card ${cardClass}">
        <div>
          <div class="provider-top">
            <span class="provider-priority">${provider.priority === 1 ? '1st choice' : provider.priority === 2 ? '2nd in line' : '3rd in line'}</span>
            <span class="step-pill ${pillClass}">${badgeLabel}</span>
          </div>
          <h3 class="provider-name">${escapeHtml(provider.name)}</h3>
          <p class="provider-role">${escapeHtml(provider.role)}</p>
          <p class="provider-strength">${escapeHtml(provider.strength)}</p>
        </div>
        <div class="provider-controls">
          <span class="provider-plan">${escapeHtml(provider.plan)}</span>
          <button
            type="button"
            class="switch-btn"
            role="switch"
            aria-checked="${isOnline}"
            aria-label="Toggle ${escapeHtml(provider.name)} ${isOnline ? 'off' : 'on'}"
            data-provider-id="${escapeHtml(provider.id)}"
          >
            <span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
            <span>${isOnline ? 'Online' : 'Offline'}</span>
          </button>
          <button
            type="button"
            class="btn-mini"
            data-limit-id="${escapeHtml(provider.id)}"
            aria-pressed="${isLimited}"
            ${isOnline ? '' : 'disabled'}
          >${isLimited ? 'Reset the limit' : 'Use up its limit'}</button>
        </div>
      </article>
    `;
  }).join('');

  waterfall.querySelectorAll('[data-limit-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-limit-id');
      if (!id) return;
      state.providersAtLimit[id] = !state.providersAtLimit[id];
      renderFailover();
      renderSvgPipeline();
      renderTelemetryAndGate();
    });
  });

  waterfall.querySelectorAll('.switch-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-provider-id');
      if (!id) return;
      state.providersOnline[id] = !state.providersOnline[id];
      renderFailover();
      renderSvgPipeline();
      renderTelemetryAndGate();
    });
  });

  emptyBanner.hidden = Boolean(active);
}

/* ---------------- REFERENCE 3: 5-FOLDER EXPLORER ---------------- */

function renderFolderExplorer() {
  const listEl = document.getElementById('folder-list');
  const detailEl = document.getElementById('folder-detail');
  if (!listEl || !detailEl) return;

  listEl.innerHTML = BRAIN_FOLDERS.map((folder, index) => {
    const isActive = folder.id === state.activeFolderId;
    return `
      <button
        type="button"
        class="folder-btn ${isActive ? 'is-active' : ''}"
        role="tab"
        aria-selected="${isActive}"
        data-folder-id="${escapeHtml(folder.id)}"
      >
        <span class="folder-btn-main">
          <span class="folder-btn-name">${escapeHtml(folder.name)}</span>
          <span class="folder-btn-tag">${escapeHtml(folder.tag)}</span>
        </span>
        <span class="folder-btn-arrow" aria-hidden="true">0${index + 1}</span>
      </button>
    `;
  }).join('');

  listEl.querySelectorAll('.folder-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-folder-id');
      if (!id || id === state.activeFolderId) return;
      state.activeFolderId = id;
      renderFolderExplorer();
    });
  });

  const activeFolder =
    BRAIN_FOLDERS.find((f) => f.id === state.activeFolderId) || BRAIN_FOLDERS[0];

  detailEl.innerHTML = `
    <div class="folder-detail-path">${escapeHtml(activeFolder.path)}</div>
    <h3 class="folder-detail-title">${escapeHtml(activeFolder.headline)}</h3>
    <p class="folder-detail-copy">${escapeHtml(activeFolder.shortSummary)}</p>
    <div class="folder-preview">
      <div class="folder-preview-bar">
        <span>${escapeHtml(activeFolder.sampleFile)}</span>
        <span>PLAIN TEXT (MARKDOWN)</span>
      </div>
      <pre><code>${escapeHtml(activeFolder.sampleContent)}</code></pre>
    </div>
    <details class="editorial-drawer">
      <summary>Why this beats a chat history</summary>
      <div class="drawer-body"><p>${escapeHtml(activeFolder.deepNote)}</p></div>
    </details>
  `;
}

/* ---------------- BOOT ---------------- */

function init() {
  initHeaderAndProgress();
  initBlueprintControls();
  renderBlueprintBuilder();
  renderFailover();
  renderFolderExplorer();
  initHandover();
  runPacketSimulation(COMMAND_SCENARIOS[0].id);

  const speedInput = document.getElementById('packet-speed');
  const speedValue = document.getElementById('packet-speed-value');
  if (speedInput && speedValue) {
    speedInput.addEventListener('input', () => {
      state.speed = parseFloat(speedInput.value) || 1;
      speedValue.textContent = `${state.speed.toFixed(1)}x`;
    });
  }

  const replayBtn = document.getElementById('replay-trace-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      runPacketSimulation(state.activeCommandId);
    });
  }

  const restoreBtn = document.getElementById('restore-providers-btn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      state.providersOnline = { gemini: true, codex: true, claude: true };
      state.providersAtLimit = { gemini: false, codex: false, claude: false };
      renderFailover();
      renderSvgPipeline();
      renderTelemetryAndGate();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
