"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GlobalHealthCard } from "@/components/GlobalHealthCard";
import { PositionTable } from "@/components/PositionTable";
import { RefinanceModal } from "@/components/RefinanceModal";
import { usePositions } from "@/hooks/usePositions";
import { useRefinanceFlow } from "@/hooks/useRefinanceFlow";
import { computeGlobalHealth, findRefinanceOpportunities } from "@/lib/health";
import { PROTOCOL_LABELS } from "@/lib/constants";
import { RefinanceOpportunity } from "@/types";

export default function Home() {
  const { connected } = useWallet();
  const {
    positions,
    loading,
    ratesByProtocol,
    errors,
    demoMode,
    setDemoMode,
    protocolStatus,
  } = usePositions();

  const flow = useRefinanceFlow();

  const globalHealth = computeGlobalHealth(positions);
  const opportunities = findRefinanceOpportunities(positions, ratesByProtocol);

  function handleRefinance(opp: RefinanceOpportunity) {
    flow.open(opp);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-white">SolLend</span>
          <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
            devnet
          </span>
        </div>
        <WalletMultiButton />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {!connected ? (
          /* Landing state */
          <div className="text-center py-24 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              One dashboard for all your<br />
              <span className="text-emerald-400">Solana lending positions</span>
            </h1>
            <p className="text-white/50 max-w-md mx-auto text-lg">
              Scan Kamino, MarginFi, and Solend in seconds. See exactly
              how much you&apos;re overpaying — and fix it.
            </p>
            <div className="pt-4 flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <>
            {/* Demo mode toggle */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Mode:</span>
                <button
                  onClick={() => setDemoMode(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${!demoMode ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"}`}
                >
                  Live (devnet)
                </button>
                <button
                  onClick={() => setDemoMode(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${demoMode ? "bg-purple-500 text-white" : "text-white/40 hover:text-white"}`}
                >
                  Demo
                </button>
              </div>
              <div className="flex gap-3 text-xs text-white/40">
                {(["kamino", "marginfi", "solend"] as const).map((p) => (
                  <span key={p} className="flex items-center gap-1">
                    <span
                      className={
                        protocolStatus[p].loading
                          ? "animate-pulse text-yellow-400"
                          : protocolStatus[p].error
                          ? "text-red-400"
                          : "text-emerald-400"
                      }
                    >
                      ●
                    </span>
                    {PROTOCOL_LABELS[p === "kamino" ? 0 : p === "marginfi" ? 1 : 2]}
                  </span>
                ))}
              </div>
            </div>

            {/* Scanning banner */}
            {loading && (
              <div className="flex items-center gap-3 text-white/60 text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                Scanning your positions across Kamino, MarginFi, and Solend...
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && !demoMode && (
              <div className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
                ⚠ Some protocols unavailable on devnet — switch to Demo mode to preview the full UI.
              </div>
            )}

            {/* Global health */}
            <GlobalHealthCard health={globalHealth} loading={loading} />

            {/* Savings summary */}
            {!loading && opportunities.length > 0 && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-emerald-400 font-semibold">
                    💡 Refinancing opportunities found
                  </p>
                  <p className="text-white/60 text-sm mt-0.5">
                    You could save{" "}
                    <span className="text-white font-semibold">
                      ${opportunities
                        .reduce((s, o) => s + o.monthlySavingsUsd, 0)
                        .toFixed(2)}
                      /month
                    </span>{" "}
                    by moving to cheaper protocols
                  </p>
                </div>
                <span className="text-emerald-400 font-bold text-2xl">
                  {opportunities.length}
                </span>
              </div>
            )}

            {/* Positions */}
            <section>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-3">
                Active Positions
              </h2>
              <PositionTable
                positions={positions}
                opportunities={opportunities}
                loading={loading}
                onRefinance={handleRefinance}
              />
            </section>
          </>
        )}
      </main>

      {/* Guided refinance modal */}
      <RefinanceModal flow={flow} />
    </div>
  );
}
