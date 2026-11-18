/**
 * Error Mapper Utility
 * 
 * Maps backend GraphQL and HTTP errors to user-friendly messages.
 * Provides consistent error handling across the application.
 */

export type ErrorCategory = 'AUTH' | 'NETWORK' | 'VALIDATION' | 'SERVER' | 'PERMISSION' | 'UNKNOWN';

export interface MappedError {
  message: string;
  category: ErrorCategory;
  code?: string;
  technical?: string;
  retryable: boolean;
  /**
   * Request fields the back reported as missing/invalid (e.g. a provider that
   * needs more beneficiary data). Forms use it to highlight the inputs.
   */
  fields?: string[];
}

/**
 * Known error codes and their user-friendly messages
 */
const ERROR_MESSAGES: Record<string, { message: string; category: ErrorCategory; retryable: boolean }> = {
  // Idempotency (money-moving mutations; see docs/GRAPHQL_INTEGRATION.md)
  'IDEMPOTENCY_KEY_REQUIRED': {
    message: 'No se pudo identificar la solicitud. Inténtalo de nuevo.',
    category: 'VALIDATION',
    retryable: false,
  },
  'IDEMPOTENCY_KEY_INVALID': {
    message: 'No se pudo identificar la solicitud. Inténtalo de nuevo.',
    category: 'VALIDATION',
    retryable: false,
  },
  'IDEMPOTENCY_KEY_REUSED': {
    message: 'Esta solicitud cambió respecto a un intento anterior. Revisa los datos e inténtalo de nuevo.',
    category: 'VALIDATION',
    retryable: true,
  },
  'PROVIDER_OUTCOME_UNKNOWN': {
    message: 'No pudimos confirmar el resultado de tu operación. No la repitas con otros datos: reintenta en unos instantes y revisa tus movimientos.',
    category: 'SERVER',
    retryable: true,
  },
  // Authentication Errors
  'INVALID_CREDENTIALS': {
    message: 'Email o contraseña incorrectos. Por favor, verifica tus datos.',
    category: 'AUTH',
    retryable: true,
  },
  'INVALID_EMAIL_OR_PASSWORD': {
    message: 'Email o contraseña incorrectos. Por favor, verifica tus datos.',
    category: 'AUTH',
    retryable: true,
  },
  'USER_NOT_FOUND': {
    message: 'No se encontró un usuario con ese email.',
    category: 'AUTH',
    retryable: true,
  },
  'ACCOUNT_LOCKED': {
    message: 'Tu cuenta ha sido bloqueada por razones de seguridad. Contacta con soporte.',
    category: 'AUTH',
    retryable: false,
  },
  'ACCOUNT_DISABLED': {
    message: 'Tu cuenta está desactivada. Contacta con soporte para reactivarla.',
    category: 'AUTH',
    retryable: false,
  },
  'TOKEN_EXPIRED': {
    message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    category: 'AUTH',
    retryable: true,
  },
  'UNAUTHENTICATED': {
    message: 'Tu sesión no es válida o ha expirado. Por favor, inicia sesión nuevamente.',
    category: 'AUTH',
    retryable: true,
  },
  'INVALID_TOKEN': {
    message: 'Tu sesión ya no es válida. Por favor, inicia sesión nuevamente.',
    category: 'AUTH',
    retryable: true,
  },
  'STAFF_REQUIRED': {
    message: 'Acceso restringido a personal autorizado. Esta área es solo para administradores.',
    category: 'PERMISSION',
    retryable: false,
  },
  'INSUFFICIENT_PERMISSIONS': {
    message: 'No tienes permisos suficientes para realizar esta acción.',
    category: 'PERMISSION',
    retryable: false,
  },

  // Beneficiaries created at the provider (Phase 8): usable only once APPROVED
  'BENEFICIARY_DUPLICATE': {
    message: 'Ya tienes un beneficiario registrado con esta cuenta.',
    category: 'VALIDATION',
    retryable: false,
  },
  'BENEFICIARY_NOT_APPROVED': {
    message: 'Este beneficiario sigue en revisión. Podrás enviarle dinero cuando lo aprueben.',
    category: 'VALIDATION',
    retryable: false,
  },
  'BENEFICIARY_PROVIDER_FIELDS_MISSING': {
    message: 'Faltan datos para este tipo de cuenta. Completa los campos marcados e inténtalo de nuevo.',
    category: 'VALIDATION',
    retryable: true,
  },
  'BENEFICIARY_PROVIDER_REJECTED': {
    message: 'El proveedor rechazó los datos de esta cuenta. Revísalos o prueba con otra ruta.',
    category: 'VALIDATION',
    retryable: true,
  },
  'BENEFICIARY_RAIL_UNSUPPORTED': {
    message: 'Todavía no podemos enviar a este país con esa ruta. Elige otra.',
    category: 'VALIDATION',
    retryable: false,
  },
  'BENEFICIARY_PROVIDER_UNAVAILABLE': {
    message: 'El proveedor no responde en este momento. Inténtalo de nuevo en unos minutos.',
    category: 'SERVER',
    retryable: true,
  },

  // Validation Errors
  'VALIDATION_ERROR': {
    message: 'Revisa los campos e intenta nuevamente.',
    category: 'VALIDATION',
    retryable: true,
  },
  'INVALID_EMAIL': {
    message: 'Revisa el formato del email.',
    category: 'VALIDATION',
    retryable: true,
  },
  'PASSWORD_TOO_SHORT': {
    message: 'La contraseña debe tener al menos 8 caracteres.',
    category: 'VALIDATION',
    retryable: true,
  },
  'REQUIRED_FIELD': {
    message: 'Completa todos los campos obligatorios.',
    category: 'VALIDATION',
    retryable: true,
  },

  // Network Errors
  'NETWORK_ERROR': {
    message: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
    category: 'NETWORK',
    retryable: true,
  },
  'TIMEOUT_ERROR': {
    message: 'La solicitud tardó demasiado tiempo. Intenta nuevamente.',
    category: 'NETWORK',
    retryable: true,
  },

  // Server Errors
  'INTERNAL_SERVER_ERROR': {
    message: 'Error interno del servidor. Nuestro equipo ha sido notificado. Intenta más tarde.',
    category: 'SERVER',
    retryable: true,
  },
  'SERVICE_UNAVAILABLE': {
    message: 'El servicio no está disponible temporalmente. Intenta más tarde.',
    category: 'SERVER',
    retryable: true,
  },
  'DATABASE_ERROR': {
    message: 'Error de base de datos. Por favor, intenta más tarde.',
    category: 'SERVER',
    retryable: true,
  },

  // Rate Limiting
  'RATE_LIMIT_EXCEEDED': {
    message: 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.',
    category: 'VALIDATION',
    retryable: true,
  },

  // Registration Errors
  'EMAIL_ALREADY_EXISTS': {
    message: 'Ya existe una cuenta con este email. ¿Intentas iniciar sesión?',
    category: 'AUTH',
    retryable: false,
  },
  'auth/email-already-in-use': {
    message: 'Ya existe una cuenta con este email. ¿Intentas iniciar sesión?',
    category: 'AUTH',
    retryable: false,
  },
  'auth/invalid-credential': {
    message: 'Email o contraseña incorrectos. Por favor, verifica tus datos.',
    category: 'AUTH',
    retryable: true,
  },
  'auth/invalid-login-credentials': {
    message: 'Email o contraseña incorrectos. Por favor, verifica tus datos.',
    category: 'AUTH',
    retryable: true,
  },
  'auth/user-not-found': {
    message: 'No se encontró un usuario con ese email.',
    category: 'AUTH',
    retryable: true,
  },
  'auth/wrong-password': {
    message: 'Contraseña incorrecta. Por favor, verifica tus datos.',
    category: 'AUTH',
    retryable: true,
  },
  'auth/too-many-requests': {
    message: 'Demasiados intentos fallidos. Espera unos minutos e intenta nuevamente, tu cuenta ha sido protegida temporalmente.',
    category: 'AUTH',
    retryable: true,
  },
  'auth/weak-password': {
    message: 'La contraseña es muy débil. Usa al menos 8 caracteres con mayúsculas, números y símbolos.',
    category: 'VALIDATION',
    retryable: true,
  },
  'auth/unsupported-tenant-operation': {
    message: 'Operación no soportada por el tenant. Contacta a soporte para habilitar MFA.',
    category: 'AUTH',
    retryable: false,
  },
  'auth/multi-factor-auth-required': {
    message: 'Se requiere autenticación de dos factores.',
    category: 'AUTH',
    retryable: true,
  },
  'auth/invalid-verification-code': {
    message:
      'Código incorrecto o expirado. Usa el código de Soberana en tu app de autenticación — no el de Airbnb, Gmail u otra cuenta guardada en Contraseñas.',
    category: 'AUTH',
    retryable: true,
  },
  'auth/invalid-verification-id': {
    message: 'El código de verificación ha expirado. Por favor, recarga e intenta de nuevo.',
    category: 'AUTH',
    retryable: true,
  },
  'REAUTH_REQUIRED': {
    message: 'Por seguridad, confirma tu identidad para continuar.',
    category: 'AUTH',
    retryable: true,
  },
  'CUSTOMER_ALREADY_EXISTS': {
    message: 'Ya existe un cliente registrado con estos datos.',
    category: 'VALIDATION',
    retryable: false,
  },

  // FX quote / session error codes
  'RATE_TOKEN_EXPIRED': {
    message: 'Tu tasa caducó. Recotiza.',
    category: 'VALIDATION',
    retryable: true,
  },
  'RATE_TOKEN_INVALID': {
    message: 'La cotización ya no es válida. Recotiza.',
    category: 'VALIDATION',
    retryable: true,
  },
  'RATE_VALUE_MISMATCH': {
    message: 'La tasa cambió. Recotiza para confirmar.',
    category: 'VALIDATION',
    retryable: true,
  },
  'PHONE_MISMATCH': {
    message: 'El teléfono no coincide con el código. Verifica el número.',
    category: 'VALIDATION',
    retryable: true,
  },
  'INVALID_REFRESH_TOKEN': {
    message: 'Tu sesión expiró. Inicia de nuevo.',
    category: 'AUTH',
    retryable: true,
  },
  'CLIENT_NOT_FOUND': {
    message: 'Tu cuenta aún no está lista. Contacta a soporte.',
    category: 'AUTH',
    retryable: false,
  },
};

