/**
 * ParameterTable - API Parameters Display
 * 
 * Displays query parameters, body parameters, or headers in a structured table.
 * Mintlify-inspired design with type badges and required indicators.
 */

import * as React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export interface Parameter {
  /**
   * Parameter name
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
}

export interface ParameterTableProps {
  /**
   * Section title (e.g., "Query Parameters", "Body Parameters")
   */
  title: string;
  
  /**
   * Array of parameters to display
   */
  parameters: Parameter[];
  
  /**
   * Optional custom className
   */
  className?: string;
}

const typeColors: Record<string, string> = {
  string: 'bg-primary/10 text-primary border-primary/20',
  number: 'bg-success/10 text-success border-success/20',
  boolean: 'bg-warning/10 text-warning border-warning/20',
  object: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  array: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
};

export const ParameterTable = React.forwardRef<HTMLDivElement, ParameterTableProps>(
  ({ title, parameters, className }, ref) => {
    if (!parameters.length) return null;

    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        {/* Section Title */}
        <h2 className="text-base font-semibold text-foreground font-heading">
          {title}
        </h2>

        {/* Parameters Table */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead className="w-[15%]">Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parameters.map((param, index) => (
                <TableRow key={index}>
                  {/* Name + Required Badge */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm font-semibold text-foreground">
                        {param.name}
                      </code>
                      {param.required && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                        >
                          required
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "font-mono text-xs",
                        typeColors[param.type] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {param.type}
                    </Badge>
                  </TableCell>

                  {/* Description + Example */}
                  <TableCell>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {param.description}
                      </p>
                      
                      {param.defaultValue && (
                        <p className="text-xs text-muted-foreground">
                          Default: <code className="font-mono bg-muted px-1 py-0.5 rounded">{param.defaultValue}</code>
                        </p>
                      )}
                      
                      {param.example && (
                        <p className="text-xs text-muted-foreground">
                          Example: <code className="font-mono bg-muted px-1 py-0.5 rounded">{param.example}</code>
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
);

ParameterTable.displayName = "ParameterTable";
