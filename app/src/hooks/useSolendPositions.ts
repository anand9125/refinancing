"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Position } from "@/types";

// Solend devnet REST API — avoids broken rpc-websockets dependency in SDK
const SOLEND_API = "https://api.solend.fi";

export interface SolendResult {
  positions: Position[];
  loading: boolean;
  error: string | null;
}

export function useSolendPositions(walletPubkey: PublicKey | null): SolendResult {
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
        // Fetch user obligations from Solend API
        const res = await window.fetch(
          `${SOLEND_API}/v1/user/obligations?wallet=${walletPubkey!.toBase58()}&network=devnet`,
          { signal: AbortSignal.timeout(8000) }
        );

        if (!res.ok) throw new Error(`Solend API ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        const obligations: unknown[] = data?.obligations ?? [];
        const parsed: Position[] = [];

        for (const obl of obligations as Record<string, unknown>[]) {
          const deposits = (obl.deposits as Record<string, unknown>[]) ?? [];
          const borrows = (obl.borrows as Record<string, unknown>[]) ?? [];

          const totalCollateralUsd = deposits.reduce(
            (s: number, d: Record<string, unknown>) => s + Number(d.marketValueUSD ?? 0),
            0
          );
          const totalDebtUsd = borrows.reduce(
            (s: number, b: Record<string, unknown>) => s + Number(b.marketValueUSD ?? 0),
            0
          );

          if (totalCollateralUsd === 0 && totalDebtUsd === 0) continue;

          const firstBorrow = borrows[0] as Record<string, unknown> | undefined;
          const borrowApr = Number(firstBorrow?.borrowAPR ?? 0);
          const supplyApy = Number(
            (deposits[0] as Record<string, unknown> | undefined)?.supplyAPY ?? 0
          );
          const healthFactor = Number(obl.healthFactor ?? 99);

          parsed.push({
            protocol: 2, // Solend
            collateralMint: String(
              (deposits[0] as Record<string, unknown> | undefined)?.mintAddress ?? ""
            ),
            debtMint: String(firstBorrow?.mintAddress ?? ""),
            collateralAmountUsd: totalCollateralUsd,
            debtAmountUsd: totalDebtUsd,
            borrowApr,
            supplyApy,
            healthFactor,
            ltv: totalCollateralUsd > 0 ? totalDebtUsd / totalCollateralUsd : 0,
            maxLtv: 0.75,
          });
        }

        setPositions(parsed);
      } catch (err: unknown) {
        if (!cancelled) {
          console.error("[Solend] fetch error:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch Solend positions");
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
