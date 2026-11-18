import { describe, it, expect } from 'vitest';
import {
  mapError,
  formatErrorMessage,
  isRetryableError,
  getErrorCategory,
  isConflictError,
} from '../error-mapper';

// ─── mapError basic behavior ─────────────────────────────────
describe('mapError — basic behavior', () => {
  it('maps null/undefined to UNKNOWN with fallback message', () => {
    const result = mapError(null);
    expect(result.category).toBe('UNKNOWN');
    expect(result.message).toBeTruthy();
    expect(result.retryable).toBe(true);
  });

  it('maps a plain Error to UNKNOWN with friendly message', () => {
    const result = mapError(new Error('something broke'));
    expect(result.category).toBeDefined();
    expect(result.message).toBeTruthy();
    expect(result.technical).toBe('something broke');
  });

  it('preserves technical message for debugging', () => {
    const result = mapError(new Error('SQL syntax error at line 42'));
    expect(result.technical).toContain('SQL syntax error');
    expect(result.message).not.toContain('SQL'); // user message must NOT leak SQL
  });
});

// ─── mapError — known error codes ────────────────────────────
describe('mapError — known error codes', () => {
  it('maps INVALID_CREDENTIALS to AUTH category', () => {
    const error = { extensions: { code: 'INVALID_CREDENTIALS' } };
    const result = mapError(error);
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('Email o contraseña');
    expect(result.retryable).toBe(true);
  });

  it('maps INVALID_EMAIL_OR_PASSWORD to AUTH category', () => {
    const error = { extensions: { code: 'INVALID_EMAIL_OR_PASSWORD' } };
    const result = mapError(error);
    expect(result.category).toBe('AUTH');
    expect(result.retryable).toBe(true);
  });

  it('maps USER_NOT_FOUND to AUTH category', () => {
    const error = { extensions: { code: 'USER_NOT_FOUND' } };
    const result = mapError(error);
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('No se encontró');
  });

  it('maps ACCOUNT_LOCKED to AUTH, non-retryable', () => {
    const error = { extensions: { code: 'ACCOUNT_LOCKED' } };
    const result = mapError(error);
    expect(result.category).toBe('AUTH');
    expect(result.retryable).toBe(false);
  });

  it('maps TOKEN_EXPIRED to AUTH, retryable', () => {
    const error = { extensions: { code: 'TOKEN_EXPIRED' } };
    const result = mapError(error);
    expect(result.category).toBe('AUTH');
    expect(result.retryable).toBe(true);
  });

  it('maps RATE_LIMIT_EXCEEDED to VALIDATION, retryable', () => {
    const error = { extensions: { code: 'RATE_LIMIT_EXCEEDED' } };
    const result = mapError(error);
    expect(result.category).toBe('VALIDATION');
    expect(result.retryable).toBe(true);
    expect(result.message).toContain('Demasiados');
  });
});

// ─── mapError — GraphQL response.errors extraction ───────────
describe('mapError — GraphQL response errors', () => {
  it('extracts code from response.errors[0].extensions.code', () => {
    const error = {
      response: {
        errors: [
          { message: 'Invalid creds', extensions: { code: 'INVALID_CREDENTIALS' } },
        ],
      },
    };
    const result = mapError(error);
    expect(result.category).toBe('AUTH');
    expect(result.code).toBe('INVALID_CREDENTIALS');
  });

  it('surfaces Bridge field-level validation details as actionable text', () => {
    const error = {
      response: {
        errors: [
          {
            message:
              'Bridge API error: Please resubmit the following parameters that are either missing or invalid',
            extensions: {
              originalError: {
                details: {
                  'residential_address.postal_code': 'Invalid postal code for COL',
                },
              },
            },
          },
        ],
      },
      message: 'Bridge API error: Please resubmit the following parameters that are either missing or invalid',
    };

    const result = mapError(error);

    expect(result.category).toBe('VALIDATION');
    expect(result.message).toBe('residential address postal code: Invalid postal code for COL');
  });

  it('removes the Bridge API wrapper when only the provider message is available', () => {
    const error = {
      response: {
        errors: [
          {
            message:
              'Bridge API error: Please resubmit the following parameters that are either missing or invalid',
          },
        ],
      },
      message:
        'Bridge API error: Please resubmit the following parameters that are either missing or invalid',
    };

    const result = mapError(error);

    expect(result.message).toBe(
      'Please resubmit the following parameters that are either missing or invalid',
    );
  });

  it('maps same-asset developer fee rejection to a friendly direct-send message', () => {
    const error = {
      response: {
        errors: [
          {
            message:
              'Provider API error: developer_fee: cannot be set for usdt -> usdt',
          },
        ],
      },
      message:
        'Provider API error: developer_fee: cannot be set for usdt -> usdt',
    };

    const result = mapError(error);

    expect(result.category).toBe('VALIDATION');
    expect(result.message).toBe(
      'Este envío directo a la misma moneda no admite esa comisión. Intenta nuevamente o contacta a soporte si persiste.',
    );
  });
});

