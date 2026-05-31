import Link from "next/link";
import { BASE_SYMBOL } from "@/lib/constants";

const FEATURES = [
  {
    title: "On-chain order book",
    body: "A crit-bit B-tree slab orderbook lives entirely on Solana. Every bid and ask is program state — no off-chain matching, no custodian.",
  },
  {
    title: "Request → crank → event pipeline",
    body: "Orders are enqueued, matched by a permissionless cranker, and settled from an event queue. The same architecture that powers Serum and Phoenix.",
  },
  {
    title: "Cross-margin + liquidations",
    body: "A risk engine tracks account health in real time, with an on-chain liquidation path and an insurance fund backing bad debt.",
  },
  {
    title: "Pyth price feeds",
    body: "Live SOL/USD index pricing from the Pyth oracle network drives the chart and mark price.",
  },
  {
    title: "Up to 20× leverage",
    body: "Open long or short with market and limit orders, real margin requirements, and funding-rate settlement.",
  },
  {
    title: "Fully verifiable",
    body: "An Anchor program with 15 instructions and an end-to-end integration suite. Every fill is a Solana transaction you can inspect.",
  },
];

const STATS = [
  { label: "On-chain instructions", value: "15" },
  { label: "Leverage", value: "20×" },
  { label: "Settlement", value: "100% on-chain" },
  { label: "Oracle", value: "Pyth" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(31,203,124,0.10), transparent 60%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="text-long text-lg leading-none">▲</span>
          <span className="text-bright font-bold text-base">Zenith</span>
          <span className="micro-label ml-1 hidden sm:inline">
            On-chain Perpetuals
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-long" />
            <span className="micro-label">Solana · Devnet</span>
          </div>
          <Link
            href="/trade"
            className="mono rounded-sm2 px-4 py-2 text-xs font-semibold transition-all hover:brightness-110"
            style={{ background: "#1fcb7c", color: "#03110a" }}
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-16 text-center sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border hairline px-3 py-1">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-long" />
          <span className="micro-label">Live on Solana</span>
        </div>

        <h1 className="text-bright mx-auto max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Perpetual futures,{" "}
          <span className="text-long">fully on-chain.</span>
        </h1>

        <p className="text-dim mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
          Trade {BASE_SYMBOL} perpetuals with up to 20× leverage on a real
          on-chain order book. No custodian, no off-chain matching — every order
          and fill settles as a Solana transaction.
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/trade"
            className="mono rounded-sm2 px-6 py-3 text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: "#1fcb7c", color: "#03110a" }}
          >
            Start Trading
          </Link>
          <Link
            href="/portfolio"
            className="mono rounded-sm2 border border-[rgba(255,255,255,0.12)] px-6 py-3 text-sm font-semibold text-bright transition-colors hover:bg-[#131a24]"
          >
            View Portfolio
          </Link>
        </div>

        {/* Stat strip */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border hairline bg-[rgba(255,255,255,0.06)] sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="surface-1 px-4 py-5">
              <div className="mono text-bright text-xl font-medium">
                {s.value}
              </div>
              <div className="micro-label mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <span className="micro-label">Architecture</span>
          <h2 className="text-bright mt-2 text-2xl font-bold sm:text-3xl">
            A real exchange, on-chain
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border hairline bg-[rgba(255,255,255,0.06)] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface-1 p-6">
              <h3 className="text-bright text-sm font-semibold">{f.title}</h3>
              <p className="text-dim mt-2 text-[13px] leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-bright text-2xl font-bold sm:text-3xl">
          Open your first position
        </h2>
        <p className="text-dim mt-3 text-sm">
          Connect a Solana wallet, deposit USDC, and trade {BASE_SYMBOL}-PERP in
          seconds.
        </p>
        <Link
          href="/trade"
          className="mono mt-8 inline-block rounded-sm2 px-7 py-3 text-sm font-semibold transition-all hover:brightness-110"
          style={{ background: "#1fcb7c", color: "#03110a" }}
        >
          Launch Zenith →
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t hairline px-6 py-8 text-center">
        <p className="micro-label">
          Zenith · On-chain perpetual futures · Built on Solana with Anchor +
          Pyth
        </p>
      </footer>
    </div>
  );
}
