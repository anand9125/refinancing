# ▲ Zenith — On-Chain Perpetual Futures DEX

![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Solana](https://img.shields.io/badge/solana-4E44CE?style=for-the-badge&logo=solana&logoColor=white)
![Anchor](https://img.shields.io/badge/anchor-4E44CE?style=for-the-badge&logo=solana&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

A fully on-chain perpetual futures exchange built on **Solana** with **Anchor**.
Every order, fill, position, and liquidation is real Solana program state — no
off-chain matching engine, no custodian. The matching engine, order book, risk
engine, and funding mechanism all live inside the program.

> **Live demo:** https://zenith-perp.vercel.app
> **Network:** Solana Devnet
> **Program ID:** `89zv4vQvHqPRsYfbyoR7Q65TgoV2XpZZM3QrBT4VCvde`

---

## What it is

Zenith is a perpetual futures DEX modelled on the architecture of on-chain
order-book exchanges like Serum / Phoenix, adapted for leveraged perps:

- **On-chain central limit order book (CLOB)** — bids and asks live in a
  crit-bit B-tree slab allocator, entirely as program account state.
- **Request → crank → event pipeline** — order placement is decoupled from
  matching. Orders are enqueued, a permissionless cranker matches them, and
  fills are emitted to an event queue that traders settle into their positions.
- **Cross-margin positions** with a real-time risk engine, on-chain
  liquidations, and an insurance fund that backs bad debt.
- **Funding-rate mechanism** to anchor the perp price to the index.
- **Pyth oracle** for the live SOL/USD index price.

---

## Architecture

```
                          ┌────────────────────────────┐
   place_order  ───────▶  │        RequestQueue        │
   (enqueue)              └──────────────┬─────────────┘
                                         │  process_place_order (crank)
                                         ▼
                          ┌────────────────────────────┐
                          │      Matching Engine        │
                          │  crit-bit B-tree slab       │
                          │  bids ▲      asks ▼          │
                          └──────────────┬─────────────┘
                                         │  fills
                                         ▼
                          ┌────────────────────────────┐
   position_manager ◀──── │        EventQueue           │
   (settle fills)         └────────────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────┐
                  │  Position · UserCollateral · MarketState  │
                  │  RiskEngine · Funding · Liquidation       │
                  └──────────────────────────────────────────┘
                                         ▲
                                  Pyth oracle (index price)
```

### Why the queue pipeline?

A Solana transaction can't loop over an unbounded order book within one
instruction's compute budget. Splitting placement (`place_order`) from matching
(`process_place_order`) lets a permissionless cranker process the book in bounded
batches — the same pattern Serum pioneered. Fills land in an `EventQueue` that
each trader drains via `position_manager`, keeping per-instruction work bounded.

---

## Program instructions (15)

| Instruction | Purpose |
|---|---|
| `initalise_global_config` | Bootstrap vault, insurance fund, fee pool, queues |
| `initialize_market` | Create a market (symbol, oracle, margin/fee params) + bid/ask slabs |
| `deposit_colletral` | Deposit USDC collateral into the vault |
| `withdraw` | Withdraw collateral (health-checked) |
| `place_order` | Validate margin and enqueue an order |
| `process_place_order` | Permissionless crank — match the queue against the book |
| `position_manager` | Settle fill events into a user's position |
| `cancel_order_ix` | Cancel a resting limit order |
| `liquidate` | Permissionless liquidation of an underwater position |
| `update_funding_ix` | Advance the cumulative funding index |
| `update_oracle_price` | Push the Pyth index price on-chain |
| `set_mark_price` | Manual mark price (admin / testing) |
| `toggle_trading` | Kill switch (admin) |
| `reset_queues` / `reset_slab` | Admin / test utilities |

---

## On-chain state

- **`MarketState`** — symbol, oracle, mark price, margin reqs (im/mm bps), fees,
  funding state, tick/step sizes.
- **`Slab` (bids / asks)** — crit-bit B-tree of `LeafNode`s; price-time priority
  encoded in the order id.
- **`RequestQueue` / `EventQueue`** — ring buffers for the place→match→settle
  pipeline.
- **`Position`** — per-user per-market base position, entry price, realized PnL,
  funding snapshot, leverage.
- **`UserCollateral`** — cross-margin collateral balance.
- **`GlobalConfig`** — authority, vault, insurance fund, fee pool, trading flag.

---

## Tech stack

| Layer | Tech |
|---|---|
| Program | Rust · Anchor 0.31 |
| Oracle | Pyth (SOL/USD via Hermes) |
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 |
| Wallet | Solana Wallet Adapter (Phantom, Solflare) |
| Client | @coral-xyz/anchor · @solana/web3.js · @solana/spl-token |
| Hosting | Vercel |

---

## Repo layout

```
.
├── programs/perp-dex/        # Anchor program (Rust)
│   └── src/
│       ├── lib.rs            # instruction handlers
│       ├── state/            # accounts: market, slab, queues, position, …
│       ├── engine/           # matching, risk, funding, position manager
│       ├── instructions/     # per-instruction account contexts + logic
│       └── utils/            # order-id encoding, math helpers
├── tests/                    # Anchor integration tests
├── seed.mjs                  # localnet/devnet bootstrap (config, market, orders)
├── app/                      # Next.js frontend ("Zenith" terminal)
│   └── src/
│       ├── app/(dashboard)/  # /trade and /portfolio routes
│       ├── components/zenith # order book, order form, chart, positions, …
│       ├── hooks/            # on-chain data + actions (useOrderbook, useTrade, …)
│       └── lib/              # PDAs, slab reader, formatting, constants
└── Anchor.toml
```

---

## Running locally

### Prerequisites
- Rust + Solana CLI + Anchor 0.31
- Node.js 20+ and `npm`
- A funded keypair at `~/.config/solana/id.json`

### 1. Start a local validator and deploy
```bash
solana-test-validator --reset            # terminal 1
anchor build
anchor deploy --provider.cluster localnet
```

### 2. Create a USDC mint and seed the market
```bash
spl-token create-token --decimals 6      # note the mint address
spl-token create-account <MINT>
spl-token mint <MINT> 1000000
# set the mint in seed.mjs, then:
ANCHOR_PROVIDER_URL=http://localhost:8899 \
ANCHOR_WALLET=~/.config/solana/id.json node seed.mjs
```
This initializes the global config, creates the `SOL-PERP` market, deposits
collateral, and seeds resting orders (bids 148/147/145, asks 152/153/155).

### 3. Run the frontend
```bash
cd app
npm install
npm run dev                  # http://localhost:3000
```

### Frontend environment variables (`app/.env.local`)
```
NEXT_PUBLIC_NETWORK=localnet            # or devnet
NEXT_PUBLIC_RPC_ENDPOINT=http://localhost:8899
NEXT_PUBLIC_PROGRAM_ID=89zv4vQvHqPRsYfbyoR7Q65TgoV2XpZZM3QrBT4VCvde
NEXT_PUBLIC_USDC_MINT=<your USDC mint>
NEXT_PUBLIC_MARKET_SYMBOL=SOL-PERP
```

---

## Tests

```bash
anchor test
```
The suite covers the full lifecycle: bootstrap, deposit/withdraw with health
checks, order placement, cranking, multi-level matching, partial fills, position
settlement with entry-price averaging and funding, and admin resets.

---

## Using the app

1. Connect a Solana wallet (set Phantom to the matching network — Devnet or a
   Localnet custom RPC).
2. **Portfolio → Deposit** USDC collateral.
3. **Trade** — choose Long/Short, Market/Limit, size, and leverage (up to 20×),
   then submit. The order is placed, cranked, and settled into your position.
4. Watch live PnL update against the mark price; close from the Positions table.

---

## Notes & honest limitations

- **Index vs mark price.** The chart shows the live Pyth SOL/USD price; the demo
  market's mark is a fixed scale for the order book. A production deployment would
  peg the on-chain mark to Pyth so they coincide.
- **24h volume / change / open interest** in the top bar are placeholder values
  (marked "demo" in the UI). They require an off-chain indexer over historical
  trades, which is future work.
- **Keeper.** Cranking, funding updates, and oracle pushes are permissionless
  instructions; a production system would run a keeper bot to call them
  continuously.
- This is a devnet demo / portfolio project — not audited, not for mainnet funds.

---

## Roadmap

- Keeper bot (crank + funding + oracle push)
- Indexer for real volume / OI / trade history
- Mark price pegged to Pyth
- Multi-market support
- Security audit

---

Built on Solana with Anchor + Pyth.
