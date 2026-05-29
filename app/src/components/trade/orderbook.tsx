"use client";

import type { Orderbook as OrderbookData } from "@/hooks/useOrderbook";
import type { SlabLevel } from "@/lib/slab";
import { Skeleton } from "@/components/ui/skeleton";
import { price, size } from "@/lib/format";

const DEPTH = 8;

function Row({
  level,
  maxQty,
  side,
}: {
  level: SlabLevel;
  maxQty: bigint;
  side: "bid" | "ask";
}) {
  const pct =
    maxQty > 0n ? Number((level.quantity * 10000n) / maxQty) / 100 : 0;
  const color = side === "bid" ? "text-accent" : "text-danger";
  const bar = side === "bid" ? "bg-accent/10" : "bg-danger/10";

  return (
    <div className="relative flex items-center justify-between px-3 h-7 font-num text-[12.5px]">
      <div
        className={`absolute inset-y-0 right-0 ${bar}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`relative ${color} font-semibold`}>
        {price(level.price, 0)}
      </span>
      <span className="relative text-text-dim">{size(level.quantity, 0)}</span>
    </div>
  );
}

export function Orderbook({
  book,
  loading,
}: {
  book: OrderbookData;
  loading: boolean;
}) {
  const asks = book.asks.slice(0, DEPTH);
  const bids = book.bids.slice(0, DEPTH);
  const hasLevels = asks.length > 0 || bids.length > 0;

  const allQty = [...asks, ...bids].map((l) => l.quantity);
  const maxQty = allQty.reduce((m, q) => (q > m ? q : m), 0n);

  if (loading && !hasLevels) {
    return (
      <div className="flex flex-col gap-1.5 p-3">
        {Array.from({ length: DEPTH * 2 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (!hasLevels) {
    return (
      <div className="flex flex-col items-center justify-center h-[360px] gap-1">
        <p className="font-ui text-[14px] text-text-muted">No resting orders</p>
        <p className="font-ui text-[12px] text-text-faint">
          The book is empty for this market.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 font-ui text-[10px] font-bold uppercase tracking-[0.12em] text-text-faint">
        <span>Price</span>
        <span>Size</span>
      </div>

      <div className="flex flex-col">
        {[...asks].reverse().map((l, i) => (
          <Row key={`a${i}`} level={l} maxQty={maxQty} side="ask" />
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2 my-1 border-y border-border-base bg-white/2">
        <span className="font-num text-[13px] font-bold text-text-bright">
          {book.bestAsk !== null
            ? price(book.bestAsk, 0)
            : book.bestBid !== null
              ? price(book.bestBid, 0)
              : "—"}
        </span>
        <span className="font-num text-[11px] text-text-muted">
          {book.spread !== null ? `spread ${price(book.spread, 0)}` : ""}
        </span>
      </div>

      <div className="flex flex-col">
        {bids.map((l, i) => (
          <Row key={`b${i}`} level={l} maxQty={maxQty} side="bid" />
        ))}
      </div>
    </div>
  );
}
