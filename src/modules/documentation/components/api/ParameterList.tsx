/**
 * ParameterList - Mintlify-Style Parameter Display
 * 
 * Displays API parameters in a row-based format (not table) with support for:
 * - Nested object properties (collapsible)
 * - Required badges
 * - Type indicators
 * - Examples and default values
 * 
 * Replicates Lumx.io/Mintlify parameter documentation style 1:1
 */

import * as React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { ChevronRight } from "@/shared/components/animated-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";

export interface ParameterProperty {
  /**
   * Property name
   */
  name: string;
  
  /**
   * Data type (string, number, boolean, object, array, etc.)
   */
  type: string;
  
  /**
   * Whether the parameter is required
   */
  required?: boolean;
  
  /**
   * Parameter description
   */
  description: string;
  
  /**
   * Default value (optional)
   */
  defaultValue?: string;
  
  /**
   * Example value (optional)
   */
  example?: string;
  
  /**
   * Enum values (if type is enum)
   */
  enum?: string[];
  
  /**
   * Nested properties (if type is object or has children)
   */
  properties?: ParameterProperty[];
}

export interface ParameterListProps {
  /**
   * Section title (e.g., "Query Parameters", "Body Parameters", "Headers")
   */
  title: string;
  
  /**
   * Array of parameters to display
   */
  parameters: ParameterProperty[];
  
  /**
   * Optional custom className
   */
  className?: string;
}

/**
 * Type badge color mapping (Lumx style)
 */
const typeStyles: Record<string, string> = {
  string: 'bg-primary/10 text-primary border-primary/20',
  'string<uuid>': 'bg-primary/10 text-primary border-primary/20',
  'string<date>': 'bg-primary/10 text-primary border-primary/20',
  'string<date-time>': 'bg-primary/10 text-primary border-primary/20',
  number: 'bg-success/10 text-success border-success/20',
  integer: 'bg-success/10 text-success border-success/20',
  boolean: 'bg-warning/10 text-warning border-warning/20',
  object: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  'object[]': 'bg-muted text-muted-foreground border-muted',
  array: 'bg-muted text-muted-foreground border-muted',
  'enum<string>': 'bg-muted text-muted-foreground border-muted',
};

/**
 * Single Parameter Row Component
 */
interface ParameterRowProps {
  parameter: ParameterProperty;
  isNested?: boolean;
}

function ParameterRow({ parameter, isNested = false }: ParameterRowProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = parameter.properties && parameter.properties.length > 0;

  return (
    <div 
      className={cn(
        "border-b border-border last:border-b-0",
        isNested && "ml-4 border-l-2 border-muted pl-4"
      )}
    >
      <div className={cn(
        "py-4 px-4 hover:bg-muted/30 transition-colors",
        isNested && "py-3"
      )}>
        <div className="space-y-2">
          {/* Header: Name + Required + Type */}
          <div className="flex items-start gap-2 flex-wrap">
            {/* Collapsible trigger for nested objects */}
            {hasChildren ? (
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 min-w-0">
                <CollapsibleTrigger className="flex items-center gap-2 group">
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                      isOpen && "rotate-90"
                    )} 
                  />
                  <code className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {parameter.name}
                  </code>
                </CollapsibleTrigger>
              </Collapsible>
            ) : (
              <code className="font-mono text-sm font-semibold text-foreground">
                {parameter.name}
              </code>
            )}

            {/* Type Badge */}
            <Badge 
              variant="outline"
              className={cn(
                "font-mono text-xs shrink-0",
                typeStyles[parameter.type] || 'bg-muted/50 text-muted-foreground border-muted'
              )}
            >
              {parameter.type}
            </Badge>

            {/* Required Badge */}
            {parameter.required && (
              <Badge 
                variant="outline" 
                className="text-xs bg-destructive/10 text-destructive border-destructive/20 shrink-0"
              >
                required
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {parameter.description}
          </p>

          {/* Enum Values */}
          {parameter.enum && parameter.enum.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Available options:</span>
              {parameter.enum.map((value, index) => (
                <code 
                  key={index} 
                  className="font-mono text-xs bg-muted px-2 py-0.5 rounded border border-border"
                >
                  {value}
                </code>
              ))}
            </div>
          )}

          {/* Default Value */}
          {parameter.defaultValue && (
            <p className="text-xs text-muted-foreground">
              Default: <code className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border">{parameter.defaultValue}</code>
            </p>
          )}

          {/* Example Value */}
          {parameter.example && (
            <p className="text-xs text-muted-foreground">
              Example: <code className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-foreground">{parameter.example}</code>
            </p>
          )}
        </div>
      </div>

      {/* Nested Properties (Collapsible) */}
      {hasChildren && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="border-t border-border bg-muted/20">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2 bg-muted/30">
                Show child attributes
              </div>
              {parameter.properties!.map((childParam, index) => (
                <ParameterRow 
                  key={index} 
                  parameter={childParam} 
                  isNested={true}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

/**
 * ParameterList Component
 */
export const ParameterList = React.forwardRef<HTMLDivElement, ParameterListProps>(
  ({ title, parameters, className }, ref) => {
    if (!parameters.length) return null;

    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        {/* Section Title */}
        <h2 className="text-base font-semibold text-foreground font-heading">
          {title}
        </h2>

        {/* Parameters List */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          {parameters.map((param, index) => (
            <ParameterRow key={index} parameter={param} />
          ))}
        </div>
      </div>
    );
  }
);

ParameterList.displayName = "ParameterList";
