# SolLend Aggregator — Capstone Project Blueprint

## What We Are Building

A cross-protocol Solana lending management layer — one dashboard to scan all your lending positions across Kamino, MarginFi, and Solend, see exactly how much you are overpaying in interest, and refinance to a better protocol through a guided on-chain flow backed by an original Anchor smart contract.

**The one-liner:**
> "Instadapp for Solana — unified visibility and guided refinancing across all major Solana lending protocols."

---

## The Problem

### Background

Solana lending is a $6.4 billion market across 6 protocols as of 2026. The three we integrate — Kamino, MarginFi, Solend — represent the majority of that TVL. The JupLend launch in August 2025 proved that $750M+ moved manually between protocols within weeks purely because rates were better elsewhere.

**Users are losing money every day because no tool exists to show them this.**

### Pain 1 — Fragmented Visibility

A user with positions on 3 protocols has no single view of their combined health. They manage 3 separate tabs, 3 separate UIs, and have no idea what their total debt-to-equity ratio is across the whole ecosystem. They set LTVs 15–20% more conservative than necessary as a liquidation buffer — because they are not watching all 3 tabs at once.

**Cost:** On $100,000 in collateral, 15% excess conservatism = $15,000 of idle capital earning nothing.

### Pain 2 — Rate Blindness

USDC borrow rates across Kamino, MarginFi, and Solend can differ by 3–8 percentage points at any moment. A user borrowing $100,000 at 12% on MarginFi while Kamino offers 7% is losing $5,000 per year in unnecessary interest. They do not know. No tool tells them.

### Pain 3 — Operational Complexity

Manually refinancing a position from Protocol A to Protocol B requires:

1. Source spare capital or accept liquidation risk during the process
2. Repay debt on Protocol A
3. Withdraw collateral from Protocol A
4. Deposit collateral into Protocol B
5. Open new borrow on Protocol B

Five sequential transactions. Any one can fail due to slippage or network congestion. Most users attempt this at most once, get scared after a failed transaction, and never try again.

---

## The Solution

### Three Core Features

**1. Deep Scan + Global Health Dashboard**

Connect wallet → system reads all positions from Kamino, MarginFi, and Solend simultaneously → shows one unified health score, total collateral, total debt, and net interest per month.

**2. Rate Optimization Alerts**

For every active borrow position, the system compares rates across all protocols and shows: "You are paying 12.1% on MarginFi. Kamino offers 6.8%. You are losing $47.20/month."

Dollar amount, not percentages. Specific, not abstract.

**3. Guided On-Chain Refinancing**

User clicks Refinance. Our Anchor smart contract (RefinanceRouter) guides the execution:

- Step 1: Repay debt on source protocol (CPI)
- Step 2: Withdraw collateral from source protocol (CPI)
- Step 3: Deposit collateral into target protocol (CPI)
- Step 4: Open new borrow on target protocol (CPI)

Each step is a separate transaction the user approves. The program validates each step before proceeding. If anything fails, the user's funds stay safe — there is no single point of failure that leaves a position in an intermediate broken state.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                  Next.js 14 + Tailwind + shadcn/ui              │
│                                                                 │
│   WalletConnect  │  HealthDashboard  │  PositionTable          │
│   RefinanceFlow  │  ProtocolPicker   │  SavingsCalculator      │
└────────────────────────────┬────────────────────────────────────┘
                             │  TypeScript SDK calls
┌────────────────────────────▼────────────────────────────────────┐
│                      PROTOCOL SDKs                              │
│                                                                 │
│  @kamino-finance/klend-sdk   → read Kamino positions + rates   │
│  @mrgnlabs/marginfi-client-v2 → read MarginFi positions + rates │
│  @solendprotocol/solend-sdk  → read Solend positions + rates   │
│  @pythnetwork/client         → SOL/USD price feed (devnet)     │
└────────────────────────────┬────────────────────────────────────┘
                             │  on-chain execution
