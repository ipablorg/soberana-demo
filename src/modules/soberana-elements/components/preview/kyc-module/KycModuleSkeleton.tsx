import { Skeleton } from '@/shared/components/ui/skeleton';

export function KycModuleSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-3/4 rounded-lg" />
      </div>
    </div>
  );
}
