"use client";

import { useCallback, useEffect, useState } from "react";
import { useReadProgram } from "./useProgram";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { userCollateralPda } from "@/lib/pda";
import { fromQuote } from "@/lib/format";

export interface CollateralData {
  amount: number;
  lastUpdated: number;
}

const POLL_MS = 5000;

export function useCollateral() {
  const program = useReadProgram();
  const { publicKey } = useConnectedWallet();
  const [collateral, setCollateral] = useState<CollateralData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setCollateral(null);
      setLoading(false);
      return;
    }
    try {
      const acc = await program.account.userCollateral.fetch(
        userCollateralPda(publicKey)
      );
      setCollateral({
        amount: fromQuote(acc.collateralAmount.toString()),
        lastUpdated: acc.lastUpdated.toNumber(),
      });
    } catch {
      setCollateral(null);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { collateral, loading, refresh };
}
