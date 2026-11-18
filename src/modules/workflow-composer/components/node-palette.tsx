import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import {
  DollarSign, Zap, TrendingUp, GitBranch, Settings,
  ArrowDownLeft, RefreshCw, Send, Ban, Check, ArrowRight,
  Link, Wrench, Webhook, Search, ArrowUpRight, FileText,
  Clock, Bell, GripVertical,
} from '@/shared/components/animated-icons';
import { Shield } from '@/shared/components/animated-icons';
import type { IconComponent } from '@/shared/components/animated-icons';
import type { NodeDefinition, NodeCategory } from '../types/workflow.types';

// ── Icon maps ────────────────────────────────────────────────
const CATEGORY_ICON: Record<NodeCategory, IconComponent> = {
  soberana:  DollarSign,
  loopayapp: Zap,
  fx:        TrendingUp,
  control:   Settings,
};

const NODE_ICON: Record<string, IconComponent> = {
  'payin-create':       ArrowDownLeft,
  'payin-update':       RefreshCw,
  'payout-create':      Send,
  'payout-multisign':   Shield,
  'payout-cancel':      Ban,
  'fdr-validate':       Check,
  'crossborder-create': ArrowRight,
  'crossborder-update': RefreshCw,
  'lapp-payin-fdr':     Link,
  'lapp-engine':        Wrench,
  'lapp-webhook':       Webhook,
  'lapp-paid-methods':  Search,
  'fx-rates-poll':      TrendingUp,
  'fx-rates-ws':        Zap,
  'fx-order':           ArrowUpRight,
  'fx-balances':        DollarSign,
  'comex-expediente':   FileText,
  'trigger-webhook':    Webhook,
  'trigger-cron':       Clock,
  'condition':          GitBranch,
  'transform':          RefreshCw,
  'delay':              Clock,
  'log':                FileText,
  'notification':       Bell,
};

const CATEGORY_BORDER_COLOR: Record<NodeCategory, string> = {
  soberana:  'var(--primary)',
  loopayapp: 'var(--chart-2)',
  fx:        'var(--chart-3)',
  control:   'var(--muted-foreground)',
};

