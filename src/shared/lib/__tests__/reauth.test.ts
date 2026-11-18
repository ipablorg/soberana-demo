import { describe, expect, it } from 'vitest';

import { extractReauthChallenge } from '../reauth';

const nestForbiddenGraphQLError = (body: Record<string, unknown>) => ({
  message: 'Recent authentication required',
  extensions: {
    code: 'FORBIDDEN',
    originalError: body,
  },
});

describe('extractReauthChallenge', () => {
  it('detects REAUTH_REQUIRED remapped to extensions.error_code by AllExceptionsFilter', () => {
    // Arrange — real payload: the filter keeps Apollo's `code: FORBIDDEN` and
    // moves the exception body code to `error_code`
    const clientError = {
      response: {
        status: 200,
        errors: [
          {
            message: 'Recent authentication required',
            extensions: {
              code: 'FORBIDDEN',
              status_code: 403,
              error_code: 'REAUTH_REQUIRED',
              max_age_seconds: 300,
            },
          },
        ],
      },
    };

    // Act
    const challenge = extractReauthChallenge(clientError);

    // Assert
    expect(challenge).toEqual({ maxAgeSeconds: 300 });
  });

  it('detects REAUTH_REQUIRED inside a graphql-request ClientError from NestJS', () => {
    // Arrange
    const clientError = {
      response: {
        status: 200,
        errors: [
          nestForbiddenGraphQLError({
            statusCode: 403,
            message: 'Recent authentication required',
            code: 'REAUTH_REQUIRED',
            max_age_seconds: 300,
          }),
        ],
      },
    };

    // Act
    const challenge = extractReauthChallenge(clientError);

    // Assert
    expect(challenge).toEqual({ maxAgeSeconds: 300 });
  });

  it('detects REAUTH_REQUIRED on a later GraphQL error of the same response', () => {
    // Arrange
    const clientError = {
      response: {
        status: 200,
        errors: [
          { message: 'Other failure', extensions: { code: 'BAD_REQUEST' } },
          nestForbiddenGraphQLError({ statusCode: 403, code: 'REAUTH_REQUIRED' }),
        ],
      },
    };

    // Act
    const challenge = extractReauthChallenge(clientError);

    // Assert
    expect(challenge).toEqual({ maxAgeSeconds: null });
  });

  it('ignores a plain FORBIDDEN GraphQL error without the reauth code', () => {
    // Arrange
    const clientError = {
      response: {
        status: 200,
        errors: [
          nestForbiddenGraphQLError({ statusCode: 403, message: 'Forbidden resource' }),
        ],
      },
    };

    // Act
    const challenge = extractReauthChallenge(clientError);

    // Assert
    expect(challenge).toBeNull();
  });

  it('detects REAUTH_REQUIRED on a REST 403 response body', () => {
    // Arrange
    const restError = {
      response: {
        status: 403,
        data: { statusCode: 403, code: 'REAUTH_REQUIRED', max_age_seconds: '300' },
      },
    };

    // Act
    const challenge = extractReauthChallenge(restError);

    // Assert
    expect(challenge).toEqual({ maxAgeSeconds: 300 });
  });

  it('rejects a REAUTH_REQUIRED code reported with a non-403 status', () => {
    // Arrange
    const restError = {
      response: { status: 401, data: { code: 'REAUTH_REQUIRED' } },
    };

    // Act
    const challenge = extractReauthChallenge(restError);

    // Assert
    expect(challenge).toBeNull();
  });
});
