import { t } from '@lingui/core/macro';
import type { FieldErrors, FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';

/**
 * The zod schemas keep stable English messages (they are also the contract the
 * schema tests assert). The wizard shows them to Spanish-speaking users, so the
 * resolver translates every message right before react-hook-form stores it.
 *
 * Built lazily so the active Lingui locale is read at call time, not at import.
 */
function getKnownMessages(): Record<string, string> {
  return {
    'A description is required when account purpose is "other"': t`Describe el propósito de la cuenta`,
    'A description is required when document purpose is "other"': t`Agrega una descripción para el documento`,
    'A description is required when money services is enabled': t`Describe los servicios de dinero que presta la empresa`,
    'Account purpose is required': t`Selecciona el propósito de la cuenta`,
    'At least one UBO is required': t`Agrega al menos un beneficiario final`,
    'Business description is required': t`Describe la actividad de la empresa`,
    'Business legal name is required': t`Ingresa la razón social de la empresa`,
    'City is required': t`Ingresa la ciudad`,
    'Compliance screening explanation is required': t`Explica el resultado del screening de cumplimiento`,
    'Employment status is required': t`Selecciona tu situación laboral`,
    'Expected monthly payments is required': t`Selecciona los pagos mensuales esperados`,
    'First name is required': t`Ingresa el nombre`,
    'Last name is required': t`Ingresa el apellido`,
    'Must be a valid URL': t`Ingresa una URL válida (https://…)`,
    'Must be a valid email': t`Ingresa un email válido`,
    'Number of employees is required': t`Selecciona el número de empleados`,
    'Industry is required': t`Selecciona la industria de la empresa`,
    'Registration number is required': t`Ingresa el número del registro mercantil de la empresa`,
    'Registration number must differ from the tax ID': t`El número de registro debe ser distinto del ID fiscal`,
    'Website or a reason for not having one is required': t`Indica el sitio web o el motivo por el que no tiene uno`,
    'Occupation is required': t`Selecciona tu ocupación`,
    'Physical address is required': t`Ingresa la dirección física`,
    'Postal code is required': t`Ingresa el código postal`,
    'Registered address is required': t`Ingresa la dirección de registro`,
    'Source of funds description is required': t`Describe el origen de los fondos`,
    'Source of funds is required': t`Selecciona el origen de los fondos`,
    'State / Province is required': t`Ingresa el estado o provincia`,
    'Street address is required': t`Ingresa la dirección`,
    'Tax ID is required': t`Ingresa el ID fiscal`,
    'Tax ID type is required': t`Selecciona el tipo de ID fiscal`,
    'US-issued documents only accept SSN or ITIN': t`Los documentos emitidos en EE. UU. solo pueden ser SSN o ITIN`,
    'a back image is required for this document type': t`Sube también el reverso del documento`,
    'a description is required for "other" document types': t`Describe el tipo de documento`,
    'a document file is required': t`Sube el archivo del documento`,
    'a document number is required for this document type': t`Ingresa el número del documento`,
    'a front image is required': t`Sube la foto frontal del documento`,
    'an expiration date is required for this document type': t`Ingresa la fecha de vencimiento del documento`,
    'must be YYYY-MM-DD': t`Usa el formato AAAA-MM-DD`,
    'must be a date in the past': t`La fecha debe estar en el pasado`,
    'must be a supported country code': t`Selecciona un país válido`,
    'must be a valid ISO 3166-1 alpha-3 code': t`Selecciona un país válido`,
    'must be a valid incorporation date within the last 50 years': t`Ingresa una fecha de constitución válida (últimos 50 años)`,
  };
}

/** zod's built-in messages for fields declared without a custom one. */
function localizeZodDefault(message: string): string | null {
  if (message === 'Required' || message.startsWith('String must contain at least')) {
    return t`Este campo es obligatorio`;
  }
  if (message.startsWith('Invalid enum value') || message.startsWith('Invalid option')) {
    return t`Selecciona una opción válida`;
  }
  if (message.startsWith('Expected ') && message.includes('received')) {
    return t`Este campo es obligatorio`;
  }
  if (message === 'Invalid' || message.startsWith('Invalid ')) {
    return t`Valor no válido`;
  }
  return null;
}

export function localizeValidationMessage(message: string): string {
  try {
    return getKnownMessages()[message] ?? localizeZodDefault(message) ?? message;
  } catch {
    // i18n not activated yet (e.g. very early render): keep the original text.
    return message;
  }
}

function localizeErrors(errors: unknown): unknown {
  if (Array.isArray(errors)) {
    return errors.map(localizeErrors);
  }
  if (errors === null || typeof errors !== 'object') {
    return errors;
  }

  const entries = Object.entries(errors as Record<string, unknown>).map(([key, value]) => {
    if (key === 'message' && typeof value === 'string') {
      return [key, localizeValidationMessage(value)];
    }
    // `ref` holds DOM nodes; never walk into it.
    if (key === 'ref') {
      return [key, value];
    }
    return [key, localizeErrors(value)];
  });

  return Object.assign(Object.create(Object.getPrototypeOf(errors)), Object.fromEntries(entries));
}

/**
 * Generic resolver shape (the one `zodResolver` returns). Keeping it generic lets
 * `useForm` infer the form type exactly as it did before the wrapper existed.
 */
type GenericResolver = <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;

/** Wraps a react-hook-form resolver so validation messages reach the UI in Spanish. */
export function withLocalizedMessages(resolver: GenericResolver): GenericResolver {
  return async <TFieldValues extends FieldValues, TContext>(
    values: TFieldValues,
    context: TContext | undefined,
    options: ResolverOptions<TFieldValues>
  ): Promise<ResolverResult<TFieldValues>> => {
    const result = await resolver(values, context, options);
    if (!result.errors || Object.keys(result.errors).length === 0) {
      return result;
    }

    // A resolver only reports errors together with empty `values`.
    return { values: {}, errors: localizeErrors(result.errors) as FieldErrors<TFieldValues> };
  };
}
