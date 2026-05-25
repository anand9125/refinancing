"use client";

import { Toast as ToastData } from "@/hooks/useToast";

const ICONS: Record<ToastData["type"], string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const STYLES: Record<ToastData["type"], string> = {
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  error: "bg-red-500/10 border-red-500/30 text-red-300",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
};

const ICON_STYLES: Record<ToastData["type"], string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-blue-400",
};

interface Props {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-slide-up ${STYLES[t.type]}`}
        >
          <span className={`text-sm font-bold mt-0.5 flex-shrink-0 ${ICON_STYLES[t.type]}`}>
            {ICONS[t.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-snug">{t.message}</p>
            {t.txSig && (
              <a
                href={`https://explorer.solana.com/tx/${t.txSig}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white/70 transition mt-0.5 inline-block"
              >
                {t.txSig.slice(0, 12)}…{t.txSig.slice(-6)} ↗
              </a>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-white/30 hover:text-white/60 transition text-lg leading-none flex-shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
