import { useState } from "react";
import { useLingui } from '@lingui/react/macro';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Wand2,
  MessageSquare,
  Loader2,
  X,
  Repeat,
  TrendingDown,
  Circle
} from "@/shared/components/animated-icons";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { useAgenticChat } from "@/shared/stores/useAgenticChat";
import { OnRampForm } from "@/shared/components/forms/OnRampForm";
import { OffRampForm } from "@/shared/components/forms/OffRampForm";
import { PaymentForm } from "@/shared/components/forms/PaymentForm";
import { PayoutForm } from "@/shared/components/forms/PayoutForm";
import { ConversionForm } from "@/shared/components/forms/ConversionForm";

type FormType = 'on-ramp' | 'off-ramp' | 'payment' | 'payout' | 'conversion' | null;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  operations?: any[];
  formType?: FormType;
}

export default function IntelligentMode() {
  const { t } = useLingui();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t`Hola. Soy tu asistente inteligente. Puedo ayudarte a ejecutar operaciones, construir flujos automatizados y gestionar tu plataforma financiera con lenguaje natural. ¿En qué puedo ayudarte?`,
      timestamp: new Date(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const { operations } = useAgenticChat();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        formType: response.formType,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateResponse = (userInput: string): { content: string; formType?: FormType } => {
    const lower = userInput.toLowerCase();
    
    if (lower.includes('on-ramp') || lower.includes('comprar') && (lower.includes('usdt') || lower.includes('cripto'))) {
      setActiveForm('on-ramp');
      return { 
        content: t`Perfecto, voy a preparar tu compra de criptomonedas. Completa los detalles:`,
        formType: 'on-ramp'
      };
    } else if (lower.includes('off-ramp') || lower.includes('vender') && (lower.includes('usdt') || lower.includes('cripto'))) {
      setActiveForm('off-ramp');
      return { 
        content: t`Entendido, voy a procesar la venta de tus criptomonedas. Aquí está la tasa actual:`,
        formType: 'off-ramp'
      };
    } else if (lower.includes('pago') || lower.includes('transferir') || lower.includes('enviar dinero')) {
      setActiveForm('payment');
      return { 
        content: t`Perfecto, voy a procesar ese pago. Ingresa los detalles:`,
        formType: 'payment'
      };
    } else if (lower.includes('payout') || lower.includes('nómina') || lower.includes('nomina') || lower.includes('pagos masivos')) {
      setActiveForm('payout');
      return { 
        content: t`Voy a preparar los payouts. ¿Es un pago individual o masivo?`,
        formType: 'payout'
      };
    } else if (lower.includes('convert') || lower.includes('cambio') || lower.includes('fx') || lower.includes('cambiar')) {
      setActiveForm('conversion');
      return { 
        content: t`Entendido, voy a preparar esa conversión. Verificando las tasas actuales:`,
        formType: 'conversion'
      };
    } else if (lower.includes('automatizar') || lower.includes('flujo') || lower.includes('workflow')) {
      return { 
        content: t`Excelente idea. Voy a construir ese flujo automatizado paso a paso. ¿Lo ejecuto o prefieres revisarlo primero?`
      };
    } else if (lower.includes('cuenta') || lower.includes('balance') || lower.includes('saldo')) {
      return { 
        content: t`Aquí está el resumen de tus cuentas. ¿Necesitas información sobre alguna cuenta específica?`
      };
    } else {
      return { 
        content: t`Entiendo. ¿Podrías darme más detalles? Por ejemplo, montos, monedas, o el tipo de operación que necesitas.`
      };
    }
  };

  const handleFormSubmit = (data: any) => {
    toast.success(t`Operación ${data.type} iniciada`);
    
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: t`Operación confirmada. Un momento, ejecutando ${data.type} por ${data.amount} ${data.fromCurrency || data.currency}...`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    setActiveForm(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const commonUseCases = [
    {
      category: t`Pagos y transferencias`,
      icon: Send,
      examples: [
        t`Pagar $1,000 USD a proveedor en Colombia`,
        t`Transferir 500 EUR a cuenta internacional`,
        t`Enviar pago masivo a 20 empleados`
      ]
    },
    {
      category: t`Conversiones`,
      icon: Repeat,
      examples: [
        t`Convertir 1,000 EUR a BRL`,
        t`Cambiar 500 USD a COP al mejor precio`,
        t`Automatizar cobertura de riesgo cambiario`
      ]
    },
    {
      category: t`Cripto`,
      icon: TrendingDown,
      examples: [
        t`Comprar 1,000 USDT con COP`,
        t`Vender 500 USDT a cuenta bancaria`,
        t`Consultar tasas actuales de cripto`
      ]
    }
  ];

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full bg-background overflow-hidden">
      {/* Main Chat Area - With padding for fixed input */}
      <div className="absolute inset-0 right-80 flex flex-col">
        {/* Messages Area - Scrollable with bottom padding for input */}
        <div className="flex-1 overflow-y-auto p-6 pb-[180px] space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <Card className={`p-4 rounded-xl ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card border-border'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </Card>

                  {/* Show form if this message has one */}
                  {message.role === 'assistant' && message.formType && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      {message.formType === 'on-ramp' && <OnRampForm onSubmit={handleFormSubmit} />}
                      {message.formType === 'off-ramp' && <OffRampForm onSubmit={handleFormSubmit} />}
                      {message.formType === 'payment' && <PaymentForm onSubmit={handleFormSubmit} />}
                      {message.formType === 'payout' && <PayoutForm onSubmit={handleFormSubmit} />}
                      {message.formType === 'conversion' && <ConversionForm onSubmit={handleFormSubmit} />}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="p-4 rounded-xl bg-card border-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{t`Un momento...`}</p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto space-y-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t`Escribe lo que necesitas: 'Pagar $1000 USD a proveedor', 'Convertir EUR a USD', 'Automatizar cobertura BRL'...`}
              className="min-h-[70px] rounded-xl resize-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isProcessing}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t`Cmd+Enter para enviar`}
              </p>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
                className="rounded-lg bg-primary hover:opacity-90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t`Un momento`}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t`Enviar`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Fixed Position, Scrollable Independently */}
      <div className="absolute top-0 right-0 bottom-0 w-80 border-l border-border bg-sidebar-background overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* Active Operations */}
          <div>
            <h3 className="text-sm tracking-tight mb-2 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{t`Operaciones.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Lo que está en curso.`}</span>
            </h3>
            {operations.length === 0 ? (
              <Card className="p-4 rounded-xl border-dashed bg-card">
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <Circle className="h-8 w-8 text-muted-foreground/50" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-foreground">{t`Sin actividad.`}</p>
                    <p className="text-[11px] text-muted-foreground">{t`Las operaciones inteligentes aparecerán aquí.`}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {operations.map((op) => (
                  <Card key={op.id} className="p-2 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Sparkles className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate leading-tight">{op.title}</p>
                        <Badge variant="outline" className="text-[9px] mt-0.5 h-3 px-1">
                          {t`${op.steps.length} pasos`}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Common Use Cases */}
          <div>
            <h3 className="text-sm tracking-tight mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{t`Ideas.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Casos de uso frecuentes.`}</span>
            </h3>
            <div className="space-y-3">
              {commonUseCases.map((useCase, idx) => {
                const Icon = useCase.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Icon className="w-3 h-3" />
                      {useCase.category}
                    </div>
                    <div className="space-y-1">
                      {useCase.examples.map((example, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-1.5 px-2 rounded-lg hover:bg-accent hover:border-primary/50 transition-colors duration-150"
                          onClick={() => setInput(example)}
                        >
                          <MessageSquare className="w-3 h-3 mr-1.5 shrink-0 text-primary" />
                          <span className="text-[11px] leading-tight line-clamp-2">{example}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <h3 className="text-sm tracking-tight mb-2"><span className="font-semibold text-foreground">{t`Estadísticas.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Tu actividad inteligente.`}</span></h3>
            <div className="space-y-1.5">
              <Card className="p-2 rounded-xl bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t`Conversaciones hoy`}</span>
                  <span className="text-sm font-bold">12</span>
                </div>
              </Card>
              <Card className="p-2 rounded-xl bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t`Op. ejecutadas`}</span>
                  <span className="text-sm font-bold text-success">8</span>
                </div>
              </Card>
              <Card className="p-2 rounded-xl bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t`Tiempo ahorrado`}</span>
                  <span className="text-sm font-bold text-primary">2.5h</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
