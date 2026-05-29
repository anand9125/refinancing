"use client";

import { useState, useMemo } from "react";
import { Zap } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { useTrade, type Side, type OrderKind } from "@/hooks/useTrade";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import type { MarketData } from "@/hooks/useMarket";
import type { CollateralData } from "@/hooks/useCollateral";
import { DEFAULT_LEVERAGE, MAX_LEVERAGE, MIN_LEVERAGE } from "@/lib/constants";
import { price as fmtPrice, usd } from "@/lib/format";

export function OrderForm({
  market,
  collateral,
  bestBid,
  bestAsk,
  onDone,
}: {
  market: MarketData | null;
  collateral: CollateralData | null;
  bestBid: bigint | null;
  bestAsk: bigint | null;
  onDone?: (sig: string) => void;
}) {
  const { isConnected } = useConnectedWallet();
  const { place, busy } = useTrade();

  const [side, setSide] = useState<Side>("buy");
  const [kind, setKind] = useState<OrderKind>("limit");
  const [qty, setQty] = useState("");
  const [limit, setLimit] = useState("");
  const [leverage, setLeverage] = useState(DEFAULT_LEVERAGE);
  const [error, setError] = useState<string | null>(null);

  const refPrice = useMemo(() => {
    if (kind === "limit" && limit) return Number(limit);
    if (side === "buy" && bestAsk !== null) return Number(bestAsk);
    if (side === "sell" && bestBid !== null) return Number(bestBid);
    return market?.oraclePrice ?? 0;
  }, [kind, limit, side, bestAsk, bestBid, market]);

  const notional = useMemo(
    () => (Number(qty) || 0) * refPrice,
    [qty, refPrice]
  );
  const marginRequired = useMemo(
    () => (leverage ? notional / leverage : 0),
    [notional, leverage]
  );

  const canSubmit =
    isConnected &&
    !busy &&
    Number(qty) > 0 &&
    (kind === "market" || Number(limit) > 0) &&
    !!market;

  async function submit() {
    setError(null);
    if (!market) return;
    try {
      const sig = await place({
        side,
        kind,
        qty: Math.round(Number(qty)),
        limitPrice: Math.round(Number(limit) || 0),
        leverage,
        imBps: market.imBps,
      });
      setQty("");
      setLimit("");
      onDone?.(sig);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Order failed");
    }
  }

  const buy = side === "buy";

  return (
    <div className="flex flex-col gap-4">
      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-2">
        {(["buy", "sell"] as const).map((s) => {
          const active = side === s;
          const isBuy = s === "buy";
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={`h-10 rounded-md font-ui text-[14px] font-bold uppercase tracking-wide transition-all cursor-pointer border ${
                active
                  ? isBuy
                    ? "bg-accent/15 border-accent/40 text-accent"
                    : "bg-danger/15 border-danger/40 text-danger"
                  : "bg-white/[0.02] border-border-base text-text-muted hover:text-text-dim"
              }`}
            >
              {isBuy ? "Long / Buy" : "Short / Sell"}
            </button>
          );
        })}
      </div>

      {/* Order kind */}
      <SegmentedTabs
        tabs={[
          { value: "limit" as const, label: "Limit" },
          { value: "market" as const, label: "Market" },
        ]}
        value={kind}
        onChange={setKind}
      />

      {/* Limit price */}
      {kind === "limit" && (
        <Field
          label="Limit price"
          value={limit}
          onChange={setLimit}
          placeholder={refPrice ? fmtPrice(refPrice, 0) : "0"}
          suffix="USDC"
        />
      )}

      {/* Quantity */}
      <Field
        label="Size"
        value={qty}
        onChange={setQty}
        placeholder="0"
        suffix="base"
      />

      {/* Leverage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-ui text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
            Leverage
          </span>
          <span className="font-num text-[13px] font-bold text-accent">
            {leverage}×
          </span>
        </div>
        <input
          type="range"
          min={MIN_LEVERAGE}
          max={MAX_LEVERAGE}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="w-full accent-[#1DB67D] cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          {[1, 5, 10, 15, 20].map((l) => (
            <span key={l} className="font-num text-[10px] text-text-faint">
              {l}×
            </span>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-white/[0.02] border border-border-muted px-4 py-3 space-y-2">
        <Row label="Order value" value={notional ? usd(notional) : "—"} />
        <Row
          label="Margin required"
          value={marginRequired ? usd(marginRequired) : "—"}
        />
        <Row
          label="Free collateral"
          value={collateral ? usd(collateral.amount) : "—"}
        />
      </div>

      {error && (
        <p className="font-ui text-[12px] text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className={`h-11 rounded-md font-ui text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-all ${
          canSubmit
            ? buy
              ? "bg-[linear-gradient(135deg,#1DB67D_0%,#27C98C_100%)] text-surface-1 cursor-pointer hover:shadow-[0_6px_16px_rgba(29,182,125,0.25)]"
              : "bg-[linear-gradient(135deg,#E5534B_0%,#F06A62_100%)] text-white cursor-pointer hover:shadow-[0_6px_16px_rgba(229,83,75,0.25)]"
            : "bg-white/[0.04] text-text-muted cursor-not-allowed"
        }`}
      >
        <Zap size={15} strokeWidth={2.5} />
        {!isConnected
          ? "Connect wallet"
          : busy
          ? "Submitting…"
          : `${buy ? "Buy" : "Sell"} ${market?.symbol ?? ""}`}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div>
      <span className="font-ui text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted mb-1.5 block">
        {label}
      </span>
      <div className="relative">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d*\.?\d*$/.test(v)) onChange(v);
          }}
          placeholder={placeholder}
          className="w-full h-11 rounded-md bg-surface-0 border border-border-base px-3 pr-16 font-num text-[15px] text-text-bright placeholder:text-text-faint focus:outline-none focus:border-accent/50 transition-colors"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-ui text-[11px] font-semibold text-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-ui text-[12px] text-text-muted">{label}</span>
      <span className="font-num text-[13px] font-semibold text-text-base">
        {value}
      </span>
    </div>
  );
}