/**
 * HTTP status code messages
 */
const HTTP_STATUS_MESSAGES: Record<number, { message: string; category: ErrorCategory; retryable: boolean }> = {
  400: {
    message: 'Revisa los datos e intenta nuevamente.',
    category: 'VALIDATION',
    retryable: true,
  },
  401: {
    message: 'No estás autenticado. Por favor, inicia sesión.',
    category: 'AUTH',
    retryable: true,
  },
  403: {
    message: 'No tienes permisos para acceder a este recurso.',
    category: 'PERMISSION',
    retryable: false,
  },
  404: {
    message: 'El recurso solicitado no fue encontrado.',
    category: 'VALIDATION',
    retryable: false,
  },
  429: {
    message: 'Demasiadas solicitudes. Espera unos minutos antes de intentar nuevamente.',
    category: 'VALIDATION',
    retryable: true,
  },
  500: {
    message: 'Error interno del servidor. Intenta más tarde.',
    category: 'SERVER',
    retryable: true,
  },
  502: {
    message: 'Error de gateway. El servidor no está disponible temporalmente.',
    category: 'SERVER',
    retryable: true,
  },
  503: {
    message: 'Servicio no disponible. Estamos trabajando en ello.',
    category: 'SERVER',
    retryable: true,
  },
  504: {
    message: 'Tiempo de espera agotado. Intenta nuevamente.',
    category: 'NETWORK',
    retryable: true,
  },
};

