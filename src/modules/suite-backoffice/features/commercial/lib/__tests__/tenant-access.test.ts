import { describe, expect, it } from 'vitest';

import {
  actAsFailureOf,
  domainErrorCode,
  inviteFailureOf,
  normalizeInviteEmail,
} from '../tenant-access';

function graphQLError(code: string, errorCode?: string) {
  return Object.assign(new Error('failed'), {
    response: { errors: [{ message: 'failed', extensions: { code, error_code: errorCode } }] },
  });
}

describe('domainErrorCode', () => {
  it('reads extensions.error_code and ignores non-GraphQL failures', () => {
    expect(domainErrorCode(graphQLError('FORBIDDEN', 'MFA_REQUIRED'))).toBe('MFA_REQUIRED');
    expect(domainErrorCode(new Error('network'))).toBeUndefined();
    expect(domainErrorCode(null)).toBeUndefined();
  });
});

describe('actAsFailureOf', () => {
  it.each([
    ['MFA_REQUIRED', 'mfa-required'],
    ['ACT_AS_FORBIDDEN', 'forbidden'],
    ['ACT_AS_CLIENT_NOT_FOUND', 'client-not-found'],
    ['TENANT_ACCESS_REQUIRED', 'client-not-active'],
  ])('maps %s to %s', (code, failure) => {
    expect(actAsFailureOf(graphQLError('FORBIDDEN', code))).toBe(failure);
  });

  it('leaves unknown codes to the generic mapper', () => {
    expect(actAsFailureOf(graphQLError('INTERNAL_SERVER_ERROR'))).toBeUndefined();
  });
});

describe('inviteFailureOf', () => {
  it('maps the 409 email-taken and the 404 unknown client', () => {
    expect(inviteFailureOf(graphQLError('CONFLICT', 'TENANT_ADMIN_EMAIL_TAKEN'))).toBe(
      'email-taken'
    );
    expect(inviteFailureOf(graphQLError('NOT_FOUND'))).toBe('client-not-found');
    expect(inviteFailureOf(graphQLError('BAD_REQUEST'))).toBeUndefined();
  });
});

describe('normalizeInviteEmail', () => {
  it('trims a valid email and rejects anything else', () => {
    expect(normalizeInviteEmail('  admin@acme.test ')).toBe('admin@acme.test');
    expect(normalizeInviteEmail('admin@acme')).toBeNull();
    expect(normalizeInviteEmail('')).toBeNull();
  });
});
