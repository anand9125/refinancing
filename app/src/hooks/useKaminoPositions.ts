"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Position } from "@/types";

// Kamino public REST API — avoids @solana/kit incompatibility with web3.js
const KAMINO_API = "https://api.kamino.finance";

export interface KaminoResult {
  positions: Position[];
  loading: boolean;
  error: string | null;
}

export function useKaminoPositions(walletPubkey: PublicKey | null): KaminoResult {
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
        const res = await window.fetch(
          `${KAMINO_API}/v2/users/${walletPubkey!.toBase58()}/obligations?env=devnet`,
          { signal: AbortSignal.timeout(8000) }
        );

        if (!res.ok) throw new Error(`Kamino API ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        const obligations: unknown[] = Array.isArray(data) ? data : (data?.obligations ?? []);
        const parsed: Position[] = [];

        for (const obl of obligations as Record<string, unknown>[]) {
          const deposits = (obl.deposits as Record<string, unknown>[]) ?? [];
          const borrows = (obl.borrows as Record<string, unknown>[]) ?? [];

          const totalCollateralUsd = deposits.reduce(
            (s: number, d: Record<string, unknown>) => s + Number(d.marketValueRefreshed ?? d.marketValueUSD ?? 0),
            0
          );
          const totalDebtUsd = borrows.reduce(
            (s: number, b: Record<string, unknown>) => s + Number(b.marketValueRefreshed ?? b.marketValueUSD ?? 0),
            0
          );

          if (totalCollateralUsd === 0 && totalDebtUsd === 0) continue;

          const firstBorrow = borrows[0] as Record<string, unknown> | undefined;
          const firstDeposit = deposits[0] as Record<string, unknown> | undefined;

          parsed.push({
            protocol: 0,
            collateralMint: String(firstDeposit?.mintAddress ?? ""),
            debtMint: String(firstBorrow?.mintAddress ?? ""),
            collateralAmountUsd: totalCollateralUsd,
            debtAmountUsd: totalDebtUsd,
            borrowApr: Number(firstBorrow?.borrowApr ?? firstBorrow?.borrowAPR ?? 0),
            supplyApy: Number(firstDeposit?.supplyApy ?? firstDeposit?.supplyAPY ?? 0),
            healthFactor: Number(obl.loanToValue ?? obl.ltv ?? 0) > 0
              ? 1 / Number(obl.loanToValue ?? obl.ltv)
              : 99,
            ltv: Number(obl.loanToValue ?? obl.ltv ?? 0),
            maxLtv: 0.8,
          });
        }

        setPositions(parsed);
      } catch (err: unknown) {
        if (!cancelled) {
          console.error("[Kamino] fetch error:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch Kamino positions");
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
