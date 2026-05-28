import { PublicKey } from "@solana/web3.js";

/** Network the app talks to. Switch to "localnet" for local validator testing. */
export const NETWORK = "devnet";

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "https://api.devnet.solana.com";

/** Deployed perp-dex program. */
export const PROGRAM_ID = new PublicKey(
  "81dJfLhAbLPYQKbEHskyLvQdzbQffJzG9tVVfFRhpZ6p"
);

/**
 * Quote-currency mint (USDC) used for collateral. On devnet this is the
 * spl-token-faucet USDC; override via env for localnet.
 */
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ??
    "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);

/** Default market the UI loads. The on-chain symbol is encoded as raw bytes. */
export const MARKET_SYMBOL = process.env.NEXT_PUBLIC_MARKET_SYMBOL ?? "SOL-PERP";

/** Base asset of the default market (display only). */
export const BASE_SYMBOL = "SOL";

// ── Decimals / scaling ──────────────────────────────────────────────────────
// Collateral is USDC (6 decimals). Prices and quantities are stored as raw
// integers on-chain; these scales convert them to human units for display.
export const QUOTE_DECIMALS = 6; // USDC
export const PRICE_DECIMALS = 2; // mark/limit prices shown with 2 dp
export const BASE_DECIMALS = 4; // position size precision

export const QUOTE_UNIT = 10 ** QUOTE_DECIMALS;

// ── Leverage bounds ─────────────────────────────────────────────────────────
export const MIN_LEVERAGE = 1;
export const MAX_LEVERAGE = 20;
export const DEFAULT_LEVERAGE = 5;

// ── Explorer ────────────────────────────────────────────────────────────────
export function explorerTx(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}?cluster=${NETWORK}`;
}

export function explorerAddress(addr: string): string {
  return `https://explorer.solana.com/address/${addr}?cluster=${NETWORK}`;
}
