"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PositionsPanel } from "@/components/zenith/PositionsPanel";
import { Stat } from "@/components/zenith/Stat";
import { useCollateral } from "@/hooks/useCollateral";
import { useCollateralActions } from "@/hooks/useCollateralActions";
import { usePosition } from "@/hooks/usePosition";
import { useMarket } from "@/hooks/useMarket";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { usd } from "@/lib/format";

export default function PortfolioPage() {
  const { isConnected } = useConnectedWallet();
  const { collateral, refresh: refreshCollateral } = useCollateral();
  const { deposit, withdraw, busy } = useCollateralActions();
  const { position, refresh: refreshPosition } = usePosition();
  const { market } = useMarket();

  const [amount, setAmount] = useState("");

  const free = collateral?.amount ?? 0;
  const mark = market?.oraclePrice ?? 0;
  const positionMargin = position?.initialMargin ?? 0;
  const equity = free + positionMargin;

  const uPnl =
    position && position.side !== "flat" && mark > 0
      ? (mark - position.entryPrice) * position.basePosition
      : 0;

  async function onDeposit() {
    const n = parseFloat(amount);
    if (!(n > 0)) return toast.error("Enter an amount");
    try {
      await deposit(n);
      toast.success(`Deposited ${usd(n)}`);
      setAmount("");
      refreshCollateral();
      refreshPosition();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deposit failed");
    }
  }

  async function onWithdraw() {
    const n = parseFloat(amount);
    if (!(n > 0)) return toast.error("Enter an amount");
    try {
      await withdraw(n);
      toast.success(`Withdrew ${usd(n)}`);
      setAmount("");
      refreshCollateral();
      refreshPosition();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Withdraw failed");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-px bg-[rgba(255,255,255,0.06)] p-px">
      <div className="surface-1 p-6">
        <h1 className="mb-5 text-sm font-semibold text-bright">
          Account Overview
        </h1>
        <div className="flex flex-wrap gap-8">
          <Stat label="Account Equity" value={isConnected ? usd(equity) : "—"} />
          <Stat label="Free Collateral" value={isConnected ? usd(free) : "—"} />
          <Stat label="Position Margin" value={usd(positionMargin)} />
          <Stat
            label="Unrealized PnL"
            value={usd(uPnl)}
            accent={uPnl >= 0 ? "long" : "short"}
          />
          <Stat
            label="Realized PnL"
            value={usd(position?.realizedPnl ?? 0)}
            accent={(position?.realizedPnl ?? 0) >= 0 ? "long" : "short"}
          />
        </div>
      </div>

      <div className="surface-1 p-6">
        <h2 className="mb-4 text-sm font-semibold text-bright">Collateral</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="surface-2 flex items-center rounded-sm2 border hairline px-3 py-2 sm:w-64">
            <input
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
              }}
              placeholder="0.00"
              inputMode="decimal"
              disabled={!isConnected}
              className="mono w-full bg-transparent text-sm text-bright outline-none disabled:opacity-50"
            />
            <span className="micro-label ml-2">USDC</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDeposit}
              disabled={busy || !isConnected}
              className="mono rounded-sm2 px-5 py-2 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "#1fcb7c", color: "#03110a" }}
            >
              Deposit
            </button>
            <button
              onClick={onWithdraw}
              disabled={busy || !isConnected}
              className="mono rounded-sm2 border border-[rgba(255,255,255,0.12)] px-5 py-2 text-sm font-semibold text-bright transition-colors hover:bg-[#131a24] disabled:opacity-50"
            >
              Withdraw
            </button>
          </div>
        </div>
        {!isConnected && (
          <p className="mt-3 text-xs text-muted">
            Connect your wallet to manage collateral.
          </p>
        )}
      </div>

      <div className="surface-1 min-h-[280px]">
        <PositionsPanel />
      </div>
    </div>
  );
}
