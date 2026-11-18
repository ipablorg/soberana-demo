import { Skeleton } from '@/shared/components/ui/skeleton';

export function WalletDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-8 w-1/2 rounded-lg" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