/**
 * Extract the first error message from a graphql-request ClientError.
 * ClientError.response.errors is the array of GraphQL errors returned by the server.
 */
function extractGraphQLMessage(error: unknown): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const gqlErrors = err?.response?.errors;
  if (Array.isArray(gqlErrors) && gqlErrors.length > 0) {
    return gqlErrors[0]?.message ?? undefined;
  }
  return undefined;
}

function sanitizeProviderWrapper(message: string): string {
  return message.replace(/^(Bridge|Provider) API error:\s*/i, '').trim();
}

function extractBridgeValidationMessage(error: unknown): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const details =
    // NestJS filter puts details in extensions.* directly (AllExceptionsFilter → extraFields)
    err?.response?.errors?.[0]?.extensions?.details
    ?? err?.response?.errors?.[0]?.extensions?.originalError?.details
    ?? err?.response?.errors?.[0]?.extensions?.exception?.response?.details
    ?? err?.response?.data?.details
    ?? err?.details;

  if (!details || typeof details !== 'object') {
    return undefined;
  }

  const firstEntry = Object.entries(details as Record<string, unknown>).find(
    ([field, message]) =>
      typeof field === 'string' && field.length > 0 && typeof message === 'string' && message.trim().length > 0,
  );

  if (!firstEntry) {
    return undefined;
  }

  const [field, message] = firstEntry as [string, string];
  return `${field.replace(/[_.]+/g, ' ').trim()}: ${message.trim()}`;
}

