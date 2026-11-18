import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { TrendingUp } from "@/shared/components/animated-icons";
import { ArrowDownUp } from "lucide-react";

interface ConversionFormProps {
  onSubmit: (data: any) => void;
}

export function ConversionForm({ onSubmit }: ConversionFormProps) {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  
  const rates: Record<string, Record<string, number>> = {
    EUR: { USD: 1.09, COP: 4500, BRL: 5.8 },
    USD: { EUR: 0.92, COP: 4100, BRL: 5.3 },
    COP: { USD: 0.00024, EUR: 0.00022, BRL: 0.0013 },
    BRL: { USD: 0.19, EUR: 0.17, COP: 775 }
  };

  const rate = rates[fromCurrency]?.[toCurrency] || 1;
  const estimatedReceive = amount ? (parseFloat(amount) * rate).toFixed(2) : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "conversion",
      amount: parseFloat(amount),
      fromCurrency,
      toCurrency,
      rate,
      estimatedReceive: parseFloat(estimatedReceive)
    });
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <Card className="p-6 rounded-xl space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Conversión FX</h3>
        <p className="text-xs text-muted-foreground">Cambia entre monedas fiat al mejor tipo de cambio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="from-amount">Envías</Label>
          <div className="flex gap-2">
            <Input
              id="from-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="MXN">MXN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={swapCurrencies}
          >
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="to-amount">Recibes</Label>
          <div className="flex gap-2">
            <Input
              id="to-amount"
              type="text"
              value={estimatedReceive}
              readOnly
              className="flex-1 bg-muted/50 font-mono tabular-nums"
            />
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="MXN">MXN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-xs font-medium">Tipo de cambio</p>
            </div>
            <p className="text-sm font-bold font-mono tabular-nums">
              1 {fromCurrency} = {rate} {toCurrency}
            </p>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Realizar conversión
        </Button>
      </form>
    </Card>
  );
}
