import { describe, it, expect } from 'vitest';
import { calculateRetention, formatRetentionRate } from '../retention-calculator';

// ─── calculateRetention — per-country rates ───────────────────
describe('calculateRetention — country rates', () => {
  it('applies 5% SRI rate for Ecuador (EC)', () => {
    const result = calculateRetention(2500, 'EC');
    expect(result.retentionRate).toBe(0.05);
    expect(result.retentionAmount).toBe(125);
    expect(result.net).toBe(2375);
    expect(result.regime).toBe('SRI Ecuador');
    expect(result.certificateRequired).toBe(true);
  });

  it('applies 4% DIAN rate for Colombia (CO)', () => {
    const result = calculateRetention(2500, 'CO');
    expect(result.retentionRate).toBe(0.04);
    expect(result.retentionAmount).toBe(100);
    expect(result.net).toBe(2400);
    expect(result.regime).toBe('DIAN Colombia');
  });

  it('applies 10% SAT rate for Mexico (MX)', () => {
    const result = calculateRetention(1000, 'MX');
    expect(result.retentionRate).toBe(0.1);
    expect(result.retentionAmount).toBe(100);
    expect(result.net).toBe(900);
  });

  it('applies 8% SUNAT rate for Peru (PE)', () => {
    const result = calculateRetention(1000, 'PE');
    expect(result.retentionRate).toBe(0.08);
    expect(result.retentionAmount).toBe(80);
    expect(result.net).toBe(920);
  });

  it('applies 10% SII rate for Chile (CL)', () => {
    const result = calculateRetention(500, 'CL');
    expect(result.retentionRate).toBe(0.1);
    expect(result.retentionAmount).toBe(50);
    expect(result.net).toBe(450);
  });

  it('applies 0% for unknown country (DEFAULT)', () => {
    const result = calculateRetention(1000, 'BR');
    expect(result.retentionRate).toBe(0);
    expect(result.retentionAmount).toBe(0);
    expect(result.net).toBe(1000);
    expect(result.certificateRequired).toBe(false);
    expect(result.regime).toBe('Sin retención');
  });
});

// ─── calculateRetention — numeric integrity ───────────────────
describe('calculateRetention — numeric integrity', () => {
  it('preserves gross in result', () => {
    const result = calculateRetention(2500, 'EC');
    expect(result.gross).toBe(2500);
  });

  it('net = gross - retentionAmount', () => {
    const result = calculateRetention(3000, 'CO');
    expect(result.net).toBe(result.gross - result.retentionAmount);
  });

  it('rounds to 2 decimal places', () => {
    const result = calculateRetention(100.33, 'EC');
    const decimals = (result.retentionAmount.toString().split('.')[1] ?? '').length;
    expect(decimals).toBeLessThanOrEqual(2);
  });

  it('handles zero gross without errors', () => {
    const result = calculateRetention(0, 'EC');
    expect(result.net).toBe(0);
    expect(result.retentionAmount).toBe(0);
  });

  it('certificateRequired is false when rate is 0', () => {
    const result = calculateRetention(1000, 'US');
    expect(result.certificateRequired).toBe(false);
  });
});

// ─── formatRetentionRate ──────────────────────────────────────
describe('formatRetentionRate', () => {
  it('formats 0.05 as "5%"', () => {
    expect(formatRetentionRate(0.05)).toBe('5%');
  });

  it('formats 0.1 as "10%"', () => {
    expect(formatRetentionRate(0.1)).toBe('10%');
  });

  it('formats 0.0 as "0%"', () => {
    expect(formatRetentionRate(0)).toBe('0%');
  });
});
