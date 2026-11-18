import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  Play,
  Save,
  Webhook,
  Clock,
  Shield,
  TrendingUp,
  CreditCard,
  Zap,
  GitBranch,
  Bell,
  CheckCircle2,
  ArrowLeftRight,
  Wallet,
  Repeat,
  Smartphone,
  Cable,
  Package,
  Lock,
  Globe,
  Sparkles,
  MessageSquare,
} from '@/shared/components/animated-icons';
import { FlowTemplate } from '@/shared/types/merchant';
import { useSuiteStore } from '@/shared/stores/useSuiteStore';
import { ProductKey } from '@/shared/types/suite';

interface WorkflowBuilderProps {
  initialFlow?: FlowTemplate;
  category: 'move' | 'convert' | 'account';
  onSave?: (flow: FlowTemplate) => void;
}

// Organized node categories with enhanced agentic, banking, stablecoin, compliance, and optimization
const nodePalette = {
  triggers: [
    { type: 'trigger', label: 'Webhook', icon: Webhook, color: 'text-chart-1', product: null },
    { type: 'trigger', label: 'Programado', icon: Clock, color: 'text-chart-1', product: null },
    {
      type: 'trigger',
      label: 'Pago Recibido',
      icon: ArrowLeftRight,
      color: 'text-chart-1',
      product: 'move',
    },
    {
      type: 'trigger',
      label: 'Venta POS',
      icon: Smartphone,
      color: 'text-chart-1',
      product: 'pos',
    },
    {
      type: 'trigger',
      label: 'Agent Intent',
      icon: Sparkles,
      color: 'text-chart-1',
      product: null,
    },
  ],
  checks: [
    { type: 'check', label: 'KYC/KYB', icon: Shield, color: 'text-chart-4', product: null },
    {
      type: 'check',
      label: 'Balance Check',
      icon: TrendingUp,
      color: 'text-chart-4',
      product: 'account',
    },
    { type: 'check', label: 'Screening', icon: Shield, color: 'text-chart-4', product: null },
    { type: 'check', label: 'Velocity Check', icon: Zap, color: 'text-chart-4', product: null },
    { type: 'check', label: 'Geo Compliance', icon: Globe, color: 'text-chart-4', product: null },
  ],
  agentic: [
    {
      type: 'agentic',
      label: 'Agent Intent (AP2)',
      icon: Sparkles,
      color: 'text-chart-3',
      integration: 'google-ap2',
    },
    {
      type: 'agentic',
      label: 'Stripe Instant',
      icon: CreditCard,
      color: 'text-chart-3',
      integration: 'stripe-instant',
    },
    {
      type: 'agentic',
      label: 'PayPal Link',
      icon: MessageSquare,
      color: 'text-chart-3',
      integration: 'paypal-link',
    },
  ],
  banking: [
    {
      type: 'banking',
      label: 'OpenPayd vIBAN',
      icon: Wallet,
      color: 'text-chart-2',
      integration: 'openpaid',
    },
    {
      type: 'banking',
      label: 'Wise Collect',
      icon: ArrowLeftRight,
      color: 'text-chart-2',
      integration: 'wise-platform',
    },
    {
      type: 'banking',
      label: 'Airwallex FX',
      icon: Repeat,
      color: 'text-chart-2',
      integration: 'airwallex',
    },
  ],
  stablecoin: [
    {
      type: 'stablecoin',
      label: 'Brex USDC Pay',
      icon: CreditCard,
      color: 'text-chart-1',
      integration: 'brex-stablecoin',
    },
    {
      type: 'stablecoin',
      label: 'Shield USDT',
      icon: Shield,
      color: 'text-chart-1',
      integration: 'shield',
    },
    {
      type: 'stablecoin',
      label: 'Circle CCTP Bridge',
      icon: Globe,
      color: 'text-chart-1',
      integration: 'circle-cctp',
    },
  ],
  move: [
    {
      type: 'action',
      label: 'Cobrar (Pix)',
      icon: ArrowLeftRight,
      color: 'text-success',
      product: 'move',
    },
    {
      type: 'action',
      label: 'Pagar (ACH)',
      icon: ArrowLeftRight,
      color: 'text-success',
      product: 'move',
    },
    {
      type: 'action',
      label: 'Pagar (SEPA)',
      icon: ArrowLeftRight,
      color: 'text-success',
      product: 'move',
    },
    {
      type: 'action',
      label: 'Transferir',
      icon: ArrowLeftRight,
      color: 'text-success',
      product: 'move',
    },
  ],
  change: [
    { type: 'action', label: 'FX Quote', icon: Repeat, color: 'text-warning', product: 'change' },
    { type: 'action', label: 'Execute FX', icon: Repeat, color: 'text-warning', product: 'change' },
    { type: 'action', label: 'On-Ramp', icon: Zap, color: 'text-warning', product: 'change' },
    { type: 'action', label: 'Off-Ramp', icon: Zap, color: 'text-warning', product: 'change' },
  ],
  account: [
    {
      type: 'action',
      label: 'Transferencia Interna',
      icon: Wallet,
      color: 'text-chart-5',
      product: 'account',
    },
    { type: 'action', label: 'Sweep', icon: Wallet, color: 'text-chart-5', product: 'account' },
    {
      type: 'action',
      label: 'Prefund Wallet',
      icon: Wallet,
      color: 'text-chart-5',
      product: 'account',
    },
  ],
  compliance: [
    {
      type: 'compliance',
      label: 'Policy Gate (2-eyes)',
      icon: Shield,
      color: 'text-destructive',
      product: null,
    },
    {
      type: 'compliance',
      label: 'Limit Check',
      icon: TrendingUp,
      color: 'text-destructive',
      product: null,
    },
    {
      type: 'compliance',
      label: 'Address Screening',
      icon: Shield,
      color: 'text-destructive',
      product: null,
    },
  ],
  optimization: [
    {
      type: 'optimization',
      label: 'Route Select',
      icon: GitBranch,
      color: 'text-chart-4',
      product: null,
    },
    {
      type: 'optimization',
      label: 'Hedge',
      icon: TrendingUp,
      color: 'text-chart-4',
      product: null,
    },
    {
      type: 'optimization',
      label: 'Rebalance',
      icon: Repeat,
      color: 'text-chart-4',
      product: null,
    },
  ],
  marketplace: [
    {
      type: 'action',
      label: 'Invertir',
      icon: TrendingUp,
      color: 'text-chart-3',
      product: 'marketplace',
    },
    {
      type: 'action',
      label: 'Redimir',
      icon: TrendingUp,
      color: 'text-chart-3',
      product: 'marketplace',
    },
  ],
  pos: [
    { type: 'action', label: 'Venta', icon: Smartphone, color: 'text-chart-2', product: 'pos' },
    { type: 'action', label: 'Reembolso', icon: Smartphone, color: 'text-chart-2', product: 'pos' },
  ],
  integrations: [
    {
      type: 'integration',
      label: 'Openfort',
      icon: Lock,
      color: 'text-chart-1',
      integration: 'openfort',
    },
    {
      type: 'integration',
      label: 'Bridge.xyz',
      icon: Globe,
      color: 'text-chart-1',
      integration: 'bridge-xyz',
    },
    {
      type: 'integration',
      label: 'Tether WDK',
      icon: Package,
      color: 'text-chart-1',
      integration: 'tether-wdk',
    },
    { type: 'integration', label: 'BRE-B', icon: Zap, color: 'text-chart-1', integration: 'bre-b' },
    { type: 'integration', label: 'Pix', icon: Zap, color: 'text-chart-1', integration: 'pix' },
    { type: 'integration', label: 'SPEI', icon: Zap, color: 'text-chart-1', integration: 'spei' },
  ],
  logic: [
    {
      type: 'logic',
      label: 'Rama',
      icon: GitBranch,
      color: 'text-muted-foreground',
      product: null,
    },
    {
      type: 'approval',
      label: 'Aprobación',
      icon: CheckCircle2,
      color: 'text-destructive',
      product: null,
    },
    {
      type: 'notify',
      label: 'Notificar',
      icon: Bell,
      color: 'text-muted-foreground',
      product: null,
    },
  ],
};

