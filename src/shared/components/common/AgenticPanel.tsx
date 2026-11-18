import { motion, AnimatePresence } from 'framer-motion';
import { useAgenticChat } from '@/shared/stores/useAgenticChat';
import { useModeStore } from '@/shared/stores/useModeStore';
import { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  ChevronRight, 
  Plus,
  List,
  Share2,
  Check,
  Loader2,
  Circle,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Receipt,
  Copy,
  Trash2,
  MoreVertical,
} from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/shared/components/ui/resizable';
import { AgenticEngine, type RoutingContext, type RoutingOption } from '@/shared/lib/agentic-engine';
import { getPromptsByCategory } from '@/shared/lib/agentic-prompts';
import { ParameterForm } from '@/shared/components/common/ParameterForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useLingui } from '@lingui/react/macro';

export function AgenticPanel() {
  const { t } = useLingui();
  const { currentMode } = useModeStore();
  const { 
    isOpen, 
    close, 
    operations, 
    currentOperationId,
    setCurrentOperation,
    addMessage,
    addStep,
    updateStep,
    createOperation,
    deleteOperation,
  } = useAgenticChat();
  
  const [input, setInput] = useState('');
  const [showIndex, setShowIndex] = useState(false);
  const [routingContext, setRoutingContext] = useState<RoutingContext | null>(null);
  const [routingOptions, setRoutingOptions] = useState<RoutingOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RoutingOption | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [, setReceiptId] = useState('');
  const [showParameterForm, setShowParameterForm] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  
  const currentOperation = operations.find(op => op.id === currentOperationId);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentOperation?.messages]);
  
  const promptCategories = [
    {
      id: "co",
      label: "🇨🇴 Colombia",
      description: "Colectas y swaps locales",
      prompts: getPromptsByCategory("colombia").slice(0, 3),
    },
    {
      id: "br",
      label: "🇧🇷 Brasil",
      description: "Pix y conversiones",
      prompts: getPromptsByCategory("brazil").slice(0, 3),
    },
    {
      id: "multi",
      label: "🌍 Multi-moneda",
      description: "Rutas y treasury",
      prompts: getPromptsByCategory("multi").slice(0, 3),
    },
  ];

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    
    // Create new operation if this is first message
    if (currentOperation?.messages.length === 0) {
      createOperation(text.slice(0, 60));
    }
    
    addMessage({ role: 'user', content: text });
    setInput('');
    
    // Step 1: Analyze intent
    addStep({
      title: 'Analizando tu solicitud',
      status: 'in-progress',
      details: 'Detectando monedas, montos y prioridades...',
    });
    
    setTimeout(() => {
      const context = AgenticEngine.analyzeIntent(text);
      
      if (context) {
        setRoutingContext(context);
        updateStep('step-' + Date.now(), { status: 'completed' });
        
        // Step 2: Generate routes
        addStep({
          title: 'Generando rutas optimizadas',
          status: 'in-progress',
          details: `Evaluando opciones para ${context.fromCurrency} → ${context.toCurrency}...`,
        });
        
        setTimeout(() => {
          const routes = AgenticEngine.generateRoutes(context);
          setRoutingOptions(routes);
          updateStep('step-' + Date.now(), { status: 'completed' });
          
          // Step 3: Present options
          addMessage({
            role: 'assistant',
            content: `He analizado tu solicitud de ${context.amount.toLocaleString()} ${context.fromCurrency} → ${context.toCurrency}. Encontré ${routes.length} opciones optimizadas:`,
            action: 'preview',
            actionData: { routes, context },
          });
        }, 1000);
      } else {
        updateStep('step-' + Date.now(), { status: 'completed' });
        addMessage({
          role: 'assistant',
          content: 'No pude detectar todos los parámetros. Por favor completa el formulario para continuar:',
        });
        setShowParameterForm(true);
      }
    }, 800);
  };
  
  const handleNewOperation = () => {
    createOperation('Nueva Operación');
    setRoutingContext(null);
    setRoutingOptions([]);
    setSelectedRoute(null);
    setReceiptId('');
    setShowParameterForm(false);
  };

  const handleParameterSubmit = (params: { amount: number; fromCurrency: string; toCurrency: string; priority?: string }) => {
    setShowParameterForm(false);
    
    const context: RoutingContext = {
      amount: params.amount,
      fromCurrency: params.fromCurrency,
      toCurrency: params.toCurrency,
      priority: params.priority as any || 'optimal'
    };
    
    setRoutingContext(context);
    
    addMessage({
      role: 'user',
      content: `Convertir $${params.amount.toLocaleString()} ${params.fromCurrency} a ${params.toCurrency}, prioridad ${params.priority}`
    });
    
    addStep({
      title: 'Generando rutas optimizadas',
      status: 'in-progress',
      details: `Evaluando opciones para ${params.fromCurrency} → ${params.toCurrency}...`,
    });
    
    setTimeout(() => {
      const routes = AgenticEngine.generateRoutes(context);
      setRoutingOptions(routes);
      updateStep('step-' + Date.now(), { status: 'completed' });
      
      addMessage({
        role: 'assistant',
        content: `He analizado tu solicitud de ${context.amount.toLocaleString()} ${context.fromCurrency} → ${context.toCurrency}. Encontré ${routes.length} opciones optimizadas:`,
        action: 'preview',
        actionData: { routes, context },
      });
    }, 1000);
  };

  const handleDeleteOperation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteOperation(id);
    toast.success(t`Operación eliminada`);
  };
  
  const handleExecuteRoute = async (route: RoutingOption) => {
    if (!routingContext) return;
    
    setSelectedRoute(route);
    setIsExecuting(true);
    
    addMessage({
      role: 'assistant',
      content: `Ejecutando ruta "${route.name}"...`,
    });
    
    try {
      const result = await AgenticEngine.executeFlow(
        route.id,
        routingContext,
        (step) => {
          const existingStep = currentOperation?.steps.find(s => s.id === step.id);
          if (existingStep) {
            updateStep(step.id, step);
          } else {
            addStep(step);
          }
        }
      );
      
      setReceiptId(result.receiptId);
      setIsExecuting(false);
      
      // Calculate savings
      const comparisons = AgenticEngine.compareWithCompetitors(routingContext, route);
      const bestComparison = comparisons.reduce((best, curr) => 
        curr.savings > best.savings ? curr : best
      );
      
      addMessage({
        role: 'assistant',
        content: `Transacción completada`,
        action: 'execute',
        actionData: {
          receiptId: result.receiptId,
          savings: bestComparison.savings,
          competitor: bestComparison.competitor,
          route,
        },
      });
      
      toast.success(`Ahorraste $${bestComparison.savings.toFixed(2)} vs. ${bestComparison.competitor}`);
    } catch (error) {
      setIsExecuting(false);
      addMessage({
        role: 'assistant',
        content: 'Ocurrió un error al ejecutar la transacción. Por favor intenta nuevamente.',
      });
      toast.error(t`No pudimos completar la transacción`);
    }
  };

  // Conditional rendering based on mode
  const mainContent = (
    <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Routes Optimizer</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentOperation && currentOperation.messages.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowIndex(!showIndex)}>
                    <List className="w-4 h-4 mr-2" />
                    Índice
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir y exportar
                  </Button>
                  <Button size="sm" variant="outline" className="border border-border">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={close}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Left panel: History */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                  <Button 
                    className="w-full justify-start border border-border" 
                    variant="outline"
                    onClick={handleNewOperation}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva optimización
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    {operations.map((op) => (
                      <div
                        key={op.id}
                        className={cn(
                          "group relative w-full text-left p-3 rounded-lg transition-colors hover:bg-accent/50 cursor-pointer",
                          currentOperationId === op.id && "bg-accent"
                        )}
                        onClick={() => setCurrentOperation(op.id)}
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{op.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(op.timestamp).toLocaleDateString('es-ES', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {op.id !== 'default' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => handleDeleteOperation(op.id, e)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-3 border-t border-border text-xs text-muted-foreground">
                  <p>El optimizador encuentra las mejores rutas para tus operaciones en tiempo real.</p>
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Right panel: Current investigation */}
            <ResizablePanel defaultSize={80}>
              <div className="h-full flex flex-col">
                {!currentOperation || currentOperation.messages.length === 0 ? (
                  // Empty state with guided prompts
                  <div className="flex-1 overflow-auto">
                    <div className="max-w-5xl mx-auto p-8 space-y-8">
                        <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                          <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                          <h2 className="text-3xl font-bold">Loopay Agent</h2>
                        <p className="text-muted-foreground text-lg">
                            Ejecuta flujos en lenguaje natural y duplica tu velocidad operativa.
                        </p>
                      </div>
                      
                      {/* Input */}
                      <div className="w-full max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 rounded-xl bg-accent/50 border border-border shadow-sm px-4 py-3">
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                              }
                            }}
                            placeholder='Ejemplo: "Convertir $5,000 USD a COP desde Brex, prioridad óptima"'
                            className="border-0 bg-transparent focus-visible:ring-0 text-base"
                          />
                          <Button 
                            onClick={handleSend} 
                            size="icon" 
                            className="rounded-lg shrink-0"
                            disabled={!input.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Guided prompts by category */}
                      <div className="space-y-6">
                        {promptCategories.map((category) => (
                          <div key={category.id} className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                              <h3 className="text-sm font-semibold text-muted-foreground">
                                {category.label}
                              </h3>
                              <span className="text-xs text-muted-foreground">{category.description}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {category.prompts.map((prompt) => (
                                <Card
                                  key={prompt.id}
                                  className="cursor-pointer border-border/50 hover:border-primary/60 hover:shadow-md"
                                  onClick={() => {
                                    setInput(prompt.prompt);
                                    handleSend();
                                  }}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl" aria-hidden>{prompt.icon}</span>
                                      <div>
                                        <CardTitle className="text-sm font-medium leading-tight">
                                          {prompt.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                          {prompt.description}
                                        </CardDescription>
                                      </div>
                                    </div>
                                  </CardHeader>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Active investigation
                  <div className="flex-1 overflow-hidden flex">
                    {/* Messages and steps */}
                    <ScrollArea className="flex-1">
                      <div className="max-w-4xl mx-auto p-6 space-y-6">
                        {/* Title */}
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <h1 className="text-xl font-bold">{currentOperation.title}</h1>
                        </div>
                        
                        {/* Messages */}
                        {currentOperation.messages.map((msg, idx) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {msg.role === 'user' ? (
                              <div className="flex justify-end">
                                <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl px-4 py-3">
                                  <p className="text-sm">{typeof msg.content === 'string' ? msg.content : ''}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <p className="text-sm leading-relaxed">{typeof msg.content === 'string' ? msg.content : ''}</p>
                                </div>
                                
                                {/* Parameter form when missing params */}
                                {showParameterForm && idx === currentOperation.messages.length - 1 && (
                                  <ParameterForm onSubmit={handleParameterSubmit} />
                                )}
                                
                                {/* Routing options */}
                                {msg.action === 'preview' && msg.actionData?.routes && (
                                  <div className="space-y-3">
                                    {(msg.actionData.routes as RoutingOption[]).map((route) => (
                                      <Card
                                        key={route.id}
                                        className={cn(
                                          "transition-colors duration-150 cursor-pointer hover:border-primary/50",
                                          selectedRoute?.id === route.id && "border-primary bg-primary/5"
                                        )}
                                        onClick={() => !isExecuting && handleExecuteRoute(route)}
                                      >
                                        <CardHeader className="pb-3">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-base">{route.name}</CardTitle>
                                                {route.confidence > 0.9 && (
                                                  <Badge className="bg-success/20 text-success border-success/30">
                                                    Recomendado
                                                  </Badge>
                                                )}
                                              </div>
                                              <CardDescription>{route.description}</CardDescription>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-2xl font-bold font-mono tabular-nums text-primary">
                                                ${route.fee.toFixed(2)}
                                              </div>
                                              <div className="text-xs text-muted-foreground font-mono tabular-nums">
                                                {route.feePercent.toFixed(2)}% fee
                                              </div>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          {/* Route path */}
                                          <div className="flex items-center gap-2 text-xs">
                                            {route.route.map((step, i) => (
                                              <div key={i} className="flex items-center gap-2">
                                                <span className="px-2 py-1 rounded bg-accent font-medium">
                                                  {step}
                                                </span>
                                                {i < route.route.length - 1 && (
                                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                          
                                          {/* Badges */}
                                          <div className="flex flex-wrap gap-2">
                                            {route.badges.map((badge, i) => (
                                              <Badge key={i} variant={badge.variant}>
                                                {badge.label}
                                              </Badge>
                                            ))}
                                          </div>
                                          
                                          <Separator />
                                          
                                          {/* Reason */}
                                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <p>{route.reason}</p>
                                          </div>
                                          
                                          <Button
                                            className="w-full border border-border"
                                            disabled={isExecuting}
                                          >
                                            {isExecuting && selectedRoute?.id === route.id ? (
                                              <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Ejecutando...
                                              </>
                                            ) : (
                                              <>
                                                Ejecutar esta ruta
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                              </>
                                            )}
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    ))}
                                    
                                    {/* Competitor comparison */}
                                    {routingContext && routingOptions.length > 0 && (
                                      <Card className="border-destructive/20 bg-destructive/5">
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-destructive" />
                                            Comparación con competidores
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                              <span className="text-muted-foreground">dLocal</span>
                                              <span className="font-semibold font-mono tabular-nums">
                                                ${(routingContext.amount * 0.035).toFixed(2)}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-muted-foreground">Kushki</span>
                                              <span className="font-semibold font-mono tabular-nums">
                                                ${(routingContext.amount * 0.029).toFixed(2)}
                                              </span>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between p-2 rounded-lg bg-success/10">
                                              <span className="font-semibold text-success">
                                                Ahorras con Loopay
                                              </span>
                                              <span className="text-lg font-bold font-mono tabular-nums text-success">
                                                ${((routingContext.amount * 0.035) - routingOptions[0].fee).toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                )}
                                
                                {/* Success receipt */}
                                {msg.action === 'execute' && msg.actionData && (
                                  <Card className="border-success/30 bg-linear-to-br from-success/10 to-success/5">
                                    <CardHeader>
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                                          <Check className="w-6 h-6 text-success" />
                                        </div>
                                        <div>
                                          <CardTitle>¡Transacción exitosa!</CardTitle>
                                          <CardDescription>
                                            ID: {msg.actionData.receiptId}
                                          </CardDescription>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                                        <div className="flex items-center gap-2">
                                          <TrendingDown className="w-5 h-5 text-success" />
                                          <span className="font-semibold">Ahorraste</span>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-2xl font-bold font-mono tabular-nums text-success">
                                            ${msg.actionData.savings.toFixed(2)}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            vs. {msg.actionData.competitor}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() => {
                                            navigator.clipboard.writeText(msg.actionData.receiptId);
                                            toast.success(t`ID copiado`);
                                          }}
                                        >
                                          <Copy className="w-4 h-4 mr-2" />
                                          Copiar ID
                                        </Button>
                                        <Button variant="outline" className="flex-1">
                                          <Receipt className="w-4 h-4 mr-2" />
                                          Ver recibo
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                        
                        {/* Research steps */}
                        {currentOperation.steps.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Próximos Pasos
                            </h3>
                            
                            {currentOperation.steps.map((step) => (
                              <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-border"
                              >
                                <div className="mt-0.5">
                                  {step.status === 'completed' ? (
                                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                                      <Check className="w-3 h-3 text-success" />
                                    </div>
                                  ) : step.status === 'in-progress' ? (
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{step.title}</p>
                                  {step.details && (
                                    <p className="text-xs text-muted-foreground mt-1">{step.details}</p>
                                  )}
                                </div>
                                
                                <Badge variant="secondary" className="text-xs">
                                  {step.status === 'completed' ? 'Completado' : 
                                   step.status === 'in-progress' ? 'En progreso' : 'Pendiente'}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        <div ref={endRef} />
                      </div>
                    </ScrollArea>
                    
                    {/* Index sidebar */}
                    <AnimatePresence>
                      {showIndex && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 300, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="border-l border-border overflow-hidden"
                        >
                          <div className="w-[300px] h-full p-4">
                            <h3 className="font-semibold mb-4">Índice</h3>
                            <div className="space-y-2">
                              {currentOperation.steps.map((step) => (
                                <button
                                  key={step.id}
                                  className="w-full text-left text-sm p-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                                >
                                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                  <span className="flex-1 truncate">{step.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
  );

  // In intelligent mode, render as main content
  if (currentMode === 'intelligent') {
    return mainContent;
  }

  // In operator/builder mode, render as overlay with animations
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-200 bg-background"
        >
          {mainContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
