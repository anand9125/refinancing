"use client";

import { FlowStage, useRefinanceFlow } from "@/hooks/useRefinanceFlow";
import { RefinanceOpportunity } from "@/types";
import { PROTOCOL_LABELS } from "@/lib/constants";

// ─── Protocol external links (devnet where available) ────────────────────────
const PROTOCOL_URLS: Record<number, string> = {
  0: "https://app.kamino.finance/",
  1: "https://app.marginfi.com/",
  2: "https://solend.fi/",
};

// ─── Solana Explorer devnet tx link ──────────────────────────────────────────
function explorerUrl(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}

// ─── Step metadata ────────────────────────────────────────────────────────────
interface StepConfig {
  stage: FlowStage;
  num: number;
  title: (opp: RefinanceOpportunity) => string;
  body: (opp: RefinanceOpportunity) => string;
  protocolKey: (opp: RefinanceOpportunity) => number;
  cta: string;
}

const STEPS: StepConfig[] = [
  {
    stage: "repay",
    num: 1,
    title: (o) => `Repay your debt on ${PROTOCOL_LABELS[o.position.protocol]}`,
    body: (o) =>
      `Open ${PROTOCOL_LABELS[o.position.protocol]} and fully repay your $${o.position.debtAmountUsd.toFixed(2)} debt position. Come back here when done.`,
    protocolKey: (o) => o.position.protocol,
    cta: "I've repaid — confirm on-chain",
  },
  {
    stage: "withdraw",
    num: 2,
    title: (o) => `Withdraw collateral from ${PROTOCOL_LABELS[o.position.protocol]}`,
    body: (o) =>
      `Now withdraw your $${o.position.collateralAmountUsd.toFixed(2)} of collateral from ${PROTOCOL_LABELS[o.position.protocol]}. Come back here when done.`,
    protocolKey: (o) => o.position.protocol,
    cta: "I've withdrawn — confirm on-chain",
  },
  {
    stage: "deposit",
    num: 3,
    title: (o) => `Deposit collateral into ${PROTOCOL_LABELS[o.targetProtocol]}`,
    body: (o) =>
      `Open ${PROTOCOL_LABELS[o.targetProtocol]} and deposit your $${o.position.collateralAmountUsd.toFixed(2)} of collateral. Come back here when done.`,
    protocolKey: (o) => o.targetProtocol,
    cta: "I've deposited — confirm on-chain",
  },
  {
    stage: "borrow",
    num: 4,
    title: (o) => `Borrow on ${PROTOCOL_LABELS[o.targetProtocol]}`,
    body: (o) =>
      `Finally, borrow $${o.position.debtAmountUsd.toFixed(2)} on ${PROTOCOL_LABELS[o.targetProtocol]} at ${(o.targetBorrowApr * 100).toFixed(2)}% APR. Come back here when done.`,
    protocolKey: (o) => o.targetProtocol,
    cta: "I've borrowed — finish & close session",
  },
];

