"use client";

import { useEffect, useRef, useState } from "react";

// Pyth SOL/USD price feed id (served by Hermes for all clusters).
const SOL_USD_FEED =
  "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
const HERMES_URL = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${SOL_USD_FEED}`;

const MAX_SAMPLES = 60;
const POLL_MS = 4000;

interface HermesPrice {
  price: string;
  expo: number;
}

interface HermesResponse {
  parsed?: { price?: HermesPrice }[];
}

/**
 * Live SOL/USD index price from Pyth Hermes (REST, no SDK). Maintains a rolling
 * in-memory window of recent samples for the sparkline + chart. Returns null on
 * failure so callers can fall back to the on-chain mark.
 */
export function useOraclePrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    async function poll() {
      try {
        const res = await fetch(HERMES_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Hermes ${res.status}`);
        const data: HermesResponse = await res.json();
        const p = data.parsed?.[0]?.price;
        if (!p) throw new Error("no price");
        const real = Number(p.price) * Math.pow(10, p.expo);
        if (!Number.isFinite(real) || real <= 0) throw new Error("bad price");
        if (!mounted.current) return;
        setPrice(real);
        setHistory((prev) => {
          const next = [...prev, real];
          return next.length > MAX_SAMPLES
            ? next.slice(next.length - MAX_SAMPLES)
            : next;
        });
      } catch {
        // graceful: leave previous price; callers fall back to on-chain mark
      } finally {
        if (mounted.current) setLoading(false);
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);

  return { price, history, loading };
}
