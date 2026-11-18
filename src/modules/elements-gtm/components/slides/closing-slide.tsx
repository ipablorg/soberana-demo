import { motion } from "framer-motion";
import { CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GtmContainer } from "../shared/gtm-container";
import { Button } from "@/shared/components/ui/button";
import { gtmContent } from "../../data/gtm-content";

export function ClosingSlide() {
  const d = gtmContent.closing;
  const navigate = useNavigate();

  return (
    <GtmContainer dark>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-background/50"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mb-12 font-heading text-3xl font-bold tracking-tight text-background md:text-4xl lg:text-6xl"
        style={{ whiteSpace: "pre-line" }}
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-background/50">
            Por qué ahora
          </h3>
          <ul className="flex flex-col gap-3">
            {d.whyNow.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-background/40" />
                <span className="text-sm leading-relaxed text-background/70">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <h3 className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-background/50">
            Uso de la inversión
          </h3>
          <ul className="flex flex-col gap-3">
            {d.ask.use.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-background/40" />
                <span className="text-sm leading-relaxed text-background/70">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-16 flex flex-col items-center gap-5 text-center"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/elements")}
          className="gap-2 border-background/20 bg-background/5 text-background hover:bg-background/10 hover:text-background"
        >
          <ExternalLink className="h-4 w-4" />
          Ver Soberana Elements
        </Button>

        <p className="font-mono text-xs uppercase tracking-[0.25em] text-background/40">
          {d.contact.email}
        </p>
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-background/30">
          {d.tagline}
        </p>
      </motion.div>
    </GtmContainer>
  );
}
