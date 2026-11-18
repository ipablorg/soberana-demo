/**
 * Transfer instructions for virtual accounts — US bank guides plus
 * generic step-by-step flows per currency / payment rail.
 *
 * Translation: user-facing strings live in `useTransferGuides()` via Lingui.
 */

import { useLingui } from '@lingui/react/macro';
import { getRuntimeStablecoinLabel } from '@/shared/lib/runtime-stablecoin';

export type PaymentRail = 'ACH' | 'WIRE';

export type StepFieldKey =
  | 'routing_number'
  | 'account_number'
  | 'beneficiary_name'
  | 'bank_name'
  | 'swift_code'
  | 'beneficiary_address'
  | 'clabe'
  | 'iban'
  | 'nit'
  | 'reference'
  | 'account_type';

export interface GuideStep {
  id: string;
  title: string;
  body: string;
  copyField?: StepFieldKey;
}

export interface BankGuide {
  id: string;
  name: string;
  country: string;
  rails: PaymentRail[];
  accentClass: string;
  steps: GuideStep[];
}

export interface ConversionExplainerStep {
  id: string;
  title: string;
  body: string;
}

export interface ConversionExplainer {
  title: string;
  subtitle: string;
  steps: ConversionExplainerStep[];
}

export interface FeeTier {
  /** Upper bound in USD (exclusive). `null` represents the open-ended top tier. */
  thresholdUsd: number | null;
  feeUsd: number;
  /** Human label for this tier, e.g. "< $5,000/día". */
  label: string;
}

/** Tabs whose rail is "scan this QR with your bank app" instead of "transfer to these fields". */
export interface PaymentLinkConfig {
  kind: 'qr';
}

/** Top-level tab: one per currency / rail family. */
export interface CurrencyRailGuide {
  id: string;
  currency: string;
  /** When true, show the US bank picker below the currency tabs. */
  hasUsBankPicker?: boolean;
  label: string;
  flag: string;
  steps: GuideStep[];
  conversion: ConversionExplainer;
  footerHint: string;
  /** Optional fees footer block (Littio-style "Costos de comisión"). */
  fees?: FeeTier[];
  /** When present, the tab renders a payment-link flow (e.g. Bre-B QR) instead of the step list. */
  paymentLink?: PaymentLinkConfig;
}

export interface TransferGuidesResult {
  currencyRails: CurrencyRailGuide[];
  usBankGuides: BankGuide[];
}

export interface TransferGuideOptions {
  walletCurrency?: string | null;
}

export function matchCurrencyRailId(account: {
  currency: string;
  payment_rail: string;
}): string {
  const currency = account.currency.toUpperCase();
  const rail = account.payment_rail.toLowerCase();

  if (currency === 'USD' || rail === 'ach' || rail === 'wire' || rail === 'us_ach' || rail === 'us_wire') {
    return 'usd';
  }
  if (currency === 'MXN' || rail === 'spei') return 'mxn';
  if (currency === 'COP' || rail.startsWith('co_')) return 'cop';
  if (currency === 'EUR' || rail === 'sepa' || rail === 'iban') return 'eur';
  if (currency === 'BRL' || rail === 'pix') return 'brl';
  return 'usd';
}

export function accountMatchesCurrencyRail(
  account: { currency: string; payment_rail: string },
  railId: string,
): boolean {
  return matchCurrencyRailId(account) === railId;
}

