import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, Check } from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { DocSection } from '../components';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { InteractiveFlowDiagram } from '../components/InteractiveFlowDiagram';
import { CrossNavigation } from '../components/CrossNavigation';
import { ConversationExample } from '../components/sovy/ConversationExample';
import { AnnotatedScreenshot } from '../components/sovy/AnnotatedScreenshot';
import { ToolCard } from '../components/sovy/ToolCard';
import { StateTimeline } from '../components/sovy/StateTimeline';
import { useSovyContent } from '../hooks/useSovyContent';
import sentinelChat from '../assets/sentinel/sentinel-chat.png';

function RoadmapDot({ status }: { status: 'done' | 'building' | 'planned' }) {
  if (status === 'done') {
    return (
      <div className="relative z-10 shrink-0 w-8 h-8 rounded-full bg-success flex items-center justify-center">
        <Check className="h-4 w-4 text-success-foreground" />
      </div>
    );
  }

  if (status === 'building') {
    return (
      <div className="relative z-10 shrink-0 w-8 h-8">
        <motion.span
          className="absolute inset-0 rounded-full bg-warning/40"
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className="relative block w-8 h-8 rounded-full bg-warning ring-2 ring-background" />
      </div>
    );
  }

  return (
    <span className="relative z-10 shrink-0 w-8 h-8 rounded-full border-2 border-muted-foreground/30 bg-muted" />
  );
}

export default function SovyPage() {
  const { t } = useLingui();
  const content = useSovyContent();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-16">
      {/* SECTION 1: Hero */}
      <section className="rounded-xl bg-card p-8 md:p-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Bot className="h-8 w-8 text-primary" />
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-heading font-bold text-primary mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {content.hero.title}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground font-medium mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {content.hero.subtitle}
          </motion.p>

          <motion.p
            className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {content.hero.description}
          </motion.p>
        </div>

        <div className="mt-12 relative max-w-3xl mx-auto" style={{ perspective: '1000px' }}>
          <motion.div
            initial={{ opacity: 0, rotateY: 5, y: 20 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img
              src={sentinelChat}
              alt="Zentinel Chat"
              className="rounded-xl border border-border/50 shadow-sm w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Capabilities */}
      <DocSection title={content.capabilities.title} sectionId="capabilities">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.capabilities.items.map((item, i) => (
            <AnimateOnScroll key={item.title} delay={i * 0.1}>
              <Card className="h-full p-6">
                <span className="text-3xl block mb-3">{item.icon}</span>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {item.description}
                </p>
                <p className="text-sm italic text-primary/80">
                  &ldquo;{item.askExample}&rdquo;
                </p>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </DocSection>

      {/* SECTION 3: See It In Action */}
      <DocSection title={content.seeItInAction.title} sectionId="see-it-in-action">
        <AnimateOnScroll>
          <AnnotatedScreenshot
            src={sentinelChat}
            alt="Zentinel in action"
            annotations={content.seeItInAction.annotations}
          />
        </AnimateOnScroll>
      </DocSection>

      {/* SECTION 4: How It Works */}
      <DocSection title={content.howItWorks.title} sectionId="how-it-works">
        <AnimateOnScroll>
          <InteractiveFlowDiagram
            nodes={content.howItWorks.steps.map((s) => ({
              icon: s.icon,
              label: s.title,
              sublabel: s.description,
            }))}
            className="mb-10"
          />
        </AnimateOnScroll>

        <div className="space-y-4 mt-8">
          {content.howItWorks.steps.map((step, i) => (
            <AnimateOnScroll key={step.title} delay={i * 0.1}>
              <div className="flex items-start gap-4 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-4">
                <span className="text-2xl shrink-0 mt-0.5">{step.icon}</span>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </DocSection>

      {/* SECTION 5: Sovy + Vaults */}
      <DocSection title={content.sovyVaults.title} sectionId="sovy-vaults">
        <p className="text-muted-foreground leading-relaxed mb-8">
          {content.sovyVaults.description}
        </p>

        {content.sovyVaults.conversations.map((conv, i) => (
          <ConversationExample key={i} messages={conv} className="mb-8" />
        ))}
      </DocSection>

      {/* SECTION 6: Sovy + Payments */}
      <DocSection title={content.sovyPayments.title} sectionId="sovy-payments">
        <p className="text-muted-foreground leading-relaxed mb-8">
          {content.sovyPayments.description}
        </p>

        <div className="space-y-8 mb-10">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Pay-in Flow
            </h4>
            <StateTimeline states={content.sovyPayments.payInStates} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Pay-out Flow
            </h4>
            <StateTimeline states={content.sovyPayments.payOutStates} />
          </div>
        </div>

        <ConversationExample messages={content.sovyPayments.conversation} />
      </DocSection>

      {/* SECTION 7: 12 Financial Tools */}
      <DocSection
        title={content.tools.title}
        subtitle={content.tools.subtitle}
        sectionId="tools"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {content.tools.items.map((tool, i) => (
            <AnimateOnScroll key={tool.name} delay={i * 0.05}>
              <ToolCard
                icon={tool.icon}
                name={tool.name}
                description={tool.description}
                example={tool.example}
              />
            </AnimateOnScroll>
          ))}
        </div>
      </DocSection>

      {/* SECTION 8: Security & Privacy */}
      <DocSection title={content.security.title} sectionId="security">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.security.pillars.map((pillar, i) => (
            <AnimateOnScroll key={pillar.title} delay={i * 0.1}>
              <Card className="h-full p-6">
                <span className="text-3xl block mb-3">{pillar.icon}</span>
                <h3 className="font-semibold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </DocSection>

      {/* SECTION 9: Roadmap */}
      <DocSection title={content.roadmap.title} sectionId="roadmap">
        <div className="relative ml-4">
          {/* Vertical connecting line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />

          <div className="space-y-8">
            {content.roadmap.phases.map((phase, i) => (
              <AnimateOnScroll key={phase.phase} delay={i * 0.12}>
                <div className="flex items-start gap-5">
                  <RoadmapDot status={phase.status} />
                  <div className="pt-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {phase.phase}
                    </span>
                    <h4 className="font-semibold text-foreground mt-0.5">{phase.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </DocSection>

      {/* SECTION 10: FAQ */}
      <DocSection title={content.faq.title} sectionId="faq">
        <div className="space-y-3">
          {content.faq.items.map((item, i) => (
            <AnimateOnScroll key={i} delay={i * 0.05}>
              <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-muted/30"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm text-foreground">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </DocSection>

      {/* SECTION 11: CTA + CrossNavigation */}
      <section>
        <Card className="p-8 md:p-12 text-center">
          <Bot className="h-10 w-10 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-heading font-bold text-foreground mb-6">
            {content.cta.title}
          </h3>
          <Button asChild size="lg" className="rounded-full">
            <Link to={content.cta.buttonHref}>{content.cta.buttonLabel}</Link>
          </Button>
        </Card>

        <CrossNavigation
          items={[
            {
              icon: '📜',
              title: 'Soberana Manifesto',
              description: 'Our vision and architecture philosophy',
              href: '/docs/manifesto',
            },
            {
              icon: '🏦',
              title: 'Soberana Vaults',
              description: 'Autonomous yield with institutional precision',
              href: '/docs/soberana-vaults',
            },
          ]}
          backLabel={t`Volver a documentación`}
        />
      </section>
    </div>
  );
}
