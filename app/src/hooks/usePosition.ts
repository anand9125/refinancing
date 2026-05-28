"use client";

import { useCallback, useEffect, useState } from "react";
import { useReadProgram } from "./useProgram";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { positionPda } from "@/lib/pda";
import { MARKET_SYMBOL } from "@/lib/constants";

export type PositionSide = "long" | "short" | "flat";

export interface PositionData {
  basePosition: number;
  side: PositionSide;
  entryPrice: number;
  realizedPnl: number;
  initialMargin: number;
  leverage: number;
  updatedAt: number;
}

const POLL_MS = 5000;

export function usePosition(symbol: string = MARKET_SYMBOL) {
  const program = useReadProgram();
  const { publicKey } = useConnectedWallet();
  const [position, setPosition] = useState<PositionData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setPosition(null);
      setLoading(false);
      return;
    }
    try {
      const acc = await program.account.position.fetch(
        positionPda(symbol, publicKey)
      );
      const base = acc.basePosition.toNumber();
      const side: PositionSide = base > 0 ? "long" : base < 0 ? "short" : "flat";
      setPosition({
        basePosition: base,
        side,
        entryPrice: acc.entryPrice.toNumber(),
        realizedPnl: acc.realizedPnl.toNumber(),
        initialMargin: acc.initialMargin.toNumber(),
        leverage: Number(acc.leverage),
        updatedAt: acc.updatedAt.toNumber(),
      });
    } catch {
      setPosition(null);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, symbol]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { position, loading, refresh };
}
