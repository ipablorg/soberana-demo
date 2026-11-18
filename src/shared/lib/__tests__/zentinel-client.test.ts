/**
 * Unit coverage for the Zentinel transport layer.
 *
 * We exercise the three pieces that can silently break without these
 * tests:
 *   1. `buildHeaders`      → wire shape of every request
 *   2. `mapZentinelError`  → HTTP+code classification used by UI toasts
 *   3. `createSSEParser`   → SSE frame handling (the format actually
 *      returned by the local Zentinel v0.1.0: `: ready` heartbeats
 *      followed by one or more `data: {...}` frames with `done` last).
 *
 * Integration tests against a live backend live separately; these are
 * pure unit tests and should pass without network access.
 */

import { describe, it, expect } from 'vitest';
import {
  buildHeaders,
  mapZentinelError,
  createSSEParser,
} from '../zentinel-client';

describe('buildHeaders', () => {
  it('emits Content-Type JSON and Accept by default', () => {
    const h = buildHeaders({ jwt: null, soberana_token: null });
    expect(h.get('Content-Type')).toBe('application/json');
    expect(h.get('Accept')).toContain('application/json');
    expect(h.has('Authorization')).toBe(false);
    expect(h.has('X-Soberana-Token')).toBe(false);
  });

  it('adds Authorization when a Zentinel JWT is present', () => {
    const h = buildHeaders({ jwt: 'abc.def.ghi', soberana_token: null });
    expect(h.get('Authorization')).toBe('Bearer abc.def.ghi');
    expect(h.has('X-Soberana-Token')).toBe(false);
  });

  it('adds X-Soberana-Token when a Firebase token is present', () => {
    const h = buildHeaders({
      jwt: 'zz',
      soberana_token: 'firebase-123',
    });
    expect(h.get('Authorization')).toBe('Bearer zz');
    expect(h.get('X-Soberana-Token')).toBe('firebase-123');
  });
});

describe('mapZentinelError', () => {
  const mk = (
    status: number,
    body: unknown,
    headers: Record<string, string> = {},
  ) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    });

  it('classifies 429 as rate-limit with Retry-After', () => {
    const r = mk(429, {}, { 'Retry-After': '42' });
    const e = mapZentinelError(r, {});
    expect(e.kind).toBe('rate-limit');
    if (e.kind === 'rate-limit') {
      expect(e.retry_after).toBe(42);
    }
  });

  it('prefers backend `code` over HTTP status (SOBERANA_TOKEN_MISSING)', () => {
    const r = mk(401, {});
    const e = mapZentinelError(r, {
      code: 'SOBERANA_TOKEN_MISSING',
      message: 'No token',
    });
    expect(e.kind).toBe('auth');
    if (e.kind === 'auth') {
      expect(e.code).toBe('SOBERANA_TOKEN_MISSING');
    }
  });

  it('classifies KYC requirement (403 + SOBERANA_KYC_REQUIRED)', () => {
    const r = mk(403, {});
    const e = mapZentinelError(r, {
      code: 'SOBERANA_KYC_REQUIRED',
      message: 'KYC required',
    });
    expect(e.kind).toBe('kyc-required');
  });

  it('classifies validation (400 SOBERANA_VALIDATION_FAILED)', () => {
    const r = mk(400, {});
    const e = mapZentinelError(r, {
      code: 'SOBERANA_VALIDATION_FAILED',
      message: 'amount must be > 0',
    });
    expect(e.kind).toBe('validation');
    if (e.kind === 'validation') {
      expect(e.message).toBe('amount must be > 0');
    }
  });

  it.each([
    [404, 'ACTION_NOT_FOUND'],
    [409, 'ACTION_ALREADY_CONSUMED'],
    [410, 'ACTION_EXPIRED'],
  ])('classifies %s as action error %s', (status, code) => {
    const r = mk(status, {});
    const e = mapZentinelError(r, { code, message: 'x' });
    expect(e.kind).toBe('action');
    if (e.kind === 'action') {
      expect(e.code).toBe(code);
    }
  });

  it('classifies 502 upstream', () => {
    const r = mk(502, {});
    const e = mapZentinelError(r, {
      code: 'SOBERANA_UPSTREAM_ERROR',
      message: 'oops',
    });
    expect(e.kind).toBe('upstream');
  });

  it('falls back to unknown for untagged 5xx', () => {
    const r = mk(599, {});
    const e = mapZentinelError(r, { something: 'else' });
    expect(e.kind).toBe('unknown');
    if (e.kind === 'unknown') {
      expect(e.status).toBe(599);
    }
  });
});

