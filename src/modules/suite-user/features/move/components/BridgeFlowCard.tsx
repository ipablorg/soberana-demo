/**
 * Bridge Flow Card Component
 * 
 * Tarjeta visual para un flujo transnacional de Bridge
 */

import { motion } from 'framer-motion';
import { ArrowRight, Clock, DollarSign, Globe2 } from '@/shared/components/animated-icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { BridgeTransnationalFlow } from '../types/bridge-flows.types';
import { REGION_CONFIG, ACTION_CONFIG, RAIL_ICONS } from '../data/bridge-flows.data';
import { cn } from '@/shared/lib/utils';

interface BridgeFlowCardProps {
  flow: BridgeTransnationalFlow;
  onExecute: (flowId: string) => void;
  className?: string;
}

export function BridgeFlowCard({ flow, onExecute, className }: BridgeFlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="overflow-hidden border border-border transition-colors">
        <CardHeader className="bg-muted/30">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg">{flow.description}</CardTitle>
              <CardDescription className="text-xs">
                {flow.flow_direction}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-background/50">
              {flow.legs.length} pasos
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Timeline de pasos */}
          <div className="space-y-3">
            {flow.legs.map((leg, index) => {
              const regionConfig = REGION_CONFIG[leg.region];
              const actionConfig = ACTION_CONFIG[leg.action];
              const isLast = index === flow.legs.length - 1;

              return (
                <div key={leg.step} className="relative">
                  {/* Línea conectora */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-6 bg-border" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Step indicator */}
                    <div className={cn(
                      'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold',
                      regionConfig.bgColor,
                      regionConfig.color
                    )}>
                      {regionConfig.flag}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {leg.region}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {leg.currency}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          via {RAIL_ICONS[leg.rail]} {leg.rail.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {leg.notes}
                      </p>

                      {leg.estimatedTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{leg.estimatedTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Action badge */}
                    <div className={cn(
                      'shrink-0 px-2 py-1 rounded-md text-xs font-medium',
                      actionConfig.bgColor,
                      actionConfig.color
                    )}>
                      {actionConfig.icon} {actionConfig.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Globe2 className="h-3.5 w-3.5" />
                <span>{flow.legs.length} países</span>
              </div>
              {flow.totalFees !== undefined && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="font-mono tabular-nums">~${flow.totalFees.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={() => onExecute(flow.id)}
              variant="gradient"
              size="sm"
              className="gap-2"
            >
              Ejecutar flujo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

