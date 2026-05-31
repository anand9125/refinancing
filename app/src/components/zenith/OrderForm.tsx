"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMarket } from "@/hooks/useMarket";
import { useCollateral } from "@/hooks/useCollateral";
import { useOrderbook } from "@/hooks/useOrderbook";
import { useTrade } from "@/hooks/useTrade";
import { usePosition } from "@/hooks/usePosition";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { MIN_LEVERAGE, MAX_LEVERAGE, DEFAULT_LEVERAGE } from "@/lib/constants";
import { usd, price as fmtPrice, size as fmtSize } from "@/lib/format";

const LEV_TICKS = [1, 5, 10, 15, 20];

export function OrderForm() {
  const { market, refresh: refreshMarket } = useMarket();
  const { collateral, refresh: refreshCollateral } = useCollateral();
  const { book, refresh: refreshBook } = useOrderbook();
  const { refresh: refreshPosition } = usePosition();
  const { place, busy } = useTrade();
  const { isConnected } = useConnectedWallet();

  const [side, setSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [priceStr, setPriceStr] = useState("");
  const [sizeStr, setSizeStr] = useState("");
  const [leverage, setLeverage] = useState(DEFAULT_LEVERAGE);

  // On-chain prices are ~150-scale integers; treat as USD for display + math.
  const mark = market?.oraclePrice ?? 0;
  const bestBid = book.bestBid !== null ? Number(book.bestBid) : null;
  const bestAsk = book.bestAsk !== null ? Number(book.bestAsk) : null;
  const refMarket = side === "long" ? bestAsk ?? mark : bestBid ?? mark;
  const available = collateral?.amount ?? 0;

  const sizeNum = parseFloat(sizeStr) || 0;
  const priceNum =
    orderType === "market" ? refMarket : parseFloat(priceStr) || 0;
  const notional = sizeNum * priceNum;
  const marginRequired = leverage > 0 ? notional / leverage : 0;
  const takerFee = market ? (notional * market.takerFeeBps) / 10_000 : 0;

  const liqPrice = useMemo(() => {
    if (!market || priceNum <= 0 || sizeNum <= 0) return null;
    const mm = market.mmBps / 10_000;
    const f =
      side === "long" ? 1 - (1 / leverage - mm) : 1 + (1 / leverage - mm);
    return priceNum * f;
  }, [market, priceNum, sizeNum, leverage, side]);

  function setPctOfFree(pct: number) {
    if (priceNum <= 0) return;
    const buyingPower = available * leverage * pct;
    const qty = buyingPower / priceNum;
    setSizeStr(qty > 0 ? String(Math.max(1, Math.round(qty))) : "");
  }

  async function onSubmit() {
    if (!isConnected) {
      toast.error("Connect your wallet first");
      return;
    }
    if (sizeNum <= 0) {
      toast.error("Enter a size");
      return;
    }
    if (orderType === "limit" && priceNum <= 0) {
      toast.error("Enter a limit price");
      return;
    }
    if (!market) {
      toast.error("Market not loaded");
      return;
    }
    try {
      const sig = await place({
        side: side === "long" ? "buy" : "sell",
        kind: orderType,
        qty: Math.round(sizeNum),
        limitPrice: Math.round(priceNum),
        leverage,
        imBps: market.imBps,
      });
      toast.success(
        `${side === "long" ? "Long" : "Short"} ${fmtSize(sizeNum, 0)} SOL submitted`,
        { description: sig ? `Tx ${sig.slice(0, 8)}…` : undefined },
      );
      setSizeStr("");
      refreshPosition();
      refreshCollateral();
      refreshMarket();
      refreshBook();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Order failed");
    }
  }

  const isLong = side === "long";

  return (
    <div className="surface-2 flex flex-col">
      <div className="grid grid-cols-2 gap-1.5 border-b hairline p-1.5">
        <button
          onClick={() => setSide("long")}
          className={`mono rounded-sm2 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
            isLong ? "text-long" : "text-dim hover:text-bright"
          }`}
          style={isLong ? { background: "rgba(31,203,124,0.12)" } : undefined}
        >
          Long / Buy
        </button>
        <button
          onClick={() => setSide("short")}
          className={`mono rounded-sm2 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
            !isLong ? "text-short" : "text-dim hover:text-bright"
          }`}
          style={!isLong ? { background: "rgba(240,97,109,0.12)" } : undefined}
        >
          Short / Sell
        </button>
      </div>

      <div className="flex items-center border-b hairline px-3">
        {(["market", "limit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`relative px-3 py-2.5 text-xs capitalize transition-colors ${
              orderType === t ? "text-bright" : "text-dim hover:text-bright"
            }`}
          >
            {t}
            {orderType === t && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-[#1fcb7c]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <span className="micro-label">Available</span>
          <span className="mono text-xs text-bright">
            {isConnected ? usd(available) : "—"}
          </span>
        </div>

        <Field label="Price (USD)" suffix="USD" disabled={orderType === "market"}>
          <input
            value={orderType === "market" ? "Market" : priceStr}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) setPriceStr(v);
            }}
            disabled={orderType === "market"}
            placeholder="0"
            inputMode="decimal"
            autoComplete="off"
            className="mono w-full bg-transparent text-sm text-bright outline-none disabled:text-muted"
          />
        </Field>

        <Field label="Size (SOL)" suffix="SOL">
          <input
            value={sizeStr}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) setSizeStr(v);
            }}
            placeholder="0"
            inputMode="decimal"
            autoComplete="off"
            className="mono w-full bg-transparent text-sm text-bright outline-none placeholder:text-muted"
          />
        </Field>

        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPctOfFree(p / 100)}
              className="mono surface-3 rounded-sm2 py-1.5 text-[11px] text-dim transition-colors hover:text-bright"
            >
              {p}%
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="micro-label">Leverage</span>
            <span
              className={`mono text-base font-medium ${isLong ? "text-long" : "text-short"}`}
            >
              {leverage}×
            </span>
          </div>
          <input
            type="range"
            min={MIN_LEVERAGE}
            max={MAX_LEVERAGE}
            step={1}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="zenith-slider"
            style={{ accentColor: isLong ? "#1fcb7c" : "#f0616d" }}
          />
          <div className="flex justify-between">
            {LEV_TICKS.map((t) => (
              <button
                key={t}
                onClick={() => setLeverage(t)}
                className="mono text-[10px] text-muted transition-colors hover:text-dim"
              >
                {t}×
              </button>
            ))}
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-2 border-t hairline pt-3">
          <SummaryRow label="Order Value" value={usd(notional)} />
          <SummaryRow label="Size" value={`${fmtSize(sizeNum, 0)} SOL`} />
          <SummaryRow label="Margin Required" value={usd(marginRequired)} />
          <SummaryRow
            label="Est. Liq. Price"
            value={liqPrice !== null ? `$${fmtPrice(liqPrice, 0)}` : "—"}
            tone="short"
          />
          <SummaryRow label="Taker Fee" value={usd(takerFee)} dim />
        </div>

        <button
          onClick={onSubmit}
          disabled={busy || !isConnected}
          className="mono rounded-sm2 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: isLong ? "#1fcb7c" : "#f0616d", color: isLong ? "#03110a" : "#fff" }}
        >
          {!isConnected
            ? "Connect Wallet"
            : busy
              ? "Submitting…"
              : isLong
                ? "Buy / Long SOL"
                : "Sell / Short SOL"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  suffix,
  disabled,
  children,
}: {
  label: string;
  suffix?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`surface-1 flex flex-col gap-1 rounded-sm2 border hairline px-3 py-2 focus-within:border-[rgba(255,255,255,0.12)] ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="micro-label">{label}</span>
        {suffix && <span className="micro-label">{suffix}</span>}
      </div>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  tone,
  dim,
}: {
  label: string;
  value: string;
  tone?: "long" | "short";
  dim?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-dim">{label}</span>
      <span
        className={`mono ${
          tone === "long"
            ? "text-long"
            : tone === "short"
              ? "text-short"
              : dim
                ? "text-dim"
                : "text-bright"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
