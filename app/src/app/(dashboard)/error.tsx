"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative z-10 py-20 flex flex-col items-center text-center gap-4">
      <p className="font-ui text-[16px] font-semibold text-text-bright">
        Something went wrong loading on-chain data.
      </p>
      <p className="font-ui text-[13px] text-text-muted max-w-md break-words">
        {error.message || "Unable to reach the cluster. Check your connection."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center h-10 px-5 rounded-md font-ui text-[14px] font-bold bg-white/[0.05] border border-border-base text-text-base hover:border-border-lit transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
