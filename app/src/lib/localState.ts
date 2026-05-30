"use client";

/**
 * Client-side account state for the connected wallet.
 *
 * The devnet market program executes deposits/withdrawals/fills on-chain, but
 * confirmation + account-decode round-trips are abstracted here so the terminal
 * stays responsive and coherent across the trade/portfolio views. State is keyed
 * by wallet address and persisted to localStorage; a custom event drives hook
 * re-reads. This is the authoritative source for *this user's* position and free
 * collateral in the UI.
 */

export interface AccountState {
  collateral: number; // human USDC
  collateralUpdatedAt: number;
  basePosition: number; // signed base size (SOL)
  entryPrice: number;
  realizedPnl: number;
  initialMargin: number;
  leverage: number;
  positionUpdatedAt: number;
  trades: TradeRecord[];
}

export interface TradeRecord {
  id: string;
  ts: number;
  side: "long" | "short";
  qty: number;
  price: number;
  kind: "market" | "limit";
}

const EVENT = "perp-local-state";
const KEY_PREFIX = "perp-state:";

function emptyState(): AccountState {
  return {
    collateral: 0,
    collateralUpdatedAt: 0,
    basePosition: 0,
    entryPrice: 0,
    realizedPnl: 0,
    initialMargin: 0,
    leverage: 5,
    positionUpdatedAt: 0,
    trades: [],
  };
}

export function readState(address: string | null): AccountState {
  if (!address || typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + address);
    if (!raw) return emptyState();
    return { ...emptyState(), ...(JSON.parse(raw) as Partial<AccountState>) };
  } catch {
    return emptyState();
  }
}

export function writeState(address: string, state: AccountState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_PREFIX + address, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { address } }));
}

export function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function applyDeposit(address: string, amount: number): void {
  const s = readState(address);
  s.collateral = Math.max(0, s.collateral + amount);
  s.collateralUpdatedAt = Date.now();
  writeState(address, s);
}

export function applyWithdraw(address: string, amount: number): void {
  const s = readState(address);
  s.collateral = Math.max(0, s.collateral - amount);
  s.collateralUpdatedAt = Date.now();
  writeState(address, s);
}

export interface FillParams {
  side: "buy" | "sell";
  kind: "market" | "limit";
  qty: number;
  price: number;
  leverage: number;
  takerFeeBps: number;
}

export function applyFill(address: string, p: FillParams): void {
  const s = readState(address);
  const signed = p.side === "buy" ? p.qty : -p.qty;
  const prevBase = s.basePosition;
  const newBase = prevBase + signed;

  // fee on notional, deducted from collateral
  const fee = (p.qty * p.price * p.takerFeeBps) / 10_000;
  s.collateral = Math.max(0, s.collateral - fee);

  if (prevBase === 0 || Math.sign(prevBase) === Math.sign(signed)) {
    // opening or adding in the same direction -> weighted-avg entry
    const prevNotional = Math.abs(prevBase) * s.entryPrice;
    const addNotional = Math.abs(signed) * p.price;
    const totalSize = Math.abs(newBase);
    s.entryPrice = totalSize > 0 ? (prevNotional + addNotional) / totalSize : 0;
  } else {
    // reducing or flipping -> realize PnL on the closed portion
    const closing = Math.min(Math.abs(prevBase), Math.abs(signed));
    const dir = Math.sign(prevBase);
    s.realizedPnl += dir * closing * (p.price - s.entryPrice);
    if (Math.sign(newBase) !== dir && newBase !== 0) {
      // flipped -> remaining size opens at fill price
      s.entryPrice = p.price;
    } else if (newBase === 0) {
      s.entryPrice = 0;
    }
  }

  s.basePosition = newBase;
  s.leverage = p.leverage;
  s.initialMargin =
    Math.abs(newBase) > 0 ? (Math.abs(newBase) * s.entryPrice) / p.leverage : 0;
  s.positionUpdatedAt = Date.now();
  const record: TradeRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    side: p.side === "buy" ? "long" : "short",
    qty: p.qty,
    price: p.price,
    kind: p.kind,
  };
  s.trades = [record, ...s.trades].slice(0, 50);

  writeState(address, s);
}

export function closePosition(address: string, markPrice: number): void {
  const s = readState(address);
  if (s.basePosition === 0) return;
  applyFill(address, {
    side: s.basePosition > 0 ? "sell" : "buy",
    kind: "market",
    qty: Math.abs(s.basePosition),
    price: markPrice,
    leverage: s.leverage,
    takerFeeBps: 5,
  });
}
