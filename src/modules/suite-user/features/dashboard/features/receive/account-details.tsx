/**
 * AccountDetails
 *
 * Deposit panel for an `active` account. Reads the same `VirtualAccount`
 * shape returned by `wallets_depositInstructions` that `/suite/receive`
 * uses — one source of truth means the two UIs render identical values
 * for the same rail.
 *
 * Field rendering is data-driven: we build an array of `{label, value}`
 * entries from the fields the backend populates for each rail (bank name,
 * account number, routing, IBAN, SWIFT, CLABE, PIX key, etc.). Only
 * non-empty fields are rendered, so a MXN account won't show an empty
 * IBAN row, and a SEPA account won't show a routing number.
 *
 * Copy contract:
 *  - Per-row copy (`Copy` → `Check` for 2s).
 *  - "Copiar todo" concatenates label: value lines, with a header that
 *    includes the currency so pasted content has context in email/chat.
 *  - Success is a polite aria-live text + green Check — no toast (too
 *    loud for inline feedback).
 *
 * Terminology: rows are labelled from the *sender's* perspective ("Banco",
 * "Número de cuenta", "Titular") — never "your virtual account". The
 * intent is to tell the person paying you what to type into their bank
 * app.
 */

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowUpRight, Check, Copy, Info } from '@/shared/components/animated-icons';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { cn } from '@/shared/lib/utils';
import { railCodeLabel } from '@/shared/lib/rail-provider-labels';
import {
  BankTransferGuide,
  getRailLabel,
  hasBankTransferGuide,
} from '@/shared/components/bank-transfer-guide';
import type { UserAccount } from './hooks/use-user-accounts';

export interface AccountDetailsProps {
  account: UserAccount;
  className?: string;
}

interface DetailRow {
  key: string;
  /**
   * Plain string label (not JSX) because the same label is also used for
   * the "Copiar todo" text blob — serializing JSX to clipboard is a
   * maintenance trap we avoid by translating to strings up front.
   */
  label: string;
  value: string;
  /** Optional display override (e.g. truncated addresses). */
  display?: string;
  /** Turns on `font-mono tabular-nums`. Use for numeric / code values. */
  mono?: boolean;
  info?: string;
}

interface BuildRowsContext {
  t: (strings: TemplateStringsArray, ...values: unknown[]) => string;
}

const humanizeKey = (key: string): string =>
  key
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (s) => s.toUpperCase());

const getFieldInfo = (
  key: DetailRow['key'],
  t: BuildRowsContext['t'],
): string => {
  const byKey: Record<string, string> = {
    beneficiary_name: t`Nombre legal del titular o beneficiario de la cuenta que recibe la transferencia.`,
    bank_name: t`Nombre del banco o institución donde está abierta esta cuenta de recepción.`,
    account_number: t`Número de cuenta que debes ingresar para enviar la transferencia.`,
    account_type: t`Tipo de cuenta bancaria (por ejemplo: ahorros o corriente) cuando aplique.`,
    clabe: t`Clave bancaria estandarizada en México para recibir transferencias SPEI.`,
    iban: t`Código IBAN internacional de la cuenta para transferencias bancarias.`,
    swift_code: t`Código SWIFT/BIC del banco receptor para transferencias internacionales.`,
    routing_number: t`Código de ruta bancaria en EE.UU. para identificar el banco receptor.`,
    nit: t`Número de identificación tributaria asociado al titular cuando el rail lo requiere.`,
    reference: t`Referencia que el emisor debe incluir para identificar correctamente el depósito.`,
    beneficiary_address: t`Dirección del beneficiario/titular usada en validaciones bancarias.`,
  };
  const translated = byKey[key];
  if (translated && translated.trim().length > 0) return translated;

  const fallbackByKey: Record<string, string> = {
    beneficiary_name: 'Nombre legal del titular o beneficiario de la cuenta que recibe la transferencia.',
    bank_name: 'Nombre del banco o institución donde está abierta esta cuenta de recepción.',
    account_number: 'Número de cuenta que debes ingresar para enviar la transferencia.',
    account_type: 'Tipo de cuenta bancaria (por ejemplo: ahorros o corriente) cuando aplique.',
    clabe: 'Clave bancaria estandarizada en México para recibir transferencias SPEI.',
    iban: 'Código IBAN internacional de la cuenta para transferencias bancarias.',
    swift_code: 'Código SWIFT/BIC del banco receptor para transferencias internacionales.',
    routing_number: 'Código de ruta bancaria en EE.UU. para identificar el banco receptor.',
    nit: 'Número de identificación tributaria asociado al titular cuando el rail lo requiere.',
    reference: 'Referencia que el emisor debe incluir para identificar correctamente el depósito.',
    beneficiary_address: 'Dirección del beneficiario/titular usada en validaciones bancarias.',
  };
  return (
    fallbackByKey[key] ??
    'Dato necesario para completar correctamente la transferencia.'
  );
};

