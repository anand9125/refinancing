"use client";

import { Position, RefinanceOpportunity } from "@/types";
import { formatUsd, formatPct, healthColor, healthBg } from "@/lib/health";
import { PROTOCOL_LABELS } from "@/lib/constants";

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
          <div key={i} className="h-20 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-12 text-white/40">
        <p className="text-lg">No positions found</p>
        <p className="text-sm mt-1">Connect a wallet with active lending positions on devnet</p>
      </div>
    );
  }

  const oppByProtocol = new Map(
    opportunities.map((o) => [o.position.protocol, o])
  );

  return (
    <div className="space-y-3">
      {positions.map((position, i) => {
        const opp = oppByProtocol.get(position.protocol);
        return (
          <PositionCard
            key={i}
            position={position}
            opportunity={opp}
            onRefinance={onRefinance}
          />
        );
      })}
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
  return (
    <div
      className={`rounded-xl border p-4 flex items-center justify-between gap-4 ${healthBg(position.healthFactor)}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {PROTOCOL_LABELS[position.protocol]}
          </span>
          <span className="text-xs text-white/40 mt-0.5">
            {position.collateralAmountUsd > 0
              ? `${formatUsd(position.collateralAmountUsd)} collateral`
              : "Supply only"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-right text-sm">
        <div>
          <p className="text-white/40 text-xs mb-0.5">Debt</p>
          <p className="text-white font-medium tabular-nums">
            {formatUsd(position.debtAmountUsd)}
          </p>
        </div>

        <div>
          <p className="text-white/40 text-xs mb-0.5">Borrow APR</p>
          <p className="text-white font-medium">{formatPct(position.borrowApr)}</p>
        </div>

        <div>
          <p className="text-white/40 text-xs mb-0.5">Health</p>
          <p className={`font-bold tabular-nums ${healthColor(position.healthFactor)}`}>
            {position.healthFactor.toFixed(2)}
          </p>
        </div>

        {opportunity && (
          <button
            onClick={() => onRefinance(opportunity)}
            className="flex flex-col items-end bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition rounded-lg px-3 py-2"
          >
            <span className="text-emerald-400 text-xs font-semibold">💡 Save</span>
            <span className="text-emerald-300 text-sm font-bold tabular-nums">
              {formatUsd(opportunity.monthlySavingsUsd)}/mo
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
