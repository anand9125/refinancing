"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, LogOut, Check } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnectedWallet } from "./wallet/useConnectedWallet";
import { shortKey } from "@/lib/format";

export function WalletPill() {
  const { isConnected, address } = useConnectedWallet();
  const { disconnect, wallet } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [menuOpen]);

  if (!isConnected || !address) {
    return (
      <WalletMultiButton
        style={{
          background: "linear-gradient(135deg,#1DB67D 0%,#27C98C 100%)",
          color: "#0a1220",
          fontFamily: "var(--font-dm-sans)",
          fontWeight: 700,
          fontSize: 14,
          borderRadius: 8,
          height: 40,
          border: "1px solid rgba(29,182,125,0.3)",
        }}
      />
    );
  }

  async function copy() {
    if (!address) return;
    await navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-10 pl-3 pr-3 rounded-full bg-[rgba(10,20,34,0.7)] border border-border-base backdrop-blur-md hover:border-border-lit transition-colors cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full shrink-0 bg-accent shadow-[0_0_8px_rgba(29,182,125,0.6)]" />
        <span className="font-num text-[12.5px] font-semibold text-text-base">
          {shortKey(address)}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={`text-text-muted transition-transform ${
            menuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-lg bg-surface-1 border border-border-base shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="px-4 py-3 border-b border-border-base">
            <p className="font-ui text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted">
              Connected
            </p>
            <p className="font-ui text-[12px] font-semibold text-text-base mt-0.5">
              {wallet?.adapter.name ?? "Wallet"}
            </p>
            <p className="font-num text-[11px] text-text-muted mt-0.5 truncate">
              {address}
            </p>
          </div>
          <button
            onClick={copy}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 font-ui text-[13px] text-text-base hover:bg-white/4 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check size={13} className="text-accent" />
            ) : (
              <Copy size={13} className="text-text-muted" />
            )}
            {copied ? "Copied!" : "Copy address"}
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              void disconnect();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 font-ui text-[13px] text-danger hover:bg-danger/10 transition-colors border-t border-border-base cursor-pointer"
          >
            <LogOut size={13} /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
