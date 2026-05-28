"use client";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { WalletPill } from "./wallet-pill";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 min-w-0 order-2 sm:order-1">
        {Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-md shrink-0 border border-border-base bg-accent/10">
            <Icon size={20} strokeWidth={1.8} className="text-accent" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-ui text-[26px] sm:text-[32px] font-bold tracking-[-0.02em] leading-[1.1] text-text-bright truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="font-ui text-[13px] text-text-muted mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end order-1 sm:order-2">
        {actions}
        <WalletPill />
      </div>
    </div>
  );
}
