"use client";

import { useCallback, useEffect, useState } from "react";
import { MARKET_PARAMS } from "@/lib/anchor";

export interface SlabLevel {
  price: bigint;
  quantity: bigint;
}

export interface Orderbook {
  bids: SlabLevel[];
  asks: SlabLevel[];
  spread: bigint | null;
  bestBid: bigint | null;
  bestAsk: bigint | null;
}

// On-chain prices/qty are scaled integers. Price scale 1e2 (cents), qty 1e3.
const PRICE_SCALE = 100;
const QTY_SCALE = 1000;

function buildBook(): Orderbook {
  const mid = MARKET_PARAMS.oraclePrice; // 150
  const tick = MARKET_PARAMS.tickSize; // 0.01
  const levels = 10;

  const bids: SlabLevel[] = [];
  const asks: SlabLevel[] = [];

  for (let i = 0; i < levels; i++) {
    const off = (i + 1) * tick * 5; // 5 ticks apart for visible depth
    const bidPrice = mid - off;
    const askPrice = mid + off;
    // size grows with distance, with some jitter
    const baseSize = 2 + i * 1.5 + (i % 3) * 0.7;
    bids.push({
      price: BigInt(Math.round(bidPrice * PRICE_SCALE)),
      quantity: BigInt(Math.round(baseSize * QTY_SCALE)),
    });
    asks.push({
      price: BigInt(Math.round(askPrice * PRICE_SCALE)),
      quantity: BigInt(Math.round((baseSize + 0.4) * QTY_SCALE)),
    });
  }

  // bids high->low, asks low->high
  bids.sort((a, b) => (a.price < b.price ? 1 : -1));
  asks.sort((a, b) => (a.price < b.price ? -1 : 1));

  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  const spread =
    bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;

  return { bids, asks, spread, bestBid, bestAsk };
}

export const ORDERBOOK_PRICE_SCALE = PRICE_SCALE;
export const ORDERBOOK_QTY_SCALE = QTY_SCALE;

export function useOrderbook() {
  const [book, setBook] = useState<Orderbook>({
    bids: [],
    asks: [],
    spread: null,
    bestBid: null,
    bestAsk: null,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setBook(buildBook());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);

  return { book, loading, refresh };
}
