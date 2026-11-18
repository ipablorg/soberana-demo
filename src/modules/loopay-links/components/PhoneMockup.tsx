import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLinksStore } from '../stores/useLinksStore';
import { ShoppingCart, X, Copy, Check, Plus, Upload } from '@/shared/components/animated-icons';
import { toast } from '@/shared/hooks/use-toast';
import { Input } from '@/shared/components/ui/input';
import type { LinkItem } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Trans, useLingui } from '@lingui/react/macro';

export function PhoneMockup() {
  const { t } = useLingui();
  const { profile, links, updateProfile } = useLinksStore();
  const activeLinks = links.filter((link) => link.active);
  const [expandedLink, setExpandedLink] = useState<LinkItem | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState(profile.bio || '');

  // Format price using Intl.NumberFormat
  const formatPrice = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback for non-standard currencies like USDT, USDC
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  // Generate payment address/link based on settlement strategy
  const generatePaymentAddress = (link: LinkItem): string => {
    const isCrypto = link.currency === 'USDT' || link.currency === 'USDC' || link.settlementStrategy === 'CRYPTO_WALLET';
    
    if (isCrypto) {
      // Mock crypto wallet address
      return '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    } else {
      // Mock fiat payment link
      return `https://pay.loopay.com/checkout/${link.id}`;
    }
  };

  // Handle payment link click - expand view
  const handlePaymentClick = (link: LinkItem) => {
    setExpandedLink(link);
  };

  // Copy address to clipboard
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    toast({
      title: t`Copied`,
      description: t`Payment address copied to clipboard`,
      duration: 2000,
    });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Handle bio save
  const handleBioSave = () => {
    updateProfile({ bio: bioValue });
    setIsEditingBio(false);
    toast({
      title: t`Bio updated`,
      description: t`Your bio has been updated`,
      duration: 2000,
    });
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar: reader.result as string });
        toast({
          title: t`Logo updated`,
          description: t`Your logo has been uploaded`,
          duration: 2000,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-8">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[380px] aspect-9/19.5 bg-background border-14 border-card rounded-[3rem] shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-card rounded-b-3xl z-10" />

        {/* Scrollable Content Area */}
        <div className="h-full overflow-y-auto overflow-x-hidden bg-linear-to-b from-background to-muted/20 pt-12 pb-8 px-6 scrollbar-thin scrollbar-thumb-muted/30 scrollbar-track-transparent">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center mb-8"
          >
            {/* Logo Upload Button */}
            <div className="relative mb-4 group">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer block"
              >
                {profile.avatar && profile.avatar !== 'https://api.dicebear.com/7.x/avataaars/svg?seed=User' ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors duration-150">
                    <img
                      src={profile.avatar}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                ) : (
                  <motion.div
                    className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors duration-150 flex items-center justify-center bg-muted/10 hover:bg-muted/20"
                  >
                    <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                )}
              </label>
            </div>

            {/* Name */}
            <h1 className="font-heading text-xl font-bold text-foreground mb-3">
              {profile.name}
            </h1>

            {/* Bio - Editable */}
            <div className="w-full max-w-xs">
              {isEditingBio ? (
                <div className="space-y-2">
                  <Input
                    value={bioValue}
                    onChange={(e) => setBioValue(e.target.value)}
                    placeholder={t`Add your bio...`}
                    className="text-sm text-center h-auto py-2"
                    autoFocus
                    onBlur={handleBioSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleBioSave();
                      }
                    }}
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingBio(true);
                    setBioValue(profile.bio || '');
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors leading-relaxed px-4 py-2 rounded-lg hover:bg-muted/50"
                >
                  {profile.bio || t`+ Add bio`}
                </button>
              )}
            </div>
          </motion.div>

          {/* Payment Buttons Section or Expanded Payment View */}
          <AnimatePresence mode="wait">
            {expandedLink ? (
              // EXPANDED VIEW - Show QR and Payment Details
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header with Close Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedLink.icon && (
                      <span className="text-3xl">{expandedLink.icon}</span>
                    )}
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground">
                        {expandedLink.title}
                      </h3>
                      {expandedLink.description && (
                        <p className="text-xs text-muted-foreground">
                          {expandedLink.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedLink(null)}
                    className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Payment Amount Card */}
                <div className="bg-primary rounded-xl p-6 text-center">
                  <p className="text-primary-foreground/70 text-sm mb-2"><Trans>Amount to Pay</Trans></p>
                  <p className="text-primary-foreground text-4xl font-bold font-mono tabular-nums">
                    {formatPrice(expandedLink.amount, expandedLink.currency)}
                  </p>
                </div>

                {/* QR Code Section */}
                <div className="bg-card border-2 border-border rounded-xl p-6">
                  <div className="flex flex-col items-center gap-4">
                    {/* QR Code */}
                    <div className="bg-background p-4 rounded-xl">
                      <QRCodeSVG
                        value={generatePaymentAddress(expandedLink)}
                        size={200}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    {/* Payment Method Label */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {expandedLink.currency === 'USDT' || expandedLink.currency === 'USDC' || expandedLink.settlementStrategy === 'CRYPTO_WALLET'
                          ? t`Send crypto to this address`
                          : t`Scan to pay with your bank`}
                      </p>
                      <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                        <code className="text-xs font-mono text-foreground break-all">
                          {generatePaymentAddress(expandedLink)}
                        </code>
                        <button
                          onClick={() => handleCopyAddress(generatePaymentAddress(expandedLink))}
                          className="shrink-0 w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                        >
                          {copiedAddress ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="w-full bg-muted/20 rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-foreground"><Trans>Payment Instructions:</Trans></p>
                      {expandedLink.currency === 'USDT' || expandedLink.currency === 'USDC' || expandedLink.settlementStrategy === 'CRYPTO_WALLET' ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            1. <Trans>Open your crypto wallet</Trans>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2. <Trans>Scan the QR code or copy the address</Trans>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            3. <Trans>Send exactly {formatPrice(expandedLink.amount, expandedLink.currency)}</Trans>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            4. <Trans>Payment will be confirmed automatically</Trans>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground">
                            1. <Trans>Click the payment link or scan QR</Trans>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            2. <Trans>Complete payment with your bank</Trans>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            3. <Trans>You'll receive confirmation via email</Trans>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => setExpandedLink(null)}
                  className="w-full bg-muted hover:bg-muted/80 text-foreground rounded-xl py-3 font-medium transition-colors"
                >
                  <Trans>Back to Payment Options</Trans>
                </button>
              </motion.div>
            ) : (
              // LIST VIEW - Show all payment buttons
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
            {activeLinks.map((link, index) => {
              const formattedPrice = formatPrice(link.amount, link.currency);
              
              return (
                <motion.button
                  key={link.id}
                  onClick={() => handlePaymentClick(link)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="group block w-full bg-card hover:bg-muted/50 border border-border hover:border-foreground/20 rounded-xl p-4 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon or Thumbnail - Simple and clean */}
                    <div className="shrink-0">
                      {link.icon ? (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-2xl">
                          {link.icon}
                        </div>
                      ) : link.thumbnail ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                          <img
                            src={link.thumbnail}
                            alt={link.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                      {/* Title + Description */}
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="font-medium text-foreground text-sm truncate w-full">
                          {link.title || t`Untitled Payment`}
                        </span>
                        {link.description && (
                          <span className="text-xs text-muted-foreground truncate w-full">
                            {link.description}
                          </span>
                        )}
                      </div>

                      {/* Price - Clean and minimal */}
                      <div className="shrink-0 font-semibold text-foreground text-sm font-mono tabular-nums">
                        {formattedPrice}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}

                {/* Empty State */}
                {activeLinks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-16 px-4"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">
                      <Trans>No payment buttons yet</Trans>
                    </p>
                    <p className="text-muted-foreground/70 text-xs">
                      <Trans>Create your first payment button to start accepting payments</Trans>
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Powered by Loopay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-xs text-muted-foreground">
              Powered by{' '}
              <span className="text-primary font-semibold">
                Loopay
              </span>
            </p>
          </motion.div>
        </div>

        {/* Bottom Home Indicator (iOS style) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-card rounded-full" />
      </div>
    </div>
  );
}

