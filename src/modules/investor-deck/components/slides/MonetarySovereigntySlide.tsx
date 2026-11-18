import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function MonetarySovereigntySlide() {
  const { content } = useDeckContent();
  const d = content.monetarySovereignty;

  const MAX_ABS = 211;

  function parseValue(loss: string): number {
    const match = loss.match(/[\d.]+/);
    if (!match) return 0;
    const abs = parseFloat(match[0]);
    return loss.startsWith("+") ? abs : -abs;
  }

  return (
    <SlideContainer>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mb-3 block font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
        className="mb-2 whitespace-pre-line font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15, ease: "easeOut" }}
        className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left — comparison bars */}
        <div className="flex flex-col gap-3">
          {d.comparison.map((item, i) => {
            const val = parseValue(item.loss);
            const isSoberana = item.color === "success";
            const barWidth = Math.max(4, (Math.abs(val) / MAX_ABS) * 100);

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.2 + i * 0.12, ease: "easeOut" }}
                className={cn(
                  "rounded-lg border p-3",
                  isSoberana ? "border-success/20 bg-success/5" : "border-border bg-card",
                )}
              >
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span
                    className={cn(
                      "font-mono text-xl font-bold tabular-nums text-right",
                      item.color === "destructive" && "text-destructive",
                      item.color === "warning" && "text-warning",
                      item.color === "success" && "text-success",
                    )}
                  >
                    {item.loss}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.12, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      item.color === "destructive" && "bg-destructive",
                      item.color === "warning" && "bg-warning",
                      item.color === "success" && "bg-success",
                    )}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right — mechanism steps */}
        <div className="flex flex-col gap-4">
          {d.mechanism.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.5 + i * 0.12, ease: "easeOut" }}
              className="flex gap-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground">
                <span className="font-mono text-xs font-bold text-background">
                  {step.step}
                </span>
              </div>
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 1.1, ease: "easeOut" }}
        className="mt-8 border-t border-border pt-6 text-center"
      >
        <p className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {d.punchline}
        </p>
      </motion.div>
    </SlideContainer>
  );
}
