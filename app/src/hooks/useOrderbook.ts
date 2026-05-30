"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { bidsPda, asksPda } from "@/lib/pda";
import { readSlab, type SlabLevel } from "@/lib/slab";
import { MARKET_SYMBOL } from "@/lib/constants";

export type { SlabLevel };

export interface Orderbook {
  bids: SlabLevel[];
  asks: SlabLevel[];
  spread: bigint | null;
  bestBid: bigint | null;
  bestAsk: bigint | null;
}

const EMPTY: Orderbook = {
  bids: [],
  asks: [],
  spread: null,
  bestBid: null,
  bestAsk: null,
};

const POLL_MS = 3000;

export function useOrderbook(symbol: string = MARKET_SYMBOL) {
  const { connection } = useConnection();
  const [book, setBook] = useState<Orderbook>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const infos = await connection.getMultipleAccountsInfo([
        bidsPda(symbol),
        asksPda(symbol),
      ]);
      const bids = infos[0]
        ? readSlab(infos[0].data, true).levels
        : [];
      const asks = infos[1]
        ? readSlab(infos[1].data, false).levels
        : [];
      const bestBid = bids.length > 0 ? bids[0].price : null;
      const bestAsk = asks.length > 0 ? asks[0].price : null;
      const spread =
        bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;
      setBook({ bids, asks, spread, bestBid, bestAsk });
    } catch {
      setBook(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [connection, symbol]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { book, loading, refresh };
}
