import { describe, it, expect, vi } from 'vitest';
import { createWebhookPayload, simulateWebhookDispatch } from '../webhook-dispatcher';
import type { WebhookConfig } from '../../types';

const baseConfig = (): WebhookConfig => ({
  endpoint: 'https://api.example.com/webhooks',
  events: ['payment:success'],
  format: 'json',
  retryPolicy: { maxRetries: 3, backoffMs: 1000 },
});

describe('createWebhookPayload', () => {
  it('returns required base fields', () => {
    const payload = createWebhookPayload('payment:success', { txHash: '0xabc' }, baseConfig(), 'wgt_1', 'partner_x');
    expect(payload.event_type).toBe('payment:success');
    expect(payload.widget_id).toBe('wgt_1');
    expect(payload.partner_id).toBe('partner_x');
    expect(payload.data).toEqual({ txHash: '0xabc' });
    expect(typeof payload.timestamp).toBe('string');
    expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
  });

  it('defaults partner_id to "partner_demo" when omitted', () => {
    const payload = createWebhookPayload('payment:failed', {}, baseConfig(), 'wgt_2');
    expect(payload.partner_id).toBe('partner_demo');
  });

  it('does NOT include iso20022_ref for json format', () => {
    const payload = createWebhookPayload('payment:success', {}, baseConfig(), 'wgt_1');
    expect(payload.iso20022_ref).toBeUndefined();
  });

  it('includes iso20022_ref when format is iso20022', () => {
    const config = { ...baseConfig(), format: 'iso20022' as const };
    const payload = createWebhookPayload('payment:success', {}, config, 'wgt_abc123456789');
    expect(typeof payload.iso20022_ref).toBe('string');
    expect(payload.iso20022_ref).toMatch(/^ISO20022-/);
  });

  it('does NOT include integrity_hash when no signingSecret', () => {
    const payload = createWebhookPayload('payment:success', {}, baseConfig(), 'wgt_1');
    expect(payload.integrity_hash).toBeUndefined();
  });

  it('includes integrity_hash when signingSecret is provided', () => {
    const config = { ...baseConfig(), signingSecret: 'supersecret-32-characters-minimum!!' };
    const payload = createWebhookPayload('payment:success', {}, config, 'wgt_1');
    expect(typeof payload.integrity_hash).toBe('string');
    expect(payload.integrity_hash).toMatch(/^sha256=/);
  });

  it('embeds event data verbatim', () => {
    const data = { invoiceId: 'INV-001', txHash: '0xabc', netAmount: 1375 };
    const payload = createWebhookPayload('invoice:paid', data, baseConfig(), 'wgt_1');
    expect(payload.data).toEqual(data);
  });

  it('includes both iso20022_ref and integrity_hash when both options are set', () => {
    const config = { ...baseConfig(), format: 'iso20022' as const, signingSecret: 'secret_at_least_32_chars_long!!!!' };
    const payload = createWebhookPayload('kyc:completed', {}, config, 'wgt_xyz');
    expect(payload.iso20022_ref).toBeDefined();
    expect(payload.integrity_hash).toBeDefined();
  });
});

describe('simulateWebhookDispatch', () => {
  it('resolves with success result', async () => {
    vi.useFakeTimers();
    const promise = simulateWebhookDispatch({
      event_type: 'payment:success',
      timestamp: new Date().toISOString(),
      widget_id: 'wgt_1',
      partner_id: 'partner_demo',
      data: {},
    });
    vi.advanceTimersByTime(200);
    const result = await promise;
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.attempt).toBe(1);
    expect(typeof result.deliveredAt).toBe('string');
    vi.useRealTimers();
  });
});
