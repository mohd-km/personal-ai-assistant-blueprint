# Personal AI Assistant Blueprint

An interactive, publication-grade architectural showcase of **Personal AI Assistant Blueprint** by Mohammed KM.

> One personal brain across voice, messaging, and cloud — zero hardware lock-in, zero metered API drift.

## What This Showcase Covers

1. **Production Metrics Strip**: 2.0s fast-path memory recall, 8 kHz native `ulaw` telephony, 0 INR extra cloud hosting, and 2-lane caller isolation.
2. **Interactive Architecture Diagram**: Clickable flow from inbound Plivo `ulaw_8000` call through Voice Bridge and Caller-ID Lane Router into either the Owner Lane (2s fast-path + multi-harness CLI waterfall + 16s background-to-Telegram handoff) or Public Desk Lane (zero execution tools, curated public profile, multilingual `ml/hi/kn/ta/en`).
3. **Public vs Private Permission Simulator**: Toggle caller types (Verified Owner, Delivery Rider, Networking Caller, Spam) to inspect exact lane routing, allowed context, blocked fields, and simulated call transcripts.
4. **Cost & Token Discipline**: Breakdown of flat-rate CLI subscriptions vs Plivo DID ($2.50/mo) and ElevenLabs efficiency guards, with an interactive monthly call-volume estimator.
5. **Open-Source Starter Blueprint**: Interactive folder explorer and step-by-step reproducible setup guide.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Built static files are emitted to `dist/` with `dist/index.html` as the entry point.

## Privacy Notice

All phone numbers, transcripts, caller names, and configuration snippets in this repository are synthetic placeholders. No personal credentials, private contacts, addresses, or identity numbers are included.
