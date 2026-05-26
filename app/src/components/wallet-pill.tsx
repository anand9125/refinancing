"use client";
import { useState } from "react";
import { ChevronDown, Copy, LogOut, Wallet as WalletIcon } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function short(addr: string) {
  return addr.length <= 10 ? addr : `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletPill() {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!connected || !publicKey) {
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

  const addr = publicKey.toBase58();

  async function copy() {
    await navigator.clipboard.writeText(addr).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-10 pl-2 pr-3 rounded-full bg-[rgba(10,20,34,0.7)] border border-border-base backdrop-blur-md hover:border-border-lit transition-colors cursor-pointer"
      >
        <span className="w-6 h-6 rounded-full bg-[radial-gradient(circle_at_30%_30%,#D066FF_0%,#7A5BD6_35%,#2A7FB8_70%,#1DB67D_100%)] block shrink-0" />
        <span className="font-num text-[12.5px] font-semibold text-text-base">{short(addr)}</span>
        <ChevronDown size={13} strokeWidth={2} className={`text-text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-lg bg-surface-1 border border-border-base shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
            <div className="px-4 py-3 border-b border-border-base">
              <p className="font-ui text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted">Connected</p>
              <p className="font-ui text-[12px] font-semibold text-text-base mt-0.5">{wallet?.adapter.name ?? "Wallet"}</p>
              <p className="font-num text-[11px] text-text-muted mt-0.5 truncate">{addr}</p>
            </div>
            <button onClick={copy} className="flex w-full items-center gap-2.5 px-4 py-2.5 font-ui text-[13px] text-text-base hover:bg-white/4 transition-colors cursor-pointer">
              <Copy size={13} className="text-text-muted" /> {copied ? "Copied!" : "Copy address"}
            </button>
            <button onClick={() => { setMenuOpen(false); disconnect(); }} className="flex w-full items-center gap-2.5 px-4 py-2.5 font-ui text-[13px] text-danger hover:bg-danger/10 transition-colors border-t border-border-base cursor-pointer">
              <LogOut size={13} /> Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
