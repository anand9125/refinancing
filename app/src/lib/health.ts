import { Position, GlobalHealth, RefinanceOpportunity, Protocol } from "@/types";
import { PROTOCOL_SCORES } from "./constants";

export function computeGlobalHealth(positions: Position[]): GlobalHealth {
  if (positions.length === 0) {
    return {
      score: 100,
      label: "SAFE",
      totalCollateralUsd: 0,
      totalDebtUsd: 0,
      netPositionUsd: 0,
      netMonthlyInterestUsd: 0,
      atRiskCount: 0,
    };
  }

  const totalCollateralUsd = positions.reduce((s, p) => s + p.collateralAmountUsd, 0);
  const totalDebtUsd = positions.reduce((s, p) => s + p.debtAmountUsd, 0);

  // Weighted health factor by debt size
  const weightedHealth =
    totalDebtUsd === 0
      ? 99
      : positions.reduce((s, p) => s + p.healthFactor * p.debtAmountUsd, 0) / totalDebtUsd;

  // Net monthly interest: borrow cost minus supply earnings
  const monthlyBorrowCost = positions.reduce(
    (s, p) => s + (p.debtAmountUsd * p.borrowApr) / 12,
    0
  );
  const monthlySupplyEarnings = positions.reduce(
    (s, p) => s + (p.collateralAmountUsd * p.supplyApy) / 12,
    0
  );
  const netMonthlyInterestUsd = monthlySupplyEarnings - monthlyBorrowCost;

  const atRiskCount = positions.filter((p) => p.healthFactor < 1.3).length;

  // Score: blend of health factor and at-risk count
  const rawScore = Math.min(100, Math.max(0, (weightedHealth - 1) * 40));
  const score = Math.round(rawScore - atRiskCount * 10);

  const label =
    score >= 70 ? "SAFE" : score >= 40 ? "MODERATE" : "HIGH RISK";

  return {
    score: Math.max(0, score),
    label,
    totalCollateralUsd,
    totalDebtUsd,
    netPositionUsd: totalCollateralUsd - totalDebtUsd,
    netMonthlyInterestUsd,
    atRiskCount,
  };
}

export function findRefinanceOpportunities(
  positions: Position[],
  ratesByProtocol: Record<Protocol, number>
): RefinanceOpportunity[] {
  const opportunities: RefinanceOpportunity[] = [];

  for (const position of positions) {
    if (position.debtAmountUsd === 0) continue;

    let bestSaving = 0;
    let bestTarget: Protocol | null = null;
    let bestRate = position.borrowApr;

    const protocols: Protocol[] = [0, 1, 2];
    for (const proto of protocols) {
      if (proto === position.protocol) continue;
      const targetRate = ratesByProtocol[proto];
      if (!targetRate) continue;

      const saving =
        (position.debtAmountUsd * (position.borrowApr - targetRate)) / 12;

      if (saving > bestSaving) {
        bestSaving = saving;
        bestTarget = proto;
        bestRate = targetRate;
      }
    }

    if (bestTarget !== null && bestSaving > 1) {
      opportunities.push({
        position,
        targetProtocol: bestTarget,
        targetBorrowApr: bestRate,
        monthlySavingsUsd: bestSaving,
        annualSavingsUsd: bestSaving * 12,
      });
    }
  }

  // Sort by highest monthly savings first
  return opportunities.sort((a, b) => b.monthlySavingsUsd - a.monthlySavingsUsd);
}

export function healthColor(factor: number): string {
  if (factor >= 2) return "text-green-400";
  if (factor >= 1.3) return "text-yellow-400";
  return "text-red-400";
}

export function healthBg(factor: number): string {
  if (factor >= 2) return "bg-green-400/10 border-green-400/30";
  if (factor >= 1.3) return "bg-yellow-400/10 border-yellow-400/30";
  return "bg-red-400/10 border-red-400/30";
}

export function protocolScore(protocol: Protocol): number {
  return PROTOCOL_SCORES[protocol] ?? 0;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}
