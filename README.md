# BagTracker

BagTracker is evolving into a value-flow intelligence platform focused on one question:

**Where did the money go?**

## MVP Scope (Milestone A)

- Solana-only trace flow (initial chain adapter)
- `POST /trace` API (prototype in Next.js route handler and Rust Axum service scaffold)
- Recursive flow engine with branch, merge, hop-limit, and cycle protection
- Initial exchange/bridge labeling (Binance, Bybit, OKX, Coinbase, Kraken, MEXC, Wormhole, LayerZero)
- Minimal trace UI at `/trace`

## Repository Structure

- `app/` — Next.js frontend and app route handlers
  - `app/trace/page.tsx` — MVP tracing UI
  - `app/api/trace/route.ts` — MVP trace endpoint for local frontend integration
- `lib/flow/` — shared TypeScript contracts + flow engine
- `services/` — Rust microservice workspace
  - `services/indexer` — Solana indexer scaffold
  - `services/flow-engine` — recursive money flow engine crate
  - `services/api` — Axum API scaffold (`/health`, `/trace`)
  - `services/bot` — Telegram bot scaffold
  - `services/shared-contracts` — shared Rust schema contracts

## Frontend Setup

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/trace`.

## Frontend Validation

```bash
npm run lint
npm run build
```

## Rust Services Setup (Scaffold)

```bash
cd services
cargo check
```

## Environment Variables

Optional (for future live chain integration):

- `NEXT_PUBLIC_HELIUS_API_KEY`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_HELIUS_RPC_URL`
- `HELIUS_RPC_URL`
- `NEXT_PUBLIC_BAGS_API`
- `NEXT_PUBLIC_BAGS_API_KEY`

## Milestone Roadmap

- **A:** Indexer + `/trace` API + minimal graph UI
- **B:** Entity recognition + compression + alerts
- **C:** AI explanations + investigations + bot integration
- **D:** Multi-chain adapters + hardening + scale optimization