┌────────────────────────────▼────────────────────────────────────┐
│               YOUR ANCHOR PROGRAM — RefinanceRouter             │
│                     (Rust, deployed to devnet)                  │
│                                                                 │
│  instruction: initiate_refinance()                             │
│    → validates source + target protocol                        │
│    → CPI: repay on source protocol                             │
│    → CPI: withdraw collateral from source                      │
│    → CPI: deposit collateral into target                       │
│    → CPI: borrow from target                                   │
│    → emits RefinanceCompleted event                            │
│                                                                 │
│  instruction: validate_health()                                │
│    → reads positions from all protocols                        │
│    → computes weighted health factor                           │
│    → returns GlobalHealthState                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │  CPI calls
┌────────────────────────────▼────────────────────────────────────┐
│                    PROTOCOL PROGRAMS                            │
│                                                                 │
│  Kamino Lending   KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD │
│  MarginFi v2      MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA │
│  Solend           devnet.solend.fi                             │
│  Pyth Oracle      devnet price feeds (SOL/USD, BTC/USD, etc.)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Smart Contract | Rust + Anchor framework | RefinanceRouter program |
| Frontend | Next.js 14 + TypeScript | Dashboard + UI |
| Styling | Tailwind CSS + shadcn/ui | Component library |
| Wallet | Solana Wallet Adapter | Phantom devnet connection |
| Kamino | @kamino-finance/klend-sdk | Read positions + execute CPIs |
| MarginFi | @mrgnlabs/marginfi-client-v2 | Read positions + execute CPIs |
| Solend | @solendprotocol/solend-sdk | Read positions + execute CPIs |
| Prices | @pythnetwork/client | SOL/USD devnet price feed |
| RPC | Helius devnet | Fast reliable RPC |
| Testing | Anchor test + LiteSVM | Smart contract unit tests |

---

## Folder Structure

```
capstone/
├── programs/
│   └── refinance-router/
│       ├── src/
│       │   ├── lib.rs              ← program entry point
│       │   ├── instructions/
│       │   │   ├── initiate_refinance.rs
│       │   │   ├── validate_health.rs
│       │   │   └── mod.rs
│       │   ├── state/
│       │   │   ├── refinance_state.rs
│       │   │   └── mod.rs
│       │   └── errors.rs
│       └── Cargo.toml
├── app/                            ← Next.js frontend
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   ├── GlobalHealth.tsx
│   │   ├── PositionTable.tsx
│   │   ├── RefinanceModal.tsx
│   │   └── SavingsAlert.tsx
│   ├── hooks/
│   │   ├── useKaminoPositions.ts
│   │   ├── useMarginFiPositions.ts
│   │   ├── useSolendPositions.ts
│   │   └── useGlobalHealth.ts
│   ├── lib/
│   │   ├── kamino.ts
│   │   ├── marginfi.ts
│   │   ├── solend.ts
│   │   └── health.ts
│   └── pages/
│       └── index.tsx
├── tests/
│   └── refinance-router.ts         ← Anchor integration tests
├── Anchor.toml
├── Cargo.toml
├── package.json
└── BLUEPRINT.md                    ← this file
```

---

## Smart Contract Design

### Program: RefinanceRouter

**Accounts:**

```rust
#[account]
pub struct RefinanceState {
    pub user: Pubkey,               // wallet initiating refinance
    pub source_protocol: u8,        // 0=Kamino, 1=MarginFi, 2=Solend
    pub target_protocol: u8,        // 0=Kamino, 1=MarginFi, 2=Solend
    pub collateral_mint: Pubkey,    // e.g. SOL or jitoSOL
    pub debt_mint: Pubkey,          // e.g. USDC
    pub collateral_amount: u64,     // amount being moved
    pub debt_amount: u64,           // debt being refinanced
    pub step: u8,                   // current step 0-4
    pub bump: u8,
}
```

**Instructions:**

```rust
// Step 1: Initialize a refinance session, validate source position exists
pub fn initiate_refinance(ctx, source, target, amounts) -> Result<()>

// Step 2: Repay debt on source protocol via CPI
pub fn repay_source(ctx) -> Result<()>

// Step 3: Withdraw collateral from source protocol via CPI
pub fn withdraw_source(ctx) -> Result<()>

// Step 4: Deposit collateral into target protocol via CPI
pub fn deposit_target(ctx) -> Result<()>

// Step 5: Borrow from target protocol via CPI, close refinance state
pub fn borrow_target(ctx) -> Result<()>
```

