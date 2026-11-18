/**
 * CodeBlock - Syntax-Highlighted Code Display Component
 * 
 * A beautiful, accessible code block with copy functionality and
 * proper semantic styling.
 */

import * as React from "react";
import { Check, Copy } from "@/shared/components/animated-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Code content to display
   */
  code: string;
  
  /**
   * Programming language for syntax highlighting
   */
  language?: string;
  
  /**
   * Optional filename to display
   */
  filename?: string;
  
  /**
   * If true, shows line numbers
   */
  showLineNumbers?: boolean;

  /**
   * If false, hides the top-right copy button
   */
  showCopyButton?: boolean;
}

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ 
    code, 
    language = "typescript", 
    filename, 
    showLineNumbers = false,
    showCopyButton = true,
    className,
    ...props 
  }, ref) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.split('\n');

    return (
      <div
        ref={ref}
        className={cn(
          "group relative w-full max-w-full rounded-lg bg-card border border-border overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Header */}
        {filename && (
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted">
            <span className="text-xs font-mono text-muted-foreground truncate">{filename}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{language}</span>
          </div>
        )}

        {/* Code Content */}
        <div className="relative bg-black">
          <pre className="overflow-x-auto overflow-y-auto max-h-[500px] p-3 text-xs leading-tight bg-black w-full">
            <code className={cn("font-mono text-muted-foreground whitespace-pre", `language-${language}`)}>
              {showLineNumbers ? (
                <table className="w-full border-collapse">
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={index}>
                        <td className="pr-3 text-right text-muted-foreground select-none">
                          {index + 1}
                        </td>
                        <td className="text-muted-foreground">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                code
              )}
            </code>
          </pre>

          {/* Copy Button - Always Visible */}
          {showCopyButton && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-7 w-7 opacity-80 hover:opacity-100 transition-opacity bg-muted/80 hover:bg-muted"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }
);

CodeBlock.displayName = "CodeBlock";

/**
 * InlineCode - Small inline code snippets
 */
export const InlineCode = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => {
  return (
    <code
      ref={ref}
      className={cn(
        "relative rounded-md bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm font-medium text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
});

InlineCode.displayName = "InlineCode";

