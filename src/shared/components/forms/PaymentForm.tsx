import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send } from "@/shared/components/animated-icons";

interface PaymentFormProps {
  onSubmit: (data: any) => void;
}

export function PaymentForm({ onSubmit }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [recipient, setRecipient] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [concept, setConcept] = useState("");
  const [priority, setPriority] = useState("standard");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: "payment",
      amount: parseFloat(amount),
      currency,
      recipient,
      recipientAccount,
      concept,
      priority
    });
  };

  return (
    <Card className="p-6 rounded-xl space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Realizar Pago</h3>
        <p className="text-xs text-muted-foreground">Envía dinero a proveedores o contrapartes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="MXN">MXN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Destinatario</Label>
          <Input
            id="recipient"
            type="text"
            placeholder="Nombre del proveedor o contraparte"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient-account">Cuenta/Email destinatario</Label>
          <Input
            id="recipient-account"
            type="text"
            placeholder="Cuenta bancaria o email"
            value={recipientAccount}
            onChange={(e) => setRecipientAccount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="concept">Concepto</Label>
          <Textarea
            id="concept"
            placeholder="Descripción del pago"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="min-h-[60px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instantáneo (más caro)</SelectItem>
              <SelectItem value="standard">Estándar (1-2 días)</SelectItem>
              <SelectItem value="economy">Económico (3-5 días)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={!amount || parseFloat(amount) <= 0 || !recipient || !recipientAccount}
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar pago
        </Button>
      </form>
    </Card>
  );
}