// AI Prompt examples by category with enhanced regional and treasury scenarios
// @ts-expect-error reserved for AI prompt UI
const _aiPromptExamples = {
  move: [
    {
      label: 'Pagar empleados en BRL vía Pix',
      prompt:
        'Recibo pagos, los convierto a USDC y pago empleados en Brasil vía Pix automáticamente',
    },
    {
      label: 'Pagar proveedores USA vía ACH',
      prompt:
        'Recibir fondos en USDC, validar KYC/KYB y realizar pagos a proveedores en USA vía ACH',
    },
    {
      label: 'Pagos internacionales vía SEPA',
      prompt: 'Convertir de USDC a EUR y enviar pagos a proveedores europeos vía SEPA',
    },
    {
      label: 'Nómina multi-país',
      prompt:
        'Procesar nómina pagando empleados en Brasil (Pix), USA (ACH) y Europa (SEPA) desde una cuenta en USDC',
    },
    {
      label: 'Cross-border con compliance',
      prompt:
        'Recibir en COP, hacer screening de dirección, aprobar con 2-eyes, convertir a USDT y pagar en CNY',
    },
  ],
  convert: [
    {
      label: 'Cobertura automática BRL→USDC',
      prompt:
        'Cuando reciba pagos en BRL, convertir automáticamente a USDC para evitar devaluación',
    },
    {
      label: 'On-ramp programado diario',
      prompt:
        'Todos los días a las 16:00, convertir saldo en fiat a USDC si el spread es menor al 0.5%',
    },
    {
      label: 'Off-ramp por umbral',
      prompt:
        'Cuando mi balance en USDC supere $10,000, convertir el excedente a BRL automáticamente',
    },
    {
      label: 'Hedge multi-moneda',
      prompt:
        'Mantener balances distribuidos en 30% USDC, 40% BRL y 30% USD, rebalanceando diariamente',
    },
    {
      label: 'Bridge USDC cross-chain',
      prompt:
        'Cuando reciba USDC en Ethereum, hacer bridge a Polygon usando Circle CCTP automáticamente',
    },
  ],
  account: [
    {
      label: 'Barrido nocturno de cuentas',
      prompt:
        'Cada noche a las 23:00, consolidar todos los saldos de subcuentas a la cuenta principal',
    },
    {
      label: 'Prefondeo de wallets',
      prompt: 'De lunes a viernes a las 08:00, fondear wallets de empleados con $100 USDC cada uno',
    },
    {
      label: 'Distribución automática por %',
      prompt:
        'Al recibir fondos, distribuir 70% a cuenta principal y 30% a cuenta de operaciones automáticamente',
    },
    {
      label: 'Límites y alertas',
      prompt:
        'Monitorear saldos de cuentas y enviar alerta si alguna cae bajo $1,000 o supera $50,000',
    },
    {
      label: 'vIBAN auto-collection',
      prompt:
        'Al recibir fondos en vIBAN EUR, convertir a USD usando Wise y mover a cuenta principal',
    },
  ],
  treasury: [
    {
      label: 'Rebalanceo automático 30/30/40',
      prompt: 'Mantener 30% USD, 30% BRL, 40% USDC. Rebalancear semanalmente si desviación > 5%',
    },
    {
      label: 'Hedge de volatilidad BRL',
      prompt:
        'Si BRL se devalúa más de 2% en 24h, convertir 50% del saldo BRL a USDC automáticamente',
    },
    {
      label: 'Idle cash a yield',
      prompt:
        'Si saldo USD supera $50k y es fin de semana, invertir excedente en money-market automáticamente',
    },
    {
      label: 'Pre-nómina liquidity',
      prompt:
        'El día antes de nómina, asegurar que hay liquidez suficiente en cada moneda, hacer FX si falta',
    },
  ],
  agentic: [
    {
      label: 'Agent Intent para pagos recurrentes',
      prompt:
        'Crear AP2 intent para suscripción mensual de $50 USD con aprobación automática y pago vía Stripe',
    },
    {
      label: 'PayPal Link con conversión',
      prompt:
        'Generar pay-by-link de $100 EUR, aceptar múltiples monedas, convertir todo a USDC al liquidar',
    },
    {
      label: 'Checkout conversacional con shield',
      prompt:
        'Chat de pago que acepta USDT vía Shield, convierte a fiat y liquida en cuenta local mismo día',
    },
  ],
};

