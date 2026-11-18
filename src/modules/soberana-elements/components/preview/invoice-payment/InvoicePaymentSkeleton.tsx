import { Skeleton } from '@/shared/components/ui/skeleton';

export function InvoicePaymentSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
