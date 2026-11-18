/**
 * DocSection - Semantic Section Component for Documentation
 * 
 * Provides a structured container for documentation sections with automatic
 * ID generation for table of contents navigation.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export interface DocSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  /**
   * Section title (used for TOC and anchor)
   */
  title: string;

  /**
   * Optional subtitle or description
   */
  subtitle?: string;

  /**
   * Custom ID for anchor links (auto-generated from title if not provided)
   */
  sectionId?: string;

  /**
   * Nesting level (1-6, like h1-h6)
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Apply Loopay gradient treatment to the title text with whileInView reveal.
   * Use for the most emotionally impactful headline per section — max one per section.
   */
  gradientTitle?: boolean;
}

const levelStyles = {
  1: "text-4xl font-bold tracking-tight mb-4",
  2: "text-3xl font-bold tracking-tight mb-3",
  3: "text-2xl font-semibold tracking-tight mb-3",
  4: "text-xl font-semibold mb-2",
  5: "text-lg font-semibold mb-2",
  6: "text-base font-semibold mb-2",
};

const containerSpacing = {
  1: "mb-16",
  2: "mb-12",
  3: "mb-10",
  4: "mb-8",
  5: "mb-6",
  6: "mb-6",
};

export const DocSection = React.forwardRef<HTMLElement, DocSectionProps>(
  ({
    title,
    subtitle,
    sectionId,
    level = 2,
    gradientTitle,
    className,
    children,
    ...props
  }, ref) => {
    // Auto-generate ID from title if not provided
    const id = sectionId || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
      <motion.section
        ref={ref}
        id={id}
        className={cn(containerSpacing[level], "scroll-mt-20", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        {...props}
      >
        {/* Section Header */}
        <header className="mb-6">
          <HeadingTag className={cn(levelStyles[level], "text-foreground")}>
            {gradientTitle ? (
              <motion.span
                className="text-gradient-loopay"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {title}
              </motion.span>
            ) : title}
          </HeadingTag>
          {subtitle && (
            <p className="text-lg text-muted-foreground mt-2">
              {subtitle}
            </p>
          )}
        </header>

        {/* Section Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {children}
        </div>
      </motion.section>
    );
  }
);

DocSection.displayName = "DocSection";