export function WorkflowBuilder({ initialFlow, category, onSave }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow?.edges || []);
  const [flowName] = useState(initialFlow?.name || 'Nuevo Flujo');
  const { isProductEnabled, isIntegrationEnabled } = useSuiteStore();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (nodeType: any) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: nodeType.label,
        type: nodeType.type,
        icon: nodeType.icon,
      },
      style: {
        background: 'var(--card)',
        border: '2px solid var(--primary)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '12px',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = () => {
    const flow: FlowTemplate = {
      id: initialFlow?.id || `flow-${Date.now()}`,
      name: flowName,
      category: category === 'move' ? 'payout' : category === 'convert' ? 'conversion' : 'sweep',
      nodes,
      edges,
      version: 'v1',
      status: 'draft',
    };
    onSave?.(flow);
  };

  const handleRun = () => {};

  const isNodeDisabled = (node: any) => {
    if (node.product && !isProductEnabled(node.product as ProductKey)) return true;
    if (node.integration && !isIntegrationEnabled(node.integration)) return true;
    return false;
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Palette - Organized by Category */}
      <Card className="w-80 overflow-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cable className="w-4 h-4" />
            <div>
              <p className="text-sm font-semibold">Paleta de Nodos</p>
              <p className="text-xs text-muted-foreground mt-1">Haz click para agregar nodos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <Accordion
            type="multiple"
            defaultValue={['triggers', 'move', 'change', 'account', 'integrations']}
          >
            <AccordionItem value="triggers">
              <AccordionTrigger className="text-xs font-semibold">Disparadores</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.triggers.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="checks">
              <AccordionTrigger className="text-xs font-semibold">Validaciones</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.checks.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="move">
              <AccordionTrigger className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Move
                  {!isProductEnabled('move') && (
                    <Badge variant="secondary" className="text-xs">
                      Deshabilitado
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.move.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="change">
              <AccordionTrigger className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Repeat className="w-3.5 h-3.5" />
                  Change
                  {!isProductEnabled('change') && (
                    <Badge variant="secondary" className="text-xs">
                      Deshabilitado
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.change.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account">
              <AccordionTrigger className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" />
                  Account
                  {!isProductEnabled('account') && (
                    <Badge variant="secondary" className="text-xs">
                      Deshabilitado
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.account.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="marketplace">
              <AccordionTrigger className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Vaults
                  {!isProductEnabled('marketplace') && (
                    <Badge variant="secondary" className="text-xs">
                      Deshabilitado
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.marketplace.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pos">
              <AccordionTrigger className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5" />
                  POS
                  {!isProductEnabled('pos') && (
                    <Badge variant="secondary" className="text-xs">
                      Deshabilitado
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.pos.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integrations">
              <AccordionTrigger className="text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  Integraciones
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.integrations.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                        {disabled && (
                          <Badge variant="outline" className="text-[10px] ml-auto">
                            Off
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logic">
              <AccordionTrigger className="text-xs font-semibold">
                Lógica & Control
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {nodePalette.logic.map((nodeType, idx) => {
                    const Icon = nodeType.icon;
                    const disabled = isNodeDisabled(nodeType);
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-8 ${disabled ? 'opacity-50' : ''}`}
                        onClick={() => !disabled && addNode(nodeType)}
                        disabled={disabled}
                      >
                        <Icon className={`w-3.5 h-3.5 ${nodeType.color}`} />
                        <span className="text-xs">{nodeType.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Right Canvas */}
      <Card className="flex-1 overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-card/50 py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{flowName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Draft
              </Badge>
              <Button variant="outline" size="sm" onClick={handleRun} className="h-8">
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Test
              </Button>
              <Button size="sm" onClick={handleSave} className="h-8">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-60px)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'trigger':
                    return '#60a5fa';
                  case 'check':
                    return '#fb923c';
                  case 'action':
                    return '#4ade80';
                  case 'integration':
                    return '#22d3ee';
                  default:
                    return '#9ca3af';
                }
              }}
              className="bg-card! border-border!"
            />
            <Panel position="top-left">
              <div className="bg-card/95 backdrop-blur border border-border rounded-lg p-3 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Atajos</div>
                <div className="text-xs space-y-1">
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">Shift</kbd> + Arrastrar =
                    Selección múltiple
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl</kbd> +{' '}
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">C/V</kbd> = Copiar/Pegar
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">Del</kbd> = Eliminar nodo
                  </div>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </CardContent>
      </Card>
    </div>
  );
}
