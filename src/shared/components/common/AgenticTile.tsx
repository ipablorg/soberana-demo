import { ArrowRightLeft, TrendingUp, CheckCircle2, Clock, type IconComponent } from "@/shared/components/animated-icons";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMobile } from "@/shared/hooks/use-mobile";

const TILE_CLASS =
  "relative overflow-hidden rounded-xl border border-border bg-background/25 backdrop-blur-2xl transition-colors duration-150";

// Simple tile component for preset cards
interface AgenticTileProps {
  icon: IconComponent;
  title: string;
  subtitle: string;
  badges?: { label: string; variant?: "default" | "secondary" | "outline" }[];
  onClick?: () => void;
}

export const AgenticTile = ({ icon: Icon, title, subtitle, badges, onClick }: AgenticTileProps) => {
  const isMobile = useMobile();
  
  return (
    <Card className={`${TILE_CLASS} ${isMobile ? "p-4" : "p-6"}`} onClick={onClick}>
      <div className={isMobile ? "flex items-start gap-3" : "flex items-start gap-4"}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <Badge key={i} variant={badge.variant || "secondary"} className="text-xs">
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Calculator and flow tiles
interface RateCalculatorProps {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  fee?: number;
  connector?: string;
}

export const RateCalculatorTile = ({ 
  fromCurrency, 
  toCurrency, 
  rate, 
  fee = 0.5,
  connector = "Bridge + Brex" 
}: RateCalculatorProps) => {
  const [amount, setAmount] = useState<string>("");
  const numAmount = parseFloat(amount) || 0;
  const total = numAmount * rate;
  const feeAmount = total * (fee / 100);
  const finalAmount = total - feeAmount;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Calculadora de Cambio</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {connector}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Envías</label>
          <div className="relative">
            <Input 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16 text-lg font-semibold"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {fromCurrency}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Recibes</label>
          <div className="relative">
            <Input 
              value={finalAmount > 0 ? finalAmount.toFixed(2) : "0.00"}
              readOnly
              className="pr-16 text-lg font-semibold font-mono tabular-nums bg-muted/30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {toCurrency}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tasa de cambio</span>
          <span className="font-medium font-mono tabular-nums">1 {fromCurrency} = {rate.toFixed(2)} {toCurrency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Comisión ({fee}%)</span>
          <span className="font-medium font-mono tabular-nums text-destructive">-{feeAmount.toFixed(2)} {toCurrency}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/50">
          <span>Total final</span>
          <span className="font-mono tabular-nums text-primary">{finalAmount.toFixed(2)} {toCurrency}</span>
        </div>
      </div>

      {numAmount > 0 && (
        <Button variant="gradient" className="w-full" size="lg">
          Ejecutar operación
        </Button>
      )}
    </Card>
  );
};

interface TransferFlowProps {
  steps: {
    title: string;
    status: 'pending' | 'active' | 'completed';
    connector?: string;
    time?: string;
  }[];
}

export const TransferFlowTile = ({ steps }: TransferFlowProps) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Flujo de Transferencia</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 relative"
          >
            {index < steps.length - 1 && (
              <div className="absolute left-[11px] top-8 w-[2px] h-8 bg-border" />
            )}
            <div className="mt-1">
              {step.status === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
              {step.status === 'active' && (
                <div className="w-5 h-5 rounded-full border-2 border-primary animate-pulse" />
              )}
              {step.status === 'pending' && (
                <Clock className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className={`font-medium ${step.status === 'pending' ? 'text-muted-foreground' : ''}`}>
                  {step.title}
                </p>
                {step.time && (
                  <span className="text-xs text-muted-foreground">{step.time}</span>
                )}
              </div>
              {step.connector && (
                <Badge variant="outline" className="text-xs">
                  {step.connector}
                </Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

interface MarketRateProps {
  pair: string;
  rate: number;
  change24h: number;
  lastUpdate: string;
}

export const MarketRateTile = ({ pair, rate, change24h, lastUpdate }: MarketRateProps) => {
  const isPositive = change24h >= 0;
  
  return (
    <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{pair}</p>
          <p className="text-2xl font-bold font-mono tabular-nums">{rate.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            <TrendingUp className={`w-4 h-4 ${!isPositive ? 'rotate-180' : ''}`} />
            <span className="font-semibold font-mono tabular-nums">{Math.abs(change24h).toFixed(2)}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{lastUpdate}</p>
        </div>
      </div>
    </Card>
  );
};
