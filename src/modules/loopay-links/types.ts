/**
 * Loopay Links - Type Definitions
 * 
 * Data model for payment links (Pay Buttons)
 * Loopay Links is exclusively for creating payment buttons
 */

/**
 * Supported currencies
 */
export type Currency = 'USD' | 'COP' | 'USDT' | 'USDC';

/**
 * Settlement strategies for payments
 * - CRYPTO_WALLET: Settle directly to crypto wallet
 * - FIAT_BANK: Settle to bank account in fiat
 */
export type SettlementStrategy = 'CRYPTO_WALLET' | 'FIAT_BANK';

/**
 * Payment Link (Pay Button)
 * Represents a single payment button in the user's page
 * All links are payment links - no external URLs
 */
export interface LinkItem {
  /** Unique identifier */
  id: string;
  
  /** Title/Concept (e.g., "Consultoría", "Producto Premium") */
  title: string;
  
  /** Payment amount */
  amount: number;
  
  /** Display currency (what customer sees) */
  currency: Currency;
  
  /** Whether payment link is active/visible */
  active: boolean;
  
  /** Optional emoji icon */
  icon?: string;
  
  /** Optional thumbnail image URL */
  thumbnail?: string;
  
  /** Optional: Product/service description */
  description?: string;
  
  /** How the payment settles (future) */
  settlementStrategy?: SettlementStrategy;
  
  /** The asset the merchant wants to receive (future) */
  receiveCurrency?: string;
  
  /** Optional: Allow customer to choose amount (donations) */
  allowCustomAmount?: boolean;
  
  /** Optional: Minimum amount if custom amounts allowed */
  minAmount?: number;
  
  /** Optional: Maximum amount if custom amounts allowed */
  maxAmount?: number;
  
  /** Analytics metadata (future) */
  analytics?: {
    clicks?: number;
    conversions?: number;
    revenue?: number;
  };
}

/**
 * Social Links
 */
export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
  tiktok?: string;
}

/**
 * Profile Data
 * User's public profile information
 */
export interface ProfileData {
  /** Display name */
  name: string;
  
  /** Bio/description (max 80 chars) */
  bio: string;
  
  /** Avatar image URL */
  avatar?: string;
  
  /** Theme color token (semantic) */
  themeColor: string;
  
  /** Social media links */
  socialLinks?: SocialLinks;
  
  /** Custom domain (future) */
  customDomain?: string;
  
  /** SEO metadata (future) */
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

/**
 * Links State Interface
 * Complete Zustand store shape
 */
export interface LinksState {
  profile: ProfileData;
  links: LinkItem[];
  
  // Profile Actions
  updateProfile: (profile: Partial<ProfileData>) => void;
  
  // Payment Link Actions
  addLink: (link: Omit<LinkItem, 'id'>) => void;
  updateLink: (id: string, updates: Partial<LinkItem>) => void;
  deleteLink: (id: string) => void;
  reorderLinks: (startIndex: number, endIndex: number) => void;
  toggleLinkActive: (id: string) => void;
}

