/* @vitest-environment jsdom */

import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { BankDetailsForm } from '../bank-details-form';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let page: MountedPage;
let latest: Record<string, unknown> = {};

function Harness({ railCode }: { railCode: string }) {
  const [value, setValue] = useState<Record<string, unknown>>({});
  return (
    <BankDetailsForm
      railCode={railCode}
      value={value}
      onChange={(next) => {
        latest = next;
        setValue(next);
      }}
    />
  );
}

afterEach(() => {
  page?.unmount();
  latest = {};
});

describe('BankDetailsForm', () => {
  it('asks routing number, account number and bank name on the wire rail', () => {
    page = mountPage(<Harness railCode="wire" />);

    const text = page.text();
    expect(text).toContain('Número de ruta (routing)');
    expect(text).toContain('Número de cuenta');
    expect(text).toContain('Banco');
    expect(page.container.querySelector('#bank-field-routing_number')).not.toBeNull();
  });

  it('keeps the structured fields of an existing rail', () => {
    page = mountPage(<Harness railCode="spei" />);

    expect(page.container.querySelector('#bank-field-clabe')).not.toBeNull();
    expect(page.container.querySelector('textarea')).toBeNull();
  });

  it('offers a JSON editor for a rail without structured fields', () => {
    page = mountPage(<Harness railCode="swift" />);

    expect(page.text()).not.toContain('Use el JSON directo');
    const editor = page.container.querySelector<HTMLTextAreaElement>('#bank-details-json');
    expect(editor).not.toBeNull();

    changeValue(editor!, '{"account_number": "9999", "swift_code": "BOFAUS3N"}');
    expect(latest).toEqual({ account_number: '9999', swift_code: 'BOFAUS3N' });
  });

  it('flags JSON that is not an object and keeps the last valid value', () => {
    page = mountPage(<Harness railCode="swift" />);
    const editor = page.container.querySelector<HTMLTextAreaElement>('#bank-details-json')!;

    changeValue(editor, '{"account_number": "1"}');
    changeValue(editor, '{"account_number": ');

    expect(page.container.querySelector('[role="alert"]')?.textContent).toContain('JSON');
    expect(latest).toEqual({ account_number: '1' });
  });
});
