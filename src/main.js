import {
  COMMAND_SCENARIOS,
  FAILOVER_PROVIDERS,
  BRAIN_FOLDERS
} from './data/blueprintData.js';

const state = {
  activeCommandId: COMMAND_SCENARIOS[0].id,
  traceStage: 0, // 0..4
  approvalState: 'idle', // 'idle' | 'pending' | 'approved' | 'cancelled'
  traceTimers: [],
  providersOnline: {
    antigravity: true,
    claude: true,
    codex: true
  },
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
  return FAILOVER_PROVIDERS.find((p) => state.providersOnline[p.id]) || null;
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

/* ---------------- SANDBOX 1: COMMAND SIMULATOR ---------------- */

function clearTraceTimers() {
  state.traceTimers.forEach((id) => window.clearTimeout(id));
  state.traceTimers = [];
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
      if (id) runCommandSimulation(id);
    });
  });
}

function getHarnessStepCopy(scenario) {
  const activeProvider = getActiveProvider();
  if (!activeProvider) {
    return {
      badge: 'WAITING FOR MODEL',
      summary: 'All three AI providers are switched off in Sandbox 2. Your request stays queued locally until any provider is back online.',
      detail: 'Turn on Antigravity, Claude, or Codex below'
    };
  }

  const isPrimary = activeProvider.priority === 1;
  return {
    badge: isPrimary ? `${activeProvider.name.toUpperCase()} ACTIVE` : `REROUTED TO ${activeProvider.name.toUpperCase()}`,
    summary: isPrimary
      ? scenario.steps.harness.summary
      : `Primary assistant is off, so ${activeProvider.name} steps in automatically with the exact same memory folder.`,
    detail: `Handled by ${activeProvider.name} (${activeProvider.plan.toLowerCase()}, $0 extra API cost)`
  };
}

function renderTrace() {
  const scenario = COMMAND_SCENARIOS.find((c) => c.id === state.activeCommandId) || COMMAND_SCENARIOS[0];
  const promptEl = document.getElementById('trace-prompt');
  const stepsEl = document.getElementById('trace-steps');
  const drawerEl = document.getElementById('approval-drawer');

  if (!promptEl || !stepsEl || !drawerEl) return;

  promptEl.textContent = scenario.prompt;

  const harnessCopy = getHarnessStepCopy(scenario);
  const outcomeData =
    scenario.needsApproval && state.approvalState === 'cancelled'
      ? scenario.steps.cancelledOutcome
      : scenario.steps.outcome;

  const stepDefs = [
    {
      num: 'STEP 01',
      title: scenario.steps.router.title,
      badge: scenario.steps.router.badge,
      summary: scenario.steps.router.summary,
      detail: scenario.steps.router.detail
    },
    {
      num: 'STEP 02',
      title: scenario.steps.harness.title,
      badge: harnessCopy.badge,
      summary: harnessCopy.summary,
      detail: harnessCopy.detail
    },
    {
      num: 'STEP 03',
      title: scenario.steps.gate.title,
      badge:
        scenario.needsApproval && state.approvalState === 'approved'
          ? 'APPROVED BY YOU'
          : scenario.needsApproval && state.approvalState === 'cancelled'
            ? 'BLOCKED BY YOU'
            : scenario.steps.gate.badge,
      summary: scenario.steps.gate.summary,
      detail: scenario.steps.gate.detail
    },
    {
      num: 'STEP 04',
      title: outcomeData.title,
      badge: outcomeData.badge,
      summary: outcomeData.summary,
      detail: outcomeData.detail
    }
  ];

  stepsEl.innerHTML = stepDefs
    .map((step, index) => {
      const stepNumber = index + 1;
      let statusClass = '';
      let pillClass = 'pill-neutral';

      if (stepNumber < state.traceStage) {
        statusClass = 'is-done';
        pillClass = 'pill-emerald';
      } else if (stepNumber === state.traceStage) {
        if (stepNumber === 3 && scenario.needsApproval && state.approvalState === 'pending') {
          statusClass = 'is-paused';
          pillClass = 'pill-amber';
        } else if (stepNumber === 4 && state.approvalState === 'cancelled') {
          statusClass = 'is-cancelled';
          pillClass = 'pill-crimson';
        } else if (stepNumber === 4) {
          statusClass = 'is-done';
          pillClass = 'pill-emerald';
        } else {
          statusClass = 'is-active';
          pillClass = 'pill-amber';
        }
      }

      return `
        <li class="trace-step ${statusClass}">
          <div class="trace-step-top">
            <span class="trace-step-num">${escapeHtml(step.num)}</span>
            <span class="step-pill ${pillClass}">${escapeHtml(step.badge)}</span>
          </div>
          <h3 class="trace-step-title">${escapeHtml(step.title)}</h3>
          <p class="trace-step-summary">${escapeHtml(step.summary)}</p>
          <div class="trace-step-detail">${escapeHtml(step.detail)}</div>
        </li>
      `;
    })
    .join('');

  if (scenario.needsApproval && state.approvalState === 'pending' && state.traceStage === 3) {
    drawerEl.hidden = false;
    drawerEl.innerHTML = `
      <div class="approval-head">
        <h3 class="approval-title">Safety Approval Gate — Waiting for Your Decision</h3>
        <span class="step-pill pill-amber">OUTWARD ACTION PAUSED</span>
      </div>
      <div class="approval-draft">
        <p><strong>To:</strong> ${escapeHtml(scenario.draftPreview.to)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(scenario.draftPreview.subject)}</p>
        <p>${escapeHtml(scenario.draftPreview.body)}</p>
      </div>
      <div class="approval-actions">
        <button type="button" class="btn btn-emerald" id="approve-send-btn">Approve &amp; Send</button>
        <button type="button" class="btn-ghost" id="cancel-send-btn">Cancel Send</button>
      </div>
    `;

    const approveBtn = document.getElementById('approve-send-btn');
    const cancelBtn = document.getElementById('cancel-send-btn');

    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        state.approvalState = 'approved';
        state.traceStage = 4;
        renderTrace();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        state.approvalState = 'cancelled';
        state.traceStage = 4;
        renderTrace();
      });
    }
  } else {
    drawerEl.hidden = true;
    drawerEl.innerHTML = '';
  }
}

