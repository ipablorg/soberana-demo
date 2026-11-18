import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { DollarSign, ArrowRight } from "@/shared/components/animated-icons";

interface ParameterFormProps {
  onSubmit: (params: { amount: number; fromCurrency: string; toCurrency: string; priority?: string }) => void;
}

export const ParameterForm = ({ onSubmit }: ParameterFormProps) => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USDT");
  const [toCurrency, setToCurrency] = useState("COP");
  const [priority, setPriority] = useState("optimal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onSubmit({
        amount: numAmount,
        fromCurrency,
        toCurrency,
        priority
      });
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Completa los parámetros de la operación</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* From Currency */}
          <div className="space-y-2">
            <Label htmlFor="from">Moneda origen</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger id="from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label htmlFor="to">Moneda destino</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger id="to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="MXN">MXN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="optimal">⚡ Óptima (equilibrio costo-tiempo)</SelectItem>
              <SelectItem value="fast">🚀 Rápida (mínimo tiempo)</SelectItem>
              <SelectItem value="cheap">💰 Económica (mínimo costo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" size="lg">
          <ArrowRight className="w-4 h-4 mr-2" />
          Generar rutas
        </Button>
      </form>
    </Card>
  );
};
