import { describe, it, expect } from 'vitest';
import { mapError } from '../error-mapper';

/**
 * Builds the shape graphql-request's ClientError has in production: `message` is the
 * WHOLE serialized response (server stacktrace included), while the useful text lives
 * in `response.errors[0].message`.
 */
function buildClientError(serverMessage: string, code = 'BAD_REQUEST') {
  const stacktrace = [
    `GraphQLError: ${serverMessage}`,
    ' at AllExceptionsFilter.catch (/app/dist/common/filters/all-exceptions.filter.js:22:19)',
    ' at Object.fetch (/app/node_modules/.pnpm/@nestjs+core@11.2.7/node_modules/@nestjs/core/helpers/external-proxy.js:14:42)',
  ];
  const errors = [{ message: serverMessage, extensions: { code, status_code: 400, stacktrace } }];
  const response = { data: null, errors, status: 200 };
  const error = new Error(`${serverMessage}: ${JSON.stringify({ response, request: { query: 'mutation X { x }' } })}`);
  return Object.assign(error, { response });
}

describe('mapError — graphql-request ClientError with server stacktrace', () => {
  it('never leaks the serialized response, stacktrace or server paths', () => {
    const result = mapError(buildClientError("Payment rail 'us_ash' not found"));

    expect(result.message.length).toBeLessThan(200);
    expect(result.message).not.toMatch(/stacktrace|GraphQLError|\/app\/|node_modules|"errors"|\{"/i);
  });

  it('maps a "payment rail not found" backend error to a validation message', () => {
    const result = mapError(buildClientError("Payment rail 'us_ash' not found"));

    expect(result.category).toBe('VALIDATION');
    expect(result.message).toContain('ruta de pago');
  });

  it('does not treat a server-answered error as a network failure because the stacktrace says "fetch"', () => {
    const result = mapError(buildClientError('Insufficient balance in wallet'));

    expect(result.category).not.toBe('NETWORK');
    expect(result.message).toBe('Insufficient balance in wallet');
  });

  it('still classifies a real network failure (no server response) as NETWORK', () => {
    const result = mapError(new TypeError('Failed to fetch'));

    expect(result.category).toBe('NETWORK');
  });
});
