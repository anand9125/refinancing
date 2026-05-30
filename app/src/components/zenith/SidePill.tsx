export function SidePill({ side }: { side: "long" | "short" }) {
  const isLong = side === "long";
  return (
    <span
      className={`mono inline-flex items-center gap-1 rounded-sm2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        isLong ? "text-long" : "text-short"
      }`}
      style={{
        background: isLong
          ? "rgba(31,203,124,0.12)"
          : "rgba(240,97,109,0.12)",
      }}
    >
      <span
        className="h-1 w-1 rounded-full"
        style={{ background: isLong ? "#1fcb7c" : "#f0616d" }}
      />
      {side}
    </span>
  );
}
