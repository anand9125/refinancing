"use client";

import { useCallback, useState } from "react";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useProgram } from "./useProgram";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import {
  globalConfigPda,
  marketPda,
  userCollateralPda,
  positionPda,
  vaultQuotePda,
} from "@/lib/pda";
import { toQuote } from "@/lib/format";
import { MARKET_SYMBOL, USDC_MINT } from "@/lib/constants";

export function useCollateralActions(symbol: string = MARKET_SYMBOL) {
  const program = useProgram();
  const { publicKey } = useConnectedWallet();
  const [busy, setBusy] = useState(false);

  const deposit = useCallback(
    async (amount: number): Promise<string> => {
      if (!program || !publicKey) {
        throw new Error("Connect your wallet to deposit");
      }
      setBusy(true);
      try {
        const userAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
        return await program.methods
          .depositColletral(toQuote(amount))
          .accountsPartial({
            user: publicKey,
            usdcMint: USDC_MINT,
            userWalletAccount: userAta,
            globalConfig: globalConfigPda(),
            vaultQuote: vaultQuotePda(),
            userColletral: userCollateralPda(publicKey),
          })
          .rpc();
      } finally {
        setBusy(false);
      }
    },
    [program, publicKey]
  );

  const withdraw = useCallback(
    async (amount: number): Promise<string> => {
      if (!program || !publicKey) {
        throw new Error("Connect your wallet to withdraw");
      }
      setBusy(true);
      try {
        const userAta = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
        return await program.methods
          .withdraw(toQuote(amount))
          .accountsPartial({
            user: publicKey,
            userColletral: userCollateralPda(publicKey),
            globalConfig: globalConfigPda(),
            usdcMint: USDC_MINT,
            vaultQuote: vaultQuotePda(),
            userAta,
            market: marketPda(symbol),
            userPosition: positionPda(symbol, publicKey),
          })
          .rpc();
      } finally {
        setBusy(false);
      }
    },
    [program, publicKey, symbol]
  );

  return { deposit, withdraw, busy };
}
