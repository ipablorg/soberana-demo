import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldErrors } from 'react-hook-form';
import { localizeValidationMessage, withLocalizedMessages } from '../localize-validation-messages';

i18n.load('es', {});
i18n.activate('es');

describe('localizeValidationMessage', () => {
  it('translates the schema messages users used to see in English', () => {
    expect(localizeValidationMessage('Occupation is required')).toBe('Selecciona tu ocupación');
    expect(localizeValidationMessage('Compliance screening explanation is required')).toMatch(
      /screening/
    );
  });

  it('translates the US-issued document rule', () => {
    expect(localizeValidationMessage('US-issued documents only accept SSN or ITIN')).toBe(
      'Los documentos emitidos en EE. UU. solo pueden ser SSN o ITIN'
    );
  });

  it('translates zod defaults and keeps unknown messages untouched', () => {
    expect(localizeValidationMessage('String must contain at least 1 character(s)')).toBe(
      'Este campo es obligatorio'
    );
    expect(localizeValidationMessage('Required')).toBe('Este campo es obligatorio');
    expect(localizeValidationMessage('Algo ya traducido')).toBe('Algo ya traducido');
  });
});

describe('withLocalizedMessages', () => {
  it('localizes nested resolver errors', async () => {
    const schema = z.object({
      tax_id: z.string().min(1),
      owners: z.array(z.object({ first_name: z.string().min(1, 'First name is required') })),
    });
    const resolver = withLocalizedMessages(zodResolver(schema));

    const result = await resolver(
      { tax_id: '', owners: [{ first_name: '' }] } as never,
      undefined,
      {
        fields: {},
        shouldUseNativeValidation: false,
      } as never
    );

    const errors = result.errors as FieldErrors<z.infer<typeof schema>>;

    expect(errors.tax_id?.message).toBe('Este campo es obligatorio');
    expect(
      (errors.owners as unknown as Array<{ first_name: { message: string } }>)[0].first_name.message
    ).toBe('Ingresa el nombre');
  });
});
