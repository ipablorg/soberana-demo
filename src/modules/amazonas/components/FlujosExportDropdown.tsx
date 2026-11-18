/**
 * FlujosExportDropdown — Descargar reportes financieros (CSV).
 * Replica el patrón de TxExportDropdown.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronDown, FileText } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import {
  incomeStatementData,
  balanceSheetData,
  cashFlowData,
  buildFlujosExportCsv,
} from '@/modules/amazonas/data/flujos.data';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function FlujosExportDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportCsv = (type: 'income' | 'balance' | 'cashflow') => {
    const map = {
      income: { data: incomeStatementData, title: 'Income Statement', file: 'income-statement' },
      balance: { data: balanceSheetData, title: 'Balance Sheet', file: 'balance-sheet' },
      cashflow: { data: cashFlowData, title: 'Cash Flow', file: 'cash-flow' },
    };
    const { data, title, file } = map[type];
    const csv = buildFlujosExportCsv(data, title);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `loopay-${file}-${new Date().toISOString().slice(0, 10)}.csv`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors duration-150"
      >
        <Download className="h-4 w-4" />
        Descargar informes
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-border bg-card py-1 shadow-lg z-50"
        >
          <button
            type="button"
            onClick={() => exportCsv('income')}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50"
          >
            <FileText className="h-4 w-4" />
            Income Statement
          </button>
          <button
            type="button"
            onClick={() => exportCsv('balance')}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50"
          >
            <FileText className="h-4 w-4" />
            Balance Sheet
          </button>
          <button
            type="button"
            onClick={() => exportCsv('cashflow')}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50"
          >
            <FileText className="h-4 w-4" />
            Cash Flow
          </button>
        </motion.div>
      )}
    </div>
  );
}