// ── Node definitions ─────────────────────────────────────────
function useNodeDefinitions(): NodeDefinition[] {
  const { t } = useLingui();

  return [
    // ── SOBERANA ──────────────────────────────────────────
    {
      type: 'payin-create', labelKey: t`PayIn: Crear cobro`, category: 'soberana',
      descriptionKey: t`Crea un cobro en Soberana`, defaultConfig: { type: 'deposit' },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'amount', label: t`Monto`, type: 'text', placeholder: '{{amount}}' },
        { key: 'companyProductId', label: t`Producto`, type: 'text', placeholder: 'prod-id' },
        { key: 'currencyId', label: t`Moneda`, type: 'text', placeholder: 'currency-id' },
        { key: 'type', label: t`Tipo`, type: 'select', options: ['deposit', 'credit', 'collection'] },
      ],
    },
    {
      type: 'payin-update', labelKey: t`PayIn: Actualizar estado`, category: 'soberana',
      descriptionKey: t`Acepta o rechaza un PayIn`, defaultConfig: { state: 'accepted' },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'id', label: t`ID del PayIn`, type: 'text', placeholder: '{{payin.id}}' },
        { key: 'state', label: t`Estado`, type: 'select', options: ['accepted', 'rejected'] },
      ],
    },
    {
      type: 'payout-create', labelKey: t`PayOut: Crear pago`, category: 'soberana',
      descriptionKey: t`Crea un pago saliente`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'amount', label: t`Monto`, type: 'text', placeholder: '{{amount}}' },
        { key: 'bankAccount', label: t`Cuenta bancaria`, type: 'text', placeholder: '' },
        { key: 'beneficiaryName', label: t`Beneficiario`, type: 'text', placeholder: '' },
        { key: 'documentNumber', label: t`Documento`, type: 'text', placeholder: '' },
        { key: 'transactionCountry', label: t`País`, type: 'text', placeholder: 'CO' },
        { key: 'companyProductId', label: t`Producto`, type: 'text', placeholder: 'prod-id' },
      ],
    },
    {
      type: 'payout-multisign', labelKey: t`PayOut: Aprobar (multi-firma)`, category: 'soberana',
      descriptionKey: t`Firma múltiple de pagos`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'payOutIds', label: t`IDs (coma separados)`, type: 'text', placeholder: '{{ids}}' },
      ],
    },
    {
      type: 'payout-cancel', labelKey: t`PayOut: Cancelar`, category: 'soberana',
      descriptionKey: t`Cancela un pago saliente`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'payOutId', label: t`ID del PayOut`, type: 'text', placeholder: '{{payout.id}}' },
      ],
    },
    {
      type: 'fdr-validate', labelKey: t`FDR: Validar monto`, category: 'soberana',
      descriptionKey: t`Valida si el monto es válido para el FDR`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'amount', label: t`Monto`, type: 'text', placeholder: '{{amount}}' },
        { key: 'fdrId', label: t`FDR ID`, type: 'text', placeholder: '' },
      ],
    },
    {
      type: 'crossborder-create', labelKey: t`Crossborder: Crear transferencia`, category: 'soberana',
      descriptionKey: t`Crea una transferencia cross-border`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'companyProductId', label: t`Producto`, type: 'text', placeholder: '' },
        { key: 'currencyPairId', label: t`Par de monedas`, type: 'text', placeholder: '' },
        { key: 'amountSender', label: t`Monto`, type: 'text', placeholder: '{{amount}}' },
        { key: 'contactSenderId', label: t`Contacto emisor`, type: 'text', placeholder: '' },
        { key: 'contactReceiverId', label: t`Contacto receptor`, type: 'text', placeholder: '' },
      ],
    },
    {
      type: 'crossborder-update', labelKey: t`Crossborder: Actualizar estado`, category: 'soberana',
      descriptionKey: t`Actualiza el estado de la transferencia`, defaultConfig: { createPayIn: false },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'id', label: t`ID`, type: 'text', placeholder: '{{tx.id}}' },
        { key: 'state', label: t`Estado`, type: 'text', placeholder: 'awaitingFunding' },
      ],
    },

    // ── LOOPAY APP ────────────────────────────────────────
    {
      type: 'lapp-payin-fdr', labelKey: t`PayIn: Crear en FDR público`, category: 'loopayapp',
      descriptionKey: t`Cobro público sin autenticación`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'fdrId', label: t`FDR ID`, type: 'text', placeholder: '' },
        { key: 'amount', label: t`Monto`, type: 'text', placeholder: '{{amount}}' },
        { key: 'currency', label: t`Moneda`, type: 'text', placeholder: 'COP' },
      ],
    },
    {
      type: 'lapp-engine', labelKey: t`PayIn: Procesar con engine`, category: 'loopayapp',
      descriptionKey: t`Procesa un pago con el motor seleccionado`, defaultConfig: { engine: 'kushkiCard' },
      inputs: 1, outputs: 1,
      fields: [
        {
          key: 'engine', label: t`Engine`, type: 'select',
          options: ['kushkiCard', 'kushkiTransfer', 'epayco', 'payphone', 'moviiBreB', 'irisCollection', 'playgreen'],
        },
        { key: 'payload', label: t`Payload (JSON)`, type: 'text', placeholder: '{{payload}}' },
      ],
    },
    {
      type: 'lapp-webhook', labelKey: t`Webhook: Configurar receptor`, category: 'loopayapp',
      descriptionKey: t`Registra un webhook de estado`, defaultConfig: { typeTrasaction: 'PAYIN' },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'companyId', label: t`Company ID`, type: 'text', placeholder: '' },
        { key: 'url', label: t`URL de destino`, type: 'text', placeholder: 'https://...' },
        { key: 'typeTrasaction', label: t`Tipo`, type: 'select', options: ['PAYIN', 'PAYOUT', 'COLLECTION'] },
      ],
    },
    {
      type: 'lapp-paid-methods', labelKey: t`Consultar: Métodos disponibles`, category: 'loopayapp',
      descriptionKey: t`Lista métodos de pago del producto`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'productId', label: t`Product ID`, type: 'text', placeholder: '' },
        { key: 'companyProductId', label: t`Company Product ID`, type: 'text', placeholder: '' },
      ],
    },

    // ── FX / IMC ──────────────────────────────────────────
    {
      type: 'fx-rates-poll', labelKey: t`FX: Consultar tasas (polling)`, category: 'fx',
      descriptionKey: t`Consulta tasas en intervalo`, defaultConfig: { pollingIntervalMs: 5000 },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'clientId', label: t`Client ID`, type: 'text', placeholder: '' },
        { key: 'pollingIntervalMs', label: t`Intervalo (ms)`, type: 'number', placeholder: '5000' },
      ],
    },
    {
      type: 'fx-rates-ws', labelKey: t`FX: Suscribir vía WebSocket`, category: 'fx',
      descriptionKey: t`Stream de tasas en tiempo real`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'clientId', label: t`Client ID`, type: 'text', placeholder: '' },
      ],
    },
    {
      type: 'fx-order', labelKey: t`FX: Crear orden compra/venta`, category: 'fx',
      descriptionKey: t`Crea una orden FX`, defaultConfig: { orderType: 'BUY' },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'clientId', label: t`Client ID`, type: 'text', placeholder: '' },
        { key: 'exchangeRateId', label: t`Rate ID`, type: 'text', placeholder: '{{rate.id}}' },
        { key: 'numeralCode', label: t`Código numeral`, type: 'text', placeholder: '' },
        { key: 'orderType', label: t`Tipo`, type: 'select', options: ['BUY', 'SELL'] },
        { key: 'baseAmount', label: t`Monto base`, type: 'text', placeholder: '{{amount}}' },
      ],
    },
    {
      type: 'fx-balances', labelKey: t`FX: Consultar balances`, category: 'fx',
      descriptionKey: t`Obtiene balances disponibles`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'clientId', label: t`Client ID`, type: 'text', placeholder: '' },
      ],
    },
    {
      type: 'comex-expediente', labelKey: t`COMEX: Iniciar expediente`, category: 'fx',
      descriptionKey: t`Inicia expediente de importación (10 fases)`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'documentData', label: t`Datos (JSON)`, type: 'text', placeholder: '{{data}}' },
      ],
    },

    // ── CONTROL ───────────────────────────────────────────
    {
      type: 'trigger-webhook', labelKey: t`Trigger: Webhook recibido`, category: 'control',
      descriptionKey: t`Inicio del flujo por webhook`, defaultConfig: { method: 'POST' },
      inputs: 0, outputs: 1,
      fields: [
        { key: 'path', label: t`Path`, type: 'text', placeholder: '/mi-webhook' },
        { key: 'method', label: t`Método`, type: 'select', options: ['POST', 'GET'] },
      ],
    },
    {
      type: 'trigger-cron', labelKey: t`Trigger: Programado (cron)`, category: 'control',
      descriptionKey: t`Inicio por expresión cron`, defaultConfig: { expression: '0 9 * * 1' },
      inputs: 0, outputs: 1,
      fields: [
        { key: 'expression', label: t`Expresión cron`, type: 'text', placeholder: '0 9 * * 1' },
      ],
    },
    {
      type: 'condition', labelKey: t`Condición (if/else)`, category: 'control',
      descriptionKey: t`Bifurca el flujo según una condición`, defaultConfig: { operator: '==' },
      inputs: 1, outputs: 2,
      fields: [
        { key: 'field', label: t`Campo`, type: 'text', placeholder: '{{response.state}}' },
        { key: 'operator', label: t`Operador`, type: 'select', options: ['==', '!=', '>', '<', '>=', '<='] },
        { key: 'value', label: t`Valor`, type: 'text', placeholder: 'accepted' },
      ],
    },
    {
      type: 'transform', labelKey: t`Transformar datos`, category: 'control',
      descriptionKey: t`Mapea campos del payload`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'mappings', label: t`Mappings (JSON)`, type: 'text', placeholder: '[{"from":"a","to":"b"}]' },
      ],
    },
    {
      type: 'delay', labelKey: t`Esperar / Delay`, category: 'control',
      descriptionKey: t`Pausa N segundos antes de continuar`, defaultConfig: { seconds: 5 },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'seconds', label: t`Segundos`, type: 'number', placeholder: '5' },
      ],
    },
    {
      type: 'log', labelKey: t`Log / Debug`, category: 'control',
      descriptionKey: t`Imprime el payload en el panel de logs`, defaultConfig: {},
      inputs: 1, outputs: 1,
      fields: [
        { key: 'label', label: t`Etiqueta`, type: 'text', placeholder: 'Debug checkpoint' },
      ],
    },
    {
      type: 'notification', labelKey: t`Notificación`, category: 'control',
      descriptionKey: t`Envía un webhook saliente`, defaultConfig: { method: 'POST' },
      inputs: 1, outputs: 1,
      fields: [
        { key: 'url', label: t`URL destino`, type: 'text', placeholder: 'https://...' },
        { key: 'method', label: t`Método`, type: 'select', options: ['POST', 'GET'] },
        { key: 'bodyTemplate', label: t`Body (JSON template)`, type: 'text', placeholder: '{"status":"{{state}}"}' },
      ],
    },
  ];
}

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  soberana:  'Soberana',
  loopayapp: 'Loopay App',
  fx:        'FX / IMC',
  control:   'Lógica',
};

