import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

interface SlideContainerProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export function SlideContainer({ children, className, dark }: SlideContainerProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center overflow-y-auto px-8 pt-14 pb-20 md:px-16 lg:px-24",
        dark ? "bg-foreground text-background" : "bg-background text-foreground",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
