import { t } from '@lingui/core/macro';
import type {
  AccountPurpose,
  BusinessIndustry,
  BusinessType,
  EmploymentStatus,
  ExpectedAnnualRevenue,
  ExpectedMonthlyPayments,
  HighRiskActivity,
  MostRecentOccupation,
  SourceOfFunds,
  BusinessSourceOfFunds,
  BusinessAccountPurpose,
} from './verify-identity.schema';
import {
  ACCOUNT_PURPOSE_OPTIONS as ACCOUNT_PURPOSE_VALUES,
  BUSINESS_ACCOUNT_PURPOSE_OPTIONS as BUSINESS_ACCOUNT_PURPOSE_VALUES,
  BUSINESS_SOURCE_OF_FUNDS_OPTIONS as BUSINESS_SOURCE_OF_FUNDS_VALUES,
  BUSINESS_INDUSTRY_OPTIONS as BUSINESS_INDUSTRY_VALUES,
  BUSINESS_TYPE_OPTIONS as BUSINESS_TYPE_VALUES,
  EMPLOYMENT_STATUS_OPTIONS as EMPLOYMENT_STATUS_VALUES,
  EXPECTED_ANNUAL_REVENUE_OPTIONS as EXPECTED_ANNUAL_REVENUE_VALUES,
  EXPECTED_MONTHLY_PAYMENTS_OPTIONS as EXPECTED_MONTHLY_PAYMENTS_VALUES,
  HIGH_RISK_ACTIVITIES_OPTIONS as HIGH_RISK_ACTIVITIES_VALUES,
  MOST_RECENT_OCCUPATION_OPTIONS as MOST_RECENT_OCCUPATION_VALUES,
  SOURCE_OF_FUNDS_OPTIONS as SOURCE_OF_FUNDS_VALUES,
} from './verify-identity.schema';

export interface OptionItem<T extends string> {
  value: T;
  label: string;
}

export type ActingAsIntermediaryOptionValue = 'true' | 'false';

export function getEmploymentStatusLabel(value: EmploymentStatus): string {
  switch (value) {
    case 'employed':
      return t`Empleado`;
    case 'homemaker':
      return t`Ama de casa / amo de casa`;
    case 'retired':
      return t`Jubilado`;
    case 'self_employed':
      return t`Trabajador independiente`;
    case 'student':
      return t`Estudiante`;
    case 'unemployed':
      return t`Desempleado`;
    default:
      return value;
  }
}

export function getSourceOfFundsLabel(value: SourceOfFunds): string {
  switch (value) {
    case 'company_funds':
      return t`Fondos de la empresa`;
    case 'ecommerce_reseller':
      return t`Revendedor de comercio electrónico`;
    case 'gambling_proceeds':
      return t`Ganancias de juegos de azar`;
    case 'gifts':
      return t`Regalos`;
    case 'government_benefits':
      return t`Beneficios del gobierno`;
    case 'inheritance':
      return t`Herencia`;
    case 'investments_loans':
      return t`Inversiones o préstamos`;
    case 'pension_retirement':
      return t`Pensión o jubilación`;
    case 'salary':
      return t`Salario`;
    case 'sale_of_assets_real_estate':
      return t`Venta de activos o bienes raíces`;
    case 'savings':
      return t`Ahorros`;
    case 'someone_elses_funds':
      return t`Fondos de otra persona`;
    default:
      return value;
  }
}

export function getAccountPurposeLabel(value: AccountPurpose): string {
  switch (value) {
    case 'charitable_donations':
      return t`Donaciones benéficas`;
    case 'ecommerce_retail_payments':
      return t`Pagos de comercio electrónico o minorista`;
    case 'investment_purposes':
      return t`Inversiones`;
    case 'operating_a_company':
      return t`Operar una empresa`;
    case 'payments_to_friends_or_family_abroad':
      return t`Pagos a familiares o amigos en el exterior`;
    case 'personal_or_living_expenses':
      return t`Gastos personales o de vida`;
    case 'protect_wealth':
      return t`Proteger el patrimonio`;
    case 'purchase_goods_and_services':
      return t`Compra de bienes y servicios`;
    case 'receive_payment_for_freelancing':
      return t`Cobrar por trabajo freelance`;
    case 'receive_salary':
      return t`Recibir salario`;
    default:
      return value;
  }
}

export function getExpectedMonthlyPaymentLabel(value: ExpectedMonthlyPayments): string {
  switch (value) {
    case '0_4999':
      return t`Hasta 4,999 USD`;
    case '5000_9999':
      return t`De 5,000 a 9,999 USD`;
    case '10000_49999':
      return t`De 10,000 a 49,999 USD`;
    case '50000_plus':
      return t`50,000 USD o más`;
    default:
      return value;
  }
}

