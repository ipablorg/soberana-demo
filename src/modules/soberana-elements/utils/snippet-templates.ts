import type { WidgetConfig } from '../types';
import { getElementsCdnUrl, getElementsSriHash, SDK_VERSION } from './sri-utils';

const COMPONENT_MAP: Record<string, string> = {
  'payment-button': 'PaymentButton',
  'kyc-module': 'KycModule',
  'wallet-dashboard': 'WalletDashboard',
  'invoice-payment': 'InvoicePayment',
};

const WC_TAG_MAP: Record<string, string> = {
  'payment-button': 'soberana-pay-button',
  'kyc-module': 'soberana-kyc-module',
  'wallet-dashboard': 'soberana-wallet-dashboard',
  'invoice-payment': 'soberana-invoice-payment',
};

const HEADLESS_HOOK_MAP: Record<string, string> = {
  'payment-button': 'usePayment',
  'kyc-module': 'useKyc',
  'wallet-dashboard': 'useWallet',
  'invoice-payment': 'useInvoice',
};

const HEADLESS_DESTRUCTURE_MAP: Record<string, string> = {
  'payment-button': '{ state, selectRail, confirm, cancel, availableRails }',
  'kyc-module': '{ step, startKyc, uploadDocument, complete, status }',
  'wallet-dashboard': '{ balance, transactions, withdraw, deposit, isLoading }',
  'invoice-payment': '{ invoice, confirm, retentionResult, isLoading }',
};

// ─── Widget snippets ───────────────────────────────────────────────────────────

export function reactSnippet(config: WidgetConfig): string {
  const component = COMPONENT_MAP[config.type] ?? 'Widget';
  return `import { SoberanaElements } from '@soberana/elements-react'; // v${SDK_VERSION}

export function MyComponent() {
  return (
    <SoberanaElements.${component}
      widgetId="${config.id}"
      onEvent={(e) => console.log('[Soberana]', e.type, e.payload)}
    />
  );
}`;
}

export function vueSnippet(config: WidgetConfig): string {
  const component = COMPONENT_MAP[config.type] ?? 'Widget';
  const kebab = config.type;
  return `<script setup lang="ts">
import { SoberanaElements } from '@soberana/elements-vue' // v${SDK_VERSION}

const { ${component} } = SoberanaElements

function onEvent(e: unknown) {
  console.log('[Soberana]', e)
}
</script>

<template>
  <${component}
    widget-id="${config.id}"
    @event="onEvent"
  />
</template>

<!-- Install: npm install @soberana/elements-vue  (widget: ${kebab}) -->`;
}

export function vanillaSnippet(config: WidgetConfig, sriHash?: string): string {
  const hash = sriHash ?? getElementsSriHash();
  const cdnUrl = getElementsCdnUrl();
  return `<!-- 1. Cargar el SDK -->
<script
  src="${cdnUrl || 'https://cdn.soberana.io/elements/v1/elements.min.js'}"
  integrity="${hash}"
  crossorigin="anonymous"
  defer>
</script>

<!-- 2. Colocar el widget donde lo necesites -->
<div
  data-soberana-widget="${config.type}"
  data-widget-id="${config.id}">
</div>

<!-- 3. Escuchar eventos -->
<script>
  document.addEventListener('soberana:payment:success', function(e) {
    console.log('[Soberana] Pago exitoso:', e.detail);
  });

  document.addEventListener('soberana:widget:ready', function(e) {
    console.log('[Soberana] Widget listo:', e.detail.widgetId);
  });
</script>

<!-- Nota: requiere HTTPS para SRI. Ver docs.soberana.io/elements -->`;
}

export function webComponentSnippet(config: WidgetConfig, sriHash?: string): string {
  const tag = WC_TAG_MAP[config.type] ?? 'soberana-widget';
  const hash = sriHash ?? getElementsSriHash();
  const cdnUrl = getElementsCdnUrl();
  return `<!-- 1. Registrar los Web Components -->
<script
  type="module"
  src="${cdnUrl || 'https://cdn.soberana.io/elements/v1/elements.min.js'}"
  integrity="${hash}"
  crossorigin="anonymous">
</script>

<!-- 2. Usar el Custom Element directamente -->
<${tag}
  widget-id="${config.id}">
</${tag}>

<!-- 3. Escuchar eventos nativos del DOM -->
<script type="module">
  const widget = document.querySelector('${tag}');

  widget.addEventListener('payment:success', (e) => {
    console.log('[Soberana]', e.detail);
  });
</script>

<!-- Compatible con Shadow DOM. El CSS del host "chorrea" para fuentes y colores. -->`;
}