/**
 * Extract the list of offending request fields a typed error carries
 * (`extensions.fields`). Anything but an array of non-empty strings is ignored.
 */
function extractErrorFields(error: unknown): string[] | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const raw =
    err?.response?.errors?.[0]?.extensions?.fields ??
    err?.extensions?.fields ??
    err?.response?.data?.fields;
  if (!Array.isArray(raw)) return undefined;
  const fields = raw.filter((f): f is string => typeof f === 'string' && f.length > 0);
  return fields.length > 0 ? fields : undefined;
}

/**
 * Extract error code from GraphQL error
 */
function extractErrorCode(error: unknown): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  // The back maps HttpException bodies to Apollo codes (BAD_USER_INPUT, CONFLICT…)
  // and keeps the domain code (BENEFICIARY_*, CUSTOMER_*) in extensions.error_code.
  // The domain code is the one the catalogue knows, so it wins when present.
  const ext = err?.extensions ?? err?.response?.errors?.[0]?.extensions;
  if (typeof ext?.error_code === 'string' && ext.error_code) {
    return ext.error_code;
  }

  // Try extensions.code (standard GraphQL)
  if (err?.extensions?.code) {
    return err.extensions.code;
  }

  // Try response.errors[0].extensions.code
  if (err?.response?.errors?.[0]?.extensions?.code) {
    return err.response.errors[0].extensions.code;
  }

  // Try error.code
  if (err?.code) {
    return err.code;
  }

  return undefined;
}

/**
 * Extract HTTP status from error
 */
function extractHttpStatus(error: unknown): number | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  // Try response.status
  if (err?.response?.status) {
    return err.response.status;
  }

  // Try status directly
  if (err?.status) {
    return err.status;
  }

  return undefined;
}

/**
 * Check if error is a network error
 */
function isNetworkError(error: unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const message = err?.message?.toLowerCase() || '';
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    err?.name === 'NetworkError' ||
    err?.code === 'ECONNREFUSED'
  );
}

/**
 * Map error to user-friendly message
 * 
 * @param error - Error object from GraphQL, HTTP, or JavaScript
 * @returns Mapped error with user-friendly message
 * 
 * @example
 * ```typescript
 * try {
 *   await signIn(credentials);
 * } catch (error) {
 *   const mapped = mapError(error);
 *   toast.error(mapped.message);
 * }
 * ```
 */
/**
 * Backend error messages (English) → user-friendly Spanish messages.
 * Patterns are matched case-insensitively against the GraphQL error message.
 */
const GRAPHQL_MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string; category: ErrorCategory; retryable: boolean }> = [
  // Beneficiary-specific
  { pattern: /missing.*customer_id/i, message: 'Falta el identificador del cliente. Cierra sesión y vuelve a intentarlo.', category: 'VALIDATION', retryable: true },
  { pattern: /customer.*not found|customer.*no existe/i, message: 'No se encontró el perfil del cliente. Contacta a soporte.', category: 'VALIDATION', retryable: false },
  { pattern: /rail.*not found|payment.?rail.*not.*found/i, message: 'No se encontró la ruta de pago para este país. Verifica el país y tipo de cuenta.', category: 'VALIDATION', retryable: true },
  { pattern: /rail.*(not available|unavailable|is not available)|not available for this merchant/i, message: 'La ruta de pago para este beneficiario no está disponible en este momento. Intenta más tarde o contacta a soporte.', category: 'VALIDATION', retryable: true },
  { pattern: /missing.*required.*field|required.*field.*missing/i, message: 'Faltan campos obligatorios. Revisa el formulario e intenta de nuevo.', category: 'VALIDATION', retryable: true },
  { pattern: /missing.*routing_number/i, message: 'El routing number es obligatorio para cuentas en Estados Unidos.', category: 'VALIDATION', retryable: true },
  { pattern: /missing.*account_number/i, message: 'El número de cuenta es obligatorio.', category: 'VALIDATION', retryable: true },
  { pattern: /missing.*clabe/i, message: 'La CLABE es obligatoria para cuentas en México.', category: 'VALIDATION', retryable: true },
  { pattern: /missing.*pix/i, message: 'La clave PIX es obligatoria para cuentas en Brasil.', category: 'VALIDATION', retryable: true },
  { pattern: /missing.*iban/i, message: 'El IBAN es obligatorio para cuentas SEPA.', category: 'VALIDATION', retryable: true },
  { pattern: /missing.*bank_code/i, message: 'El código del banco es obligatorio.', category: 'VALIDATION', retryable: true },
  { pattern: /invalid.*clabe|clabe.*invalid|clabe.*digits/i, message: 'La CLABE debe tener exactamente 18 dígitos.', category: 'VALIDATION', retryable: true },
  { pattern: /invalid.*iban|iban.*invalid/i, message: 'El IBAN ingresado no es válido. Verifica el formato.', category: 'VALIDATION', retryable: true },
  { pattern: /invalid.*routing/i, message: 'El routing number no es válido. Verifica el formato.', category: 'VALIDATION', retryable: true },
  { pattern: /beneficiary.*already.*exists|duplicate.*beneficiary/i, message: 'Ya existe un beneficiario con estos datos.', category: 'VALIDATION', retryable: false },
  { pattern: /client.*not.*resolvable|clientid.*not.*resolvable/i, message: 'Error de autenticación del cliente. Cierra sesión y vuelve a intentarlo.', category: 'AUTH', retryable: true },
  { pattern: /developer_fee:\s*cannot be set for\s+([a-z0-9_]+)\s*->\s*\1/i, message: 'Este envío directo a la misma moneda no admite esa comisión. Intenta nuevamente o contacta a soporte si persiste.', category: 'VALIDATION', retryable: true },
  // Generic backend patterns
  { pattern: /bad request/i, message: 'Los datos enviados no son válidos. Revisa el formulario e intenta de nuevo.', category: 'VALIDATION', retryable: true },
  { pattern: /forbidden/i, message: 'No tienes permisos para realizar esta acción.', category: 'PERMISSION', retryable: false },
  { pattern: /internal.*server.*error/i, message: 'Error interno del servidor. Intenta más tarde.', category: 'SERVER', retryable: true },
];

