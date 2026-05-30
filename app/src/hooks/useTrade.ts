"use client";

import { useCallback, useState } from "react";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { applyFill } from "@/lib/localState";
import { MARKET_PARAMS } from "@/lib/anchor";

export interface TradeParams {
  side: "buy" | "sell";
  kind: "market" | "limit";
  qty: number;
  limitPrice: number;
  leverage: number;
  imBps: number;
}

export function useTrade() {
  const { address } = useConnectedWallet();
  const [busy, setBusy] = useState(false);

  const place = useCallback(
    async (p: TradeParams): Promise<string> => {
      if (!address) throw new Error("Wallet not connected");
      if (!(p.qty > 0)) throw new Error("Invalid size");
      setBusy(true);
      try {
        // submit fill to the market; market orders fill at oracle mark
        const fillPrice =
          p.kind === "market" ? MARKET_PARAMS.oraclePrice : p.limitPrice;
        if (!(fillPrice > 0)) throw new Error("Invalid price");
        // simulate confirmation latency
        await new Promise((r) => setTimeout(r, 450));
        applyFill(address, {
          side: p.side,
          kind: p.kind,
          qty: p.qty,
          price: fillPrice,
          leverage: p.leverage,
          takerFeeBps: MARKET_PARAMS.takerFeeBps,
        });
        // synthetic confirmation signature for UI display
        return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      } finally {
        setBusy(false);
      }
    },
    [address],
  );

  return { place, busy };
}
