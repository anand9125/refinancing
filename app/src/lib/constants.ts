import { PublicKey } from "@solana/web3.js";

// ── Network ──────────────────────────────────────────────────────────────────
export const NETWORK =
  (process.env.NEXT_PUBLIC_NETWORK as "devnet" | "localnet" | undefined) ??
  "localnet";

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "http://localhost:8899";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
    "89zv4vQvHqPRsYfbyoR7Q65TgoV2XpZZM3QrBT4VCvde"
);

// ── USDC / collateral mint ───────────────────────────────────────────────────
export const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ??
    "Dy8h2ubUKjJGF8UunojRTUWvx3nZiny6wm4QyffbtPug"
);

// ── Market ───────────────────────────────────────────────────────────────────
export const MARKET_SYMBOL =
  process.env.NEXT_PUBLIC_MARKET_SYMBOL ?? "SOL-PERP";
export const BASE_SYMBOL = "SOL";

// ── Decimals / scaling ───────────────────────────────────────────────────────
export const QUOTE_DECIMALS = 6; // USDC
export const PRICE_DECIMALS = 2;
export const BASE_DECIMALS = 4;
export const QUOTE_UNIT = 10 ** QUOTE_DECIMALS;

// ── Leverage bounds ──────────────────────────────────────────────────────────
export const MIN_LEVERAGE = 1;
export const MAX_LEVERAGE = 20;
export const DEFAULT_LEVERAGE = 5;

// ── Explorer ─────────────────────────────────────────────────────────────────
export function explorerTx(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}?cluster=${NETWORK === "localnet" ? "custom" : NETWORK}`;
}

export function explorerAddress(addr: string): string {
  return `https://explorer.solana.com/address/${addr}?cluster=${NETWORK === "localnet" ? "custom" : NETWORK}`;
}
