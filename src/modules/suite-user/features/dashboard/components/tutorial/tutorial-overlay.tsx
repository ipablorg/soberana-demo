/**
 * TutorialOverlay
 *
 * Renders a spotlight effect over the target element using the box-shadow trick:
 * a fixed positioned element at the target rect emits a 9999px box-shadow
 * that fills the rest of the viewport with a semi-transparent dark overlay,
 * leaving only the target visually illuminated.
 *
 * A separate click-capture layer (z-index below the spotlight visual) blocks
 * all pointer events so the user cannot accidentally interact with the UI
 * while the tutorial is active. Navigation happens exclusively through the
 * TutorialTooltip buttons.
 *
 * Motion: position and size transitions use Framer Motion `animate` with
 * `duration: 0.2, ease: 'easeOut'` — no springs, no transition-all.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SPOTLIGHT_PADDING = 12;
const SPOTLIGHT_RADIUS = 14;

export interface SpotlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TutorialOverlayProps {
  /** Bounding rect of the spotlight target element, in viewport coordinates. */
  targetRect: SpotlightRect | null;
  /** Whether the overlay is visible. */
  visible: boolean;
  /** Called when the user clicks on the darkened area outside the spotlight. */
  onBackdropClick?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  targetRect,
  visible,
  onBackdropClick,
}) => {
  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Click-capture layer: blocks all interactions with the page. */}
          <motion.div
            key="tutorial-backdrop"
            aria-hidden
            className="fixed inset-0 z-[9997]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onBackdropClick}
            style={{ cursor: 'default' }}
          />

          {/* Spotlight visual: the box-shadow radiates outward from the target
              rect, painting the rest of the screen in rgba(0,0,0,0.75).
              pointer-events-none so the click-capture layer below still
              receives the click event. */}
          {targetRect && (
            <motion.div
              key="tutorial-spotlight"
              aria-hidden
              className="fixed z-[9998] pointer-events-none"
              initial={{
                opacity: 0,
                left: targetRect.left - SPOTLIGHT_PADDING,
                top: targetRect.top - SPOTLIGHT_PADDING,
                width: targetRect.width + SPOTLIGHT_PADDING * 2,
                height: targetRect.height + SPOTLIGHT_PADDING * 2,
              }}
              animate={{
                opacity: 1,
                left: targetRect.left - SPOTLIGHT_PADDING,
                top: targetRect.top - SPOTLIGHT_PADDING,
                width: targetRect.width + SPOTLIGHT_PADDING * 2,
                height: targetRect.height + SPOTLIGHT_PADDING * 2,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                borderRadius: SPOTLIGHT_RADIUS,
                // The 9999px spread creates the "full-screen dark overlay with
                // cutout" effect from a single element — no need for 4 rects.
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
