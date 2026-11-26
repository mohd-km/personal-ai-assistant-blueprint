# Digital Brain Architecture

An interactive, publication-grade architectural showcase of **Digital Brain Architecture** (v2) by Mohammed KM.

> A sovereign, cross-harness digital brain running 24/7 on a single Linux node — zero hardware lock-in, zero metered API drift.

## What This Showcase Covers

1. **Production Metrics Strip**: 2.0s cloned-voice recall, Drive-as-bus sync across Antigravity, Claude, and Codex, 24/7 single Linux node runtime, and two-lane caller isolation with an unattended Telegram approval gate.
2. **Cloned Voice Desk Audio Demo**: Interactive audio player card with live playback controls, animated seekable progress bar, greeting transcript preview, and real ElevenLabs v4 Turbo 8 kHz telephony sample (`public/audio/voice-desk-demo.mp3`).
3. **Interactive Architecture Diagram**: Clickable flow from inbound Plivo `ulaw_8000` call through the Cloned-Voice Bridge and Caller-ID Lane Router into either the Owner Lane (2.0s persistent Markdown recall + Drive-as-bus sync + multi-model CLI failover + 16s Telegram handoff and approval gate) or Public Desk Lane (zero execution tools, curated public profile, multilingual `ml/hi/kn/ta/en`).
4. **Public vs Private Permission Simulator**: Toggle caller types (Verified Owner, Delivery Rider, Networking Caller, Spam) to inspect exact lane routing, allowed context, blocked fields, and simulated call transcripts.
5. **Cost & Token Discipline**: Breakdown of flat-rate multi-model CLI failover vs Plivo DID ($2.50/mo) and ElevenLabs v4 Turbo efficiency guards, with an interactive monthly call-volume estimator.
6. **Open-Source Starter Blueprint**: Interactive folder explorer and five-step reproducible setup guide.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Built static files are emitted to `dist/` with `dist/index.html` and `dist/audio/voice-desk-demo.mp3`.

## Privacy Notice

All phone numbers, transcripts, caller names, and configuration snippets in this repository are synthetic placeholders. The voice demo exposes zero live phone numbers, and no personal credentials, private contacts, addresses, or identity numbers are included.
