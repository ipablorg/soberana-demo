import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { IconComponent } from "@/shared/components/animated-icons";
import { 
  ArrowLeftRight, 
  Wallet, 
  Zap, 
  Sparkles, 
  Play, 
  Wand2,
  DollarSign,
  Repeat,
  Building2,
  Send,
  CheckCircle2
} from "@/shared/components/animated-icons";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { fadeInUp } from "@/shared/lib/motion";
import { PageHeader } from "@/shared/components/common/PageHeader";
import { useLingui } from "@lingui/react/macro";

interface FlowStep {
  id: string;
  label: string;
  sublabel: string;
  icon: IconComponent;
  description: string;
  color: string;
}

interface PromptSuggestion {
  id: string;
  category: string;
  icon: IconComponent;
  text: string;
  description: string;
  complexity: 'simple' | 'complex';
  steps: Omit<FlowStep, 'id'>[];
}

export default function BuildWithAI() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const [prompt, setPrompt] = useState("");
  const [builtSteps, setBuiltSteps] = useState<FlowStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedComplexity, setSelectedComplexity] = useState<'simple' | 'complex' | null>(null);

  const promptSuggestions: PromptSuggestion[] = [
    {
      id: 'pay-vendor',
      category: 'Move',
      icon: DollarSign,
      text: t`Pagar proveedor ABC $500 USD vía ACH`,
      description: t`Ejecución de pago único`,
      complexity: 'simple',
      steps: [
        {
          label: 'LOOPAY',
          sublabel: 'Move',
          icon: ArrowLeftRight,
          description: t`Ejecutar pago USD vía ACH a proveedor`,
          color: 'text-primary',
        },
      ],
    },
    {
      id: 'convert-eur',
      category: 'Change',
      icon: Repeat,
      text: t`Convertir 1000 EUR a USD`,
      description: t`Conversión FX`,
      complexity: 'simple',
      steps: [
        {
          label: 'LOOPAY',
          sublabel: 'Change',
          icon: Zap,
          description: t`Convertir 1000 EUR a USD a tasa de mercado`,
          color: 'text-accent',
        },
      ],
    },
    {
      id: 'onramp-brl',
      category: 'Change',
      icon: Repeat,
      text: t`On-ramp $500 BRL a USDC`,
      description: t`Conversión fiat a crypto`,
      complexity: 'simple',
      steps: [
        {
          label: 'LOOPAY',
          sublabel: 'Change',
          icon: Zap,
          description: t`Convertir 500 BRL a USDC vía bridge`,
          color: 'text-accent',
        },
      ],
    },
    {
      id: 'brl-hedge-workflow',
      category: 'Workflow',
      icon: Building2,
      text: t`Automatizar cobertura BRL: Recibir Pix → Convertir a USDC → Prefondear wallet`,
      description: t`Automatización multi-paso`,
      complexity: 'complex',
      steps: [
        {
          label: 'LOOPAY',
          sublabel: 'Move',
          icon: ArrowLeftRight,
          description: t`Recibir pago BRL vía Pix`,
          color: 'text-primary',
        },
        {
          label: 'LOOPAY',
          sublabel: 'Change',
          icon: Zap,
          description: t`Auto-convertir BRL a USDC a tasa óptima`,
          color: 'text-accent',
        },
        {
          label: 'LOOPAY',
          sublabel: 'Account',
          icon: Wallet,
          description: t`Prefondear wallet en red Base`,
          color: 'text-primary',
        },
      ],
    },
    {
      id: 'cop-payroll',
      category: 'Workflow',
      icon: Building2,
      text: t`Automatización de nómina: Tesorería USD → Convertir a COP → Pagos en lote`,
      description: t`Flujo de nómina`,
      complexity: 'complex',
      steps: [
        {
          label: 'LOOPAY',
          sublabel: 'Account',
          icon: Wallet,
          description: t`Extraer de cuenta de tesorería USD`,
          color: 'text-primary',
        },
        {
          label: 'LOOPAY',
          sublabel: 'Change',
          icon: Zap,
          description: t`Convertir USD a COP a tasa mayorista`,
          color: 'text-accent',
        },
        {
          label: 'LOOPAY',
          sublabel: 'Move',
          icon: ArrowLeftRight,
          description: t`Ejecutar pagos en lote vía BRE-B`,
          color: 'text-primary',
        },
      ],
    },
    {
      id: 'multi-currency',
      category: 'Account',
      icon: Wallet,
      text: t`Crear cuenta multi-moneda con EUR, USD, BRL`,
      description: t`Configuración de cuenta`,
      complexity: 'simple',
      steps: [
        {
          label: 'LOOPAY',
          sublabel: 'Account',
          icon: Wallet,
          description: t`Crear cuenta multi-moneda con vIBANs`,
          color: 'text-primary',
        },
      ],
    },
  ];

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    setPrompt(suggestion.text);
    setSelectedComplexity(suggestion.complexity);
    simulateBuildFlow(suggestion.steps);
  };

  const handleBuildFlow = () => {
    if (!prompt.trim()) {
      toast.error(t`Ingresa una descripción de lo que necesitas`);
      return;
    }

    const lowerPrompt = prompt.toLowerCase();
    let steps: Omit<FlowStep, 'id'>[] = [];

    if (lowerPrompt.includes('pay') || lowerPrompt.includes('pago')) {
      steps.push({
        label: 'LOOPAY',
        sublabel: 'Move',
        icon: ArrowLeftRight,
        description: prompt,
        color: 'text-primary',
      });
    } else if (lowerPrompt.includes('convert') || lowerPrompt.includes('change')) {
      steps.push({
        label: 'LOOPAY',
        sublabel: 'Change',
        icon: Zap,
        description: prompt,
        color: 'text-accent',
      });
    } else if (lowerPrompt.includes('account') || lowerPrompt.includes('wallet')) {
      steps.push({
        label: 'LOOPAY',
        sublabel: 'Account',
        icon: Wallet,
        description: prompt,
        color: 'text-primary',
      });
    } else {
      steps = [
        {
          label: 'LOOPAY',
          sublabel: 'Custom',
          icon: Sparkles,
          description: prompt,
          color: 'text-primary',
        },
      ];
    }

    simulateBuildFlow(steps);
  };

  const simulateBuildFlow = (steps: Omit<FlowStep, 'id'>[]) => {
    setIsProcessing(true);
    setBuiltSteps([]);

    steps.forEach((step, index) => {
      setTimeout(() => {
        setBuiltSteps((prev) => [
          ...prev,
          {
            ...step,
            id: `step-${Date.now()}-${index}`,
          },
        ]);
        if (index === steps.length - 1) {
          setIsProcessing(false);
        }
      }, (index + 1) * 600);
    });
  };

  const handleExecuteTask = () => {
    if (builtSteps.length === 0) {
      toast.error(t`Agrega al menos un paso para ejecutar`);
      return;
    }

    toast.success(t`Ejecución de tarea iniciada`, {
      description: t`El flujo de vista previa y confirmación se activaría aquí`,
    });
  };

  const handleRefineInBuilder = () => {
    if (builtSteps.length === 0) {
      toast.error(t`Construye un flujo primero`);
      return;
    }

    toast.success(t`Abriendo constructor visual...`, {
      description: t`Los pasos serán pre-poblados como nodos`,
    });

    setTimeout(() => {
      navigate("/automations/builder");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
            <Wand2 className="w-8 h-8 text-primary" />
          </div>
          <PageHeader 
            title={t`Construir con IA`}
            subtitle={t`La IA crea el flujo por ti.`}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 rounded-xl shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    {t`¿Qué quieres hacer?`}
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleBuildFlow();
                      }
                    }}
                    placeholder={t`ej., Pagar a mi proveedor $1000 vía ACH, o Automatizar conversión BRL a USD...`}
                    className="min-h-[120px] rounded-xl focus-visible:ring-2 focus-visible:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t`Presiona Cmd+Enter para construir`}
                  </p>
                </div>

                <Button 
                  onClick={handleBuildFlow} 
                  className="w-full rounded-lg" 
                  size="lg"
                  disabled={!prompt.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      {t`Un momento...`}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      {t`Construir flujo`}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm tracking-tight px-2">
                <span className="font-semibold text-foreground">{t`Sugerencias.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Ideas para empezar.`}</span>
              </h3>

              <div className="space-y-3">
                {promptSuggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <Card
                      key={suggestion.id}
                      className="p-4 rounded-xl cursor-pointer hover:border-primary/50 transition-colors duration-150 group"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            {suggestion.complexity === 'complex' && (
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.steps.length} {t`pasos`}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium leading-tight mb-1">
                            {suggestion.text}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-xl shadow-sm min-h-[600px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm tracking-tight"><span className="font-semibold text-foreground">{t`Flujo.`}</span>{' '}<span className="font-normal text-muted-foreground">{t`Vista previa de tu automatización.`}</span></h3>
                  {builtSteps.length > 0 && (
                    <Badge variant="outline">
                      {builtSteps.length} {builtSteps.length !== 1 ? t`pasos` : t`paso`}
                    </Badge>
                  )}
                </div>

                {builtSteps.length === 0 && !isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      {t`Tu flujo aparecerá aquí mientras lo construyes`}
                    </p>
                  </div>
                ) : (
                  <div className="relative space-y-4">
                    {builtSteps.length > 1 && (
                      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-linear-to-b from-primary via-accent to-primary opacity-30" />
                    )}

                    <AnimatePresence>
                      {builtSteps.map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                          <motion.div
                            key={step.id}
                            {...fadeInUp}
                            className="relative"
                          >
                            <Card className="p-4 border-border bg-card hover:border-primary/50 transition-colors duration-150 rounded-xl">
                              <div className="flex items-start gap-4">
                                <div className="relative z-10">
                                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                                    <StepIcon className={`w-5 h-5 ${step.color}`} />
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center p-0 bg-background text-xs"
                                  >
                                    {index + 1}
                                  </Badge>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-muted-foreground">
                                      {step.label}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {step.sublabel}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {isProcessing && (
                      <motion.div {...fadeInUp}>
                        <Card className="p-4 border-dashed border-primary/50 bg-primary/5 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
                              <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">{t`Un momento...`}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {builtSteps.length > 0 && (
              <motion.div {...fadeInUp} className="space-y-3">
                <Button
                  onClick={handleExecuteTask}
                  variant="gradient"
                  className="w-full rounded-lg"
                  size="lg"
                  disabled={isProcessing}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {t`Ejecutar tarea`}
                </Button>
                <Button
                  onClick={handleRefineInBuilder}
                  variant="outline"
                  className="w-full rounded-lg"
                  size="lg"
                  disabled={isProcessing}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t`Refinar en constructor visual`}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
