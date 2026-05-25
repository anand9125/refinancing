"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Position, Protocol } from "@/types";

/**
 * Phase 1: returns mock positions so the full UI can be built and tested
 * before the real SDK integrations are wired up.
 * Replace the mock data in each protocol hook (useKaminoPositions, etc.)
 * with real SDK calls in Phase 2.
 */
export function useMockPositions(): {
  positions: Position[];
  loading: boolean;
  ratesByProtocol: Record<Protocol, number>;
} {
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    if (!connected) {
      setPositions([]);
      return;
    }

    setLoading(true);
    // Simulate network latency
    const t = setTimeout(() => {
      setPositions(MOCK_POSITIONS);
      setLoading(false);
    }, 1400);

    return () => clearTimeout(t);
  }, [connected]);

  return { positions, loading, ratesByProtocol: MOCK_RATES };
}

const MOCK_POSITIONS: Position[] = [
  {
    protocol: 1, // MarginFi
    collateralMint: "So11111111111111111111111111111111111111112", // SOL
    debtMint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr", // devnet USDC
    collateralAmountUsd: 18500,
    debtAmountUsd: 9200,
    borrowApr: 0.121,
    supplyApy: 0.032,
    healthFactor: 1.15,
    ltv: 0.64,
    maxLtv: 0.75,
  },
  {
    protocol: 0, // Kamino
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
    protocol: 2, // Solend
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

const MOCK_RATES: Record<Protocol, number> = {
  0: 0.068, // Kamino
  1: 0.121, // MarginFi
  2: 0.094, // Solend
};
