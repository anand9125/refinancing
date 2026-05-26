"use client";

import { Home, AlertTriangle, Zap, ArrowUpRight } from "lucide-react";
import { FiActivity, FiPercent, FiChevronDown } from "react-icons/fi";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MainCard } from "@/components/main-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { usePositions } from "@/hooks/usePositions";
import { computeGlobalHealth, findRefinanceOpportunities } from "@/lib/health";
import { PROTOCOL_LABELS, PROTOCOL_COLORS } from "@/lib/constants";
import { C } from "@/lib/theme";
import type { Protocol } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMoney(n: number) {
  const abs = Math.abs(n);
  const whole = Math.floor(abs).toLocaleString("en-US");
  const cents = (abs - Math.floor(abs)).toFixed(2).slice(1);
  return { whole: `${n < 0 ? "-" : ""}${whole}`, cents };
}
const fmtUsd = (n: number) => `${n >= 0 ? "+" : "-"}$${Math.abs(n).toFixed(2)}`;
const fmtPct = (n: number) => `${n >= 0 ? "+" : "-"}${Math.abs(n).toFixed(2)}%`;

const SPARK: Record<number, number[]> = {
  0: [18,20,19,22,24,23,26,28,27,30,32,34,36,38,40,42],
  1: [26,30,14,34,18,38,12,40,16,36,20,38,14,34,22,30],
  2: [16,18,20,19,22,24,26,25,28,30,32,31,34,36,38,40],
};

