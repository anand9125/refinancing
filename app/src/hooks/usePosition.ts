"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { readState, subscribe } from "@/lib/localState";

export interface PositionData {
  basePosition: number;
  side: "long" | "short" | "flat";
  entryPrice: number;
  realizedPnl: number;
  initialMargin: number;
  leverage: number;
  updatedAt: number;
}

export function usePosition() {
  const { address } = useConnectedWallet();
  const [position, setPosition] = useState<PositionData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!address) {
      setPosition(null);
      setLoading(false);
      return;
    }
    const s = readState(address);
    if (s.basePosition === 0) {
      setPosition(null);
    } else {
      setPosition({
        basePosition: s.basePosition,
        side: s.basePosition > 0 ? "long" : "short",
        entryPrice: s.entryPrice,
        realizedPnl: s.realizedPnl,
        initialMargin: s.initialMargin,
        leverage: s.leverage,
        updatedAt: s.positionUpdatedAt,
      });
    }
    setLoading(false);
  }, [address]);

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  return { position, loading, refresh };
}
