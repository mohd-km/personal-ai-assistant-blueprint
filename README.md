# Digital Brain Architecture

A personal AI assistant whose memory is one folder of plain Markdown notes. It runs on a cloud computer that never switches off, takes requests from Telegram, a phone line, email and three private web apps, and passes the work to Gemini, Codex or Claude. If one engine hits its usage limit, the next carries on with the same notes. Live at [brain.mohammed-km.in](https://brain.mohammed-km.in). Built by Mohammed KM.

## What is on the page

Everything runs in the browser with made-up data. No AI is called, no tokens are spent and no personal data is used.

1. **Follow one request**: five sample requests move a dot through five stops (front door, shared folder, cloud computer, your phone, approval gate). An email or a bill payment waits at the gate until you approve it, while a private note passes straight through.
2. **Close the laptop**: run a long build on the laptop and close the lid, and the job dies. Hand it to the cloud first and it finishes anyway, ending with one short card on your phone.
3. **Build your starter kit**: pick your name, front doors, storage and engines, then download `AGENTS.md`, `config.json` and `memory/main.md` as a zip made inside your browser.
4. **Switch an engine off**: turn Gemini, Codex or Claude off, or use up its limit, and the next one in line takes over after one warning. All three are on fixed monthly plans, so the extra pay-per-use (API) cost stays at $0.
5. **Inside the 5 folders**: `rules`, `memory cards`, `lessons learned`, `playbooks` and `execution trail`, each with a sample note.

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