describe('createSSEParser', () => {
  it('ignores heartbeat comments and emits the done frame (real Zentinel shape)', () => {
    const p = createSSEParser();
    const real = ': ready\n\ndata: {"type":"done","toolsUsed":[],"sessionId":"abc"}\n\n';
    const chunks = p.feed(real);
    expect(chunks).toHaveLength(1);
    const c = chunks[0];
    expect(c.type).toBe('done');
    if (c.type === 'done') {
      expect(c.session_id).toBe('abc');
      expect(c.tools_used).toEqual([]);
    }
  });

  it('emits token chunks incrementally', () => {
    const p = createSSEParser();
    const first = p.feed('data: {"type":"token","content":"Hola"}\n\n');
    const second = p.feed('data: {"type":"token","content":" mundo"}\n\n');
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(first[0]).toEqual({ type: 'token', content: 'Hola' });
    expect(second[0]).toEqual({ type: 'token', content: ' mundo' });
  });

  it('handles split frames across chunk boundaries', () => {
    const p = createSSEParser();
    const a = p.feed('data: {"type":"token","con');
    const b = p.feed('tent":"partial"}\n\n');
    expect(a).toHaveLength(0);
    expect(b).toHaveLength(1);
    expect(b[0]).toEqual({ type: 'token', content: 'partial' });
  });

  it('decodes pending_action on the done frame (snake_case)', () => {
    const p = createSSEParser();
    const payload = {
      type: 'done',
      response: 'ok',
      tools_used: ['soberana_create_offramp'],
      session_id: 'sess-1',
      pending_action: {
        action_id: 'act-1',
        requires_confirmation: true,
        preview: {
          summary: 'Send 250 USDC',
          tool: 'soberana_create_offramp',
          input_params: { amount: 250 },
          invalidates: ['wallets.balance'],
        },
        expires_at: '2026-04-22T14:05:00Z',
        confirm_endpoint: '/api/chat/confirm/act-1',
      },
    };
    const chunks = p.feed(`data: ${JSON.stringify(payload)}\n\n`);
    expect(chunks).toHaveLength(1);
    const c = chunks[0];
    if (c.type === 'done') {
      expect(c.pending_action?.action_id).toBe('act-1');
      expect(c.pending_action?.preview.invalidates).toEqual([
        'wallets.balance',
      ]);
    } else {
      throw new Error('expected done chunk');
    }
  });

  it('accepts camelCase payloads on the done frame (pendingAction)', () => {
    const p = createSSEParser();
    const payload = {
      type: 'done',
      response: 'ok',
      toolsUsed: [],
      sessionId: 's1',
      pendingAction: {
        action_id: 'act-2',
        requires_confirmation: true,
        preview: { summary: 'x', tool: 't', input_params: {} },
        expires_at: 'z',
        confirm_endpoint: '/api/chat/confirm/act-2',
      },
    };
    const [c] = p.feed(`data: ${JSON.stringify(payload)}\n\n`);
    if (c.type !== 'done') throw new Error('expected done');
    expect(c.session_id).toBe('s1');
    expect(c.pending_action?.action_id).toBe('act-2');
  });

  it('flushes a trailing frame missing its blank-line terminator', () => {
    const p = createSSEParser();
    const during = p.feed('data: {"type":"token","content":"x"}');
    const rest = p.flush();
    expect(during).toHaveLength(0);
    expect(rest).toHaveLength(1);
    expect(rest[0]).toEqual({ type: 'token', content: 'x' });
  });

  // FRONTEND_PRODUCTION_CONNECTION.md §4.2 — the Charlie guardrail
  // emits an `event: security_block` SSE frame followed by a `done`.
  // The parser must associate the `event:` attribute with the same
  // frame's `data:` payload and emit a `security_block` chunk.
  it('emits a security_block chunk for `event: security_block` frames', () => {
    const p = createSSEParser();
    const payload = {
      blocked: true,
      agent: 'charlie',
      category: 'malicious-intent',
      maliciousCategory: 'cross_tenant_name',
      severity: 'malicious',
      message:
        'Soy Charlie, el asistente de seguridad. Bloqueé esta solicitud por consulta cross-tenant.',
      ruleId: 'malicious-intent',
      loggedAt: '2026-04-27T17:25:37.517Z',
      incidentId: '38ab2bcd-5287-4032-be3c-6097db67fb7e',
    };
    const sse =
      `event: security_block\ndata: ${JSON.stringify(payload)}\n\n` +
      `data: {"type":"done","toolsUsed":[],"sessionId":"s1"}\n\n`;
    const chunks = p.feed(sse);
    expect(chunks).toHaveLength(2);
    const [first, second] = chunks;
    if (first.type !== 'security_block') {
      throw new Error('expected security_block as first chunk');
    }
    expect(first.agent).toBe('charlie');
    expect(first.category).toBe('malicious-intent');
    expect(first.severity).toBe('malicious');
    expect(first.malicious_category).toBe('cross_tenant_name');
    expect(first.rule_id).toBe('malicious-intent');
    expect(first.logged_at).toBe('2026-04-27T17:25:37.517Z');
    expect(first.incident_id).toBe('38ab2bcd-5287-4032-be3c-6097db67fb7e');
    expect(first.message).toContain('Charlie');
    expect(second.type).toBe('done');
  });

  it('accepts snake_case payload on a security_block frame', () => {
    const p = createSSEParser();
    const payload = {
      blocked: true,
      agent: 'charlie',
      category: 'prompt-injection',
      severity: 'critical',
      message: 'Detected prompt injection attempt.',
      rule_id: 'prompt-injection',
      logged_at: '2026-04-27T18:00:00.000Z',
      incident_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    };
    const sse = `event: security_block\ndata: ${JSON.stringify(payload)}\n\n`;
    const [c] = p.feed(sse);
    if (c.type !== 'security_block') {
      throw new Error('expected security_block chunk');
    }
    expect(c.category).toBe('prompt-injection');
    expect(c.severity).toBe('critical');
    expect(c.rule_id).toBe('prompt-injection');
    expect(c.incident_id).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(c.malicious_category).toBeUndefined();
  });

  it('still routes regular `data:` frames when no `event:` is set', () => {
    const p = createSSEParser();
    const sse =
      `data: {"type":"token","content":"hi"}\n\n` +
      `event: security_block\ndata: {"blocked":true,"agent":"charlie","category":"forbidden-topics","severity":"medium","message":"blocked","rule_id":"x","logged_at":"t","incident_id":"i"}\n\n`;
    const chunks = p.feed(sse);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].type).toBe('token');
    expect(chunks[1].type).toBe('security_block');
  });

  it('drops a security_block frame that is missing `message`', () => {
    const p = createSSEParser();
    const payload = {
      blocked: true,
      agent: 'charlie',
      category: 'output-validation',
      severity: 'high',
      rule_id: 'x',
      logged_at: 't',
      incident_id: 'i',
    };
    const sse = `event: security_block\ndata: ${JSON.stringify(payload)}\n\n`;
    const chunks = p.feed(sse);
    expect(chunks).toHaveLength(0);
  });
});
