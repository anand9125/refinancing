"use client";

import { useCallback, useEffect, useState } from "react";
import { useReadProgram } from "./useProgram";
import { globalConfigPda } from "@/lib/pda";

export interface GlobalConfigData {
  authority: string;
  vaultQuote: string;
  insuranceFund: string;
  feePool: string;
  tradingPaused: boolean;
  fundingIntervalSecs: number;
}

export function useGlobalConfig() {
  const program = useReadProgram();
  const [config, setConfig] = useState<GlobalConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const acc = await program.account.globalConfig.fetch(globalConfigPda());
      setConfig({
        authority: acc.authority.toBase58(),
        vaultQuote: acc.vaultQuote.toBase58(),
        insuranceFund: acc.insuranceFund.toBase58(),
        feePool: acc.feePool.toBase58(),
        tradingPaused: acc.tradingPaused,
        fundingIntervalSecs: Number(acc.fundingIntervalSecs),
      });
    } catch {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { config, loading, refresh };
}
