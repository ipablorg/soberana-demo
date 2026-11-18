/**
 * MarketplaceLayout - Layout for the Global Connectors Marketplace
 * 
 * Similar to DocsLayout with sticky sidebar for country navigation
 */

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useMobile } from '@/shared/hooks/use-mobile';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';

import { CountrySidebar } from '../components/CountrySidebar';
import { CountryDetail } from '../components/CountryDetail';
import { MarketplaceOverview } from '../components/MarketplaceOverview';
import { useMarketplaceData } from '../hooks/useMarketplaceData';

export function MarketplaceLayout() {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>(null);
  
  const { regionGroups, stats, countries, getCountryByName } = useMarketplaceData();

  // Get selected country data
  const countryData = selectedCountry ? getCountryByName(selectedCountry) : null;

  // Close sidebar on mobile when country is selected
  const handleSelectCountry = (countryName: string) => {
    setSelectedCountry(countryName);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Close sidebar on navigation (mobile)
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}

          {/* Logo & Title */}
          <Link to="/globalconnectors" className="flex items-center gap-3">
            <img src={SoberanaLogoLight} alt="Soberana" className="w-auto dark:hidden" style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}} />
            <img src={SoberanaLogoDark} alt="Soberana" className="w-auto hidden dark:block" style={{height: '3.2vw', minHeight: '20px', maxHeight: '56px'}} />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                Marketplace
              </span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {selectedCountry && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCountry(null)}
              >
                ← All Countries
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container flex-1">
        <div className="flex gap-6 lg:gap-10">
          {/* Sidebar Navigation */}
          {isMobile ? (
            // Mobile: Overlay Sidebar
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                  />

                  {/* Sidebar Drawer */}
                  <motion.aside
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed top-14 left-0 bottom-0 z-50 w-[300px] border-r border-border bg-background"
                  >
                    <ScrollArea className="h-full px-4 py-6">
                      <CountrySidebar
                        regionGroups={regionGroups}
                        selectedCountry={selectedCountry}
                        onSelectCountry={handleSelectCountry}
                      />
                    </ScrollArea>

                    {/* Close Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>
          ) : (
            // Desktop: Sticky Sidebar
            <aside className="hidden w-[280px] shrink-0 lg:block">
              <div className="sticky top-20 h-[calc(100vh-5rem)]">
                <ScrollArea className="h-full py-6 pr-6">
                  <CountrySidebar
                    regionGroups={regionGroups}
                    selectedCountry={selectedCountry}
                    onSelectCountry={handleSelectCountry}
                  />
                </ScrollArea>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 py-6 lg:py-10">
            <div className="mx-auto max-w-4xl">
              {countryData ? (
                <CountryDetail country={countryData} />
              ) : (
                <MarketplaceOverview 
                  stats={stats}
                  regionGroups={regionGroups}
                  countries={countries}
                  onSelectCountry={handleSelectCountry}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
