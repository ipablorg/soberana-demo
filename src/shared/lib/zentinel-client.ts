/**
 * Zentinel HTTP + SSE client.
 *
 * Low-level transport for the Zentinel backend (docs/zentinel_docs/
 * FRONTEND_INTEGRATION_GUIDE.md). This file is the *only* place the
 * network-level contract lives; every hook consuming Zentinel should
 * build on top of this client and never `fetch()` directly.
 *
 * Contract (guide §2, §3, §5.3, §7):
 * - Every authenticated request carries TWO headers:
 *     Authorization: Bearer <JWT_zentinel>   (Zentinel-issued, JWT auth)
 *     X-Soberana-Token: <firebase_access_token>   (optional, forwarded
 *       in-memory to Soberana GraphQL from AI tools — never persisted)
 * - JSON response bodies are **snake_case**. The TS types below mirror
 *   that shape verbatim; we do NOT convert to camelCase.
 * - Chat streaming uses Server-Sent Events (`text/event-stream`).
 *   Aborting the `fetch` AbortController stops agent execution server-
 *   side (§5.3).
 *
 * Reuse / non-duplication:
 * - Firebase token is read fresh from `useAuthStore.getState().token`
 *   on every request (§9 DO NOT: never persist it in local/sessionStorage
 *   or in this module). Zentinel's own JWT is passed in by the caller
 *   via `configureZentinelClient({ jwt_provider })` and lives in a
 *   module-level closure in `use-zentinel-auth` — never in browser
 *   storage, per FRONTEND_PRODUCTION_CHECKLIST §9.1.
 */

import { useAuthStore } from '@/shared/stores/auth-store';

// ──────────────────────────────────────────────────────────────────────
// Types — mirrored snake_case from the backend (do NOT camelCase)
// ──────────────────────────────────────────────────────────────────────

export interface ZentinelHealth {
  status: string;
  database?: string;
  uptime?: number;
  timestamp: string;
  version?: string;
}

export interface ZentinelHealthInfo {
  name: string;
  version: string;
  environment: string;
  features: {
    streaming: boolean;
    csv_upload: boolean;
    soberana_bridge: boolean;
    max_upload_bytes: number;
    rate_limit: { ttl_ms: number; limit: number };
  };
  auth: {
    methods: string[];
    login_endpoint: string;
    refresh_endpoint: string;
    header_jwt: string;
    header_api_key: string;
    accepts_soberana_token: boolean;
    soberana_token_header: string;
  };
  endpoints: Record<string, string[]>;
}

export interface ZentinelLoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    tenant_id: string;
    roles?: string[];
  };
}

export interface PendingActionPreview {
  summary: string;
  tool: string;
  graphql_operation?: string;
  input_params: Record<string, unknown>;
  invalidates?: string[];
}

export interface PendingAction {
  action_id: string;
  requires_confirmation: boolean;
  preview: PendingActionPreview;
  expires_at: string;
  confirm_endpoint: string;
}

/**
 * Security block emitted by the Charlie guardrail agent.
 *
 * Two surfaces (FRONTEND_PRODUCTION_CONNECTION.md §4):
 *  - In `/chat/message` JSON: an extra `security_block` (or camelCase
 *    `securityBlock`) field on a normal 200 OK response. When present,
 *    the renderer MUST ignore `response` as a normal answer and render
 *    a Charlie incident card instead.
 *  - In `/chat/stream` SSE: a frame with the `event: security_block`
 *    attribute and a `data: {...}` payload of this shape.
 *
 * Snake_case is the canonical wire shape. We accept camelCase fallbacks
 * for the optional fields to mirror the elastic typing the rest of the
 * client already does (see {@link ChatMessageResponse}).
 */
export type SecurityBlockCategory =
  | 'malicious-intent'
  | 'prompt-injection'
  | 'cross-tenant-leak'
  | 'forbidden-topics'
  | 'rbac'
  | 'in-chat-confirmation'
  | 'message-rate-limit'
  | 'output-validation';

export type SecurityBlockSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'malicious';

export interface SecurityBlock {
  blocked: true;
  agent: 'charlie';
  category: SecurityBlockCategory;
  /** Only set when `category === 'malicious-intent'`. */
  malicious_category?: string;
  severity: SecurityBlockSeverity;
  /** Pre-redacted user-facing copy from Charlie. Render verbatim. */
  message: string;
  rule_id: string;
  logged_at: string;
  /** UUID for support escalation — must be visible/copiable to user. */
  incident_id: string;
}

