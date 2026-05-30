"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletPill } from "@/components/wallet-pill";

const NAV = [
  { to: "/trade", label: "Trade" },
  { to: "/portfolio", label: "Portfolio" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="surface-1 sticky top-0 z-50 flex h-12 items-center gap-6 border-b hairline px-4">
      <Link href="/trade" className="flex items-center gap-2">
        <div className="h-5 w-5">
          <svg viewBox="0 0 20 20" className="h-full w-full">
            <path d="M3 14 L10 4 L17 14 L10 10 Z" fill="#1fcb7c" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-tight text-bright">
          Zenith
        </span>
        <span className="micro-label ml-1 hidden md:inline">
          On-Chain Perpetuals
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV.map((n) => {
          const active = pathname === n.to;
          return (
            <Link
              key={n.to}
              href={n.to}
              className={`rounded-sm2 px-3 py-1.5 text-xs transition-colors ${
                active ? "surface-3 text-bright" : "text-dim hover:text-bright"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="mono hidden items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1fcb7c]" />
          Solana · Devnet
        </div>
        <WalletPill />
      </div>
    </header>
  );
}
