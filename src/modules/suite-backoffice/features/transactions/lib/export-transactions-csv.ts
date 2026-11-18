/**
 * Front-side CSV export for the transaction explorer.
 *
 * `transactionsToCsv` is pure: it builds a CSV string from the supplied rows.
 * `exportTransactionsCsv` wraps it with a Blob download side-effect.
 */

import type { AdminTransactionEntity } from '@/graphql/types/admin-loopay';

const CSV_HEADERS = [
  'referenceCode',
  'type',
  'direction',
  'status',
  'amount',
  'currency',
  'description',
  'customerEmail',
  'customerName',
  'walletChain',
  'walletAddress',
  'failureReason',
  'createdAt',
  'completedAt',
] as const;

function escapeCsvCell(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const needsQuoting = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}

function buildCsvRow(tx: AdminTransactionEntity): string {
  const customerName = tx.wallet?.customer
    ? [tx.wallet.customer.firstName, tx.wallet.customer.lastName]
        .map((part) => (part ?? '').trim())
        .filter((part) => part.length > 0)
        .join(' ')
    : '';

  const cells: (string | null)[] = [
    tx.referenceCode,
    tx.type,
    tx.direction,
    tx.status,
    tx.amount,
    tx.currency,
    tx.description,
    tx.wallet?.customer?.email ?? null,
    customerName || null,
    tx.wallet?.chain ?? null,
    tx.wallet?.address ?? null,
    tx.failureReason,
    tx.createdAt,
    tx.completedAt,
  ];

  return cells.map(escapeCsvCell).join(',');
}

export function transactionsToCsv(rows: AdminTransactionEntity[]): string {
  const header = CSV_HEADERS.join(',');
  const body = rows.map(buildCsvRow).join('\n');
  return rows.length > 0 ? `${header}\n${body}` : header;
}

function triggerDownload(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTransactionsCsv(rows: AdminTransactionEntity[]): void {
  const csv = transactionsToCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(csv, `transactions-${stamp}.csv`);
}
