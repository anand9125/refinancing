"use client";

import { useMemo, useState } from "react";
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

// Group rolling Pyth samples into pseudo-candles (N samples per candle).
function toCandles(history: number[], group = 3): Candle[] {
  const candles: Candle[] = [];
  for (let i = 0; i < history.length; i += group) {
    const slice = history.slice(i, i + group);
    if (slice.length === 0) continue;
    candles.push({
      open: slice[0],
      close: slice[slice.length - 1],
      high: Math.max(...slice),
      low: Math.min(...slice),
    });
  }
  return candles;
}

export function CandlestickChart() {
  const { history, price: oracle, loading } = useOraclePrice();
  const { market } = useMarket();
  const [interval, setInterval] = useState("15m");

  const candles = useMemo(() => toCandles(history), [history]);

  const { min, max, range } = useMemo(() => {
    if (candles.length === 0) {
      const m = oracle ?? market?.oraclePrice ?? 0;
      return { min: m * 0.99, max: m * 1.01, range: m * 0.02 || 1 };
    }
    const max = Math.max(...candles.map((c) => c.high));
    const min = Math.min(...candles.map((c) => c.low));
    return { min, max, range: max - min || 1 };
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
  const bodyW = Math.max(2, cw * 0.62);

  const y = (v: number) => padTop + (1 - (v - min) / range) * innerH;

  const gridSteps = 5;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const v = min + (range * i) / gridSteps;
    return { v, yy: y(v) };
  });

  const last = candles.length > 0 ? candles[candles.length - 1].close : oracle;

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
          <span>SOL/USD · Pyth</span>
          {last !== null && (
            <span className="text-bright">{fmtPrice(last, 2)}</span>
          )}
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
                stroke="#1fcb7c"
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
