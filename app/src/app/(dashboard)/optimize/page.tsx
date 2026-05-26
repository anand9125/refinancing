"use client";

import { Zap, ArrowRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MainCard } from "@/components/main-card";
import { ActionButton } from "@/components/ui/action-button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { usePositions } from "@/hooks/usePositions";
import { useRefinanceFlow } from "@/hooks/useRefinanceFlow";
import { findRefinanceOpportunities } from "@/lib/health";
import { PROTOCOL_LABELS, PROTOCOL_COLORS } from "@/lib/constants";
import { RefinanceModal } from "@/components/RefinanceModal";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useEffect, useRef } from "react";
import type { FlowStage } from "@/hooks/useRefinanceFlow";
import type { RefinanceOpportunity } from "@/types";

const STAGE_MESSAGES: Partial<Record<FlowStage, string>> = {
  repay:    "Session opened ✓ — now repay your debt on source protocol",
  withdraw: "Step 1 confirmed ✓ — withdraw collateral from source",
  deposit:  "Step 2 confirmed ✓ — deposit into target protocol",
  borrow:   "Step 3 confirmed ✓ — borrow on target protocol",
  done:     "Refinancing complete! Position moved successfully",
  cancelled:"Session cancelled — rent returned to wallet",
};

const PROTOCOL_URLS: Record<number, string> = {
  0: "https://app.kamino.finance/",
  1: "https://app.marginfi.com/",
  2: "https://solend.fi/",
};

function ConnectGate() {
  return (
    <div className="py-16 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">⚡</div>
      <p className="font-ui text-[18px] font-bold text-text-bright">Connect your wallet</p>
      <p className="font-ui text-[14px] text-text-muted max-w-xs">Connect a Solana wallet to see your refinancing opportunities.</p>
    </div>
  );
}

function NoOpportunities() {
  return (
    <div className="py-16 text-center">
      <p className="font-ui text-[15px] font-semibold text-text-dim">No refinancing opportunities found</p>
      <p className="font-ui text-[13px] text-text-muted mt-1">Your positions are already optimally placed, or switch to Demo mode to explore.</p>
    </div>
  );
}

function OpportunityCard({ opp, onStart }: { opp: RefinanceOpportunity; onStart: () => void }) {
  const src = opp.position.protocol;
  const tgt = opp.targetProtocol;
  const srcColor = PROTOCOL_COLORS[src];
  const tgtColor = PROTOCOL_COLORS[tgt];

  return (
    <div className="rounded-xl border border-border-base bg-white/2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-muted">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: srcColor }} />
          <span className="font-ui text-[14px] font-bold text-text-bright">{PROTOCOL_LABELS[src]}</span>
        </div>
        <ArrowRight size={14} className="text-text-faint" />
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tgtColor }} />
          <span className="font-ui text-[14px] font-bold text-accent">{PROTOCOL_LABELS[tgt]}</span>
        </div>
        <div className="flex-1" />
        <span className="font-num text-[13px] font-bold text-accent">Save ${opp.monthlySavingsUsd.toFixed(2)}/mo</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-muted">
        {[
          { label: "Current APR", value: `${(opp.position.borrowApr*100).toFixed(2)}%`, accent: false },
          { label: "New APR", value: `${(opp.targetBorrowApr*100).toFixed(2)}%`, accent: true },
          { label: "Monthly savings", value: `$${opp.monthlySavingsUsd.toFixed(2)}`, accent: true },
          { label: "Annual savings", value: `$${opp.annualSavingsUsd.toFixed(2)}`, accent: true },
        ].map((s) => (
          <div key={s.label} className="bg-surface-1 px-4 py-3">
            <p className="font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">{s.label}</p>
            <p className={`font-num text-[18px] font-bold tabular-nums mt-1 ${s.accent ? "text-accent" : "text-text-base"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-3 px-5 py-4">
        <ActionButton onClick={onStart} leadingIcon={<Zap size={14} strokeWidth={2.5} />}>
          Start guided refinancing
        </ActionButton>
        <a href={PROTOCOL_URLS[src]} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-ui text-[13px] text-text-muted hover:text-text-dim transition-colors">
          <ExternalLink size={12} /> {PROTOCOL_LABELS[src]}
        </a>
        <a href={PROTOCOL_URLS[tgt]} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-ui text-[13px] text-text-muted hover:text-text-dim transition-colors">
          <ExternalLink size={12} /> {PROTOCOL_LABELS[tgt]}
        </a>
      </div>

      {/* How it works */}
      <div className="px-5 pb-5">
        <p className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-text-faint mb-3">How it works — 4 on-chain steps</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { n: 1, label: `Repay debt on ${PROTOCOL_LABELS[src]}` },
            { n: 2, label: `Withdraw collateral from ${PROTOCOL_LABELS[src]}` },
            { n: 3, label: `Deposit into ${PROTOCOL_LABELS[tgt]}` },
            { n: 4, label: `Borrow on ${PROTOCOL_LABELS[tgt]}` },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-2 bg-white/2 rounded-lg px-3 py-2.5">
              <span className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{step.n}</span>
              <span className="font-ui text-[12px] text-text-dim leading-snug">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OptimizePage() {
  const { isConnected } = useConnectedWallet();
  const { positions, loading, ratesByProtocol, demoMode, setDemoMode } = usePositions();
  const flow = useRefinanceFlow();
  const toast = useToast();
  const prevStage = useRef<FlowStage>("idle");

  useEffect(() => {
    if (flow.stage === prevStage.current) return;
    prevStage.current = flow.stage;
    const msg = STAGE_MESSAGES[flow.stage];
    if (!msg) return;
    toast.add(flow.stage === "cancelled" ? "info" : "success", msg, flow.lastTxSig ?? undefined);
  }, [flow.stage, flow.lastTxSig]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (flow.error) toast.add("error", flow.error);
  }, [flow.error]); // eslint-disable-line react-hooks/exhaustive-deps

  const opps = findRefinanceOpportunities(positions, ratesByProtocol);

  let body: React.ReactNode;
  if (!isConnected && !demoMode) {
    body = <ConnectGate />;
  } else if (loading && positions.length === 0) {
    body = (
      <div className="space-y-4">
        {[...Array(2)].map((_,i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
      </div>
    );
  } else if (opps.length === 0) {
    body = <NoOpportunities />;
  } else {
    body = (
      <div className="space-y-4">
        {opps.map((opp, i) => (
          <OpportunityCard key={i} opp={opp} onStart={() => flow.open(opp)} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <PageHeader title="Optimize" icon={Zap} />

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        <SegmentedTabs
          tabs={[
            { value: "live" as const, label: "Live (devnet)" },
            { value: "demo" as const, label: "Demo" },
          ]}
          value={demoMode ? "demo" : "live"}
          onChange={(v) => setDemoMode(v === "demo")}
          className="max-w-xs"
        />
        {opps.length > 0 && (
          <span className="ml-auto font-ui text-[13px] text-text-muted">
            {opps.length} opportunit{opps.length === 1 ? "y" : "ies"} — save up to{" "}
            <span className="text-accent font-semibold">
              ${opps.reduce((s,o)=>s+o.monthlySavingsUsd,0).toFixed(2)}/month
            </span>
          </span>
        )}
      </div>

      <MainCard>{body}</MainCard>

      <RefinanceModal flow={flow} />
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}