export function getMostRecentOccupationLabel(value: MostRecentOccupation): string {
  switch (value) {
    case '111021':
      return t`Dueño de negocio`;
    case '113031':
      return t`Gerente financiero`;
    case '131111':
      return t`Consultor`;
    case '132011':
      return t`Contador`;
    case '151252':
      return t`Desarrollador de software`;
    case '172199':
      return t`Ingeniero`;
    case '231011':
      return t`Abogado`;
    case '2530XX':
      return t`Docente`;
    case '2912XX':
      return t`Profesional de la salud`;
    case '413091':
      return t`Representante de ventas`;
    case '439061':
      return t`Asistente administrativo`;
    case '999999':
      return t`Otro`;
    default:
      return value;
  }
}

export function getActingAsIntermediaryLabel(value: ActingAsIntermediaryOptionValue): string {
  switch (value) {
    case 'true':
      return t`Sí`;
    case 'false':
      return t`No`;
    default:
      return value;
  }
}

export function buildEmploymentStatusOptions(): OptionItem<EmploymentStatus>[] {
  return EMPLOYMENT_STATUS_VALUES.map((value) => ({
    value,
    label: getEmploymentStatusLabel(value),
  }));
}

export function buildSourceOfFundsOptions(): OptionItem<SourceOfFunds>[] {
  return SOURCE_OF_FUNDS_VALUES.map((value) => ({
    value,
    label: getSourceOfFundsLabel(value),
  }));
}

export function buildAccountPurposeOptions(): OptionItem<AccountPurpose>[] {
  return ACCOUNT_PURPOSE_VALUES.map((value) => ({
    value,
    label: getAccountPurposeLabel(value),
  }));
}

export function buildExpectedMonthlyPaymentOptions(): OptionItem<ExpectedMonthlyPayments>[] {
  return EXPECTED_MONTHLY_PAYMENTS_VALUES.map((value) => ({
    value,
    label: getExpectedMonthlyPaymentLabel(value),
  }));
}

export function buildMostRecentOccupationOptions(): OptionItem<MostRecentOccupation>[] {
  return MOST_RECENT_OCCUPATION_VALUES.map((value) => ({
    value,
    label: getMostRecentOccupationLabel(value),
  }));
}

export function buildActingAsIntermediaryOptions(): OptionItem<ActingAsIntermediaryOptionValue>[] {
  return (['true', 'false'] as const).map((value) => ({
    value,
    label: getActingAsIntermediaryLabel(value),
  }));
}

export function getBusinessTypeLabel(value: BusinessType): string {
  switch (value) {
    case 'cooperative':
      return t`Cooperativa`;
    case 'corporation':
      return t`Sociedad anónima (Corporation)`;
    case 'llc':
      return t`Sociedad de responsabilidad limitada (LLC)`;
    case 'partnership':
      return t`Sociedad colectiva (Partnership)`;
    case 'sole_prop':
      return t`Empresario individual`;
    case 'trust':
      return t`Fideicomiso (Trust)`;
    case 'other':
      return t`Otro`;
    default:
      return value;
  }
}

export function getBusinessIndustryLabel(value: BusinessIndustry): string {
  switch (value) {
    case 'technology':
      return t`Tecnología`;
    case 'finance':
      return t`Finanzas`;
    case 'healthcare':
      return t`Salud`;
    case 'retail':
      return t`Comercio minorista`;
    case 'manufacturing':
      return t`Manufactura`;
    case 'consulting':
      return t`Consultoría`;
    case 'real_estate':
      return t`Bienes raíces`;
    case 'education':
      return t`Educación`;
    case 'entertainment':
      return t`Entretenimiento`;
    case 'transportation':
      return t`Transporte`;
    case 'other':
      return t`Otro`;
    default:
      return value;
  }
}

export function getExpectedAnnualRevenueLabel(value: ExpectedAnnualRevenue): string {
  switch (value) {
    case '0_99999':
      return t`Hasta 99,999 USD`;
    case '100000_999999':
      return t`De 100,000 a 999,999 USD`;
    case '1000000_9999999':
      return t`De 1,000,000 a 9,999,999 USD`;
    case '10000000_49999999':
      return t`De 10,000,000 a 49,999,999 USD`;
    case '50000000_249999999':
      return t`De 50,000,000 a 249,999,999 USD`;
    case '250000000_plus':
      return t`250,000,000 USD o más`;
    default:
      return value;
  }
}

