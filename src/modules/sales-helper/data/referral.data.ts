import type { ReferralVolumeRange, ReferralProductRate, ReferralCompany } from '../types';

export const REFERRAL_VOLUME_RANGES: ReferralVolumeRange[] = [
  { volume: 6_000_000, volumeFormatted: '$6,000,000', rate: 0.007, commission: 0.04, earnedUsd: 1_680, earnedCop: 6_300_000 },
  { volume: 5_000_000, volumeFormatted: '$5,000,000', rate: 0.007, commission: 0.04, earnedUsd: 1_400, earnedCop: 5_250_000 },
  { volume: 4_000_000, volumeFormatted: '$4,000,000', rate: 0.007, commission: 0.04, earnedUsd: 1_120, earnedCop: 4_200_000 },
  { volume: 3_000_000, volumeFormatted: '$3,000,000', rate: 0.007, commission: 0.04, earnedUsd: 840, earnedCop: 3_150_000 },
  { volume: 2_000_000, volumeFormatted: '$2,000,000', rate: 0.007, commission: 0.04, earnedUsd: 560, earnedCop: 2_100_000 },
  { volume: 1_000_000, volumeFormatted: '$1,000,000', rate: 0.007, commission: 0.04, earnedUsd: 280, earnedCop: 1_050_000 },
  { volume: 500_000, volumeFormatted: '$500,000', rate: 0.007, commission: 0.04, earnedUsd: 140, earnedCop: 525_000 },
];

export const REFERRAL_OFF_RAMP_RATES: ReferralProductRate[] = [
  { fullRate: 0.009, referrerCommission: 0.06 },
  { fullRate: 0.0075, referrerCommission: 0.05 },
  { fullRate: 0.007, referrerCommission: 0.04 },
  { fullRate: 0.0065, referrerCommission: 0.03 },
  { fullRate: 0.006, referrerCommission: 0.02 },
  { fullRate: 0.0055, referrerCommission: 0.02 },
  { fullRate: 0.004, referrerCommission: 0.02 },
];

export const REFERRAL_ON_RAMP_RATES: ReferralProductRate[] = [
  { fullRate: 0.009, referrerCommission: 0.06 },
  { fullRate: 0.0075, referrerCommission: 0.05 },
  { fullRate: 0.007, referrerCommission: 0.04 },
  { fullRate: 0.0065, referrerCommission: 0.03 },
  { fullRate: 0.006, referrerCommission: 0.02 },
  { fullRate: 0.004, referrerCommission: 0.02 },
];

export const REFERRAL_COMEX_RATES: ReferralProductRate[] = [
  { fullRate: 0.009, referrerCommission: 0.06 },
  { fullRate: 0.008, referrerCommission: 0.05 },
  { fullRate: 0.007, referrerCommission: 0.04 },
  { fullRate: 0.0065, referrerCommission: 0.03 },
  { fullRate: 0.006, referrerCommission: 0.02 },
];

export const REFERRAL_TESORERIA_RATES: ReferralProductRate[] = [
  { fullRate: 0.009, referrerCommission: 0.06 },
  { fullRate: 0.008, referrerCommission: 0.05 },
  { fullRate: 0.007, referrerCommission: 0.04 },
  { fullRate: 0.0065, referrerCommission: 0.03 },
  { fullRate: 0.006, referrerCommission: 0.02 },
];

export const REFERRAL_COMPANIES_OFF_RAMP: ReferralCompany[] = [
  { name: 'LUXURY USDT', volume: '$5,022,602', rate: '0.40%', commission: '2.00%', earnedUsd: '$402', earnedCop: '$1,506,781' },
  { name: 'PABRAL S.A.S', volume: '$4,313,051', rate: '0.75%', commission: '5.00%', earnedUsd: '$1,617', earnedCop: '$6,065,228' },
  { name: 'AGRO SAN JUAN', volume: '$2,719,478', rate: '0.60%', commission: '2.00%', earnedUsd: '$326', earnedCop: '$1,223,765' },
  { name: 'EMPERIUM EMPRESARIAL', volume: '$2,052,213', rate: '0.55%', commission: '2.00%', earnedUsd: '$226', earnedCop: '$846,538' },
  { name: 'INNOVA TECH LAB', volume: '$1,385,495', rate: '0.60%', commission: '2.00%', earnedUsd: '$166', earnedCop: '$623,473' },
  { name: 'LINUSD', volume: '$1,194,560', rate: '0.75%', commission: '5.00%', earnedUsd: '$448', earnedCop: '$1,679,850' },
  { name: 'TECNOVIX', volume: '$874,987', rate: '0.75%', commission: '5.00%', earnedUsd: '$328', earnedCop: '$1,230,450' },
  { name: 'CROSSPAY SOLUTIONS', volume: '$746,772', rate: '0.40%', commission: '2.00%', earnedUsd: '$60', earnedCop: '$224,032' },
  { name: 'Digital Tradedge', volume: '$741,833', rate: '0.60%', commission: '2.00%', earnedUsd: '$89', earnedCop: '$333,825' },
];

export const REFERRAL_COMPANIES_TESORERIA: ReferralCompany[] = [
  { name: 'SUPERPAY S.A.S.', volume: '$11,552,726,031', rate: '0.20%', commission: '5.00%', earnedUsd: '', earnedCop: '$1,155,273' },
  { name: 'INOVA TECH LAB S.A.S.', volume: '$5,787,388,320', rate: '0.20%', commission: '5.00%', earnedUsd: '', earnedCop: '$578,739' },
];
