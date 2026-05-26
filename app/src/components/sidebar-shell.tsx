"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { SIDEBAR_COLLAPSED, SIDEBAR_EXPANDED } from "@/lib/theme";

export function SidebarShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const desktopWidth = open ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#020814", ["--sidebar-width" as string]: `${desktopWidth}px` } as React.CSSProperties}
    >
      {/* Subtle radial backdrop */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 70% 55% at 55% 38%, rgba(4,23,42,0.35) 0%, transparent 100%)" }}
      />

      {/* Mobile hamburger */}
      <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu"
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-md flex items-center justify-center bg-surface-1 border border-border-base shadow-lg cursor-pointer">
        <Menu size={18} className="text-text-base" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div aria-hidden onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      )}

      <Sidebar open={open} onExpand={setOpen} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="relative min-h-screen transition-[margin-left] duration-300 ease-in-out lg:ml-[var(--sidebar-width)]">
        <div className="px-4 sm:px-6 lg:px-10 py-6 pt-14 lg:pt-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
