/**
 * TxExportDropdown — Descargar informes (CSV; PDF/Excel opcionales).
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronDown, FileText } from '@/shared/components/animated-icons';
import { buildCsvForExport } from '@/modules/amazonas/data/txdata';
import type { TxRow } from '@/modules/amazonas/types/txdata.types';
import { cn } from '@/shared/lib/utils';

export interface TxExportDropdownProps {
  rows: TxRow[];
  disabled?: boolean;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function TxExportDropdown({ rows, disabled }: TxExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCsv = () => {
    const csv = buildCsvForExport(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `loopay-tx-${new Date().toISOString().slice(0, 10)}.csv`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Download className="h-4 w-4" />
        Descargar informes
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card py-1 shadow-lg z-50"
        >
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50"
          >
            <FileText className="h-4 w-4" />
            Descargar datos
          </button>
          <div className="border-t border-border my-1" />
          <p className="px-4 py-2 text-xs text-muted-foreground">
            PDF y Excel próximamente
          </p>
        </motion.div>
      )}
    </div>
  );
}