export interface ChatMessageResponse {
  response: string;
  tools_used?: string[];
  toolsUsed?: string[];
  session_id?: string;
  sessionId?: string;
  pending_action?: PendingAction;
  pendingAction?: PendingAction;
  requires_confirmation?: boolean;
  requiresConfirmation?: boolean;
  /** Charlie guardrail incident — see {@link SecurityBlock}. */
  security_block?: SecurityBlock;
  securityBlock?: SecurityBlock;
}

export interface ChatConfirmResponse {
  action: {
    id: string;
    status: 'executed' | 'cancelled' | 'failed';
    tool_name?: string;
    graphql_operation?: string;
  };
  result?: unknown;
  invalidate_cache?: string[];
  status?: string;
}

/**
 * Normalized streaming chunk. The backend emits SSE frames as
 * `data: {...json...}`. Some frames also include a `type` field; the
 * parser unifies them into a discriminated union that hooks consume.
 *
 * Observed frames (Zentinel v0.1.0):
 *   - `: ready`                             → heartbeat, ignored
 *   - `data: {"type":"token","content":"…"}` → token chunk (if LLM streams)
 *   - `data: {"type":"tool","name":…,"args":…}` → tool invocation
 *   - `data: {"type":"done","response":…,"toolsUsed":…,"sessionId":…}` → turn end
 *   - `data: {"type":"error","code":…,"message":…}` → stream error
 *   - `data: [DONE]`                        → legacy terminator (ignored)
 *
 * We tolerate both snake_case and camelCase payloads in `done` chunks
 * because Nest controllers sometimes serialize with `@Expose` in camel.
 * Downstream code reads `response`, `tools_used`, `session_id`,
 * `pending_action` — the parser remaps the camel variants.
 */
export type StreamChunk =
  | { type: 'token'; content: string }
  | { type: 'tool'; name: string; args: unknown }
  | {
      type: 'done';
      response: string;
      tools_used: string[];
      session_id: string;
      pending_action?: PendingAction;
    }
  | { type: 'error'; code: string; message: string }
  /**
   * Charlie guardrail block. Emitted by SSE frames carrying the
   * `event: security_block` attribute. Hooks must render it as a
   * security incident card instead of the normal token/done flow.
   */
  | ({ type: 'security_block' } & SecurityBlock);

export interface RateLimitInfo {
  /** X-RateLimit-Limit */
  limit: number | null;
  /** X-RateLimit-Remaining */
  remaining: number | null;
  /** X-RateLimit-Reset — seconds (epoch or window length, backend-defined). */
  reset: number | null;
  /** Retry-After — seconds. Populated on 429. */
  retry_after: number | null;
}

// ──────────────────────────────────────────────────────────────────────
// Error model
// ──────────────────────────────────────────────────────────────────────

export type ZentinelError =
  | { kind: 'rate-limit'; retry_after: number; rate: RateLimitInfo }
  | {
      kind: 'auth';
      code:
        | 'JWT_EXPIRED'
        | 'JWT_INVALID'
        | 'SOBERANA_TOKEN_MISSING'
        | 'SOBERANA_TOKEN_EXPIRED';
      message: string;
      status: number;
    }
  | { kind: 'kyc-required'; message: string }
  | { kind: 'validation'; message: string }
  | {
      kind: 'action';
      code:
        | 'ACTION_NOT_FOUND'
        | 'ACTION_ALREADY_CONSUMED'
        | 'ACTION_EXPIRED';
      message: string;
    }
  | { kind: 'upstream'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'aborted' }
  | { kind: 'unknown'; status: number; body: unknown };

export class ZentinelApiError extends Error {
  readonly detail: ZentinelError;
  constructor(detail: ZentinelError, message?: string) {
    super(message ?? describeZentinelError(detail));
    this.name = 'ZentinelApiError';
    this.detail = detail;
  }
}

/** Short internal description used when no caller-provided message is set. */
function describeZentinelError(e: ZentinelError): string {
  switch (e.kind) {
    case 'rate-limit':
      return `rate-limit (retry_after=${e.retry_after}s)`;
    case 'auth':
      return `${e.code} (${e.status})`;
    case 'kyc-required':
      return 'SOBERANA_KYC_REQUIRED';
    case 'validation':
      return `validation: ${e.message}`;
    case 'action':
      return e.code;
    case 'upstream':
      return 'SOBERANA_UPSTREAM_ERROR';
    case 'network':
      return `network: ${e.message}`;
    case 'aborted':
      return 'aborted';
    case 'unknown':
      return `unknown (status=${e.status})`;
  }
}

