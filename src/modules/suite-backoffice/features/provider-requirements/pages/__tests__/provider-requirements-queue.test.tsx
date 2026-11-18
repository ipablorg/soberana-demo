/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during collection.
import ProviderRequirementsQueue from '../provider-requirements-queue';

const queueMock = vi.fn();
const reviewMutate = vi.fn();
const submitMutate = vi.fn();
const openDocument = vi.fn();
const handledMutate = vi.fn();
const linkMutate = vi.fn();
let linkOnCompleted: ((result: unknown) => void) | undefined;
let submitOnCompleted: ((result: unknown) => void) | undefined;
let submitOnFailed: ((description: string) => void) | undefined;

// #411: OPS_COMMERCIAL reads this screen without any action button.
let canOperate = true;
vi.mock('@/shared/hooks/use-can-operate-money', () => ({
  useCanOperateMoney: () => canOperate,
}));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-provider-requirements', () => ({
  useProviderRequirementsQueue: (variables: unknown) => queueMock(variables),
  useReviewProviderRequirement: () => ({ mutate: reviewMutate, isPending: false }),
  useSubmitProviderRequirements: (
    onCompleted: (result: unknown) => void,
    onFailed: (description: string) => void
  ) => {
    submitOnCompleted = onCompleted;
    submitOnFailed = onFailed;
    return { mutate: submitMutate, isPending: false };
  },
  useProviderRequirementDocument: () => openDocument,
  useMarkProviderRequirementHandled: () => ({ mutate: handledMutate, isPending: false }),
  useCreateProviderRequirementLink: (onCompleted: (result: unknown) => void) => {
    linkOnCompleted = onCompleted;
    return { mutate: linkMutate, isPending: false };
  },
}));

