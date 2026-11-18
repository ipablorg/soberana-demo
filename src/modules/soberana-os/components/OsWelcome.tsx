import { motion } from 'framer-motion';

interface OsWelcomeProps {
  language: 'en' | 'es';
  onSelect: (id: string) => void;
}

const initialChips = {
  en: [
    { id: 'what-is-sovy', label: 'What is Zentinel?' },
    { id: 'what-are-vaults', label: 'What are Soberana Vaults?' },
    { id: 'what-is-manifesto', label: 'What is the Soberana Manifesto?' },
  ],
  es: [
    { id: 'what-is-sovy', label: '¿Qué es Zentinel?' },
    { id: 'what-are-vaults', label: '¿Qué son los Soberana Vaults?' },
    { id: 'what-is-manifesto', label: '¿Qué es el Manifiesto de Soberana?' },
  ],
};

export function OsWelcome({ language, onSelect }: OsWelcomeProps) {
  const chips = initialChips[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-4xl mb-4"
      >
        ✨
      </motion.div>

      <h2 className="text-xl font-heading font-bold text-foreground mb-2">
        {language === 'es' ? 'Bienvenido a' : 'Welcome to'}{' '}
        <span className="text-primary">Soberana OS</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-md">
        {language === 'es'
          ? 'Tu ventana a las finanzas autónomas. Pregúntame lo que quieras, o empieza con una de estas:'
          : 'Your window into autonomous finance. Ask me anything, or start with one of these:'}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {chips.map((chip, i) => (
          <motion.button
            key={chip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
            onClick={() => onSelect(chip.id)}
            className="bg-primary/10 text-primary rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/20 cursor-pointer transition-colors duration-150 border border-primary/10 hover:border-primary/30"
          >
            {chip.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
