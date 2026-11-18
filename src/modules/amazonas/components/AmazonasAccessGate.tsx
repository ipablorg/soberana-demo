/**
 * AmazonasAccessGate — Password gate for confidential Due Diligence content.
 * Uses Web Crypto API to compare SHA-256 hash — plaintext key never stored.
 * Session persists via sessionStorage (lost on browser close).
 */

import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Lock } from '@/shared/components/animated-icons';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import LogoAmazonas from '@/shared/assets/Logos-clientes/amazonas.png';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { Trans, useLingui } from '@lingui/react/macro';

// SHA-256 of "LoopayAmazonas2026!*"
const ACCESS_HASH = '3c06b67e4cbcec67f9b52f5e6bd377cf2c3da8825953bd8a7bb3df588126a561';
const SESSION_KEY = 'amazonas_access_granted';

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AmazonasAccessGateProps {
  children: React.ReactNode;
}

export function AmazonasAccessGate({ children }: AmazonasAccessGateProps) {
  const { t } = useLingui();
  const [granted, setGranted] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setGranted(true);
    }
  }, []);

  if (granted) {
    return <>{children}</>;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const hash = await sha256(input);

    if (hash === ACCESS_HASH) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setGranted(true);
    } else {
      setError(true);
      setInput('');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 w-full max-w-sm"
      >
        {/* Logos */}
        <div className="flex items-center gap-3">
          <img src={LogoAmazonas} alt="Banco Amazonas" className="h-10 w-auto object-contain" />
          <span className="text-muted-foreground/50 text-lg">+</span>
          <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto object-contain dark:hidden" />
          <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto object-contain hidden dark:block" />
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8 w-full shadow-sm flex flex-col items-center gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="font-heading text-2xl font-bold text-foreground"><Trans>Restricted access</Trans></h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <Trans>This content is confidential. Enter the access key provided.</Trans>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <Input
              type="password"
              placeholder={t`Access key`}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              className="rounded-lg"
              autoComplete="off"
              autoFocus
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="text-destructive text-sm text-center"
              >
                <Trans>Incorrect key. Please verify and try again.</Trans>
              </motion.p>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={loading || input.length === 0}
            >
              {loading ? t`One moment...` : t`Access`}
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          <Trans>If you don't have the key, contact the Soberana team.</Trans>
        </p>
      </motion.div>
    </div>
  );
}