const buildRows = (
  account: UserAccount,
  { t }: BuildRowsContext,
): DetailRow[] => {
  const rows: DetailRow[] = [];
  const d = account.deposit;

  if (!d) return rows;

  if (d.beneficiary_name) {
    rows.push({
      key: 'beneficiary_name',
      label: t`Beneficiario` || 'Beneficiario',
      value: d.beneficiary_name,
      info: getFieldInfo('beneficiary_name', t),
    });
  }
  if (d.bank_name) {
    rows.push({
      key: 'bank_name',
      label: t`Banco` || 'Banco',
      value: d.bank_name,
      info: getFieldInfo('bank_name', t),
    });
  }
  if (d.account_number) {
    rows.push({
      key: 'account_number',
      label: t`Número de cuenta` || 'Número de cuenta',
      value: d.account_number,
      mono: true,
      info: getFieldInfo('account_number', t),
    });
  }
  if (d.account_type) {
    rows.push({
      key: 'account_type',
      label: t`Tipo de cuenta` || 'Tipo de cuenta',
      value: d.account_type,
      info: getFieldInfo('account_type', t),
    });
  }
  if (d.clabe) {
    rows.push({
      key: 'clabe',
      label: 'CLABE',
      value: d.clabe,
      mono: true,
      info: getFieldInfo('clabe', t),
    });
  }
  if (d.iban) {
    rows.push({
      key: 'iban',
      label: 'IBAN',
      value: d.iban,
      mono: true,
      info: getFieldInfo('iban', t),
    });
  }
  if (d.swift_code) {
    rows.push({
      key: 'swift_code',
      label: 'SWIFT/BIC',
      value: d.swift_code,
      mono: true,
      info: getFieldInfo('swift_code', t),
    });
  }
  if (d.routing_number) {
    rows.push({
      key: 'routing_number',
      label: t`Número de ruta (routing)` || 'Número de ruta (routing)',
      value: d.routing_number,
      mono: true,
      info: getFieldInfo('routing_number', t),
    });
  }
  if (d.nit) {
    rows.push({
      key: 'nit',
      label: 'NIT',
      value: d.nit,
      mono: true,
      info: getFieldInfo('nit', t),
    });
  }
  if (d.reference) {
    rows.push({
      key: 'reference',
      label: t`Referencia` || 'Referencia',
      value: d.reference,
      mono: true,
      info: getFieldInfo('reference', t),
    });
  }
  if (d.beneficiary_address) {
    rows.push({
      key: 'beneficiary_address',
      label: t`Dirección` || 'Dirección',
      value: d.beneficiary_address,
      info: getFieldInfo('beneficiary_address', t),
    });
  }

  // ── Rail-specific fields (only rendered when the backend populates them) ──

  if (d.bank_beneficiary_name) {
    rows.push({
      key: 'bank_beneficiary_name',
      label: t`Beneficiario bancario` || 'Beneficiario bancario',
      value: d.bank_beneficiary_name,
      info: t`Nombre del beneficiario intermediario del banco para transferencias internacionales.`,
    });
  }

  if (d.bank_address) {
    rows.push({
      key: 'bank_address',
      label: t`Dirección del banco` || 'Dirección del banco',
      value: d.bank_address,
      info: t`Dirección del banco receptor donde está abierta la cuenta.`,
    });
  }

  if (d.account_holder_name) {
    rows.push({
      key: 'account_holder_name',
      label: t`Titular de la cuenta` || 'Titular de la cuenta',
      value: d.account_holder_name,
      info: t`Nombre del titular registrado en el banco para esta cuenta.`,
    });
  }

  if (d.sort_code) {
    rows.push({
      key: 'sort_code',
      label: 'Sort Code',
      value: d.sort_code,
      mono: true,
      info: t`Sort code del banco para transferencias Faster Payments (Reino Unido).`,
    });
  }

  if (d.br_code) {
    rows.push({
      key: 'br_code',
      label: 'PIX / BR Code',
      value: d.br_code,
      mono: true,
      info: t`Clave PIX o código BR para recibir transferencias en Brasil.`,
    });
  }

  if (d.bank_beneficiary_address) {
    rows.push({
      key: 'bank_beneficiary_address',
      label: t`Dirección beneficiario bancario` || 'Dirección beneficiario bancario',
      value: d.bank_beneficiary_address,
      info: t`Dirección del beneficiario intermediario del banco.`,
    });
  }

  if (d.bic) {
    rows.push({
      key: 'bic',
      label: 'BIC',
      value: d.bic,
      mono: true,
      info: t`Código BIC del banco receptor.`,
    });
  }

  if (d.payment_rails && d.payment_rails.length > 0) {
    rows.push({
      key: 'payment_rails',
      label: t`Rails de pago` || 'Rails de pago',
      // Display names (`ach` → "ACH"), never the raw rail codes.
      value: d.payment_rails.map(railCodeLabel).join(', '),
      info: t`Métodos de pago aceptados para esta cuenta.`,
    });
  }

  return rows;
};

