import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Check } from "@/shared/components/animated-icons";

type StepState = "complete" | "current" | "upcoming";

export interface StepperItem {
  title: string;
  helper?: string;
  state?: StepState;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepperItem[];
  activeIndex?: number;
}

function resolveState(index: number, activeIndex: number): StepState {
  if (index < activeIndex) return "complete";
  if (index === activeIndex) return "current";
  return "upcoming";
}

const circleStyles: Record<StepState, string> = {
  complete: "bg-success/10 text-success border border-success/30",
  current: "border-2 border-primary text-foreground font-semibold bg-card",
  upcoming: "border border-border text-muted-foreground bg-muted",
};

const titleStyles: Record<StepState, string> = {
  complete: "text-foreground",
  current: "text-foreground",
  upcoming: "text-muted-foreground",
};

const helperStyles: Record<StepState, string> = {
  complete: "text-muted-foreground",
  current: "text-muted-foreground",
  upcoming: "text-muted-foreground/60",
};

export const Stepper: React.FC<StepperProps> = ({ steps, activeIndex = 0, className, ...props }) => {
  return (
    <div
      className={cn(
        "relative flex items-start gap-2 overflow-x-auto overflow-y-hidden rounded-xl border border-border bg-card p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3 sm:p-4",
        className,
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const derivedState = step.state ?? resolveState(index, activeIndex);
        const isLast = index === steps.length - 1;
        return (
          <div key={`${step.title}-${index}`} className="relative min-w-[5.5rem] flex-1 text-center sm:min-w-0">
            <div
              className={cn(
                "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-xs transition-colors duration-150",
                circleStyles[derivedState],
              )}
            >
              {derivedState === "complete" ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <div className="mt-1.5 text-[11px] uppercase tracking-[0.24em] sm:mt-2">
              <span className={cn("font-semibold", titleStyles[derivedState])}>{step.title}</span>
            </div>
            {step.helper ? (
              <p className={cn("mt-1 hidden text-[11px] sm:block", helperStyles[derivedState])}>{step.helper}</p>
            ) : null}
            {!isLast ? (
              <span
                className={cn(
                  "pointer-events-none absolute left-[calc(50%+20px)] top-5 hidden h-[2px] w-[calc(100%-40px)] md:block",
                  index < activeIndex ? "bg-success" : "bg-border",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
