# Digital Brain Architecture

A personal AI assistant whose memory is one folder of plain Markdown notes. Three AI apps (Antigravity, Claude and Codex) read the same folder, so each already knows your preferences, and if one is down the next carries on. Live at [brain.mohammed-km.in](https://brain.mohammed-km.in). Built by Mohammed KM.

## What is on the page

Everything runs in the browser with made-up data. No AI is called, no tokens are spent and no personal data is used.

1. **Follow one request**: four sample commands move a dot through five stops (laptop, shared folder, cloud computer, Telegram, approval gate). An outgoing email waits at the gate until you approve it, while a private note passes straight through.
2. **Build your starter kit**: pick your name, chat app, storage and AI apps, then download `AGENTS.md`, `config.json` and `memory/main.md` as a zip made inside your browser.
3. **Switch an AI off**: turn Antigravity, Claude or Codex off and the next one in line takes over. All three are on fixed monthly plans, so the extra pay-per-use (API) cost stays at $0.
4. **Inside the 5 folders**: `rules`, `memory cards`, `lessons learned`, `playbooks` and `execution trail`, each with a sample note.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Output is written to `dist/index.html` and `dist/assets/`.
