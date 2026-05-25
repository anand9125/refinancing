"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Position } from "@/types";

// MarginFi public REST API — avoids heavy SDK bundle in browser
const MARGINFI_API = "https://marginfi-v2-ui-data.vercel.app";

export interface MarginFiResult {
  positions: Position[];
  loading: boolean;
  error: string | null;
}

export function useMarginFiPositions(walletPubkey: PublicKey | null): MarginFiResult {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletPubkey) {
      setPositions([]);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        // MarginFi account positions endpoint
        const res = await window.fetch(
          `https://production.marginfi.com/account/${walletPubkey!.toBase58()}?cluster=devnet`,
          { signal: AbortSignal.timeout(8000) }
        );

        if (!res.ok) throw new Error(`MarginFi API ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        const accounts: unknown[] = Array.isArray(data) ? data : [data];
        const parsed: Position[] = [];

        for (const account of accounts as Record<string, unknown>[]) {
          const balances = (account.balances as Record<string, unknown>[]) ?? [];

          let totalCollateralUsd = 0;
          let totalDebtUsd = 0;
          let borrowApr = 0;
          let supplyApy = 0;
          let collateralMint = "";
          let debtMint = "";

          for (const balance of balances) {
            const bank = balance.bank as Record<string, unknown> | undefined;
            const assetValue = Number(balance.assetValueUSD ?? balance.assetValue ?? 0);
            const liabilityValue = Number(balance.liabilityValueUSD ?? balance.liabilityValue ?? 0);

            if (assetValue > 0) {
              totalCollateralUsd += assetValue;
              supplyApy = Number(bank?.lendingRate ?? bank?.supplyApy ?? 0);
              collateralMint = String(bank?.mint ?? "");
            }
            if (liabilityValue > 0) {
              totalDebtUsd += liabilityValue;
              borrowApr = Number(bank?.borrowingRate ?? bank?.borrowApr ?? 0);
              debtMint = String(bank?.mint ?? "");
            }
          }

          if (totalCollateralUsd === 0 && totalDebtUsd === 0) continue;

          const healthFactor = totalDebtUsd > 0
            ? (totalCollateralUsd * 0.8) / totalDebtUsd
            : 99;

          parsed.push({
            protocol: 1,
            collateralMint,
            debtMint,
            collateralAmountUsd: totalCollateralUsd,
            debtAmountUsd: totalDebtUsd,
            borrowApr,
            supplyApy,
            healthFactor,
            ltv: totalCollateralUsd > 0 ? totalDebtUsd / totalCollateralUsd : 0,
            maxLtv: 0.8,
          });
        }

        setPositions(parsed);
      } catch (err: unknown) {
        if (!cancelled) {
          console.error("[MarginFi] fetch error:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch MarginFi positions");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [walletPubkey?.toBase58()]);

  return { positions, loading, error };
}
