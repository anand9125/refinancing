"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { CandlestickChart, Wallet, X, type LucideIcon } from "lucide-react";
import { MARKET_SYMBOL, PROGRAM_ID } from "@/lib/constants";
import { shortKey } from "@/lib/format";

const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Trade", href: "/trade", icon: CandlestickChart },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
];

function NavItem({
  icon: Icon,
  label,
  href,
  active,
  labelStyle,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  active: boolean;
  labelStyle: CSSProperties;
}) {
  return (
    <Link
      href={href}
      className="sb-nav relative flex items-center gap-3.5 h-14 px-3 rounded-lg cursor-pointer"
    >
      <div className="flex items-center justify-center w-8 h-8 shrink-0">
        <Icon
          size={19}
          strokeWidth={2}
          className={active ? "" : "sb-icon"}
          style={active ? { color: "#1DB67D" } : {}}
        />
      </div>
      <span
        className="font-ui text-[14px] whitespace-nowrap"
        style={{
          fontWeight: active ? 700 : 600,
          color: active ? "#D4F5E6" : undefined,
          ...labelStyle,
        }}
      >
        {label}
      </span>
    </Link>
  );
}

export function Sidebar({
  open,
  onExpand,
  mobileOpen = false,
  onMobileClose,
}: {
  open: boolean;
  onExpand: (v: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const labelsVisible = open || mobileOpen;

  const labelStyle: CSSProperties = {
    opacity: labelsVisible ? 1 : 0,
    transition: labelsVisible
      ? "opacity 180ms ease 80ms"
      : "opacity 100ms ease 0ms",
    pointerEvents: labelsVisible ? "auto" : "none",
  };

  return (
    <aside
      onMouseEnter={() => onExpand(true)}
      onMouseLeave={() => onExpand(false)}
      className={`
        bg-[linear-gradient(180deg,var(--color-surface-1)_0%,var(--color-surface-2)_100%)]
        fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden
        shadow-[2px_0_16px_0_rgba(0,0,0,0.4)] border-r border-border-base
        transition-[width,transform] duration-300 ease-in-out
        w-70 lg:w-[var(--sidebar-width)]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {onMobileClose && (
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden absolute top-4 right-4 z-10 w-9 h-9 rounded-md flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
        >
          <X size={18} className="text-text-muted" />
        </button>
      )}

      <div className="w-70 h-full flex flex-col px-2 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <div className="w-9 h-9 rounded-lg bg-[linear-gradient(135deg,#1DB67D_0%,#27C98C_100%)] flex items-center justify-center text-[#0a1220] font-bold text-[15px] shrink-0">
            Z
          </div>
          <div className="flex flex-col" style={labelStyle}>
            <span className="font-ui text-[18px] font-bold text-text-bright whitespace-nowrap">
              Zenith
            </span>
            <span className="font-ui text-[10px] font-semibold text-text-muted tracking-widest lowercase">
              perps · devnet
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href || pathname.startsWith(item.href)}
              labelStyle={labelStyle}
            />
          ))}
        </nav>

        {/* Active market section */}
        <div
          className="mt-6 border-t border-border-base pt-4"
          style={{
            opacity: labelsVisible ? 1 : 0,
            transition: "opacity 180ms ease",
          }}
        >
          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-text-faint px-3 mb-3">
            Active Market
          </p>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full shrink-0 bg-accent shadow-[0_0_8px_rgba(29,182,125,0.6)]" />
            <span className="font-num text-[13px] font-semibold text-text-dim whitespace-nowrap">
              {MARKET_SYMBOL}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="px-3" style={labelStyle}>
          <p className="font-num text-[10px] text-text-faint">Program</p>
          <p className="font-num text-[10px] text-text-faint truncate mt-0.5">
            {shortKey(PROGRAM_ID.toBase58())}
          </p>
        </div>
      </div>
    </aside>
  );
}
