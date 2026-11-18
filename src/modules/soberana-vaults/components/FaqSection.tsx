/**
 * Section 12 — FAQ
 * Accordion-style Q&A using Radix UI Accordion primitive
 */

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { FAQ_ITEMS } from '../data/static-data';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Preguntas frecuentes
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          FAQ
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Todo lo que necesitas saber sobre Soberana Vaults.
        </p>
      </motion.div>

      {/* Accordion */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Accordion type="single" collapsible className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div key={i} variants={itemVariants}>
              <AccordionItem
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <AccordionTrigger className="px-5 py-4 text-sm font-medium text-foreground hover:no-underline hover:bg-muted/40 transition-colors duration-150 [&[data-state=open]]:bg-muted/40">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-muted/40 p-5 space-y-2"
      >
        <p className="text-sm font-semibold text-foreground">
          ¿Tienes más preguntas?
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Soberana Vaults es un sistema en evolución activa. Si tienes preguntas
          específicas sobre la estrategia, el código, o los resultados, contacta
          al equipo de Loopay directamente.
        </p>
      </motion.div>
    </section>
  );
}
