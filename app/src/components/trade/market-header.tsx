"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Activity, Clock, Percent } from "lucide-react";
import type { MarketData } from "@/hooks/useMarket";
import { Skeleton } from "@/components/ui/skeleton";
import { bps, countdown, price } from "@/lib/format";
import { BASE_SYMBOL } from "@/lib/constants";

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 font-ui text-[10px] font-bold uppercase tracking-[0.12em] text-text-faint">
        <Icon size={12} strokeWidth={2} /> {label}
      </span>
      <span className="font-num text-[14px] font-semibold text-text-base">
        {value}
      </span>
    </div>
  );
}

export function MarketHeader({
  market,
  loading,
}: {
  market: MarketData | null;
  loading: boolean;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  if (loading && !market) {
    return (
      <div className="rounded-xl border border-border-base bg-surface-1 p-5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-56 mt-3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="rounded-xl border border-border-base bg-surface-1 p-6 text-center">
        <p className="font-ui text-[14px] text-text-muted">
          Market not initialized.
        </p>
      </div>
    );
  }

  const nextFunding = market.lastFundingTs + market.fundingIntervalSecs - now;

  return (
    <div className="rounded-xl border border-border-base bg-[linear-gradient(180deg,var(--color-surface-1)_0%,var(--color-surface-2)_100%)] p-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-ui text-[18px] font-bold text-text-bright">
              {market.symbol}
            </span>
            <span className="font-ui text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
              PERP
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-num text-[34px] font-bold text-text-bright leading-none">
              {price(market.oraclePrice)}
            </span>
            <span className="font-ui text-[13px] text-text-muted">USD</span>
          </div>
        </div>
        <span className="font-ui text-[11px] text-text-faint">
          Base · {BASE_SYMBOL}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border-base">
        <Stat icon={Percent} label="Taker Fee" value={bps(market.takerFeeBps)} />
        <Stat icon={TrendingUp} label="Init Margin" value={bps(market.imBps)} />
        <Stat icon={Activity} label="Maint Margin" value={bps(market.mmBps)} />
        <Stat
          icon={Clock}
          label="Next Funding"
          value={countdown(nextFunding)}
        />
      </div>
    </div>
  );
}
