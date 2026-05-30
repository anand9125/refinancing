"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { shortKey } from "@/lib/format";

export function WalletPill() {
  const { publicKey, connected, disconnect, connect, wallets, select } =
    useWallet();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="mono rounded-md2 border border-[hsl(var(--border-strong))] surface-2 px-3 py-1.5 text-[12px] text-bright transition-colors hover:bg-[hsl(var(--surface-3))]"
      >
        {connected && publicKey ? shortKey(publicKey.toBase58()) : "Connect Wallet"}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md4 border border-[hsl(var(--border-strong))] surface-1 p-2 shadow-xl">
          {!connected ? (
            wallets.length === 0 ? (
              <div className="px-2 py-1.5 text-[12px] text-muted">
                No wallets found
              </div>
            ) : (
              wallets.map((w) => (
                <button
                  key={w.adapter.name}
                  onClick={() => {
                    select(w.adapter.name);
                    connect().catch(() => {});
                    setOpen(false);
                  }}
                  className="block w-full rounded-sm2 px-2 py-1.5 text-left text-[13px] text-dim transition-colors hover:bg-[hsl(var(--surface-3))] hover:text-bright"
                >
                  {w.adapter.name}
                </button>
              ))
            )
          ) : (
            <button
              onClick={() => {
                disconnect().catch(() => {});
                setOpen(false);
              }}
              className="block w-full rounded-sm2 px-2 py-1.5 text-left text-[13px] text-dim transition-colors hover:bg-[hsl(var(--surface-3))] hover:text-bright"
            >
              Disconnect
            </button>
          )}
        </div>
      )}
    </div>
  );
}
