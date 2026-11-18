import { describe, expect, it } from 'vitest';

import {
  getReceiveRailCurrency,
  getReceiveRailLabel,
} from '../receive-presentation';
import { getRuntimeStablecoinLabel } from '../runtime-stablecoin';

describe('receive presentation helpers', () => {
  it('maps audited rail labels from one normalization source', () => {
    expect(getReceiveRailLabel({ railCode: 'co_breb' })).toBe('COP');
    expect(getReceiveRailLabel({ railCode: 'ec_bank_transfer' })).toBe('ECU Transferencia');
    expect(getReceiveRailLabel({ railCode: 'ec_point_of_sale' })).toBe('ECU Punto físico');
    expect(getReceiveRailLabel({ railCode: 'pe_bank_transfer' })).toBe('PER Transferencia');
    expect(getReceiveRailLabel({ railCode: 'faster_payments' })).toBe('GBR');
  });

  it('avoids raw-code fallback when a mapped rail has an ugly backend name', () => {
    expect(
      getReceiveRailLabel({
        railCode: 'ec_bank_transfer',
        railName: 'EC_BANK_TRANSFER',
      }),
    ).toBe('ECU Transferencia');
  });

  it('prefers a meaningful backend display name for unmapped rails', () => {
    expect(
      getReceiveRailLabel({
        railCode: 'custom_local_transfer',
        railName: 'Transferencia local',
      }),
    ).toBe('Transferencia local');
  });

  it('falls back to a prettified rail label and currency when nothing else exists', () => {
    expect(getReceiveRailLabel({ railCode: 'custom_local_transfer' })).toBe('Custom Local Transfer');
    expect(getReceiveRailCurrency('faster_payments')).toBe('GBP');
  });
});

describe('runtime stablecoin helper', () => {
  it('derives visible stablecoin copy from runtime wallet currency', () => {
    expect(getRuntimeStablecoinLabel('usdt')).toBe('USDT');
    expect(getRuntimeStablecoinLabel('USDC')).toBe('USDC');
    expect(getRuntimeStablecoinLabel('eurc')).toBe('EURC');
  });

  it('stays neutral when runtime truth is unavailable or not stablecoin', () => {
    expect(getRuntimeStablecoinLabel('usd')).toBeNull();
    expect(getRuntimeStablecoinLabel(undefined)).toBeNull();
  });
});
