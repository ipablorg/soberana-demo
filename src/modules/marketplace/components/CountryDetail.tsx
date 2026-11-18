/**
 * CountryDetail - Detailed view of a country's payment capabilities
 * 
 * Displays payout methods, on-ramp/off-ramp support, local products, fees, and limits
 * All data comes from JSON files - no hardcoding
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Building2, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Banknote,
  Zap,
  Info,
  DollarSign,
  Timer,
  Users,
  Package
} from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import type { CountryData, PaymentMethod, PayinMethod, LocalProduct } from '../types';

interface CountryDetailProps {
  country: CountryData;
}

export function CountryDetail({ country }: CountryDetailProps) {
  const hasOnramp = country.onrampSupport?.available;
  const hasOfframp = country.offrampSupport?.available;
  const hasLocalProducts = !!country.localProducts;
  const hasPayinMethods = !!country.payinMethods && country.payinMethods.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Country Header */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              {country.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Region: <span className="text-foreground">{country.region}</span>
            </p>
          </div>
          
          {/* Capability Badges */}
          <div className="flex flex-wrap gap-2">
            {hasOnramp && (
              <Badge className="bg-success/10 text-success border-success/20">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                On-Ramp
              </Badge>
            )}
            {hasOfframp && (
              <Badge className="bg-warning/10 text-warning border-warning/20">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                Off-Ramp
              </Badge>
            )}
            {hasLocalProducts && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Package className="h-3 w-3 mr-1" />
                Local Products
              </Badge>
            )}
            <Badge variant="secondary">
              <Building2 className="h-3 w-3 mr-1" />
              {country.payoutMethods.length} Pay-out Methods
            </Badge>
            {hasPayinMethods && (
              <Badge variant="secondary">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                {country.payinMethods?.length} Pay-in Methods
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* On-Ramp / Off-Ramp Cards */}
      {(hasOnramp || hasOfframp) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasOnramp && country.onrampSupport && (
            <OnrampOfframpCard type="onramp" data={country.onrampSupport} />
          )}
          {hasOfframp && country.offrampSupport && (
            <OnrampOfframpCard type="offramp" data={country.offrampSupport} />
          )}
        </div>
      )}

      {/* Local Products (e.g., Colombia) */}
      {hasLocalProducts && country.localProducts && (
        <LocalProductsSection localProducts={country.localProducts} />
      )}

      {/* Pay-in Methods */}
      {hasPayinMethods && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ArrowDownRight className="h-6 w-6 text-success" />
            Pay-in Methods (Collection)
          </h2>
          
          <div className="space-y-4">
            {country.payinMethods?.map((method, index) => (
              <PayinMethodCard key={index} method={method} />
            ))}
          </div>
        </section>
      )}

      {/* Pay-out Methods */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" />
          Pay-out Methods (Disbursements)
        </h2>
        
        <div className="space-y-4">
          {country.payoutMethods.map((method, index) => (
            <PaymentMethodCard key={index} method={method} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}

// On-Ramp / Off-Ramp Card Component
interface OnrampOfframpCardProps {
  type: 'onramp' | 'offramp';
  data: NonNullable<CountryData['onrampSupport']>;
}

function OnrampOfframpCard({ type, data }: OnrampOfframpCardProps) {
  const isOnramp = type === 'onramp';
  
  return (
    <Card className={`p-6 ${isOnramp ? 'border-success/20' : 'border-warning/20'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${isOnramp ? 'bg-success/10' : 'bg-warning/10'}`}>
          {isOnramp 
            ? <ArrowUpRight className="h-5 w-5 text-success" />
            : <ArrowDownRight className="h-5 w-5 text-warning" />
          }
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{isOnramp ? 'On-Ramp' : 'Off-Ramp'}</h3>
          <p className="text-xs text-muted-foreground">
            {isOnramp ? 'Fiat → Stablecoin' : 'Stablecoin → Fiat'}
          </p>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {data.description}
      </p>
      
      <div className="space-y-3 text-sm">
        {data.currency && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Currency</span>
            <Badge variant="outline">{data.currency}</Badge>
          </div>
        )}
        
        {data.rails && data.rails.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rails</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {data.rails.map(rail => (
                <Badge key={rail} variant="secondary" className="text-xs">{rail}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Fees */}
        {data.fees && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Fee
            </span>
            <span className="text-foreground font-medium text-xs">
              {isOnramp ? data.fees.on_ramp : data.fees.off_ramp}
            </span>
          </div>
        )}
        
        {data.stablecoins && data.stablecoins.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Stablecoins</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {data.stablecoins.map(coin => (
                <Badge key={coin} variant="outline" className="text-xs">{coin}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {data.blockchains && data.blockchains.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Blockchains</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {data.blockchains.slice(0, 4).map(chain => (
                <Badge key={chain} variant="outline" className="text-xs capitalize">{chain}</Badge>
              ))}
              {data.blockchains.length > 4 && (
                <Badge variant="outline" className="text-xs">+{data.blockchains.length - 4}</Badge>
              )}
            </div>
          </div>
        )}
        
        {data.accountType && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Account Type</span>
            <span className="text-foreground text-xs">{data.accountType}</span>
          </div>
        )}
        
        {/* Limits */}
        {data.limits && Object.keys(data.limits).length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Banknote className="h-3 w-3" /> Limits per Rail
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(data.limits).map(([rail, limit]) => (
                <div key={rail} className="text-xs p-1.5 rounded bg-muted/30">
                  <span className="text-muted-foreground block">{rail.replace(/_/g, ' ')}</span>
                  <span className="text-foreground">{limit.min} - {limit.max}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Settlement Times */}
        {data.settlementTimes && Object.keys(data.settlementTimes).length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Timer className="h-3 w-3" /> Settlement Times
            </p>
            {Object.entries(data.settlementTimes).map(([rail, time]) => (
              <div key={rail} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{rail.replace(/_/g, ' ')}</span>
                <span className="text-foreground">{time}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Operating Hours */}
        {data.operatingHours && Object.keys(data.operatingHours).length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Operating Hours
            </p>
            {Object.entries(data.operatingHours).map(([rail, hours]) => (
              <div key={rail} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{rail.replace(/_/g, ' ')}</span>
                <span className="text-foreground">{hours}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Main Banks - Hidden (confidential) */}
        {/* {data.mainBanks && data.mainBanks.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Main Banks
            </p>
            <div className="flex flex-wrap gap-1">
              {data.mainBanks.slice(0, 5).map(bank => (
                <Badge key={bank} variant="outline" className="text-xs">{bank}</Badge>
              ))}
              {data.mainBanks.length > 5 && (
                <Badge variant="outline" className="text-xs">+{data.mainBanks.length - 5}</Badge>
              )}
            </div>
          </div>
        )} */}
        
        {/* Limits by Bank - Hidden (confidential) */}
        {/* {data.limitsByBank && Object.keys(data.limitsByBank).length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Banknote className="h-3 w-3" /> Limits by Bank
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(data.limitsByBank).map(([bank, limits]) => (
                <div key={bank} className="text-xs p-2 rounded bg-muted/30">
                  <span className="text-foreground font-medium block mb-1">{bank}</span>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(limits).map(([limitType, value]) => (
                      <span key={limitType} className="text-muted-foreground">
                        {limitType.replace(/_/g, ' ')}: <span className="text-foreground">{value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
        
        {/* Tarifas Detalladas (Payvalida) */}
        {data.tarifasDetalladas && (
          <div className="pt-2 border-t border-border space-y-3">
            {data.tarifasDetalladas.cashin_corresponsales && (
              <div className="text-xs p-3 rounded-lg bg-linear-to-br from-warning/5 to-warning/10 border border-warning/20">
                <p className="text-warning font-semibold mb-2">💵 {data.tarifasDetalladas.cashin_corresponsales.descripcion}</p>
                <p className="text-foreground font-bold text-sm mb-2">{data.tarifasDetalladas.cashin_corresponsales.tarifa}</p>
                {data.tarifasDetalladas.cashin_corresponsales.metodos_cash && (
                  <div className="mt-2 p-2 bg-background/50 rounded">
                    <span className="text-muted-foreground font-medium">🏪 Métodos Cash: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.tarifasDetalladas.cashin_corresponsales.metodos_cash.map(m => (
                        <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {data.tarifasDetalladas.cashin_corresponsales.metodos_ewallet && (
                  <div className="mt-2 p-2 bg-background/50 rounded">
                    <span className="text-muted-foreground font-medium">📱 Métodos E-Wallet: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.tarifasDetalladas.cashin_corresponsales.metodos_ewallet.map(m => (
                        <Badge key={m} variant="outline" className="text-xs bg-chart-3/10 text-chart-3">{m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {data.tarifasDetalladas.payin_transferencia && (
              <div className="text-xs p-3 rounded-lg bg-linear-to-br from-success/5 to-success/10 border border-success/20">
                <p className="text-success font-semibold mb-2">🏦 {data.tarifasDetalladas.payin_transferencia.descripcion}</p>
                <p className="text-foreground font-bold text-sm mb-2">{data.tarifasDetalladas.payin_transferencia.tarifa}</p>
                {data.tarifasDetalladas.payin_transferencia.canales && (
                  <div className="mt-2 p-2 bg-background/50 rounded">
                    <span className="text-muted-foreground font-medium">🔗 Canales: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.tarifasDetalladas.payin_transferencia.canales.map(c => (
                        <Badge key={c} variant="outline" className="text-xs bg-success/10 text-success">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Partner Info - Hidden for now */}
        {/* {(data.partner || data.partnerInfo) && (
          <div className="pt-2 border-t border-border">
            <div className="text-xs p-2 rounded bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-muted-foreground">Partner:</span>
                <Badge variant="outline" className="text-xs bg-primary/20 text-primary font-semibold">
                  {data.partnerInfo?.nombre || data.partner}
                </Badge>
              </div>
              {data.partnerInfo && (
                <>
                  <div className="text-muted-foreground">
                    📄 {data.partnerInfo.documento}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    📅 Actualizado: {data.partnerInfo.fecha_actualizacion}
                  </div>
                  <div className="text-warning mt-1 font-medium">
                    ⚠️ {data.partnerInfo.condiciones_generales}
                  </div>
                  {data.partnerInfo.servicios && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {data.partnerInfo.servicios.map(servicio => (
                        <Badge key={servicio} variant="secondary" className="text-xs">{servicio}</Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )} */}
        
        {data.nota && (
          <div className="pt-2">
            <Badge variant="secondary" className="text-xs whitespace-normal text-left">{data.nota}</Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

// Local Products Section
interface LocalProductsSectionProps {
  localProducts: NonNullable<CountryData['localProducts']>;
}

function LocalProductsSection({ localProducts }: LocalProductsSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Local Products
        </h2>
        <p className="text-muted-foreground">{localProducts.descripcion}</p>
        <Badge variant="outline" className="mt-2">Base Currency: {localProducts.moneda_base}</Badge>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(localProducts.productos).map(([key, product]) => (
          <LocalProductCard key={key} product={product as LocalProduct} />
        ))}
      </div>

      {/* ACH Cycles (if available) */}
      {localProducts.tiempos_ach_colombia && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {localProducts.tiempos_ach_colombia.descripcion}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {localProducts.tiempos_ach_colombia.ciclos.map((ciclo) => (
              <div key={ciclo.ciclo} className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs font-medium text-muted-foreground">Cycle {ciclo.ciclo}</p>
                <p className="text-sm font-semibold text-foreground">{ciclo.corte}</p>
                <p className="text-xs text-success">{ciclo.acreditacion}</p>
              </div>
            ))}
          </div>
          {localProducts.tiempos_ach_colombia.nota && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Info className="h-3 w-3" />
              {localProducts.tiempos_ach_colombia.nota}
            </p>
          )}
        </Card>
      )}

      {/* Supported Banks - Hidden (confidential) */}
      {/* {localProducts.bancos_soportados && (
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Supported Banks & Wallets
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Banks ({localProducts.bancos_soportados.principales.length})</p>
              <div className="flex flex-wrap gap-1">
                {localProducts.bancos_soportados.principales.slice(0, 10).map(bank => (
                  <Badge key={bank} variant="secondary" className="text-xs">{bank}</Badge>
                ))}
                {localProducts.bancos_soportados.principales.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{localProducts.bancos_soportados.principales.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Digital Wallets</p>
              <div className="flex flex-wrap gap-1">
                {localProducts.bancos_soportados.billeteras_digitales.map(wallet => (
                  <Badge key={wallet} variant="outline" className="text-xs">{wallet}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Correspondents</p>
              <div className="flex flex-wrap gap-1">
                {localProducts.bancos_soportados.corresponsales.map(correspondent => (
                  <Badge key={correspondent} variant="outline" className="text-xs">{correspondent}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )} */}
    </section>
  );
}

// Local Product Card
function LocalProductCard({ product }: { product: LocalProduct }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="p-2 rounded-xl bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">{product.nombre}</h4>
            <Badge variant={product.estado === 'Disponible' ? 'default' : 'secondary'} className="text-xs">
              {product.estado}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{product.descripcion}</p>
        </div>
        <ChevronIcon isExpanded={isExpanded} />
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-border p-4 space-y-4"
        >
          {/* Costs/Fees */}
          {product.costos && Object.keys(product.costos).length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Costs / Fees
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {renderCosts(product.costos)}
              </div>
            </div>
          )}

          {/* Minimum Rates */}
          {product.tarifas_minimas && Object.keys(product.tarifas_minimas).length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-warning" />
                Minimum Rates
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {renderCosts(product.tarifas_minimas)}
              </div>
            </div>
          )}

          {/* TransfiYa Limits (if available) */}
          {product.transfiya?.limites && (
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                TransfiYa Limits
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Max per Transfer</p>
                  <p className="text-sm font-semibold text-foreground">
                    ${(product.transfiya.limites.maxAmountOfTransfer / 1e9).toFixed(0)}B COP
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Daily Count Limit</p>
                  <p className="text-sm font-semibold text-foreground">
                    {product.transfiya.limites.dailyCountOfTransfersLimit.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Daily Sum Limit</p>
                  <p className="text-sm font-semibold text-foreground">
                    ${(product.transfiya.limites.dailySumAmountOfTransfersLimit / 1e9).toFixed(0)}B COP
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Partners/Allies - Hidden (confidential) */}
          {/* {product.aliados && product.aliados.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Partners
              </h5>
              <div className="flex flex-wrap gap-1">
                {product.aliados.map(ally => (
                  <Badge key={ally} variant="outline" className="text-xs">{ally}</Badge>
                ))}
              </div>
            </div>
          )} */}

          {/* Billing */}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            <span className="font-medium">Billing:</span> {product.facturacion.tipo}
            {product.facturacion.descuento && ` • ${product.facturacion.descuento}`}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

// Helper to render nested costs
function renderCosts(costs: Record<string, unknown>, prefix = ''): React.ReactElement[] {
  const items: React.ReactElement[] = [];
  
  Object.entries(costs).forEach(([key, value]) => {
    const label = prefix ? `${prefix} - ${formatLabel(key)}` : formatLabel(key);
    
    if (typeof value === 'string') {
      items.push(
        <div key={label} className="p-2 rounded-lg bg-muted/30 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      const nested = value as Record<string, unknown>;
      if ('valor' in nested) {
        const nota = nested.nota ? String(nested.nota) : null;
        items.push(
          <div key={label} className="p-2 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground">{String(nested.valor)}</span>
            </div>
            {nota && (
              <p className="text-xs text-muted-foreground mt-1">{nota}</p>
            )}
          </div>
        );
      } else {
        const nestedItems = renderCosts(nested, label);
        nestedItems.forEach(item => items.push(item));
      }
    }
  });
  
  return items;
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Payin Method Card
interface PayinMethodCardProps {
  method: PayinMethod;
}

function PayinMethodCard({ method }: PayinMethodCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const getMethodIcon = (methodName: string) => {
    if (methodName?.includes('PIX') || methodName?.includes('UPI') || methodName?.includes('Instant')) return Zap;
    if (methodName?.includes('SPEI') || methodName?.includes('ACH') || methodName?.includes('SEPA')) return Building2;
    if (methodName?.includes('Card') || methodName?.includes('Credit') || methodName?.includes('Debit')) return CreditCard;
    if (methodName?.includes('Wallet') || methodName?.includes('Nequi') || methodName?.includes('Alipay')) return Wallet;
    if (methodName?.includes('Cash') || methodName?.includes('OXXO') || methodName?.includes('Efecty')) return Banknote;
    return ArrowDownRight;
  };
  
  const Icon = getMethodIcon(method.método_payin || '');
  const methodName = method.método_payin || 'Pay-in Method';

  return (
    <Card className="overflow-hidden border-success/20">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
      >
        <div className="p-2 rounded-xl bg-success/10">
          <Icon className="h-5 w-5 text-success" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-foreground">{methodName}</h3>
          {method.monedas_payin && (
            <p className="text-sm text-muted-foreground">
              Currencies: {method.monedas_payin}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {method.tipos_transaccion && (
            <div className="hidden sm:flex gap-1">
              {method.tipos_transaccion.split(',').map((type) => (
                <Badge key={type.trim()} variant="outline" className="text-xs bg-success/10 text-success">
                  {type.trim()}
                </Badge>
              ))}
            </div>
          )}
          {method.tiempo_liquidacion && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {method.tiempo_liquidacion}
            </Badge>
          )}
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border"
        >
          <div className="p-4 space-y-4">
            {/* Grid of Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {method.red_participante && (
                <DetailItem 
                  icon={Building2} 
                  label="Network/Partner" 
                  value={method.red_participante} 
                />
              )}
              
              {method.canales && (
                <DetailItem 
                  icon={Globe} 
                  label="Channels" 
                  value={method.canales} 
                />
              )}
              
              {method.fuente_fx && (
                <DetailItem 
                  icon={Zap} 
                  label="FX Source" 
                  value={method.fuente_fx} 
                />
              )}

              {method.horario_operacion && (
                <DetailItem 
                  icon={Clock} 
                  label="Operating Hours" 
                  value={method.horario_operacion} 
                />
              )}
            </div>

            {/* Fees */}
            {method.fees && Object.keys(method.fees).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    Fees & Costs
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(method.fees).map(([feeType, value]) => (
                      value && (
                        <div key={feeType} className="p-2 rounded-lg bg-success/5 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {formatLabel(feeType)}
                          </span>
                          <span className="text-sm font-medium text-foreground">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Limits */}
            {method.límites && Object.keys(method.límites).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Transaction Limits
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(method.límites).map(([type, limits]) => (
                      <div key={type} className="p-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-xs font-medium text-muted-foreground">{type}</p>
                        <p className="text-xs text-foreground">
                          <span className="text-success">{limits?.min}</span>
                          {' → '}
                          <span className="text-warning">{limits?.max}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Mandatory Data */}
            {method.datos_obligatorios && method.datos_obligatorios.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Required Information
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {method.datos_obligatorios.map((field, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Supporting Documents */}
            {method.documentos_soporte && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Supporting Documents
                  </h4>
                  <p className="text-sm text-muted-foreground">{method.documentos_soporte}</p>
                </div>
              </>
            )}

            {/* Transaction Proof */}
            {method.comprobante_transaccion && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Transaction Proof:</span> {method.comprobante_transaccion}
              </div>
            )}

            {/* Beneficiary Narrative */}
            {method.narrativa_beneficiario && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Customer View:</span> {method.narrativa_beneficiario}
              </div>
            )}

            {/* Notes */}
            {method.notas && (
              <div className="flex gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <Info className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{method.notas}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

// Payment Method Card (Nium Payout)
interface PaymentMethodCardProps {
  method: PaymentMethod;
}

function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const getMethodIcon = (methodName: string) => {
    if (methodName?.includes('SWIFT') || methodName?.includes('WIRE')) return Building2;
    if (methodName?.includes('WALLET')) return Wallet;
    if (methodName?.includes('VISA') || methodName?.includes('CARD')) return CreditCard;
    if (methodName?.includes('ACH') || methodName?.includes('SEPA')) return Zap;
    return Banknote;
  };
  
  const Icon = getMethodIcon(method.método_pago || '');
  const methodName = method.método_pago || 'Payment Method';

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
      >
        <div className="p-2 rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-foreground">{methodName}</h3>
          {method.monedas_pago && (
            <p className="text-sm text-muted-foreground">
              Currencies: {method.monedas_pago}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {method.tipos_pago && (
            <div className="hidden sm:flex gap-1">
              {method.tipos_pago.split(',').map((type) => (
                <Badge key={type.trim()} variant="outline" className="text-xs">
                  {type.trim()}
                </Badge>
              ))}
            </div>
          )}
          <ChevronIcon isExpanded={isExpanded} />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border"
        >
          <div className="p-4 space-y-4">
            {/* Grid of Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {method.red_participante && (
                <DetailItem 
                  icon={Building2} 
                  label="Network Participant" 
                  value={method.red_participante} 
                />
              )}
              
              {method.canales && (
                <DetailItem 
                  icon={Globe} 
                  label="Channels" 
                  value={method.canales} 
                />
              )}
              
              {method.corte_entrega && (
                <DetailItem 
                  icon={Clock} 
                  label="Cut-off & Delivery" 
                  value={method.corte_entrega} 
                />
              )}
              
              {method.fuente_fx && (
                <DetailItem 
                  icon={Zap} 
                  label="FX Source" 
                  value={method.fuente_fx} 
                />
              )}
            </div>

            {/* Limits */}
            {method.límites && Object.keys(method.límites).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Transaction Limits
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(method.límites).map(([type, limits]) => (
                      <div key={type} className="p-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-xs font-medium text-muted-foreground">{type}</p>
                        <p className="text-xs text-foreground">
                          <span className="text-success">{limits?.min}</span>
                          {' → '}
                          <span className="text-warning">{limits?.max}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Mandatory Data */}
            {method.datos_obligatorios && method.datos_obligatorios.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Mandatory Data Requirements
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {method.datos_obligatorios.map((field, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Supporting Documents */}
            {method.documentos_soporte && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Supporting Documents
                  </h4>
                  <p className="text-sm text-muted-foreground">{method.documentos_soporte}</p>
                </div>
              </>
            )}

            {/* Beneficiary Narrative */}
            {method.narrativa_beneficiario && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Beneficiary Statement:</span> {method.narrativa_beneficiario}
              </div>
            )}

            {/* Notes */}
            {method.notas && (
              <div className="flex gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{method.notas}</p>
              </div>
            )}
            
            {/* Proof of Payment */}
            {method.prueba_pago && (
              <div className="flex gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <Info className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{method.prueba_pago}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
}

function DetailItem({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ChevronIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <motion.svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="h-5 w-5 text-muted-foreground"
      animate={{ rotate: isExpanded ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path d="m6 9 6 6 6-6"/>
    </motion.svg>
  );
}