function useUsBankGuides(): BankGuide[] {
  const { t } = useLingui();
  return [
    // source: https://info.bankofamerica.com/es/digital-banking/wire-transfers
    {
      id: 'bank-of-america',
      name: 'Bank of America',
      country: 'US',
      rails: ['WIRE'],
      accentClass: 'bg-[oklch(0.55_0.18_25)]',
      steps: [
        {
          id: 'login',
          title: t`Inicia sesión en Bank of America`,
          body: t`Abre la app o entra a bankofamerica.com.`,
        },
        {
          id: 'transfers',
          title: t`Entra a “Pay & Transfer”`,
          body: t`En el menú principal, selecciona la opción de transferencias.`,
        },
        {
          id: 'wire',
          title: t`Selecciona “Wire transfer”`,
          body: t`Elige el tipo doméstico. ACH no aplica para tu cuenta Loopay desde BoA.`,
        },
        {
          id: 'routing',
          title: t`Pega el Routing (ABA) Number`,
          body: t`BoA lo llama “ABA Routing”.`,
          copyField: 'routing_number',
        },
        {
          id: 'account',
          title: t`Pega el Account Number`,
          body: t`Sin espacios ni guiones.`,
          copyField: 'account_number',
        },
        {
          id: 'beneficiary',
          title: t`Confirma el nombre del beneficiario`,
          body: t`Debe coincidir con el titular registrado en Loopay.`,
          copyField: 'beneficiary_name',
        },
        {
          id: 'send',
          title: t`Revisa y envía`,
          body: t`Cutoff diario 5 p.m. ET. Los fondos llegan el mismo día hábil.`,
        },
      ],
    },
    // source: https://www.chase.com/digital/transfer
    {
      id: 'chase',
      name: 'Chase',
      country: 'US',
      rails: ['ACH', 'WIRE'],
      accentClass: 'bg-[oklch(0.45_0.18_250)]',
      steps: [
        {
          id: 'login',
          title: t`Abre Chase Mobile o chase.com`,
          body: t`Ve a la pestaña “Pay & Transfer”.`,
        },
        {
          id: 'external',
          title: t`Selecciona “External accounts”`,
          body: t`Es la sección para mover dinero a cuentas en otros bancos.`,
        },
        {
          id: 'add',
          title: t`Toca “Add external account”`,
          body: t`Vas a registrar tu cuenta Loopay una sola vez.`,
        },
        {
          id: 'routing',
          title: t`Pega el Routing Number`,
          body: t`Chase lo llama “Routing/ABA”.`,
          copyField: 'routing_number',
        },
        {
          id: 'account',
          title: t`Pega el Account Number`,
          body: t`Cópialo exactamente como aparece en Loopay.`,
          copyField: 'account_number',
        },
        {
          id: 'verify',
          title: t`Verifica la cuenta`,
          body: t`Chase suele pedir depósitos de prueba (2–3 días) o login instantáneo del otro banco.`,
        },
        {
          id: 'schedule',
          title: t`Programa la transferencia`,
          body: t`Ingresa monto, fecha y confirma el envío.`,
        },
        {
          id: 'send',
          title: t`Autoriza y envía`,
          body: t`Sin costo desde Chase. Acredita en 2–3 días hábiles.`,
        },
      ],
    },
    // source: https://www.capitalone.com/bank/money-management/banking-basics/how-to-transfer-money/
    {
      id: 'capital-one',
      name: 'Capital One',
      country: 'US',
      rails: ['ACH'],
      accentClass: 'bg-[oklch(0.55_0.18_260)]',
      steps: [
        {
          id: 'login',
          title: t`Abre Capital One 360`,
          body: t`Inicia sesión en la app o capitalone.com.`,
        },
        {
          id: 'link',
          title: t`Selecciona “Link accounts”`,
          body: t`O “Add external accounts” según tu interfaz.`,
        },
        {
          id: 'routing',
          title: t`Pega el Routing Number`,
          body: t`Usa el valor de tu cuenta Loopay.`,
          copyField: 'routing_number',
        },
        {
          id: 'account',
          title: t`Pega el Account Number`,
          body: t`Verifica antes de continuar.`,
          copyField: 'account_number',
        },
        {
          id: 'verify',
          title: t`Verifica la titularidad`,
          body: t`Con login de Loopay o confirmando los depósitos de prueba.`,
        },
        {
          id: 'send',
          title: t`Inicia el envío`,
          body: t`Sin comisión. Acredita en 2–3 días hábiles.`,
        },
      ],
    },
    // source: gap — URL devolvió 404. Pasos basados en conocimiento general
    // del flujo "Transfer & Pay" → "Add External Account" en Wells Fargo Online.
    {
      id: 'wells-fargo',
      name: 'Wells Fargo',
      country: 'US',
      rails: ['ACH', 'WIRE'],
      accentClass: 'bg-[oklch(0.6_0.18_55)]',
      steps: [
        {
          id: 'login',
          title: t`Entra a Wells Fargo Online`,
          body: t`Desde web o app, abre “Transfer & Pay”.`,
        },
        {
          id: 'choose',
          title: t`Elige el tipo de envío`,
          body: t`“Add External Account” para ACH, “Wire Money” para wire doméstico.`,
        },
        {
          id: 'routing',
          title: t`Pega el Routing Number`,
          body: t`Usa el valor de tu cuenta Loopay.`,
          copyField: 'routing_number',
        },
        {
          id: 'account',
          title: t`Pega el Account Number`,
          body: t`Sin espacios ni guiones.`,
          copyField: 'account_number',
        },
        {
          id: 'beneficiary',
          title: t`Confirma el beneficiario`,
          body: t`Debe coincidir con el titular registrado en Loopay.`,
          copyField: 'beneficiary_name',
        },
        {
          id: 'send',
          title: t`Autoriza con 2FA y envía`,
          body: t`Revisa el monto antes de confirmar.`,
        },
      ],
    },
    // source: https://www.td.com/us/en/personal-banking/digital-payments
    {
      id: 'td-bank',
      name: 'TD Bank',
      country: 'US',
      rails: ['ACH'],
      accentClass: 'bg-[oklch(0.55_0.18_145)]',
      steps: [
        {
          id: 'login',
          title: t`Inicia sesión en TD Bank Online`,
          body: t`Desde la web o la app.`,
        },
        {
          id: 'billpay',
          title: t`Abre la pestaña “Bill Pay”`,
          body: t`Desde aquí enrolas tu cuenta externa Loopay.`,
        },
        {
          id: 'routing',
          title: t`Pega el Routing Number`,
          body: t`Usa el valor de tu cuenta Loopay.`,
          copyField: 'routing_number',
        },
        {
          id: 'account',
          title: t`Pega el Account Number`,
          body: t`Verifica antes de continuar.`,
          copyField: 'account_number',
        },
        {
          id: 'send',
          title: t`Inicia la transferencia ACH`,
          body: t`Wire desde TD Bank requiere visitar sucursal — usa ACH desde el portal.`,
        },
      ],
    },
    // source: gap — URL devolvió 403. Pasos basados en flujo estándar de
    // First Citizens "Transfers" → "External transfer".
    {
      id: 'first-citizens',
      name: 'First Citizens',
      country: 'US',
      rails: ['ACH'],
      accentClass: 'bg-[oklch(0.45_0.12_250)]',
      steps: [
        {
          id: 'login',
          title: t`Entra a First Citizens Digital Banking`,
          body: t`Desde web o app móvil.`,
        },
        {
          id: 'transfers',
          title: t`Abre “Transfers”`,
          body: t`Y selecciona la opción de transferencia externa.`,
        },
        {
          id: 'routing',
          title: t`Pega el Routing Number`,
          body: t`Usa el valor de tu cuenta Loopay.`,
          copyField: 'routing_number',
        },
        {
          id: 'account',
          title: t`Pega el Account Number`,
          body: t`Sin espacios ni guiones.`,
          copyField: 'account_number',
        },
        {
          id: 'beneficiary',
          title: t`Confirma el beneficiario`,
          body: t`Debe coincidir con el titular registrado en Loopay.`,
          copyField: 'beneficiary_name',
        },
        {
          id: 'send',
          title: t`Autoriza y envía`,
          body: t`ACH acredita en 1–3 días hábiles.`,
        },
      ],
    },
  ];
}