vi.mock('../../../platform-config/hooks/use-catalog-options', () => ({
  useProviderOptions: () => [{ value: 'kirafin', label: 'KiraFin (kirafin)' }],
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

function requirement(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r-1',
    endorsementId: 'e-1',
    customerId: 'c-1',
    provider: 'kirafin',
    railCode: 'us_ach',
    source: 'MISSING_FIELD',
    blockerCode: 'KIRAFIN_RFI_REGISTRATION_NUMBER',
    key: 'registration_number',
    group: 'company',
    kind: 'DOCUMENT',
    status: 'UPLOADED',
    documents: [
      {
        id: 'd-1',
        fileName: 'registro.pdf',
        mimeType: 'application/pdf',
        uploadedAt: '2026-10-20T10:00:00.000Z',
      },
    ],
    value: null,
    rejectReason: null,
    requestedAt: '2026-10-19T10:00:00.000Z',
    updatedAt: '2026-10-20T10:00:00.000Z',
    dueAt: null,
    customerName: 'Acme SAS',
    customerEmail: 'ops@acme.test',
    clientId: 'cl-1',
    clientName: 'Acme Tenant',
    reviewedBy: null,
    reviewedAt: null,
    submittedAt: null,
    ...overrides,
  };
}

function page_(items: unknown[], approved: unknown[] = []) {
  queueMock.mockImplementation((variables: { filter?: { status?: string[] } }) => ({
    data: {
      adminLoopay_listProviderRequirements: {
        items:
          variables.filter?.status?.[0] === 'APPROVED' && variables.filter.status.length === 1
            ? approved
            : items,
        total: items.length,
      },
    },
    isLoading: false,
    isError: false,
  }));
}

let page: MountedPage;

function render(path = '/backoffice/provider-requirements') {
  page = mountPage(
    <MemoryRouter initialEntries={[path]}>
      <ProviderRequirementsQueue />
    </MemoryRouter>
  );
  return page;
}

function bodyText(): string {
  return (document.body.textContent ?? '').replace(/\s+/g, ' ');
}

function bodyButton(label: string): HTMLButtonElement {
  const match = Array.from(document.body.querySelectorAll('button')).find(
    (node) => (node.textContent ?? '').trim() === label
  );
  if (!match) throw new Error(`No button "${label}". Rendered: ${bodyText()}`);
  return match;
}

beforeEach(() => {
  queueMock.mockReset();
  reviewMutate.mockReset();
  submitMutate.mockReset();
  openDocument.mockReset();
  handledMutate.mockReset();
  linkMutate.mockReset();
  page_([requirement()]);
});

afterEach(() => {
  page?.unmount();
});

describe('ProviderRequirementsQueue (S21)', () => {
  it('lists customer, client, provider, rail, the Spanish requirement, kind, status and documents', () => {
    render();

    const text = page.text();
    expect(text).toContain('Requerimientos de proveedores');
    expect(text).toContain('Acme SAS');
    expect(text).toContain('Acme Tenant');
    expect(text).toContain('KiraFin');
    expect(text).toContain('Número de registro de la empresa');
    expect(text).toContain('Documento');
    expect(text).toContain('Por revisar');
    expect(text).toContain('registro.pdf');
  });

  it('asks for what waits for review by default', () => {
    render();

    expect(queueMock).toHaveBeenCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ status: ['UPLOADED'] }) })
    );
  });

  it('filters by the customer of the link it was opened from', () => {
    render('/backoffice/provider-requirements?customerId=c-9');

    expect(queueMock).toHaveBeenCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ customerId: 'c-9' }) })
    );
  });

  it('searches by the typed text', () => {
    render();

    changeValue(
      page.container.querySelector<HTMLInputElement>('#provider-requirements-search')!,
      'acme'
    );

    expect(queueMock).toHaveBeenCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ search: 'acme' }) })
    );
  });

  it('opens a document through its signed URL', () => {
    render();

    page.click(page.findByText('button', 'registro.pdf'));

    expect(openDocument).toHaveBeenCalledWith('d-1');
  });

  it('approves an uploaded requirement', () => {
    render();

    page.click(page.findByText('button', 'Aprobar'));

    expect(reviewMutate).toHaveBeenCalledWith({
      input: { requirementId: 'r-1', decision: 'APPROVE' },
    });
  });

  it('rejects only with a reason', () => {
    render();

    page.click(page.findByText('button', 'Rechazar'));
    const confirm = bodyButton('Rechazar requerimiento');
    expect(confirm.disabled).toBe(true);

    changeValue(
      document.body.querySelector<HTMLTextAreaElement>('#reject-requirement-reason')!,
      'Documento ilegible'
    );
    page.click(bodyButton('Rechazar requerimiento'));

    expect(reviewMutate).toHaveBeenCalledWith({
      input: { requirementId: 'r-1', decision: 'REJECT', reason: 'Documento ilegible' },
    });
  });

  it('sends approved items per endorsement and shows the provider error', () => {
    page_([requirement()], [requirement({ id: 'r-2', status: 'APPROVED' })]);
    render();

    page.click(page.findByText('button', 'Enviar al proveedor'));
    expect(submitMutate).toHaveBeenCalledWith({ endorsementId: 'e-1' });

    // A provider refusal: `useOpsMutation` reports the failure, then completes.
    page.flush(() => submitOnFailed?.('KiraFin rejected the document'));
    page.flush(() =>
      submitOnCompleted?.({
        adminLoopay_submitProviderRequirements: {
          submitted: 1,
          status: 'FAILED',
          errorMessage: 'KiraFin rejected the document',
        },
      })
    );

    expect(page.text()).toContain('KiraFin rejected the document');
  });

  it('names a requirement the provider takes no write for in Spanish, never its English text', () => {
    page_([], [requirement({ id: 'r-2', status: 'APPROVED' })]);
    render();

    page.click(page.findByText('button', 'Enviar al proveedor'));
    page.flush(() =>
      submitOnCompleted?.({
        adminLoopay_submitProviderRequirements: {
          submitted: 0,
          status: 'PROVIDER_ONBOARDING',
          errorMessage:
            "REQUIREMENT_NOT_SUBMITTABLE: mesta takes only documents through the requirement flow ('x' is VALUE); complete it with the provider",
        },
      })
    );

    expect(page.text()).toContain(
      'Este proveedor no recibe ese requerimiento por la plataforma: complétalo directamente con el proveedor.'
    );
    expect(page.text()).not.toContain('mesta takes');
  });

  it('shows the result of a successful send', () => {
    page_([], [requirement({ id: 'r-2', status: 'APPROVED' })]);
    render();

    page.click(page.findByText('button', 'Enviar al proveedor'));
    page.flush(() =>
      submitOnCompleted?.({
        adminLoopay_submitProviderRequirements: {
          submitted: 2,
          status: 'SUBMITTED',
          errorMessage: null,
        },
      })
    );

    expect(page.text()).toContain('2 enviados');
  });

  it('N4: lets Operaciones (#411) reject an APPROVED answer so the customer answers again', () => {
    page_([requirement({ status: 'APPROVED', kind: 'VALUE', value: 'maybe' })]);
    render();

    expect(bodyText()).not.toContain('Aprobar');
    page.click(page.findByText('button', 'Rechazar'));
    changeValue(
      document.body.querySelector<HTMLTextAreaElement>('#reject-requirement-reason')!,
      'Responde Sí o No'
    );
    page.click(bodyButton('Rechazar requerimiento'));

    expect(reviewMutate).toHaveBeenCalledWith({
      input: { requirementId: 'r-1', decision: 'REJECT', reason: 'Responde Sí o No' },
    });
  });

  it('T-S21C: marks a provider-console item as completed at the provider, only with a note', () => {
    page_([
      requirement({
        status: 'APPROVED',
        kind: 'UBO_LINK',
        key: 'associated_persons:beneficial_owner',
        handling: 'PROVIDER_CONSOLE',
      }),
    ]);
    render();

    expect(bodyText()).toContain('Completar en el proveedor');
    expect(bodyText()).not.toContain('Generar link');
    page.click(page.findByText('button', 'Marcar resuelto en el proveedor'));
    const confirm = bodyButton('Marcar resuelto');
    expect(confirm.disabled).toBe(true);

    changeValue(
      document.body.querySelector<HTMLTextAreaElement>('#mark-handled-note')!,
      'UBO cargado en la consola de KiraFin'
    );
    page.click(bodyButton('Marcar resuelto'));

    expect(handledMutate).toHaveBeenCalledWith({
      input: { requirementId: 'r-1', note: 'UBO cargado en la consola de KiraFin' },
    });
  });

  it('T-S21C: generates the KiraFin link of an RFI beneficial-owner item and shows it', () => {
    page_([
      requirement({
        status: 'REQUESTED',
        source: 'RFI_ITEM',
        kind: 'UBO_LINK',
        key: 'rfi_item_9',
        handling: 'PROVIDER_CONSOLE',
        documents: [],
      }),
    ]);
    render();

    page.click(page.findByText('button', 'Generar link'));
    expect(linkMutate).toHaveBeenCalledWith({ requirementId: 'r-1' });

    page.flush(() =>
      linkOnCompleted?.({ adminLoopay_createProviderRequirementLink: 'https://kira.example/ubo/1' })
    );
    expect(bodyText()).toContain('https://kira.example/ubo/1');
  });

  it('T-S21C: never sends a provider-console item with "Enviar al proveedor"', () => {
    page_(
      [],
      [
        requirement({ id: 'r-2', status: 'APPROVED' }),
        requirement({
          id: 'r-3',
          status: 'APPROVED',
          kind: 'UBO_LINK',
          handling: 'PROVIDER_CONSOLE',
        }),
      ]
    );
    render();

    expect(bodyText()).toContain('1 requerimiento aprobado');
  });
});

describe('ProviderRequirementsQueue read-only for OPS_COMMERCIAL (#411)', () => {
  afterEach(() => {
    canOperate = true;
  });

  it('lists the requirement and its documents but renders no approve, reject, send or resolve button', () => {
    canOperate = false;
    page_([requirement()], [requirement({ id: 'req-ok', status: 'APPROVED' })]);
    render();

    const labels = Array.from(document.body.querySelectorAll('button')).map((button) =>
      button.textContent?.trim()
    );

    expect(page.text()).toContain('Acme SAS');
    expect(labels).toContain('registro.pdf');
    for (const action of [
      'Aprobar',
      'Rechazar',
      'Enviar al proveedor',
      'Generar link',
      'Marcar resuelto en el proveedor',
    ]) {
      expect(labels).not.toContain(action);
    }
  });
});
