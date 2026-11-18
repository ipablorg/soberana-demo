import type { ReactNode } from 'react';

function translate(message: TemplateStringsArray | string, ...values: unknown[]) {
  if (message && typeof message === 'object' && !Array.isArray(message)) {
    const record = message as unknown as Record<string, unknown>;
    if ('message' in record) {
      return String(record.message ?? record.id ?? '');
    }
  }

  if (typeof message === 'string') {
    return message;
  }

  if (!Array.isArray(message)) {
    return String(message ?? '');
  }

  return message.reduce(
    (result, chunk, index) => result + chunk + String(values[index] ?? ''),
    '',
  );
}

export function useLingui() {
  return {
    t: translate,
  };
}

export function Trans({ children }: { children: ReactNode }) {
  return children;
}