// ─── mapError — HTTP status codes ────────────────────────────
describe('mapError — HTTP status codes', () => {
  it('maps 401 to AUTH category', () => {
    const error = { response: { status: 401 } };
    const result = mapError(error);
    expect(result.category).toBe('AUTH');
    expect(result.code).toBe('HTTP_401');
  });

  it('maps 403 to PERMISSION, non-retryable', () => {
    const error = { response: { status: 403 } };
    const result = mapError(error);
    expect(result.category).toBe('PERMISSION');
    expect(result.retryable).toBe(false);
  });

  it('maps 500 to SERVER, retryable', () => {
    const error = { response: { status: 500 } };
    const result = mapError(error);
    expect(result.category).toBe('SERVER');
    expect(result.retryable).toBe(true);
  });

  it('maps 429 to rate limiting message', () => {
    const error = { response: { status: 429 } };
    const result = mapError(error);
    expect(result.message).toContain('Demasiadas solicitudes');
  });
});

// ─── mapError — network errors ───────────────────────────────
describe('mapError — network errors', () => {
  it('detects network error from message "NetworkError"', () => {
    const result = mapError(new Error('NetworkError when attempting to fetch resource'));
    expect(result.category).toBe('NETWORK');
    expect(result.retryable).toBe(true);
  });

  it('detects ECONNREFUSED as network error', () => {
    const error = { message: 'connect ECONNREFUSED 127.0.0.1:3000', code: 'ECONNREFUSED' };
    const result = mapError(error);
    expect(result.category).toBe('NETWORK');
  });

  it('detects timeout as network error', () => {
    const result = mapError(new Error('Request timeout after 30000ms'));
    expect(result.category).toBe('NETWORK');
  });
});

// ─── mapError — message heuristics ───────────────────────────
describe('mapError — message heuristics', () => {
  it('maps "invalid password" to AUTH', () => {
    const result = mapError(new Error('invalid password'));
    expect(result.category).toBe('AUTH');
  });

  it('maps "invalid credentials" to AUTH', () => {
    const result = mapError(new Error('invalid credentials for user'));
    expect(result.category).toBe('AUTH');
  });

  it('maps "user not found" to AUTH', () => {
    const result = mapError(new Error('User not found in database'));
    expect(result.category).toBe('AUTH');
  });

  it('maps "unauthorized" to PERMISSION', () => {
    const result = mapError(new Error('Unauthorized access to resource'));
    expect(result.category).toBe('PERMISSION');
  });
});

// ─── formatErrorMessage ──────────────────────────────────────
describe('formatErrorMessage', () => {
  it('returns only the user-friendly string', () => {
    const result = formatErrorMessage({ extensions: { code: 'INVALID_CREDENTIALS' } });
    expect(typeof result).toBe('string');
    expect(result).toContain('Email o contraseña');
  });

  it('never leaks technical details', () => {
    const result = formatErrorMessage(new Error('pg_query: syntax error at position 42'));
    expect(result).not.toContain('pg_query');
    expect(result).not.toContain('syntax error');
  });
});

// ─── isRetryableError ────────────────────────────────────────
describe('isRetryableError', () => {
  it('returns true for network errors', () => {
    expect(isRetryableError(new Error('NetworkError'))).toBe(true);
  });

  it('returns false for ACCOUNT_LOCKED', () => {
    expect(isRetryableError({ extensions: { code: 'ACCOUNT_LOCKED' } })).toBe(false);
  });
});

// ─── getErrorCategory ────────────────────────────────────────
describe('getErrorCategory', () => {
  it('returns correct category', () => {
    expect(getErrorCategory({ extensions: { code: 'TOKEN_EXPIRED' } })).toBe('AUTH');
    expect(getErrorCategory(new Error('NetworkError'))).toBe('NETWORK');
    expect(getErrorCategory({ response: { status: 500 } })).toBe('SERVER');
  });
});

