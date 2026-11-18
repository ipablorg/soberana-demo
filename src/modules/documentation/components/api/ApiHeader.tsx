/**
 * ApiHeader - HTTP Method + Endpoint Display
 * 
 * Mintlify-style header for API endpoints with colored method badges
 * and endpoint path display.
 */

import * as React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiHeaderProps {
  /**
   * HTTP method (GET, POST, PUT, PATCH, DELETE)
   */
  method: HttpMethod;
  
  /**
   * API endpoint path
   */
  endpoint: string;
  
  /**
   * Optional title for the endpoint
   */
  title?: string;
  
  /**
   * Optional description
   */
  description?: string;
}

const methodConfig: Record<HttpMethod, { color: string; bg: string }> = {
  GET: { 
    color: 'text-success', 
    bg: 'bg-success/10 border-success/20' 
  },
  POST: { 
    color: 'text-primary', 
    bg: 'bg-primary/10 border-primary/20' 
  },
  PUT: { 
    color: 'text-warning', 
    bg: 'bg-warning/10 border-warning/20' 
  },
  PATCH: { 
    color: 'text-warning', 
    bg: 'bg-warning/10 border-warning/20' 
  },
  DELETE: { 
    color: 'text-destructive', 
    bg: 'bg-destructive/10 border-destructive/20' 
  },
};

export const ApiHeader = React.forwardRef<HTMLDivElement, ApiHeaderProps>(
  ({ method, endpoint, title, description }, ref) => {
    const config = methodConfig[method];

    return (
      <div ref={ref} className="space-y-3">
        {/* Title */}
        {title && (
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading">
            {title}
          </h1>
        )}

        {/* Description */}
        {description && (
          <p className="text-base text-muted-foreground">
            {description}
          </p>
        )}

        {/* Method + Endpoint */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border">
          <Badge 
            className={cn(
              "font-mono font-bold px-2 py-0.5 text-xs",
              config.bg,
              config.color
            )}
          >
            {method}
          </Badge>
          
          <code className="font-mono text-xs md:text-sm text-foreground font-semibold break-all">
            {endpoint}
          </code>
        </div>
      </div>
    );
  }
);

ApiHeader.displayName = "ApiHeader";
