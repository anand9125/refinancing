"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { useCollateral } from "@/hooks/useCollateral";
import { usePosition } from "@/hooks/usePosition";
import { useMarket } from "@/hooks/useMarket";
import { useCollateralActions } from "@/hooks/useCollateralActions";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { usd, price as fmtPrice, size as fmtSize } from "@/lib/format";

type Mode = "deposit" | "withdraw";

export default function PortfolioPage() {
  const { isConnected } = useConnectedWallet();
  const { collateral, refresh: refreshCollateral } = useCollateral();
  const { position, refresh: refreshPosition } = usePosition();
  const { market } = useMarket();
  const { deposit, withdraw, busy } = useCollateralActions();

  const [mode, setMode] = useState<Mode>("deposit");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const markPrice = market?.oraclePrice ?? 0;
  const uPnl =
    position && position.side !== "flat"
      ? (markPrice - position.entryPrice) * position.basePosition
      : 0;
  const equity = (collateral?.amount ?? 0) + uPnl;

  async function submit() {
    setError(null);
    setOkMsg(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount");
      return;
    }
    try {
      if (mode === "deposit") {
        await deposit(amt);
      } else {
        await withdraw(amt);
      }
      setOkMsg(`${mode === "deposit" ? "Deposited" : "Withdrew"} ${usd(amt)}`);
      setAmount("");
      refreshCollateral();
      refreshPosition();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    }
  }

  return (
    <div className="relative z-10">
      <PageHeader
        title="Portfolio"
        subtitle="Manage collateral and review your open position"
        icon={Wallet}
      />

      {/* Equity summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatCard
          label="Account equity"
          value={isConnected ? usd(equity) : "—"}
          highlight
        />
        <StatCard
          label="Free collateral"
          value={isConnected && collateral ? usd(collateral.amount) : "—"}
        />
        <StatCard
          label="Unrealized PnL"
          value={isConnected ? usd(uPnl) : "—"}
          tone={uPnl > 0 ? "up" : uPnl < 0 ? "down" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Deposit / Withdraw */}
        <div className="rounded-xl border border-border-base bg-[linear-gradient(180deg,var(--color-surface-1)_0%,var(--color-surface-2)_100%)] p-5 h-fit">
          <SegmentedTabs
            tabs={[
              { value: "deposit" as const, label: "Deposit" },
              { value: "withdraw" as const, label: "Withdraw" },
            ]}
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
              setOkMsg(null);
            }}
          />

          <div className="mt-4">
            <span className="font-ui text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted mb-1.5 block">
              Amount
            </span>
            <div className="relative">
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
                }}
                placeholder="0.00"
                className="w-full h-12 rounded-md bg-surface-0 border border-border-base px-3 pr-16 font-num text-[16px] text-text-bright placeholder:text-text-faint focus:outline-none focus:border-accent/50 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-ui text-[12px] font-semibold text-text-muted">
                USDC
              </span>
            </div>
          </div>

          {error && (
            <p className="mt-3 font-ui text-[12px] text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {okMsg && (
            <p className="mt-3 font-ui text-[12px] text-accent bg-accent/10 border border-accent/20 rounded-md px-3 py-2">
              {okMsg}
            </p>
          )}

          <button
            type="button"
            disabled={!isConnected || busy}
            onClick={submit}
            className={`mt-4 w-full h-11 rounded-md font-ui text-[14px] font-bold inline-flex items-center justify-center gap-2 transition-all ${
              isConnected && !busy
                ? "bg-[linear-gradient(135deg,#1DB67D_0%,#27C98C_100%)] text-surface-1 cursor-pointer hover:shadow-[0_6px_16px_rgba(29,182,125,0.25)]"
                : "bg-white/[0.04] text-text-muted cursor-not-allowed"
            }`}
          >
            {mode === "deposit" ? (
              <ArrowDownToLine size={15} strokeWidth={2.5} />
            ) : (
              <ArrowUpFromLine size={15} strokeWidth={2.5} />
            )}
            {!isConnected
              ? "Connect wallet"
              : busy
              ? "Submitting…"
              : mode === "deposit"
              ? "Deposit USDC"
              : "Withdraw USDC"}
          </button>
        </div>

        {/* Position */}
        <div className="rounded-xl border border-border-base bg-surface-1 p-5">
          <h2 className="font-ui text-[13px] font-bold uppercase tracking-[0.12em] text-text-muted mb-4">
            Open Position
          </h2>

          {!isConnected ? (
            <Empty text="Connect your wallet to view your position." />
          ) : !position || position.side === "flat" ? (
            <Empty text="No open position. Place a trade to get started." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <PosCell label="Market">{market?.symbol ?? "—"}</PosCell>
              <PosCell label="Side">
                <span
                  className={
                    position.side === "long" ? "text-accent" : "text-danger"
                  }
                >
                  {position.side.toUpperCase()}
                </span>
              </PosCell>
              <PosCell label="Size">
                {fmtSize(Math.abs(position.basePosition))}
              </PosCell>
              <PosCell label="Entry price">
                {fmtPrice(position.entryPrice, 0)}
              </PosCell>
              <PosCell label="Mark price">{fmtPrice(markPrice, 0)}</PosCell>
              <PosCell label="Leverage">{position.leverage}×</PosCell>
              <PosCell label="Unrealized PnL">
                <span className={uPnl >= 0 ? "text-accent" : "text-danger"}>
                  {usd(uPnl)}
                </span>
              </PosCell>
              <PosCell label="Realized PnL">
                {fmtPrice(position.realizedPnl, 0)}
              </PosCell>
              <PosCell label="Margin">
                {fmtPrice(position.initialMargin, 0)}
              </PosCell>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  tone = "neutral",
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "up" | "down" | "neutral";
}) {
  const color =
    tone === "up"
      ? "text-accent"
      : tone === "down"
      ? "text-danger"
      : highlight
      ? "text-text-bright"
      : "text-text-base";
  return (
    <div className="rounded-xl border border-border-base bg-surface-1 px-5 py-4">
      <p className="font-ui text-[11px] font-bold uppercase tracking-[0.1em] text-text-muted mb-1">
        {label}
      </p>
      <p className={`font-num text-[22px] font-bold ${color}`}>{value}</p>
    </div>
  );
}

function PosCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-ui text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted mb-1">
        {label}
      </p>
      <p className="font-num text-[16px] font-bold text-text-base">{children}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-12 text-center">
      <p className="font-ui text-[13px] text-text-muted">{text}</p>
    </div>
  );
}
