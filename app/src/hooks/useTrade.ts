"use client";

import { useCallback, useState } from "react";
import { BN } from "@coral-xyz/anchor";
import { useProgram } from "./useProgram";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import {
  globalConfigPda,
  marketPda,
  bidsPda,
  asksPda,
  userCollateralPda,
  positionPda,
  requestQueuePda,
  eventQueuePda,
} from "@/lib/pda";
import { MARKET_SYMBOL } from "@/lib/constants";

export type Side = "buy" | "sell";
export type OrderKind = "market" | "limit";

export interface PlaceParams {
  side: Side;
  kind: OrderKind;
  qty: number;
  limitPrice: number;
  leverage: number;
  imBps: number;
}

export function useTrade(symbol: string = MARKET_SYMBOL) {
  const program = useProgram();
  const { publicKey } = useConnectedWallet();
  const [busy, setBusy] = useState(false);

  const place = useCallback(
    async (p: PlaceParams): Promise<string> => {
      if (!program || !publicKey) {
        throw new Error("Connect your wallet to trade");
      }

      setBusy(true);
      try {
        const market = marketPda(symbol);
        const userColletral = userCollateralPda(publicKey);
        const positionPerMarket = positionPda(symbol, publicKey);
        const globalConfig = globalConfigPda();
        const requestQueue = requestQueuePda();
        const eventQueue = eventQueuePda();
        const bids = bidsPda(symbol);
        const asks = asksPda(symbol);

        const side = p.side === "buy" ? { buy: {} } : { sell: {} };
        const orderType =
          p.kind === "limit" ? { limit: {} } : { market: {} };

        const qty = new BN(p.qty);
        const priceRef = new BN(p.limitPrice || 1);
        const limitPrice = new BN(p.limitPrice);
        const initialMargin = qty
          .mul(priceRef)
          .muln(p.imBps)
          .divn(10000);

        const order = {
          user: Array.from(publicKey.toBytes()),
          orderId: new BN(0),
          side,
          qty,
          orderType,
          limitPrice,
          initialMargin,
          leverage: p.leverage,
          market,
        };

        const sig = await program.methods
          .placeOrder(order)
          .accountsPartial({
            user: publicKey,
            globalConfig,
            market,
            userColletral,
            positionPerMarket,
            requestQueue,
          })
          .rpc();

        await program.methods
          .processPlaceOrder()
          .accountsPartial({
            authority: publicKey,
            market,
            bids,
            asks,
            requestQueue,
            eventQueue,
          })
          .rpc();

        await program.methods
          .positionManager(publicKey)
          .accountsPartial({
            market,
            userPosition: positionPerMarket,
            eventQueue,
            userCollateral: userColletral,
          })
          .rpc()
          .catch(() => {});

        return sig;
      } finally {
        setBusy(false);
      }
    },
    [program, publicKey, symbol]
  );

  return { place, busy };
}
