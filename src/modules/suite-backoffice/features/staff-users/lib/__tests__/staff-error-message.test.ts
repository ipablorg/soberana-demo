import { describe, expect, it } from 'vitest';

import { describeStaffError } from '../staff-error-message';

const err = (message: string) =>
  new Error(`${message}: {"response":{"errors":[{"message":"${message}"}]}}`);

describe('describeStaffError', () => {
  it('maps LAST_SUPERUSER explicitly', () => {
    expect(describeStaffError(err('LAST_SUPERUSER'))).toBe(
      'No puedes quitar el último superadministrador activo.'
    );
  });

  it('maps self role change and self deactivation', () => {
    expect(describeStaffError(err('A staff user cannot change their own role'))).toBe(
      'No puedes cambiar tu propio rol.'
    );
    expect(describeStaffError(err('A staff user cannot deactivate themselves'))).toBe(
      'No puedes desactivarte a ti mismo.'
    );
  });

  it('leaves other errors to the generic mapper', () => {
    expect(describeStaffError(err('boom'))).toBeUndefined();
  });
});
