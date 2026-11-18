import { useState, useCallback } from 'react';
import {
  validateJsonPayload,
  encodeDeepLinkPayload,
  buildDeepLinkUrl,
  isCryptoAvailable,
} from '../utils/deep-link-utils';

const DEMO_SECRET = 'soberana-demo-secret-v1';

export function useDeepLink(widgetId: string, secret?: string) {
  const [rawPayload, setRawPayload] = useState('{\n  "invoice_id": "INV-001",\n  "amount": 1500,\n  "currency": "USD"\n}');
  const [encodedUrl, setEncodedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [httpsRequired, setHttpsRequired] = useState(false);
  const [secretTooShort, setSecretTooShort] = useState(false);

  const validate = useCallback(() => {
    const result = validateJsonPayload(rawPayload);
    setIsValid(result.valid);
    setValidationError(result.error ?? null);
    return result;
  }, [rawPayload]);

  const generate = useCallback(async () => {
    setHttpsRequired(false);
    setSecretTooShort(false);

    const result = validateJsonPayload(rawPayload);
    setIsValid(result.valid);
    setValidationError(result.error ?? null);
    if (!result.valid || !result.parsed) return;

    setIsGenerating(true);
    try {
      const key = secret ?? DEMO_SECRET;
      const encoded = await encodeDeepLinkPayload(result.parsed, key);
      setEncodedUrl(buildDeepLinkUrl(widgetId, encoded));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'DEEP_LINK_REQUIRES_HTTPS') setHttpsRequired(true);
      if (msg === 'DEEP_LINK_SECRET_TOO_SHORT') setSecretTooShort(true);
      setEncodedUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, [rawPayload, widgetId, secret]);

  return {
    rawPayload,
    setRawPayload,
    encodedUrl,
    isGenerating,
    isValid,
    validationError,
    httpsRequired,
    secretTooShort,
    cryptoAvailable: isCryptoAvailable(),
    validate,
    generate,
  };
}
