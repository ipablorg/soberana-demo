/**
 * Classifies why the `auth_me` round-trip failed while a session is being
 * restored: a definitive rejection ends the session (as before), while a slow
 * or transient failure must keep it so the user is never signed out because of
 * a flaky connection or a backend hiccup.
 */

import { describe, expect, it } from 'vitest';
import { classifyAuthMeError } from '../auth-me-error';

/** Shape graphql-request's ClientError exposes. */
function clientError(status: number, errors?: Array<{ extensions?: Record<string, unknown> }>) {
  return Object.assign(new Error('request failed'), { response: { status, errors } });
}

describe('classifyAuthMeError — definitive authentication failures', () => {
  it.each([
    ['a plain UNAUTHENTICATED error', new Error('UNAUTHENTICATED')],
    ['an HTTP 401', clientError(401)],
    ['an HTTP 403', clientError(403)],
    [
      'a GraphQL UNAUTHENTICATED code over HTTP 200',
      clientError(200, [{ extensions: { code: 'UNAUTHENTICATED' } }]),
    ],
    [
      'a flattened error_code INVALID_TOKEN',
      clientError(200, [{ extensions: { code: 'FORBIDDEN', error_code: 'INVALID_TOKEN' } }]),
    ],
    [
      'an original 401 status inside the exception body',
      clientError(200, [{ extensions: { originalError: { statusCode: 401 } } }]),
    ],
    [
      'a status_code 401 flattened by the exception filter',
      clientError(200, [{ extensions: { status_code: 401 } }]),
    ],
    ['an expired token code', clientError(200, [{ extensions: { code: 'TOKEN_EXPIRED' } }])],
    ['a disabled account', clientError(200, [{ extensions: { code: 'ACCOUNT_DISABLED' } }])],
  ])('treats %s as definitive', (_label, error) => {
    expect(classifyAuthMeError(error)).toBe('definitive');
  });

  it('fails closed on shapes it cannot recognise', () => {
    expect(classifyAuthMeError(null)).toBe('definitive');
    expect(classifyAuthMeError(undefined)).toBe('definitive');
    expect(classifyAuthMeError('boom')).toBe('definitive');
  });

  it('fails closed on an unrelated GraphQL error', () => {
    const error = clientError(200, [{ extensions: { code: 'BAD_USER_INPUT' } }]);

    expect(classifyAuthMeError(error)).toBe('definitive');
  });
});

describe('classifyAuthMeError — slow or transient failures', () => {
  it.each([
    ['a fetch network failure', new TypeError('Failed to fetch')],
    ['a Safari network failure', new TypeError('Load failed')],
    ['an aborted request', Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })],
    ['a timeout', Object.assign(new Error('timeout'), { name: 'TimeoutError' })],
    ['an HTTP 500', clientError(500)],
    ['an HTTP 502', clientError(502)],
    ['an HTTP 503', clientError(503)],
    ['an HTTP 504', clientError(504)],
    ['an HTTP 408', clientError(408)],
    ['an HTTP 429', clientError(429)],
    [
      'an INTERNAL_SERVER_ERROR GraphQL code over HTTP 200',
      clientError(200, [{ extensions: { code: 'INTERNAL_SERVER_ERROR' } }]),
    ],
    [
      'a SERVICE_UNAVAILABLE flattened error_code',
      clientError(200, [
        { extensions: { code: 'INTERNAL_SERVER_ERROR', error_code: 'SERVICE_UNAVAILABLE' } },
      ]),
    ],
    [
      'a 5xx status_code flattened by the exception filter',
      clientError(200, [{ extensions: { status_code: 500 } }]),
    ],
  ])('treats %s as transient', (_label, error) => {
    expect(classifyAuthMeError(error)).toBe('transient');
  });

  it('lets an explicit authentication signal win over a transient-looking one', () => {
    const error = clientError(200, [
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
      { extensions: { code: 'UNAUTHENTICATED' } },
    ]);

    expect(classifyAuthMeError(error)).toBe('definitive');
  });
});