/**
 * Classify a non-OK HTTP response into our {@link ZentinelError} union.
 *
 * The backend returns structured bodies on errors, e.g.:
 *   { code: "SOBERANA_TOKEN_MISSING", message: "..." }
 *   { code: "ACTION_EXPIRED", message: "..." }
 *   { code: "SOBERANA_KYC_REQUIRED", kyc_link: "..." }
 *
 * We key off `code` first (most reliable), then HTTP status.
 */
export function mapZentinelError(
  response: Response,
  body: unknown,
): ZentinelError {
  const status = response.status;
  const rate = readRateLimit(response);
  const bodyRec: Record<string, unknown> =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const code =
    typeof bodyRec.code === 'string'
      ? (bodyRec.code as string)
      : typeof bodyRec.error_code === 'string'
        ? (bodyRec.error_code as string)
        : undefined;
  const message =
    typeof bodyRec.message === 'string'
      ? (bodyRec.message as string)
      : typeof bodyRec.error === 'string'
        ? (bodyRec.error as string)
        : response.statusText || 'Unknown error';

  if (status === 429) {
    return {
      kind: 'rate-limit',
      retry_after: rate.retry_after ?? 60,
      rate,
    };
  }

  if (code === 'JWT_EXPIRED' || code === 'JWT_INVALID') {
    return { kind: 'auth', code, message, status };
  }
  if (code === 'SOBERANA_TOKEN_MISSING' || code === 'SOBERANA_TOKEN_EXPIRED') {
    return { kind: 'auth', code, message, status };
  }
  if (code === 'SOBERANA_KYC_REQUIRED') {
    return { kind: 'kyc-required', message };
  }
  if (code === 'SOBERANA_VALIDATION_FAILED') {
    return { kind: 'validation', message };
  }
  if (
    code === 'ACTION_NOT_FOUND' ||
    code === 'ACTION_ALREADY_CONSUMED' ||
    code === 'ACTION_EXPIRED'
  ) {
    return { kind: 'action', code, message };
  }
  if (code === 'SOBERANA_UPSTREAM_ERROR') {
    return { kind: 'upstream', message };
  }

  if (status === 401) {
    return { kind: 'auth', code: 'JWT_EXPIRED', message, status };
  }
  if (status === 403) {
    return { kind: 'auth', code: 'JWT_INVALID', message, status };
  }
  if (status === 400) {
    return { kind: 'validation', message };
  }
  if (status === 404) {
    return { kind: 'action', code: 'ACTION_NOT_FOUND', message };
  }
  if (status === 409) {
    return { kind: 'action', code: 'ACTION_ALREADY_CONSUMED', message };
  }
  if (status === 410) {
    return { kind: 'action', code: 'ACTION_EXPIRED', message };
  }
  if (status === 502 || status === 503 || status === 504) {
    return { kind: 'upstream', message };
  }

  return { kind: 'unknown', status, body };
}

export function readRateLimit(response: Response): RateLimitInfo {
  const toNum = (v: string | null): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    limit: toNum(response.headers.get('X-RateLimit-Limit')),
    remaining: toNum(response.headers.get('X-RateLimit-Remaining')),
    reset: toNum(response.headers.get('X-RateLimit-Reset')),
    retry_after: toNum(response.headers.get('Retry-After')),
  };
}

// ──────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────

export interface ZentinelClientConfig {
  /** Base URL, already including `/api` (e.g. http://localhost:3100/api). */
  base_url: string;
  /** Provides the current Zentinel JWT or null. Called on every request. */
  get_jwt: () => string | null;
  /** Optional; called with rate-limit info on every response. */
  on_rate_limit?: (info: RateLimitInfo) => void;
  /** Hooks may pass fetch for testing; defaults to global fetch. */
  fetch_impl?: typeof fetch;
}

function resolveBaseUrl(explicit?: string): string {
  // Vite only substitutes the literal `import.meta.env.VITE_X` form at
  // build-time; any optional-chaining around `import.meta` breaks the
  // static replacement and we silently fall back to the default. Keep
  // the access exact and guard the object instead.
  const env = import.meta.env as Record<string, string | undefined>;
  const fromEnv = env?.VITE_ZENTINEL_API_URL;
  return (explicit ?? fromEnv ?? 'http://localhost:3200/api').replace(
    /\/+$/,
    '',
  );
}

