import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowRight, Upload, Users } from "@/shared/components/animated-icons";

interface PayoutFormProps {
  onSubmit: (data: any) => void;
}

export function PayoutForm({ onSubmit }: PayoutFormProps) {
  const [payoutType, setPayoutType] = useState("single");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [recipient, setRecipient] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [concept, setConcept] = useState("Nómina");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "payout",
      payoutType,
      amount: parseFloat(amount),
      currency,
      recipient,
      recipientAccount,
      concept
    });
  };

  return (
    <Card className="p-6 rounded-xl space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Payouts / Nómina</h3>
        <p className="text-xs text-muted-foreground">Realiza pagos masivos o individuales</p>
      </div>

      <div className="flex gap-2">
        <Badge 
          variant={payoutType === "single" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setPayoutType("single")}
        >
          Pago individual
        </Badge>
        <Badge 
          variant={payoutType === "bulk" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setPayoutType("bulk")}
        >
          Pago masivo
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {payoutType === "single" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Empleado/Destinatario</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="Nombre completo"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-account">Cuenta bancaria</Label>
              <Input
                id="recipient-account"
                type="text"
                placeholder="Número de cuenta"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                type="text"
                placeholder="Ej: Nómina Enero 2025"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-border rounded-xl text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Subir archivo CSV</p>
              <p className="text-xs text-muted-foreground mb-3">
                Incluye: nombre, cuenta, monto, moneda
              </p>
              <Button type="button" variant="outline" size="sm">
                Seleccionar archivo
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium">Vista previa</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Sube un archivo para ver el resumen de pagos
              </p>
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={payoutType === "single" && (!amount || parseFloat(amount) <= 0 || !recipient || !recipientAccount)}
        >
          {payoutType === "single" ? "Procesar pago" : "Procesar pagos masivos"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </Card>
  );
}
