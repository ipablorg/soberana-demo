import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { LanguageToggle } from '@/shared/components/common/LanguageToggle';
import { RotatingWord } from '@/modules/common/web/components/landing/RotatingWord';
import loopayLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import loopayLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } },
};

interface AuthLayoutProps {
    headline?: string;
    subtitle?: string;
    rotatingWords?: string[];
    /** When true, hides the marketing column and centers the card alone. */
    centered?: boolean;
    children: React.ReactNode;
}

export function AuthLayout({ headline, subtitle, rotatingWords, centered = false, children }: AuthLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full bg-background overflow-hidden">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-14 flex items-center px-2 justify-between z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
            >
                <button onClick={() => navigate('/')} className="focus:outline-none">
                    <img src={loopayLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
                    <img src={loopayLogoDark} alt="Soberana" className="h-8 w-auto hidden dark:block" />
                </button>
                <div className="flex items-center gap-2">
                    <LanguageToggle availableLanguages={['en', 'es', 'pt']} />
                    <Button onClick={() => navigate('/')} variant="ghost" size="sm">
                        <Trans>Back to Home</Trans>
                    </Button>
                </div>
            </motion.header>

            <section
                className={
                    centered
                        ? 'px-6 pt-4 pb-8 h-[calc(100dvh-3.5rem)] flex items-center justify-center'
                        : 'px-6 pt-4 pb-8 h-[calc(100dvh-3.5rem)] grid md:grid-cols-2'
                }
            >
                {!centered && (
                    <motion.div
                        className="mb-12 lg:mb-0 hidden md:flex flex-col h-full  justify-center text-start"
                        initial="initial"
                        animate="animate"
                        variants={stagger}
                    >
                        <motion.h1
                            variants={fadeUp}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="font-heading text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
                        >
                            {headline}{' '}
                            {rotatingWords && rotatingWords.length > 0 && (
                                <RotatingWord
                                    words={rotatingWords}
                                    interval={2500}
                                    className="text-gradient-loopay"
                                />
                            )}
                        </motion.h1>
                        <motion.p
                            variants={fadeUp}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="font-body text-lg text-muted-foreground leading-relaxed max-w-lg"
                        >
                            {subtitle}
                        </motion.p>
                    </motion.div>
                )}

                <div className="flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-full max-w-md"
                    >
                        {children}
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