export function mapError(error: unknown): MappedError {
  // Handle null/undefined
  if (!error) {
    return {
      message: 'Ha ocurrido un error inesperado.',
      category: 'UNKNOWN',
      retryable: true,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;

  // Extract technical message for debugging
  const technicalMessage = err?.message || String(err);
  const bridgeValidationMessage = extractBridgeValidationMessage(err);

  if (bridgeValidationMessage) {
    return {
      message: bridgeValidationMessage,
      category: 'VALIDATION',
      technical: technicalMessage,
      retryable: true,
    };
  }

  // Check for network errors first. A response that carries GraphQL errors proves the
  // server answered, so it is not a connectivity failure — and graphql-request's
  // `message` is the whole serialized response (stacktrace included), which would
  // otherwise trip the keyword match on words like "fetch" or "timeout".
  const serverAnswered = Array.isArray(err?.response?.errors) && err.response.errors.length > 0;
  if (!serverAnswered && isNetworkError(err)) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR.message,
      category: 'NETWORK',
      technical: technicalMessage,
      retryable: true,
    };
  }

  // Try to extract error code
  const errorCode = extractErrorCode(err);
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    const mapped = ERROR_MESSAGES[errorCode];
    const fields = extractErrorFields(err);
    return {
      message: mapped.message,
      category: mapped.category,
      code: errorCode,
      technical: technicalMessage,
      retryable: mapped.retryable,
      ...(fields ? { fields } : {}),
    };
  }

  // Try HTTP status code
  const httpStatus = extractHttpStatus(err);
  if (httpStatus && HTTP_STATUS_MESSAGES[httpStatus]) {
    const mapped = HTTP_STATUS_MESSAGES[httpStatus];
    return {
      message: mapped.message,
      category: mapped.category,
      code: `HTTP_${httpStatus}`,
      technical: technicalMessage,
      retryable: mapped.retryable,
    };
  }

  // Extract the actual GraphQL error message from graphql-request ClientError.
  // This is the real backend message, not graphql-request's wrapper.
  const gqlMessage = extractGraphQLMessage(err);
  const sanitizedGraphQlMessage = gqlMessage ? sanitizeProviderWrapper(gqlMessage) : undefined;
  const sanitizedTechnicalMessage = sanitizeProviderWrapper(technicalMessage);
  const messageToMatch = sanitizedGraphQlMessage || sanitizedTechnicalMessage;
  const lowerMessage = messageToMatch.toLowerCase();

  // Match against GraphQL message patterns (beneficiary errors, etc.)
  for (const { pattern, message, category, retryable } of GRAPHQL_MESSAGE_PATTERNS) {
    if (pattern.test(messageToMatch)) {
      return { message, category, technical: technicalMessage, retryable };
    }
  }

  // Check for custom MFA wrapper error
  if (technicalMessage.includes('MFA_ENROLLMENT_FAILED')) {
    return {
      message: 'Por seguridad, tu cuenta requiere autenticación de dos factores, pero ocurrió un error al configurar. Por favor recarga e intenta de nuevo o contacta soporte.',
      category: 'AUTH',
      technical: technicalMessage,
      retryable: true,
    };
  }

  // Firebase auth error codes in message
  if (lowerMessage.includes('auth/')) {
    const firebaseCodeMatch = messageToMatch.match(/auth\/[\w-]+/);
    if (firebaseCodeMatch && ERROR_MESSAGES[firebaseCodeMatch[0]]) {
      const mapped = ERROR_MESSAGES[firebaseCodeMatch[0]];
      return {
        message: mapped.message,
        category: mapped.category,
        code: firebaseCodeMatch[0],
        technical: technicalMessage,
        retryable: mapped.retryable,
      };
    }
  }

  // If it's auth/user-not-found we should map it
  if (lowerMessage.includes('user not found')) {
    return {
      message: ERROR_MESSAGES['USER_NOT_FOUND'].message,
      category: 'AUTH',
      technical: technicalMessage,
      retryable: true,
    };
  }

  // "already exists" patterns — differentiate email vs customer/tax_id duplicates
  if (lowerMessage.includes('already exists') || lowerMessage.includes('already registered') || lowerMessage.includes('duplicate')) {
    const isCustomerDuplicate = !lowerMessage.includes('email') && (lowerMessage.includes('customer') || lowerMessage.includes('tax_id'));
    return {
      message: isCustomerDuplicate
        ? ERROR_MESSAGES['CUSTOMER_ALREADY_EXISTS'].message
        : ERROR_MESSAGES['EMAIL_ALREADY_EXISTS'].message,
      category: isCustomerDuplicate ? 'VALIDATION' : 'AUTH',
      technical: technicalMessage,
      retryable: false,
    };
  }

  if (lowerMessage.includes('invalid') && (lowerMessage.includes('password') || lowerMessage.includes('credentials'))) {
    return {
      message: ERROR_MESSAGES.INVALID_CREDENTIALS.message,
      category: 'AUTH',
      technical: technicalMessage,
      retryable: true,
    };
  }

  if (lowerMessage.includes('not found')) {
    return {
      message: 'El recurso solicitado no fue encontrado.',
      category: 'VALIDATION',
      technical: technicalMessage,
      retryable: false,
    };
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
    return {
      message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS.message,
      category: 'PERMISSION',
      technical: technicalMessage,
      retryable: false,
    };
  }

  if (lowerMessage.includes('validation')) {
    return {
      message: ERROR_MESSAGES.VALIDATION_ERROR.message,
      category: 'VALIDATION',
      technical: technicalMessage,
      retryable: true,
    };
  }

  // If we have a clean GraphQL message from the backend, show it directly
  // (it's more specific than our generic fallback)
  if (sanitizedGraphQlMessage && sanitizedGraphQlMessage.length < 200) {
    return {
      message: sanitizedGraphQlMessage,
      category: 'UNKNOWN',
      technical: technicalMessage,
      retryable: true,
    };
  }

  // Default fallback
  return {
    message:
      'Ha ocurrido un error inesperado. Por favor, intenta nuevamente o contacta con soporte.',
    category: 'UNKNOWN',
    technical: technicalMessage,
    retryable: true,
  };
}

/**
 * True when the backend rejected the call as a CONFLICT (HTTP 409), e.g. a
 * unique-constraint violation. Reads the GraphQL `extensions.code` /
 * `status_code` first and falls back to the transport status.
 */
export function isConflictError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const gqlErrors: unknown[] = Array.isArray(err.response?.errors) ? err.response.errors : [];
  const extensions = [
    err.extensions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...gqlErrors.map((gqlError) => (gqlError as any)?.extensions),
  ].filter((ext) => ext && typeof ext === 'object');

  const fromExtensions = extensions.some(
    (ext) =>
      ext.code === 'CONFLICT' ||
      ext.error_code === 'CONFLICT' ||
      Number(ext.status_code ?? ext.statusCode) === 409,
  );

  return fromExtensions || extractHttpStatus(err) === 409;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const mapped = mapError(error);
  return mapped.retryable;
}

/**
 * Get error category
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  const mapped = mapError(error);
  return mapped.category;
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: unknown): string {
  const mapped = mapError(error);
  return mapped.message;
}
