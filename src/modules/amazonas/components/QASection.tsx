/**
 * QASection — Preguntas y respuestas para due diligence.
 * 4 bloques con numeración, categorías, accent borders y primera pregunta abierta por defecto.
 */

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { InteractiveFlowDiagram, type FlowNode } from '@/shared/components/InteractiveFlowDiagram';
import { StaggerChildren } from '@/shared/components/StaggerChildren';
import { AnimateOnScroll } from '@/shared/components/AnimateOnScroll';
import { cn } from '@/shared/lib/utils';

const flowDesembolsosDeuda: FlowNode[] = [
  { icon: '1', label: '$3M', sublabel: '1er desembolso' },
  { icon: '2', label: '$3M', sublabel: '2do desembolso' },
  { icon: '3', label: '$4M', sublabel: '3er desembolso' },
  { icon: '📅', label: 'Trimestral', sublabel: 'Frecuencia' },
];

const flowDesembolsosEquity: FlowNode[] = [
  { icon: '1', label: '$5M', sublabel: '1er desembolso' },
  { icon: '2', label: '$5M', sublabel: '2do desembolso' },
  { icon: '📅', label: 'Semestral', sublabel: 'Frecuencia' },
];

const flowGarantias: FlowNode[] = [
  { icon: '🔐', label: 'Wallets USDT', sublabel: 'Garantía' },
  { icon: '⚡', label: 'Velocidad', sublabel: 'Fortaleza' },
  { icon: '🔑', label: 'Llaves wallets', sublabel: 'Repago' },
];

const flowClientes: FlowNode[] = [
  { icon: '🌎', label: 'Import/Export', sublabel: 'SME y mid-market' },
  { icon: '📦', label: 'Brokers', sublabel: 'Comercio exterior' },
  { icon: '🛒', label: 'Marketplaces B2B', sublabel: 'Pay-in / Pay-out' },
  { icon: '👥', label: 'Nómina / Masivos', sublabel: 'Dispersión + FX' },
  { icon: '🏛️', label: 'Instituciones', sublabel: 'Banca y Fintechs' },
];

type AccentColor = 'primary' | 'accent' | 'success' | 'warning';

const accentBorder: Record<AccentColor, string> = {
  primary: 'border-l-4 border-l-primary',
  accent:  'border-l-4 border-l-accent',
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
};

interface QAItem {
  value: string;
  num: string;
  category: string;
  accent: AccentColor;
  question: string;
  delay: number;
}

const QA_META: QAItem[] = [
  { value: 'desembolsos', num: '01', category: 'Financiamiento', accent: 'primary',  question: '¿Los $10 millones se necesitan de golpe o en tranches? ¿Cuánto sería un primer desembolso adecuado y con qué frecuencia los demás?', delay: 0.05 },
  { value: 'garantias',   num: '02', category: 'Garantías',      accent: 'accent',   question: '¿Aparte de las acciones de la LLC en USA, qué otra garantía podrían poner? ¿Qué % del flujo futuro en encargo fiduciario?',        delay: 0.1  },
  { value: 'proyeccion',  num: '03', category: 'Proyección',     accent: 'success',  question: '¿Con esta inyección, en qué % y volumen $ aumentarían su revenue anual y sus profits?',                                              delay: 0.15 },
  { value: 'clientes',    num: '04', category: 'Pipeline',       accent: 'warning',  question: '¿Con qué tipo de clientes o pipeline sostienen el flujo futuro para repagar el préstamo o inversión?',                               delay: 0.2  },
];

