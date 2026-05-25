"use client";

import { GlobalHealth } from "@/types";
import { formatUsd } from "@/lib/health";

interface Props {
  health: GlobalHealth;
  loading: boolean;
}

export function GlobalHealthCard({ health, loading }: Props) {
  const scoreColor =
    health.score >= 70
      ? "text-green-400"
      : health.score >= 40
      ? "text-yellow-400"
      : "text-red-400";

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        <div className="h-12 w-20 bg-white/10 rounded mb-2" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-white/10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-widest">
          Global Health
        </h2>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${
            health.label === "SAFE"
              ? "border-green-400/30 text-green-400 bg-green-400/10"
              : health.label === "MODERATE"
              ? "border-yellow-400/30 text-yellow-400 bg-yellow-400/10"
              : "border-red-400/30 text-red-400 bg-red-400/10"
          }`}
        >
          {health.label}
        </span>
      </div>

      <p className={`text-6xl font-bold tabular-nums ${scoreColor}`}>
        {health.score}
      </p>
      <p className="text-white/40 text-sm mt-1">out of 100</p>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Stat label="Total Collateral" value={formatUsd(health.totalCollateralUsd)} />
        <Stat label="Total Debt" value={formatUsd(health.totalDebtUsd)} />
        <Stat label="Net Position" value={formatUsd(health.netPositionUsd)} />
        <Stat
          label="Net Interest / mo"
          value={`${health.netMonthlyInterestUsd >= 0 ? "+" : ""}${formatUsd(health.netMonthlyInterestUsd)}`}
          valueClass={health.netMonthlyInterestUsd >= 0 ? "text-green-400" : "text-red-400"}
        />
      </div>

      {health.atRiskCount > 0 && (
        <p className="mt-4 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          ⚠ {health.atRiskCount} position{health.atRiskCount > 1 ? "s" : ""} at high liquidation risk
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
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}
