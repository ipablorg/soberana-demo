/**
 * useMarketplaceData Hook
 * 
 * Loads and organizes payment data from JSON files for the marketplace
 * Data sources:
 * - playbook-payout.json: Global payout capabilities (Nium)
 * - loopay-productos-colombia.json: Colombia local products
 * - bridge-api-documentation.json: On-ramp/Off-ramp regions
 * - loopay-transactions-api.json: Transaction fees
 */

import { useMemo } from 'react';
import playbookPayout from '@/data/playbook-payout.json';
import playbookPayin from '@/data/playbook-payin.json';
import loopayProductosColombia from '@/data/loopay-productos-colombia.json';
import bridgeApiDocs from '@/data/bridge-api-documentation.json';
import loopayTransactionsApi from '@/data/loopay-transactions-api.json';
import type { CountryData, RegionGroup, MarketplaceStats, OnrampOffRampSupport, LocalProducts, TransactionFees } from '../types';

// Region data type from bridge API
interface RegionApiData {
  moneda: string;
  rails_pago: string[];
  tipo_cuenta: string;
  tiempo_liquidacion: Record<string, string>;
  fees?: {
    on_ramp: string;
    off_ramp: string;
    fee_minimo: string;
  };
  tarifas_detalladas?: {
    cashin_corresponsales?: {
      descripcion: string;
      tarifa: string;
      metodos_cash?: string[];
      metodos_ewallet?: string[];
    };
    payin_transferencia?: {
      descripcion: string;
      tarifa: string;
      canales?: string[];
    };
  };
  limites?: Record<string, { min: string; max: string }>;
  limites_por_banco?: Record<string, Record<string, string>>;
  horario_operacion?: Record<string, string>;
  bancos_principales?: string[];
  corresponsales_cash?: string[];
  billeteras_digitales?: string[];
  partner?: string;
  partner_info?: {
    nombre: string;
    documento: string;
    fecha_actualizacion: string;
    condiciones_generales: string;
    servicios: string[];
  };
  identificadores_bre_b?: string[];
  nota?: string;
  estado?: string;
  paises_cubiertos?: string[];
}

// Build on-ramp/off-ramp support from bridge API documentation
function buildOnrampOfframpFromBridgeApi(): Record<string, { onramp?: OnrampOffRampSupport; offramp?: OnrampOffRampSupport }> {
  const result: Record<string, { onramp?: OnrampOffRampSupport; offramp?: OnrampOffRampSupport }> = {};
  const regions = (bridgeApiDocs as { bridge_api: { regiones_soportadas: Record<string, RegionApiData> } }).bridge_api.regiones_soportadas;
  
  // Map region names to country names in playbook
  const regionToCountry: Record<string, string[]> = {
    'USA': ['United States of America'],
    'Mexico': ['Mexico'],
    'Brazil': ['Brazil'],
    'Colombia': ['Colombia'],
    'Argentina': ['Argentina'],
    'Chile': ['Chile'],
    'Peru': ['Peru'],
    'Ecuador': ['Ecuador'],
    'Panama': ['Panama'],
    'Uruguay': ['Uruguay'],
    'Costa Rica': ['Costa Rica'],
    'Dominican Republic': ['Dominican Republic'],
    'Guatemala': ['Guatemala'],
    'El Salvador': ['El Salvador'],
    'Honduras': ['Honduras'],
    'Paraguay': ['Paraguay'],
    'Bolivia': ['Bolivia'],
    'Nicaragua': ['Nicaragua'],
    'Jamaica': ['Jamaica'],
    'Trinidad and Tobago': ['Trinidad and Tobago'],
    'SEPA': regions.SEPA?.paises_cubiertos || []
  };
  
  Object.entries(regions).forEach(([regionKey, data]) => {
    const countries = regionToCountry[regionKey] || [];
    
    countries.forEach(countryName => {
      const support: OnrampOffRampSupport = {
        available: true,
        currency: data.moneda,
        rails: data.rails_pago,
        stablecoins: data.moneda === 'EUR' ? ['USDC', 'EURC'] : ['USDC', 'USDT'],
        blockchains: ['ethereum', 'polygon', 'base', 'arbitrum', 'solana'],
        description: `${data.moneda} via ${data.rails_pago.join('/')}`,
        accountType: data.tipo_cuenta,
        settlementTimes: data.tiempo_liquidacion,
        fees: data.fees,
        tarifasDetalladas: data.tarifas_detalladas ? {
          cashin_corresponsales: data.tarifas_detalladas.cashin_corresponsales,
          payin_transferencia: data.tarifas_detalladas.payin_transferencia
        } : undefined,
        limits: data.limites,
        limitsByBank: data.limites_por_banco,
        operatingHours: data.horario_operacion,
        mainBanks: data.bancos_principales,
        corresponsalesCash: data.corresponsales_cash,
        billeterasDigitales: data.billeteras_digitales,
        partner: data.partner || data.partner_info?.nombre,
        partnerInfo: data.partner_info,
        nota: data.nota || data.estado
      };
      
      result[countryName] = {
        onramp: { 
          ...support, 
          description: `Deposit ${data.moneda} via ${data.rails_pago.join('/')} and receive stablecoins` 
        },
        offramp: { 
          ...support, 
          description: `Convert stablecoins to ${data.moneda} and withdraw via ${data.rails_pago.join('/')}` 
        }
      };
    });
  });
  
  // Enhance Colombia with local products data
  const colombiaData = (loopayProductosColombia as { loopay_productos_colombia: { 
    productos: Record<string, unknown>;
    rails_disponibles?: Record<string, unknown>;
  } }).loopay_productos_colombia;
  
  const crossborder = colombiaData.productos.crossborder as { 
    proceso: { 
      recarga: { redes_autorizadas: string[]; monedas: string[] };
      dispersion: { tiempo_entrega: Record<string, string> };
    };
    costos: { conversion_usdt_cop: string };
  };
  
  // Add BRE-B rail to Colombia if available
  const railsDisponibles = colombiaData.rails_disponibles;
  const breB = railsDisponibles?.bre_b as { 
    tiempo_liquidacion: string; 
    disponibilidad: string;
    limite_por_transaccion: number;
  } | undefined;
  
  if (result['Colombia']) {
    // Add BRE-B to rails if available
    if (breB && !result['Colombia'].onramp?.rails?.includes('BRE-B')) {
      result['Colombia'].onramp = {
        ...result['Colombia'].onramp!,
        rails: ['BRE-B', ...(result['Colombia'].onramp?.rails || [])],
        stablecoins: crossborder.proceso.recarga.monedas,
        blockchains: crossborder.proceso.recarga.redes_autorizadas.map(r => r.toLowerCase()),
      };
      result['Colombia'].offramp = {
        ...result['Colombia'].offramp!,
        rails: ['BRE-B', ...(result['Colombia'].offramp?.rails || [])],
        stablecoins: crossborder.proceso.recarga.monedas,
        blockchains: crossborder.proceso.recarga.redes_autorizadas.map(r => r.toLowerCase()),
        description: `Convert USDC/USDT to COP. Fee: ${crossborder.costos.conversion_usdt_cop}`,
      };
    }
  }
  
  return result;
}

