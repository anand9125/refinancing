"use client";
import type { ReactNode } from "react";

export function ActionButton({
  children,
  onClick,
  disabled,
  type = "button",
  leadingIcon,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  leadingIcon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-ui font-bold text-[14px] transition-all
        ${!disabled
          ? "cursor-pointer bg-[linear-gradient(135deg,#1DB67D_0%,#27C98C_100%)] text-surface-1 border border-accent/30 hover:shadow-[0_6px_16px_rgba(29,182,125,0.20)]"
          : "cursor-not-allowed bg-accent/10 text-text-muted border border-accent/10 opacity-60"
        } ${className}`}
    >
      {leadingIcon}
      {children}
    </button>
  );
}
