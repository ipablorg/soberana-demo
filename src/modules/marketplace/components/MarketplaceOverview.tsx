/**
 * MarketplaceOverview - Landing view when no country is selected
 * 
 * Shows stats, featured countries, and getting started info
 */

import { motion } from 'framer-motion';
import { 
  Globe, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Book
} from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { MarketplaceStats, RegionGroup, CountryData } from '../types';

interface MarketplaceOverviewProps {
  stats: MarketplaceStats;
  regionGroups: RegionGroup[];
  countries: CountryData[];
  onSelectCountry: (countryName: string) => void;
}

// Featured country names
const FEATURED_COUNTRY_NAMES = [
  'United States of America',
  'Mexico',
  'Brazil',
  'Colombia',
  'Germany',
  'Spain',
];

export function MarketplaceOverview({ 
  stats, 
  regionGroups,
  countries,
  onSelectCountry 
}: MarketplaceOverviewProps) {
  // Get featured countries dynamically from data
  const featuredCountries = FEATURED_COUNTRY_NAMES.map(name => {
    const country = countries.find(c => c.name === name);
    if (!country) return null;
    
    // Get rails from onramp support (from JSON data)
    const rails = country.onrampSupport?.rails?.slice(0, 2) || [];
    
    return {
      name: country.name === 'United States of America' ? 'United States' : country.name,
      fullName: country.name,
      currency: country.onrampSupport?.currency || 'USD',
      rails,
      hasOnramp: !!country.onrampSupport?.available,
      hasOfframp: !!country.offrampSupport?.available,
    };
  }).filter(Boolean) as Array<{
    name: string;
    fullName: string;
    currency: string;
    rails: string[];
    hasOnramp: boolean;
    hasOfframp: boolean;
  }>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      {/* Hero */}
      <header className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.55_0.15_280/0.3),transparent)]" />
        
        <div className="relative z-10 space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Global Connectors
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Loopay Marketplace
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl">
            Access payment rails in <span className="text-foreground font-semibold">{stats.totalCountries}+ countries</span> with 
            {' '}<span className="text-foreground font-semibold">{stats.totalPaymentMethods}+ payout methods</span> and
            {' '}<span className="text-foreground font-semibold">{stats.totalPayinMethods}+ payin methods</span>. 
            Connect fiat and crypto globally with instant On-Ramp and Off-Ramp capabilities.
          </p>

          {/* API Reference CTA */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button 
              variant="gradient" 
              size="lg"
              asChild
              className="shadow-sm"
            >
              <a href="/globalconnectors/api">
                <Book className="h-5 w-5 mr-2" />
                View API Reference
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              asChild
            >
              <a href="/docs">
                Documentation
              </a>
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-50" />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          icon={Globe} 
          value={stats.totalCountries} 
          label="Countries" 
          color="primary"
        />
        <StatCard 
          icon={ArrowDownRight} 
          value={stats.totalPayinMethods} 
          label="Pay-in Methods" 
          color="success"
        />
        <StatCard 
          icon={Building2} 
          value={stats.totalPaymentMethods} 
          label="Pay-out Methods" 
          color="primary"
        />
        <StatCard 
          icon={ArrowUpRight} 
          value={stats.onrampCountries} 
          label="On-Ramp Countries" 
          color="success"
        />
        <StatCard 
          icon={ArrowDownRight} 
          value={stats.offrampCountries} 
          label="Off-Ramp Countries" 
          color="warning"
        />
      </div>

      {/* Transaction Types */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Transaction Types</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-success/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <ArrowDownRight className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Pay-in</h3>
                <p className="text-xs text-muted-foreground">Collection Methods</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive payments via PIX, SPEI, UPI, PSE, cards, wallets, and more. Accept local payment methods globally.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Pay-out</h3>
                <p className="text-xs text-muted-foreground">Disbursements</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Send payments directly to bank accounts in 200+ countries via SWIFT, ACH, SEPA, local rails.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <ArrowUpRight className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">On-Ramp</h3>
                <p className="text-xs text-muted-foreground">Fiat → Stablecoin</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Convert fiat currency (USD, EUR, MXN, BRL, COP) to stablecoins (USDC, USDT, EURC) via local payment rails.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <ArrowDownRight className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Off-Ramp</h3>
                <p className="text-xs text-muted-foreground">Stablecoin → Fiat</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Convert stablecoins back to local currency and withdraw to bank accounts via ACH, SEPA, SPEI, PIX.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured Countries */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Featured Countries</h2>
        <p className="text-muted-foreground mb-6">Countries with full On-Ramp and Off-Ramp support</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCountries.map((country) => (
            <Card
              key={country.fullName}
              className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onSelectCountry(country.fullName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-muted">
                    <Globe className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{country.name}</h3>
                    <p className="text-xs text-muted-foreground">{country.currency}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {country.rails.map(rail => (
                    <Badge key={rail} variant="secondary" className="text-xs">{rail}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                {country.hasOnramp && (
                  <Badge className="bg-success/10 text-success border-success/20 text-xs">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    On-Ramp
                  </Badge>
                )}
                {country.hasOfframp && (
                  <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    Off-Ramp
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Region Coverage */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Global Coverage</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {regionGroups.map((region) => (
            <Card key={region.name} className="p-4 text-center">
              <h3 className="font-semibold text-foreground text-sm">{region.name}</h3>
              <p className="text-2xl font-bold text-foreground mt-1">{region.countries.length}</p>
              <p className="text-xs text-muted-foreground">countries</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="pb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Why Loopay Marketplace</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-primary/10 h-fit">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Instant Settlement</h3>
              <p className="text-sm text-muted-foreground">
                Real-time payments via PIX, SPEI, TransfiYa, and SEPA Instant.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-primary/10 h-fit">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Built-in KYC/KYB verification and regulatory compliance.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-primary/10 h-fit">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Best Rates</h3>
              <p className="text-sm text-muted-foreground">
                Live interbank FX rates 24/7 with transparent pricing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: 'primary' | 'success' | 'warning';
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card className="p-4">
      <div className={`p-2 rounded-xl ${colorClasses[color]} w-fit mb-2`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold text-foreground font-mono tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
