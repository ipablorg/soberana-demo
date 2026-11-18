import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { ArrowDown, ArrowRight, Wallet } from "@/shared/components/animated-icons";

interface OffRampFormProps {
  onSubmit: (data: any) => void;
}

export function OffRampForm({ onSubmit }: OffRampFormProps) {
  const [amount, setAmount] = useState("");
  const [fromCurrency] = useState("USDT");
  const [toCurrency] = useState("COP");
  const [bankAccount, setBankAccount] = useState("");
  
  const sellRate = 4150; // Mock sell rate USDT to COP (lower than buy rate)
  const estimatedReceive = amount ? (parseFloat(amount) * sellRate).toFixed(2) : "0.00";
  const walletBalance = "1,234.56"; // Mock wallet balance

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "off-ramp",
      amount: parseFloat(amount),
      fromCurrency,
      toCurrency,
      bankAccount,
      estimatedReceive: parseFloat(estimatedReceive)
    });
  };

  return (
    <Card className="p-6 rounded-xl space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Off-Ramp: USDT → COP</h3>
        <p className="text-xs text-muted-foreground">Vende criptomonedas y recibe pesos colombianos</p>
      </div>

      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-primary" />
          <p className="text-xs font-medium">Balance disponible</p>
        </div>
        <p className="text-lg font-bold font-mono tabular-nums">{walletBalance} USDT</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto a vender</Label>
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
            Tasa Loopay: 1 USDT = <span className="font-mono tabular-nums">{sellRate.toLocaleString()}</span> COP
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank-account">Cuenta bancaria</Label>
          <Input
            id="bank-account"
            type="text"
            placeholder="Número de cuenta"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) <= 0 || !bankAccount}>
          Continuar con venta
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </Card>
  );
}