export function QASection() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Preguntas y Respuestas</h1>
        <p className="text-muted-foreground">
          Respuestas claras para el due diligence. Contenido prioritario para la decisión de inversión.
        </p>
      </motion.div>

      <Accordion type="single" collapsible defaultValue="desembolsos" className="space-y-4">

        {/* 1. Los $10M — tranches, desembolsos, frecuencia */}
        <AnimateOnScroll direction="up" delay={QA_META[0].delay}>
          <Card className={cn('rounded-xl border border-border/50 overflow-hidden', accentBorder[QA_META[0].accent])}>
            <AccordionItem value="desembolsos" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{QA_META[0].num}</Badge>
                  <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">{QA_META[0].category}</Badge>
                  <span className="font-heading font-semibold text-foreground text-left">{QA_META[0].question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground space-y-6">
                <div>
                  <p className="font-semibold text-foreground mb-3">Deuda</p>
                  <InteractiveFlowDiagram nodes={flowDesembolsosDeuda} className="mb-4" />
                  <StaggerChildren staggerDelay={0.08} className="space-y-1">
                    <p className="text-sm">1er desembolso: $3M · 2do: $3M · 3er: $4M · Frecuencia: trimestral</p>
                  </StaggerChildren>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-3">Equity</p>
                  <InteractiveFlowDiagram nodes={flowDesembolsosEquity} className="mb-4" />
                  <StaggerChildren staggerDelay={0.08} className="space-y-1">
                    <p className="text-sm">1er desembolso: $5M · 2do: $5M · Frecuencia: semestral</p>
                  </StaggerChildren>
                </div>
                <motion.p
                  className="text-foreground font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  * NEGOCIABLE
                </motion.p>
              </AccordionContent>
            </AccordionItem>
          </Card>
        </AnimateOnScroll>

        {/* 2. Garantías */}
        <AnimateOnScroll direction="up" delay={QA_META[1].delay}>
          <Card className={cn('rounded-xl border border-border/50 overflow-hidden', accentBorder[QA_META[1].accent])}>
            <AccordionItem value="garantias" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{QA_META[1].num}</Badge>
                  <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">{QA_META[1].category}</Badge>
                  <span className="font-heading font-semibold text-foreground text-left">{QA_META[1].question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground space-y-4">
                <InteractiveFlowDiagram nodes={flowGarantias} className="mb-4" />
                <StaggerChildren staggerDelay={0.1} className="space-y-2">
                  <p className="text-sm">Podríamos colocar nuestras wallets en USDT como garantía.</p>
                  <p className="text-sm">El encargo fiduciario es un limitante por tiempos transaccionales; nuestra fortaleza es la velocidad.</p>
                  <p className="text-sm">Podríamos entregar las llaves de nuestras wallets como garantía de repago: acceso y manejo de las billeteras y cuentas.</p>
                </StaggerChildren>
              </AccordionContent>
            </AccordionItem>
          </Card>
        </AnimateOnScroll>

        {/* 3. Proyección revenue y profits */}
        <AnimateOnScroll direction="up" delay={QA_META[2].delay}>
          <Card className={cn('rounded-xl border border-border/50 overflow-hidden', accentBorder[QA_META[2].accent])}>
            <AccordionItem value="proyeccion" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{QA_META[2].num}</Badge>
                  <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">{QA_META[2].category}</Badge>
                  <span className="font-heading font-semibold text-foreground text-left">{QA_META[2].question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground space-y-4">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.12 } },
                  }}
                >
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    className="rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <p className="text-2xl font-bold text-foreground font-mono tabular-nums">10x</p>
                    <p className="text-sm text-foreground">De $1B/año a $12B/año en 5 años</p>
                  </motion.div>
                  <motion.div
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                    className="rounded-xl border border-border bg-card/50 p-4"
                  >
                    <p className="text-2xl font-bold text-foreground font-mono tabular-nums">$100M – $200M</p>
                    <p className="text-sm text-muted-foreground">Objetivo siguiente ronda con estos $10M</p>
                  </motion.div>
                </motion.div>
                <StaggerChildren staggerDelay={0.08}>
                  <p className="text-sm">Proyección: aumentar en <strong className="text-foreground">10x</strong>. Con estos $10M se busca ir a una nueva ronda de <strong className="text-foreground">$100M a $200M</strong>.</p>
                </StaggerChildren>
              </AccordionContent>
            </AccordionItem>
          </Card>
        </AnimateOnScroll>

        {/* 4. Tipo de clientes y pipeline para repago */}
        <AnimateOnScroll direction="up" delay={QA_META[3].delay}>
          <Card className={cn('rounded-xl border border-border/50 overflow-hidden', accentBorder[QA_META[3].accent])}>
            <AccordionItem value="clientes" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{QA_META[3].num}</Badge>
                  <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">{QA_META[3].category}</Badge>
                  <span className="font-heading font-semibold text-foreground text-left">{QA_META[3].question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground space-y-4">
                <p className="font-semibold text-foreground">Clientes objetivo</p>
                <InteractiveFlowDiagram nodes={flowClientes} className="mb-4" />
                <StaggerChildren staggerDelay={0.08} className="space-y-1 text-sm">
                  <p>Importadores/exportadores (SME y mid-market) con pagos recurrentes a proveedores (LatAm ↔ Asia/US).</p>
                  <p>Brokers de comercio exterior / sourcing que administran pagos de muchos compradores.</p>
                  <p>Marketplaces y plataformas B2B con pay-in + pay-out recurrente.</p>
                  <p>Empresas con nómina/masivos (dispersión) + FX.</p>
                  <p>Instituciones financieras tradicionales y Fintechs.</p>
                </StaggerChildren>
              </AccordionContent>
            </AccordionItem>
          </Card>
        </AnimateOnScroll>

      </Accordion>
    </div>
  );
}
