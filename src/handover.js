/**
 * Part 2: close the laptop. Shows why long work is handed to the always-on
 * cloud computer instead of running on the laptop. Made-up example data only.
 */

const JOB_STEPS = [
  { label: 'Copy the chat and the recently changed files to the cloud', secs: 1.2 },
  { label: 'Start the job as its own background process', secs: 1.0 },
  { label: 'Build the site and run its checks', secs: 2.4 },
  { label: 'Stage the publish at the approval gate', secs: 1.6 },
  { label: 'Send one short card to your phone', secs: 0.8 }
];

const CARD = {
  heading: 'cloud task update',
  lines: ['portfolio site rebuilt and checked', 'one step needs you: approve the publish'],
  detail:
    'Built 3 pages, ran the checks on a laptop-size and a phone-size screen, found no errors. The publish is waiting at the approval gate. Tap approve and it goes live in about a minute.'
};

const state = {
  mode: 'idle', // idle | running | stopped | done
  where: 'cloud', // cloud | laptop
  laptopOpen: true,
  progress: 0, // seconds of work done
  timer: null,
  detailOpen: false
};

const TOTAL = JOB_STEPS.reduce((s, x) => s + x.secs, 0);

function esc(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stopTimer() {
  if (state.timer) {
    window.clearInterval(state.timer);
    state.timer = null;
  }
}

function stepIndex() {
  let acc = 0;
  for (let i = 0; i < JOB_STEPS.length; i += 1) {
    acc += JOB_STEPS[i].secs;
    if (state.progress < acc - 1e-6) return i;
  }
  return JOB_STEPS.length;
}

function start(where) {
  stopTimer();
  state.where = where;
  state.mode = 'running';
  state.laptopOpen = true;
  state.progress = 0;
  state.detailOpen = false;
  state.timer = window.setInterval(() => {
    state.progress = Math.min(TOTAL, state.progress + 0.1);
    if (state.progress >= TOTAL) {
      stopTimer();
      state.mode = 'done';
    }
    render();
  }, 100);
  render();
}

function closeLaptop() {
  state.laptopOpen = false;
  if (state.mode === 'running' && state.where === 'laptop') {
    stopTimer();
    state.mode = 'stopped';
  }
  render();
}

function reset() {
  stopTimer();
  state.mode = 'idle';
  state.laptopOpen = true;
  state.progress = 0;
  state.detailOpen = false;
  render();
}

function render() {
  const root = document.getElementById('handover-stage');
  if (!root) return;

  const idx = stepIndex();
  const pct = Math.round((state.progress / TOTAL) * 100);
  const cloudBusy = state.where === 'cloud' && state.mode === 'running';
  const laptopBusy = state.where === 'laptop' && state.mode === 'running';

  let statusText = 'Pick where the job should run.';
  let statusClass = 'is-accent';
  if (state.mode === 'running') {
    statusText = `Step ${Math.min(idx + 1, JOB_STEPS.length)} of ${JOB_STEPS.length} on the ${state.where}`;
  } else if (state.mode === 'stopped') {
    statusText = `Stopped at ${pct}%: the laptop went to sleep and took the job with it.`;
    statusClass = 'is-block';
  } else if (state.mode === 'done') {
    statusText = state.laptopOpen
      ? 'Finished. The card is on your phone.'
      : 'Finished with the laptop closed. The card is on your phone.';
    statusClass = 'is-ok';
  }

  const steps = JOB_STEPS.map((s, i) => {
    let cls = '';
    if (state.mode === 'done' || i < idx) cls = 'is-done';
    else if (i === idx && state.mode === 'running') cls = 'is-now';
    else if (i === idx && state.mode === 'stopped') cls = 'is-cut';
    return `<li class="ho-step ${cls}"><span class="ho-step-num">0${i + 1}</span><span>${esc(s.label)}</span></li>`;
  }).join('');

  const card =
    state.mode === 'done'
      ? `
      <div class="ho-card" role="status">
        <div class="ho-card-head">${esc(CARD.heading)}</div>
        <ul class="ho-card-lines">${CARD.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
        <button type="button" class="btn-mini" id="ho-detail-btn" aria-expanded="${state.detailOpen}">
          ${state.detailOpen ? 'Hide detail' : 'Show detail'}
        </button>
        ${state.detailOpen ? `<p class="ho-card-detail">${esc(CARD.detail)}</p>` : ''}
      </div>`
      : `<div class="ho-card is-empty">Your phone stays quiet until there is something worth reading.</div>`;

  root.innerHTML = `
    <div class="ho-controls">
      <button type="button" class="btn btn-primary" id="ho-cloud-btn">Hand it to the cloud</button>
      <button type="button" class="btn btn-secondary" id="ho-laptop-btn">Keep it on the laptop</button>
      <button type="button" class="btn-ghost" id="ho-close-btn" ${state.laptopOpen ? '' : 'disabled'}>
        ${state.laptopOpen ? 'Close the laptop' : 'Laptop closed'}
      </button>
      <button type="button" class="btn-ghost" id="ho-reset-btn">Reset</button>
    </div>

    <div class="ho-machines">
      <div class="ho-machine ${state.laptopOpen ? '' : 'is-off'} ${laptopBusy ? 'is-busy' : ''}">
        <div class="ho-machine-label">Laptop</div>
        <div class="ho-machine-state">${state.laptopOpen ? (laptopBusy ? 'Working' : 'Free to use') : 'Closed'}</div>
        <p class="ho-machine-note">${state.where === 'cloud' && state.mode !== 'idle' ? 'Handed over in a few seconds, then left alone.' : 'Only works while the lid is open.'}</p>
      </div>
      <div class="ho-machine ${cloudBusy ? 'is-busy' : ''}">
        <div class="ho-machine-label">Cloud computer</div>
        <div class="ho-machine-state">${cloudBusy ? 'Working' : state.mode === 'done' && state.where === 'cloud' ? 'Done' : 'On, 24/7'}</div>
        <p class="ho-machine-note">Keeps running whether the laptop is open, closed or out of battery.</p>
      </div>
    </div>

    <div class="ho-progress" aria-hidden="true"><span style="width:${pct}%"></span></div>
    <div class="ho-status telemetry-val ${statusClass}" aria-live="polite">${esc(statusText)}</div>

    <div class="ho-bottom">
      <ol class="ho-steps">${steps}</ol>
      ${card}
    </div>
  `;

  root.querySelector('#ho-cloud-btn')?.addEventListener('click', () => start('cloud'));
  root.querySelector('#ho-laptop-btn')?.addEventListener('click', () => start('laptop'));
  root.querySelector('#ho-close-btn')?.addEventListener('click', closeLaptop);
  root.querySelector('#ho-reset-btn')?.addEventListener('click', reset);
  root.querySelector('#ho-detail-btn')?.addEventListener('click', () => {
    state.detailOpen = !state.detailOpen;
    render();
  });
}

export function initHandover() {
  render();
  window.addEventListener('pagehide', stopTimer);
}
