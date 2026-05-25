"use client";

import { Position, RefinanceOpportunity } from "@/types";
import { formatUsd, formatPct, healthColor, healthBg } from "@/lib/health";
import { PROTOCOL_LABELS, PROTOCOL_COLORS } from "@/lib/constants";

interface Props {
  positions: Position[];
  opportunities: RefinanceOpportunity[];
  loading: boolean;
  onRefinance: (opp: RefinanceOpportunity) => void;
}

export function PositionTable({ positions, opportunities, loading, onRefinance }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-16 text-white/40 border border-white/10 rounded-2xl bg-white/5">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-base font-medium text-white/60">No positions found</p>
        <p className="text-sm mt-1">Switch to Demo mode to preview the full UI</p>
      </div>
    );
  }

  const oppByProtocol = new Map(opportunities.map((o) => [o.position.protocol, o]));

  return (
    <div className="space-y-3">
      {positions.map((position, i) => (
        <PositionCard
          key={i}
          position={position}
          opportunity={oppByProtocol.get(position.protocol)}
          onRefinance={onRefinance}
        />
      ))}
    </div>
  );
}

function PositionCard({
  position,
  opportunity,
  onRefinance,
}: {
  position: Position;
  opportunity?: RefinanceOpportunity;
  onRefinance: (opp: RefinanceOpportunity) => void;
}) {
  const protocolColor = PROTOCOL_COLORS[position.protocol] ?? "#ffffff";

  return (
    <div className={`rounded-xl border p-4 ${healthBg(position.healthFactor)}`}>
      {/* Top row: protocol + refinance button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Protocol dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: protocolColor }}
          />
          <span className="font-semibold text-white text-sm">
            {PROTOCOL_LABELS[position.protocol]}
          </span>
          <span className="text-xs text-white/30 hidden sm:inline">
            {position.collateralAmountUsd > 0
              ? `${formatUsd(position.collateralAmountUsd)} collateral`
              : "Supply only"}
          </span>
        </div>

        {opportunity && (
          <button
            onClick={() => onRefinance(opportunity)}
            className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all rounded-lg px-3 py-1.5"
          >
            <span className="text-xs">💡</span>
            <span className="text-emerald-300 text-xs font-bold tabular-nums whitespace-nowrap">
              Save {formatUsd(opportunity.monthlySavingsUsd)}/mo
            </span>
          </button>
        )}
      </div>

      {/* Stats row — wraps on mobile */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        <StatPill
          label="Debt"
          value={formatUsd(position.debtAmountUsd)}
        />
        <StatPill
          label="Borrow APR"
          value={formatPct(position.borrowApr)}
        />
        <StatPill
          label="Supply APY"
          value={formatPct(position.supplyApy)}
          valueClass="text-green-400"
        />
        <StatPill
          label="Health"
          value={position.healthFactor.toFixed(2)}
          valueClass={healthColor(position.healthFactor)}
        />
        <StatPill
          label="LTV"
          value={`${(position.ltv * 100).toFixed(0)}% / ${(position.maxLtv * 100).toFixed(0)}%`}
        />
        {/* Mobile-only collateral */}
        <StatPill
          label="Collateral"
          value={formatUsd(position.collateralAmountUsd)}
          className="sm:hidden"
        />
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  valueClass = "text-white",
  className = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-white/40">{label}</p>
      <p className={`text-sm font-semibold tabular-nums mt-0.5 ${valueClass}`}>{value}</p>
    </div>
  );
}
