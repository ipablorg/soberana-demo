import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Shield, Zap, Link, Lock, FileCode, Webhook, CheckCircle } from '@/shared/components/animated-icons';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-3"
    >
      <h2 className="font-heading font-semibold text-foreground text-lg">{title}</h2>
      {children}
    </motion.div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="rounded-lg bg-muted p-4 overflow-x-auto text-xs font-mono leading-relaxed text-foreground whitespace-pre">
      <code>{code}</code>
    </pre>
  );
}

export function IntegrationDocs() {
  return (
    <div className="max-w-3xl flex flex-col gap-10">
      {/* Header */}
      <div>
        <Badge variant="secondary" className="mb-3"><Trans>v1.0.0</Trans></Badge>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          <Trans>Guía de integración</Trans>
        </h1>
        <p className="text-muted-foreground mt-2">
          <Trans>Integra Soberana Elements en tu app en menos de 5 minutos. Sin servidores adicionales.</Trans>
        </p>
      </div>

      <Separator />

      <Section title="Instalación rápida (React)">
        <p className="text-sm text-muted-foreground">
          <Trans>Instala el paquete oficial:</Trans>
        </p>
        <CodeBlock code="npm install @soberana/elements-react" />
        <p className="text-sm text-muted-foreground">
          <Trans>Usa el componente directamente:</Trans>
        </p>
        <CodeBlock code={`import { SoberanaElements } from '@soberana/elements-react';

export function Checkout() {
  return (
    <SoberanaElements.PaymentButton
      widgetId="wgt_abc123"
      onEvent={(e) => {
        if (e.type === 'payment:success') {
          console.log('Pagado:', e.payload.txHash);
        }
      }}
    />
  );
}`} />
      </Section>

      <Separator />

      <Section title="Vanilla JS / CDN">
        <p className="text-sm text-muted-foreground">
          <Trans>Agrega el script y el elemento HTML:</Trans>
        </p>
        <CodeBlock code={`<script
  src="https://cdn.soberana.io/elements/v1/elements.min.js"
  integrity="sha256-K7gNU3sdo+OL0wNhqoVWhr..."
  crossorigin="anonymous"
  defer>
</script>

<div
  data-soberana-widget="payment-button"
  data-widget-id="wgt_abc123">
</div>

<script>
  document.addEventListener('soberana:payment:success', (e) => {
    console.log('[Soberana]', e.detail);
  });
</script>`} />
      </Section>

      <Separator />

      <Section title="Seguridad (SRI + CSP)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              Icon: Shield,
              title: 'Subresource Integrity',
              desc: 'El atributo integrity garantiza que el script no sea alterado en tránsito. Siempre incluirlo en etiquetas <script src>.',
            },
            {
              Icon: Lock,
              title: 'Content Security Policy',
              desc: 'Agrega cdn.soberana.io a tu política CSP: script-src cdn.soberana.io; frame-ancestors \'self\' *.tudominio.com',
            },
            {
              Icon: Link,
              title: 'Allowed Origins',
              desc: 'En el Studio, configura los dominios autorizados para embeber el widget. Peticiones desde otros orígenes son rechazadas.',
            },
            {
              Icon: Zap,
              title: 'HTTPS obligatorio',
              desc: 'SRI y la API Web Crypto (para deep links) requieren un contexto seguro. Usa HTTPS en producción.',
            },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-foreground text-sm">{title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title="Deep Linking (Invoice-to-Payment)">
        <p className="text-sm text-muted-foreground">
          <Trans>Precarga el widget con datos de tu ERP mediante un payload cifrado:</Trans>
        </p>
        <CodeBlock code={`// En tu backend (Node.js)
const payload = { invoice_id: 'INV-001', amount: 1500, currency: 'USD' };
const encoded = await soberana.deepLink.encode(payload, process.env.WIDGET_SECRET);
const url = \`https://cdn.soberana.io/embed/wgt_abc123?p=\${encoded}\`;

// En tu frontend — el widget decodifica automáticamente
<SoberanaElements.InvoicePayment
  widgetId="wgt_abc123"
  deepLinkPayload={encodedParam}  // desde URL query param
  onEvent={(e) => console.log(e)}
/>`} />
      </Section>

      <Separator />

      <Section title="Eventos disponibles">
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Evento</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Widget</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { event: 'payment:success', widget: 'payment-button', payload: '{ txHash, amount, currency }' },
                { event: 'payment:failed', widget: 'payment-button', payload: '{ code, message }' },
                { event: 'kyc:completed', widget: 'kyc-module', payload: '{ kycId, status }' },
                { event: 'wallet:loaded', widget: 'wallet-dashboard', payload: '{ balance, currency }' },
                { event: 'invoice:paid', widget: 'invoice-payment', payload: '{ invoiceId, txHash, netAmount }' },
                { event: 'retention:calculated', widget: 'invoice-payment', payload: '{ gross, retention, net, rate }' },
                { event: 'deeplink:decoded', widget: 'invoice-payment', payload: '{ invoiceId, amount, currency }' },
              ].map(row => (
                <tr key={row.event} className="hover:bg-muted/20 transition-colors duration-150">
                  <td className="px-4 py-2.5 font-mono text-xs text-foreground">{row.event}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="text-xs">{row.widget}</Badge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.payload}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Separator />

      <Section title="Headless SDK — Toda la lógica, cero estilos">
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              <Trans>Tu DOM. Tus estilos. La lógica de Soberana.</Trans>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <Trans>El SDK Headless expone hooks puros con toda la lógica de negocio (compliance, rieles, webhooks) sin inyectar ningún estilo. Tú controlas el 100% del renderizado con tu propio design system.</Trans>
          </p>
        </div>

        {/* Widget vs Headless comparison */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Característica</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Widget</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase">Headless</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { feat: 'Integración', widget: 'Copiar & pegar', headless: 'npm install + hook' },
                { feat: 'Estilos', widget: 'Shadow DOM aislado', headless: 'Tu design system' },
                { feat: 'Personalización', widget: 'Tokens de branding', headless: 'Ilimitada' },
                { feat: 'Compliance rules', widget: 'Configurable', headless: 'Configurable + evaluación cliente' },
                { feat: 'Webhooks', widget: 'Lado servidor', headless: 'Lado servidor + SDK events' },
                { feat: 'Bundle size', widget: 'CDN externo', headless: '~12 KB gzip' },
              ].map(row => (
                <tr key={row.feat} className="hover:bg-muted/20 transition-colors duration-150">
                  <td className="px-4 py-2.5 text-xs font-medium text-foreground">{row.feat}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.widget}</td>
                  <td className="px-4 py-2.5 text-xs text-foreground font-medium">{row.headless}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm font-medium text-foreground"><Trans>React — usePayment hook</Trans></p>
        <CodeBlock code={`import { usePayment } from '@soberana/elements-react/headless';

export function CustomCheckout() {
  const {
    state,          // 'idle' | 'selecting' | 'processing' | 'success' | 'failed'
    availableRails, // PaymentRail[]
    selectedRail,   // string | null
    txHash,         // string | null (populated on success)
    selectRail,     // (railId: string) => void
    confirm,        // () => void
    cancel,         // () => void
  } = usePayment({
    widgetId: 'wgt_abc123',
    onEvent: (e) => {
      if (e.type === 'payment:success') analytics.track('checkout', e.payload);
    },
  });

  if (state === 'success') return <SuccessScreen txHash={txHash} />;

  return (
    <div className="my-checkout">
      {availableRails.map(rail => (
        <button
          key={rail.id}
          className={selectedRail === rail.id ? 'active' : ''}
          onClick={() => selectRail(rail.id)}
        >
          {rail.label}
        </button>
      ))}
      <button onClick={confirm} disabled={!selectedRail}>Pagar</button>
    </div>
  );
}`} />

        <p className="text-sm font-medium text-foreground"><Trans>Vue 3 — usePayment composable</Trans></p>
        <CodeBlock code={`<script setup>
import { usePayment } from '@soberana/elements-vue/headless';

const { state, availableRails, selectedRail, txHash, selectRail, confirm, cancel } =
  usePayment({
    widgetId: 'wgt_abc123',
    onEvent: (e) => console.log('[soberana]', e),
  });
</script>

<template>
  <div class="my-checkout">
    <button
      v-for="rail in availableRails"
      :key="rail.id"
      :class="{ active: selectedRail === rail.id }"
      @click="selectRail(rail.id)"
    >
      {{ rail.label }}
    </button>
    <button @click="confirm" :disabled="!selectedRail">Pagar</button>
    <p v-if="state === 'success'">TX: {{ txHash }}</p>
  </div>
</template>`} />
      </Section>

      <Separator />

      <Section title="Compliance Rules (Headless)">
        <p className="text-sm text-muted-foreground">
          <Trans>Las reglas de compliance se evalúan en el cliente antes de iniciar cualquier transacción. El SDK bloquea o adapta el flujo según el resultado.</Trans>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'amount_gt', desc: 'Aplica cuando el monto supera un umbral. Ejemplo: exigir biometría > $5,000.' },
            { label: 'amount_lt', desc: 'Aplica cuando el monto es menor a un umbral. Ejemplo: fast-flow para micropagos < $50.' },
            { label: 'country_is', desc: 'Aplica para países específicos. Ejemplo: bloquear y escalar para jurisdicciones restringidas.' },
            { label: 'risk_level_is', desc: 'Aplica según el score de riesgo del usuario. Ejemplo: requerir documento para riesgo "high".' },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1.5">
              <p className="font-mono text-xs font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <CodeBlock code={`// Configuración en el Widget Studio → paso "SDK Config"
// También se puede pasar directamente al hook:
const { state } = usePayment({
  widgetId: 'wgt_abc123',
  complianceRules: [
    { id: 'r1', condition: 'amount_gt', value: 5000, action: 'require_biometric' },
    { id: 'r2', condition: 'country_is', value: 'VE',  action: 'block_and_escalate' },
    { id: 'r3', condition: 'amount_lt', value: 50,    action: 'allow_fast_flow' },
  ],
});`} />
      </Section>

      <Separator />

      <Section title="Webhooks (Headless)">
        <div className="flex items-center gap-2 mb-1">
          <Webhook className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <Trans>Soberana envía un POST firmado con HMAC-SHA256 a tu endpoint tras cada evento. Verifica la firma antes de procesar el payload.</Trans>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {['payment:success', 'payment:failed', 'kyc:completed', 'invoice:paid',
            'compliance:rule_triggered', 'compliance:escalation_required', 'treasury:threshold_alert'].map(ev => (
            <Badge key={ev} variant="outline" className="text-xs font-mono">{ev}</Badge>
          ))}
        </div>
        <CodeBlock code={`// Verificación de firma — Node.js / Express
import crypto from 'crypto';

app.post('/webhooks/soberana', (req, res) => {
  const sig  = req.headers['x-soberana-signature'];
  const body = JSON.stringify(req.body);
  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return res.status(401).send('Invalid signature');
  }

  const { event_type, data } = req.body;
  if (event_type === 'payment:success') {
    await db.orders.update({ txHash: data.tx_hash, status: 'paid' });
  }

  res.sendStatus(200);
});`} />
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <Trans>Los webhooks con formato ISO 20022 incluyen un campo <span className="font-mono text-foreground">iso20022_ref</span> compatible con mensajes pacs.008 / camt.054 para integración directa con bancos.</Trans>
          </p>
        </div>
      </Section>

      <Separator />

      <Section title="Compatibilidad">
        <div className="flex flex-wrap gap-2">
          {['React 18+', 'Vue 3+', 'Angular 17+', 'Vanilla JS', 'Web Components', 'Shopify', 'Odoo'].map(fw => (
            <Badge key={fw} variant="secondary">{fw}</Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          <Trans>Shadow DOM asegura que el CSS del widget no interfiera con el host. Los Web Components permiten que fuentes y colores del host &quot;chorreen&quot; hacia adentro.</Trans>
        </p>
      </Section>
    </div>
  );
}
