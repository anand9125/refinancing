"use client";

import { useMarket } from "@/hooks/useMarket";
import { useOrderbook } from "@/hooks/useOrderbook";
import { useCollateral } from "@/hooks/useCollateral";
import { usePosition, type PositionData } from "@/hooks/usePosition";
import { MarketHeader } from "@/components/trade/market-header";
import { Orderbook } from "@/components/trade/orderbook";
import { OrderForm } from "@/components/trade/order-form";
import { WalletPill } from "@/components/wallet-pill";
import { price as fmtPrice, size as fmtSize, usd } from "@/lib/format";

export default function TradePage() {
  const { market, loading: marketLoading } = useMarket();
  const { book, loading: bookLoading, refresh: refreshBook } = useOrderbook();
  const { collateral, refresh: refreshCollateral } = useCollateral();
  const { position, refresh: refreshPosition } = usePosition();

  const onDone = () => {
    refreshBook();
    refreshCollateral();
    refreshPosition();
  };

  return (
    <div className="relative z-10 space-y-4">
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-ui text-[22px] font-bold text-text-bright">Trade</h1>
        <WalletPill />
      </div>

      <MarketHeader market={market} loading={marketLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Left: orderbook + position */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border-base bg-[linear-gradient(180deg,var(--color-surface-1)_0%,var(--color-surface-2)_100%)] p-4 min-h-[420px]">
            <Orderbook book={book} loading={bookLoading} />
          </div>

          <PositionBar position={position} markPrice={market?.oraclePrice ?? 0} />
        </div>

        {/* Right: order form */}
        <div className="lg:sticky lg:top-6 self-start rounded-xl border border-border-base bg-[linear-gradient(180deg,var(--color-surface-1)_0%,var(--color-surface-2)_100%)] p-4">
          <OrderForm
            market={market}
            collateral={collateral}
            bestBid={book.bestBid}
            bestAsk={book.bestAsk}
            onDone={onDone}
          />
        </div>
      </div>
    </div>
  );
}

function PositionBar({
  position,
  markPrice,
}: {
  position: PositionData | null;
  markPrice: number;
}) {
  if (!position || position.side === "flat") {
    return (
      <div className="rounded-xl border border-border-base bg-surface-1 px-5 py-4">
        <p className="font-ui text-[12px] text-text-muted">
          No open position in this market.
        </p>
      </div>
    );
  }

  const long = position.side === "long";
  const sizeAbs = Math.abs(position.basePosition);
  const uPnl = (markPrice - position.entryPrice) * position.basePosition;

  return (
    <div className="rounded-xl border border-border-base bg-surface-1 px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Cell label="Side">
          <span className={long ? "text-accent" : "text-danger"}>
            {long ? "LONG" : "SHORT"}
          </span>
        </Cell>
        <Cell label="Size">{fmtSize(sizeAbs)}</Cell>
        <Cell label="Entry">{fmtPrice(position.entryPrice, 0)}</Cell>
        <Cell label="Mark">{fmtPrice(markPrice, 0)}</Cell>
        <Cell label="Leverage">{position.leverage}×</Cell>
        <Cell label="uPnL">
          <span className={uPnl >= 0 ? "text-accent" : "text-danger"}>
            {usd(uPnl)}
          </span>
        </Cell>
      </div>
    </div>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-ui text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted mb-0.5">
        {label}
      </p>
      <p className="font-num text-[15px] font-bold text-text-base">{children}</p>
    </div>
  );
}
