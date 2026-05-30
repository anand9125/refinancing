"use client";

import { useEffect, useRef, useState } from "react";
import { Stat } from "./Stat";
import { Sparkline } from "./Sparkline";
import { useMarket } from "@/hooks/useMarket";
import { useOraclePrice } from "@/hooks/useOraclePrice";
import { price as fmtPrice, bps, countdown } from "@/lib/format";

export function TopMarketBar() {
  const { market } = useMarket();
  const { price: oracle, history } = useOraclePrice();

  // On-chain mark price for this market (raw ~150 integer, shown as-is).
  const mark = market?.oraclePrice ?? null;

  // tick flash on mark change
  const [dir, setDir] = useState<"up" | "down" | null>(null);
  const prevMark = useRef<number | null>(null);
  useEffect(() => {
    if (mark === null) return;
    if (prevMark.current !== null && mark !== prevMark.current) {
      setDir(mark > prevMark.current ? "up" : "down");
    }
    prevMark.current = mark;
  }, [mark]);
  useEffect(() => {
    if (!dir) return;
    const id = setTimeout(() => setDir(null), 400);
    return () => clearTimeout(id);
  }, [dir, mark]);

  // next-funding countdown, ticks every second
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const nextFunding =
    market !== null
      ? Math.max(0, market.lastFundingTs + market.fundingIntervalSecs - now)
      : 0;

  // funding / 1h derived from on-chain cumFunding
  const fundingPct = market ? market.cumFunding * 100 : 0;

  // Real Pyth SOL/USD history for the sparkline; fall back to flat mark.
  const spark =
    history.length >= 2 ? history : mark !== null ? [mark, mark] : [];

  return (
    <div className="surface-1 sticky top-12 z-30 border-b hairline">
      <div className="flex h-16 items-stretch overflow-x-auto">
        <div className="flex shrink-0 items-center gap-3 border-r hairline px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] text-[10px] font-bold text-black">
            SOL
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm font-semibold text-bright">
              {market?.symbol ?? "SOL-PERP"}
            </span>
            <span className="micro-label">Perpetual</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col justify-center gap-1 border-r hairline px-5">
          <span className="micro-label">Mark Price</span>
          <span
            className={`mono text-2xl font-medium tracking-tight ${
              dir === "up"
                ? "tick-up"
                : dir === "down"
                  ? "tick-down"
                  : "text-bright"
            }`}
          >
            {mark !== null ? fmtPrice(mark, 0) : "—"}
          </span>
        </div>

        <div className="flex items-stretch">
          <Stat label="24h Change" value="+2.34%" accent="long" demo />
          <Stat label="24h Volume" value="$1.2M" demo />
          <Stat label="Open Interest" value="$890K" demo />
          <Stat
            label="Funding / 1h"
            value={`${fundingPct >= 0 ? "+" : ""}${fundingPct.toFixed(4)}%`}
            accent={fundingPct >= 0 ? "long" : "short"}
          />
          <Stat label="Next Funding" value={countdown(nextFunding)} />
          <Stat label="Taker Fee" value={market ? bps(market.takerFeeBps) : "—"} />
          <Stat
            label="Init / Maint"
            value={
              market ? `${bps(market.imBps, 0)} / ${bps(market.mmBps, 0)}` : "—"
            }
          />
          <div className="flex shrink-0 flex-col justify-center gap-1 border-l hairline px-6">
            <span className="micro-label">24h · Pyth</span>
            <Sparkline data={spark} positive={oracle !== null} />
          </div>
        </div>
      </div>
    </div>
  );
}