**Why multiple instructions instead of one?**

MarginFi's flash loan program explicitly blocks being called from within a CPI (stack height check). To keep the contract safe and compatible, each step is a separate instruction the user signs. The RefinanceState PDA tracks progress. If any step fails, the state account records where we stopped — the frontend shows the user what happened and how to recover.

---

## Devnet Setup

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest && avm use latest

# Install Node.js dependencies (from project root)
npm install
```

### Devnet Configuration

```bash
# Point Solana CLI to devnet
solana config set --url devnet

# Create a new keypair for testing
solana-keygen new --outfile ~/.config/solana/devnet.json
solana config set --keypair ~/.config/solana/devnet.json

# Airdrop devnet SOL (run multiple times if needed)
solana airdrop 2
```

### Get Devnet Tokens

```bash
# Devnet USDC — visit in browser:
# https://spl-token-faucet.com/?token-name=USDC-Dev
# Mint address: Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr

# Or use the CLI faucet script (provided in /scripts/airdrop-tokens.ts)
npx ts-node scripts/airdrop-tokens.ts
```

### Deploy Your Program

```bash
# Build the Anchor program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests against devnet
anchor test --provider.cluster devnet
```

---

## Build Phases

### Phase 1 — Position Reader (Week 1–2)

**Goal:** Connect wallet, read all positions from all 3 protocols, display raw data.

Tasks:
- [ ] Initialize Anchor project + Next.js app
- [ ] Integrate Solana Wallet Adapter (Phantom devnet)
- [ ] Write `useKaminoPositions` hook — fetch obligation accounts
- [ ] Write `useMarginFiPositions` hook — fetch marginfi accounts
- [ ] Write `useSolendPositions` hook — fetch obligation accounts
- [ ] Integrate Pyth devnet price feed for USD values
- [ ] Display raw position data on screen

**Done when:** Connect a devnet wallet with positions on 2+ protocols and see them all listed.

---

### Phase 2 — Global Health Dashboard (Week 3)

**Goal:** Compute and display unified health score, totals, and rate alerts.

Tasks:
- [ ] Build `health.ts` — calculate weighted health factor across protocols
- [ ] Build `GlobalHealth.tsx` component
- [ ] Build `PositionTable.tsx` — per-position cards with color-coded health
- [ ] Build `SavingsCalculator` — compare rates, compute monthly savings in dollars
- [ ] Show "You are losing $X/month" alert per position
- [ ] Add protocol logos + color coding

**Done when:** Dashboard shows one health number, total collateral/debt, and at least one rate alert with dollar savings.

---

### Phase 3 — Anchor Program (Week 4–5)

**Goal:** Write, test, and deploy the RefinanceRouter program to devnet.

Tasks:
- [ ] Write `RefinanceState` account struct
- [ ] Write `initiate_refinance` instruction + validation
- [ ] Write `repay_source` instruction with MarginFi CPI
- [ ] Write `withdraw_source` instruction with MarginFi CPI
- [ ] Write `deposit_target` instruction with Kamino CPI
- [ ] Write `borrow_target` instruction with Kamino CPI
- [ ] Write Anchor tests for happy path + failure cases
- [ ] Deploy to devnet, verify on Solana Explorer

**Done when:** A full refinance from MarginFi → Kamino completes on devnet in 4 steps with no fund loss.

---

### Phase 4 — Guided Refinance UI (Week 6)

**Goal:** Connect the frontend to the Anchor program with a clean step-by-step flow.

Tasks:
- [ ] Build `RefinanceModal.tsx` — side-by-side protocol comparison
- [ ] Show monthly savings, protocol safety score, health factor impact
- [ ] Wire up each step to the corresponding program instruction
- [ ] Show step progress indicator (Step 2 of 4)
- [ ] Handle transaction failures gracefully — show what happened + recovery path
- [ ] Update dashboard live after each step completes

**Done when:** Full refinance from MarginFi → Kamino visible end-to-end in the UI on devnet.

---

### Phase 5 — Polish + Demo Prep (Week 7–8)

**Goal:** Demo-ready, no rough edges, presentation prepared.

Tasks:
- [ ] Add loading skeletons for position fetch
- [ ] Add error states for RPC failures
- [ ] Add transaction confirmation toasts
- [ ] Mobile-responsive layout
- [ ] Seed devnet wallets with realistic test positions for demo
- [ ] Record demo video (2-minute walkthrough)
- [ ] Prepare presentation slides

---

## Protocol Safety Scores

Each protocol gets a score (1–10) used in recommendations. Scoring criteria:

| Factor | Weight |
|---|---|
| TVL (higher = safer) | 30% |
| Audit status | 25% |
| Protocol age | 20% |
| Current borrow APR | 15% |
| Liquidation parameters (max LTV) | 10% |

Approximate scores for capstone (update with live data):

| Protocol | Score | TVL | Audited |
|---|---|---|---|
| Kamino | 9.1 | $2.8B | Yes |
| MarginFi | 8.4 | $1.2B | Yes |
| Solend | 7.6 | $400M | Yes |

---

## Demo Script (2 Minutes)

```
0:00  Open app. Click "Connect Wallet". Phantom opens on devnet.

