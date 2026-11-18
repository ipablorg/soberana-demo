/**
 * GlobalConnectors Bridge.xyz Error Mapper
 * Maps technical API errors to user-friendly messages
 */

export interface MappedError {
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  severity: 'info' | 'warning' | 'error';
  technicalDetails?: string;
}

/**
 * KYC Status Messages
 * Based on Bridge.xyz KYC status transitions
 */
const KYC_STATUS_MESSAGES: Record<string, MappedError> = {
  not_started: {
    title: 'Verificación Pendiente',
    message: 'Necesitas completar el proceso de verificación de identidad (KYC) para continuar.',
    actionLabel: 'Iniciar Verificación',
    severity: 'info',
  },
  incomplete: {
    title: 'Verificación Incompleta',
    message: 'Tu proceso de verificación está incompleto. Por favor, completa todos los pasos requeridos.',
    actionLabel: 'Completar Verificación',
    severity: 'warning',
  },
  under_review: {
    title: 'Verificación en Revisión',
    message: 'Tu información está siendo revisada. Esto puede tomar hasta 1 día hábil.',
    severity: 'info',
  },
  rejected: {
    title: 'Verificación Rechazada',
    message: 'No pudimos verificar tu información. Por favor, contacta a soporte para más detalles.',
    actionLabel: 'Contactar Soporte',
    severity: 'error',
  },
};

/**
 * API Error Patterns
 * Maps Bridge.xyz API error messages to user-friendly messages
 */
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  mapper: (match: RegExpMatchArray) => MappedError;
}> = [
  {
    // KYC Link already created
    pattern: /kyc link has already been created for this email/i,
    mapper: () => ({
      title: 'Verificación Pendiente',
      message:
        'Ya tienes un proceso de verificación de identidad iniciado. Completa el proceso existente para continuar.',
      actionLabel: 'Continuar con mi Verificación',
      severity: 'warning',
      technicalDetails: 'KYC link already exists for this email address',
    }),
  },
  {
    // Invalid routing number
    pattern: /invalid routing number|routing number.*invalid/i,
    mapper: () => ({
      title: 'Routing Number Inválido',
      message: 'El routing number proporcionado no es válido. Verifica que sea un número de 9 dígitos correcto.',
      severity: 'error',
    }),
  },
  {
    // Invalid IBAN
    pattern: /invalid iban|iban.*invalid/i,
    mapper: () => ({
      title: 'IBAN Inválido',
      message: 'El IBAN proporcionado no es válido. Verifica el formato y vuelve a intentar.',
      severity: 'error',
    }),
  },
  {
    // Invalid account number
    pattern: /invalid account number|account number.*invalid/i,
    mapper: () => ({
      title: 'Número de Cuenta Inválido',
      message: 'El número de cuenta proporcionado no es válido. Verifica la información e intenta nuevamente.',
      severity: 'error',
    }),
  },
  {
    // Customer not found
    pattern: /customer not found|customer.*does not exist/i,
    mapper: () => ({
      title: 'Usuario No Encontrado',
      message: 'No se encontró un usuario registrado. Por favor, inicia el proceso de registro primero.',
      severity: 'error',
    }),
  },
  {
    // Insufficient funds
    pattern: /insufficient funds|not enough balance/i,
    mapper: () => ({
      title: 'Fondos Insuficientes',
      message: 'No tienes fondos suficientes para completar esta transacción.',
      severity: 'warning',
    }),
  },
  {
    // Transfer limit exceeded
    pattern: /transfer limit exceeded|exceeds.*limit/i,
    mapper: () => ({
      title: 'Límite Excedido',
      message: 'El monto excede el límite permitido para transferencias. Reduce el monto o contacta a soporte.',
      severity: 'warning',
    }),
  },
  {
    // Unsupported currency
    pattern: /unsupported currency|currency not supported/i,
    mapper: () => ({
      title: 'Moneda No Soportada',
      message: 'La moneda seleccionada no está disponible para este corredor. Selecciona otra opción.',
      severity: 'error',
    }),
  },
  {
    // Unsupported country
    pattern: /unsupported country|country not supported/i,
    mapper: () => ({
      title: 'País No Soportado',
      message: 'Actualmente no operamos en el país seleccionado. Consulta los países disponibles.',
      severity: 'error',
    }),
  },
  {
    // Address validation failed
    pattern: /address validation failed|invalid address/i,
    mapper: () => ({
      title: 'Dirección Inválida',
      message: 'La dirección proporcionada no pudo ser validada. Verifica los datos e intenta nuevamente.',
      severity: 'error',
    }),
  },
  {
    // KYC required
    pattern: /kyc required|kyc.*needed/i,
    mapper: () => ({
      title: 'Verificación Requerida',
      message: 'Para continuar, necesitas completar el proceso de verificación de identidad (KYC).',
      actionLabel: 'Iniciar Verificación',
      severity: 'info',
    }),
  },
  {
    // Terms of Service not accepted
    pattern: /terms of service|tos.*not.*accepted/i,
    mapper: () => ({
      title: 'Términos y Condiciones',
      message: 'Debes aceptar los términos y condiciones para continuar.',
      actionLabel: 'Ver Términos',
      severity: 'warning',
    }),
  },
  {
    // External account required
    pattern: /external account required|no external account/i,
    mapper: () => ({
      title: 'Cuenta Bancaria Requerida',
      message: 'Necesitas registrar una cuenta bancaria externa antes de continuar.',
      severity: 'info',
    }),
  },
  {
    // Rate limit
    pattern: /rate limit|too many requests/i,
    mapper: () => ({
      title: 'Demasiados Intentos',
      message: 'Has realizado demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.',
      severity: 'warning',
    }),
  },
  {
    // Server error
    pattern: /internal server error|500/i,
    mapper: () => ({
      title: 'Error del Servidor',
      message: 'Ocurrió un error en nuestros servidores. Estamos trabajando para resolverlo.',
      severity: 'error',
    }),
  },
];

