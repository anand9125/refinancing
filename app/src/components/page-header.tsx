"use client";
import type { LucideIcon } from "lucide-react";
import { WalletPill } from "./wallet-pill";

export function PageHeader({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 shrink-0 self-end sm:order-2">
        <WalletPill />
      </div>
      <div className="flex items-center gap-2.5 min-w-0 sm:order-1">
        <div className="flex items-center justify-center w-9 h-9 rounded-md shrink-0 border border-border-base bg-white/2">
          <Icon size={20} strokeWidth={1.8} className="text-accent" />
        </div>
        <h1 className="font-ui text-[26px] sm:text-[34px] font-bold tracking-[-0.02em] leading-[1.1] text-text-bright truncate">
          {title}
        </h1>
      </div>
    </div>
  );
}
