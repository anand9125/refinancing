"use client";

import { useMemo } from "react";
import { useOrderbook } from "@/hooks/useOrderbook";
import type { SlabLevel } from "@/hooks/useOrderbook";
import { price as fmtPrice, size as fmtSize } from "@/lib/format";

interface DisplayLevel {
  price: number;
  size: number;
  total: number;
}

// Cap visible depth so the book never overflows its rail and overlaps the form.
const DEPTH = 8;

function toDisplay(levels: SlabLevel[]): DisplayLevel[] {
  let running = 0;
  return levels.slice(0, DEPTH).map((l) => {
    const sz = Number(l.quantity);
    running += sz;
    return { price: Number(l.price), size: sz, total: running };
  });
}

export function OrderBook({ markPrice }: { markPrice: number | null }) {
  const { book, loading } = useOrderbook();

  const { bids, asks, maxTotal, spread, spreadPct } = useMemo(() => {
    const bids = toDisplay(book.bids);
    const asks = toDisplay(book.asks);
    const maxTotal = Math.max(
      ...bids.map((b) => b.total),
      ...asks.map((a) => a.total),
      1,
    );
    let spread: number | null = null;
    let spreadPct: number | null = null;
    if (book.bestBid !== null && book.bestAsk !== null) {
      const bb = Number(book.bestBid);
      const ba = Number(book.bestAsk);
      spread = ba - bb;
      spreadPct = bb > 0 ? (spread / bb) * 100 : null;
    }
    return { bids, asks, maxTotal, spread, spreadPct };
  }, [book]);

  const empty = !loading && bids.length === 0 && asks.length === 0;
  const mid =
    markPrice ??
    (book.bestAsk !== null
      ? Number(book.bestAsk)
      : book.bestBid !== null
        ? Number(book.bestBid)
        : null);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
        <span className="micro-label">Order Book</span>
        <span className="micro-label">Price / Size / Total</span>
      </div>

      <div className="grid grid-cols-3 px-4 py-1.5 micro-label">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-muted">
          <p className="text-[13px]">No resting orders</p>
          <p className="text-[11px] text-[#3e5470]">
            The book is empty for this market.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden text-[11px]">
          {/* asks: lowest just above the spread row -> highest at top */}
          <div className="flex flex-col">
            {asks
              .slice()
              .reverse()
              .map((a, i) => (
                <Row key={`a${i}`} level={a} max={maxTotal} side="short" />
              ))}
          </div>

          <div className="surface-1 my-1 flex items-center justify-between border-y hairline px-4 py-2">
            <span className="mono text-sm font-semibold text-bright">
              {mid !== null ? fmtPrice(mid, 2) : "—"}
            </span>
            <span className="micro-label">
              Spread {spread !== null ? fmtPrice(spread, 2) : "—"}
              {spreadPct !== null ? ` · ${spreadPct.toFixed(2)}%` : ""}
            </span>
          </div>

          {/* bids: highest at top -> lowest */}
          <div className="flex flex-col">
            {bids.map((b, i) => (
              <Row key={`b${i}`} level={b} max={maxTotal} side="long" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  level,
  max,
  side,
}: {
  level: DisplayLevel;
  max: number;
  side: "long" | "short";
}) {
  const pct = (level.total / max) * 100;
  return (
    <div className="relative grid grid-cols-3 px-4 py-[3px] hover:bg-[#131a24]">
      <div
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{
          width: `${pct}%`,
          background:
            side === "long"
              ? "rgba(31,203,124,0.12)"
              : "rgba(240,97,109,0.12)",
        }}
      />
      <span
        className={`relative mono ${side === "long" ? "text-long" : "text-short"}`}
      >
        {fmtPrice(level.price, 2)}
      </span>
      <span className="relative mono text-right text-dim">
        {fmtSize(level.size, 3)}
      </span>
      <span className="relative mono text-right text-muted">
        {fmtSize(level.total, 3)}
      </span>
    </div>
  );
}