/**
 * GraphQL Validation Errors
 * These indicate that the backend schema is not implemented
 */
const GRAPHQL_VALIDATION_PATTERNS = [
  /cannot query field/i,
  /unknown type/i,
  /graphql_validation_failed/i,
];

/**
 * Maps a raw error to a user-friendly message
 */
export function mapGlobalConnectorsError(error: unknown): MappedError {
  // Default error
  const defaultError: MappedError = {
    title: 'Error Inesperado',
    message: 'Ocurrió un error. Por favor, intenta nuevamente o contacta a soporte.',
    severity: 'error',
  };

  // Handle non-Error objects
  if (!(error instanceof Error)) {
    return defaultError;
  }

  const errorMessage = error.message;

  // Check for GraphQL validation errors (backend not implemented)
  if (GRAPHQL_VALIDATION_PATTERNS.some((pattern) => pattern.test(errorMessage))) {
    return {
      title: 'Funcionalidad No Disponible',
      message: 'El backend aún no ha implementado este endpoint. Contacta al equipo de desarrollo.',
      severity: 'warning',
      technicalDetails: errorMessage,
    };
  }

  // Try to match against known patterns
  for (const { pattern, mapper } of ERROR_PATTERNS) {
    const match = errorMessage.match(pattern);
    if (match) {
      const mapped = mapper(match);
      // Include technical details for debugging
      mapped.technicalDetails = errorMessage;
      return mapped;
    }
  }

  // Extract clean message from Bridge API errors
  if (errorMessage.includes('Bridge API error:')) {
    const cleanMessage = errorMessage
      .replace('_ClientError:', '')
      .replace('Bridge API error:', '')
      .trim();

    return {
      title: 'Error de Validación',
      message: cleanMessage,
      severity: 'error',
      technicalDetails: errorMessage,
    };
  }

  // Return technical message with details
  return {
    ...defaultError,
    message: errorMessage || defaultError.message,
    technicalDetails: errorMessage,
  };
}

/**
 * Extract KYC link from error response if available
 */
export function extractKycLinkFromError(error: unknown): string | null {
  if (!(error instanceof Error)) return null;

  try {
    // Try to parse error response
    const errorStr = JSON.stringify(error);
    const kycLinkMatch = errorStr.match(/kyc_link["']?\s*:\s*["']([^"']+)["']/i);
    if (kycLinkMatch) {
      return kycLinkMatch[1];
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

/**
 * Get KYC status message
 */
export function getKycStatusMessage(status: string): MappedError {
  return (
    KYC_STATUS_MESSAGES[status] || {
      title: 'Estado Desconocido',
      message: `Estado KYC: ${status}`,
      severity: 'info',
    }
  );
}

