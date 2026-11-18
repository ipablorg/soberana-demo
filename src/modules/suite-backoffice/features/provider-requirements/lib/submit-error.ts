/**
 * The provider refusal of a requirement submission, as Commercial reads it.
 * The backend prefixes a requirement the provider takes no write for with
 * `REQUIREMENT_NOT_SUBMITTABLE`; its English detail is never shown.
 */

import { useCallback } from 'react';
import { useLingui } from '@lingui/react/macro';

const NOT_SUBMITTABLE = 'REQUIREMENT_NOT_SUBMITTABLE';

export function useSubmitErrorText(): (errorMessage: string) => string {
  const { t } = useLingui();
  const notSubmittable = t`Este proveedor no recibe ese requerimiento por la plataforma: complétalo directamente con el proveedor.`;

  return useCallback(
    (errorMessage: string) =>
      errorMessage.startsWith(NOT_SUBMITTABLE) ? notSubmittable : errorMessage,
    [notSubmittable]
  );
}