// ──────────────────────────────────────────────────────────────────────
// Header builder — visible for unit tests
// ──────────────────────────────────────────────────────────────────────

export interface BuildHeadersOpts {
  jwt: string | null;
  soberana_token: string | null;
  include_content_type?: boolean;
}

export function buildHeaders(opts: BuildHeadersOpts): Headers {
  const h = new Headers();
  if (opts.include_content_type !== false) {
    h.set('Content-Type', 'application/json');
  }
  if (opts.jwt) {
    h.set('Authorization', `Bearer ${opts.jwt}`);
  }
  if (opts.soberana_token) {
    h.set('X-Soberana-Token', opts.soberana_token);
  }
  h.set('Accept', 'application/json, text/event-stream');
  return h;
}

// ──────────────────────────────────────────────────────────────────────
// SSE parser — visible for unit tests
// ──────────────────────────────────────────────────────────────────────

/**
 * Parse a raw SSE buffer chunk and yield normalized {@link StreamChunk}s.
 * State is held in the returned `flush()` helper so callers can invoke
 * it across streaming reads. Lines are accumulated until a blank line
 * terminates a frame (standard SSE framing).
 *
 * Frame attributes we care about:
 *  - `data:` → JSON payload (most frames). Multiple `data:` lines are
 *    joined with a newline before JSON.parse, per the SSE spec.
 *  - `event:` → frame name. Used by `event: security_block` (Charlie
 *    guardrail, FRONTEND_PRODUCTION_CONNECTION.md §4.2). When set, the
 *    payload is mapped to a `security_block` chunk instead of being
 *    routed through {@link normalizeStreamChunk}.
 *  - lines starting with `:` are heartbeats (e.g. `: ready`) → ignored.
 *  - `id:` / `retry:` are accepted and ignored — we do not implement
 *    SSE reconnection (FE uses `fetch` + AbortController instead of
 *    EventSource so headers can be set).
 */
export function createSSEParser() {
  let buffer = '';

  return {
    /** Feed a new text chunk; returns any completed frames. */
    feed(chunk: string): StreamChunk[] {
      buffer += chunk;
      const chunks: StreamChunk[] = [];
      let idx: number;
      while ((idx = findFrameBoundary(buffer)) !== -1) {
        const raw = buffer.slice(0, idx);
        buffer = buffer.slice(idx).replace(/^(\r?\n){1,2}/, '');
        const c = parseSSEFrame(raw);
        if (c) chunks.push(c);
      }
      return chunks;
    },
    /** Flush any trailing frame (no blank-line terminator). */
    flush(): StreamChunk[] {
      if (!buffer.trim()) return [];
      const c = parseSSEFrame(buffer);
      buffer = '';
      return c ? [c] : [];
    },
  };
}

/**
 * Parse a single SSE frame (the text between two blank lines) into a
 * normalized {@link StreamChunk}, honoring the `event:` attribute.
 *
 * Returns `null` for heartbeat-only frames, frames with no `data:`,
 * unparseable JSON, or the legacy `[DONE]` terminator.
 */
function parseSSEFrame(frame: string): StreamChunk | null {
  const lines = frame.split(/\r?\n/);
  const dataLines: string[] = [];
  let event_name: string | null = null;
  for (const line of lines) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''));
    } else if (line.startsWith('event:')) {
      event_name = line.slice(6).trim();
    }
    // `id:` and `retry:` lines exist in the SSE spec; we don't
    // reconnect, so we silently ignore them.
  }
  if (dataLines.length === 0) return null;
  const data = dataLines.join('\n');
  if (!data || data === '[DONE]') return null;
  let obj: unknown;
  try {
    obj = JSON.parse(data);
  } catch {
    return null;
  }
  if (event_name === 'security_block') {
    return normalizeSecurityBlockChunk(obj);
  }
  return normalizeStreamChunk(obj);
}

/**
 * Map a raw SSE `event: security_block` payload into a typed chunk.
 * Tolerates camelCase aliases (`maliciousCategory`, `ruleId`, etc.) the
 * same way the rest of the client does for `done` frames — Nest
 * controllers occasionally serialize with `@Expose` in camel.
 */