0:15  "Scanning your positions across 3 protocols..."
      Progress bar fills. 3 positions appear.

0:30  Global Health Score: 71 — MODERATE
      Total Collateral: $47,230
      Total Debt: $18,400
      Net Interest: -$184/month

0:45  Position table shows:
      MarginFi — 5 jitoSOL collateral — 2,000 USDC debt — 🔴 Health 1.15
      Alert badge: "💡 Refinancing to Kamino saves $47.20/month"

1:00  Click the alert badge. Refinance modal opens.
      Side by side: MarginFi 12.1% vs Kamino 6.8%
      "Move this position to Kamino and save $47.20/month — $566/year"

1:15  Click "Start Refinance". Step 1 of 4.
      "Repaying MarginFi debt..." — user signs transaction.

1:30  Step 2 of 4: "Withdrawing collateral from MarginFi..." — signed.
      Step 3 of 4: "Depositing into Kamino..." — signed.
      Step 4 of 4: "Opening new borrow on Kamino..." — signed.

1:45  "Refinance Complete ✅"
      Dashboard refreshes. MarginFi position gone.
      Kamino position appears. Health factor: 2.3 🟢
      Net interest updated: -$136/month

2:00  "You saved $47.20/month — $566 per year — in 4 transactions."
```

---

## Roadmap Beyond Capstone

**V1 — Atomic Refinancing**
Replace 4-step guided flow with a single atomic transaction using Kamino flash loans. One signature, one transaction, all or nothing.

**V2 — Automated Protection**
On-chain keeper program that monitors health factors and auto-repays debt if health drops below user-defined threshold.

**V3 — Additional Protocols**
Add JupLend, Drift, Port. The RefinanceRouter is designed to be protocol-agnostic — adding a new protocol is adding a new CPI module.

**V4 — Mobile App**
Solana Mobile Stack (SMS) integration. Push notifications for health factor warnings.

---

## Key Decisions & Why

**Why guided multi-step instead of atomic flash loan?**
MarginFi flash loans cannot be called from within a CPI (stack height check). Kamino flash loans can, but combining 4 protocol CPIs in one transaction hits Solana's compute unit limits (1.4M CU). The guided flow is safer, more transparent, and achievable within the capstone timeline. Atomic refinancing is V1.

**Why 3 protocols and not 5?**
JupLend and Drift lending have limited devnet support and newer, less-documented SDKs. Starting with the 3 most established protocols (Kamino, MarginFi, Solend) gives a complete, defensible demo. Adding protocols later is modular.

**Why Anchor and not native Solana programs?**
Anchor dramatically reduces boilerplate, handles PDA derivation, generates TypeScript IDL automatically, and has the best devnet tooling. For a capstone timeline, Anchor is the right choice.

**Why not one-click instead of guided?**
Atomic cross-protocol transactions are complex to debug and risky. A transparent step-by-step flow is better UX for users who want to understand what is happening with their funds — and better for a capstone demo where judges can see exactly what each step does.