const STAGE_TO_STEP: Partial<Record<FlowStage, number>> = {
  repay: 1,
  withdraw: 2,
  deposit: 3,
  borrow: 4,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  flow: ReturnType<typeof useRefinanceFlow>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RefinanceModal({ flow }: Props) {
  const { stage, loading, error, lastTxSig, opportunity } = flow;

  if (stage === "idle" || !opportunity) return null;

  const opp = opportunity;
  const src = PROTOCOL_LABELS[opp.position.protocol];
  const tgt = PROTOCOL_LABELS[opp.targetProtocol];
  const currentStep = STAGE_TO_STEP[stage] ?? 0;
  const activeStepConfig = STEPS.find((s) => s.stage === stage);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-semibold text-lg">Guided Refinancing</h3>
            <p className="text-white/40 text-xs mt-0.5">
              {src} → {tgt} · Save ${opp.monthlySavingsUsd.toFixed(2)}/mo
            </p>
          </div>
          {stage !== "done" && stage !== "cancelled" && (
            <button
              onClick={flow.close}
              disabled={loading}
              className="text-white/40 hover:text-white text-2xl leading-none disabled:opacity-40"
            >
              ×
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ── Overview ── */}
          {stage === "overview" && (
            <>
              {/* APR comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Current ({src})</p>
                  <p className="text-2xl font-bold text-red-400">
                    {(opp.position.borrowApr * 100).toFixed(2)}%
                  </p>
                  <p className="text-white/40 text-xs mt-1">borrow APR</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-emerald-500/30">
                  <p className="text-white/40 text-xs mb-1">New ({tgt})</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {(opp.targetBorrowApr * 100).toFixed(2)}%
                  </p>
                  <p className="text-white/40 text-xs mt-1">borrow APR</p>
                </div>
              </div>

              {/* Savings */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-emerald-400 font-semibold">${opp.monthlySavingsUsd.toFixed(2)} / month</p>
                  <p className="text-white/40 text-xs mt-0.5">${opp.annualSavingsUsd.toFixed(2)} annually</p>
                </div>
                <div className="text-emerald-400 text-3xl font-bold">↓</div>
              </div>

              {/* How it works */}
              <div className="space-y-2">
                <p className="text-white/40 text-xs uppercase tracking-widest">How it works</p>
                {STEPS.map((s) => (
                  <div key={s.num} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.num}
                    </span>
                    <span className="text-white/60">{s.title(opp)}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/30 bg-white/5 rounded-lg p-3">
                Each step sends one on-chain transaction to the RefinanceRouter program on devnet. Your PDA session tracks progress — cancel at any time to reclaim rent.
              </p>

              <button
                onClick={flow.startRefinance}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-black font-semibold flex items-center justify-center gap-2"
              >
                {loading ? <Spinner /> : "Start Refinancing →"}
              </button>
            </>
          )}

          {/* ── Active step ── */}
          {activeStepConfig && (
            <>
              {/* Progress bar */}
              <StepProgress current={currentStep} total={4} />

              {/* Instruction card */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <p className="font-medium">{activeStepConfig.title(opp)}</p>
                <p className="text-white/50 text-sm leading-relaxed">
                  {activeStepConfig.body(opp)}
                </p>
                <a
                  href={PROTOCOL_URLS[activeStepConfig.protocolKey(opp)]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition"
                >
                  Open {PROTOCOL_LABELS[activeStepConfig.protocolKey(opp)]} ↗
                </a>
              </div>

              {/* Last tx */}
              {lastTxSig && (
                <a
                  href={explorerUrl(lastTxSig)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Last tx: {lastTxSig.slice(0, 12)}…{lastTxSig.slice(-6)} ↗
                </a>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm text-red-400 flex items-start gap-2">
                  <span className="flex-shrink-0">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* CTA + cancel */}
              <div className="space-y-2">
                <button
                  onClick={flow.advanceStep}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-black font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? <Spinner /> : activeStepConfig.cta}
                </button>
                <button
                  onClick={flow.cancelRefinance}
                  disabled={loading}
                  className="w-full py-2 rounded-xl text-white/30 hover:text-white/60 text-sm transition disabled:opacity-40"
                >
                  Cancel & reclaim rent
                </button>
              </div>
            </>
          )}

          {/* ── Done ── */}
          {stage === "done" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <div>
                <p className="font-semibold text-lg text-emerald-400">Refinancing complete!</p>
                <p className="text-white/50 text-sm mt-1">
                  Moved from {src} to {tgt}. You&apos;re now saving{" "}
                  <span className="text-white font-medium">${opp.monthlySavingsUsd.toFixed(2)}/mo</span>.
                </p>
              </div>
              {lastTxSig && (
                <a
                  href={explorerUrl(lastTxSig)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
                >
                  View final tx on Explorer ↗
                </a>
              )}
              <button
                onClick={flow.close}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-medium"
              >
                Back to dashboard
              </button>
            </div>
          )}

          {/* ── Cancelled ── */}
          {stage === "cancelled" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl mx-auto">
                ×
              </div>
              <div>
                <p className="font-semibold">Session cancelled</p>
                <p className="text-white/50 text-sm mt-1">
                  Rent has been reclaimed to your wallet.
                </p>
              </div>
              {lastTxSig && (
                <a
                  href={explorerUrl(lastTxSig)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition"
                >
                  View cancel tx ↗
                </a>
              )}
              <button
                onClick={flow.close}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-medium"
              >
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-white/40">
        <span>Step {current} of {total}</span>
        <span>{Math.round((current / total) * 100)}% complete</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < current ? "bg-emerald-500" : i === current - 1 ? "bg-emerald-400 animate-pulse" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
  );
}
