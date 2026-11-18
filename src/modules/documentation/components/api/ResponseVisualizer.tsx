/**
 * ResponseVisualizer - API Response Display
 * 
 * Shows response schemas and examples with syntax highlighting.
 * Uses CodeBlock component for consistency.
 */

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Check, Copy } from "@/shared/components/animated-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export interface ResponseExample {
  /**
   * HTTP status code (200, 201, 400, 404, etc.)
   */
  statusCode: number;
  
  /**
   * Status label (Success, Created, Bad Request, etc.)
   */
  label: string;
  
  /**
   * Response body example (JSON string)
   */
  body: string;
  
  /**
   * Optional description
   */
  description?: string;
}

export interface ResponseVisualizerProps {
  /**
   * Section title
   */
  title?: string;
  
  /**
   * Array of response examples (different status codes)
   */
  responses: ResponseExample[];
  
  /**
   * Optional custom className
   */
  className?: string;
}

const statusConfig: Record<number, { color: string; bg: string }> = {
  200: { color: 'text-success', bg: 'bg-success/10 border-success/20' },
  201: { color: 'text-success', bg: 'bg-success/10 border-success/20' },
  400: { color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  401: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  403: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  404: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  500: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
};

export const ResponseVisualizer = React.forwardRef<HTMLDivElement, ResponseVisualizerProps>(
  ({ title = "Response", responses, className }, ref) => {
    const defaultResponse = responses[0];
    const [copiedSingle, setCopiedSingle] = React.useState(false);
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

    const renderResponseBlock = (
      response: ResponseExample,
      _config: { color: string; bg: string },
      copyHandler: () => Promise<void>,
      copied: boolean
    ) => (
      <div className="w-full max-w-full rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted">
          <span className="text-xs font-mono font-semibold text-chart-3">
            {response.statusCode} {response.label}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={copyHandler}
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3 text-foreground" />
            )}
          </Button>
        </div>
        <div className="relative bg-card">
          <pre className="overflow-x-auto overflow-y-auto max-h-[500px] p-3 text-xs leading-tight bg-card">
            <code className="font-mono text-muted-foreground">
              {response.body}
            </code>
          </pre>
        </div>
      </div>
    );

    if (responses.length === 1) {
      const config = statusConfig[defaultResponse.statusCode] || statusConfig[200];
      const handleCopy = async () => {
        await navigator.clipboard.writeText(defaultResponse.body);
        setCopiedSingle(true);
        setTimeout(() => setCopiedSingle(false), 2000);
      };
      
      return (
        <div ref={ref} className={cn("space-y-3", className)}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground font-heading">
              {title}
            </h2>
          </div>

          {defaultResponse.description && (
            <p className="text-sm text-muted-foreground">
              {defaultResponse.description}
            </p>
          )}

          {renderResponseBlock(defaultResponse, config, handleCopy, copiedSingle)}
        </div>
      );
    }

    // Multiple responses: use tabs
    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        <h2 className="text-base font-semibold text-foreground font-heading">
          {title}
        </h2>

        <Tabs defaultValue="0" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${responses.length}, 1fr)` }}>
            {responses.map((response, index) => (
              <TabsTrigger key={index} value={index.toString()} className="text-xs">
                {response.statusCode}
              </TabsTrigger>
            ))}
          </TabsList>

          {responses.map((response, index) => {
            const config = statusConfig[response.statusCode] || statusConfig[200];
            const handleCopy = async () => {
              await navigator.clipboard.writeText(response.body);
              setCopiedIndex(index);
              setTimeout(() => setCopiedIndex(null), 2000);
            };

            return (
              <TabsContent key={index} value={index.toString()} className="space-y-3">
                {response.description && (
                  <p className="text-sm text-muted-foreground">
                    {response.description}
                  </p>
                )}

                {renderResponseBlock(response, config, handleCopy, copiedIndex === index)}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
  }
);

ResponseVisualizer.displayName = "ResponseVisualizer";