function toneFromHealth(pct: number) {
  if (pct >= 60) return "safe";
  if (pct >= 30) return "warn";
  return "danger";
}
const TONE_COLOR = { safe: C.green, warn: C.warn, danger: C.danger } as const;
const TONE_CLASS = { safe: "text-accent", warn: "text-warn", danger: "text-danger" } as const;

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const W = 200; const H = 44; const pad = 4;
  const min = Math.min(...values); const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const pts = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (W - pad * 2),
    pad + (1 - (v - min) / range) * (H - pad * 2),
  ] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const area = `${d} L ${pts[pts.length-1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  const gid = `sg${color.replace(/\W/g,"")}`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
    </svg>
  );
}

// ─── Health gauge ─────────────────────────────────────────────────────────────
function HealthGauge({ percent }: { percent: number }) {
  const W = 340; const H = 200; const cx = W/2; const cy = H - 20; const r = 130; const stroke = 13;
  const p = Math.max(0, Math.min(100, percent)) / 100;
  const angle = Math.PI * (1 - p);
  const endX = cx + r * Math.cos(angle); const endY = cy - r * Math.sin(angle);
  const tone = toneFromHealth(percent);
  const color = TONE_COLOR[tone];

  return (
    <div className="flex flex-col items-center">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth={stroke} strokeLinecap="round" />
        {p > 0 && (
          <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        )}
        <g transform={`translate(${cx},${cy-40})`}>
          <text textAnchor="middle" fontFamily="var(--font-dm-sans),sans-serif" fontSize={10}
            fontWeight={700} letterSpacing="0.18em" fill={C.textMuted} y={-18}>HEALTH MONITOR</text>
          <text y={28} textAnchor="middle" fontFamily="var(--font-ibm-plex-mono),monospace"
            fontWeight={700} fontSize={38} fill={color} style={{ letterSpacing: "-0.02em" }}>
            {percent}%
          </text>
        </g>
      </svg>
      <div className="flex w-full justify-around -mt-2 px-4">
        {["LIQ.", "SAFE", "HEALTHY"].map((l) => (
          <span key={l} className="font-ui text-[11px] font-bold uppercase text-text-muted">{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Save pill ────────────────────────────────────────────────────────────────
function SavePill({ opportunities }: { opportunities: { protocol: Protocol; monthly: number }[] }) {
  const total = opportunities.reduce((s, o) => s + o.monthly, 0);
  if (total <= 0) return null;
  return (
    <div className="relative group w-fit">
      <button type="button" className="inline-flex items-center gap-3 h-8 px-4 rounded-lg border border-border-base bg-white/2 cursor-pointer hover:bg-white/4 group-hover:border-accent/30 transition-colors">
        <span className="font-ui text-[14px] font-medium text-text-base">Save</span>
        <span className="font-num text-[15px] font-semibold text-accent">${total.toFixed(0)}/mo</span>
        <span className="hidden sm:inline font-ui text-[13px] text-text-dim">across {opportunities.length} protocols</span>
        <FiChevronDown size={13} className="text-text-muted transition-transform group-hover:rotate-180" />
      </button>
      {/* Hover popover */}
      <div className="absolute top-full left-0 mt-3 w-72 z-50 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
        <div className="absolute -top-1.5 left-6 w-3 h-3 rotate-45 border-l border-t border-border-base bg-surface-1" />
        <div className="rounded-lg border border-border-base bg-surface-1 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] p-4">
          <div className="flex justify-between mb-3">
            <span className="font-ui text-[10px] tracking-[0.2em] font-bold uppercase text-text-muted">Savings by Protocol</span>
            <span className="font-ui text-[10px] tracking-[0.2em] font-bold uppercase text-text-faint">Monthly</span>
          </div>
          {opportunities.map((o) => (
            <div key={o.protocol} className="flex items-center gap-3 py-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PROTOCOL_COLORS[o.protocol] }} />
              <span className="flex-1 font-ui text-[13px] text-text-base">{PROTOCOL_LABELS[o.protocol]}</span>
              <span className="font-num text-[13px] font-semibold text-accent">+${o.monthly.toFixed(0)}</span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-border-base flex items-center">
            <span className="flex-1 font-ui text-[11px] tracking-widest font-bold uppercase text-text-muted">Total</span>
            <span className="font-num text-[14px] font-bold text-accent">+${total.toFixed(0)}/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Connect gate ─────────────────────────────────────────────────────────────
function ConnectGate() {
  return (
    <div className="py-16 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">📊</div>
      <p className="font-ui text-[18px] font-bold text-text-bright">Connect your wallet</p>
      <p className="font-ui text-[14px] text-text-muted max-w-xs">Connect a Solana wallet to load your lending positions across Kamino, MarginFi, and Solend.</p>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-56" />
          <div className="flex gap-3">
            <Skeleton className="h-16 w-40 rounded-lg" />
            <Skeleton className="h-16 w-40 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-48 w-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isConnected, isInitializing } = useConnectedWallet();
  const { positions, loading, ratesByProtocol, demoMode, setDemoMode, protocolStatus } = usePositions();
  const health = computeGlobalHealth(positions);
  const opps = findRefinanceOpportunities(positions, ratesByProtocol);

  // Health as 0-100 pct (map from health factor)
  const healthPct = Math.min(100, Math.max(0, Math.round(
    positions.length === 0 ? 100 :
    ((health.score / 100) * 80 + (health.atRiskCount === 0 ? 20 : 0))
  )));

  const netWorth = health.totalCollateralUsd - health.totalDebtUsd;
  const netMonthly = health.netMonthlyInterestUsd;
  const annualPct = netWorth > 0 ? (netMonthly * 12 * 100) / netWorth : 0;
  const { whole, cents } = fmtMoney(netWorth);

  // Per-protocol savings for the pill
  const savingsByProtocol = opps.map((o) => ({ protocol: o.position.protocol, monthly: o.monthlySavingsUsd }));

  let body: React.ReactNode;

  if (isInitializing || (isConnected && loading && positions.length === 0)) {
    body = <DashboardSkeleton />;
  } else if (!isConnected && !demoMode) {
    body = <ConnectGate />;
  } else {
    body = (
      <>
        {/* ── Top split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-start">
          {/* Net worth + stats */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-ui text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted mb-2">Total Net Worth</p>
              <div className="flex items-baseline leading-none font-num">
                <span className="relative -top-1 text-[26px] font-semibold text-text-dim">$</span>
                <span className="font-extrabold tabular-nums text-[42px] sm:text-[52px] leading-[0.9] tracking-[-0.04em] text-text-bright">{whole}</span>
                <span className="relative -top-0.5 ml-1 font-bold tabular-nums text-[22px] tracking-[-0.02em] text-text-muted">{cents}</span>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex flex-wrap gap-3">
              <StatChip label="Net Interest/mo" value={fmtUsd(netMonthly)} tone={netMonthly >= 0 ? "up" : "down"} icon={<FiActivity size={18} />} />
              <StatChip label="Net APY" value={fmtPct(annualPct)} tone={annualPct >= 0 ? "up" : "down"} icon={<FiPercent size={18} />} />
            </div>

            {/* Savings pill + optimize CTA */}
            <div className="flex items-center gap-3 flex-wrap">
              <SavePill opportunities={savingsByProtocol} />
              {opps.length > 0 && (
                <Link href="/optimize" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg font-ui text-[13px] font-semibold text-accent border border-accent/20 hover:border-accent/40 hover:bg-accent/5 transition-colors cursor-pointer">
                  <Zap size={12} strokeWidth={2.5} /> Optimize now
                </Link>
              )}
            </div>
          </div>

          {/* Health gauge */}
          <div className="flex justify-center">
            <HealthGauge percent={healthPct} />
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-[linear-gradient(to_right,transparent,var(--color-border-base)_15%,var(--color-border-base)_85%,transparent)]" />

        {/* Warning banner */}
        {health.atRiskCount > 0 && (
          <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-danger/5 border border-danger/20 mb-5">
            <div className="w-9 h-9 rounded-md bg-danger/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} strokeWidth={1.9} className="text-danger" />
            </div>
            <p className="font-ui text-[14px] font-medium text-danger">
              {health.atRiskCount} position{health.atRiskCount > 1 ? "s" : ""} at liquidation risk — health factor below 1.3
            </p>
          </div>
        )}

        {/* Protocol cards */}
        {positions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-ui text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">Protocols</p>
              <div className="flex gap-4 font-ui text-[13px] text-text-dim">
                <span>Supplied: <span className="font-num font-bold text-text-base">${health.totalCollateralUsd.toLocaleString("en-US",{maximumFractionDigits:0})}</span></span>
                <span>Borrowed: <span className="font-num font-bold text-text-base">${health.totalDebtUsd.toLocaleString("en-US",{maximumFractionDigits:0})}</span></span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {positions.map((pos, i) => {
                const hf = pos.healthFactor;
                const pct = Math.min(100, Math.max(0, Math.round((hf - 1) * 40)));
                const tone = toneFromHealth(pct);
                const opp = opps.find((o) => o.position.protocol === pos.protocol);
                return (
                  <div key={i} className="group flex flex-col p-4 rounded-lg bg-white/2 border border-border-base hover:-translate-y-0.5 transition-transform cursor-default">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROTOCOL_COLORS[pos.protocol] }} />
                      <span className="font-ui text-[13px] font-semibold text-text-bright flex-1">{PROTOCOL_LABELS[pos.protocol]}</span>
                      {opp && (
                        <Link href="/optimize" className="flex items-center gap-1 font-ui text-[10px] font-bold text-accent hover:text-accent-soft transition-colors">
                          <Zap size={10} /> Optimize <ArrowUpRight size={10} />
                        </Link>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className={`font-num font-bold tabular-nums text-[28px] leading-none tracking-[-0.02em] ${TONE_CLASS[tone]}`}>{pct}</span>
                      <span className={`font-num font-semibold text-[14px] opacity-75 ${TONE_CLASS[tone]}`}>%</span>
                      <span className="flex-1" />
                      <span className={`font-ui text-[9px] tracking-widest font-bold uppercase ${TONE_CLASS[tone]}`}>
                        {pct >= 60 ? "HEALTHY" : pct >= 30 ? "MONITOR" : "AT RISK"}
                      </span>
                    </div>

                    <Sparkline values={SPARK[pos.protocol] ?? SPARK[0]} color={TONE_COLOR[tone]} />

                    <div className="mt-3 pt-3 border-t border-border-muted grid grid-cols-2 gap-y-1 text-[12px]">
                      <span className="text-text-muted">Debt</span>
                      <span className="font-num font-semibold text-text-base text-right">${pos.debtAmountUsd.toLocaleString("en-US",{maximumFractionDigits:0})}</span>
                      <span className="text-text-muted">Borrow APR</span>
                      <span className="font-num font-semibold text-text-base text-right">{(pos.borrowApr*100).toFixed(2)}%</span>
                      {opp && <>
                        <span className="text-text-muted">Save</span>
                        <span className="font-num font-semibold text-accent text-right">+${opp.monthlySavingsUsd.toFixed(0)}/mo</span>
                      </>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-border-muted rounded-xl bg-white/2">
            <p className="font-ui text-[14px] text-text-muted">No positions found — switch to Demo mode to preview the dashboard</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative z-10">
      <PageHeader title="Dashboard" icon={Home} />

      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        {(["Live", "Demo"] as const).map((m) => (
          <button key={m} type="button"
            onClick={() => setDemoMode(m === "Demo")}
            className={`px-3 py-1 rounded-lg font-ui text-[12px] font-semibold transition-all cursor-pointer
              ${(m === "Demo") === demoMode
                ? "bg-accent text-surface-2"
                : "text-text-muted border border-border-base hover:text-text-dim"}`}>
            {m === "Live" ? "Live (devnet)" : "Demo"}
          </button>
        ))}
        <div className="flex gap-3 ml-auto">
          {(["kamino","marginfi","solend"] as const).map((p) => {
            const proto = p === "kamino" ? 0 : p === "marginfi" ? 1 : 2;
            const s = protocolStatus[p];
            return (
              <span key={p} className="flex items-center gap-1 font-ui text-[11px] text-text-faint">
                <span className={s.loading ? "text-warn animate-pulse" : s.error ? "text-danger" : "text-accent"}>●</span>
                {PROTOCOL_LABELS[proto]}
              </span>
            );
          })}
        </div>
      </div>

      <MainCard>{body}</MainCard>
    </div>
  );
}

function StatChip({ label, value, tone, icon }: { label: string; value: string; tone: "up"|"down"|"neutral"; icon: React.ReactNode }) {
  const cls = tone === "up" ? "text-accent" : tone === "down" ? "text-danger" : "text-text-base";
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-border-base bg-white/2 min-w-[160px]">
      <div>
        <p className="font-ui text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted">{label}</p>
        <p className={`font-num text-[18px] font-semibold tabular-nums mt-0.5 ${cls}`}>{value}</p>
      </div>
      <span className="text-text-faint">{icon}</span>
    </div>
  );
}
