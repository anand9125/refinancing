"use client";

import { useCallback, useEffect, useState } from "react";
import { useReadProgram } from "./useProgram";
import { marketPda } from "@/lib/pda";
import { MARKET_SYMBOL } from "@/lib/constants";

export interface MarketData {
  symbol: string;
  oraclePrice: number;
  imBps: number;
  mmBps: number;
  takerFeeBps: number;
  makerFeeBps: number;
  liqPenaltyBps: number;
  oracleBandBps: number;
  cumFunding: number;
  lastFundingTs: number;
  maxFundingRate: number;
  fundingIntervalSecs: number;
  tickSize: number;
  stepSize: number;
  minOrderNotional: number;
}

const POLL_MS = 5000;

export function useMarket(symbol: string = MARKET_SYMBOL) {
  const program = useReadProgram();
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const acc = await program.account.marketState.fetch(marketPda(symbol));
      setMarket({
        symbol: acc.symbol,
        oraclePrice: acc.lastOraclePrice.toNumber(),
        imBps: Number(acc.imBps),
        mmBps: Number(acc.mmBps),
        takerFeeBps: Number(acc.takerFeeBps),
        makerFeeBps: Number(acc.makerFeeBps),
        liqPenaltyBps: Number(acc.liqPenaltyBps),
        oracleBandBps: Number(acc.oracleBandBps),
        cumFunding: acc.cumFunding.toNumber(),
        lastFundingTs: acc.lastFundingTs.toNumber(),
        maxFundingRate: acc.maxFundingRate.toNumber(),
        fundingIntervalSecs: Number(acc.fundingIntervalSecs),
        tickSize: Number(acc.tickSize),
        stepSize: Number(acc.stepSize),
        minOrderNotional: acc.minOrderNotional.toNumber(),
      });
    } catch {
      setMarket(null);
    } finally {
      setLoading(false);
    }
  }, [program, symbol]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { market, loading, refresh };
}
