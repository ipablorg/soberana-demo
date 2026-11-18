import { Skeleton } from '@/shared/components/ui/skeleton';

export function PaymentButtonSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
