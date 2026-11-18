import { useEffect, useRef, type ReactNode } from "react";

/* ============================================================
   Deck chrome — Fix 1 / Fix 1b.
   Measures the real height of the brand bar (top) and the bottom
   nav at runtime and publishes them as CSS variables on the deck
   root: --deck-chrome-top / --deck-chrome-bottom. Slides consume
   them via padding so no content ever mounts under the bars.
   Recomputed with ResizeObserver on both bars (fullscreen/mobile).
   ============================================================ */

export function useDeckChrome(
  rootRef: React.RefObject<HTMLDivElement | null>,
  topBarRef: React.RefObject<HTMLElement | null>,
  bottomBarRef: React.RefObject<HTMLElement | null>,
) {
  const rafRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    const top = topBarRef.current;
    const bottom = bottomBarRef.current;
    if (!root) return;

    const apply = () => {
      const topH = top ? top.getBoundingClientRect().height : 0;
      const bottomH = bottom ? bottom.getBoundingClientRect().height : 0;
      root.style.setProperty("--deck-chrome-top", `${Math.ceil(topH)}px`);
      root.style.setProperty("--deck-chrome-bottom", `${Math.ceil(bottomH)}px`);
    };

    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("resize", schedule);

    const ro = new ResizeObserver(schedule);
    if (top) ro.observe(top);
    if (bottom) ro.observe(bottom);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [rootRef, topBarRef, bottomBarRef]);
}

/** Content wrapper that centers the header+figure block in the usable area
 *  between both chrome bars (Fix 1b). No per-slide exceptions. */
export function DeckChrome({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-full w-full flex-col items-center justify-center overflow-y-auto"
      style={{
        paddingTop: "calc(var(--deck-chrome-top, 64px) + 32px)",
        paddingBottom: "calc(var(--deck-chrome-bottom, 56px) + 24px)",
      }}
    >
      {children}
    </div>
  );
}