const DetailRowItem: React.FC<{ row: DetailRow }> = ({ row }) => {
  const { t } = useLingui();
  const { copied, copy } = useCopyToClipboard();
  const visibleLabel = row.label?.trim() || humanizeKey(row.key);

  // Whole row is the click target: clicking the value (or anywhere on
  // the row except focusable elements) copies. The trailing icon is
  // a visual affordance, not an extra control.
  return (
    <button
      type="button"
      onClick={() => copy(row.value)}
      aria-label={copied ? t`Copiado` : t`Copiar ${visibleLabel}`}
      className={cn(
        'group flex w-full items-center justify-between gap-3 rounded-md',
        'px-2 py-1.5 text-left',
        'hover:bg-muted/60',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'overflow-scroll'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <p className="text-xs font-medium leading-4 text-foreground/70">
            {visibleLabel}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                aria-label={t`Más información sobre ${visibleLabel}`}
                title={row.info || t`Dato de transferencia`}
                className={cn(
                  'inline-flex h-[18px] w-[18px] items-center justify-center rounded-full',
                  'bg-muted/80 text-foreground/90',
                  'ring-1 ring-border/70',
                )}
              >
                <Info className="h-3.5 w-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
              {row.info || t`Dato necesario para completar correctamente la transferencia.`}
            </TooltipContent>
          </Tooltip>
        </div>
        <p
          className={cn(
            'text-sm leading-5 text-foreground',
            !row.mono && 'break-words',
            row.mono && 'font-mono tabular-nums',
          )}
        >
          {row.display ?? row.value}
        </p>
      </div>
      <span
        aria-hidden
        className={cn(
          'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded',
          'text-muted-foreground opacity-0',
          'group-hover:opacity-100 group-focus-visible:opacity-100',
          'transition-opacity duration-150',
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? t`Copiado` : ''}
      </span>
    </button>
  );
};

/**
 * PixQrPreview — scannable QR for PIX deposits (Brazil).
 *
 * The `br_code` returned by the backend IS the "Pix Copia e Cola" payload,
 * so encoding it with `qrcode.react` produces a QR every Brazilian banking
 * app can scan ("Pagar com QR Code"). Rendered on a pure-white tile with
 * solid-black modules for maximum scan reliability — branded/low-contrast
 * QRs get rejected by camera scanners. The text row below still exposes the
 * code for "Pix Copia e Cola", matching Bridge's recommended dual UX.
 */
const PixQrPreview: React.FC<{ value: string }> = ({ value }) => (
  <div className="flex flex-col items-center gap-2 py-1">
    <div className="rounded-xl bg-white p-3 ring-1 ring-border">
      <QRCodeSVG
        value={value}
        size={184}
        bgColor="#FFFFFF"
        fgColor="#000000"
        level="M"
        marginSize={2}
      />
    </div>
    <p className="max-w-[280px] text-center text-xs text-muted-foreground">
      <Trans>
        Escaneá este QR con la app de tu banco o usá Pix Copia e Cola con el
        código de abajo.
      </Trans>
    </p>
  </div>
);

export const AccountDetails: React.FC<AccountDetailsProps> = ({
  account,
  className,
}) => {
  const { t } = useLingui();
  const rows = React.useMemo(() => buildRows(account, { t }), [account, t]);
  const [guideOpen, setGuideOpen] = React.useState(false);

  const { copied: copiedAll, copy: copyAll } = useCopyToClipboard();

  const copyAllAsBlock = () => {
    const header = t`Datos de tu cuenta en ${account.currency}`;
    const body = rows.map((r) => `${r.label}: ${r.value}`).join('\n');
    copyAll(`${header}\n\n${body}`);
  };

  if (rows.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        <Trans>Pronto tendrás los datos de depósito aquí.</Trans>
      </p>
    );
  }

  const showGuide = hasBankTransferGuide(account.currency);
  const railLabel = getRailLabel(account.currency);

  return (
    // No nested card here — this lives inside ReceiveFlow's own
    // panel, and a second wrapper just creates visual debt. We use
    // tight spacing (`space-y-0.5`) and a hover-revealed copy icon
    // so the list reads as a dense table of values, not as a
    // collection of independent cells.
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Trans>Datos para transferir el {account.currency}</Trans>
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={copyAllAsBlock}
          aria-label={copiedAll ? t`Copiado` : t`Copiar todo`}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          {copiedAll ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              <span className="text-success">
                <Trans>Copiado</Trans>
              </span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <Trans>Copiar todo</Trans>
            </>
          )}
        </Button>
      </div>
      {account.deposit?.linked_manually && (
        <p className="text-xs text-muted-foreground">
          <Trans>Cuenta registrada por el equipo de Loopay</Trans>
        </p>
      )}
      {account.deposit?.br_code && (
        <PixQrPreview value={account.deposit.br_code} />
      )}
      <div className="space-y-0.5">
        {rows.map((row) => (
          <DetailRowItem key={row.key} row={row} />
        ))}
      </div>
      {showGuide && (
        <>
          <Button
            type="button"
            variant="gradient-outline"
            size="sm"
            onClick={() => setGuideOpen(true)}
            className="mt-3 w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <Trans>Cómo transferir desde tu banco</Trans>
            </span>
            {railLabel && (
              <span className="text-xs text-muted-foreground">
                {railLabel}
              </span>
            )}
          </Button>
          <BankTransferGuide
            open={guideOpen}
            onOpenChange={setGuideOpen}
            account={account.deposit}
          />
        </>
      )}
    </div>
  );
};