// Get local products for a country
function getLocalProducts(countryName: string): LocalProducts | undefined {
  if (countryName === 'Colombia') {
    const data = (loopayProductosColombia as { loopay_productos_colombia: unknown }).loopay_productos_colombia;
    return data as LocalProducts;
  }
  return undefined;
}

// Get transaction fees from API documentation
function getTransactionFees(): TransactionFees {
  const fees = (loopayTransactionsApi as { loopay_transactions_api: { fees: unknown } }).loopay_transactions_api.fees;
  return fees as TransactionFees;
}

export function useMarketplaceData() {
  const { countries, regionGroups, stats, transactionFees } = useMemo(() => {
    const playbook = playbookPayout.playbook as Record<string, { región: string; secciones: unknown[] }>;
    const playbookPayinData = playbookPayin.playbook as Record<string, { región: string; secciones: unknown[] }>;
    const onrampOfframpData = buildOnrampOfframpFromBridgeApi();
    const fees = getTransactionFees();
    
    // Transform data into CountryData format
    const countriesMap: Map<string, CountryData> = new Map();
    
    Object.entries(playbook).forEach(([countryName, data]) => {
      const countryData: CountryData = {
        name: countryName,
        region: data.región || 'Otros',
        payoutMethods: data.secciones as CountryData['payoutMethods'],
        payinMethods: playbookPayinData[countryName]?.secciones as CountryData['payinMethods'],
        onrampSupport: onrampOfframpData[countryName]?.onramp,
        offrampSupport: onrampOfframpData[countryName]?.offramp,
        localProducts: getLocalProducts(countryName),
      };
      countriesMap.set(countryName, countryData);
    });

    // Group by region
    const regionGroupsMap: Map<string, CountryData[]> = new Map();
    
    countriesMap.forEach((country) => {
      const existing = regionGroupsMap.get(country.region) || [];
      existing.push(country);
      regionGroupsMap.set(country.region, existing);
    });

    // Sort countries within each region
    regionGroupsMap.forEach((countries, region) => {
      regionGroupsMap.set(
        region,
        countries.sort((a, b) => a.name.localeCompare(b.name))
      );
    });

    // Convert to array and sort regions
    const regionOrder = ['Norteamérica', 'Sudamérica', 'Europa', 'Asia', 'África', 'Oceanía'];
    const sortedRegionGroups: RegionGroup[] = Array.from(regionGroupsMap.entries())
      .sort(([a], [b]) => {
        const indexA = regionOrder.indexOf(a);
        const indexB = regionOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      })
      .map(([name, countries]) => ({ name, countries }));

    // Calculate stats
    const allCountries = Array.from(countriesMap.values());
    const stats: MarketplaceStats = {
      totalCountries: allCountries.length,
      totalPaymentMethods: allCountries.reduce((acc, c) => acc + c.payoutMethods.length, 0),
      totalPayinMethods: allCountries.reduce((acc, c) => acc + (c.payinMethods?.length || 0), 0),
      onrampCountries: allCountries.filter(c => c.onrampSupport?.available).length,
      offrampCountries: allCountries.filter(c => c.offrampSupport?.available).length,
      regions: sortedRegionGroups.map(r => r.name) as MarketplaceStats['regions'],
    };

    return {
      countries: allCountries,
      regionGroups: sortedRegionGroups,
      stats,
      transactionFees: fees,
    };
  }, []);

  const getCountryByName = (name: string): CountryData | undefined => {
    return countries.find(c => c.name.toLowerCase() === name.toLowerCase());
  };

  const searchCountries = (query: string): CountryData[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return countries.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.region.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    countries,
    regionGroups,
    stats,
    transactionFees,
    getCountryByName,
    searchCountries,
  };
}
