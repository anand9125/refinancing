"use client";

import { TopMarketBar } from "@/components/zenith/TopMarketBar";
import { CandlestickChart } from "@/components/zenith/CandlestickChart";
import { PositionsPanel } from "@/components/zenith/PositionsPanel";
import { OrderBook } from "@/components/zenith/OrderBook";
import { OrderForm } from "@/components/zenith/OrderForm";
import { useMarket } from "@/hooks/useMarket";

export default function TradePage() {
  const { market } = useMarket();
  const mark = market?.oraclePrice ?? null;

  return (
    <div className="flex flex-col">
      <TopMarketBar />

      <div className="grid grid-cols-1 gap-px bg-[rgba(255,255,255,0.06)] lg:grid-cols-[1fr_minmax(360px,400px)]">
        {/* Left column: chart + positions */}
        <div className="flex flex-col gap-px bg-[rgba(255,255,255,0.06)]">
          <div className="surface-1 h-[420px]">
            <CandlestickChart />
          </div>
          <div className="surface-1 min-h-[240px]">
            <PositionsPanel />
          </div>
        </div>

        {/* Right rail: order book + order form */}
        <div className="flex min-h-0 flex-col gap-px bg-[rgba(255,255,255,0.06)]">
          <div className="surface-1 shrink-0 overflow-hidden">
            <OrderBook markPrice={mark} />
          </div>
          <div className="surface-1 min-h-0 flex-1 overflow-y-auto">
            <OrderForm />
          </div>
        </div>
      </div>
    </div>
  );
}