export function useTransferGuides(options: TransferGuideOptions = {}): TransferGuidesResult {
  const { t } = useLingui();
  const stablecoinLabel = getRuntimeStablecoinLabel(options.walletCurrency);
  const stablecoinNoun = stablecoinLabel ?? t`dólares digitales`;
  const stablecoinTicker = stablecoinLabel ?? t`tu saldo digital`;

  const usdConversion: ConversionExplainer = {
    title: t`Qué pasa después`,
    subtitle: stablecoinLabel
      ? t`Tu transferencia en dólares se acredita automáticamente en ${stablecoinLabel} dentro de Loopay.`
      : t`Tu transferencia en dólares se acredita automáticamente dentro de Loopay.`,
    steps: [
      {
        id: 'arrival',
        title: t`Tu USD llega a Loopay`,
        body: t`Recibimos la transferencia en tu cuenta virtual. Te avisamos cuando llegue.`,
      },
      {
        id: 'convert',
        title: stablecoinLabel ? t`Lo acreditamos en ${stablecoinLabel}` : t`Lo acreditamos en tu wallet`,
        body: t`Al instante, sin comisión cambiaria de Loopay.`,
      },
      {
        id: 'wallet',
        title: t`Queda en tu wallet`,
        body: t`Disponible para enviar, cambiar o pagar.`,
      },
    ],
  };

  const fiatConversion = (currencyLabel: string): ConversionExplainer => ({
    title: t`Qué pasa después`,
    subtitle: stablecoinLabel
      ? t`Tu transferencia en ${currencyLabel} se acredita y convierte a ${stablecoinLabel} en tu wallet Loopay.`
      : t`Tu transferencia en ${currencyLabel} se acredita en tu wallet Loopay.`,
    steps: [
      {
        id: 'arrival',
        title: t`Recibimos tu transferencia`,
        body: t`El dinero entra a tu cuenta virtual en ${currencyLabel}. El tiempo depende de tu banco (habitualmente el mismo día o 1–3 días hábiles).`,
      },
      {
        id: 'convert',
        title: stablecoinLabel ? t`Conversión a ${stablecoinLabel}` : t`Conversión a saldo digital`,
        body: t`Loopay convierte el saldo a ${stablecoinNoun} (${stablecoinTicker}) con la tasa del momento.`,
      },
      {
        id: 'wallet',
        title: t`Listo en tu wallet`,
        body: t`Ya puedes usarlo para pagos internacionales, cambio o retiro.`,
      },
    ],
  });

  const currencyRails: CurrencyRailGuide[] = [
    {
      id: 'usd',
      currency: 'USD',
      hasUsBankPicker: true,
      label: t`Dólares · EE.UU.`,
      flag: '🇺🇸',
      steps: [],
      conversion: usdConversion,
      footerHint: t`¿Tu banco no aparece? Los mismos campos sirven para cualquier banco de EE.UU.`,
    },
    {
      id: 'mxn',
      currency: 'MXN',
      label: t`Pesos · México`,
      flag: '🇲🇽',
      steps: [
        {
          id: 'open-bank',
          title: t`Abre la app de tu banco`,
          body: t`BBVA, Banorte, Santander, HSBC u otro banco mexicano. Busca “Transferencias” o “SPEI”.`,
        },
        {
          id: 'new-transfer',
          title: t`Nueva transferencia SPEI`,
          body: t`Elige enviar a otra cuenta (no entre tus propias cuentas). SPEI es casi instantáneo en horario bancario.`,
        },
        {
          id: 'clabe',
          title: t`Pega la CLABE`,
          body: t`Son 18 dígitos. Es el dato más importante — sin la CLABE correcta el banco rechaza el envío.`,
          copyField: 'clabe',
        },
        {
          id: 'beneficiary',
          title: t`Nombre del beneficiario`,
          body: t`Debe coincidir exactamente con el titular de tu cuenta Loopay.`,
          copyField: 'beneficiary_name',
        },
        {
          id: 'bank',
          title: t`Banco receptor`,
          body: t`Algunas apps lo completan solas al pegar la CLABE. Si te lo piden, usa este valor.`,
          copyField: 'bank_name',
        },
        {
          id: 'reference',
          title: t`Referencia (si aplica)`,
          body: t`Si tu banco pide concepto o referencia, usa este valor para que identifiquemos tu depósito.`,
          copyField: 'reference',
        },
        {
          id: 'send',
          title: t`Confirma y envía`,
          body: t`Revisa monto y CLABE. SPEI acredita en minutos dentro del horario bancario.`,
        },
      ],
      conversion: fiatConversion(t`pesos mexicanos`),
      footerHint: t`Funciona igual desde cualquier banco mexicano que soporte SPEI.`,
    },
    {
      id: 'cop',
      currency: 'COP',
      label: t`Pesos · Colombia`,
      flag: '🇨🇴',
      steps: [
        {
          id: 'open-bank',
          title: t`Abre tu banco colombiano`,
          body: t`Bancolombia, Davivienda, Banco de Bogotá, Nequi empresarial, etc. Busca “Transferir” o “Enviar dinero”.`,
        },
        {
          id: 'destination',
          title: t`Agrega cuenta destino`,
          body: t`Elige transferencia a otra entidad (ACH / interbancaria). No uses PSE para recargar — eso es para pagos, no depósitos.`,
        },
        {
          id: 'bank',
          title: t`Banco destino`,
          body: t`Selecciona o escribe el banco que aparece en tus datos Loopay.`,
          copyField: 'bank_name',
        },
        {
          id: 'account',
          title: t`Número de cuenta`,
          body: t`Copia el número exacto, sin puntos ni espacios.`,
          copyField: 'account_number',
        },
        {
          id: 'account-type',
          title: t`Tipo de cuenta`,
          body: t`Ahorros o corriente — debe coincidir con lo que indica Loopay.`,
          copyField: 'account_type',
        },
        {
          id: 'nit',
          title: t`NIT del beneficiario`,
          body: t`Muchos bancos colombianos lo piden para transferencias empresariales.`,
          copyField: 'nit',
        },
        {
          id: 'beneficiary',
          title: t`Nombre del titular`,
          body: t`Debe coincidir con el registrado en Loopay.`,
          copyField: 'beneficiary_name',
        },
        {
          id: 'reference',
          title: t`Referencia de pago`,
          body: t`Inclúyela si tu banco la solicita — ayuda a acreditar más rápido.`,
          copyField: 'reference',
        },
        {
          id: 'send',
          title: t`Envía la transferencia`,
          body: t`ACH Colombia suele tardar el mismo día o hasta 1 día hábil.`,
        },
      ],
      conversion: fiatConversion(t`pesos colombianos`),
      footerHint: t`Los mismos datos funcionan desde cualquier banco colombiano con transferencias ACH.`,
    },
    {
      id: 'eur',
      currency: 'EUR',
      label: t`Euros · Europa`,
      flag: '🇪🇺',
      steps: [
        {
          id: 'open-bank',
          title: t`Abre tu banca online`,
          body: t`Desde la app o web de tu banco en la zona SEPA (UE / EEE). Busca “Transferencia” o “SEPA”.`,
        },
        {
          id: 'sepa',
          title: t`Elige transferencia SEPA`,
          body: t`SEPA es para euros dentro de Europa. No uses SWIFT si tu banco ofrece SEPA — es más rápido y barato.`,
        },
        {
          id: 'iban',
          title: t`Pega el IBAN`,
          body: t`Empieza con letras del país (ej. DE, FR, ES). Cópialo completo, sin espacios.`,
          copyField: 'iban',
        },
        {
          id: 'beneficiary',
          title: t`Nombre del beneficiario`,
          body: t`Debe coincidir con el titular de tu cuenta Loopay.`,
          copyField: 'beneficiary_name',
        },
        {
          id: 'swift',
          title: t`SWIFT / BIC (si lo piden)`,
          body: t`Algunos bancos lo solicitan además del IBAN en transferencias internacionales.`,
          copyField: 'swift_code',
        },
        {
          id: 'reference',
          title: t`Concepto / referencia`,
          body: t`Opcional pero recomendado para identificar tu depósito.`,
          copyField: 'reference',
        },
        {
          id: 'send',
          title: t`Confirma y envía`,
          body: t`SEPA suele acreditarse en 1 día hábil (a veces el mismo día).`,
        },
      ],
      conversion: fiatConversion(t`euros`),
      footerHint: t`Válido para cualquier banco SEPA en la Unión Europea y países asociados.`,
    },
    {
      id: 'brl',
      currency: 'BRL',
      label: t`Reales · Brasil`,
      flag: '🇧🇷',
      steps: [
        {
          id: 'open-bank',
          title: t`Abre la app de tu banco`,
          body: t`Nubank, Itaú, Bradesco, Banco do Brasil, etc. Busca la sección PIX.`,
        },
        {
          id: 'pix-transfer',
          title: t`PIX → Transferir`,
          body: t`Elige enviar por datos bancarios (agência + conta) o por chave PIX si tu cuenta Loopay la muestra.`,
        },
        {
          id: 'bank',
          title: t`Banco destino`,
          body: t`Institución receptora según tus datos Loopay.`,
          copyField: 'bank_name',
        },
        {
          id: 'account',
          title: t`Agência y conta / chave PIX`,
          body: t`Copia el número de cuenta o chave exactamente como aparece en Loopay.`,
          copyField: 'account_number',
        },
        {
          id: 'beneficiary',
          title: t`Nome do favorecido`,
          body: t`Nome do titular da conta — deve ser idêntico ao registrado.`,
          copyField: 'beneficiary_name',
        },
        {
          id: 'reference',
          title: t`Descrição / referência`,
          body: t`Se o app pedir descrição, use a referência de Loopay.`,
          copyField: 'reference',
        },
        {
          id: 'send',
          title: t`Confirme e envie`,
          body: t`PIX acredita en segundos, 24/7.`,
        },
      ],
      conversion: fiatConversion(t`reales brasileños`),
      footerHint: t`Qualquer banco brasileiro com PIX funciona da mesma forma.`,
    },
  ];

  const usBankGuides = useUsBankGuides();

  return {
    currencyRails,
    usBankGuides,
  };
}

/** @deprecated Use useTransferGuides — kept for gradual migration. */
export function useBankGuides(options: TransferGuideOptions = {}) {
  const { currencyRails, usBankGuides } = useTransferGuides(options);
  const usd = currencyRails.find((r) => r.id === 'usd');
  return {
    guides: usBankGuides,
    conversion: usd?.conversion ?? currencyRails[0].conversion,
  };
}
