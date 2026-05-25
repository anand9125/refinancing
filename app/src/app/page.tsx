"use client";

import { useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { GlobalHealthCard } from "@/components/GlobalHealthCard";
import { PositionTable } from "@/components/PositionTable";
import { RefinanceModal } from "@/components/RefinanceModal";
import { ToastContainer } from "@/components/Toast";
import { usePositions } from "@/hooks/usePositions";
import { useRefinanceFlow, FlowStage } from "@/hooks/useRefinanceFlow";
import { useToast } from "@/hooks/useToast";
import { computeGlobalHealth, findRefinanceOpportunities } from "@/lib/health";
import { PROTOCOL_LABELS } from "@/lib/constants";
import { RefinanceOpportunity } from "@/types";

// Human-readable toast messages for each stage transition
const STAGE_MESSAGES: Partial<Record<FlowStage, string>> = {
  repay:     "Session opened on-chain ✓ — now repay your debt",
  withdraw:  "Step 1 confirmed ✓ — now withdraw collateral",
  deposit:   "Step 2 confirmed ✓ — now deposit into new protocol",
  borrow:    "Step 3 confirmed ✓ — now borrow on new protocol",
  done:      "Refinancing complete! Position moved successfully",
  cancelled: "Session cancelled — rent returned to wallet",
};

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { positions, loading, ratesByProtocol, errors, demoMode, setDemoMode, protocolStatus } =
    usePositions();
  const flow    = useRefinanceFlow();
  const toast   = useToast();
  const prevStage = useRef<FlowStage>("idle");
  const [airdropping, setAirdropping] = useState(false);

  // Trigger toasts on stage transitions
  useEffect(() => {
    const { stage, lastTxSig } = flow;
    if (stage === prevStage.current) return;
    prevStage.current = stage;

    const msg = STAGE_MESSAGES[stage];
    if (!msg) return;

    const type = stage === "cancelled" ? "info" : stage === "done" ? "success" : "success";
    toast.add(type, msg, lastTxSig ?? undefined);
  }, [flow.stage, flow.lastTxSig]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toast on flow errors
  useEffect(() => {
    if (flow.error) toast.add("error", flow.error);
  }, [flow.error]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAirdrop() {
    if (!publicKey || airdropping) return;
    setAirdropping(true);
    try {
      const sig = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, "confirmed");
      toast.add("success", "2 devnet SOL airdropped to your wallet ✓");
    } catch {
      toast.add("error", "Airdrop failed — try again or visit faucet.solana.com");
    } finally {
      setAirdropping(false);
    }
  }

  const globalHealth  = computeGlobalHealth(positions);
  const opportunities = findRefinanceOpportunities(positions, ratesByProtocol);

  function handleRefinance(opp: RefinanceOpportunity) {
    flow.open(opp);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Header ── */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-white">SolLend</span>
          <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full hidden sm:inline">
            devnet
          </span>
        </div>
        <div className="flex items-center gap-2">
          {connected && (
            <button
              onClick={handleAirdrop}
              disabled={airdropping}
              title="Airdrop 2 devnet SOL to your wallet"
              className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 transition disabled:opacity-40 hidden sm:flex items-center gap-1.5"
            >
              {airdropping ? (
                <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>⛽</span>
              )}
              Get SOL
            </button>
          )}
          <WalletMultiButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">
        {!connected ? (
          /* ── Landing ── */
          <div className="text-center py-16 sm:py-24 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live on Solana devnet
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              One dashboard for all your<br />
              <span className="text-emerald-400">Solana lending positions</span>
            </h1>
            <p className="text-white/50 max-w-md mx-auto text-base sm:text-lg">
              Scan Kamino, MarginFi, and Solend in seconds. See exactly
              how much you&apos;re overpaying — and fix it on-chain.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-white/30">
              <Feature icon="🔍" text="Aggregated position view" />
              <Feature icon="💡" text="Rate optimization alerts" />
              <Feature icon="⛓" text="On-chain guided refinancing" />
            </div>
            <div className="pt-4 flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <>
            {/* ── Mode toggle + protocol status ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="text-white/40 text-xs">Mode:</span>
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
                {(["kamino", "marginfi", "solend"] as const).map((p) => {
                  const proto = p === "kamino" ? 0 : p === "marginfi" ? 1 : 2;
                  const s = protocolStatus[p];
                  return (
                    <span key={p} className="flex items-center gap-1">
                      <span className={s.loading ? "animate-pulse text-yellow-400" : s.error ? "text-red-400" : "text-emerald-400"}>●</span>
                      {PROTOCOL_LABELS[proto]}
                      {!s.loading && !s.error && s.count > 0 && (
                        <span className="text-white/20">({s.count})</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* ── Scanning banner ── */}
            {loading && (
              <div className="flex items-center gap-3 text-white/60 text-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                Scanning Kamino, MarginFi, and Solend...
              </div>
            )}

            {/* ── Protocol error banner ── */}
            {errors.length > 0 && !demoMode && (
              <div className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
                <span>⚠</span>
                Some protocols unreachable on devnet — switch to Demo mode to preview the full UI.
              </div>
            )}

            {/* ── Global health ── */}
            <GlobalHealthCard health={globalHealth} loading={loading} />

            {/* ── Savings summary ── */}
            {!loading && opportunities.length > 0 && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-emerald-400 font-semibold">
                    💡 Refinancing opportunities found
                  </p>
                  <p className="text-white/60 text-sm mt-0.5">
                    Save up to{" "}
                    <span className="text-white font-semibold">
                      ${opportunities.reduce((s, o) => s + o.monthlySavingsUsd, 0).toFixed(2)}/month
                    </span>{" "}
                    by moving to cheaper protocols
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-emerald-400">{opportunities.length}</span>
                  <span className="text-white/40 text-sm">opportunit{opportunities.length === 1 ? "y" : "ies"}</span>
                </div>
              </div>
            )}

            {/* ── Positions ── */}
            <section>
              <h2 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                Active Positions
              </h2>
              <PositionTable
                positions={positions}
                opportunities={opportunities}
                loading={loading}
                onRefinance={handleRefinance}
              />
            </section>

            {/* ── Airdrop helper (mobile) ── */}
            {!loading && (
              <div className="sm:hidden text-center pt-2">
                <button
                  onClick={handleAirdrop}
                  disabled={airdropping}
                  className="text-xs text-white/30 hover:text-white/60 transition"
                >
                  {airdropping ? "Airdropping…" : "⛽ Get 2 devnet SOL"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Guided refinance modal ── */}
      <RefinanceModal flow={flow} />

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}
