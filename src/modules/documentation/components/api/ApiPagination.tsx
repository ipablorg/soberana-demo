/**
 * ApiPagination - Previous/Next Navigation
 * 
 * Mintlify-style pagination component for API documentation pages.
 * Shows previous and next pages with titles and descriptions.
 */

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "@/shared/components/animated-icons";
import { cn } from "@/shared/lib/utils";
import { getAdjacentRoutes } from '@/modules/documentation/content/sidebar-content';

export interface ApiPaginationProps {
  /**
   * Optional custom className
   */
  className?: string;
}

export const ApiPagination = React.forwardRef<HTMLDivElement, ApiPaginationProps>(
  ({ className }, ref) => {
    const location = useLocation();
    const { previous, next } = getAdjacentRoutes(location.pathname);

    // Don't render if there's no previous or next page
    if (!previous && !next) return null;

    return (
      <div 
        ref={ref} 
        className={cn(
          "grid gap-4 mt-12 pt-8 border-t border-border",
          previous && next ? "grid-cols-2" : "grid-cols-1",
          className
        )}
      >
        {/* Previous Page */}
        {previous && (
          <Link
            to={previous.href}
            className={cn(
              "group flex flex-col gap-2 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors duration-150",
              "hover:shadow-md hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </div>
            <div className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
              {previous.title}
            </div>
          </Link>
        )}

        {/* Next Page */}
        {next && (
          <Link
            to={next.href}
            className={cn(
              "group flex flex-col gap-2 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors duration-150",
              "hover:shadow-md hover:border-primary/30",
              !previous && "col-start-2" // Align to right if no previous
            )}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider justify-end">
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </div>
            <div className="text-base font-semibold text-foreground group-hover:text-primary transition-colors text-right">
              {next.title}
            </div>
          </Link>
        )}
      </div>
    );
  }
);

ApiPagination.displayName = "ApiPagination";