export function getHighRiskActivityLabel(value: HighRiskActivity): string {
  switch (value) {
    case 'none_of_the_above':
      return t`Ninguna de las anteriores`;
    case 'adult_entertainment':
      return t`Entretenimiento para adultos`;
    case 'gambling':
      return t`Juegos de azar`;
    case 'hold_client_funds':
      return t`Custodia de fondos de clientes`;
    case 'investment_services':
      return t`Servicios de inversión`;
    case 'lending_banking':
      return t`Préstamos / banca`;
    case 'marijuana_or_related_services':
      return t`Marihuana o servicios relacionados`;
    case 'money_services':
      return t`Servicios de dinero`;
    case 'nicotine_tobacco_or_related_services':
      return t`Nicotina, tabaco o servicios relacionados`;
    case 'operate_foreign_exchange_virtual_currencies_brokerage_otc':
      return t`Divisas / monedas virtuales / corretaje / OTC`;
    case 'pharmaceuticals':
      return t`Farmacéuticos`;
    case 'precious_metals_precious_stones_jewelry':
      return t`Metales preciosos, piedras o joyería`;
    case 'safe_deposit_box_rentals':
      return t`Alquiler de cajas de seguridad`;
    case 'third_party_payment_processing':
      return t`Procesamiento de pagos de terceros`;
    case 'weapons_firearms_and_explosives':
      return t`Armas, armas de fuego y explosivos`;
    default:
      return value;
  }
}

export function buildBusinessTypeOptions(): OptionItem<BusinessType>[] {
  return BUSINESS_TYPE_VALUES.map((value) => ({
    value,
    label: getBusinessTypeLabel(value),
  }));
}

export function buildBusinessIndustryOptions(): OptionItem<BusinessIndustry>[] {
  return BUSINESS_INDUSTRY_VALUES.map((value) => ({
    value,
    label: getBusinessIndustryLabel(value),
  }));
}

export function buildExpectedAnnualRevenueOptions(): OptionItem<ExpectedAnnualRevenue>[] {
  return EXPECTED_ANNUAL_REVENUE_VALUES.map((value) => ({
    value,
    label: getExpectedAnnualRevenueLabel(value),
  }));
}

export function buildHighRiskActivitiesOptions(): OptionItem<HighRiskActivity>[] {
  return HIGH_RISK_ACTIVITIES_VALUES.map((value) => ({
    value,
    label: getHighRiskActivityLabel(value),
  }));
}

export function getBusinessSourceOfFundsLabel(value: BusinessSourceOfFunds): string {
  switch (value) {
    case 'business_loans':
      return t`Préstamos empresariales`;
    case 'grants':
      return t`Subvenciones`;
    case 'inter_company_funds':
      return t`Fondos entre empresas`;
    case 'investment_proceeds':
      return t`Ingresos por inversiones`;
    case 'legal_settlement':
      return t`Acuerdo legal`;
    case 'owners_capital':
      return t`Capital de los propietarios`;
    case 'pension_retirement':
      return t`Pensión o jubilación`;
    case 'sale_of_assets':
      return t`Venta de activos`;
    case 'sales_of_goods_and_services':
      return t`Venta de bienes y servicios`;
    case 'third_party_funds':
      return t`Fondos de terceros`;
    case 'treasury_reserves':
      return t`Reservas de tesorería`;
    default:
      return value;
  }
}

export function getBusinessAccountPurposeLabel(value: BusinessAccountPurpose): string {
  switch (value) {
    case 'charitable_donations':
      return t`Donaciones benéficas`;
    case 'ecommerce_retail_payments':
      return t`Pagos de comercio electrónico o minorista`;
    case 'investment_purposes':
      return t`Inversiones`;
    case 'other':
      return t`Otro`;
    case 'payments_to_friends_or_family_abroad':
      return t`Pagos a familiares o amigos en el exterior`;
    case 'payroll':
      return t`Nómina`;
    case 'personal_or_living_expenses':
      return t`Gastos personales o de vida`;
    case 'protect_wealth':
      return t`Proteger el patrimonio`;
    case 'purchase_goods_and_services':
      return t`Compra de bienes y servicios`;
    case 'receive_payments_for_goods_and_services':
      return t`Recibir pagos por bienes y servicios`;
    case 'tax_optimization':
      return t`Optimización fiscal`;
    case 'third_party_money_transmission':
      return t`Transmisión de dinero de terceros`;
    case 'treasury_management':
      return t`Gestión de tesorería`;
    default:
      return value;
  }
}

export function buildBusinessSourceOfFundsOptions(): OptionItem<BusinessSourceOfFunds>[] {
  return BUSINESS_SOURCE_OF_FUNDS_VALUES.map((value) => ({
    value,
    label: getBusinessSourceOfFundsLabel(value),
  }));
}

export function buildBusinessAccountPurposeOptions(): OptionItem<BusinessAccountPurpose>[] {
  return BUSINESS_ACCOUNT_PURPOSE_VALUES.map((value) => ({
    value,
    label: getBusinessAccountPurposeLabel(value),
  }));
}
