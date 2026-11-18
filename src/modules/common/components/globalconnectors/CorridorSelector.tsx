/**
 * CorridorSelector Component
 * 
 * Allows users to select an international payment corridor
 */

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { GET_SUPPORTED_CORRIDORS } from '@/graphql/queries/globalconnectors';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowRight, AlertTriangle } from '@/shared/components/animated-icons';
import type { Corridor } from '@/shared/types/globalconnectors.types';
import { MOCK_CORRIDORS, USE_MOCK_CORRIDORS } from '@/modules/common/data/globalconnectors-mock';
import { cn } from '@/shared/lib/utils';

interface CorridorSelectorProps {
  onSelect: (corridor: Corridor) => void;
}

interface CorridorsResponse {
  globalconnectors_supportedCorridors: Corridor[];
}

const getFlag = (country: string): string => {
  const flags: Record<string, string> = {
    'Europe': '🇪🇺',
    'USA': '🇺🇸',
    'Mexico': '🇲🇽',
    'Brazil': '🇧🇷',
  };
  return flags[country] || '🌍';
};

// Helper to format payment rail names (remove timing references)
const formatRailName = (rail: string): string => {
  return rail
    .replace(/_next_day|_same_day/gi, '')
    .replace(/_/g, ' ')
    .toUpperCase()
    .trim();
};

export function CorridorSelector({ onSelect }: CorridorSelectorProps) {
  const [selected, setSelected] = useState<string>('');

  // Solo hacer query si no usamos mock
  const { data, isLoading, error } = useGraphQLQuery<CorridorsResponse, Record<string, never>>(
    ['globalconnectors', 'corridors'],
    GET_SUPPORTED_CORRIDORS as any,
    undefined,
    {
      enabled: !USE_MOCK_CORRIDORS,
    }
  );

  // Usar datos mock si está habilitado o si hay error del backend
  const useMockData = USE_MOCK_CORRIDORS || (error && !data);
  const corridors = useMockData ? MOCK_CORRIDORS : (data?.globalconnectors_supportedCorridors || []);

  if (isLoading && !USE_MOCK_CORRIDORS) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-7 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Mostrar warning si estamos usando mock data
  const showMockWarning = useMockData;

  if (corridors.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            <Trans>Sin corredores disponibles por ahora</Trans>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-foreground">
          Selecciona el corredor de pago
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Elige el origen y destino de tu transferencia internacional
        </p>
      </div>

      {/* Mock Data Warning */}
      {showMockWarning && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">
                    Modo de Desarrollo
                  </p>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    Mock Data
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  El backend aún no ha implementado el endpoint{' '}
                  <code className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                    globalconnectors_supportedCorridors
                  </code>
                  . Mostrando datos de prueba.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Para el equipo backend:</strong> Implementar el query en el schema GraphQL.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {corridors.map((corridor, index) => (
          <motion.div
            key={corridor.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-colors duration-150 border',
                selected === corridor.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border/60 hover:border-primary/50'
              )}
              onClick={() => {
                setSelected(corridor.id);
                onSelect(corridor);
              }}
            >
              <CardContent className="p-6 space-y-4">
                {/* Flags */}
                <div className="flex items-center justify-center gap-3 text-4xl">
                  <span>{getFlag(corridor.sourceCountry)}</span>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <span>{getFlag(corridor.destinationCountry)}</span>
                </div>

                {/* Description */}
                <div className="text-center space-y-1">
                  <h4 className="font-semibold text-base text-foreground">
                    {corridor.description}
                  </h4>
                  <p className="text-sm font-mono text-muted-foreground">
                    {corridor.sourceCurrency.toUpperCase()} → {corridor.destinationCurrency.toUpperCase()}
                  </p>
                </div>

                {/* Rails */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded-md font-medium">
                    {formatRailName(corridor.sourceRail)}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="px-2 py-1 bg-muted rounded-md font-medium">
                    {formatRailName(corridor.destinationRail)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

