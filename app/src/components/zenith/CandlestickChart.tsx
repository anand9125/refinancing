"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useOraclePrice } from "@/hooks/useOraclePrice";
import { useMarket } from "@/hooks/useMarket";
import { price as fmtPrice } from "@/lib/format";

const INTERVALS = ["1m", "5m", "15m", "1H", "4H", "1D"];

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

const SEED_COUNT = 60;
const MAX_CANDLES = 80;

/**
 * Deterministic seeded history so SSR + re-renders are stable (NO Math.random /
 * Date.now). Uses an index-based sine "hash" for the noise term, producing a
 * realistic-looking sine + noise walk centered on the current price.
 */
function buildSeed(base: number): Candle[] {
  const out: Candle[] = [];
  let prevClose = base * 0.992;
  for (let i = 0; i < SEED_COUNT; i++) {
    const drift = Math.sin(i / 7) * base * 0.012;
    const n = Math.sin(i * 12.9898) * 43758.5453;
    const jitter = (n - Math.floor(n) - 0.5) * base * 0.01;
    const open = prevClose;
    const close = base + drift + jitter;
    const wickUp = Math.abs(Math.sin(i * 3.1)) * base * 0.004;
    const wickDn = Math.abs(Math.cos(i * 2.3)) * base * 0.004;
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDn;
    out.push({ open, high, low, close });
    prevClose = close;
  }
  return out;
}

export function CandlestickChart() {
  const { history, price: oracle, loading } = useOraclePrice();
  const { market } = useMarket();
  const [interval, setInterval] = useState("15m");

  // Seed the chart once we have a reference price, then append live Pyth samples.
  const [candles, setCandles] = useState<Candle[]>([]);
  const seeded = useRef(false);
  const lastSampleLen = useRef(0);

  useEffect(() => {
    // Seed strictly from the Pyth price so the whole chart shares one scale.
    // (Mixing the on-chain mark ~150 with live Pyth ~82 collapses autoscale.)
    const ref = oracle;
    if (ref === null || ref <= 0) return;
    if (!seeded.current) {
      seeded.current = true;
      const seed = buildSeed(ref);
      const tail = seed[seed.length - 1];
      seed[seed.length - 1] = {
        ...tail,
        close: ref,
        high: Math.max(tail.high, ref),
        low: Math.min(tail.low, ref),
      };
      setCandles(seed);
    }
  }, [oracle, market]);

  // Append each NEW live Pyth sample as a fresh candle on the right edge.
  useEffect(() => {
    if (!seeded.current) return;
    if (history.length <= lastSampleLen.current) return;
    const fresh = history.slice(lastSampleLen.current);
    lastSampleLen.current = history.length;
    setCandles((prev) => {
      let next = prev;
      for (const sample of fresh) {
        const last = next[next.length - 1];
        const open = last ? last.close : sample;
        next = [
          ...next,
          {
            open,
            close: sample,
            high: Math.max(open, sample),
            low: Math.min(open, sample),
          },
        ];
      }
      return next.slice(-MAX_CANDLES);
    });
  }, [history]);

  const { min, range } = useMemo(() => {
    if (candles.length === 0) {
      const m = oracle ?? market?.oraclePrice ?? 0;
      return { min: m * 0.99, range: m * 0.02 || 1 };
    }
    const max = Math.max(...candles.map((c) => c.high));
    const min = Math.min(...candles.map((c) => c.low));
    return { min, range: max - min || 1 };
  }, [candles, oracle, market]);

  const W = 1000;
  const H = 360;
  const padTop = 16;
  const padBot = 24;
  const padRight = 56;
  const innerH = H - padTop - padBot;
  const innerW = W - padRight;
  const n = Math.max(candles.length, 1);
  const cw = innerW / n;
  // Thin candles: body capped so few-candle states are NOT giant blocks.
  const bodyW = Math.min(cw * 0.6, 8);

  const y = (v: number) => padTop + (1 - (v - min) / range) * innerH;

  const gridSteps = 5;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = min + (range * i) / gridSteps;
    return { v, yy: y(v) };
  });

  const lastCandle = candles.length > 0 ? candles[candles.length - 1] : null;
  const last = lastCandle ? lastCandle.close : oracle;
  const lastUp = lastCandle ? lastCandle.close >= lastCandle.open : true;

  return (
    <div className="surface-2 flex h-full flex-col">
      <div className="flex items-center justify-between border-b hairline px-3 py-2">
        <div className="flex items-center gap-1">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={`mono rounded-sm2 px-2 py-1 text-[11px] transition-colors ${
                interval === iv ? "surface-3 text-bright" : "text-dim hover:text-bright"
              }`}
            >
              {iv}
            </button>
          ))}
        </div>
        <div className="mono flex items-center gap-3 text-[11px] text-muted">
          {lastCandle && (
            <span className="flex gap-2 tabular-nums">
              <span>O <span className="text-dim">{fmtPrice(lastCandle.open, 2)}</span></span>
              <span>H <span className="text-dim">{fmtPrice(lastCandle.high, 2)}</span></span>
              <span>L <span className="text-dim">{fmtPrice(lastCandle.low, 2)}</span></span>
              <span>C <span style={{ color: lastUp ? "#1fcb7c" : "#f0616d" }}>{fmtPrice(lastCandle.close, 2)}</span></span>
            </span>
          )}
          <span>SOL/USD · Pyth</span>
        </div>
      </div>

      <div className="flex-1 p-2">
        {loading && candles.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[12px] text-muted">
            Loading price history…
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            {gridLines.map((g, i) => (
              <g key={i}>
                <line
                  x1={0}
                  x2={innerW}
                  y1={g.yy}
                  y2={g.yy}
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="2 4"
                />
                <text
                  x={W - 4}
                  y={g.yy + 3}
                  textAnchor="end"
                  fontSize={10}
                  fill="#56657a"
                  fontFamily="var(--font-ibm-plex-mono)"
                >
                  {fmtPrice(g.v, 2)}
                </text>
              </g>
            ))}

            {candles.map((c, i) => {
              const up = c.close >= c.open;
              // Center the candle within its cw slot.
              const x = i * cw + cw / 2;
              const color = up ? "#1fcb7c" : "#f0616d";
              const yo = y(c.open);
              const yc = y(c.close);
              const top = Math.min(yo, yc);
              const bodyH = Math.max(1, Math.abs(yo - yc));
              return (
                <g key={i}>
                  <line
                    x1={x}
                    x2={x}
                    y1={y(c.high)}
                    y2={y(c.low)}
                    stroke={color}
                    strokeWidth={1}
                  />
                  <rect
                    x={x - bodyW / 2}
                    y={top}
                    width={bodyW}
                    height={bodyH}
                    fill={color}
                    opacity={up ? 0.9 : 0.85}
                  />
                </g>
              );
            })}

            {last !== null && (
              <line
                x1={0}
                x2={innerW}
                y1={y(last)}
                y2={y(last)}
                stroke={lastUp ? "#1fcb7c" : "#f0616d"}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            )}
          </svg>
        )}
      </div>
    </div>
  );
}
