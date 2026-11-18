import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { ArrowDown, ArrowRight } from "@/shared/components/animated-icons";

interface OnRampFormProps {
  onSubmit: (data: any) => void;
}

export function OnRampForm({ onSubmit }: OnRampFormProps) {
  const [amount, setAmount] = useState("");
  const [fromCurrency] = useState("COP");
  const [toCurrency] = useState("USDT");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  
  const rate = 4200; // Mock rate COP to USDT
  const estimatedReceive = amount ? (parseFloat(amount) / rate).toFixed(2) : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "on-ramp",
      amount: parseFloat(amount),
      fromCurrency,
      toCurrency,
      paymentMethod,
      estimatedReceive: parseFloat(estimatedReceive)
    });
  };

  return (
    <Card className="p-6 rounded-xl space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">On-Ramp: COP → USDT</h3>
        <p className="text-xs text-muted-foreground">Compra criptomonedas con pesos colombianos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto a enviar</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {fromCurrency}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowDown className="w-4 h-4 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Recibirás (estimado)</Label>
          <div className="relative">
            <Input
              type="text"
              value={estimatedReceive}
              readOnly
              className="pr-16 bg-muted/50 font-mono tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {toCurrency}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tasa: 1 USDT = <span className="font-mono tabular-nums">{rate.toLocaleString()}</span> COP
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-method">Método de pago</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger id="payment-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
              <SelectItem value="pse">PSE</SelectItem>
              <SelectItem value="efecty">Efecty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
          Continuar con compra
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </Card>
  );
}
