"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { Home, Zap, X } from "lucide-react";
import { useConnectedWallet } from "./wallet/useConnectedWallet";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: Home, requiresWallet: false },
  { label: "Optimize",  href: "/optimize",  icon: Zap,  requiresWallet: true  },
] as const;

const PROTOCOLS = [
  { name: "Kamino",   color: "#6EE7B7", href: "https://app.kamino.finance/" },
  { name: "MarginFi", color: "#93C5FD", href: "https://app.marginfi.com/"   },
  { name: "Solend",   color: "#FCA5A5", href: "https://solend.fi/"          },
] as const;

function NavItem({ icon: Icon, label, href, active, disabled, labelStyle }: {
  icon: React.ElementType; label: string; href: string;
  active: boolean; disabled: boolean; labelStyle: CSSProperties;
}) {
  const base = "sb-nav relative flex items-center gap-3.5 h-14 px-3 rounded-lg";
  if (disabled) return (
    <div title="Connect wallet first" className={`${base} cursor-not-allowed opacity-40`}>
      <div className="flex items-center justify-center w-8 h-8 shrink-0">
        <Icon size={19} strokeWidth={2} className="sb-icon" />
      </div>
      <span className="font-ui text-[14px] font-semibold whitespace-nowrap sb-label" style={labelStyle}>{label}</span>
    </div>
  );

  return (
    <Link href={href} className={`${base} cursor-pointer`}>
      <div className="flex items-center justify-center w-8 h-8 shrink-0">
        <Icon size={19} strokeWidth={2} className={active ? "" : "sb-icon"} style={active ? { color: "#1DB67D" } : {}} />
      </div>
      <span className="font-ui text-[14px] whitespace-nowrap" style={{ fontWeight: active ? 700 : 600, color: active ? "#D4F5E6" : undefined, ...(active ? {} : { }),  ...labelStyle }}>
        {label}
      </span>
    </Link>
  );
}

export function Sidebar({ open, onExpand, mobileOpen = false, onMobileClose }: {
  open: boolean; onExpand: (v: boolean) => void; mobileOpen?: boolean; onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const { isConnected } = useConnectedWallet();
  const labelsVisible = open || mobileOpen;

  const labelStyle: CSSProperties = {
    opacity: labelsVisible ? 1 : 0,
    transition: labelsVisible ? "opacity 180ms ease 80ms" : "opacity 100ms ease 0ms",
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
        <button type="button" onClick={onMobileClose} className="lg:hidden absolute top-4 right-4 z-10 w-9 h-9 rounded-md flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
          <X size={18} className="text-text-muted" />
        </button>
      )}

      <div className="w-70 h-full flex flex-col px-2 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <div className="w-9 h-9 rounded-lg bg-[linear-gradient(135deg,#1DB67D_0%,#27C98C_100%)] flex items-center justify-center text-[#0a1220] font-bold text-[15px] shrink-0">
            S
          </div>
          <div className="flex flex-col" style={labelStyle}>
            <span className="font-ui text-[18px] font-bold text-text-bright whitespace-nowrap">SolLend</span>
            <span className="font-ui text-[10px] font-semibold text-text-muted tracking-widest uppercase">devnet</span>
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
              disabled={item.requiresWallet && !isConnected}
              labelStyle={labelStyle}
            />
          ))}
        </nav>

        {/* Protocols section */}
        <div className="mt-6 border-t border-border-base pt-4" style={{ opacity: labelsVisible ? 1 : 0, transition: "opacity 180ms ease" }}>
          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-text-faint px-3 mb-3">Protocols</p>
          {PROTOCOLS.map((p) => (
            <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/4 transition-colors cursor-pointer">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="font-ui text-[13px] font-medium text-text-muted hover:text-text-dim transition-colors whitespace-nowrap">{p.name}</span>
            </a>
          ))}
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="px-3" style={labelStyle}>
          <p className="font-num text-[10px] text-text-faint">Program ID</p>
          <p className="font-num text-[9px] text-text-faint truncate mt-0.5">fmq3…6HZ8</p>
        </div>
      </div>
    </aside>
  );
}