function normalizeSecurityBlockChunk(raw: unknown): StreamChunk | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const message = typeof r.message === 'string' ? r.message : '';
  if (!message) return null;
  const category =
    typeof r.category === 'string'
      ? (r.category as SecurityBlockCategory)
      : 'output-validation';
  const severity =
    typeof r.severity === 'string'
      ? (r.severity as SecurityBlockSeverity)
      : 'medium';
  const rule_id =
    typeof r.rule_id === 'string'
      ? r.rule_id
      : typeof r.ruleId === 'string'
        ? (r.ruleId as string)
        : 'unknown';
  const logged_at =
    typeof r.logged_at === 'string'
      ? r.logged_at
      : typeof r.loggedAt === 'string'
        ? (r.loggedAt as string)
        : new Date().toISOString();
  const incident_id =
    typeof r.incident_id === 'string'
      ? r.incident_id
      : typeof r.incidentId === 'string'
        ? (r.incidentId as string)
        : '';
  const malicious_category =
    typeof r.malicious_category === 'string'
      ? r.malicious_category
      : typeof r.maliciousCategory === 'string'
        ? (r.maliciousCategory as string)
        : undefined;
  return {
    type: 'security_block',
    blocked: true,
    agent: 'charlie',
    category,
    malicious_category,
    severity,
    message,
    rule_id,
    logged_at,
    incident_id,
  };
}

