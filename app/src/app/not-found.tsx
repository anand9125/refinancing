import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-0 px-6 text-center">
      <p className="font-num text-[56px] font-bold text-accent leading-none">
        404
      </p>
      <p className="font-ui text-[16px] font-semibold text-text-bright">
        This page drifted off the order book.
      </p>
      <p className="font-ui text-[13px] text-text-muted max-w-sm">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/trade"
        className="mt-2 inline-flex items-center h-10 px-5 rounded-md font-ui text-[14px] font-bold bg-[linear-gradient(135deg,#1DB67D_0%,#27C98C_100%)] text-surface-1 hover:shadow-[0_6px_16px_rgba(29,182,125,0.25)] transition-all"
      >
        Back to trading
      </Link>
    </div>
  );
}
