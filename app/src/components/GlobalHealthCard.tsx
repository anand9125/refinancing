"use client";

import { GlobalHealth } from "@/types";
import { formatUsd } from "@/lib/health";

interface Props {
  health: GlobalHealth;
  loading: boolean;
}

export function GlobalHealthCard({ health, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-4 w-28 bg-white/10 rounded mb-6" />
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-white/10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const isGood    = health.score >= 70;
  const isMod     = health.score >= 40 && health.score < 70;
  const scoreColor = isGood ? "#34d399" : isMod ? "#fbbf24" : "#f87171";
  const labelStyle = isGood
    ? "border-green-400/30 text-green-400 bg-green-400/10"
    : isMod
    ? "border-yellow-400/30 text-yellow-400 bg-yellow-400/10"
    : "border-red-400/30 text-red-400 bg-red-400/10";

  // SVG ring: r=34, circumference ≈ 213.6
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = ((100 - health.score) / 100) * circ;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-widest">
          Portfolio Health
        </h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${labelStyle}`}>
          {health.label}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Score ring */}
        <div className="relative flex-shrink-0 w-[88px] h-[88px]">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle
              cx="44" cy="44" r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
            />
            <circle
              cx="44" cy="44" r={r}
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor }}>
              {health.score}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
          <Stat label="Collateral" value={formatUsd(health.totalCollateralUsd)} />
          <Stat label="Debt" value={formatUsd(health.totalDebtUsd)} />
          <Stat label="Net Position" value={formatUsd(health.netPositionUsd)} />
          <Stat
            label="Net Interest/mo"
            value={`${health.netMonthlyInterestUsd >= 0 ? "+" : ""}${formatUsd(health.netMonthlyInterestUsd)}`}
            valueClass={health.netMonthlyInterestUsd >= 0 ? "text-green-400" : "text-red-400"}
          />
        </div>
      </div>

      {health.atRiskCount > 0 && (
        <p className="mt-4 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <span>⚠</span>
          {health.atRiskCount} position{health.atRiskCount > 1 ? "s" : ""} at high liquidation risk (health factor &lt; 1.3)
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}
