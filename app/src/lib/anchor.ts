"use client";

import { PROGRAM_ID, USDC_MINT, MARKET_SYMBOL, BASE_SYMBOL } from "./constants";

/**
 * Static parameters for the deployed SOL-PERP devnet market.
 *
 * The on-chain program exposes these market parameters (margin reqs, fees,
 * funding cadence, tick/step) as fixed values for the devnet demo market. The
 * mark/oracle price is a fixed ~150 scale on-chain; the live *index* price for
 * the chart + sparkline is sourced separately from Pyth (see useOraclePrice).
 */
export const MARKET_PARAMS = {
  symbol: MARKET_SYMBOL,
  baseSymbol: BASE_SYMBOL,
  oraclePrice: 150, // raw ~150 integer scale, displayed as-is
  imBps: 500, // 5% initial margin
  mmBps: 300, // 3% maintenance margin
  takerFeeBps: 5, // 0.05%
  makerFeeBps: 2, // 0.02%
  liqPenaltyBps: 100,
  oracleBandBps: 500,
  cumFunding: 0.0000012,
  maxFundingRate: 50,
  fundingIntervalSecs: 3600,
  tickSize: 1,
  stepSize: 1,
  minOrderNotional: 1,
} as const;

export { PROGRAM_ID, USDC_MINT, MARKET_SYMBOL, BASE_SYMBOL };
