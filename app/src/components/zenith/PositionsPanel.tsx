"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SidePill } from "./SidePill";
import { useMarket } from "@/hooks/useMarket";
import { usePosition, type PositionData } from "@/hooks/usePosition";
import { useCollateral } from "@/hooks/useCollateral";
import { useTrade } from "@/hooks/useTrade";
import { useConnectedWallet } from "@/components/wallet/useConnectedWallet";
import { usd, price as fmtPrice, size as fmtSize } from "@/lib/format";

type Tab = "positions" | "orders" | "history";

export function PositionsPanel() {
  const { isConnected } = useConnectedWallet();
  const { market } = useMarket();
  const { position, refresh: refreshPosition } = usePosition();
  const { refresh: refreshCollateral } = useCollateral();
  const { place, busy } = useTrade();

  const [tab, setTab] = useState<Tab>("positions");

  // Mark = on-chain oracle price (raw ~150 scale, shown as-is).
  const mark = market?.oraclePrice ?? 0;
  const hasPosition = !!position && position.side !== "flat";

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "positions", label: "Positions", count: hasPosition ? 1 : 0 },
    { id: "orders", label: "Open Orders", count: 0 },
    { id: "history", label: "Trade History", count: 0 },
  ];

  async function onClose() {
    if (!position || position.side === "flat" || !market) return;
    try {
      await place({
        side: position.side === "long" ? "sell" : "buy",
        kind: "market",
        qty: Math.abs(Math.round(position.basePosition)),
        limitPrice: Math.round(mark || 1),
        leverage: position.leverage || 1,
        imBps: market.imBps,
      });
      toast.success("Close order submitted");
      refreshPosition();
      refreshCollateral();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to close");
    }
  }

  return (
    <div className="surface-2 flex h-full flex-col">
      <div className="flex items-center border-b hairline">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-bright" : "text-dim hover:text-bright"
              }`}
            >
              {t.label}
              <span className="mono surface-3 rounded-sm2 px-1.5 py-0.5 text-[10px] text-muted">
                {t.count}
              </span>
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-[#1fcb7c]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "positions" &&
          (!isConnected ? (
            <Empty label="Connect wallet to view positions" />
          ) : hasPosition && position ? (
            <PositionsTable
              position={position}
              mark={mark}
              onClose={onClose}
              busy={busy}
            />
          ) : (
            <Empty label="No open positions" />
          ))}
        {tab === "orders" && <Empty label="No open orders" />}
        {tab === "history" && <Empty label="No trade history yet" />}
      </div>
    </div>
  );
}

function PositionsTable({
  position,
  mark,
  onClose,
  busy,
}: {
  position: PositionData;
  mark: number;
  onClose: () => void;
  busy: boolean;
}) {
  const sizeAbs = Math.abs(position.basePosition);
  // uPnL = (mark - entry) * basePosition (basePosition signed: + long, - short)
  const uPnl = (mark - position.entryPrice) * position.basePosition;
  const uPnlPct =
    position.entryPrice > 0
      ? ((mark - position.entryPrice) / position.entryPrice) *
        100 *
        (position.side === "long" ? 1 : -1)
      : 0;
  const mm = 0.03;
  const lev = position.leverage || 1;
  const liq =
    position.side === "long"
      ? position.entryPrice * (1 - (1 / lev - mm))
      : position.entryPrice * (1 + (1 / lev - mm));

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left">
          <Th>Market</Th>
          <Th>Side</Th>
          <Th>Size</Th>
          <Th>Entry</Th>
          <Th>Mark</Th>
          <Th>Liq. Price</Th>
          <Th>Lev.</Th>
          <Th>Unrealized PnL</Th>
          <Th> </Th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t hairline">
          <Td className="font-medium text-bright">SOL-PERP</Td>
          <Td>
            <SidePill side={position.side === "short" ? "short" : "long"} />
          </Td>
          <Td className="mono text-bright">{fmtSize(sizeAbs, 0)} SOL</Td>
          <Td className="mono text-dim">${fmtPrice(position.entryPrice, 0)}</Td>
          <Td className="mono text-bright">${fmtPrice(mark, 0)}</Td>
          <Td className="mono text-short">${fmtPrice(liq, 0)}</Td>
          <Td className="mono text-dim">{lev}×</Td>
          <Td>
            <span className={`mono ${uPnl >= 0 ? "text-long" : "text-short"}`}>
              {usd(uPnl)}
            </span>
            <span
              className={`mono ml-1 text-[10px] ${uPnl >= 0 ? "text-long" : "text-short"}`}
            >
              ({uPnlPct >= 0 ? "+" : ""}
              {uPnlPct.toFixed(2)}%)
            </span>
          </Td>
          <Td className="text-right">
            <button
              onClick={onClose}
              disabled={busy}
              className="mono whitespace-nowrap rounded-sm2 border border-[rgba(255,255,255,0.12)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-dim transition-colors hover:text-short disabled:opacity-40"
            >
              {busy ? "…" : "Close"}
            </button>
          </Td>
        </tr>
      </tbody>
    </table>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border hairline">
        <div className="h-1.5 w-1.5 rounded-full bg-[#56657a]" />
      </div>
      <span className="mono text-[11px] uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="micro-label px-4 py-2 font-normal">{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