// ─── Security: never leaks internals ─────────────────────────
describe('mapError — security (no leak)', () => {
  const INTERNAL_ERRORS = [
    'SELECT * FROM users WHERE id = 1',
    'Cannot read properties of null (reading "map")',
    'prisma.user.findUnique() failed',
    'Error: ENOENT: no such file /var/app/config.json',
    'JWT malformed',
    'MongoNetworkError: connection timed out',
  ];

  it.each(INTERNAL_ERRORS)(
    'does NOT leak "%s" in user-facing message',
    (techMessage) => {
      const result = mapError(new Error(techMessage));
      expect(result.message).not.toContain('SELECT');
      expect(result.message).not.toContain('Cannot read');
      expect(result.message).not.toContain('prisma');
      expect(result.message).not.toContain('ENOENT');
      expect(result.message).not.toContain('JWT malformed');
      expect(result.message).not.toContain('MongoNetworkError');
      // technical field DOES contain it
      expect(result.technical).toContain(techMessage);
    },
  );
});

// ─── Auth-specific error codes (Firebase + backend) ─────────
describe('mapError — auth-specific codes', () => {
  it('maps auth/email-already-in-use to friendly message', () => {
    const result = mapError({ extensions: { code: 'auth/email-already-in-use' } });
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('Ya existe una cuenta');
    expect(result.retryable).toBe(false);
  });

  it('maps auth/invalid-credential to friendly message', () => {
    const result = mapError({ extensions: { code: 'auth/invalid-credential' } });
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('Email o contraseña');
  });

  it('maps auth/too-many-requests to rate limit message', () => {
    const result = mapError({ extensions: { code: 'auth/too-many-requests' } });
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('Demasiados intentos');
  });

  it('maps auth/weak-password to VALIDATION', () => {
    const result = mapError({ extensions: { code: 'auth/weak-password' } });
    expect(result.category).toBe('VALIDATION');
    expect(result.message).toContain('débil');
  });

  it('maps CUSTOMER_ALREADY_EXISTS to friendly message', () => {
    const result = mapError({ extensions: { code: 'CUSTOMER_ALREADY_EXISTS' } });
    expect(result.category).toBe('VALIDATION');
    expect(result.retryable).toBe(false);
  });
});

// ─── Firebase error code in message heuristic ────────────────
describe('mapError — Firebase auth/ in message body', () => {
  it('extracts auth/invalid-credential from message string', () => {
    const result = mapError(new Error('Firebase: Error (auth/invalid-credential).'));
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('Email o contraseña');
    expect(result.code).toBe('auth/invalid-credential');
  });

  it('extracts auth/email-already-in-use from message string', () => {
    const result = mapError(new Error('Firebase: Error (auth/email-already-in-use).'));
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('Ya existe una cuenta');
  });

  it('extracts auth/too-many-requests from message string', () => {
    const result = mapError(new Error('Firebase: Error (auth/too-many-requests).'));
    expect(result.category).toBe('AUTH');
    expect(result.message).toContain('Demasiados intentos');
  });
});

// ─── "already exists" heuristic ──────────────────────────────
describe('mapError — "already exists" heuristic', () => {
  it('catches "email already exists" pattern', () => {
    const result = mapError(new Error('Customer with email already exists'));
    expect(result.message).toContain('Ya existe una cuenta');
    expect(result.retryable).toBe(false);
  });

  it('catches "already registered" pattern', () => {
    const result = mapError(new Error('User already registered'));
    expect(result.message).toContain('Ya existe una cuenta');
  });

  it('catches "duplicate" pattern', () => {
    const result = mapError(new Error('Duplicate entry for key email'));
    expect(result.message).toContain('Ya existe una cuenta');
  });
});

// ─── isConflictError ─────────────────────────────────────────
describe('isConflictError', () => {
  it('detects the CONFLICT extension code of a GraphQL error', () => {
    const error = {
      response: {
        errors: [
          { message: 'Mapping already exists', extensions: { code: 'CONFLICT' } },
        ],
      },
    };
    expect(isConflictError(error)).toBe(true);
  });

  it('detects a 409 status_code flattened into the GraphQL extensions', () => {
    const error = {
      response: {
        errors: [{ message: 'Conflict', extensions: { status_code: 409 } }],
      },
    };
    expect(isConflictError(error)).toBe(true);
  });

  it('detects a 409 transport status', () => {
    expect(isConflictError({ response: { status: 409 } })).toBe(true);
  });

  it('ignores other errors, empty values and plain messages', () => {
    expect(isConflictError(null)).toBe(false);
    expect(isConflictError(new Error('boom'))).toBe(false);
    expect(
      isConflictError({
        response: { errors: [{ extensions: { code: 'VALIDATION_ERROR' } }] },
      }),
    ).toBe(false);
    expect(isConflictError({ response: { status: 500 } })).toBe(false);
  });
});

