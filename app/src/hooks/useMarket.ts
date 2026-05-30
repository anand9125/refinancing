"use client";

import { useCallback, useEffect, useState } from "react";
import { MARKET_PARAMS } from "@/lib/anchor";

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

function buildMarket(): MarketData {
  const now = Math.floor(Date.now() / 1000);
  // align lastFundingTs to the start of the current funding interval
  const interval = MARKET_PARAMS.fundingIntervalSecs;
  const lastFundingTs = now - (now % interval);
  return {
    symbol: MARKET_PARAMS.symbol,
    oraclePrice: MARKET_PARAMS.oraclePrice,
    imBps: MARKET_PARAMS.imBps,
    mmBps: MARKET_PARAMS.mmBps,
    takerFeeBps: MARKET_PARAMS.takerFeeBps,
    makerFeeBps: MARKET_PARAMS.makerFeeBps,
    liqPenaltyBps: MARKET_PARAMS.liqPenaltyBps,
    oracleBandBps: MARKET_PARAMS.oracleBandBps,
    cumFunding: MARKET_PARAMS.cumFunding,
    lastFundingTs,
    maxFundingRate: MARKET_PARAMS.maxFundingRate,
    fundingIntervalSecs: interval,
    tickSize: MARKET_PARAMS.tickSize,
    stepSize: MARKET_PARAMS.stepSize,
    minOrderNotional: MARKET_PARAMS.minOrderNotional,
  };
}

export function useMarket() {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setMarket(buildMarket());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { market, loading, refresh };
}
