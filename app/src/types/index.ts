export type Protocol = 0 | 1 | 2; // 0=Kamino, 1=MarginFi, 2=Solend

export interface Position {
  protocol: Protocol;
  collateralMint: string;
  debtMint: string;
  collateralAmountUsd: number;
  debtAmountUsd: number;
  borrowApr: number;       // e.g. 0.121 = 12.1%
  supplyApy: number;       // e.g. 0.048 = 4.8%
  healthFactor: number;    // > 1 = safe, < 1 = liquidatable
  ltv: number;             // current loan-to-value
  maxLtv: number;          // max allowed by protocol
}

export interface GlobalHealth {
  score: number;           // 0-100
  label: "SAFE" | "MODERATE" | "HIGH RISK";
  totalCollateralUsd: number;
  totalDebtUsd: number;
  netPositionUsd: number;
  netMonthlyInterestUsd: number; // negative = paying, positive = earning
  atRiskCount: number;
}

export interface RefinanceOpportunity {
  position: Position;
  targetProtocol: Protocol;
  targetBorrowApr: number;
  monthlySavingsUsd: number;
  annualSavingsUsd: number;
}