function runCommandSimulation(commandId) {
  clearTraceTimers();
  state.activeCommandId = commandId;
  const scenario = COMMAND_SCENARIOS.find((c) => c.id === commandId) || COMMAND_SCENARIOS[0];
  state.approvalState = scenario.needsApproval ? 'pending' : 'idle';
  renderCommandButtons();

  const targetFinalStage = scenario.needsApproval ? 3 : 4;

  if (prefersReducedMotion()) {
    state.traceStage = targetFinalStage;
    renderTrace();
    return;
  }

  state.traceStage = 1;
  renderTrace();

  for (let stage = 2; stage <= targetFinalStage; stage += 1) {
    const timerId = window.setTimeout(() => {
      state.traceStage = stage;
      renderTrace();
    }, (stage - 1) * 320);
    state.traceTimers.push(timerId);
  }
}

/* ---------------- SANDBOX 2: BREAK A MODEL ---------------- */

function renderFailover() {
  const statusBar = document.getElementById('failover-status-bar');
  const waterfall = document.getElementById('failover-waterfall');
  const emptyBanner = document.getElementById('failover-empty-banner');
  if (!statusBar || !waterfall || !emptyBanner) return;

  const active = getActiveProvider();
  const onlineCount = FAILOVER_PROVIDERS.filter((p) => state.providersOnline[p.id]).length;

  statusBar.innerHTML = `
    <div class="status-tile">
      <div class="status-tile-label">Active Assistant</div>
      <div class="status-tile-value ${active ? 'is-emerald' : 'is-amber'}">
        ${active ? escapeHtml(active.name) : 'Paused'}
      </div>
      <p class="status-tile-note">
        ${
          active
            ? active.priority === 1
              ? 'Primary assistant is handling requests normally.'
              : `Seamless failover active — ${active.name} took over with zero downtime.`
            : 'All providers are toggled off right now.'
        }
      </p>
    </div>
    <div class="status-tile">
      <div class="status-tile-label">Shared Memory</div>
      <div class="status-tile-value is-emerald">100% Intact</div>
      <p class="status-tile-note">
        All ${onlineCount} online assistant${onlineCount === 1 ? '' : 's'} read the exact same Markdown folder.
      </p>
    </div>
    <div class="status-tile">
      <div class="status-tile-label">Extra API Spend</div>
      <div class="status-tile-value is-emerald">$0</div>
      <p class="status-tile-note">
        Stays inside existing flat-rate plans — never falls back to surprise metered bills.
      </p>
    </div>
  `;

  waterfall.innerHTML = FAILOVER_PROVIDERS.map((provider) => {
    const isOnline = Boolean(state.providersOnline[provider.id]);
    const isServing = active && active.id === provider.id;

    const cardClass = isServing ? 'is-serving' : !isOnline ? 'is-offline' : '';
    const pillClass = isServing ? 'pill-emerald' : isOnline ? 'pill-neutral' : 'pill-crimson';
    const badgeLabel = isServing ? 'ACTIVE NOW' : isOnline ? 'STANDBY' : 'OFFLINE';

    return `
      <article class="provider-card ${cardClass}">
        <div>
          <div class="provider-top">
            <span class="provider-priority">Priority ${provider.priority}</span>
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
            <span class="switch-track" aria-hidden="true">
              <span class="switch-thumb"></span>
            </span>
            <span>${isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>
      </article>
    `;
  }).join('');

  waterfall.querySelectorAll('.switch-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-provider-id');
      if (!id) return;
      state.providersOnline[id] = !state.providersOnline[id];
      renderFailover();
      renderTrace();
    });
  });

  emptyBanner.hidden = Boolean(active);
}

/* ---------------- SANDBOX 3: 5-FOLDER EXPLORER ---------------- */

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
    <p class="folder-detail-copy">
      ${escapeHtml(activeFolder.sentences[0])} ${escapeHtml(activeFolder.sentences[1])}
    </p>
    <div class="folder-preview">
      <div class="folder-preview-bar">
        <span>${escapeHtml(activeFolder.sampleFile)}</span>
        <span>PLAIN MARKDOWN</span>
      </div>
      <pre><code>${escapeHtml(activeFolder.sampleContent)}</code></pre>
    </div>
  `;
}

/* ---------------- BOOT ---------------- */

function init() {
  initHeaderAndProgress();
  renderFailover();
  renderFolderExplorer();
  runCommandSimulation(COMMAND_SCENARIOS[0].id);

  const replayBtn = document.getElementById('replay-trace-btn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      runCommandSimulation(state.activeCommandId);
    });
  }

  const restoreBtn = document.getElementById('restore-providers-btn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      state.providersOnline = { antigravity: true, claude: true, codex: true };
      renderFailover();
      renderTrace();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
