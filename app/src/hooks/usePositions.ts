"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Position, Protocol } from "@/types";
import { useMarginFiPositions } from "./useMarginFiPositions";
import { useKaminoPositions } from "./useKaminoPositions";
import { useSolendPositions } from "./useSolendPositions";

// Mock rates for demo mode
const DEMO_RATES: Record<Protocol, number> = { 0: 0.068, 1: 0.121, 2: 0.094 };

// Mock positions for demo / presentation mode
const DEMO_POSITIONS: Position[] = [
  {
    protocol: 1,
    collateralMint: "So11111111111111111111111111111111111111112",
    debtMint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    collateralAmountUsd: 18500,
    debtAmountUsd: 9200,
    borrowApr: 0.121,
    supplyApy: 0.032,
    healthFactor: 1.15,
    ltv: 0.64,
    maxLtv: 0.75,
  },
  {
    protocol: 0,
    collateralMint: "So11111111111111111111111111111111111111112",
    debtMint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    collateralAmountUsd: 22000,
    debtAmountUsd: 7100,
    borrowApr: 0.068,
    supplyApy: 0.048,
    healthFactor: 2.4,
    ltv: 0.42,
    maxLtv: 0.80,
  },
  {
    protocol: 2,
    collateralMint: "So11111111111111111111111111111111111111112",
    debtMint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    collateralAmountUsd: 6730,
    debtAmountUsd: 2100,
    borrowApr: 0.094,
    supplyApy: 0.027,
    healthFactor: 1.88,
    ltv: 0.39,
    maxLtv: 0.75,
  },
];

export function usePositions() {
  const { publicKey, connected } = useWallet();
  const [demoMode, setDemoMode] = useState(false);

  const kamino = useKaminoPositions(connected && !demoMode ? publicKey : null);
  const marginfi = useMarginFiPositions(connected && !demoMode ? publicKey : null);
  const solend = useSolendPositions(connected && !demoMode ? publicKey : null);

  const loading = demoMode ? false : kamino.loading || marginfi.loading || solend.loading;

  const positions: Position[] = useMemo(() => {
    if (demoMode) return DEMO_POSITIONS;
    return [...kamino.positions, ...marginfi.positions, ...solend.positions];
  }, [demoMode, kamino.positions, marginfi.positions, solend.positions]);

  // Live rates aggregated from fetched positions (fallback to demo rates for empty protocols)
  const ratesByProtocol: Record<Protocol, number> = useMemo(() => {
    const rates: Record<Protocol, number> = { 0: 0, 1: 0, 2: 0 };

    if (demoMode) return DEMO_RATES;

    const all = [...kamino.positions, ...marginfi.positions, ...solend.positions];
    const byProto: Record<Protocol, number[]> = { 0: [], 1: [], 2: [] };
    for (const p of all) {
      byProto[p.protocol].push(p.borrowApr);
    }

    for (const k of [0, 1, 2] as Protocol[]) {
      const arr = byProto[k];
      rates[k] = arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : DEMO_RATES[k];
    }

    return rates;
  }, [demoMode, kamino.positions, marginfi.positions, solend.positions]);

  const errors = [kamino.error, marginfi.error, solend.error].filter(Boolean) as string[];

  return {
    positions,
    loading,
    ratesByProtocol,
    errors,
    demoMode,
    setDemoMode,
    protocolStatus: {
      kamino: { loading: kamino.loading, error: kamino.error, count: kamino.positions.length },
      marginfi: { loading: marginfi.loading, error: marginfi.error, count: marginfi.positions.length },
      solend: { loading: solend.loading, error: solend.error, count: solend.positions.length },
    },
  };
}
