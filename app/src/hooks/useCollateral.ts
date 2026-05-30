"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { readState, subscribe } from "@/lib/localState";

export interface CollateralData {
  amount: number; // human USDC
  lastUpdated: number;
}

export function useCollateral() {
  const { address } = useConnectedWallet();
  const [collateral, setCollateral] = useState<CollateralData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!address) {
      setCollateral(null);
      setLoading(false);
      return;
    }
    const s = readState(address);
    setCollateral({ amount: s.collateral, lastUpdated: s.collateralUpdatedAt });
    setLoading(false);
  }, [address]);

  useEffect(() => {
    refresh();
    return subscribe(refresh);
  }, [refresh]);

  return { collateral, loading, refresh };
}
