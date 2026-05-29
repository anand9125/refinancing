import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative z-10 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <Skeleton className="h-[420px] w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    </div>
  );
}
