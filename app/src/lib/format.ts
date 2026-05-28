import { BN } from "@coral-xyz/anchor";
import {
  BASE_DECIMALS,
  PRICE_DECIMALS,
  QUOTE_DECIMALS,
  QUOTE_UNIT,
} from "./constants";

type Numeric = number | bigint | BN | string;

function toNumber(v: Numeric): number {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v);
  return v.toNumber();
}

/** USDC amount (raw 6-dp integer) → human number. */
export function fromQuote(raw: Numeric): number {
  return toNumber(raw) / QUOTE_UNIT;
}

/** Human USDC → raw 6-dp BN for instruction args. */
export function toQuote(amount: number): BN {
  return new BN(Math.round(amount * QUOTE_UNIT));
}

/** Format a USD value with a `$` prefix and thousands separators. */
export function usd(value: Numeric, dp = 2): string {
  const n = toNumber(value);
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })}`;
}

/** Format a raw USDC integer as a USD string. */
export function quoteUsd(raw: Numeric, dp = 2): string {
  return usd(fromQuote(raw), dp);
}

/** Format a price (already in human units). */
export function price(value: Numeric, dp = PRICE_DECIMALS): string {
  return toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

/** Format a position size with a signed prefix. */
export function size(value: Numeric, dp = BASE_DECIMALS): string {
  const n = toNumber(value);
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: dp,
  });
}

/** Basis points → percent string, e.g. 250 → "2.50%". */
export function bps(value: Numeric, dp = 2): string {
  return `${(toNumber(value) / 100).toFixed(dp)}%`;
}

/** A signed percent, used for PnL / funding. */
export function pct(value: Numeric, dp = 2): string {
  const n = toNumber(value);
  return `${n >= 0 ? "+" : ""}${n.toFixed(dp)}%`;
}

/** Truncate a pubkey for display, e.g. "81dJ…pZ6p". */
export function shortKey(key: string, head = 4, tail = 4): string {
  if (key.length <= head + tail + 1) return key;
  return `${key.slice(0, head)}…${key.slice(-tail)}`;
}

/** Compact relative-time-ish countdown from seconds. */
export function countdown(secs: number): string {
  if (secs <= 0) return "00:00:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const pad = (x: number) => x.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export { QUOTE_DECIMALS, BASE_DECIMALS, PRICE_DECIMALS };
