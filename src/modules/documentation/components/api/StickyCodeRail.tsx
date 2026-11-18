/**
 * StickyCodeRail - Fixed Right Column with Code Examples
 * 
 * Lumx.io-style sticky right column with integrated header, dropdown selector,
 * and copy button. No external tabs or section titles.
 */

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Check, Copy } from "@/shared/components/animated-icons";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export interface CodeExample {
  /**
   * Language/tool name (curl, javascript, python, etc.)
   */
  language: string;
  
  /**
   * Label to display in dropdown (cURL, JavaScript, Python)
   */
  label: string;
  
  /**
   * Code content
   */
  code: string;
}

// Import shared ResponseExample type
import type { ResponseExample } from './ResponseVisualizer';

export interface StickyCodeRailProps {
  /**
   * Request examples (curl, code snippets)
   */
  requestExamples: CodeExample[];
  
  /**
   * Multiple response examples (200, 400, 401, etc.)
   */
  responseExamples: ResponseExample[];
  
  /**
   * Optional title for request block (e.g., endpoint name)
   */
  requestTitle?: string;
  
  /**
   * Optional title for response block
   */
  responseTitle?: string;
  
  /**
   * Optional custom className
   */
  className?: string;
}

export const StickyCodeRail = React.forwardRef<HTMLDivElement, StickyCodeRailProps>(
  ({ 
    requestExamples, 
    responseExamples, 
    requestTitle,
    responseTitle,
    className 
  }, ref) => {
    const [selectedLanguage, setSelectedLanguage] = React.useState("0");
    const [selectedResponse, setSelectedResponse] = React.useState("0");
    const [copiedRequest, setCopiedRequest] = React.useState(false);
    const [copiedResponse, setCopiedResponse] = React.useState(false);
    
    // Defensive checks: ensure arrays exist and have content
    if (!requestExamples || requestExamples.length === 0) {
      console.error('StickyCodeRail: requestExamples is required and must not be empty');
      return null;
    }
    
    if (!responseExamples || responseExamples.length === 0) {
      console.error('StickyCodeRail: responseExamples is required and must not be empty');
      return null;
    }
    
    const currentExample = requestExamples[parseInt(selectedLanguage)] || requestExamples[0];
    const currentResponse = responseExamples[parseInt(selectedResponse)] || responseExamples[0];

    const handleCopyRequest = async () => {
      await navigator.clipboard.writeText(currentExample.code);
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    };

    const handleCopyResponse = async () => {
      await navigator.clipboard.writeText(currentResponse.body);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    };
    
    // Status code color mapping
    const getStatusCodeColor = (statusCode: number) => {
      if (statusCode >= 200 && statusCode < 300) return 'text-success';
      if (statusCode >= 400 && statusCode < 500) return 'text-warning';
      if (statusCode >= 500) return 'text-destructive';
      return 'text-chart-3';
    };

    return (
      <div 
        ref={ref} 
        className={cn(
          // Responsive, bounded width to avoid overflow
          "hidden xl:block w-full max-w-[360px] lg:max-w-[380px] xl:max-w-[420px] min-w-0 shrink-0 self-start",
          className
        )}
      >
        {/* Sticky + scrollable column */}
        <div className="sticky top-20 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          <div className="space-y-4 p-4">
            {/* Request Block */}
            <div className="rounded-lg border border-border bg-card overflow-hidden w-full max-w-full shadow-md">
              {/* Header with Title + Dropdown + Copy */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {requestTitle && (
                    <span className="text-xs font-medium text-foreground truncate">
                      {requestTitle}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Language Selector */}
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-6 w-[90px] text-xs border-none bg-transparent hover:bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requestExamples.map((example, index) => (
                        <SelectItem key={index} value={index.toString()} className="text-xs">
                          {example.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Copy Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleCopyRequest}
                  >
                    {copiedRequest ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Code Content */}
              <div className="relative bg-black w-full max-w-full">
                <pre className="overflow-x-auto overflow-y-auto max-h-[400px] p-3 text-xs leading-tight bg-black w-full max-w-full">
                  <code className="font-mono text-muted-foreground">
                    {currentExample.code}
                  </code>
                </pre>
              </div>
            </div>

            {/* Response Block */}
            <div className="rounded-lg border border-border bg-card overflow-hidden w-full max-w-full shadow-md">
              {/* Header with Status Code Selector + Copy */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Status Code Badge */}
                  <span className={cn(
                    "text-xs font-mono font-semibold",
                    getStatusCodeColor(currentResponse.statusCode)
                  )}>
                    {currentResponse.statusCode}
                  </span>
                  
                  {responseTitle && (
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      {responseTitle}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Response Selector (if multiple responses) */}
                  {responseExamples.length > 1 && (
                    <Select value={selectedResponse} onValueChange={setSelectedResponse}>
                      <SelectTrigger className="h-6 w-[110px] text-xs border-none bg-transparent hover:bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {responseExamples.map((response, index) => (
                          <SelectItem key={index} value={index.toString()} className="text-xs">
                            {response.statusCode} - {response.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Copy Button */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleCopyResponse}
                  >
                    {copiedResponse ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Code Content */}
              <div className="relative bg-black w-full max-w-full">
                <pre className="overflow-x-auto overflow-y-auto max-h-[500px] p-3 text-xs leading-tight bg-black w-full max-w-full">
                  <code className="font-mono text-muted-foreground">
                    {currentResponse.body}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StickyCodeRail.displayName = "StickyCodeRail";
