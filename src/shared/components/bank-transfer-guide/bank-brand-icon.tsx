import { cn } from '@/shared/lib/utils';
import bankOfAmericaLogo from '@/shared/assets/banks/bank-of-america.svg';
import wellsFargoLogo from '@/shared/assets/banks/wells-fargo.svg';
import capitalOneLogo from '@/shared/assets/banks/capital-one.svg';
import chaseLogo from '@/shared/assets/banks/chase.svg';
import tdBankLogo from '@/shared/assets/banks/td-bank.svg';
import firstCitizensLogo from '@/shared/assets/banks/first-citizens.svg';

export interface BankBrand {
  logo: string;
  activeClass: string;
  inactiveClass: string;
}

export const BANK_BRANDS: Record<string, BankBrand> = {
  'bank-of-america': {
    logo: bankOfAmericaLogo,
    activeClass:
      'border-[oklch(0.58_0.2_25)] bg-[oklch(0.58_0.2_25/0.2)] text-foreground shadow-sm ring-1 ring-[oklch(0.58_0.2_25/0.35)]',
    inactiveClass:
      'border-[oklch(0.58_0.2_25/0.4)] bg-[oklch(0.58_0.2_25/0.1)] text-foreground hover:border-[oklch(0.58_0.2_25/0.65)] hover:bg-[oklch(0.58_0.2_25/0.16)] hover:shadow-sm',
  },
  'wells-fargo': {
    logo: wellsFargoLogo,
    activeClass:
      'border-[oklch(0.6_0.19_30)] bg-[oklch(0.6_0.19_30/0.2)] text-foreground shadow-sm ring-1 ring-[oklch(0.6_0.19_30/0.35)]',
    inactiveClass:
      'border-[oklch(0.6_0.19_30/0.4)] bg-[oklch(0.6_0.19_30/0.1)] text-foreground hover:border-[oklch(0.6_0.19_30/0.65)] hover:bg-[oklch(0.6_0.19_30/0.16)] hover:shadow-sm',
  },
  'capital-one': {
    logo: capitalOneLogo,
    activeClass:
      'border-[oklch(0.55_0.16_250)] bg-[oklch(0.55_0.16_250/0.2)] text-foreground shadow-sm ring-1 ring-[oklch(0.55_0.16_250/0.35)]',
    inactiveClass:
      'border-[oklch(0.55_0.16_250/0.4)] bg-[oklch(0.55_0.16_250/0.1)] text-foreground hover:border-[oklch(0.55_0.16_250/0.65)] hover:bg-[oklch(0.55_0.16_250/0.16)] hover:shadow-sm',
  },
  chase: {
    logo: chaseLogo,
    activeClass:
      'border-[oklch(0.58_0.14_250)] bg-[oklch(0.58_0.14_250/0.2)] text-foreground shadow-sm ring-1 ring-[oklch(0.58_0.14_250/0.35)]',
    inactiveClass:
      'border-[oklch(0.58_0.14_250/0.4)] bg-[oklch(0.58_0.14_250/0.1)] text-foreground hover:border-[oklch(0.58_0.14_250/0.65)] hover:bg-[oklch(0.58_0.14_250/0.16)] hover:shadow-sm',
  },
  'td-bank': {
    logo: tdBankLogo,
    activeClass:
      'border-[oklch(0.55_0.18_145)] bg-[oklch(0.55_0.18_145/0.2)] text-foreground shadow-sm ring-1 ring-[oklch(0.55_0.18_145/0.35)]',
    inactiveClass:
      'border-[oklch(0.55_0.18_145/0.4)] bg-[oklch(0.55_0.18_145/0.1)] text-foreground hover:border-[oklch(0.55_0.18_145/0.65)] hover:bg-[oklch(0.55_0.18_145/0.16)] hover:shadow-sm',
  },
  'first-citizens': {
    logo: firstCitizensLogo,
    activeClass:
      'border-[oklch(0.45_0.12_250)] bg-[oklch(0.45_0.12_250/0.2)] text-foreground shadow-sm ring-1 ring-[oklch(0.45_0.12_250/0.35)]',
    inactiveClass:
      'border-[oklch(0.45_0.12_250/0.4)] bg-[oklch(0.45_0.12_250/0.1)] text-foreground hover:border-[oklch(0.45_0.12_250/0.65)] hover:bg-[oklch(0.45_0.12_250/0.16)] hover:shadow-sm',
  },
};

interface BankBrandIconProps {
  bankId: string;
  className?: string;
}

export function BankBrandIcon({ bankId, className }: BankBrandIconProps) {
  const brand = BANK_BRANDS[bankId];
  if (!brand) return null;

  return (
    <img
      src={brand.logo}
      alt=""
      aria-hidden
      className={cn('h-6 w-6 shrink-0 rounded-md object-cover', className)}
    />
  );
}
