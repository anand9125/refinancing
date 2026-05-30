export function Stat({
  label,
  value,
  sub,
  accent,
  demo,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "long" | "short" | "bright";
  demo?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1 border-l hairline px-6 first:border-l-0">
      <div className="micro-label flex items-center gap-1">
        {label}
        {demo && (
          <span
            className="inline-block h-1 w-1 rounded-full bg-[#56657a]"
            title="Demo data (not on-chain)"
          />
        )}
      </div>
      <div
        className={`mono whitespace-nowrap text-sm ${
          accent === "long"
            ? "text-long"
            : accent === "short"
              ? "text-short"
              : "text-bright"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mono text-[10px] text-muted">{sub}</div>}
    </div>
  );
}
