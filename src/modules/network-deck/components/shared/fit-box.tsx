import { useEffect, useRef, useState, type ReactNode } from "react";

/* ============================================================
   FitBox — sizes a diagram to the largest box of a given aspect
   ratio that fits the slide's usable content area. Percent heights
   do not resolve inside flex parents, so it measures:
   - availW: the padded column's content width
   - availH: the column's height minus chrome padding minus the
     height (incl. vertical margins) of every block rendered above
     the diagram (heading, subtitle, chips)
   then w = min(availW, availH × ratio, maxW) and the wrapper gets
   width=w, height=w/ratio. Re-runs on ResizeObserver of the slide
   root, window resize and document.fonts.ready. The inner <svg> is
   absolutely positioned to fill the box (no second coordinate
   system). Because the wrapper is natural-height (not flex-1), the
   shell's justify-center centres the WHOLE heading+diagram block
   in the usable area (Fix 1b vertical centring).
   ============================================================ */

interface FitBoxProps {
  /** Aspect ratio (width / height) of the diagram, e.g. 1200/640. */
  ratio: number;
  /** Hard cap on rendered width. */
  maxWidth?: number;
  children: ReactNode;
}

export function FitBox({ ratio, maxWidth = 1024, children }: FitBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const slideRoot = box.closest("[data-slide-root]");
    const measure = () => {
      // The padded column is the DiagramFrame's parent chain root:
      // [data-slide-root] > div (padded, flex-col, justify-center).
      const frame = box.parentElement;
      const column = frame?.parentElement;
      if (!frame || !column || !slideRoot) return;
      const cs = getComputedStyle(column);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const padT = parseFloat(cs.paddingTop) || 0;
      const padB = parseFloat(cs.paddingBottom) || 0;
      const availW = column.clientWidth - padL - padR;
      // Vertical space: column box minus chrome padding minus every block
      // above the diagram frame (heading etc.), including their margins.
      let usedH = 0;
      for (const sib of Array.from(column.children)) {
        if (sib === frame) break;
        const sb = getComputedStyle(sib);
        if (sb.position === "absolute") continue;
        usedH += sib.getBoundingClientRect().height + (parseFloat(sb.marginTop) || 0) + (parseFloat(sb.marginBottom) || 0);
      }
      const fb = getComputedStyle(frame);
      const frameMargins = (parseFloat(fb.marginTop) || 0) + (parseFloat(fb.marginBottom) || 0);
      const availH = column.clientHeight - padT - padB - usedH - frameMargins;
      if (availW <= 0 || availH <= 0) return;
      const w = Math.min(availW, availH * ratio, maxWidth);
      setSize({ w, h: w / ratio });
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (slideRoot) ro.observe(slideRoot);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ratio, maxWidth]);

  return (
    <div
      ref={boxRef}
      data-fitbox
      className="relative mx-auto"
      style={
        size
          ? { width: size.w, height: size.h, flex: "0 0 auto", minHeight: 0 }
          : { width: 0, height: 0, flex: "0 0 auto", minHeight: 0 }
      }
    >
      {size && children}
    </div>
  );
}