// ─── mapError — beneficiary / provider codes (Phase 8) ───────
describe('mapError — beneficiary provider codes', () => {
  const gql = (code: string, extra: Record<string, unknown> = {}) => ({
    response: { errors: [{ message: 'raw backend text', extensions: { code, ...extra } }] },
  });

  it('prefers the domain error_code over the Apollo code (BAD_USER_INPUT carries BENEFICIARY_PROVIDER_REJECTED)', () => {
    const result = mapError({
      response: {
        errors: [
          {
            message: 'mesta rejected the beneficiary (VALIDATION_FAILED): address.state is not valid for US',
            extensions: {
              code: 'BAD_USER_INPUT',
              status_code: 422,
              error_code: 'BENEFICIARY_PROVIDER_REJECTED',
              provider_code: 'mesta',
            },
          },
        ],
      },
    });
    expect(result.code).toBe('BENEFICIARY_PROVIDER_REJECTED');
    expect(result.category).toBe('VALIDATION');
  });

  it('maps BENEFICIARY_DUPLICATE (409 with error_code) to a beneficiary message, not the e-mail one', () => {
    const result = mapError({
      response: {
        errors: [
          {
            message: 'A beneficiary with this CLABE is already registered',
            extensions: { code: 'CONFLICT', status_code: 409, error_code: 'BENEFICIARY_DUPLICATE' },
          },
        ],
      },
    });
    expect(result.code).toBe('BENEFICIARY_DUPLICATE');
    expect(result.message).toMatch(/beneficiario/i);
    expect(result.message).not.toMatch(/email/i);
  });

  it('maps BENEFICIARY_NOT_APPROVED to a validation message that says "en revisión"', () => {
    const result = mapError(gql('BENEFICIARY_NOT_APPROVED', { review_status: 'IN_REVIEW' }));
    expect(result.code).toBe('BENEFICIARY_NOT_APPROVED');
    expect(result.category).toBe('VALIDATION');
    expect(result.message).toMatch(/revisi[oó]n|aprob/i);
    expect(result.message).not.toContain('raw backend text');
    expect(result.retryable).toBe(false);
  });

  it('maps BENEFICIARY_PROVIDER_FIELDS_MISSING and exposes the missing fields', () => {
    const result = mapError(
      gql('BENEFICIARY_PROVIDER_FIELDS_MISSING', { fields: ['routing_number', 'account_type'] }),
    );
    expect(result.code).toBe('BENEFICIARY_PROVIDER_FIELDS_MISSING');
    expect(result.category).toBe('VALIDATION');
    expect(result.fields).toEqual(['routing_number', 'account_type']);
    expect(result.retryable).toBe(true);
  });

  it('reads the missing fields from a flattened error object too', () => {
    const result = mapError({
      extensions: { code: 'BENEFICIARY_PROVIDER_FIELDS_MISSING', fields: ['bic'] },
    });
    expect(result.fields).toEqual(['bic']);
  });

  it('ignores a non-array `fields` payload', () => {
    const result = mapError(gql('BENEFICIARY_PROVIDER_FIELDS_MISSING', { fields: 'bic' }));
    expect(result.fields).toBeUndefined();
  });

  it('maps BENEFICIARY_PROVIDER_REJECTED, BENEFICIARY_RAIL_UNSUPPORTED and BENEFICIARY_PROVIDER_UNAVAILABLE', () => {
    const rejected = mapError(gql('BENEFICIARY_PROVIDER_REJECTED'));
    expect(rejected.category).toBe('VALIDATION');
    expect(rejected.retryable).toBe(true);

    const unsupported = mapError(gql('BENEFICIARY_RAIL_UNSUPPORTED'));
    expect(unsupported.category).toBe('VALIDATION');
    expect(unsupported.retryable).toBe(false);

    const unavailable = mapError(gql('BENEFICIARY_PROVIDER_UNAVAILABLE'));
    expect(unavailable.category).toBe('SERVER');
    expect(unavailable.retryable).toBe(true);
  });

  it('keeps `fields` undefined for codes that do not carry it', () => {
    expect(mapError(gql('TOKEN_EXPIRED')).fields).toBeUndefined();
  });
});