function findFrameBoundary(buf: string): number {
  const lf = buf.indexOf('\n\n');
  const crlf = buf.indexOf('\r\n\r\n');
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function normalizeStreamChunk(raw: unknown): StreamChunk | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const type = typeof r.type === 'string' ? (r.type as string) : 'done';

  if (type === 'token' && typeof r.content === 'string') {
    return { type: 'token', content: r.content };
  }
  if (type === 'tool' && typeof r.name === 'string') {
    return { type: 'tool', name: r.name, args: r.args ?? null };
  }
  if (type === 'error') {
    return {
      type: 'error',
      code: typeof r.code === 'string' ? r.code : 'UNKNOWN',
      message: typeof r.message === 'string' ? r.message : 'Stream error',
    };
  }

  // done — accept snake_case OR camelCase from the backend.
  const response =
    typeof r.response === 'string' ? (r.response as string) : '';
  const tools_used = Array.isArray(r.tools_used)
    ? (r.tools_used as string[])
    : Array.isArray(r.toolsUsed)
      ? (r.toolsUsed as string[])
      : [];
  const session_id =
    typeof r.session_id === 'string'
      ? (r.session_id as string)
      : typeof r.sessionId === 'string'
        ? (r.sessionId as string)
        : '';
  const pending_raw = r.pending_action ?? r.pendingAction;
  const pending_action =
    pending_raw && typeof pending_raw === 'object'
      ? (pending_raw as PendingAction)
      : undefined;

  return {
    type: 'done',
    response,
    tools_used,
    session_id,
    pending_action,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Dev-only header tracing
// ──────────────────────────────────────────────────────────────────────

/**
 * Trace whether `Authorization` and `X-Soberana-Token` are attached to
 * every `/chat/*` request. We only expose length + first 6 chars so the
 * actual JWT never lands in any shared log stream. Silent in prod.
 *
 * On in dev by default — a single console line per chat turn is cheap
 * and the only way we've reliably pinned auth bugs without a dedicated
 * network inspector. Opt out with
 * `localStorage.zentinel_debug = '0'` if it starts being noisy.
 */
function debug_log_headers(
  path: string,
  jwt: string | null,
  soberana: string | null,
): void {
  if (!path.startsWith('/chat')) return;
  const is_dev = Boolean(
    (import.meta.env as unknown as { DEV?: boolean }).DEV,
  );
  if (!is_dev) return;
  try {
    if (window.localStorage?.getItem('zentinel_debug') === '0') return;
  } catch {
    // `localStorage` can throw in sandboxed iframes — default to on.
  }
  const tag = (v: string | null): string =>
    v ? `present(len=${v.length}, head=${v.slice(0, 6)}…)` : 'MISSING';
  // eslint-disable-next-line no-console
  console.info(
    `[zentinel] → POST ${path} | Authorization=${tag(jwt)} | X-Soberana-Token=${tag(soberana)}`,
  );
}

// ──────────────────────────────────────────────────────────────────────
// Client factory
// ──────────────────────────────────────────────────────────────────────

export interface ChatRequestBody {
  message: string;
  session_id?: string;
}

export interface ZentinelClient {
  readonly base_url: string;
  health: () => Promise<ZentinelHealth>;
  health_info: () => Promise<ZentinelHealthInfo>;
  login: (email: string, password: string) => Promise<ZentinelLoginResponse>;
  /**
   * Production auth path: exchange the Soberana (Firebase) session for a
   * Zentinel JWT. Sends `X-Soberana-Token` (read from the auth store) with
   * NO body and NO Bearer — the backend provisions/links the tenant and
   * returns the same shape as `login`. Soberana users have no Zentinel
   * password, and the Firebase token is persisted + restored across
   * reloads, so this re-establishes the session without re-prompting.
   * See `POST /api/auth/soberana` in the Zentinel backend.
   */
  login_with_soberana: () => Promise<ZentinelLoginResponse>;
  /**
   * Renew the Zentinel JWT. Per guide §2.2 the backend has no refresh
   * token — `/auth/refresh` requires the *current* Bearer JWT and
   * returns a new one with a reset TTL. Once the current JWT has
   * expired, the only recovery is `login_with_soberana()` (or
   * `login(email, password)` in local dev) again.
   */
  refresh_session: () => Promise<ZentinelLoginResponse>;
  chat_message: (
    body: ChatRequestBody,
    signal?: AbortSignal,
  ) => Promise<ChatMessageResponse>;
  chat_stream: (
    body: ChatRequestBody,
    signal?: AbortSignal,
  ) => AsyncIterable<StreamChunk>;
  confirm_action: (action_id: string) => Promise<ChatConfirmResponse>;
  cancel_action: (action_id: string) => Promise<ChatConfirmResponse>;
}

export function createZentinelClient(
  config: Partial<ZentinelClientConfig> = {},
): ZentinelClient {
  const base_url = resolveBaseUrl(config.base_url);
  const get_jwt = config.get_jwt ?? (() => null);
  const on_rate_limit = config.on_rate_limit;
  const fetch_impl = config.fetch_impl ?? fetch.bind(globalThis);

  // `warned_no_soberana` keeps the dev-console clean: we emit exactly
  // one line per client instance when a chat request is about to go out
  // without the Firebase token. The agent will then refuse Soberana
  // tools and the user-visible message ("no detecto sesión activa") is
  // otherwise indistinguishable from a backend bug.
  let warned_no_soberana = false;
  const get_soberana_token = (path_hint?: string): string | null => {
    let token: string | null = null;
    try {
      token = useAuthStore.getState().token ?? null;
    } catch {
      token = null;
    }
    // Vite injects `DEV: boolean` into `import.meta.env`. Cast via
    // unknown so we don't fight the stringly-typed record elsewhere.
    const is_dev = Boolean(
      (import.meta.env as unknown as { DEV?: boolean }).DEV,
    );
    if (
      !token &&
      is_dev &&
      !warned_no_soberana &&
      path_hint?.startsWith('/chat')
    ) {
      warned_no_soberana = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[zentinel] Calling %s without X-Soberana-Token. ' +
          'Soberana tools (list_beneficiaries, create_beneficiary, ' +
          'quote, transfer) will be refused by the agent. ' +
          'Log in against the Soberana GraphQL API (or disable ' +
          'VITE_DEV_MOCK_MODE) so useAuthStore.token is populated.',
        path_hint,
      );
    }
    return token;
  };

  const request = async <T>(
    path: string,
    init: RequestInit & { authed?: boolean } = {},
  ): Promise<T> => {
    const { authed = true, headers: extra, ...rest } = init;
    const jwt = authed ? get_jwt() : null;
    const soberana = authed ? get_soberana_token(path) : null;
    const headers = buildHeaders({ jwt, soberana_token: soberana });
    if (extra) {
      new Headers(extra).forEach((v, k) => headers.set(k, v));
    }
    debug_log_headers(path, jwt, soberana);

    let response: Response;
    try {
      response = await fetch_impl(`${base_url}${path}`, {
        ...rest,
        headers,
        // Zentinel uses header-based auth (Authorization + X-Soberana-
        // Token), not cookies. `credentials: 'omit'` is set explicitly
        // because the backend's CORS config does NOT enable
        // `Access-Control-Allow-Credentials: true`, and any inherited
        // `same-origin` / `include` from caller-supplied `init` would
        // trigger preflight failures. See FRONTEND_PRODUCTION_CONNECTION
        // .md §1 (TL;DR: `credentials: 'omit'`).
        credentials: 'omit',
      });
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        throw new ZentinelApiError({ kind: 'aborted' });
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new ZentinelApiError({ kind: 'network', message: msg });
    }

    const rate = readRateLimit(response);
    on_rate_limit?.(rate);

    if (!response.ok) {
      const body = await safeJson(response);
      throw new ZentinelApiError(mapZentinelError(response, body));
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  };

  const chat_stream = async function* (
    body: ChatRequestBody,
    signal?: AbortSignal,
  ): AsyncIterable<StreamChunk> {
    const jwt = get_jwt();
    const soberana = get_soberana_token('/chat/stream');
    const headers = buildHeaders({ jwt, soberana_token: soberana });
    headers.set('Accept', 'text/event-stream');
    debug_log_headers('/chat/stream', jwt, soberana);

    let response: Response;
    try {
      response = await fetch_impl(`${base_url}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal,
        // Header-based auth — see comment in `request()` above.
        credentials: 'omit',
      });
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        throw new ZentinelApiError({ kind: 'aborted' });
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new ZentinelApiError({ kind: 'network', message: msg });
    }

    on_rate_limit?.(readRateLimit(response));

    if (!response.ok) {
      const err_body = await safeJson(response);
      throw new ZentinelApiError(mapZentinelError(response, err_body));
    }

    if (!response.body) {
      throw new ZentinelApiError({
        kind: 'network',
        message: 'Empty stream body',
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    const parser = createSSEParser();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const chunk of parser.feed(text)) yield chunk;
      }
      for (const chunk of parser.flush()) yield chunk;
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        throw new ZentinelApiError({ kind: 'aborted' });
      }
      throw err;
    } finally {
      try {
        reader.releaseLock();
      } catch {
        /* noop */
      }
    }
  };

  return {
    base_url,
    health: () => request<ZentinelHealth>('/health', { authed: false }),
    health_info: () =>
      request<ZentinelHealthInfo>('/health/info', { authed: false }),
    login: (email, password) =>
      request<ZentinelLoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        authed: false,
      }),
    // `authed: true` makes `request` attach `X-Soberana-Token` from the
    // auth store. No body, and no Bearer is attached when there is no
    // Zentinel JWT yet (the common case: fresh login / restored session).
    login_with_soberana: () =>
      request<ZentinelLoginResponse>('/auth/soberana', {
        method: 'POST',
        authed: true,
      }),
    refresh_session: () =>
      request<ZentinelLoginResponse>('/auth/refresh', {
        method: 'POST',
      }),
    chat_message: (body, signal) =>
      request<ChatMessageResponse>('/chat/message', {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
      }),
    chat_stream,
    confirm_action: (action_id) =>
      request<ChatConfirmResponse>(`/chat/confirm/${action_id}`, {
        method: 'POST',
      }),
    cancel_action: (action_id) =>
      request<ChatConfirmResponse>(`/chat/confirm/${action_id}`, {
        method: 'DELETE',
      }),
  };
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

// ──────────────────────────────────────────────────────────────────────
// Singleton — the app shares one client so rate-limit counters align
// ──────────────────────────────────────────────────────────────────────

let _singleton: ZentinelClient | null = null;
let _jwt_provider: () => string | null = () => null;
let _rate_listeners: Array<(info: RateLimitInfo) => void> = [];

function ensureSingleton(): ZentinelClient {
  if (!_singleton) {
    _singleton = createZentinelClient({
      get_jwt: () => _jwt_provider(),
      on_rate_limit: (info) => _rate_listeners.forEach((cb) => cb(info)),
    });
  }
  return _singleton;
}

export function configureZentinelClient(opts: {
  jwt_provider?: () => string | null;
  on_rate_limit?: (info: RateLimitInfo) => void;
}): void {
  if (opts.jwt_provider) _jwt_provider = opts.jwt_provider;
  if (opts.on_rate_limit) _rate_listeners.push(opts.on_rate_limit);
  ensureSingleton();
}

export function getZentinelClient(): ZentinelClient {
  return ensureSingleton();
}

/** Test-only: reset between specs. */
export function __resetZentinelClient(): void {
  _singleton = null;
  _jwt_provider = () => null;
  _rate_listeners = [];
}
