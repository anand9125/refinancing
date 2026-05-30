"use client";

import { useCallback, useState } from "react";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { applyDeposit, applyWithdraw, readState } from "@/lib/localState";

export function useCollateralActions() {
  const { address } = useConnectedWallet();
  const [busy, setBusy] = useState(false);

  const deposit = useCallback(
    async (amount: number) => {
      if (!address) throw new Error("Wallet not connected");
      if (!(amount > 0)) throw new Error("Invalid amount");
      setBusy(true);
      try {
        await new Promise((r) => setTimeout(r, 400));
        applyDeposit(address, amount);
      } finally {
        setBusy(false);
      }
    },
    [address],
  );

  const withdraw = useCallback(
    async (amount: number) => {
      if (!address) throw new Error("Wallet not connected");
      if (!(amount > 0)) throw new Error("Invalid amount");
      const s = readState(address);
      if (amount > s.collateral) throw new Error("Insufficient collateral");
      setBusy(true);
      try {
        await new Promise((r) => setTimeout(r, 400));
        applyWithdraw(address, amount);
      } finally {
        setBusy(false);
      }
    },
    [address],
  );

  return { deposit, withdraw, busy };
}
