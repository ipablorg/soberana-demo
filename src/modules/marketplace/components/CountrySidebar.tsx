/**
 * CountrySidebar - Navigation sidebar for marketplace countries
 * 
 * Displays countries grouped by region with search functionality
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ChevronDown, ChevronRight, ArrowUpRight, ArrowDownRight } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import type { RegionGroup, CountryData } from '../types';
import { Trans, useLingui } from '@lingui/react/macro';

// Country name to flag emoji mapping
const countryFlags: Record<string, string> = {
  // Norteamérica
  'Anguilla': '🇦🇮', 'Antigua': '🇦🇬', 'Aruba': '🇦🇼', 'Bahamas': '🇧🇸', 'Barbados': '🇧🇧',
  'Belize': '🇧🇿', 'Bermuda': '🇧🇲', 'Bonaire, Sint Eustatius and Saba': '🇧🇶', 
  'British Virgin Islands': '🇻🇬', 'Canada': '🇨🇦', 'Cayman Islands': '🇰🇾', 
  'Costa Rica': '🇨🇷', 'Dominica': '🇩🇲', 'Dominican Republic': '🇩🇴', 'El Salvador': '🇸🇻',
  'Greenland': '🇬🇱', 'Grenada': '🇬🇩', 'Guadeloupe': '🇬🇵', 'Guatemala': '🇬🇹',
  'Honduras': '🇭🇳', 'Jamaica': '🇯🇲', 'Martinique': '🇲🇶', 'Mexico': '🇲🇽',
  'Montserrat': '🇲🇸', 'Nicaragua': '🇳🇮', 'Panama': '🇵🇦', 'Puerto Rico': '🇵🇷',
  'Saint Kitts and Nevis': '🇰🇳', 'Saint Lucia': '🇱🇨', 'Saint Martin (French part)': '🇲🇫',
  'Saint Vincent and the Grenadines': '🇻🇨', 'Sint Maarten (Dutch part)': '🇸🇽',
  'Trinidad and Tobago': '🇹🇹', 'Turks and Caicos Islands': '🇹🇨',
  'United States Minor Outlying Islands': '🇺🇲', 'United States of America': '🇺🇸',
  'Virgin Islands (U.S.)': '🇻🇮',
  // Sudamérica
  'Argentina': '🇦🇷', 'Bolivia': '🇧🇴', 'Brazil': '🇧🇷', 'Chile': '🇨🇱', 'Colombia': '🇨🇴',
  'Curaçao': '🇨🇼', 'Ecuador': '🇪🇨', 'Falkland Islands (Malvinas)': '🇫🇰',
  'French Guiana': '🇬🇫', 'Guyana': '🇬🇾', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪',
  'Suriname': '🇸🇷', 'Uruguay': '🇺🇾', 'Venezuela': '🇻🇪',
  // Europa
  'Albania': '🇦🇱', 'Andorra': '🇦🇩', 'Austria': '🇦🇹', 'Belarus': '🇧🇾', 'Belgium': '🇧🇪',
  'Bosnia and Herzegovina': '🇧🇦', 'Bulgaria': '🇧🇬', 'Croatia': '🇭🇷', 'Cyprus': '🇨🇾',
  'Czech Republic': '🇨🇿', 'Czechia': '🇨🇿', 'Denmark': '🇩🇰', 'Estonia': '🇪🇪', 
  'Faroe Islands': '🇫🇴', 'Finland': '🇫🇮', 'France': '🇫🇷', 'Germany': '🇩🇪', 
  'Gibraltar': '🇬🇮', 'Greece': '🇬🇷', 'Guernsey': '🇬🇬', 'Hungary': '🇭🇺', 
  'Iceland': '🇮🇸', 'Ireland': '🇮🇪', 'Isle of Man': '🇮🇲', 'Italy': '🇮🇹', 
  'Jersey': '🇯🇪', 'Kosovo': '🇽🇰', 'Latvia': '🇱🇻', 'Liechtenstein': '🇱🇮', 
  'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺', 'Malta': '🇲🇹', 'Moldova': '🇲🇩', 
  'Monaco': '🇲🇨', 'Montenegro': '🇲🇪', 'Netherlands': '🇳🇱', 'North Macedonia': '🇲🇰',
  'Norway': '🇳🇴', 'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Romania': '🇷🇴', 
  'Russia': '🇷🇺', 'San Marino': '🇸🇲', 'Serbia': '🇷🇸', 'Slovakia': '🇸🇰', 
  'Slovenia': '🇸🇮', 'Spain': '🇪🇸', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 
  'Ukraine': '🇺🇦', 'United Kingdom': '🇬🇧', 'Vatican City': '🇻🇦',
  // Asia
  'Afghanistan': '🇦🇫', 'Armenia': '🇦🇲', 'Azerbaijan': '🇦🇿', 'Bahrain': '🇧🇭',
  'Bangladesh': '🇧🇩', 'Bhutan': '🇧🇹', 'Brunei': '🇧🇳', 'Cambodia': '🇰🇭',
  'China': '🇨🇳', 'Georgia': '🇬🇪', 'Hong Kong': '🇭🇰', 'India': '🇮🇳',
  'Indonesia': '🇮🇩', 'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Israel': '🇮🇱', 'Japan': '🇯🇵',
  'Jordan': '🇯🇴', 'Kazakhstan': '🇰🇿', 'Kuwait': '🇰🇼', 'Kyrgyzstan': '🇰🇬',
  'Laos': '🇱🇦', 'Lebanon': '🇱🇧', 'Macau': '🇲🇴', 'Malaysia': '🇲🇾', 'Maldives': '🇲🇻',
  'Mongolia': '🇲🇳', 'Myanmar': '🇲🇲', 'Nepal': '🇳🇵', 'North Korea': '🇰🇵',
  'Oman': '🇴🇲', 'Pakistan': '🇵🇰', 'Palestine': '🇵🇸', 'Philippines': '🇵🇭',
  'Qatar': '🇶🇦', 'Saudi Arabia': '🇸🇦', 'Singapore': '🇸🇬', 'South Korea': '🇰🇷',
  'Sri Lanka': '🇱🇰', 'Syria': '🇸🇾', 'Taiwan': '🇹🇼', 'Tajikistan': '🇹🇯',
  'Thailand': '🇹🇭', 'Timor-Leste': '🇹🇱', 'Turkey': '🇹🇷', 'Turkmenistan': '🇹🇲',
  'United Arab Emirates': '🇦🇪', 'Uzbekistan': '🇺🇿', 'Vietnam': '🇻🇳', 'Yemen': '🇾🇪',
  // África
  'Algeria': '🇩🇿', 'Angola': '🇦🇴', 'Benin': '🇧🇯', 'Botswana': '🇧🇼', 
  'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮', 'Cameroon': '🇨🇲', 'Cape Verde': '🇨🇻',
  'Central African Republic': '🇨🇫', 'Chad': '🇹🇩', 'Comoros': '🇰🇲', 'Congo': '🇨🇬',
  'Democratic Republic of the Congo': '🇨🇩', 'Djibouti': '🇩🇯', 'Egypt': '🇪🇬',
  'Equatorial Guinea': '🇬🇶', 'Eritrea': '🇪🇷', 'Eswatini': '🇸🇿', 'Ethiopia': '🇪🇹',
  'Gabon': '🇬🇦', 'Gambia': '🇬🇲', 'Ghana': '🇬🇭', 'Guinea': '🇬🇳', 
  'Guinea-Bissau': '🇬🇼', 'Ivory Coast': '🇨🇮', "Côte d'Ivoire": '🇨🇮', 'Kenya': '🇰🇪',
  'Lesotho': '🇱🇸', 'Liberia': '🇱🇷', 'Libya': '🇱🇾', 'Madagascar': '🇲🇬',
  'Malawi': '🇲🇼', 'Mali': '🇲🇱', 'Mauritania': '🇲🇷', 'Mauritius': '🇲🇺',
  'Mayotte': '🇾🇹', 'Morocco': '🇲🇦', 'Mozambique': '🇲🇿', 'Namibia': '🇳🇦',
  'Niger': '🇳🇪', 'Nigeria': '🇳🇬', 'Réunion': '🇷🇪', 'Rwanda': '🇷🇼',
  'Saint Helena': '🇸🇭', 'São Tomé and Príncipe': '🇸🇹', 'Senegal': '🇸🇳',
  'Seychelles': '🇸🇨', 'Sierra Leone': '🇸🇱', 'Somalia': '🇸🇴', 'South Africa': '🇿🇦',
  'South Sudan': '🇸🇸', 'Sudan': '🇸🇩', 'Tanzania': '🇹🇿', 'Togo': '🇹🇬',
  'Tunisia': '🇹🇳', 'Uganda': '🇺🇬', 'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼',
  // Oceanía
  'Australia': '🇦🇺', 'Fiji': '🇫🇯', 'French Polynesia': '🇵🇫', 'Guam': '🇬🇺',
  'Kiribati': '🇰🇮', 'Marshall Islands': '🇲🇭', 'Micronesia': '🇫🇲', 'Nauru': '🇳🇷',
  'New Caledonia': '🇳🇨', 'New Zealand': '🇳🇿', 'Palau': '🇵🇼', 
  'Papua New Guinea': '🇵🇬', 'Samoa': '🇼🇸', 'Solomon Islands': '🇸🇧',
  'Tonga': '🇹🇴', 'Tuvalu': '🇹🇻', 'Vanuatu': '🇻🇺', 'Wallis and Futuna': '🇼🇫',
  'American Samoa': '🇦🇸', 'Cook Islands': '🇨🇰', 'Norfolk Island': '🇳🇫',
  'Northern Mariana Islands': '🇲🇵', 'Pitcairn Islands': '🇵🇳', 'Tokelau': '🇹🇰',
};

// Get flag for a country (returns globe emoji if not found)
function getCountryFlag(countryName: string): string {
  return countryFlags[countryName] || '🌐';
}

interface CountrySidebarProps {
  regionGroups: RegionGroup[];
  selectedCountry: string | null;
  onSelectCountry: (countryName: string) => void;
}

export function CountrySidebar({ 
  regionGroups, 
  selectedCountry, 
  onSelectCountry 
}: CountrySidebarProps) {
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedRegions, setExpandedRegions] = React.useState<Set<string>>(new Set());

  // Filter countries based on search
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return regionGroups;

    const query = searchQuery.toLowerCase();
    return regionGroups
      .map(group => ({
        ...group,
        countries: group.countries.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query)
        )
      }))
      .filter(group => group.countries.length > 0);
  }, [regionGroups, searchQuery]);

  const toggleRegion = (regionName: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(regionName)) {
        next.delete(regionName);
      } else {
        next.add(regionName);
      }
      return next;
    });
  };

  // Expand all regions when searching
  React.useEffect(() => {
    if (searchQuery) {
      setExpandedRegions(new Set(filteredGroups.map(g => g.name)));
    }
  }, [searchQuery, filteredGroups]);

  return (
    <nav className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t`Search countries...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-muted/50"
        />
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <Globe className="h-3 w-3" />
        <span>{regionGroups.reduce((acc, g) => acc + g.countries.length, 0)} <Trans>countries</Trans></span>
      </div>

      {/* Region Groups */}
      <div className="space-y-2">
        {filteredGroups.map((group) => (
          <div key={group.name} className="space-y-1">
            {/* Region Header */}
            <button
              onClick={() => toggleRegion(group.name)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              {expandedRegions.has(group.name) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{group.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {group.countries.length}
              </Badge>
            </button>

            {/* Countries */}
            {expandedRegions.has(group.name) && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-0.5 ml-4"
              >
                {group.countries.map((country) => (
                  <CountryItem
                    key={country.name}
                    country={country}
                    isActive={selectedCountry === country.name}
                    onClick={() => onSelectCountry(country.name)}
                  />
                ))}
              </motion.ul>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm"><Trans>No countries found</Trans></p>
        </div>
      )}
    </nav>
  );
}

interface CountryItemProps {
  country: CountryData;
  isActive: boolean;
  onClick: () => void;
}

function CountryItem({ country, isActive, onClick }: CountryItemProps) {
  const hasOnramp = country.onrampSupport?.available;
  const hasOfframp = country.offrampSupport?.available;
  const flag = getCountryFlag(country.name);

  return (
    <li className="relative">
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors duration-150",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <span className="text-base shrink-0">{flag}</span>
        <span className="truncate flex-1 text-left">{country.name}</span>
        
        {/* On-ramp / Off-ramp indicators */}
        <div className="flex items-center gap-1">
          {hasOnramp && (
            <span title="On-ramp available">
              <ArrowUpRight className="h-3 w-3 text-success" />
            </span>
          )}
          {hasOfframp && (
            <span title="Off-ramp available">
              <ArrowDownRight className="h-3 w-3 text-warning" />
            </span>
          )}
        </div>
      </button>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="active-country-indicator"
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r"
          initial={false}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </li>
  );
}
