import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useLinksStore } from '../stores/useLinksStore';
import { Trans, useLingui } from '@lingui/react/macro';

/**
 * ClaimLinkButton - The conversion CTA
 * 
 * This is the ONLY moment we trigger registration/login.
 * Represents the transition from "Shadow Account" to "Real User".
 * 
 * Features:
 * - Prominent gradient styling with glow effect
 * - Shows custom username preview
 * - Opens auth modal on click
 * - Only shown when user hasn't claimed yet
 */
export function ClaimLinkButton() {
  const { t } = useLingui();
  const { profile } = useLinksStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Generate username from profile name (simplified)
  const generateUsername = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20) || 'mylink';
  };

  const username = generateUsername(profile.name);
  const claimUrl = `links.loopay.com/${username}`;

  const handleClaim = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthComplete = () => {
    // In production: Handle successful authentication
    // - Save shadow account data to user account
    // - Redirect to authenticated dashboard
    // - Show success toast
    setIsAuthModalOpen(false);
  };

  return (
    <>
      {/* Floating CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="sticky top-0 z-20 mb-6"
      >
        <Button
          onClick={handleClaim}
          size="lg"
          variant="gradient"
          className="w-full font-heading text-base h-16 relative overflow-hidden group"
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-150" />
          
          <div className="flex items-center justify-center gap-3 relative z-10">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            
            <div className="text-left">
              <div className="font-bold"><Trans>Publish & Claim Your Link</Trans></div>
              <div className="text-xs opacity-90 font-normal">
                {claimUrl}
              </div>
            </div>
            
            <ExternalLink className="w-4 h-4 ml-2" />
          </div>
        </Button>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-center text-xs text-muted-foreground mt-2"
        >
          <Trans>Free forever</Trans> • <Trans>No credit card required</Trans>
        </motion.p>
      </motion.div>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-heading"><Trans>Claim Your Link</Trans></span>
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground mb-2">
                  <Trans>Your custom link will be:</Trans>
                </p>
                <p className="text-lg font-mono font-bold text-primary">
                  {claimUrl}
                </p>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ <Trans>Keep all your links and customizations</Trans></p>
                <p>✓ <Trans>Get analytics and insights</Trans></p>
                <p>✓ <Trans>Unlock premium themes</Trans></p>
                <p>✓ <Trans>Custom domain support</Trans></p>
              </div>

              {/* Placeholder for auth form */}
              <div className="bg-card border-2 border-dashed border-border rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  🔐 <Trans>Auth Form Placeholder</Trans>
                </p>
                <Button
                  onClick={handleAuthComplete}
                  variant="gradient"
                >
                  <Trans>Sign Up / Log In</Trans>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                <Trans>By signing up, you agree to our Terms of Service and Privacy Policy</Trans>
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

