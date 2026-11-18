/**
 * Amazonas + Soberana - Partnership page for Banco Amazonas
 * Hero (con FOMO), mapa de integración, 4 flujos interactivos, roadmap, Sovy/Vaults, escalabilidad, CTA agendar cita.
 */

import { motion } from 'framer-motion';
import { ArrowRight, Handshake, MessageCircle, LayoutDashboard } from '@/shared/components/animated-icons';
import { Link } from 'react-router-dom';
import { DocSection } from '../components';
import { Card } from '@/shared/components/ui/card';
import { InteractiveFlowDiagram } from '../components/InteractiveFlowDiagram';
import { StateTimeline } from '../components/sovy/StateTimeline';
import { useAmazonasSoberanaContent } from '../hooks/useAmazonasSoberanaContent';
import { LOOPAY_CONTACTS_AMAZONAS } from '../content/loopay-contacts';
import type { FlowNode } from '../components/InteractiveFlowDiagram';
import type { TimelineState } from '../components/sovy/StateTimeline';
import LogoAmazonas from '@/shared/assets/Logos-clientes/amazonas.png';

export default function AmazonasSoberanaPage() {
  const c = useAmazonasSoberanaContent();

  const flow1Nodes: FlowNode[] = [
    { icon: '🏦', label: 'Core Bancario', sublabel: 'Banco Amazonas' },
    { icon: '🔌', label: 'API Gateway', sublabel: 'Capa de integración' },
    { icon: '⚡', label: 'Soberana', sublabel: 'Zentinel + Vaults' },
    { icon: '📈', label: 'DeFi / Mercados', sublabel: 'Stablecoins, RWA' },
  ];

  const flow2Nodes: FlowNode[] = [
    { icon: '👤', label: 'Cliente solicita inversión', sublabel: '' },
    { icon: '✓', label: 'KYC (Bridge)', sublabel: 'Verificación' },
    { icon: '💵', label: 'Depósito USDC', sublabel: '' },
    { icon: '📦', label: 'Vault acredita shares', sublabel: '' },
    { icon: '📊', label: 'Yield automático', sublabel: '' },
  ];

  const flow2States: TimelineState[] = [
    { label: 'Pendiente', status: 'completed' },
    { label: 'Confirmado', status: 'completed' },
    { label: 'Acreditado', status: 'active' },
    { label: 'Yield', status: 'pending' },
  ];

  const flow3Nodes: FlowNode[] = [
    { icon: '💬', label: 'Chat', sublabel: 'Lenguaje natural' },
    { icon: '🧠', label: 'Agent Orchestrator', sublabel: 'Zentinel' },
    { icon: '🔧', label: 'Tools', sublabel: 'Liquidez, FX, reportes' },
    { icon: '📡', label: 'Data Sources', sublabel: 'APIs core' },
    { icon: '✅', label: 'Responde + sugiere', sublabel: 'Datos reales' },
  ];

  const flow4Nodes: FlowNode[] = [
    {
      icon: '🔍',
      label: c.roadmap.phase0.title,
      sublabel: c.roadmap.phase0.deliverables.slice(0, 3).join(' · '),
    },
    {
      icon: '🔌',
      label: c.roadmap.phase1.title,
      sublabel: c.roadmap.phase1.deliverables.slice(0, 3).join(' · '),
    },
    {
      icon: '🏦',
      label: c.roadmap.phase2.title,
      sublabel: c.roadmap.phase2.deliverables.slice(0, 3).join(' · '),
    },
    {
      icon: '🚀',
      label: c.roadmap.phase3.title,
      sublabel: c.roadmap.phase3.deliverables.slice(0, 3).join(' · '),
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section id="hero" className="scroll-mt-20 rounded-xl bg-linear-to-b from-primary/10 via-background to-background p-8 md:p-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <img src={LogoAmazonas} alt="Banco Amazonas" className="h-12 w-auto object-contain" />
            <span className="text-muted-foreground/60 text-2xl">+</span>
            <span className="text-foreground font-heading font-bold text-xl">Soberana</span>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {c.hero.title}
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground font-medium mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {c.hero.subtitle}
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground/80 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {c.hero.tagline}
          </motion.p>
          <motion.p
            className="text-base font-semibold text-primary/90"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {c.hero.fomo}
          </motion.p>
        </div>
      </section>

      {/* Integration map */}
      <DocSection title={c.integrationMap.title} sectionId="integration-map" level={2}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Card className="flex-1 min-w-0 max-w-xs rounded-xl p-6 text-center border border-border/50">
            <span className="font-heading font-semibold text-foreground">{c.integrationMap.core}</span>
          </Card>
          <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0 hidden sm:block" />
          <Card className="flex-1 min-w-0 max-w-xs rounded-xl p-6 text-center border border-primary/30">
            <span className="font-heading font-semibold text-foreground">{c.integrationMap.layer}</span>
          </Card>
          <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0 hidden sm:block" />
          <Card className="flex-1 min-w-0 max-w-xs rounded-xl p-6 text-center border border-primary/50 bg-primary/5">
            <span className="font-heading font-semibold text-primary">{c.integrationMap.soberana}</span>
          </Card>
        </div>
      </DocSection>

      {/* Flujo 1 — Core ↔ Soberana */}
      <DocSection title={c.flows.flow1Title} sectionId="flow-core-soberana" level={2}>
        <p className="text-muted-foreground text-sm mb-4">
          Core Bancario (Banco Amazonas) → API Gateway → Soberana (Zentinel + Vaults) → DeFi / Mercados. Flujo de datos e integración.
        </p>
        <InteractiveFlowDiagram nodes={flow1Nodes} />
      </DocSection>

      {/* Flujo 2 — Inversión en Vaults */}
      <DocSection title={c.flows.flow2Title} sectionId="flow-vaults" level={2}>
        <p className="text-muted-foreground text-sm mb-4">
          Cliente solicita inversión → KYC (Bridge) → Depósito USDC → Vault acredita shares → Yield automático. Estados: pendiente, confirmado, acreditado.
        </p>
        <InteractiveFlowDiagram nodes={flow2Nodes} className="mb-6" />
        <div className="mt-6">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Estados del flujo</p>
          <StateTimeline states={flow2States} />
        </div>
      </DocSection>

      {/* Flujo 3 — Sovy en acción */}
      <DocSection title={c.flows.flow3Title} sectionId="flow-sovy" level={2}>
        <p className="text-muted-foreground text-sm mb-4">
          Usuario pregunta en lenguaje natural → Zentinel consulta APIs (liquidez, cash flow, FX) → Responde con datos reales → Sugiere acciones.
        </p>
        <InteractiveFlowDiagram nodes={flow3Nodes} />
      </DocSection>

      {/* Flujo 4 — Roadmap visual */}
      <DocSection title={c.flows.flow4Title} sectionId="flow-roadmap-visual" level={2}>
        <p className="text-muted-foreground text-sm mb-4">
          Las 4 fases del roadmap como pasos secuenciales. Cada fase con entregables clave.
        </p>
        <InteractiveFlowDiagram nodes={flow4Nodes} />
      </DocSection>

      {/* Roadmap cards (detalle) */}
      <DocSection title={c.roadmap.title} sectionId="roadmap" level={2}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { key: 'phase0', ...c.roadmap.phase0 },
            { key: 'phase1', ...c.roadmap.phase1 },
            { key: 'phase2', ...c.roadmap.phase2 },
            { key: 'phase3', ...c.roadmap.phase3 },
          ].map((phase, i) => (
            <motion.div
              key={phase.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.3 }}
            >
              <Card className="rounded-xl p-5 border border-border/50">
                <h3 className="font-heading font-semibold text-foreground mb-1">{phase.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{phase.desc}</p>
                <ul className="text-xs text-muted-foreground/90 space-y-0.5">
                  {phase.deliverables.map((d, j) => (
                    <li key={j}>· {d}</li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </DocSection>

      {/* Sovy integration */}
      <DocSection title={c.sovy.title} sectionId="sovy-integration" level={2}>
        <p className="text-muted-foreground leading-relaxed">{c.sovy.body}</p>
      </DocSection>

      {/* Vaults integration */}
      <DocSection title={c.vaults.title} sectionId="vaults-integration" level={2}>
        <p className="text-muted-foreground leading-relaxed">{c.vaults.body}</p>
      </DocSection>

      {/* Scalability */}
      <DocSection title={c.scalability.title} sectionId="scalability" level={2}>
        <p className="text-muted-foreground leading-relaxed">{c.scalability.body}</p>
      </DocSection>

      {/* Acceso al Dashboard Due Diligence */}
      <DocSection title="Informe y dashboard" sectionId="dashboard-due-diligence" level={2}>
        <p className="text-muted-foreground text-sm mb-4">
          Accede al dashboard de due diligence con Q&A, transacciones, flujos y estados financieros.
        </p>
        <Link to="/amazonas">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-xl p-6 border border-primary/30 hover:border-primary/50 bg-card/80 hover:bg-primary/5 transition-colors duration-150 flex items-center gap-4 group cursor-pointer">
              <div className="rounded-xl bg-primary/15 p-3 group-hover:bg-primary/25 transition-colors">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-foreground">Acceder al Dashboard de Due Diligence</h3>
                <p className="text-sm text-muted-foreground">Ver informe completo — Q&A, transacciones, descargas</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Card>
          </motion.div>
        </Link>
      </DocSection>

      {/* CTA — Agendar cita con fundadores vía WhatsApp */}
      <section id="contact" className="scroll-mt-20">
        <Card className="rounded-xl p-8 md:p-12 border border-primary/20 bg-primary/5">
          <div className="text-center mb-8">
            <Handshake className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading font-bold text-2xl text-foreground mb-2">{c.contact.title}</h2>
            <p className="text-muted-foreground">{c.contact.sub}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {LOOPAY_CONTACTS_AMAZONAS.map((contact, i) => (
              <motion.a
                key={contact.phoneE164}
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.25 }}
                className="flex flex-col items-center rounded-xl border border-border/50 bg-card/80 p-6 hover:border-primary/40 hover:bg-primary/5 transition-colors duration-150 group"
              >
                <div className="rounded-full bg-primary/15 p-3 mb-3 group-hover:bg-primary/25 transition-colors">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <span className="font-heading font-semibold text-foreground text-center mb-1">
                  {contact.name}
                </span>
                <span className="text-sm text-muted-foreground">{c.contact.chatWhatsApp}</span>
              </motion.a>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
