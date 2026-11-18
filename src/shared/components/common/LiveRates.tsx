import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Repeat } from '@/shared/components/animated-icons';
import { useEffect, useState } from 'react';
import { Trans } from '@lingui/react/macro';

interface Rate {
  pair: string;
  rate: number;
  change: number;
  type: 'fx' | 'ramp';
}

const initialRates: Rate[] = [
  { pair: 'USD/COP', rate: 4250.50, change: 0.5, type: 'fx' },
  { pair: 'USD/BRL', rate: 5.15, change: -0.3, type: 'fx' },
  { pair: 'EUR/USD', rate: 1.08, change: 0.2, type: 'fx' },
  { pair: 'USD/USDT', rate: 1.00, change: 0.0, type: 'ramp' },
  { pair: 'USD/USDC', rate: 1.00, change: 0.0, type: 'ramp' },
  { pair: 'BRL/USDT', rate: 0.19, change: 0.1, type: 'ramp' },
];

export function LiveRates() {
  const [rates, setRates] = useState(initialRates);

  // Simulate live rate updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prev => prev.map(rate => ({
        ...rate,
        rate: rate.rate * (1 + (Math.random() - 0.5) * 0.001),
        change: rate.change + (Math.random() - 0.5) * 0.2,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="rounded-xl border-sidebar-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold"><Trans>Live Rates</Trans></CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          <div className="space-y-2">
            {rates.map((rate, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  ${rate.type === 'fx' ? 'bg-chart-3/10' : 'bg-chart-1/10'}
                `}>
                  <Repeat className={`w-4 h-4 ${rate.type === 'fx' ? 'text-chart-3' : 'text-chart-1'}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-medium">{rate.pair}</p>
                    <Badge 
                      variant="outline"
                      className="text-[9px] h-4 px-1.5"
                    >
                      {rate.type === 'fx' ? 'FX' : 'Ramp'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold font-mono tabular-nums">
                      {rate.rate.toFixed(rate.type === 'fx' && rate.pair.includes('COP') ? 2 : 4)}
                    </p>
                    <div className={`flex items-center gap-1 text-[10px] font-medium ${
                      rate.change > 0 ? 'text-success' : rate.change < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {rate.change > 0 && <TrendingUp className="w-3 h-3" />}
                      {rate.change < 0 && <TrendingDown className="w-3 h-3" />}
                      <span className="font-mono tabular-nums">{Math.abs(rate.change).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