const CATEGORY_ORDER: NodeCategory[] = ['soberana', 'loopayapp', 'fx', 'control'];

export function NodePalette() {
  const { t } = useLingui();
  const definitions = useNodeDefinitions();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? definitions.filter((d) =>
        d.labelKey.toLowerCase().includes(query.toLowerCase()) ||
        d.type.toLowerCase().includes(query.toLowerCase()),
      )
    : null;

  const grouped = CATEGORY_ORDER.reduce<Record<NodeCategory, NodeDefinition[]>>(
    (acc, cat) => {
      acc[cat] = (filtered ?? definitions).filter((d) => d.category === cat);
      return acc;
    },
    {} as Record<NodeCategory, NodeDefinition[]>,
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, def: NodeDefinition) => {
    e.dataTransfer.setData('nodeType', def.type);
    e.dataTransfer.setData('nodeCategory', def.category);
    e.dataTransfer.setData('nodeLabel', def.labelKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-60 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col flex-shrink-0">
      {/* Search header */}
      <div className="px-3 pt-3 pb-2 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t`Buscar nodo...`}
            className="h-8 w-full rounded-lg border border-border/50 bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-150"
          />
        </div>
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-2">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          const CatIcon = CATEGORY_ICON[cat];

          return (
            <div key={cat}>
              {/* Category header */}
              <div className="flex items-center gap-1.5 pt-4 pb-1.5 px-1">
                <CatIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
                  {CATEGORY_LABELS[cat]}
                </span>
                <div className="flex-1 h-px bg-border/40 ml-1" />
              </div>

              {/* Node chips */}
              {items.map((def) => {
                const NodeIcon = NODE_ICON[def.type] ?? ArrowRight;
                return (
                  <div
                    key={def.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, def)}
                    title={def.descriptionKey}
                    className="relative flex items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-2.5 py-1.5 text-xs cursor-grab select-none hover:bg-muted hover:border-border transition-colors duration-150 group mb-0.5"
                    style={{ borderLeftWidth: '2px', borderLeftColor: CATEGORY_BORDER_COLOR[cat] }}
                  >
                    <NodeIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium text-foreground/80">{def.labelKey}</span>
                    <GripVertical className="h-3 w-3 shrink-0 ml-auto text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors duration-150" />
                  </div>
                );
              })}
            </div>
          );
        })}

        {filtered?.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-muted-foreground/50">{t`Sin resultados`}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { useNodeDefinitions };
export type { NodeDefinition };