// ─── Headless snippets ─────────────────────────────────────────────────────────

export function reactHeadlessSnippet(config: WidgetConfig): string {
  const hook = HEADLESS_HOOK_MAP[config.type] ?? 'usePayment';
  const destructure = HEADLESS_DESTRUCTURE_MAP[config.type] ?? '{ state }';
  const component = COMPONENT_MAP[config.type] ?? 'Widget';
  return `import { ${hook} } from '@soberana/elements-react/headless'; // v${SDK_VERSION}

function My${component}() {
  const ${destructure} = ${hook}({
    widgetId: '${config.id}',
  });

  // Render with YOUR design system — zero styles from Soberana
  return (
    <YourButton onClick={confirm}>
      {state === 'processing' ? 'Procesando...' : 'Pagar'}
    </YourButton>
  );
}`;
}

export function vueHeadlessSnippet(config: WidgetConfig): string {
  const hook = HEADLESS_HOOK_MAP[config.type] ?? 'usePayment';
  const rawDestructure = HEADLESS_DESTRUCTURE_MAP[config.type] ?? '{ state }';
  // Convert to ref-based for Vue composable
  const fields = rawDestructure.replace(/[{}]/g, '').split(',').map(s => s.trim());
  const refs = fields.map(f => `const ${f} = ref()`).join('\n');
  return `<script setup lang="ts">
import { ${hook} } from '@soberana/elements-vue/headless' // v${SDK_VERSION}
import { ref } from 'vue'

${refs}

const sdk = ${hook}({ widgetId: '${config.id}' })

// Sync reactive refs
watch(sdk, (val) => {
  ${fields.map(f => `${f}.value = val.${f}`).join('\n  ')}
}, { immediate: true })
</script>

<template>
  <!-- Render with YOUR design system — zero styles from Soberana -->
  <YourButton @click="sdk.confirm">
    {{ sdk.state === 'processing' ? 'Procesando...' : 'Pagar' }}
  </YourButton>
</template>

<!-- Install: npm install @soberana/elements-vue  (headless mode) -->`;
}

export function vanillaHeadlessSnippet(config: WidgetConfig): string {
  const hook = HEADLESS_HOOK_MAP[config.type] ?? 'usePayment';
  return `// Install: npm install @soberana/elements-js // v${SDK_VERSION}
import { ${hook} } from '@soberana/elements-js/headless';

class MyCheckout extends EventTarget {
  constructor() {
    super();
    this.sdk = ${hook}({ widgetId: '${config.id}' });

    // Subscribe to SDK state changes
    this.sdk.on('stateChange', (state) => {
      this.dispatchEvent(new CustomEvent('soberana:state', { detail: state }));
    });
  }

  async confirm() {
    const result = await this.sdk.confirm();
    this.dispatchEvent(new CustomEvent('soberana:confirmed', { detail: result }));
  }

  cancel() {
    this.sdk.cancel();
  }
}

// Usage
const checkout = new MyCheckout();
checkout.addEventListener('soberana:state', (e) => {
  document.querySelector('#my-btn').textContent =
    e.detail.state === 'processing' ? 'Procesando...' : 'Pagar';
});`;
}

export function nodeWebhookSnippet(config: WidgetConfig): string {
  return `// Express / Fastify — verify Soberana webhook signature
// Install: npm install @soberana/elements-node // v${SDK_VERSION}
import { verifyWebhookSignature } from '@soberana/elements-node';

// Express example
app.post('/webhooks/soberana', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-soberana-signature'];

  const isValid = verifyWebhookSignature({
    payload: req.body,           // raw Buffer
    signature,
    secret: process.env.SOBERANA_WEBHOOK_SECRET,
  });

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body.toString());

  switch (event.event_type) {
    case 'payment:success':
      // event.data.txHash, event.data.amount, event.data.currency
      console.log('Payment succeeded:', event.data);
      break;
    case 'compliance:rule_triggered':
      // event.data.ruleId, event.data.action
      console.log('Compliance rule triggered:', event.data);
      break;
    // Widget ID: ${config.id}
    default:
      break;
  }

  res.json({ received: true });
});`;
}
