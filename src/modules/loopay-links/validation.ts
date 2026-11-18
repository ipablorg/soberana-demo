import { z } from 'zod';
import type { Currency, SettlementStrategy } from './types';

/**
 * Validation schemas for Loopay Links (Payment-Only)
 * Using Zod for runtime type safety and validation
 */

// ============================================
// ENUMS
// ============================================

export const CurrencySchema = z.enum(['USD', 'COP', 'USDT', 'USDC']);

export const SettlementStrategySchema = z.enum(['CRYPTO_WALLET', 'FIAT_BANK']);

// ============================================
// PAYMENT LINK (LinkItem)
// ============================================

/**
 * Payment Link Schema
 * All links are now payment buttons
 */
export const LinkItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Ingresa un título').max(100, 'El título es muy largo'),
  amount: z.number().nonnegative().max(1000000),
  currency: CurrencySchema,
  active: z.boolean(),
  icon: z.string().emoji().optional(),
  thumbnail: z.string().url().optional(),
  description: z.string().max(200, 'La descripción es muy larga').optional(),
  settlementStrategy: SettlementStrategySchema.optional(),
  receiveCurrency: z.string().optional(),
  allowCustomAmount: z.boolean().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
}).refine(
  (data) => {
    // If custom amounts allowed, validate min/max
    if (data.allowCustomAmount) {
      if (data.minAmount && data.maxAmount) {
        return data.minAmount < data.maxAmount;
      }
    }
    return true;
  },
  {
    message: 'El monto mínimo debe ser menor al máximo',
  }
);

// ============================================
// PROFILE DATA
// ============================================

export const SocialLinksSchema = z.object({
  twitter: z.string().url().optional(),
  instagram: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  youtube: z.string().url().optional(),
  tiktok: z.string().url().optional(),
});

export const ProfileDataSchema = z.object({
  name: z.string().min(1).max(50),
  bio: z.string().max(80),
  avatar: z.string().url().optional(),
  themeColor: z.string(),
  socialLinks: SocialLinksSchema.optional(),
  customDomain: z.string().optional(),
});

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validates a payment link
 * Returns validation result with typed errors
 */
export function validateLink(link: unknown) {
  return LinkItemSchema.safeParse(link);
}

/**
 * Validates profile data
 */
export function validateProfile(profile: unknown) {
  return ProfileDataSchema.safeParse(profile);
}

/**
 * Validates payment amount against link configuration
 */
export function validatePaymentAmount(
  amount: number,
  link: z.infer<typeof LinkItemSchema>
): { valid: boolean; error?: string } {
  if (!link.allowCustomAmount && amount !== link.amount) {
    return { valid: false, error: 'Este link no permite montos personalizados' };
  }

  if (link.minAmount && amount < link.minAmount) {
    return { valid: false, error: `El monto mínimo es ${link.minAmount}` };
  }

  if (link.maxAmount && amount > link.maxAmount) {
    return { valid: false, error: `El monto máximo es ${link.maxAmount}` };
  }

  return { valid: true };
}

// ============================================
// INFERRED TYPES
// ============================================

// Export inferred types for use in components
export type ValidatedLinkItem = z.infer<typeof LinkItemSchema>;
export type ValidatedProfileData = z.infer<typeof ProfileDataSchema>;

