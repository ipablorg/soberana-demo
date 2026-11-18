import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { Globe2, Clock, ShieldCheck, Rocket, Lock, Layers } from '@/shared/components/animated-icons';
import type { IconComponent } from '@/shared/components/animated-icons';

const stagger = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

interface ProductProps {
  label: string;
  title: string;
  subtitle: string;
  benefits: { icon: IconComponent; title: string; text: string }[];
  stats: string;
  inverted?: boolean;
}

function ProductBlock({ label, title, subtitle, benefits, stats, inverted }: ProductProps) {
  const textPrimary = inverted ? 'text-background' : 'text-foreground';
  const textSecondary = inverted ? 'text-background/60' : 'text-muted-foreground';
  const statsBg = inverted ? 'bg-background/5' : 'bg-muted/50';
  const statsText = inverted ? 'text-background/50' : 'text-muted-foreground';

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-10%' }}
      variants={stagger}
    >
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`text-xs font-heading uppercase tracking-[0.3em] ${textSecondary} mb-6`}
      >
        {label}
      </motion.p>
      <motion.h3
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`font-heading text-2xl lg:text-4xl font-bold ${textPrimary} leading-tight mb-3`}
      >
        {title}
      </motion.h3>
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`font-body font-light text-lg ${textSecondary} mb-12`}
      >
        {subtitle}
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.title}
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col gap-3"
            >
              <Icon className={`h-5 w-5 ${textPrimary}`} />
              <h4 className={`font-heading text-sm font-semibold ${textPrimary}`}>{b.title}</h4>
              <p className={`font-body text-sm ${textSecondary} leading-relaxed`}>{b.text}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`${statsBg} rounded-lg px-6 py-4`}
      >
        <p className={`font-mono tabular-nums text-sm ${statsText} tracking-wide`}>
          {stats}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function SectionProducts() {
  const { t } = useLingui();

  const products: (ProductProps & { dark?: boolean })[] = [
    {
      label: '01 — API',
      title: t`Every payment rail. One integration.`,
      subtitle: t`REST, GraphQL, webhooks, and SDKs. From sandbox to production in days.`,
      benefits: [
        {
          icon: Globe2,
          title: t`+50 currencies, +45 countries`,
          text: t`All local and international payment corridors. SWIFT, Pix, ACH, SEPA, and more.`,
        },
        {
          icon: Clock,
          title: t`Instant settlement`,
          text: t`Dual-rail: fiat and crypto rails working in parallel. Delivery in under 30 seconds.`,
        },
        {
          icon: ShieldCheck,
          title: t`Built-in compliance`,
          text: t`Automated KYC/AML on every transaction. Zero additional operational burden.`,
        },
      ],
      stats: t`+50 currencies  ·  +45 countries  ·  <30s settlement  ·  API-first`,
      dark: true,
    },
    {
      label: '02 — PLATFORM',
      title: t`Your brand. Our rails.`,
      subtitle: t`Your bank, fintech, or enterprise — global payments, digital assets, treasury — ready to customize.`,
      benefits: [
        {
          icon: Layers,
          title: t`Configure`,
          text: t`Customize with your brand. Choose the modules you need.`,
        },
        {
          icon: Rocket,
          title: t`Launch`,
          text: t`In production in days, not months. Zero legacy debt.`,
        },
        {
          icon: Clock,
          title: t`Scale`,
          text: t`Grow without bottlenecks. The infrastructure scales with you.`,
        },
      ],
      stats: t`White-label first  ·  Days to launch  ·  Modular  ·  Full custody`,
      dark: false,
    },
    {
      label: '03 — BaaS',
      title: t`Don't build a bank. Assemble yours.`,
      subtitle: t`Independent financial modules. Pick what you need, integrate in days.`,
      benefits: [
        {
          icon: Lock,
          title: t`Wallets · Cards · Accounts`,
          text: t`Core financial primitives, ready to compose.`,
        },
        {
          icon: Clock,
          title: t`Smart Treasury · Vaults · FX Engine`,
          text: t`Advanced modules for yield, custody, and exchange.`,
        },
        {
          icon: ShieldCheck,
          title: t`On/Off Ramp · API & Connectors`,
          text: t`Bridge traditional and digital finance seamlessly.`,
        },
      ],
      stats: t`Pick  ·  Plug  ·  Go live  ·  No monoliths`,
      dark: true,
    },
  ];

  return (
    <>
      {products.map((product) => (
        <section
          key={product.label}
          className={`py-24 lg:py-32 px-6 ${
            product.dark
              ? 'bg-foreground text-background'
              : 'bg-background text-foreground'
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <ProductBlock {...product} inverted={product.dark} />
          </div>
        </section>
      ))}
    </>
  );
}
